from django.db import models
from accounts.models import User


class Department(models.Model):
    name = models.CharField(max_length=200)
    code = models.CharField(max_length=20, unique=True)

    def __str__(self):
        return self.name


class Semester(models.Model):
    name = models.CharField(max_length=100)       # məs: "2024-2025 Payız"
    year = models.IntegerField()
    term = models.CharField(max_length=10, choices=[('fall', 'Payız'), ('spring', 'Yaz')])
    is_active = models.BooleanField(default=False)

    class Meta:
        ordering = ['-year', 'term']

    def __str__(self):
        return self.name


class Subject(models.Model):
    name = models.CharField(max_length=200)
    code = models.CharField(max_length=20, unique=True)
    credits = models.IntegerField(default=3)
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='subjects')
    teacher = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='subjects', limit_choices_to={'role': 'teacher'}
    )
    semester = models.ForeignKey(Semester, on_delete=models.CASCADE, related_name='subjects')

    def __str__(self):
        return f'{self.code} - {self.name}'


class Enrollment(models.Model):
    student = models.ForeignKey(
        User, on_delete=models.CASCADE,
        related_name='enrollments', limit_choices_to={'role': 'student'}
    )
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='enrollments')
    enrolled_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('student', 'subject')

    def __str__(self):
        return f'{self.student} → {self.subject}'


class Attendance(models.Model):
    STATUS_CHOICES = [
        ('present', 'İştirak etdi'),
        ('absent',  'Qayıb'),
        ('late',    'Gecikdi'),
        ('excused', 'Üzürlü'),
    ]

    enrollment = models.ForeignKey(Enrollment, on_delete=models.CASCADE, related_name='attendances')
    date = models.DateField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='present')
    note = models.CharField(max_length=200, blank=True)
    marked_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True,
        related_name='marked_attendances'
    )

    class Meta:
        unique_together = ('enrollment', 'date')
        ordering = ['-date']

    def __str__(self):
        return f'{self.enrollment.student} | {self.date} | {self.status}'


class Grade(models.Model):
    GRADE_TYPE_CHOICES = [
        ('midterm',   'Aralıq imtahan'),
        ('final',     'Final imtahan'),
        ('quiz',      'Test'),
        ('homework',  'Ev tapşırığı'),
        ('activity',  'Fəallıq'),
    ]

    enrollment = models.ForeignKey(Enrollment, on_delete=models.CASCADE, related_name='grades')
    grade_type = models.CharField(max_length=20, choices=GRADE_TYPE_CHOICES)
    score = models.DecimalField(max_digits=5, decimal_places=2)
    max_score = models.DecimalField(max_digits=5, decimal_places=2, default=100)
    description = models.CharField(max_length=200, blank=True)
    date = models.DateField(auto_now_add=True)
    given_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True,
        related_name='given_grades'
    )

    class Meta:
        ordering = ['-date']

    def __str__(self):
        return f'{self.enrollment.student} | {self.grade_type} | {self.score}'


class Exam(models.Model):
    STATUS_CHOICES = [
        ('scheduled', 'Planlaşdırılıb'),
        ('ongoing',   'Davam edir'),
        ('completed', 'Tamamlandı'),
        ('cancelled', 'Ləğv edildi'),
    ]

    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='exams')
    title = models.CharField(max_length=200)
    exam_type = models.CharField(
        max_length=20,
        choices=[('midterm', 'Aralıq'), ('final', 'Final'), ('quiz', 'Test'), ('makeup', 'Əlavə')],
        default='quiz'
    )
    date = models.DateTimeField()
    duration_minutes = models.IntegerField(default=90)
    location = models.CharField(max_length=200, blank=True)
    max_score = models.DecimalField(max_digits=5, decimal_places=2, default=100)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='scheduled')
    description = models.TextField(blank=True)
    created_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True,
        related_name='created_exams'
    )

    class Meta:
        ordering = ['date']

    def __str__(self):
        return f'{self.subject.code} | {self.title} | {self.date.date()}'
