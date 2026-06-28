from rest_framework import serializers
from accounts.models import User
from .models import Department, Semester, Subject, Enrollment, Attendance, Grade, Exam


class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = '__all__'


class SemesterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Semester
        fields = '__all__'


class TeacherBriefSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'full_name', 'email']

    def get_full_name(self, obj):
        return obj.get_full_name() or obj.username


class SubjectSerializer(serializers.ModelSerializer):
    teacher_info = TeacherBriefSerializer(source='teacher', read_only=True)
    department_name = serializers.CharField(source='department.name', read_only=True)
    semester_name = serializers.CharField(source='semester.name', read_only=True)
    enrolled_count = serializers.SerializerMethodField()

    class Meta:
        model = Subject
        fields = ['id', 'name', 'code', 'credits', 'department', 'department_name',
                  'teacher', 'teacher_info', 'semester', 'semester_name', 'enrolled_count']

    def get_enrolled_count(self, obj):
        return obj.enrollments.count()


class StudentBriefSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'full_name', 'email']

    def get_full_name(self, obj):
        return obj.get_full_name() or obj.username


class AttendanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attendance
        fields = ['id', 'enrollment', 'date', 'status', 'note', 'marked_by']
        read_only_fields = ['marked_by']


class AttendanceBulkSerializer(serializers.Serializer):
    """Müəllim bir tarixdə bütün tələbələrin davamiyyətini birdəfəyə yazır."""
    date = serializers.DateField()
    records = serializers.ListField(
        child=serializers.DictField()
    )


class GradeSerializer(serializers.ModelSerializer):
    grade_type_display = serializers.CharField(source='get_grade_type_display', read_only=True)

    class Meta:
        model = Grade
        fields = ['id', 'enrollment', 'grade_type', 'grade_type_display',
                  'score', 'max_score', 'description', 'date', 'given_by']
        read_only_fields = ['given_by', 'date']


class ExamSerializer(serializers.ModelSerializer):
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    subject_code = serializers.CharField(source='subject.code', read_only=True)
    exam_type_display = serializers.CharField(source='get_exam_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = Exam
        fields = ['id', 'subject', 'subject_name', 'subject_code', 'title',
                  'exam_type', 'exam_type_display', 'date', 'duration_minutes',
                  'location', 'max_score', 'status', 'status_display',
                  'description', 'created_by']
        read_only_fields = ['created_by']


class EnrollmentSerializer(serializers.ModelSerializer):
    student_info = StudentBriefSerializer(source='student', read_only=True)
    subject_info = SubjectSerializer(source='subject', read_only=True)

    class Meta:
        model = Enrollment
        fields = ['id', 'student', 'student_info', 'subject', 'subject_info', 'enrolled_at']


# ─── Student Dashboard ────────────────────────────────────────────────────────

class StudentSubjectSerializer(serializers.ModelSerializer):
    """Tələbə üçün fənn + davamiyyət + bal xülasəsi."""
    teacher_info = TeacherBriefSerializer(source='teacher', read_only=True)
    semester_name = serializers.CharField(source='semester.name', read_only=True)
    enrollment_id = serializers.SerializerMethodField()
    attendance_summary = serializers.SerializerMethodField()
    grade_summary = serializers.SerializerMethodField()
    upcoming_exams = serializers.SerializerMethodField()

    class Meta:
        model = Subject
        fields = ['id', 'name', 'code', 'credits', 'teacher_info',
                  'semester_name', 'enrollment_id',
                  'attendance_summary', 'grade_summary', 'upcoming_exams']

    def get_enrollment_id(self, obj):
        student = self.context['request'].user
        enr = obj.enrollments.filter(student=student).first()
        return enr.id if enr else None

    def get_attendance_summary(self, obj):
        student = self.context['request'].user
        enr = obj.enrollments.filter(student=student).first()
        if not enr:
            return {}
        qs = enr.attendances.all()
        total = qs.count()
        present = qs.filter(status='present').count()
        absent = qs.filter(status='absent').count()
        late = qs.filter(status='late').count()
        excused = qs.filter(status='excused').count()
        rate = round((present + late) / total * 100, 1) if total else 0
        return {
            'total': total, 'present': present,
            'absent': absent, 'late': late,
            'excused': excused, 'rate': rate
        }

    def get_grade_summary(self, obj):
        student = self.context['request'].user
        enr = obj.enrollments.filter(student=student).first()
        if not enr:
            return {}
        grades = enr.grades.all()
        if not grades:
            return {'average': None, 'grades': []}
        total_weighted = sum(
            float(g.score) / float(g.max_score) * 100 for g in grades
        )
        avg = round(total_weighted / grades.count(), 1)
        return {
            'average': avg,
            'grades': GradeSerializer(grades, many=True).data
        }

    def get_upcoming_exams(self, obj):
        from django.utils import timezone
        exams = obj.exams.filter(
            date__gte=timezone.now(),
            status='scheduled'
        ).order_by('date')[:3]
        return ExamSerializer(exams, many=True).data


# ─── Teacher Subject Detail ───────────────────────────────────────────────────

class StudentEnrollmentDetailSerializer(serializers.ModelSerializer):
    """Müəllim üçün bir fənndə hər tələbənin tam məlumatı."""
    student_info = StudentBriefSerializer(source='student', read_only=True)
    attendance_summary = serializers.SerializerMethodField()
    grades = GradeSerializer(many=True, read_only=True)
    average = serializers.SerializerMethodField()

    class Meta:
        model = Enrollment
        fields = ['id', 'student', 'student_info',
                  'attendance_summary', 'grades', 'average']

    def get_attendance_summary(self, obj):
        qs = obj.attendances.all()
        total = qs.count()
        present = qs.filter(status='present').count()
        absent = qs.filter(status='absent').count()
        late = qs.filter(status='late').count()
        excused = qs.filter(status='excused').count()
        rate = round((present + late) / total * 100, 1) if total else 0
        return {
            'total': total, 'present': present,
            'absent': absent, 'late': late,
            'excused': excused, 'rate': rate
        }

    def get_average(self, obj):
        grades = obj.grades.all()
        if not grades:
            return None
        total = sum(float(g.score) / float(g.max_score) * 100 for g in grades)
        return round(total / grades.count(), 1)
