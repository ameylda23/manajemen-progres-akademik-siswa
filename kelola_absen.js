// Data contoh siswa
const dataSiswa = [
    { id: 1, nama: "Ahmad Wijaya", status: "hadir" },
    { id: 2, nama: "Siti Nurhaliza", status: "hadir" },
    { id: 3, nama: "Budi Santoso", status: "sakit" },
    { id: 4, nama: "Dewi Lestari", status: "izin" },
    { id: 5, nama: "Rizki Pratama", status: "alpha" },
    { id: 6, nama: "Maya Sari", status: "hadir" },
    { id: 7, nama: "Fajar Nugroho", status: "hadir" },
    { id: 8, nama: "Citra Dewi", status: "sakit" },
    { id: 9, nama: "Hendra Setiawan", status: "hadir" },
    { id: 10, nama: "Lina Marlina", status: "izin" }
];

// Fungsi untuk menampilkan data siswa ke tabel
function tampilkanDataSiswa() {
    const tableBody = document.getElementById('siswaTableBody');
    tableBody.innerHTML = '';

    dataSiswa.forEach((siswa, index) => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${siswa.nama}</td>
            <td>
                <select class="status-select status-${siswa.status}" 
                        data-id="${siswa.id}" 
                        onchange="ubahStatus(${siswa.id}, this.value)">
                    <option value="hadir" ${siswa.status === 'hadir' ? 'selected' : ''}>Hadir</option>
                    <option value="sakit" ${siswa.status === 'sakit' ? 'selected' : ''}>Sakit</option>
                    <option value="izin" ${siswa.status === 'izin' ? 'selected' : ''}>Izin</option>
                    <option value="alpha" ${siswa.status === 'alpha' ? 'selected' : ''}>Alpha</option>
                </select>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
}

// Fungsi untuk mengubah status kehadiran
function ubahStatus(idSiswa, statusBaru) {
    const siswa = dataSiswa.find(s => s.id === idSiswa);
    if (siswa) {
        siswa.status = statusBaru;
        
        // Update class pada select element
        const selectElement = document.querySelector(`select[data-id="${idSiswa}"]`);
        if (selectElement) {
            selectElement.className = `status-select status-${statusBaru}`;
        }

        console.log(`Status ${siswa.nama} diubah menjadi: ${statusBaru}`);
    }
}

// Fungsi untuk menyimpan perubahan
function simpanPerubahan() {
    // Simulasi penyimpanan data
    console.log('Menyimpan data absensi:', dataSiswa);
    
    // Tampilkan pesan sukses
    alert('Data absensi berhasil disimpan!');
    
    // Di aplikasi nyata, di sini akan ada kode untuk mengirim data ke server
    // Contoh: fetch('/api/simpan-absen', { method: 'POST', body: JSON.stringify(dataSiswa) })
}

// Fungsi untuk inisialisasi
function init() {
    tampilkanDataSiswa();
    
    // Event listener untuk tombol simpan
    document.getElementById('simpanBtn').addEventListener('click', simpanPerubahan);
    
    console.log('Aplikasi absensi siswa siap digunakan');
}

// Jalankan inisialisasi ketika halaman dimuat
document.addEventListener('DOMContentLoaded', init);

// Fungsi tambahan untuk menambah siswa baru (opsional)
function tambahSiswa(nama) {
    const idBaru = Math.max(...dataSiswa.map(s => s.id)) + 1;
    dataSiswa.push({
        id: idBaru,
        nama: nama,
        status: 'hadir'
    });
    tampilkanDataSiswa();
}

// Fungsi untuk menghapus siswa (opsional)
function hapusSiswa(idSiswa) {
    const index = dataSiswa.findIndex(s => s.id === idSiswa);
    if (index !== -1) {
        dataSiswa.splice(index, 1);
        tampilkanDataSiswa();
    }
}

// Export fungsi untuk penggunaan di console browser (opsional)
window.tambahSiswa = tambahSiswa;
window.hapusSiswa = hapusSiswa;