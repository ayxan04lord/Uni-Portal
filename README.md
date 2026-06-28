# 🎓 UniPortal — Universitet İdarəetmə Sistemi

Tələbə və müəllimlər üçün modern veb əsaslı universitet portalı.  
**Frontend:** React 18 + Vite · **Backend:** Django 5 + DRF + JWT

---

## 📸 Xüsusiyyətlər

### Tələbə
- Aktiv semestr fənlərini görür
- Hər fənn üzrə davamiyyət tarixinə baxa bilər (iştirak, qayıb, gecikdi, üzürlü)
- Akademik profil: orta bal, GPA (4.0), qazanılan kreditlər, hərfi qiymətlər
- Planlaşdırılmış imtahanları görür, neçə gün qaldığını izləyir

### Müəllim
- Öz fənlərini idarə edir
- Tələbə siyahısı: davamiyyət faizi, qayıb sayı, orta bal
- Davamiyyət yazır (bütün tələbələr üçün bir tarixdə toplu)
- Bal yazır (test, ev tapşırığı, aralıq, final, fəallıq)
- İmtahan əlavə edir, məlumatlarını və statusunu dəyişir

### Sistem
- JWT əsaslı autentifikasiya (access + refresh token)
- Token avtomatik yenilənməsi
- Dark tema
- Tam responsiv interfeys

---

## 🗂️ Layihə strukturu

```
PRACTICE/
├── src/                        # React frontend
│   ├── api/
│   │   └── axios.js            # API client + interceptors
│   ├── context/
│   │   └── AuthContext.jsx     # JWT auth state
│   ├── components/
│   │   ├── app/                # Root komponent + routing
│   │   ├── Layout/             # Əsas layout (sidebar + topbar)
│   │   ├── Sidebar/            # Nav menyu
│   │   ├── Topbar/             # Başlıq çubuğu
│   │   └── ui/                 # Spinner və s.
│   ├── pages/
│   │   ├── LoginPage.jsx
│   │   ├── student/
│   │   │   ├── StudentDashboard.jsx   # Fənlər + xülasə
│   │   │   ├── StudentAttendance.jsx  # Davamiyyət tarixi
│   │   │   ├── StudentProfile.jsx     # Akademik profil
│   │   │   └── StudentExams.jsx       # İmtahanlar
│   │   └── teacher/
│   │       ├── TeacherDashboard.jsx   # Fənn siyahısı
│   │       ├── TeacherSubject.jsx     # Fənn detalı
│   │       ├── AttendanceModal.jsx    # Davamiyyət yazma
│   │       ├── GradeModal.jsx         # Bal yazma
│   │       └── ExamModal.jsx          # İmtahan əlavə/düzəliş
│   └── common/
│       └── button/             # Yenilənə bilən Button komponenti
│
├── backend/                    # Django backend
│   ├── core/                   # Layihə ayarları + URL-lər
│   ├── accounts/               # Custom User modeli + JWT auth
│   ├── university/             # Əsas tətbiq
│   │   ├── models.py           # Department, Semester, Subject,
│   │   │                       # Enrollment, Attendance, Grade, Exam
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   └── permissions.py
│   └── seed.py                 # Demo data skripti
│
├── index.html
├── vite.config.js
└── package.json
```

---

## 🛠️ Texnologiyalar

**Frontend**
- React 18, React Router v6
- Vite 5
- Axios (JWT interceptor ilə)
- Xalis CSS (CSS variables, dark tema)

**Backend**
- Django 5, Django REST Framework
- SimpleJWT
- django-cors-headers
- SQLite (inkişaf üçün)

---

## 📝 Lisenziya

MIT
