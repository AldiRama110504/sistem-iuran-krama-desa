import React, { createContext, useState, useContext } from 'react';
import axios from 'axios';

const KramaContext = createContext();
const API_URL = 'http://127.0.0.1:8000/api'; // Ganti dengan URL API Anda

export const useKrama = () => useContext(KramaContext);

export const KramaProvider = ({ children }) => {
    const [kramaData, setKramaData] = useState(null);
    const [tagihanDetail, setTagihanDetail] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fungsi untuk mencari Krama dan mendapatkan detail tagihan
    const fetchKramaDetail = async (kramaId) => {
        setIsLoading(true);
        setError(null);
        try {
            // Memanggil endpoint DataKramaController@show
            const response = await axios.get(`${API_URL}/kramas/${kramaId}`); 
            
            setKramaData(response.data);
            
            // Mengambil tagihan aktif yang statusnya 'Belum Lunas' (jika ada)
            const tagihanAktif = response.data.ringkasan_tagihan.filter(
                (t) => t.status !== 'selesai'
            );

            // Kita asumsikan hanya memproses tagihan pertama yang belum lunas
            if (tagihanAktif.length > 0) {
                setTagihanDetail(tagihanAktif[0]);
            } else {
                setTagihanDetail(null); // Semua lunas
            }

        } catch (err) {
            setError('Gagal mengambil data Krama. ID mungkin tidak valid.');
            setKramaData(null);
            setTagihanDetail(null);
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };
    
    // Fungsi untuk memproses pembayaran
    const processPayment = async (tagihanId, jumlah) => {
        setIsLoading(true);
        try {
            // Memanggil endpoint PembayaranController@store
            const response = await axios.post(`${API_URL}/pembayarans`, {
                tagihan_id: tagihanId,
                jumlah: jumlah, // Total tagihan yang harus dibayar
                metode: 'Tunai', // Default, bisa dikembangkan ke QRIS/Transfer
            });
            
            alert(response.data.message);
            // Setelah berhasil, refetch data krama untuk update status
            await fetchKramaDetail(kramaData.krama_id); 
            
        } catch (err) {
            setError('Gagal memproses pembayaran. Cek log konsol.');
            console.error("Payment Error:", err.response ? err.response.data : err);
            alert(`Pembayaran Gagal: ${err.response?.data?.message || 'Terjadi kesalahan.'}`);
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <KramaContext.Provider 
            value={{ kramaData, tagihanDetail, isLoading, error, fetchKramaDetail, processPayment }}
        >
            {children}
        </KramaContext.Provider>
    );
};
