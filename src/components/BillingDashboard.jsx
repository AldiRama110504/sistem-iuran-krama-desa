import React, { useState, useEffect, useRef } from 'react'; // Import useRef
import { useKrama } from '../context/KramaContext';
import { 
    Search, MapPin, CheckCircle, Bell, Settings,
    Leaf, Key, Coins, CreditCard, User, Zap 
} from 'lucide-react'; 

// Fungsi pembantu untuk format Rupiah
const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(number);
};

// Palet warna nuansa Bali yang disempurnakan
const COLORS = {
    // Header & Background utama
    HEADER_BG: 'bg-[#1A3620]', // Hijau zaitun gelap
    
    // Card & Elemen UI - Dibuat lebih transparan
    // BACKGROUND KONTEN UTAMA: Gunakan opacity rendah dan blur yang ditingkatkan
    CARD_BG_OPACITY: 'bg-[#294B2E] bg-opacity-70 backdrop-blur-md', // Opacity 70%
    
    // Warna Aksen
    BORDER_ACCENT: 'border-[#DAA520]', // Emas
    TEXT_PRIMARY: 'text-gray-100', // Teks utama
    TEXT_SECONDARY: 'text-gray-300', // Teks sekunder
    ICON_ACCENT: 'text-[#DAA520]', // Emas untuk ikon
    BUTTON_PRIMARY_BG: 'bg-[#DAA520]', // Emas untuk tombol Konfirmasi & Checkout
    BUTTON_PRIMARY_HOVER: 'hover:bg-[#C5921E]',
    
    // Input/Search
    INPUT_BG: 'bg-[#3A5D40] bg-opacity-50', // Input lebih transparan
    INPUT_BORDER: 'border-[#5A7E60]',
    SEARCH_BTN_BG: 'bg-[#4CAF50]', 
    SEARCH_BTN_HOVER: 'hover:bg-[#45A049]',
    
    SUCCESS_STATUS: 'bg-green-600',
    PENDING_STATUS: 'bg-red-600',
};

// --- Komponen Notifikasi Sederhana ---
const Notification = ({ message, type, onClose }) => {
    if (!message) return null;

    const baseStyle = "fixed top-5 right-5 p-4 rounded-lg shadow-xl text-white font-semibold z-50 transition-all duration-300 transform translate-x-0";
    const typeStyle = type === 'error' 
        ? 'bg-red-600' 
        : 'bg-green-600';

    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 5000);
        return () => clearTimeout(timer);
    }, [message, onClose]);

    return (
        <div className={`${baseStyle} ${typeStyle}`}>
            {message}
            <button className="ml-4 font-bold" onClick={onClose}>
                &times;
            </button>
        </div>
    );
};
// --- END Notifikasi ---


const BillingDashboard = () => {
    const [kramaIdInput, setKramaIdInput] = useState('');
    const { kramaData, tagihanDetail, isLoading, error, fetchKramaDetail, processPayment } = useKrama();
    const [notification, setNotification] = useState({ message: '', type: '' }); 
    
    // REFF untuk input pencarian utama
    const searchInputRef = useRef(null); 

    const totalTagihanAktif = tagihanDetail 
        ? tagihanDetail.jenis_iuran.iuran + tagihanDetail.jenis_iuran.dedosar + tagihanDetail.jenis_iuran.peturunan
        : 0;

    useEffect(() => {
        if (error) {
            setNotification({ message: error, type: 'error' });
        }
    }, [error]);

    const handleSearch = (e) => {
        e.preventDefault();
        setNotification({ message: '', type: '' });
        if (!kramaIdInput.trim()) {
            setNotification({ message: 'Mohon masukkan ID atau NIK Krama.', type: 'error' });
            return;
        }
        fetchKramaDetail(kramaIdInput);
    };

    const handleCheckout = async () => {
        setNotification({ message: '', type: '' });
        if (!tagihanDetail || totalTagihanAktif === 0) {
            setNotification({ message: "Tidak ada tagihan aktif yang harus dibayar.", type: 'error' });
            return;
        }
        
        const confirmPayment = window.confirm(`Konfirmasi pembayaran ${formatRupiah(totalTagihanAktif)} untuk tagihan ID ${tagihanDetail.tagihan_id}?`);
        
        if (confirmPayment) {
             try {
                 // Pembayaran sudah diproses di KramaContext.jsx
                 await processPayment(tagihanDetail.tagihan_id, totalTagihanAktif);
                 setNotification({ message: 'Pembayaran berhasil dicatat!', type: 'success' });
             } catch (e) {
                 const msg = e.response?.data?.message || 'Gagal memproses pembayaran.';
                 setNotification({ message: msg, type: 'error' });
             }
        }
    };
    
    // Fungsionalitas: Klik ikon search di header, fokus ke input utama
    const handleHeaderSearchClick = () => {
        searchInputRef.current.focus();
    };
    
    // --- Header Komponen ---
    const Header = () => (
        <header className={`py-4 px-4 md:px-6 shadow-lg ${COLORS.HEADER_BG} ${COLORS.TEXT_PRIMARY} sticky top-0 z-10`}>
            <div className="flex justify-between items-center max-w-7xl mx-auto">
                <div className="flex items-center space-x-2 md:space-x-3">
                    {/* LOGO: Ganti dengan path logo Anda */}
                    {/* Anda perlu menempatkan file logo Anda (misalnya logo.png) di folder 'public' */}
                    <img 
                        src="/logo.png" // Ganti '/logo.png' dengan path file logo Anda
                        alt="Logo Krama Desa" 
                        className="w-6 h-6 md:w-8 md:h-8" 
                        onError={(e) => { e.target.onerror = null; e.target.src="https://cdn-icons-png.flaticon.com/128/4093/4093155.png" }}
                    />
                    {/* Warna teks emas pada judul */}
                    <h1 className={`text-lg md:text-xl font-bold tracking-wider font-['Playfair_Display'] ${COLORS.ICON_ACCENT}`}>
                        Sistem Iuran Krama Desa
                    </h1>
                </div>
                <div className="flex items-center space-x-4">
                    {/* Tombol Search di Header (Berfungsi) */}
                    <button 
                        onClick={handleHeaderSearchClick}
                        className="p-2 rounded-full hover:bg-green-700 transition"
                    >
                        <Search className="w-5 h-5" />
                    </button>
                    <div className="flex items-center space-x-2">
                        {/* Nama di kanan diganti menjadi USER */}
                        <span className="text-sm font-['Inter']">USER</span> 
                        <img className="w-8 h-8 rounded-full border-2 border-[#DAA520]" 
                             src="https://cdn-icons-png.flaticon.com/128/1077/1077012.png" 
                             alt="Avatar" />
                    </div>
                </div>
            </div>
        </header>
    );
    
    // --- Card Iuran (Lebih Transparan) ---
    const IuranCard = ({ title, amount, icon: Icon }) => (
        <div className={`p-3 md:p-4 rounded-xl shadow-lg flex flex-col items-center text-center 
                        border border-[#3A5D40] ${COLORS.INPUT_BG} ${COLORS.TEXT_PRIMARY}`}>
            <Icon className={`w-6 h-6 md:w-8 md:h-8 ${COLORS.ICON_ACCENT} mb-1 md:mb-2`} />
            <p className="text-xs md:text-sm font-medium font-['Inter']">{title}</p>
            <p className="text-md md:text-lg font-bold font-['Inter']">{formatRupiah(amount)}</p>
        </div>
    );

    return (
        // BACKGROUND UTAMA: Hapus style={{ backgroundImage: "url(...)" }} 
        // Tambahkan foto background melalui CSS/Image tag di App.jsx jika perlu.
        <div className="min-h-screen relative">
            {/* Placeholder Gambar Background dari Directory */}
            {/* Ganti '/your-background-image.jpg' dengan path gambar yang Anda tambahkan ke folder 'public' */}
            <img 
                src="/bali-background.jpg" 
                alt="Background Sawah Bali" 
                className="absolute inset-0 w-full h-full object-cover z-0" 
                onError={(e) => { e.target.onerror = null; e.target.src="https://images.unsplash.com/photo-1557093793-d149a38a1be8?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTl8fGJhbGl8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&q=60&w=600" }}
            />
            
            <Header />
            <Notification 
                message={notification.message}
                type={notification.type}
                onClose={() => setNotification({ message: '', type: '' })}
            />
            
            <div className={`min-h-screen pt-4 pb-8 relative z-10`}> 
                <div className="max-w-4xl mx-auto p-4 md:p-8">
                    
                    {/* 1. Status Pembayaran Iuran (Form Pencarian) - Transparansi diterapkan di sini */}
                    <div className={`${COLORS.CARD_BG_OPACITY} p-5 md:p-6 rounded-2xl shadow-2xl mb-6 md:mb-8 border ${COLORS.BORDER_ACCENT}`}>
                        <h2 className={`text-xl md:text-2xl font-semibold mb-3 md:mb-4 border-b pb-2 ${COLORS.TEXT_PRIMARY} font-['Playfair_Display']`}>Status Pembayaran Iuran</h2>
                        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3 md:gap-4">
                            <input
                                type="text"
                                placeholder="Cari ID/NIK Krama..."
                                value={kramaIdInput}
                                onChange={(e) => setKramaIdInput(e.target.value)}
                                className={`flex-grow p-3 rounded-lg focus:ring-2 focus:ring-[#DAA520] focus:border-[#DAA520] 
                                            transition ${COLORS.INPUT_BG} ${COLORS.TEXT_PRIMARY} border ${COLORS.INPUT_BORDER}`}
                                ref={searchInputRef} // Tambahkan ref di sini
                            />
                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`${COLORS.SEARCH_BTN_BG} ${COLORS.TEXT_PRIMARY} font-bold py-3 px-4 md:px-6 rounded-lg 
                                            ${COLORS.SEARCH_BTN_HOVER} transition disabled:bg-gray-500 flex items-center justify-center`}
                            >
                                {isLoading ? 'Mencari...' : <><Search className="w-5 h-5 mr-2" /> Cari</>}
                            </button>
                        </form>
                        
                        {kramaData && (
                            <div className="mt-4 p-3 bg-opacity-70 rounded-lg border-l-4 border-[#DAA520] bg-[#3A5D40]">
                                <p className={`font-semibold ${COLORS.TEXT_PRIMARY} font-['Inter']`}>Krama Ditemukan:</p>
                                <p className={`text-md md:text-lg font-bold ${COLORS.TEXT_PRIMARY} font-['Inter']`}>{kramaData.nama} ({kramaData.status_krama})</p>
                            </div>
                        )}
                    </div>

                    {kramaData && tagihanDetail && totalTagihanAktif > 0 && (
                        <>
                            {/* 2. Detail Tagihan Terkini */}
                            <div className={`${COLORS.CARD_BG_OPACITY} p-5 md:p-6 rounded-2xl shadow-2xl mb-6 md:mb-8 border ${COLORS.BORDER_ACCENT}`}>
                                <h2 className={`text-lg md:text-xl font-semibold mb-4 ${COLORS.TEXT_PRIMARY} flex items-center font-['Playfair_Display']`}>
                                    <Bell className={`w-5 h-5 mr-2 ${COLORS.ICON_ACCENT}`} />
                                    Tagihan Aktif: {new Date(tagihanDetail.tgl_terbit).toLocaleDateString('id-ID')}
                                </h2>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                                    <IuranCard title="Iuran Pokok Krama" amount={tagihanDetail.jenis_iuran.iuran} icon={Leaf} />
                                    <IuranCard title="Dana Pembangunan (Dedosar)" amount={tagihanDetail.jenis_iuran.dedosar} icon={Key} />
                                    <IuranCard title="Kas Sosial (Peturunan)" amount={tagihanDetail.jenis_iuran.peturunan} icon={Coins} />
                                    <IuranCard title="Dana Pembunrnan" amount={0} icon={Leaf} /> 
                                </div>
                            </div>

                            {/* 3. Total Tagihan */}
                            <div className={`p-5 md:p-6 rounded-2xl shadow-2xl mb-6 md:mb-8 bg-[#3A5D40] bg-opacity-70 border-[#DAA520] border-l-8 ${COLORS.TEXT_PRIMARY}`}>
                                <h2 className={`text-md font-medium ${COLORS.TEXT_SECONDARY} font-['Inter']`}>Total Pembayaran yang Harus Dilunasi:</h2>
                                <p className={`text-3xl md:text-4xl font-extrabold ${COLORS.ICON_ACCENT} mt-2 font-['Inter']`}>
                                    {formatRupiah(totalTagihanAktif)}
                                </p>
                                <p className={`text-sm ${COLORS.TEXT_SECONDARY} mt-1 font-['Inter']`}>Tagihan ID: {tagihanDetail.tagihan_id}</p>
                            </div>

                            {/* 4. Proses Pembayaran */}
                            <div className={`${COLORS.CARD_BG_OPACITY} p-5 md:p-6 rounded-2xl shadow-2xl border ${COLORS.BORDER_ACCENT}`}>
                                <h2 className={`text-xl md:text-2xl font-semibold mb-4 ${COLORS.TEXT_PRIMARY} font-['Playfair_Display']`}>Proses Pembayaran</h2>
                                
                                <button
                                    onClick={handleCheckout}
                                    disabled={isLoading}
                                    className={`w-full ${COLORS.BUTTON_PRIMARY_BG} ${COLORS.TEXT_PRIMARY} font-bold text-xl py-4 rounded-xl 
                                                ${COLORS.BUTTON_PRIMARY_HOVER} transition disabled:bg-gray-500 shadow-md flex items-center justify-center mb-4`}
                                >
                                    <CreditCard className="w-6 h-6 mr-3" />
                                    Konfirmasi & Checkout
                                </button>
                                
                                <div className="text-center">
                                    <span className={`inline-flex items-center px-4 py-2 font-semibold rounded-full 
                                            ${tagihanDetail.status === 'selesai' ? COLORS.SUCCESS_STATUS : COLORS.PENDING_STATUS} ${COLORS.TEXT_PRIMARY} font-['Inter']`}
                                    >
                                        <Bell className="w-4 h-4 mr-2" />
                                        Status: {tagihanDetail.status === 'selesai' ? 'Selesai (LUNAS)' : 'Tertunda (BELUM LUNAS)'}
                                    </span>
                                </div>
                            </div>
                        </>
                    )}
                    
                    {kramaData && !tagihanDetail && (
                        <div className={`p-6 rounded-2xl text-center shadow-lg border-l-8 border-[#DAA520] ${COLORS.CARD_BG_OPACITY} ${COLORS.TEXT_PRIMARY}`}>
                            <CheckCircle className={`w-10 h-10 ${COLORS.ICON_ACCENT} mx-auto mb-3`} />
                            <p className="text-xl font-semibold font-['Playfair_Display']">SELURUH TAGIHAN LUNAS</p>
                            <p className={`text-gray-300 font-['Inter']`}>Tidak ada iuran aktif yang tertunda untuk Krama ini.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BillingDashboard;