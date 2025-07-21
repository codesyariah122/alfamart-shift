import { useState } from 'react';
import api from '@/config/api'; // pastikan sudah import api
import Swal from 'sweetalert2';

const ResetEmployeePassword = () => {
    const [nik, setNik] = useState('');
    const [employee, setEmployee] = useState(null);
    const [loading, setLoading] = useState(false);

    // Untuk password baru
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // State untuk toggle view password
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Cari employee by NIK
    const handleFindEmployee = async () => {
        if (!nik.trim()) {
            Swal.fire('Error', 'NIK Karyawan harus diisi!', 'error');
            return;
        }

        setLoading(true);
        try {
            const res = await api.post('/employees/find-by-nik', { nik: nik.trim() });
            setEmployee(res.data.data);
        } catch (error) {
            Swal.fire('Gagal', error.response?.data?.message || 'Karyawan tidak ditemukan.', 'error');
            setEmployee(null);
        } finally {
            setLoading(false);
        }
    };

    // Reset password dengan password baru inputan user
    const handleResetPassword = async () => {
        if (!newPassword || !confirmPassword) {
            Swal.fire('Error', 'Password baru dan konfirmasi harus diisi.', 'error');
            return;
        }
        if (newPassword !== confirmPassword) {
            Swal.fire('Error', 'Password baru dan konfirmasi tidak cocok.', 'error');
            return;
        }

        setLoading(true);
        try {
            await api.post('/employees/reset-password', {
                nik: employee.nik,
                password: newPassword,
                password_confirmation: confirmPassword,
            });
            Swal.fire('Berhasil', 'Password berhasil diubah.', 'success');
            setNik('');
            setEmployee(null);
            setNewPassword('');
            setConfirmPassword('');
        } catch (error) {
            Swal.fire('Gagal', error.response?.data?.message || 'Gagal mengubah password.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-sm mx-auto p-4 bg-white rounded shadow">
            <h3 className="text-lg font-semibold mb-4 text-center">Reset Password Karyawan</h3>

            {/* Input NIK dan tombol cari */}
            {!employee && (
                <>
                    <input
                        className="input w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Masukkan NIK Karyawan"
                        value={nik}
                        onChange={(e) => setNik(e.target.value)}
                        disabled={loading}
                    />
                    <button
                        onClick={handleFindEmployee}
                        disabled={loading}
                        className={`btn w-full mt-4 py-2 font-semibold rounded ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'
                            }`}
                    >
                        {loading ? 'Mencari...' : 'Cari Karyawan'}
                    </button>
                </>
            )}

            {/* Jika employee ditemukan, tampilkan form reset password */}
            {employee && (
                <>
                    <p className="mb-2 font-medium">
                        Karyawan: {employee.name} (NIK: {employee.nik})
                    </p>

                    {/* Password baru dengan toggle view */}
                    <div className="relative mb-2">
                        <input
                            type={showNewPassword ? 'text' : 'password'}
                            className="input w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Password baru"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            disabled={loading}
                        />
                        <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600"
                            tabIndex={-1}
                        >
                            {showNewPassword ? '🙈' : '👁️'}
                        </button>
                    </div>

                    {/* Konfirmasi password baru dengan toggle view */}
                    <div className="relative mb-4">
                        <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            className="input w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Konfirmasi password baru"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            disabled={loading}
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600"
                            tabIndex={-1}
                        >
                            {showConfirmPassword ? '🙈' : '👁️'}
                        </button>
                    </div>

                    <button
                        onClick={handleResetPassword}
                        disabled={loading}
                        className={`btn w-full py-2 font-semibold rounded ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 text-white'
                            }`}
                    >
                        {loading ? 'Memproses...' : 'Reset Password'}
                    </button>
                    <button
                        onClick={() => {
                            setEmployee(null);
                            setNik('');
                            setNewPassword('');
                            setConfirmPassword('');
                        }}
                        disabled={loading}
                        className="btn mt-2 w-full bg-gray-500 hover:bg-gray-600 text-white rounded"
                    >
                        Batal
                    </button>
                </>
            )}
        </div>
    );
};

export default ResetEmployeePassword;
