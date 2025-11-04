import React, { createContext, useState, useContext } from 'react';
// Hapus import axios karena sudah dipindah ke service
// import axios from 'axios'; 

// IMPORT SERVICE BARU
import kramaService from '../services/kramaService'; 

const KramaContext = createContext();

export const useKrama = () => useContext(KramaContext);

export const KramaProvider = ({ children }) => {
    const [kramaData, setKramaData] = useState(null);
    const [tagihanDetail, setTagihanDetail] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // --- FUNGSI MENGGUNAKAN SERVICE BARU ---

    /**
     * Fungsi untuk mencari Krama berdasarkan ID atau NIK dan mendapatkan detail tagihan aktif.
     * @param {string|number} nikOrId ID Krama atau NIK
     */
    const fetchKramaDetail = async (nikOrId) => {
        setIsLoading(true);
        setError(null);
        setKramaData(null);
        setTagihanDetail(null);

        try {
            // Panggil fungsi service, bukan axios langsung
            // Asumsi service mengembalikan { krama: {...}, tagihan_aktif: {...} }
            const data = await kramaService.fetchKramaDetail(nikOrId);
            
            setKramaData(data.krama);
            setTagihanDetail(data.tagihan_aktif); 
            
            // Catatan: Anda mungkin ingin alert/notifikasi jika tagihan_aktif null/kosong
            
        } catch (err) {
            // Error ditangani di service, di sini kita hanya menampilkan pesan yang dikembalikan
            setError(err.message || "Gagal mencari data Krama.");
        } finally {
            setIsLoading(false);
        }
    };
    
    /**
     * Fungsi untuk memproses pembayaran dan mencatatnya ke database.
     * @param {number} tagihanId ID tagihan yang dibayar
     * @param {number} jumlahPembayaran Jumlah yang dibayarkan
     */
    const processPayment = async (tagihanId, jumlahPembayaran) => {
        setIsLoading(true);
        setError(null);
        
        try {
             // Panggil fungsi service untuk pembayaran
            const paymentResponse = await kramaService.processPayment(tagihanId, jumlahPembayaran);
            
            // Tampilkan pesan sukses dari backend
            alert(paymentResponse.message); 
            
            // **PENTING:** Refresh data Krama setelah pembayaran
            if (kramaData && kramaData.krama_id) {
                 await fetchKramaDetail(kramaData.krama_id);
            } else {
                // Jika kramaData null, tidak bisa refresh.
                // Reset tagihan detail sebagai indikasi pembayaran berhasil.
                setTagihanDetail(null);
            }
            
            return paymentResponse;
            
        } catch (err) {
            // Error ditangani di service, di sini kita hanya menampilkan pesan
            const errorMessage = err.message || "Gagal memproses pembayaran. Cek log konsol.";
            setError(errorMessage);
            alert(`Pembayaran Gagal: ${errorMessage}`);
            throw err; // Re-throw agar bisa ditangkap di komponen yang memanggil (misal untuk modal/loading state)
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <KramaContext.Provider 
            value={{ 
                kramaData, 
                tagihanDetail, 
                isLoading, 
                error, 
                fetchKramaDetail, 
                processPayment 
            }}
        >
            {children}
        </KramaContext.Provider>
    );
};
