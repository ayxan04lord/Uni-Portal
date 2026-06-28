from django.contrib import admin
from .models import Department, Semester, Subject, Enrollment, Attendance, Grade, Exam


@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ['name', 'code']


@admin.register(Semester)
class SemesterAdmin(admin.ModelAdmin):
    list_display = ['name', 'year', 'term', 'is_active']
    list_editable = ['is_active']


@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    list_display = ['code', 'name', 'teacher', 'semester', 'credits']
    list_filter = ['semester', 'department']
    search_fields = ['name', 'code']


@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display = ['student', 'subject', 'enrolled_at']
    list_filter = ['subject__semester']
    search_fields = ['student__username', 'subject__name']


@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    list_display = ['enrollment', 'date', 'status', 'marked_by']
    list_filter = ['status', 'date']


@admin.register(Grade)
class GradeAdmin(admin.ModelAdmin):
    list_display = ['enrollment', 'grade_type', 'score', 'max_score', 'date', 'given_by']
    list_filter = ['grade_type']


@admin.register(Exam)
class ExamAdmin(admin.ModelAdmin):
    list_display = ['title', 'subject', 'exam_type', 'date', 'status']
    list_filter = ['exam_type', 'status']
