// script.js - Dashboard Siswa MyClassProgress

// Ambil data dari localStorage
let currentUser = JSON.parse(localStorage.getItem('currentUser'));
let students = JSON.parse(localStorage.getItem('students')) || [];
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let grades = JSON.parse(localStorage.getItem('grades')) || [];

// CEK LOGIN
if (!currentUser) {
    // Jika belum login, redirect ke login
    window.location.href = 'login.html';
} else {
    // Update UI nama user
    const userWelcome = document.getElementById('userWelcome');
    const userName = document.getElementById('userName');
    if (userWelcome) userWelcome.textContent = `Selamat datang, ${currentUser.nama}!`;
    if (userName) userName.textContent = currentUser.nama;
}

// LOGOUT BUTTON
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', function() {
        localStorage.removeItem('currentUser');
        window.location.href = 'login.html';
    });
}

// UPDATE GREETING & DATE
function updateGreetingAndDate() {
    const greetingElement = document.getElementById('greetingText');
    const dateElement = document.getElementById('dateDisplay');
    if (!greetingElement || !dateElement) return;

    const hour = new Date().getHours();
    let greeting = '';
    if (hour < 12) greeting = 'Selamat Pagi';
    else if (hour < 15) greeting = 'Selamat Siang';
    else if (hour < 19) greeting = 'Selamat Sore';
    else greeting = 'Selamat Malam';

    greetingElement.textContent = greeting;

    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    dateElement.textContent = new Date().toLocaleDateString('id-ID', options);
}

// HITUNG STATISTIK
function updateStatistics() {
    if (!currentUser) return;

    // Filter tugas & nilai untuk siswa ini
    const myTasks = tasks.filter(t => t.siswaId === currentUser.id);
    const myGrades = grades.filter(g => g.siswaId === currentUser.id);

    // Total Tugas
    document.getElementById('totalTasks').textContent = myTasks.length;

    // Tugas Selesai
    const completedTasks = myTasks.filter(t => t.status === 'selesai').length;
    document.getElementById('completedTasks').textContent = completedTasks;

    // Tugas Tertunda
    const pendingTasks = myTasks.filter(t => t.status !== 'selesai').length;
    document.getElementById('pendingTasks').textContent = pendingTasks;

    // Rata-rata nilai
    let avg = 0;
    if (myGrades.length > 0) {
        avg = myGrades.reduce((sum, g) => sum + g.nilai, 0) / myGrades.length;
    }
    document.getElementById('averageGrade').textContent = avg.toFixed(1);

    // Tugas mendesak (deadline <= 3 hari dari sekarang)
    const today = new Date();
    const urgentTasks = myTasks.filter(t => {
        const deadline = new Date(t.tenggatWaktu);
        const diff = (deadline - today) / (1000 * 60 * 60 * 24);
        return diff >= 0 && diff <= 3 && t.status !== 'selesai';
    }).length;
    document.getElementById('urgentTasks').textContent = urgentTasks;

    // Total mata pelajaran aktif
    const subjects = [...new Set(myTasks.map(t => t.mataPelajaran))];
    document.getElementById('totalSubjects').textContent = subjects.length;

    // Peringkat sederhana berdasarkan rata-rata nilai
    const allStudents = students.filter(s => s.kelas === currentUser.kelas);
    const averages = allStudents.map(s => {
        const sGrades = grades.filter(g => g.siswaId === s.id);
        let avgS = 0;
        if (sGrades.length > 0) {
            avgS = sGrades.reduce((sum, g) => sum + g.nilai, 0) / sGrades.length;
        }
        return { id: s.id, average: avgS };
    }).sort((a, b) => b.average - a.average);

    const rank = averages.findIndex(a => a.id === currentUser.id) + 1;
    document.getElementById('classRank').textContent = rank ? rank : '-';
}

// TUGAS TERBARU
function loadRecentTasks() {
    const container = document.getElementById('recentTasks');
    if (!container) return;

    const myTasks = tasks.filter(t => t.siswaId === currentUser.id)
                         .sort((a, b) => new Date(b.tanggalDiberikan) - new Date(a.tanggalDiberikan))
                         .slice(0, 5);

    if (myTasks.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>Belum ada tugas</p></div>';
        return;
    }

    container.innerHTML = myTasks.map(t => `
        <div class="task-item">
            <h4>${t.judul}</h4>
            <p>${t.mataPelajaran} - ${t.kelas}</p>
            <span>Batas: ${t.tenggatWaktu}</span>
            <span>Status: ${t.status}</span>
        </div>
    `).join('');
}

// NILAI TERBARU
function loadRecentGrades() {
    const container = document.getElementById('recentGrades');
    if (!container) return;

    const myGrades = grades.filter(g => g.siswaId === currentUser.id)
                           .sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal))
                           .slice(0, 5);

    if (myGrades.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>Belum ada nilai</p></div>';
        return;
    }

    container.innerHTML = myGrades.map(g => `
        <div class="grade-item">
            <h4>${g.mataPelajaran}</h4>
            <span>Nilai: ${g.nilai}</span>
            <span>Tanggal: ${g.tanggal}</span>
        </div>
    `).join('');
}

// INISIALISASI DASHBOARD
function initDashboard() {
    updateGreetingAndDate();
    updateStatistics();
    loadRecentTasks();
    loadRecentGrades();
}

// Jalankan saat halaman siap
document.addEventListener('DOMContentLoaded', initDashboard);
