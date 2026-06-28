"""
Demo data: 2 müəllim, 4 tələbə, 1 fakültə, 1 aktiv semestr,
4 fənn, enrollment, davamiyyət, ballar, imtahanlar.
"""
import os
import django
import random
from datetime import date, datetime, timedelta

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.utils import timezone
from accounts.models import User
from university.models import Department, Semester, Subject, Enrollment, Attendance, Grade, Exam

print("→ Köhnə məlumatlar silinir...")
Attendance.objects.all().delete()
Grade.objects.all().delete()
Exam.objects.all().delete()
Enrollment.objects.all().delete()
Subject.objects.all().delete()
Semester.objects.all().delete()
Department.objects.all().delete()
User.objects.exclude(is_superuser=True).delete()

print("→ İstifadəçilər yaradılır...")
teachers = []
for i, (fn, ln, uname) in enumerate([
    ('Əli', 'Həsənov', 'ali_teacher'),
    ('Günel', 'Məmmədova', 'gunel_teacher'),
]):
    t = User.objects.create_user(
        username=uname, password='teacher123',
        first_name=fn, last_name=ln,
        email=f'{uname}@uni.az', role='teacher'
    )
    teachers.append(t)
    print(f'   Müəllim: {t.get_full_name()} | {uname} / teacher123')

students = []
student_data = [
    ('Aytən',   'Quliyeva',   'ayten_student'),
    ('Bəhruz',  'Nəcəfov',    'behruz_student'),
    ('Könül',   'Əliyeva',    'konul_student'),
    ('Rauf',    'Şirinov',    'rauf_student'),
]
for fn, ln, uname in student_data:
    s = User.objects.create_user(
        username=uname, password='student123',
        first_name=fn, last_name=ln,
        email=f'{uname}@uni.az', role='student'
    )
    students.append(s)
    print(f'   Tələbə:  {s.get_full_name()} | {uname} / student123')

print("→ Fakültə və semestr...")
dept = Department.objects.create(name='Kompüter Elmləri', code='CS')
sem = Semester.objects.create(
    name='2024-2025 Yaz Semestri',
    year=2025, term='spring', is_active=True
)

print("→ Fənlər yaradılır...")
subjects_data = [
    ('Verilənlər Bazası', 'CS301', 4, teachers[0]),
    ('Alqoritmlər',        'CS302', 3, teachers[0]),
    ('Veb Proqramlaşdırma','CS303', 3, teachers[1]),
    ('Riyazi Analiz',      'MATH201', 4, teachers[1]),
]
subjects = []
for name, code, credits, teacher in subjects_data:
    s = Subject.objects.create(
        name=name, code=code, credits=credits,
        department=dept, teacher=teacher, semester=sem
    )
    subjects.append(s)
    print(f'   Fənn: {code} - {name} → {teacher.get_full_name()}')

print("→ Enrollment...")
enrollments = []
for student in students:
    for subject in subjects:
        enr = Enrollment.objects.create(student=student, subject=subject)
        enrollments.append(enr)

print("→ Davamiyyət (son 8 həftə)...")
status_weights = ['present', 'present', 'present', 'present', 'present', 'late', 'absent', 'excused']
today = date.today()
for enr in enrollments:
    for week in range(8):
        lesson_date = today - timedelta(weeks=week, days=random.randint(0, 2))
        att_status = random.choice(status_weights)
        Attendance.objects.get_or_create(
            enrollment=enr, date=lesson_date,
            defaults={'status': att_status, 'marked_by': enr.subject.teacher}
        )

print("→ Ballar...")
grade_types = [
    ('quiz',     40, 50),
    ('homework', 18, 20),
    ('midterm',  70, 100),
    ('activity', 9,  10),
]
for enr in enrollments:
    for g_type, min_s, max_s in grade_types:
        score = round(random.uniform(min_s, max_s), 1)
        Grade.objects.create(
            enrollment=enr,
            grade_type=g_type,
            score=score,
            max_score=max_s,
            description=f'{g_type} nəticəsi',
            given_by=enr.subject.teacher
        )

print("→ İmtahanlar...")
for i, subject in enumerate(subjects):
    # Keçmiş midterm
    Exam.objects.create(
        subject=subject,
        title=f'{subject.code} Aralıq İmtahan',
        exam_type='midterm',
        date=timezone.make_aware(datetime.now() - timedelta(days=30 + i*3)),
        duration_minutes=90,
        location=f'Otaq {101 + i}',
        max_score=100,
        status='completed',
        created_by=subject.teacher
    )
    # Gələcək final
    Exam.objects.create(
        subject=subject,
        title=f'{subject.code} Final İmtahan',
        exam_type='final',
        date=timezone.make_aware(datetime.now() + timedelta(days=14 + i*3)),
        duration_minutes=120,
        location=f'Otaq {201 + i}',
        max_score=100,
        status='scheduled',
        created_by=subject.teacher
    )

print("\n✅ Demo data uğurla yaradıldı!")
print("─" * 40)
print("Admin panel: python manage.py createsuperuser")
print("Server:      python manage.py runserver")
