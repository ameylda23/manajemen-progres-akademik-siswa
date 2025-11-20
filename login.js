// login.js - Authentication System for MyClassProgress

// Global variables
let students = [];
let teachers = [];

// Initialize login system
document.addEventListener('DOMContentLoaded', function() {
    initializeLoginSystem();
});

function initializeLoginSystem() {
    loadUserData();
    setupEventListeners();
    initializeRoleSelector();
    checkExistingSession();
}

function loadUserData() {
    // Load data from localStorage or initialize with default data
    students = JSON.parse(localStorage.getItem('students')) || [];
    teachers = JSON.parse(localStorage.getItem('teachers')) || [];
    
    // If no data exists, initialize with demo data
    if (students.length === 0 || teachers.length === 0) {
        initializeDemoData();
    }
}

function initializeDemoData() {
    // Demo students data
    const demoStudents = [
        {
            id: "S001",
            nama: "Andi Wijaya",
            email: "andi@school.com",
            password: "password123",
            kelas: "12 IPA 1",
            telepon: "08123456789",
            tanggalLahir: "2006-05-15",
            role: "siswa"
        },
        {
            id: "S002", 
            nama: "Sari Dewi",
            email: "sari@school.com",
            password: "password123",
            kelas: "12 IPA 1",
            telepon: "08129876543",
            tanggalLahir: "2006-08-22",
            role: "siswa"
        },
        {
            id: "S003",
            nama: "Budi Santoso",
            email: "budi@school.com",
            password: "password123",
            kelas: "12 IPS 1",
            telepon: "081311223344",
            tanggalLahir: "2006-03-10",
            role: "siswa"
        }
    ];

    // Demo teachers data
    const demoTeachers = [
        {
            id: "G001",
            nama: "Bu Santi, M.Pd",
            email: "santi@school.com", 
            password: "password123",
            mataPelajaran: "Matematika",
            role: "guru"
        },
        {
            id: "G002",
            nama: "Pak Budi, S.Pd",
            email: "budi_guru@school.com",
            password: "password123", 
            mataPelajaran: "Fisika",
            role: "guru"
        }
    ];

    // Demo tasks data
    const demoTasks = [
        {
            id: "T001",
            judul: "Tugas Matematika - Trigonometri",
            deskripsi: "Kerjakan soal trigonometri halaman 45-48. Tulis jawaban di buku tugas dan kumpulkan sebelum deadline.",
            mataPelajaran: "Matematika",
            guruId: "G001",
            tanggalDiberikan: "2024-01-15",
            tenggatWaktu: "2024-01-22",
            status: "belum",
            siswaId: "S001",
            kelas: "12 IPA 1"
        },
        {
            id: "T002",
            judul: "Essay Sejarah Indonesia",
            deskripsi: "Buat essay tentang perjuangan kemerdekaan Indonesia minimal 500 kata.",
            mataPelajaran: "Sejarah", 
            guruId: "G001",
            tanggalDiberikan: "2024-01-10",
            tenggatWaktu: "2024-01-25",
            status: "selesai",
            siswaId: "S001",
            kelas: "12 IPA 1"
        },
        {
            id: "T003",
            judul: "Laporan Praktikum Fisika",
            deskripsi: "Buat laporan praktikum hukum Newton dengan format yang telah ditentukan.",
            mataPelajaran: "Fisika",
            guruId: "G002",
            tanggalDiberikan: "2024-01-12",
            tenggatWaktu: "2024-01-19",
            status: "belum",
            siswaId: "S001",
            kelas: "12 IPA 1"
        }
    ];

    // Demo grades data
    const demoGrades = [
        {
            id: "N001",
            siswaId: "S001",
            tugasId: "T001", 
            mataPelajaran: "Matematika",
            nilai: 85,
            tanggal: "2024-01-20",
            catatan: "Kerja bagus, perlu perbaikan di bagian cosinus",
            guruId: "G001"
        },
        {
            id: "N002",
            siswaId: "S001",
            tugasId: "T002",
            mataPelajaran: "Sejarah",
            nilai: 92,
            tanggal: "2024-01-18",
            catatan: "Essay sangat komprehensif dan terstruktur dengan baik",
            guruId: "G001"
        },
        {
            id: "N003",
            siswaId: "S002",
            tugasId: "T001",
            mataPelajaran: "Matematika", 
            nilai: 78,
            tanggal: "2024-01-21",
            catatan: "Perlu lebih teliti dalam perhitungan",
            guruId: "G001"
        }
    ];

    // Save to localStorage
    localStorage.setItem('students', JSON.stringify(demoStudents));
    localStorage.setItem('teachers', JSON.stringify(demoTeachers));
    localStorage.setItem('tasks', JSON.stringify(demoTasks));
    localStorage.setItem('grades', JSON.stringify(demoGrades));
    
    // Reload data
    students = demoStudents;
    teachers = demoTeachers;
}

function setupEventListeners() {
    const loginForm = document.getElementById('loginForm');
    const roleOptions = document.querySelectorAll('.role-option input[type="radio"]');
    const registerLink = document.getElementById('registerLink');

    // Login form submission
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Role selection
    if (roleOptions) {
        roleOptions.forEach(radio => {
            radio.addEventListener('change', handleRoleChange);
        });
    }

    // Register link
    if (registerLink) {
        registerLink.addEventListener('click', handleRegister);
    }
}

function initializeRoleSelector() {
    // Set initial role selection UI
    const siswaRadio = document.querySelector('input[value="siswa"]');
    if (siswaRadio) {
        siswaRadio.checked = true;
        updateRoleSelectionUI('siswa');
    }
}

function handleRoleChange(event) {
    const selectedRole = event.target.value;
    updateRoleSelectionUI(selectedRole);
}

function updateRoleSelectionUI(role) {
    const roleOptions = document.querySelectorAll('.role-option');
    
    roleOptions.forEach(option => {
        const input = option.querySelector('input');
        if (input.value === role) {
            option.classList.add('selected');
        } else {
            option.classList.remove('selected');
        }
    });
}

function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const role = document.querySelector('input[name="role"]:checked').value;
    
    // Validate inputs
    if (!email || !password) {
        showError('Harap isi email dan password');
        return;
    }

    // Show loading state
    setLoadingState(true);
    
    // Simulate API call delay
    setTimeout(() => {
        const loginResult = authenticateUser(email, password, role);
        
        if (loginResult.success) {
            loginSuccess(loginResult.user);
        } else {
            loginFailed(loginResult.message);
        }
        
        setLoadingState(false);
    }, 1000);
}

function authenticateUser(email, password, role) {
    let user = null;
    
    if (role === 'siswa') {
        user = students.find(s => 
            s.email === email && s.password === password
        );
    } else if (role === 'guru') {
        user = teachers.find(t => 
            t.email === email && t.password === password
        );
    }
    
    if (user) {
        return {
            success: true,
            user: user
        };
    } else {
        return {
            success: false,
            message: 'Email atau password salah'
        };
    }
}

function loginSuccess(user) {
    // Save user session
    localStorage.setItem('currentUser', JSON.stringify(user));
    
    // Show success message
    showSuccess('Login berhasil! Mengarahkan...');
    
    // Redirect based on role
    setTimeout(() => {
        redirectBasedOnRole(user.role);
    }, 1500);
}

function loginFailed(message) {
    showError(message);
    shakeLoginForm();
}

function redirectBasedOnRole(role) {
    if (role === 'siswa') {
        window.location.href = 'index.html';
    } else if (role === 'guru') {
        window.location.href = 'guru.html';
    }
}

function handleRegister(event) {
    event.preventDefault();
    showError('Fitur registrasi belum tersedia. Gunakan akun demo yang tersedia.');
}

function checkExistingSession() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (currentUser) {
        // User already logged in, redirect to appropriate dashboard
        redirectBasedOnRole(currentUser.role);
    }
}

function setLoadingState(isLoading) {
    const loginBtn = document.getElementById('loginBtn');
    const loadingSpinner = document.getElementById('loadingSpinner');
    
    if (loginBtn && loadingSpinner) {
        if (isLoading) {
            loginBtn.disabled = true;
            loginBtn.textContent = 'Memproses...';
            loadingSpinner.style.display = 'block';
        } else {
            loginBtn.disabled = false;
            loginBtn.textContent = 'Masuk';
            loadingSpinner.style.display = 'none';
        }
    }
}

function showError(message) {
    const errorElement = document.getElementById('errorMessage');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        
        // Auto hide after 5 seconds
        setTimeout(() => {
            errorElement.style.display = 'none';
        }, 5000);
    }
}

function showSuccess(message) {
    // Create success message element
    const successElement = document.createElement('div');
    successElement.className = 'success-message';
    successElement.textContent = message;
    successElement.style.cssText = `
        background: #d4edda;
        color: #155724;
        padding: 12px 15px;
        border-radius: 5px;
        margin: 10px 0;
        border: 1px solid #c3e6cb;
        text-align: center;
    `;
    
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.insertBefore(successElement, loginForm.firstChild);
        
        // Remove after 3 seconds
        setTimeout(() => {
            if (successElement.parentNode) {
                successElement.remove();
            }
        }, 3000);
    }
}

function shakeLoginForm() {
    const loginCard = document.querySelector('.login-card');
    if (loginCard) {
        loginCard.style.animation = 'shake 0.5s ease-in-out';
        
        setTimeout(() => {
            loginCard.style.animation = '';
        }, 500);
    }
}

// Add shake animation to CSS
function addShakeAnimation() {
    if (!document.getElementById('shake-animation-style')) {
        const style = document.createElement('style');
        style.id = 'shake-animation-style';
        style.textContent = `
            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                25% { transform: translateX(-5px); }
                75% { transform: translateX(5px); }
            }
        `;
        document.head.appendChild(style);
    }
}

// Password strength checker (for future registration feature)
function checkPasswordStrength(password) {
    if (password.length < 6) return 'weak';
    if (password.length < 8) return 'medium';
    
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    const strengthFactors = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar];
    const trueCount = strengthFactors.filter(Boolean).length;
    
    if (trueCount >= 3) return 'strong';
    if (trueCount >= 2) return 'medium';
    return 'weak';
}

// Remember me functionality (optional enhancement)
function setupRememberMe() {
    const rememberMe = localStorage.getItem('rememberMe');
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    
    if (rememberMe === 'true' && rememberedEmail) {
        document.getElementById('email').value = rememberedEmail;
        document.getElementById('rememberMe').checked = true;
    }
}

function handleRememberMe() {
    const rememberMe = document.getElementById('rememberMe');
    const email = document.getElementById('email').value;
    
    if (rememberMe && rememberMe.checked) {
        localStorage.setItem('rememberMe', 'true');
        localStorage.setItem('rememberedEmail', email);
    } else {
        localStorage.removeItem('rememberMe');
        localStorage.removeItem('rememberedEmail');
    }
}

// Initialize additional features
addShakeAnimation();

// Export functions for testing or future use
window.LoginSystem = {
    authenticateUser,
    checkPasswordStrength,
    initializeDemoData
};