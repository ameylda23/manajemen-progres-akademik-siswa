// === guru-nilai.js ===
// Grade management for teacher page — compatible with your data.js (DataManager)

(function () {
    // DOM ids used in your HTML:
    // gradingTableBody, filterClass, filterSubject, filterTask, filterStatus,
    // selectAll, bulkGradeBtn, gradeModal, bulkGradeModal,
    // gradeForm, gradeValue, gradeNotes, cancelGrade, cancelBulkGrade,
    // bulkGradeForm, bulkGradeValue, bulkGradeNotes, selectedStudentsCount,
    // recentGradesList, logoutBtn

    // State
    let currentTeacher = null;
    let students = [];
    let tasks = [];
    let grades = [];
    let filteredTasks = []; // tasks to render (task objects as in data.js)
    let selectedSet = new Set(); // keys like `${task.id}-${student.id}`

    // Helpers
    const $ = (sel) => document.querySelector(sel);
    const $$ = (sel) => Array.from(document.querySelectorAll(sel));
    const byId = (id) => document.getElementById(id);

    // Init on DOM ready
    document.addEventListener('DOMContentLoaded', init);

    function init() {
        // Ensure DataManager exists
        if (!window.DataManager) {
            console.error('DataManager not found. Pastikan data.js telah diload sebelum guru-nilai.js');
            return;
        }

        // load data from DataManager
        currentTeacher = DataManager.getCurrentUser();
        students = DataManager.getAllStudents();
        tasks = DataManager.getTasksByTeacherId(currentTeacher ? currentTeacher.id : null) || [];
        grades = DataManager.getGradesByTeacherId(currentTeacher ? currentTeacher.id : null) || [];

        // auth
        if (!currentTeacher || currentTeacher.role !== 'guru') {
            // jika tidak ada teacher -> redirect ke login.html
            window.location.href = 'login.html';
            return;
        }

        // update header
        const userWelcome = byId('userWelcome');
        const userName = byId('userName');
        if (userWelcome) userWelcome.textContent = `Selamat datang, ${currentTeacher.nama || currentTeacher.name || currentTeacher.email || 'Guru'}!`;
        if (userName) userName.textContent = currentTeacher.nama || currentTeacher.name || currentTeacher.email || 'Guru';

        // populate filters and table
        populateFilters();
        applyFilters(); // sets filteredTasks then render

        // attach global listeners
        attachGlobalListeners();

        // load recent grades area
        renderRecentGrades();
    }

    function attachGlobalListeners() {
        // Filters
        const fIds = ['filterClass', 'filterSubject', 'filterTask', 'filterStatus'];
        fIds.forEach(id => {
            const el = byId(id);
            if (el) el.addEventListener('change', () => {
                // reload tasks from DataManager (in case data changed)
                students = DataManager.getAllStudents();
                tasks = DataManager.getTasksByTeacherId(currentTeacher.id);
                grades = DataManager.getGradesByTeacherId(currentTeacher.id);
                applyFilters();
            });
        });

        // bulk grade button
        const bulkBtn = byId('bulkGradeBtn');
        if (bulkBtn) bulkBtn.addEventListener('click', showBulkGradeModal);

        // select all
        const selectAll = byId('selectAll');
        if (selectAll) selectAll.addEventListener('change', handleSelectAll);

        // logout
        const logoutBtn = byId('logoutBtn');
        if (logoutBtn) logoutBtn.addEventListener('click', () => {
            DataManager.clearCurrentUser();
            window.location.href = 'login.html';
        });

        // modal close by clicking X and cancel buttons and clicking outside
        const gradeModal = byId('gradeModal');
        const bulkModal = byId('bulkGradeModal');

        // grade modal close
        const closeGrade = document.querySelector('#gradeModal .close');
        if (closeGrade) closeGrade.addEventListener('click', () => gradeModal.style.display = 'none');
        const cancelGrade = byId('cancelGrade');
        if (cancelGrade) cancelGrade.addEventListener('click', () => gradeModal.style.display = 'none');

        // bulk modal close
        const closeBulk = document.querySelector('#bulkGradeModal .close');
        if (closeBulk) closeBulk.addEventListener('click', () => bulkModal.style.display = 'none');
        const cancelBulk = byId('cancelBulkGrade');
        if (cancelBulk) cancelBulk.addEventListener('click', () => bulkModal.style.display = 'none');

        // Clicking outside modal closes it
        window.addEventListener('click', (ev) => {
            if (ev.target === gradeModal) gradeModal.style.display = 'none';
            if (ev.target === bulkModal) bulkModal.style.display = 'none';
        });

        // form submissions
        const gradeForm = byId('gradeForm');
        if (gradeForm) gradeForm.addEventListener('submit', handleSingleGradeSubmit);

        const bulkForm = byId('bulkGradeForm');
        if (bulkForm) bulkForm.addEventListener('submit', handleBulkGradeSubmit);
    }

    // Populate filter selects
    function populateFilters() {
        // classes from students
        const classEl = byId('filterClass');
        if (classEl) {
            const classes = [...new Set(students.map(s => s.kelas).filter(Boolean))];
            classEl.innerHTML = `<option value="">Semua Kelas</option>` + classes.map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('');
        }

        // subjects from tasks
        const subjectEl = byId('filterSubject');
        if (subjectEl) {
            // tasks originally may include mataPelajaran
            const teacherTasks = DataManager.getTasksByTeacherId(currentTeacher.id) || [];
            const subjects = [...new Set(teacherTasks.map(t => t.mataPelajaran).filter(Boolean))];
            subjectEl.innerHTML = `<option value="">Semua Mata Pelajaran</option>` + subjects.map(s => `<option value="${escapeHtml(s)}">${escapeHtml(s)}</option>`).join('');
        }

        // tasks list
        const taskEl = byId('filterTask');
        if (taskEl) {
            const teacherTasks = DataManager.getTasksByTeacherId(currentTeacher.id) || [];
            const unique = [...new Map(teacherTasks.map(t => [t.id, t])).values()];
            taskEl.innerHTML = `<option value="">Semua Tugas</option>` + unique.map(t => `<option value="${escapeHtml(t.id)}">${escapeHtml(t.judul)}</option>`).join('');
        }
    }

    // Apply filters and render table
    function applyFilters() {
        const classFilter = byId('filterClass') ? byId('filterClass').value : '';
        const subjectFilter = byId('filterSubject') ? byId('filterSubject').value : '';
        const taskFilter = byId('filterTask') ? byId('filterTask').value : '';
        const statusFilter = byId('filterStatus') ? byId('filterStatus').value : '';

        // Load fresh data each time
        students = DataManager.getAllStudents();
        tasks = DataManager.getTasksByTeacherId(currentTeacher.id) || [];
        grades = DataManager.getGradesByTeacherId(currentTeacher.id) || [];

        // We will create a list of "assignments to grade" — each task entry may belong to a specific student in your data model.
        // In your data.js tasks contain siswaId, so filter those tasks.
        let list = tasks.slice();

        if (classFilter) {
            list = list.filter(task => {
                const s = DataManager.getStudentById(task.siswaId);
                return s && s.kelas === classFilter;
            });
        }

        if (subjectFilter) {
            list = list.filter(task => task.mataPelajaran === subjectFilter);
        }

        if (taskFilter) {
            list = list.filter(task => task.id === taskFilter);
        }

        if (statusFilter) {
            list = list.filter(task => {
                const exists = DataManager.getGradeByStudentAndTask(task.siswaId, task.id);
                if (statusFilter === 'sudah') return !!exists;
                if (statusFilter === 'belum') return !exists;
                return true;
            });
        }

        // sort by tanggalDiberikan desc (newest first) if present
        list.sort((a, b) => {
            const da = a.tanggalDiberikan ? new Date(a.tanggalDiberikan).getTime() : 0;
            const db = b.tanggalDiberikan ? new Date(b.tanggalDiberikan).getTime() : 0;
            return db - da;
        });

        filteredTasks = list;
        renderGradingTable();
    }

    function renderGradingTable() {
        const tbody = byId('gradingTableBody');
        if (!tbody) return;

        if (!filteredTasks || filteredTasks.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="9" class="empty-state">
                        <p>Tidak ada tugas yang perlu dinilai</p>
                    </td>
                </tr>
            `;
            updateSelectedCount();
            updateSelectAllCheckbox();
            return;
        }

        // Build rows
        const rows = filteredTasks.map(task => {
            const student = DataManager.getStudentById(task.siswaId) || { nama: 'Unknown', kelas: '-' };
            const existingGrade = DataManager.getGradeByStudentAndTask(task.siswaId, task.id);
            const isGraded = !!existingGrade;
            const key = `${task.id}-${task.siswaId}`;
            const isSelected = selectedSet.has(key);

            return `
                <tr class="${isGraded ? 'graded' : 'ungraded'}">
                    <td>
                        <input type="checkbox"
                               class="student-checkbox"
                               data-task-id="${escapeHtml(task.id)}"
                               data-student-id="${escapeHtml(task.siswaId)}"
                               ${isSelected ? 'checked' : ''}
                               ${isGraded ? 'disabled' : ''}>
                    </td>
                    <td>${escapeHtml(student.nama)}</td>
                    <td>${escapeHtml(student.kelas || '-')}</td>
                    <td>${escapeHtml(task.judul || '-')}</td>
                    <td>${escapeHtml(task.mataPelajaran || '-')}</td>
                    <td>${escapeHtml(formatDate(task.tanggalDiberikan || task.createdAt || ''))}</td>
                    <td><span class="status-badge ${isGraded ? 'status-graded' : 'status-ungraded'}">${isGraded ? 'Sudah Dinilai' : 'Belum Dinilai'}</span></td>
                    <td>${isGraded ? `<span class="grade-value ${getGradeCssClass(existingGrade.nilai)}">${existingGrade.nilai}</span>` : '-'}</td>
                    <td>${isGraded ? `<button class="btn-edit-grade" data-grade-id="${escapeHtml(existingGrade.id)}" data-task-id="${escapeHtml(task.id)}" data-student-id="${escapeHtml(task.siswaId)}">Edit Nilai</button>` : `<button class="btn-grade-single" data-task-id="${escapeHtml(task.id)}" data-student-id="${escapeHtml(task.siswaId)}">Input Nilai</button>`}</td>
                </tr>
            `;
        }).join('');

        tbody.innerHTML = rows;

        // Attach per-row listeners
        attachTableEventListeners();

        updateSelectAllCheckbox();
        updateSelectedCount();
    }

    function attachTableEventListeners() {
        // student-check change
        $$('.student-checkbox').forEach(cb => {
            cb.removeEventListener('change', onRowCheckboxChange);
            cb.addEventListener('change', onRowCheckboxChange);
        });

        // single grade buttons
        $$('.btn-grade-single').forEach(btn => {
            btn.removeEventListener('click', onClickSingleGrade);
            btn.addEventListener('click', onClickSingleGrade);
        });

        // edit grade buttons
        $$('.btn-edit-grade').forEach(btn => {
            btn.removeEventListener('click', onClickEditGrade);
            btn.addEventListener('click', onClickEditGrade);
        });
    }

    function onRowCheckboxChange(e) {
        const el = e.currentTarget;
        const taskId = el.getAttribute('data-task-id');
        const studentId = el.getAttribute('data-student-id');
        const key = `${taskId}-${studentId}`;
        if (el.checked) selectedSet.add(key);
        else selectedSet.delete(key);
        updateSelectedCount();
        updateSelectAllCheckbox();
    }

    function onClickSingleGrade(e) {
        const btn = e.currentTarget;
        const taskId = btn.getAttribute('data-task-id');
        const studentId = btn.getAttribute('data-student-id');
        showSingleGradeModal(taskId, studentId);
    }

    function onClickEditGrade(e) {
        const btn = e.currentTarget;
        const gradeId = btn.getAttribute('data-grade-id');
        const taskId = btn.getAttribute('data-task-id');
        const studentId = btn.getAttribute('data-student-id');
        // load grade by id from DataManager (grades stored in AppData)
        const allGrades = DataManager.getGradesByTeacherId(currentTeacher.id) || [];
        const gradeObj = allGrades.find(g => g.id === gradeId) || null;
        if (gradeObj) {
            showSingleGradeModal(taskId, studentId, gradeObj);
        } else {
            alert('Data nilai tidak ditemukan.');
        }
    }

    // Select all handling
    function handleSelectAll(e) {
        const checked = e.currentTarget.checked;
        filteredTasks.forEach(task => {
            const key = `${task.id}-${task.siswaId}`;
            const checkbox = document.querySelector(`.student-checkbox[data-task-id="${cssEscape(task.id)}"][data-student-id="${cssEscape(task.siswaId)}"]`);
            if (!checkbox) return;
            if (checkbox.disabled) return; // skip graded rows
            checkbox.checked = checked;
            if (checked) selectedSet.add(key);
            else selectedSet.delete(key);
        });
        updateSelectedCount();
    }

    function updateSelectAllCheckbox() {
        const selectAll = byId('selectAll');
        if (!selectAll) return;
        // only consider checkboxes that are not disabled
        const checkboxes = $$('.student-checkbox').filter(cb => !cb.disabled);
        if (checkboxes.length === 0) {
            selectAll.checked = false;
            selectAll.indeterminate = false;
            return;
        }
        const checkedCount = checkboxes.filter(cb => cb.checked).length;
        selectAll.checked = checkedCount === checkboxes.length;
        selectAll.indeterminate = checkedCount > 0 && checkedCount < checkboxes.length;
    }

    function updateSelectedCount() {
        const el = byId('selectedStudentsCount');
        if (!el) return;
        el.textContent = selectedSet.size;
    }

    // Single grade modal flow. If gradeObj provided -> edit mode
    function showSingleGradeModal(taskId, studentId, gradeObj = null) {
        const modal = byId('gradeModal');
        if (!modal) return;
        const student = DataManager.getStudentById(studentId) || { nama: 'Unknown', kelas: '-' };
        const task = (DataManager.getTasksByTeacherId(currentTeacher.id) || []).find(t => t.id === taskId) || { judul: '-' };

        byId('studentNameModal').textContent = student.nama || '-';
        byId('studentClassModal').textContent = `Kelas: ${student.kelas || '-'}`;
        byId('taskTitleModal').textContent = `Tugas: ${task.judul || '-'}`;
        byId('taskSubjectModal').textContent = `Mata Pelajaran: ${task.mataPelajaran || '-'}`;

        // store metadata on form using dataset
        const gradeForm = byId('gradeForm');
        gradeForm.dataset.taskId = taskId;
        gradeForm.dataset.studentId = studentId;
        gradeForm.dataset.editingGradeId = gradeObj ? gradeObj.id : '';

        // fill values
        const gradeValueEl = byId('gradeValue');
        const gradeNotesEl = byId('gradeNotes');
        if (gradeObj) {
            gradeValueEl.value = gradeObj.nilai;
            gradeNotesEl.value = gradeObj.catatan || '';
        } else {
            gradeValueEl.value = '';
            gradeNotesEl.value = '';
        }

        modal.style.display = 'block';
        gradeValueEl.focus();
    }

    function handleSingleGradeSubmit(e) {
        e.preventDefault();
        const form = e.currentTarget;
        const taskId = form.dataset.taskId;
        const studentId = form.dataset.studentId;
        const editingId = form.dataset.editingGradeId || '';
        const value = Number(byId('gradeValue').value);
        const notes = byId('gradeNotes').value || '';

        if (!DataManager.isValidGrade(value)) {
            alert('Masukkan nilai valid antara 0 dan 100.');
            return;
        }

        const gradeData = {
            siswaId: studentId,
            tugasId: taskId,
            mataPelajaran: (DataManager.getTasksByTeacherId(currentTeacher.id) || []).find(t=>t.id===taskId)?.mataPelajaran || '',
            nilai: value,
            tanggal: new Date().toISOString().slice(0,10),
            catatan: notes,
            guruId: currentTeacher.id
        };

        if (editingId) {
            const updated = DataManager.updateGrade(editingId, gradeData);
            if (updated) {
                showNotification('Nilai berhasil diperbarui.', 'success');
            } else {
                alert('Gagal memperbarui nilai.');
            }
        } else {
            const newGrade = DataManager.addGrade(gradeData);
            if (newGrade) {
                showNotification('Nilai berhasil disimpan.', 'success');
            } else {
                alert('Gagal menyimpan nilai.');
            }
            // Remove the task from selection since now graded
            const key = `${taskId}-${studentId}`;
            selectedSet.delete(key);
        }

        // refresh local state and UI
        tasks = DataManager.getTasksByTeacherId(currentTeacher.id);
        grades = DataManager.getGradesByTeacherId(currentTeacher.id);
        applyFilters();
        renderRecentGrades();

        // hide modal
        const modal = byId('gradeModal');
        if (modal) modal.style.display = 'none';
    }

    // Edit grade: handled via showSingleGradeModal with grade object

    // Bulk grading
    function showBulkGradeModal() {
        // only proceed if at least one selected
        if (selectedSet.size === 0) {
            alert('Pilih sedikitnya 1 siswa untuk input nilai massal.');
            return;
        }

        const modal = byId('bulkGradeModal');
        if (!modal) return;
        // show count
        updateSelectedCount();
        modal.style.display = 'block';
    }

    function handleBulkGradeSubmit(e) {
        e.preventDefault();
        const value = Number(byId('bulkGradeValue').value);
        const notes = byId('bulkGradeNotes').value || '';

        if (!DataManager.isValidGrade(value)) {
            alert('Masukkan nilai valid antara 0 dan 100.');
            return;
        }

        // For each selected key -> addGrade
        const toProcess = Array.from(selectedSet);
        toProcess.forEach(key => {
            const [taskId, studentId] = key.split('-');
            if (!taskId || !studentId) return;
            // skip if already graded
            const exists = DataManager.getGradeByStudentAndTask(studentId, taskId);
            if (exists) {
                // update existing
                DataManager.updateGrade(exists.id, {
                    siswaId: studentId,
                    tugasId: taskId,
                    mataPelajaran: (DataManager.getTasksByTeacherId(currentTeacher.id) || []).find(t=>t.id===taskId)?.mataPelajaran || '',
                    nilai: value,
                    tanggal: new Date().toISOString().slice(0,10),
                    catatan: notes,
                    guruId: currentTeacher.id
                });
            } else {
                DataManager.addGrade({
                    siswaId: studentId,
                    tugasId: taskId,
                    mataPelajaran: (DataManager.getTasksByTeacherId(currentTeacher.id) || []).find(t=>t.id===taskId)?.mataPelajaran || '',
                    nilai: value,
                    tanggal: new Date().toISOString().slice(0,10),
                    catatan: notes,
                    guruId: currentTeacher.id
                });
            }
            // after processing remove from selection so it doesn't remain selected next render
            selectedSet.delete(key);
        });

        // refresh data and UI
        tasks = DataManager.getTasksByTeacherId(currentTeacher.id);
        grades = DataManager.getGradesByTeacherId(currentTeacher.id);
        applyFilters();
        renderRecentGrades();

        const modal = byId('bulkGradeModal');
        if (modal) modal.style.display = 'none';
        showNotification('Nilai massal tersimpan.', 'success');
    }

    // Recent grades list
    function renderRecentGrades() {
        const listEl = byId('recentGradesList');
        if (!listEl) return;
        const teacherGrades = DataManager.getGradesByTeacherId(currentTeacher.id) || [];
        if (!teacherGrades.length) {
            listEl.innerHTML = `<div class="empty-state"><p>Belum ada nilai yang diberikan</p></div>`;
            return;
        }

        // show last 8 grades
        const sorted = teacherGrades.slice().sort((a,b)=> new Date(b.createdAt || b.tanggal || 0) - new Date(a.createdAt || a.tanggal || 0)).slice(0,8);
        listEl.innerHTML = sorted.map(g => {
            const student = DataManager.getStudentById(g.siswaId) || { nama: 'Unknown' };
            const task = (DataManager.getTasksByTeacherId(currentTeacher.id) || []).find(t => t.id === g.tugasId) || {};
            return `
                <div class="recent-grade-item">
                    <div class="recent-grade-left">
                        <div class="student-name">${escapeHtml(student.nama)}</div>
                        <div class="task-title">${escapeHtml(task.judul || '-')}</div>
                    </div>
                    <div class="recent-grade-right">
                        <div class="grade ${getGradeCssClass(g.nilai)}">${g.nilai}</div>
                        <div class="grade-date">${escapeHtml(g.tanggal || (g.createdAt ? g.createdAt.slice(0,10) : '-'))}</div>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Utility: formatDate to readable (YYYY-MM-DD -> DD MMM YYYY)
    function formatDate(d) {
        if (!d) return '-';
        try {
            const dt = new Date(d);
            if (isNaN(dt)) return d;
            const opts = { day: '2-digit', month: 'short', year: 'numeric' };
            return dt.toLocaleDateString('id-ID', opts);
        } catch (e) {
            return d;
        }
    }

    function getGradeCssClass(score) {
        if (score >= 85) return 'grade-excellent';
        if (score >= 70) return 'grade-good';
        if (score >= 60) return 'grade-average';
        if (score >= 50) return 'grade-poor';
        return 'grade-fail';
    }

    // Small helper to escape HTML
    function escapeHtml(text) {
        if (text === null || text === undefined) return '';
        return String(text)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    // CSS safe selector escape for querySelector (basic)
    function cssEscape(s) {
        if (!s) return s;
        return s.replace(/(["'\\])/g, '\\$1');
    }

    // Small notification helper (non-blocking)
    function showNotification(msg, type = 'info') {
        // Try to use an element if exists, else fallback to alert
        // We'll attempt to find a .notification area; if none, use alert
        const area = document.querySelector('.notification-area');
        if (area) {
            const note = document.createElement('div');
            note.className = `notif ${type}`;
            note.textContent = msg;
            area.appendChild(note);
            setTimeout(()=> note.remove(), 3500);
        } else {
            // non-blocking fallback
            console.log(`${type.toUpperCase()}: ${msg}`);
        }
    }

    // Expose a small API for debugging (optional)
    window.TeacherGradeUI = {
        refresh: () => {
            students = DataManager.getAllStudents();
            tasks = DataManager.getTasksByTeacherId(currentTeacher.id);
            grades = DataManager.getGradesByTeacherId(currentTeacher.id);
            populateFilters();
            applyFilters();
            renderRecentGrades();
        }
    };

})();
