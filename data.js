// data.js - Database and Data Management for MyClassProgress

// Main data structure
const AppData = {
    students: [],
    teachers: [],
    tasks: [],
    grades: [],
    currentUser: null,
    settings: {
        academicYear: '2024/2025',
        semester: 1,
        schoolName: 'SMA Negeri 1 Jakarta'
    }
};

// Initialize application data
function initializeData() {
    loadAllData();
    
    // If no data exists, initialize with demo data
    if (AppData.students.length === 0 || AppData.teachers.length === 0) {
        initializeDemoData();
        saveAllData();
    }
}

// Load all data from localStorage
function loadAllData() {
    try {
        AppData.students = JSON.parse(localStorage.getItem('students')) || [];
        AppData.teachers = JSON.parse(localStorage.getItem('teachers')) || [];
        AppData.tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        AppData.grades = JSON.parse(localStorage.getItem('grades')) || [];
        AppData.currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
        AppData.settings = JSON.parse(localStorage.getItem('settings')) || AppData.settings;
    } catch (error) {
        console.error('Error loading data from localStorage:', error);
        initializeDemoData();
        saveAllData();
    }
}

// Save all data to localStorage
function saveAllData() {
    try {
        localStorage.setItem('students', JSON.stringify(AppData.students));
        localStorage.setItem('teachers', JSON.stringify(AppData.teachers));
        localStorage.setItem('tasks', JSON.stringify(AppData.tasks));
        localStorage.setItem('grades', JSON.stringify(AppData.grades));
        localStorage.setItem('currentUser', JSON.stringify(AppData.currentUser));
        localStorage.setItem('settings', JSON.stringify(AppData.settings));
    } catch (error) {
        console.error('Error saving data to localStorage:', error);
        showError('Gagal menyimpan data. Storage mungkin penuh.');
    }
}

// Initialize with comprehensive demo data
function initializeDemoData() {
    initializeDemoStudents();
    initializeDemoTeachers();
    initializeDemoTasks();
    initializeDemoGrades();
    initializeDemoSettings();
}

function initializeDemoStudents() {
    AppData.students = [
        {
            id: "S001",
            nama: "Andi Wijaya",
            email: "andi@school.com",
            password: "password123",
            kelas: "12 IPA 1",
            telepon: "08123456789",
            tanggalLahir: "2006-05-15",
            alamat: "Jl. Merdeka No. 123, Jakarta",
            role: "siswa",
            createdAt: "2024-01-01",
            isActive: true
        },
        {
            id: "S002", 
            nama: "Sari Dewi",
            email: "sari@school.com",
            password: "password123",
            kelas: "12 IPA 1",
            telepon: "08129876543",
            tanggalLahir: "2006-08-22",
            alamat: "Jl. Sudirman No. 45, Jakarta",
            role: "siswa",
            createdAt: "2024-01-01",
            isActive: true
        },
        {
            id: "S003",
            nama: "Budi Santoso",
            email: "budi@school.com",
            password: "password123",
            kelas: "12 IPS 1",
            telepon: "081311223344",
            tanggalLahir: "2006-03-10",
            alamat: "Jl. Thamrin No. 67, Jakarta",
            role: "siswa",
            createdAt: "2024-01-01",
            isActive: true
        },
        {
            id: "S004",
            nama: "Rina Melati",
            email: "rina@school.com",
            password: "password123",
            kelas: "12 IPA 2",
            telepon: "081344556677",
            tanggalLahir: "2006-11-30",
            alamat: "Jl. Gatot Subroto No. 89, Jakarta",
            role: "siswa",
            createdAt: "2024-01-01",
            isActive: true
        },
        {
            id: "S005",
            nama: "Dodi Pratama",
            email: "dodi@school.com",
            password: "password123",
            kelas: "12 IPS 2",
            telepon: "081377889900",
            tanggalLahir: "2006-07-18",
            alamat: "Jl. Asia Afrika No. 12, Jakarta",
            role: "siswa",
            createdAt: "2024-01-01",
            isActive: true
        }
    ];
}

function initializeDemoTeachers() {
    AppData.teachers = [
        {
            id: "G001",
            nama: "Bu Santi, M.Pd",
            email: "santi@school.com", 
            password: "password123",
            mataPelajaran: "Matematika",
            telepon: "08111222333",
            role: "guru",
            createdAt: "2024-01-01",
            isActive: true,
            classes: ["12 IPA 1", "12 IPA 2", "12 IPS 1"]
        },
        {
            id: "G002",
            nama: "Pak Budi, S.Pd",
            email: "budi_guru@school.com",
            password: "password123", 
            mataPelajaran: "Fisika",
            telepon: "08114455666",
            role: "guru",
            createdAt: "2024-01-01",
            isActive: true,
            classes: ["12 IPA 1", "12 IPA 2"]
        },
        {
            id: "G003",
            nama: "Bu Dewi, M.Pd",
            email: "dewi@school.com",
            password: "password123",
            mataPelajaran: "Bahasa Indonesia",
            telepon: "08117788999",
            role: "guru",
            createdAt: "2024-01-01",
            isActive: true,
            classes: ["12 IPA 1", "12 IPA 2", "12 IPS 1", "12 IPS 2"]
        }
    ];
}

function initializeDemoTasks() {
    AppData.tasks = [
        {
            id: "T001",
            judul: "Tugas Matematika - Trigonometri",
            deskripsi: "Kerjakan soal trigonometri halaman 45-48. Tulis jawaban di buku tugas dan kumpulkan sebelum deadline.\n\nSoal:\n1. Hitung nilai sin 30° + cos 60°\n2. Selesaikan persamaan trigonometri...",
            mataPelajaran: "Matematika",
            guruId: "G001",
            tanggalDiberikan: "2024-01-15",
            tenggatWaktu: "2024-01-22",
            status: "belum",
            siswaId: "S001",
            kelas: "12 IPA 1",
            priority: "medium",
            attachments: [],
            createdAt: "2024-01-15T08:00:00"
        },
        {
            id: "T002",
            judul: "Essay Sejarah Indonesia",
            deskripsi: "Buat essay tentang perjuangan kemerdekaan Indonesia minimal 500 kata.\n\nTopik: Peran pemuda dalam memperjuangkan kemerdekaan Indonesia.\n\nFormat:\n- Pendahuluan\n- Isi\n- Penutup\n- Daftar Pustaka",
            mataPelajaran: "Sejarah", 
            guruId: "G001",
            tanggalDiberikan: "2024-01-10",
            tenggatWaktu: "2024-01-25",
            status: "selesai",
            siswaId: "S001",
            kelas: "12 IPA 1",
            priority: "high",
            attachments: [],
            createdAt: "2024-01-10T09:30:00"
        },
        {
            id: "T003",
            judul: "Laporan Praktikum Fisika - Hukum Newton",
            deskripsi: "Buat laporan praktikum hukum Newton dengan format yang telah ditentukan.\n\nLaporan harus mencakup:\n- Tujuan praktikum\n- Alat dan bahan\n- Langkah kerja\n- Data pengamatan\n- Analisis data\n- Kesimpulan",
            mataPelajaran: "Fisika",
            guruId: "G002",
            tanggalDiberikan: "2024-01-12",
            tenggatWaktu: "2024-01-19",
            status: "belum",
            siswaId: "S001",
            kelas: "12 IPA 1",
            priority: "high",
            attachments: [],
            createdAt: "2024-01-12T10:15:00"
        },
        {
            id: "T004",
            judul: "Analisis Cerpen Bahasa Indonesia",
            deskripsi: "Analisis cerpen 'Robohnya Surau Kami' karya A.A. Navis.\n\nAspek yang dianalisis:\n- Tema dan amanat\n- Penokohan\n- Alur cerita\n- Latar\n- Nilai-nilai kehidupan",
            mataPelajaran: "Bahasa Indonesia",
            guruId: "G003",
            tanggalDiberikan: "2024-01-08",
            tenggatWaktu: "2024-01-18",
            status: "selesai",
            siswaId: "S001",
            kelas: "12 IPA 1",
            priority: "medium",
            attachments: [],
            createdAt: "2024-01-08T14:20:00"
        },
        // Additional tasks for other students
        {
            id: "T005",
            judul: "Tugas Matematika - Trigonometri",
            deskripsi: "Kerjakan soal trigonometri halaman 45-48.",
            mataPelajaran: "Matematika",
            guruId: "G001",
            tanggalDiberikan: "2024-01-15",
            tenggatWaktu: "2024-01-22",
            status: "selesai",
            siswaId: "S002",
            kelas: "12 IPA 1",
            priority: "medium",
            attachments: [],
            createdAt: "2024-01-15T08:00:00"
        },
        {
            id: "T006",
            judul: "Essay Sejarah Indonesia",
            deskripsi: "Buat essay tentang perjuangan kemerdekaan Indonesia.",
            mataPelajaran: "Sejarah",
            guruId: "G001",
            tanggalDiberikan: "2024-01-10",
            tenggatWaktu: "2024-01-25",
            status: "belum",
            siswaId: "S002",
            kelas: "12 IPA 1",
            priority: "high",
            attachments: [],
            createdAt: "2024-01-10T09:30:00"
        }
    ];
}

function initializeDemoGrades() {
    AppData.grades = [
        {
            id: "N001",
            siswaId: "S001",
            tugasId: "T001", 
            mataPelajaran: "Matematika",
            nilai: 85,
            tanggal: "2024-01-20",
            catatan: "Kerja bagus! Perhitungan akurat, namun perlu lebih teliti dalam penulisan satuan. Perbaikan diperlukan di bagian cosinus.",
            guruId: "G001",
            semester: 1,
            academicYear: "2024/2025",
            createdAt: "2024-01-20T14:30:00"
        },
        {
            id: "N002",
            siswaId: "S001",
            tugasId: "T002",
            mataPelajaran: "Sejarah",
            nilai: 92,
            tanggal: "2024-01-18",
            catatan: "Essay sangat komprehensif dan terstruktur dengan baik. Argumentasi kuat didukung dengan fakta historis yang akurat. Bahasa yang digunakan sangat baik.",
            guruId: "G001",
            semester: 1,
            academicYear: "2024/2025",
            createdAt: "2024-01-18T10:15:00"
        },
        {
            id: "N003",
            siswaId: "S001",
            tugasId: "T004",
            mataPelajaran: "Bahasa Indonesia", 
            nilai: 88,
            tanggal: "2024-01-17",
            catatan: "Analisis mendalam dan kritis. Pemahaman terhadap cerpen sangat baik. Namun, perlu lebih banyak kutipan langsung dari teks untuk mendukung analisis.",
            guruId: "G003",
            semester: 1,
            academicYear: "2024/2025",
            createdAt: "2024-01-17T16:45:00"
        },
        {
            id: "N004",
            siswaId: "S002",
            tugasId: "T005",
            mataPelajaran: "Matematika",
            nilai: 78,
            tanggal: "2024-01-21",
            catatan: "Konsep sudah dipahami dengan baik, namun perlu lebih teliti dalam perhitungan. Beberapa langkah penyelesaian terlewat.",
            guruId: "G001",
            semester: 1,
            academicYear: "2024/2025",
            createdAt: "2024-01-21T11:20:00"
        },
        {
            id: "N005",
            siswaId: "S003",
            tugasId: "T001",
            mataPelajaran: "Matematika",
            nilai: 65,
            tanggal: "2024-01-22",
            catatan: "Perlu lebih banyak latihan dalam memahami konsep trigonometri. Beberapa rumus dasar masih keliru.",
            guruId: "G001",
            semester: 1,
            academicYear: "2024/2025",
            createdAt: "2024-01-22T09:10:00"
        }
    ];
}

function initializeDemoSettings() {
    AppData.settings = {
        academicYear: '2024/2025',
        semester: 1,
        schoolName: 'SMA Negeri 1 Jakarta',
        schoolAddress: 'Jl. Pendidikan No. 1, Jakarta Pusat',
        schoolPhone: '(021) 1234567',
        maxGrade: 100,
        minGrade: 0,
        gradeScale: {
            A: { min: 85, max: 100, color: '#28a745' },
            B: { min: 70, max: 84, color: '#17a2b8' },
            C: { min: 60, max: 69, color: '#ffc107' },
            D: { min: 50, max: 59, color: '#fd7e14' },
            E: { min: 0, max: 49, color: '#dc3545' }
        },
        createdAt: "2024-01-01",
        updatedAt: "2024-01-01"
    };
}

// Data retrieval functions
function getAllStudents() {
    return AppData.students.filter(student => student.isActive !== false);
}

function getStudentById(studentId) {
    return AppData.students.find(student => student.id === studentId && student.isActive !== false);
}

function getStudentsByClass(className) {
    return AppData.students.filter(student => 
        student.kelas === className && student.isActive !== false
    );
}

function getAllTeachers() {
    return AppData.teachers.filter(teacher => teacher.isActive !== false);
}

function getTeacherById(teacherId) {
    return AppData.teachers.find(teacher => teacher.id === teacherId && teacher.isActive !== false);
}

function getTasksByStudentId(studentId) {
    return AppData.tasks.filter(task => task.siswaId === studentId);
}

function getTasksByTeacherId(teacherId) {
    return AppData.tasks.filter(task => task.guruId === teacherId);
}

function getTasksByClass(className) {
    return AppData.tasks.filter(task => {
        const student = getStudentById(task.siswaId);
        return student && student.kelas === className;
    });
}

function getGradesByStudentId(studentId) {
    return AppData.grades.filter(grade => grade.siswaId === studentId);
}

function getGradesByTeacherId(teacherId) {
    return AppData.grades.filter(grade => grade.guruId === teacherId);
}

function getGradesByTaskId(taskId) {
    return AppData.grades.filter(grade => grade.tugasId === taskId);
}

function getGradeByStudentAndTask(studentId, taskId) {
    return AppData.grades.find(grade => 
        grade.siswaId === studentId && grade.tugasId === taskId
    );
}

// Data manipulation functions
function addStudent(studentData) {
    const newStudent = {
        id: generateId('S'),
        ...studentData,
        createdAt: new Date().toISOString(),
        isActive: true
    };
    
    AppData.students.push(newStudent);
    saveAllData();
    return newStudent;
}

function updateStudent(studentId, updateData) {
    const index = AppData.students.findIndex(student => student.id === studentId);
    if (index !== -1) {
        AppData.students[index] = {
            ...AppData.students[index],
            ...updateData,
            updatedAt: new Date().toISOString()
        };
        saveAllData();
        return AppData.students[index];
    }
    return null;
}

function addTask(taskData) {
    const newTask = {
        id: generateId('T'),
        status: 'belum',
        ...taskData,
        createdAt: new Date().toISOString()
    };
    
    AppData.tasks.push(newTask);
    saveAllData();
    return newTask;
}

function updateTask(taskId, updateData) {
    const index = AppData.tasks.findIndex(task => task.id === taskId);
    if (index !== -1) {
        AppData.tasks[index] = {
            ...AppData.tasks[index],
            ...updateData,
            updatedAt: new Date().toISOString()
        };
        saveAllData();
        return AppData.tasks[index];
    }
    return null;
}

function addGrade(gradeData) {
    const newGrade = {
        id: generateId('N'),
        semester: AppData.settings.semester,
        academicYear: AppData.settings.academicYear,
        ...gradeData,
        createdAt: new Date().toISOString()
    };
    
    // Check if grade already exists for this student and task
    const existingIndex = AppData.grades.findIndex(grade => 
        grade.siswaId === gradeData.siswaId && grade.tugasId === gradeData.tugasId
    );
    
    if (existingIndex !== -1) {
        AppData.grades[existingIndex] = {
            ...AppData.grades[existingIndex],
            ...newGrade,
            updatedAt: new Date().toISOString()
        };
    } else {
        AppData.grades.push(newGrade);
    }
    
    saveAllData();
    return newGrade;
}

function updateGrade(gradeId, updateData) {
    const index = AppData.grades.findIndex(grade => grade.id === gradeId);
    if (index !== -1) {
        AppData.grades[index] = {
            ...AppData.grades[index],
            ...updateData,
            updatedAt: new Date().toISOString()
        };
        saveAllData();
        return AppData.grades[index];
    }
    return null;
}

// Utility functions
function generateId(prefix = '') {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    return `${prefix}${timestamp}${random}`;
}


function getCurrentUser() {
    return AppData.currentUser;
}

function setCurrentUser(user) {
    AppData.currentUser = user;
    saveAllData();
}

function clearCurrentUser() {
    AppData.currentUser = null;
    saveAllData();
}

function getSettings() {
    return AppData.settings;
}

function updateSettings(newSettings) {
    AppData.settings = {
        ...AppData.settings,
        ...newSettings,
        updatedAt: new Date().toISOString()
    };
    saveAllData();
    return AppData.settings;
}

// Statistics and analytics functions
function getStudentStatistics(studentId) {
    const studentGrades = getGradesByStudentId(studentId);
    const studentTasks = getTasksByStudentId(studentId);
    
    if (studentGrades.length === 0) {
        return {
            averageGrade: 0,
            totalTasks: studentTasks.length,
            completedTasks: studentTasks.filter(task => task.status === 'selesai').length,
            pendingTasks: studentTasks.filter(task => task.status !== 'selesai').length,
            highestGrade: 0,
            lowestGrade: 0,
            gradeDistribution: {}
        };
    }
    
    const grades = studentGrades.map(grade => grade.nilai);
    const averageGrade = grades.reduce((sum, grade) => sum + grade, 0) / grades.length;
    
    return {
        averageGrade: Math.round(averageGrade * 10) / 10,
        totalTasks: studentTasks.length,
        completedTasks: studentTasks.filter(task => task.status === 'selesai').length,
        pendingTasks: studentTasks.filter(task => task.status !== 'selesai').length,
        highestGrade: Math.max(...grades),
        lowestGrade: Math.min(...grades),
        gradeDistribution: calculateGradeDistribution(grades)
    };
}

function getClassStatistics(className) {
    const classStudents = getStudentsByClass(className);
    const classGrades = AppData.grades.filter(grade => {
        const student = getStudentById(grade.siswaId);
        return student && student.kelas === className;
    });
    
    if (classGrades.length === 0) {
        return {
            averageGrade: 0,
            totalStudents: classStudents.length,
            totalGrades: 0,
            gradeDistribution: {}
        };
    }
    
    const grades = classGrades.map(grade => grade.nilai);
    const averageGrade = grades.reduce((sum, grade) => sum + grade, 0) / grades.length;
    
    return {
        averageGrade: Math.round(averageGrade * 10) / 10,
        totalStudents: classStudents.length,
        totalGrades: classGrades.length,
        gradeDistribution: calculateGradeDistribution(grades)
    };
}

function calculateGradeDistribution(grades) {
    const distribution = {
        A: 0, B: 0, C: 0, D: 0, E: 0
    };
    
    grades.forEach(grade => {
        if (grade >= 85) distribution.A++;
        else if (grade >= 70) distribution.B++;
        else if (grade >= 60) distribution.C++;
        else if (grade >= 50) distribution.D++;
        else distribution.E++;
    });
    
    return distribution;
}

function getGradePredicate(score) {
    if (score >= 85) return 'A';
    if (score >= 70) return 'B';
    if (score >= 60) return 'C';
    if (score >= 50) return 'D';
    return 'E';
}

function getGradeColor(score) {
    if (score >= 85) return 'grade-excellent';
    if (score >= 70) return 'grade-good';
    if (score >= 60) return 'grade-average';
    if (score >= 50) return 'grade-poor';
    return 'grade-fail';
}

// Data validation functions
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isValidPhone(phone) {
    const phoneRegex = /^[0-9+\-\s()]{10,}$/;
    return phoneRegex.test(phone);
}

function isValidGrade(grade) {
    return !isNaN(grade) && grade >= 0 && grade <= 100;
}

// Export data for backup
function exportData() {
    return {
        students: AppData.students,
        teachers: AppData.teachers,
        tasks: AppData.tasks,
        grades: AppData.grades,
        settings: AppData.settings,
        exportDate: new Date().toISOString(),
        version: '1.0'
    };
}

// Import data from backup
function importData(data) {
    if (data.students) AppData.students = data.students;
    if (data.teachers) AppData.teachers = data.teachers;
    if (data.tasks) AppData.tasks = data.tasks;
    if (data.grades) AppData.grades = data.grades;
    if (data.settings) AppData.settings = data.settings;
    
    saveAllData();
    return true;
}

// Reset all data to demo data
function resetToDemoData() {
    if (confirm('Apakah Anda yakin ingin mereset semua data ke data demo? Tindakan ini tidak dapat dibatalkan.')) {
        initializeDemoData();
        saveAllData();
        return true;
    }
    return false;
}

// Error handling
function showError(message) {
    console.error('Data Error:', message);
    // In a real app, you might want to show this to the user
    if (typeof showNotification === 'function') {
        showNotification(message, 'error');
    }
}

// Initialize data when script loads
initializeData();

// Export functions for global access
window.DataManager = {
    // Data retrieval
    getAllStudents,
    getStudentById,
    getStudentsByClass,
    getAllTeachers,
    getTeacherById,
    getTasksByStudentId,
    getTasksByTeacherId,
    getTasksByClass,
    getGradesByStudentId,
    getGradesByTeacherId,
    getGradesByTaskId,
    getGradeByStudentAndTask,
    
    // Data manipulation
    addStudent,
    updateStudent,
    addTask,
    updateTask,
    addGrade,
    updateGrade,
    
    // User management
    getCurrentUser,
    setCurrentUser,
    clearCurrentUser,
    
    // Settings
    getSettings,
    updateSettings,
    
    // Statistics
    getStudentStatistics,
    getClassStatistics,
    getGradePredicate,
    getGradeColor,
    
    // Data management
    exportData,
    importData,
    resetToDemoData,
    saveAllData,
    
    // Validation
    isValidEmail,
    isValidPhone,
    isValidGrade
};