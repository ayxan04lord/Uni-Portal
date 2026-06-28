from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.models import User
from .models import Department, Semester, Subject, Enrollment, Attendance, Grade, Exam
from .serializers import (
    DepartmentSerializer, SemesterSerializer, SubjectSerializer,
    EnrollmentSerializer, AttendanceSerializer, AttendanceBulkSerializer,
    GradeSerializer, ExamSerializer,
    StudentSubjectSerializer, StudentEnrollmentDetailSerializer
)
from .permissions import IsTeacher, IsStudent, IsTeacherOrAdmin


# ─── Shared ──────────────────────────────────────────────────────────────────

class DepartmentListView(generics.ListCreateAPIView):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    permission_classes = [permissions.IsAuthenticated]


class SemesterListView(generics.ListCreateAPIView):
    queryset = Semester.objects.all()
    serializer_class = SemesterSerializer
    permission_classes = [permissions.IsAuthenticated]


class ActiveSemesterView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        sem = Semester.objects.filter(is_active=True).first()
        if not sem:
            return Response({'detail': 'Aktiv semestr yoxdur.'}, status=404)
        return Response(SemesterSerializer(sem).data)


# ─── Student Views ────────────────────────────────────────────────────────────

class StudentMySubjectsView(APIView):
    """Tələbənin aktiv semestr fənləri + davamiyyət + bal xülasəsi."""
    permission_classes = [IsStudent]

    def get(self, request):
        semester_id = request.query_params.get('semester')
        enrollments = Enrollment.objects.filter(student=request.user).select_related('subject')
        if semester_id:
            enrollments = enrollments.filter(subject__semester_id=semester_id)
        else:
            enrollments = enrollments.filter(subject__semester__is_active=True)

        subjects = [enr.subject for enr in enrollments]
        serializer = StudentSubjectSerializer(subjects, many=True, context={'request': request})
        return Response(serializer.data)


class StudentProfileView(APIView):
    """Tələbənin tam akademik profili."""
    permission_classes = [IsStudent]

    def get(self, request):
        enrollments = Enrollment.objects.filter(
            student=request.user
        ).select_related('subject__semester').prefetch_related('grades', 'attendances')

        semesters_data = {}
        total_credits = 0
        earned_credits = 0
        all_grades = []

        for enr in enrollments:
            sem_name = enr.subject.semester.name
            if sem_name not in semesters_data:
                semesters_data[sem_name] = {
                    'semester': sem_name,
                    'subjects': [],
                    'gpa': None
                }

            grades = enr.grades.all()
            avg = None
            if grades:
                total_w = sum(float(g.score) / float(g.max_score) * 100 for g in grades)
                avg = round(total_w / grades.count(), 1)
                all_grades.append(avg)

            total_credits += enr.subject.credits
            if avg is not None and avg >= 50:
                earned_credits += enr.subject.credits

            att = enr.attendances.all()
            total_att = att.count()
            present_att = att.filter(status__in=['present', 'late']).count()
            att_rate = round(present_att / total_att * 100, 1) if total_att else 0

            semesters_data[sem_name]['subjects'].append({
                'subject_name': enr.subject.name,
                'subject_code': enr.subject.code,
                'credits': enr.subject.credits,
                'average': avg,
                'attendance_rate': att_rate,
                'letter': _to_letter(avg) if avg is not None else '-'
            })

        # GPA hesablama (100-lük sistemdə)
        overall_avg = round(sum(all_grades) / len(all_grades), 1) if all_grades else None

        return Response({
            'semesters': list(semesters_data.values()),
            'overall_average': overall_avg,
            'total_credits': total_credits,
            'earned_credits': earned_credits,
            'gpa_4': _to_gpa4(overall_avg) if overall_avg else None
        })


def _to_letter(score):
    if score >= 91:   return 'A'
    elif score >= 81: return 'B'
    elif score >= 71: return 'C'
    elif score >= 61: return 'D'
    elif score >= 51: return 'E'
    else:             return 'F'


def _to_gpa4(score):
    if score >= 91:   return 4.0
    elif score >= 81: return 3.0
    elif score >= 71: return 2.0
    elif score >= 61: return 1.0
    else:             return 0.0


class StudentAttendanceDetailView(APIView):
    """Tələbənin bir fənndəki davamiyyət tarixi."""
    permission_classes = [IsStudent]

    def get(self, request, subject_id):
        enr = get_object_or_404(
            Enrollment, student=request.user, subject_id=subject_id
        )
        attendances = enr.attendances.all()
        return Response(AttendanceSerializer(attendances, many=True).data)


class StudentExamsView(APIView):
    """Tələbənin gözləyən imtahanları."""
    permission_classes = [IsStudent]

    def get(self, request):
        from django.utils import timezone
        enrolled_subjects = Enrollment.objects.filter(
            student=request.user
        ).values_list('subject_id', flat=True)

        semester_id = request.query_params.get('semester')
        exams = Exam.objects.filter(subject_id__in=enrolled_subjects)
        if semester_id:
            exams = exams.filter(subject__semester_id=semester_id)
        else:
            exams = exams.filter(subject__semester__is_active=True)

        return Response(ExamSerializer(exams.order_by('date'), many=True).data)


# ─── Teacher Views ────────────────────────────────────────────────────────────

class TeacherMySubjectsView(APIView):
    """Müəllimin fənləri."""
    permission_classes = [IsTeacher]

    def get(self, request):
        semester_id = request.query_params.get('semester')
        qs = Subject.objects.filter(teacher=request.user)
        if semester_id:
            qs = qs.filter(semester_id=semester_id)
        return Response(SubjectSerializer(qs, many=True).data)


class TeacherSubjectStudentsView(APIView):
    """Bir fənddəki bütün tələbələr (müəllim üçün)."""
    permission_classes = [IsTeacher]

    def get(self, request, subject_id):
        subject = get_object_or_404(Subject, id=subject_id, teacher=request.user)
        enrollments = subject.enrollments.select_related('student').prefetch_related(
            'grades', 'attendances'
        )
        serializer = StudentEnrollmentDetailSerializer(enrollments, many=True)
        return Response({'subject': SubjectSerializer(subject).data, 'enrollments': serializer.data})


class AttendanceBulkCreateView(APIView):
    """Müəllim bir tarixdə davamiyyət siyahısını yazır."""
    permission_classes = [IsTeacher]

    def post(self, request, subject_id):
        subject = get_object_or_404(Subject, id=subject_id, teacher=request.user)
        serializer = AttendanceBulkSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        date = serializer.validated_data['date']
        records = serializer.validated_data['records']

        created = []
        updated = []

        for record in records:
            enrollment_id = record.get('enrollment_id')
            att_status = record.get('status', 'present')
            note = record.get('note', '')

            enr = get_object_or_404(Enrollment, id=enrollment_id, subject=subject)
            obj, is_new = Attendance.objects.update_or_create(
                enrollment=enr,
                date=date,
                defaults={
                    'status': att_status,
                    'note': note,
                    'marked_by': request.user
                }
            )
            (created if is_new else updated).append(obj.id)

        return Response({
            'detail': f'{len(created)} yeni, {len(updated)} yeniləndi.',
            'date': str(date)
        }, status=status.HTTP_200_OK)


class GradeCreateView(generics.CreateAPIView):
    """Müəllim bal yazır."""
    serializer_class = GradeSerializer
    permission_classes = [IsTeacher]

    def perform_create(self, serializer):
        enrollment = serializer.validated_data['enrollment']
        # Yalnız öz fənninin tələbəsinə bal verə bilər
        if enrollment.subject.teacher != self.request.user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied('Bu fənnin müəllimi deyilsiniz.')
        serializer.save(given_by=self.request.user)


class GradeUpdateDeleteView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = GradeSerializer
    permission_classes = [IsTeacher]

    def get_queryset(self):
        return Grade.objects.filter(given_by=self.request.user)


class ExamListCreateView(generics.ListCreateAPIView):
    """Müəllim imtahan əlavə edir / siyahısına baxır."""
    serializer_class = ExamSerializer
    permission_classes = [IsTeacher]

    def get_queryset(self):
        return Exam.objects.filter(subject__teacher=self.request.user)

    def perform_create(self, serializer):
        subject = serializer.validated_data['subject']
        if subject.teacher != self.request.user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied('Bu fənnin müəllimi deyilsiniz.')
        serializer.save(created_by=self.request.user)


class ExamUpdateDeleteView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ExamSerializer
    permission_classes = [IsTeacher]

    def get_queryset(self):
        return Exam.objects.filter(subject__teacher=self.request.user)


class SubjectExamsView(generics.ListAPIView):
    """Bir fənddəki imtahanlar (həm müəllim həm tələbə)."""
    serializer_class = ExamSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Exam.objects.filter(subject_id=self.kwargs['subject_id']).order_by('date')
