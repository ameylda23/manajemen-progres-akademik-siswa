// guru.js - Teacher Dashboard for MyClassProgress

// Global variables
let currentUser = null;
let students = [];
let tasks = [];
let grades = [];
let teachers = [];

// Initialize teacher dashboard
document.addEventListener('DOMContentLoaded', function() {
    initializeTeacherApp();
});

function initializeTeacherApp() {
    loadDataFromStorage();
    checkTeacherAuthentication();
    setupEventListeners();
    loadTeacherDashboard();
}

function loadDataFromStorage() {
    students = JSON.parse(localStorage.getItem('students')) || [];
    tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    grades = JSON.parse(localStorage.getItem('grades')) || [];
    teachers = JSON.parse(localStorage.getItem('teachers')) || [];
    
    currentUser = JSON.parse(localStorage.getItem('currentUser'));
}

function checkTeacherAuthentication() {
    if (!currentUser || currentUser.role !== 'guru') {
        window.location.href = 'login.html';
        return;
    }
    updateUIWithTeacherData();
}

function updateUIWithTeacherData() {
    // Update user info in header
    const userWelcome = document.getElementById('userWelcome');
    const userName = document.getElementById('userName');
    
    if (userWelcome) userWelcome.textContent = `Selamat datang, ${currentUser.nama}!`;
    if (userName) userName.textContent = currentUser.nama;
    
    updateGreeting();
    updateDate();
}

function setupEventListeners() {
    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    // Add task button
    const addTaskBtn = document.getElementById('addTaskBtn');
    if (addTaskBtn) {
        addTaskBtn.addEventListener('click', showAddTaskModal);
    }
    
    // Task form submission
    const taskForm = document.getElementById('taskForm');
    if (taskForm) {
        taskForm.addEventListener('submit', handleAddTask);
    }
    
    // Modal close buttons
    setupModalEventListeners();
    
    // Action cards
    setupActionCards();
}

function handleLogout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'login.html';
}

function updateGreeting() {
    const greetingElement = document.getElementById('greetingText');
    if (!greetingElement) return;
    
    const hour = new Date().getHours();
    let greeting = '';
    
    if (hour < 12) greeting = 'Selamat Pagi';
    else if (hour < 15) greeting = 'Selamat Siang';
    else if (hour < 19) greeting = 'Selamat Sore';
    else greeting = 'Selamat Malam';
    
    greetingElement.textContent = greeting;
}

function updateDate() {
    const dateElement = document.getElementById('dateDisplay');
    if (!dateElement) return;
    
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    dateElement.textContent = now.toLocaleDateString('id-ID', options);
}

function loadTeacherDashboard() {
    updateTeacherStatistics();
    loadRecentGivenTasks();
    loadTasksToGrade();
    loadTopStudents();
}

function updateTeacherStatistics() {
    const teacherTasks = tasks.filter(task => task.guruId === currentUser.id);
    const teacherGrades = grades.filter(grade => grade.guruId === currentUser.id);
    
    const totalTugasDiberikan = teacherTasks.length;
    const totalSiswa = students.length;
    
    // Calculate ungraded tasks
    const tasksToGrade = teacherTasks.filter(task => {
        const taskGrade = grades.find(grade => grade.tugasId === task.id);
        return !taskGrade;
    }).length;
    
    updateElementText('totalTugasDiberikan', totalTugasDiberikan);
    updateElementText('totalSiswa', totalSiswa);
    updateElementText('tugasBelumDinilai', tasksToGrade);
}

function loadRecentGivenTasks() {
    const container = document.getElementById('recentGivenTasks');
    if (!container) return;
    
    const teacherTasks = tasks.filter(task => task.guruId === currentUser.id);
    const recentTasks = teacherTasks
        .sort((a, b) => new Date(b.tanggalDiberikan) - new Date(a.tanggalDiberikan))
        .slice(0, 5);
    
    if (recentTasks.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>Belum ada tugas yang diberikan</p></div>';
        return;
    }
    
    container.innerHTML = recentTasks.map(task => {
        const completedCount = tasks.filter(t => 
            t.id === task.id && t.status === 'selesai'
        ).length;
        
        const totalStudents = students.filter(s => s.kelas === task.kelas).length;
        
        return `
            <div class="task-item">
                <div class="task-info">
                    <h4 class="task-title">${task.judul}</h4>
                    <p class="task-subject">${task.mataPelajaran} - ${task.kelas}</p>
                    <span class="task-deadline">Batas: ${formatDate(task.tenggatWaktu)}</span>
                    <span class="task-progress">${completedCount}/${totalStudents} siswa selesai</span>
                </div>
                <div class="task-status">
                    ${getTaskProgress(completedCount, totalStudents)}
                </div>
            </div>
        `;
    }).join('');
}

function loadTasksToGrade() {
    const container = document.getElementById('tasksToGrade');
    if (!container) return;
    
    const teacherTasks = tasks.filter(task => task.guruId === currentUser.id);
    const tasksNeedingGrading = teacherTasks.filter(task => {
        const taskGrades = grades.filter(grade => grade.tugasId === task.id);
        return taskGrades.length === 0;
    }).slice(0, 5);
    
    if (tasksNeedingGrading.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>Tidak ada tugas yang perlu dinilai</p></div>';
        return;
    }
    
    container.innerHTML = tasksNeedingGrading.map(task => {
        const studentCount = students.filter(s => s.kelas === task.kelas).length;
        const submittedCount = tasks.filter(t => 
            t.id === task.id && t.status === 'selesai'
        ).length;
        
        return `
            <div class="task-item urgent">
                <div class="task-info">
                    <h4 class="task-title">${task.judul}</h4>
                    <p class="task-subject">${task.mataPelajaran} - ${task.kelas}</p>
                    <span class="task-deadline">${submittedCount}/${studentCount} siswa mengumpulkan</span>
                </div>
                <div class="task-actions">
                    <button class="btn-grade-now" onclick="gradeTask('${task.id}')">
                        Nilai Sekarang
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function loadTopStudents() {
    const container = document.getElementById('topStudents');
    if (!container) return;
    
    const teacherGrades = grades.filter(grade => grade.guruId === currentUser.id);
    
    if (teacherGrades.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>Belum ada data performa siswa</p></div>';
        return;
    }
    
    const studentAverages = {};
    teacherGrades.forEach(grade => {
        if (!studentAverages[grade.siswaId]) {
            studentAverages[grade.siswaId] = { total: 0, count: 0 };
        }
        studentAverages[grade.siswaId].total += grade.nilai;
        studentAverages[grade.siswaId].count++;
    });
    
    const topStudents = Object.keys(studentAverages)
        .map(siswaId => {
            const student = students.find(s => s.id === siswaId);
            const average = studentAverages[siswaId].total / studentAverages[siswaId].count;
            return { student, average, taskCount: studentAverages[siswaId].count };
        })
        .filter(item => item.student)
        .sort((a, b) => b.average - a.average)
        .slice(0, 5);
    
    container.innerHTML = topStudents.map((item, index) => {
        const student = item.student;
        return `
            <div class="performance-item">
                <div class="rank">#${index + 1}</div>
                <div class="student-info">
                    <h4>${student.nama}</h4>
                    <p>${student.kelas} • ${item.taskCount} tugas</p>
                </div>
                <div class="performance-score ${getGradeColor(item.average)}">
                    ${item.average.toFixed(1)}
                </div>
            </div>
        `;
    }).join('');
}

function setupActionCards() {
    const actionCards = document.querySelectorAll('.action-card');
    actionCards.forEach(card => {
        card.addEventListener('click', function() {
            const action = this.querySelector('h3').textContent;
            handleActionCardClick(action);
        });
    });
}

function handleActionCardClick(action) {
    switch(action) {
        case 'Input Nilai':
            window.location.href = 'guru-nilai.html';
            break;
        case 'Tambah Tugas':
            showAddTaskModal();
            break;
        case 'Laporan Kelas':
            showClassReport();
            break;
        case 'Kelola Siswa':
            showStudentManagement();
            break;
    }
}

function showAddTaskModal() {
    const modal = document.getElementById('taskModal');
    if (modal) {
        modal.style.display = 'block';
        resetTaskForm();
    }
}

function setupModalEventListeners() {
    const taskModal = document.getElementById('taskModal');
    const closeTaskModal = document.querySelector('#taskModal .close');
    const cancelTask = document.getElementById('cancelTask');
    
    if (closeTaskModal) {
        closeTaskModal.addEventListener('click', () => {
            taskModal.style.display = 'none';
        });
    }
    
    if (cancelTask) {
        cancelTask.addEventListener('click', () => {
            taskModal.style.display = 'none';
        });
    }
    
    window.addEventListener('click', (event) => {
        if (event.target === taskModal) {
            taskModal.style.display = 'none';
        }
    });
}

function resetTaskForm() {
    const form = document.getElementById('taskForm');
    if (form) {
        form.reset();
        const defaultDeadline = new Date();
        defaultDeadline.setDate(defaultDeadline.getDate() + 7);
        document.getElementById('taskDeadline').value = defaultDeadline.toISOString().split('T')[0];
    }
}

function handleAddTask(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    
    const taskData = {
        id: generateTaskId(),
        judul: formData.get('taskTitle') || document.getElementById('taskTitle').value,
        deskripsi: formData.get('taskDescription') || document.getElementById('taskDescription').value,
        mataPelajaran: formData.get('taskSubject') || document.getElementById('taskSubject').value,
        guruId: currentUser.id,
        tanggalDiberikan: new Date().toISOString().split('T')[0],
        tenggatWaktu: formData.get('taskDeadline') || document.getElementById('taskDeadline').value,
        kelas: formData.get('taskClass') || document.getElementById('taskClass').value,
        status: 'belum'
    };
    
    if (!taskData.judul || !taskData.mataPelajaran || !taskData.tenggatWaktu || !taskData.kelas) {
        showNotification('Harap isi semua field yang diperlukan', 'error');
        return;
    }
    
    const classStudents = students.filter(student => student.kelas === taskData.kelas);
    const newTasks = classStudents.map(student => ({
        ...taskData,
        siswaId: student.id,
        id: generateTaskId()
    }));
    
    tasks.push(...newTasks);
    localStorage.setItem('tasks', JSON.stringify(tasks));
    
    document.getElementById('taskModal').style.display = 'none';
    showNotification(`Tugas berhasil dibuat untuk ${classStudents.length} siswa`, 'success');
    
    loadTeacherDashboard();
}

function generateTaskId() {
    return 'T' + Date.now() + Math.random().toString(36).substr(2, 9);
}

function gradeTask(taskId) {
    window.location.href = `guru-nilai.html?task=${taskId}`;
}

function getTaskProgress(completed, total) {
    const percentage = total > 0 ? (completed / total) * 100 : 0;
    
    if (percentage === 0) return `<span class="progress-low">0%</span>`;
    if (percentage < 50) return `<span class="progress-medium">${Math.round(percentage)}%</span>`;
    if (percentage < 80) return `<span class="progress-high">${Math.round(percentage)}%</span>`;
    return `<span class="progress-complete">${Math.round(percentage)}%</span>`;
}

function showClassReport() {
    const teacherTasks = tasks.filter(task => task.guruId === currentUser.id);
    const teacherGrades = grades.filter(grade => grade.guruId === currentUser.id);
    
    if (teacherGrades.length === 0) {
        showNotification('Belum ada data nilai untuk membuat laporan', 'info');
        return;
    }
    
    const classStats = calculateClassStatistics();
    
    const report = `
LAPORAN KELAS - ${currentUser.mataPelajaran || ''}

Total Tugas Diberikan: ${teacherTasks.length}
Total Nilai Dimasukkan: ${teacherGrades.length}
Rata-rata Kelas: ${classStats.average.toFixed(1)}
Nilai Tertinggi: ${classStats.highest}
Nilai Terendah: ${classStats.lowest}

Siswa Terbaik:
${classStats.topStudents.map((student, index) => `${index + 1}. ${student.nama} - ${student.average.toFixed(1)}`).join('\n')}
    `;
    
    alert(report);
}

function calculateClassStatistics() {
    const teacherGrades = grades.filter(grade => grade.guruId === currentUser.id);
    const studentAverages = {};
    
    teacherGrades.forEach(grade => {
        if (!studentAverages[grade.siswaId]) {
            studentAverages[grade.siswaId] = { total: 0, count: 0 };
        }
        studentAverages[grade.siswaId].total += grade.nilai;
        studentAverages[grade.siswaId].count++;
    });
    
    const averagesArray = Object.keys(studentAverages)
        .map(siswaId => {
            const student = students.find(s => s.id === siswaId);
            const average = studentAverages[siswaId].total / studentAverages[siswaId].count;
            return { nama: student ? student.nama : 'Unknown', average };
        })
        .sort((a, b) => b.average - a.average);
    
    const allGrades = teacherGrades.map(grade => grade.nilai);
    const average = allGrades.reduce((sum, grade) => sum + grade, 0) / allGrades.length;
    const highest = Math.max(...allGrades);
    const lowest = Math.min(...allGrades);
    
    return { average, highest, lowest, topStudents: averagesArray.slice(0, 3) };
}

function showStudentManagement() {
    showNotification('Fitur manajemen siswa akan segera tersedia', 'info');
}

function updateElementText(elementId, text) {
    const element = document.getElementById(elementId);
    if (element) element.textContent = text;
}

function formatDate(dateString) {
    if (!dateString) return '-';
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
}

function getGradeColor(score) {
    if (score >= 85) return 'grade-excellent';
    if (score >= 70) return 'grade-good';
    if (score >= 60) return 'grade-average';
    return 'grade-poor';
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button class="notification-close">&times;</button>
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background: ${type === 'success' ? '#d4edda' : type === 'error' ? '#f8d7da' : '#d1ecf1'};
        color: ${type === 'success' ? '#155724' : type === 'error' ? '#721c24' : '#0c5460'};
        border: 1px solid ${type === 'success' ? '#c3e6cb' : type === 'error' ? '#f5c6cb' : '#bee5eb'};
        border-radius: 5px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 10px;
        max-width: 400px;
    `;
    
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.style.cssText = `
        background: none;
        border: none;
        font-size: 18px;
        cursor: pointer;
        padding: 0;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
    `;
    
    closeBtn.addEventListener('click', () => {
        notification.remove();
    });
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentNode) notification.remove();
    }, 5000);
}

// Export for global access
window.TeacherApp = {
    loadTeacherDashboard,
    showAddTaskModal,
    gradeTask
};
function showModalTugas() {
    const modal = document.getElementById('modalTugas');
    const form = document.getElementById('formTugas');
    
    // Reset form
    form.reset();
    
    // Set tanggal minimal ke hari ini
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('deadlineInput').min = today;
    
    modal.style.display = 'block';
    
    // Reset handler untuk tambah tugas
    form.onsubmit = (e) => {
        e.preventDefault();
        handleTambahTugas(e);
    };
}



function handleTambahTugas(e) {
    e.preventDefault(); // Pastikan form tidak reload halaman

    // Ambil data user guru (pastikan disimpan di localStorage atau global variable)
    const currentUser = JSON.parse(localStorage.getItem('currentUser')) || {};

    const newTugas = {
        id: Date.now(),
        judul: document.getElementById('judulTugas').value.trim(),
        mataPelajaran: document.getElementById('mataPelajaranSelect').value,
        deskripsi: document.getElementById('deskripsiTugas').value.trim(),
        kelas: document.getElementById('kelasSelect').value,
        deadline: document.getElementById('deadlineInput').value,
        jenisTugas: document.getElementById('jenisTugasSelect').value,
        bobotNilai: parseInt(document.getElementById('bobotNilai').value) || 10,
        status: 'belum selesai',
        guru: currentUser.nama || "Guru",
        tanggalDibuat: new Date().toISOString().split('T')[0]
    };

    // Simpan tugas
    DataManager.addTugas(newTugas);

    // Tutup modal
    document.getElementById('modalTugas').style.display = 'none';

    // Reload data tampilan
    if (typeof loadTugasData === "function") loadTugasData();
    if (typeof loadOverviewStats === "function") loadOverviewStats();

    AMS.showNotification('Tugas berhasil ditambahkan!', 'success');
}
