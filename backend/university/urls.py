from django.urls import path
from .views import (
    DepartmentListView, SemesterListView, ActiveSemesterView,
    # Student
    StudentMySubjectsView, StudentProfileView,
    StudentAttendanceDetailView, StudentExamsView,
    # Teacher
    TeacherMySubjectsView, TeacherSubjectStudentsView,
    AttendanceBulkCreateView,
    GradeCreateView, GradeUpdateDeleteView,
    ExamListCreateView, ExamUpdateDeleteView,
    SubjectExamsView,
)

urlpatterns = [
    # Shared
    path('departments/',         DepartmentListView.as_view()),
    path('semesters/',           SemesterListView.as_view()),
    path('semesters/active/',    ActiveSemesterView.as_view()),
    path('subjects/<int:subject_id>/exams/', SubjectExamsView.as_view()),

    # Student
    path('student/subjects/',            StudentMySubjectsView.as_view()),
    path('student/profile/',             StudentProfileView.as_view()),
    path('student/subjects/<int:subject_id>/attendance/', StudentAttendanceDetailView.as_view()),
    path('student/exams/',               StudentExamsView.as_view()),

    # Teacher
    path('teacher/subjects/',                          TeacherMySubjectsView.as_view()),
    path('teacher/subjects/<int:subject_id>/students/', TeacherSubjectStudentsView.as_view()),
    path('teacher/subjects/<int:subject_id>/attendance/', AttendanceBulkCreateView.as_view()),
    path('teacher/grades/',                            GradeCreateView.as_view()),
    path('teacher/grades/<int:pk>/',                   GradeUpdateDeleteView.as_view()),
    path('teacher/exams/',                             ExamListCreateView.as_view()),
    path('teacher/exams/<int:pk>/',                    ExamUpdateDeleteView.as_view()),
]
