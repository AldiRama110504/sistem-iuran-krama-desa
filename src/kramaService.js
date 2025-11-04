import axios from 'axios';

// ==========================================================
// KONFIGURASI AXIOS UTAMA
// ==========================================================

// Ganti BASE_URL ini dengan URL API Laravel Anda
// Jika Anda sudah deploy Laravel, ganti dengan URL produksi (misalnya: https://api-desa-saya.com/api)
const BASE_URL = 'http://localhost:8000/api'; 

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// ==========================================================
// SERVICE FUNCTIONS UNTUK MENGHUBUNGKAN REACT KE LARAVEL
// ==========================================================

const kramaService = {
    /**
     * Mengambil detail Krama dan tagihan aktif berdasarkan NIK atau ID Tagihan.
     * Menggunakan endpoint: GET /api/kramas/{nikOrId}
     * * @param {string} nikOrId NIK Krama atau ID Tagihan
     * @returns {object} Data Krama, detail tagihan, dan status
     */
    async fetchKramaDetail(nikOrId) {
        if (!nikOrId) {
            throw new Error("NIK atau ID Tagihan tidak boleh kosong.");
        }
        try {
            // Kita gunakan endpoint GET /api/kramas/{id}
            const response = await api.get(`/kramas/${nikOrId}`);
            
            // Logika response disesuaikan dengan format JSON dari DataKramaController@show
            return response.data;

        } catch (error) {
            console.error("Error fetching Krama details:", error.response || error);
            // Melemparkan pesan error yang lebih spesifik
            const errorMessage = error.response?.data?.message || "Gagal menghubungi server API.";
            throw new Error(errorMessage);
        }
    },

    /**
     * Memproses pembayaran tagihan.
     * Menggunakan endpoint: POST /api/pembayarans
     * * @param {number} tagihanId ID dari Tagihan yang dibayar
     * @param {number} jumlahPembayaran Total uang yang dibayarkan
     * @returns {object} Data Pembayaran yang berhasil dicatat
     */
    async processPayment(tagihanId, jumlahPembayaran) {
        if (!tagihanId || !jumlahPembayaran || jumlahPembayaran <= 0) {
            throw new Error("Data pembayaran tidak lengkap.");
        }
        try {
            const payload = {
                tagihan_id: tagihanId,
                jumlah: jumlahPembayaran,
                metode: 'Transfer Bank', // Bisa diubah/dipilih di frontend nanti
                keterangan: 'tertunda', // Status awal, nanti Admin yang mengubah ke 'selesai'
                payment_by: 1, // Diisi sementara dengan ID Admin 1, nanti akan diubah dengan Auth
            };

            const response = await api.post('/pembayarans', payload);
            return response.data;
            
        } catch (error) {
            console.error("Error processing payment:", error.response || error);
            const errorMessage = error.response?.data?.message || "Gagal memproses pembayaran. Periksa Tagihan ID.";
            throw new Error(errorMessage);
        }
    },
};

export default kramaService;