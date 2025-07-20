import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import { Link } from 'react-router-dom';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const { forgotPassword } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await forgotPassword(email);
            setMessage(res.message);
            setSuccess(true);
            toast.success('Link reset password telah dikirim ke email Anda!');
        } catch (error) {
            toast.error('Gagal mengirim email. Pastikan email terdaftar.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-md mx-auto">
            <h2 className="text-2xl font-bold mb-4">Lupa Password</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
                <input
                    type="email"
                    className="w-full border rounded p-2"
                    placeholder="Masukkan email Anda"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                />
                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full p-2 rounded text-white ${loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                        } flex justify-center items-center gap-2`}
                >
                    {loading && (
                        <svg
                            className="animate-spin h-5 w-5 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                            ></circle>
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                            ></path>
                        </svg>
                    )}
                    Kirim Link
                </button>
            </form>

            {message && (
                <div className="mt-4 p-3 bg-green-100 text-green-700 rounded">
                    {message}
                </div>
            )}

            {success && (
                <div className="mt-4 text-center">
                    <Link to="/" className="text-blue-600 underline">
                        Kembali ke Halaman Awal
                    </Link>
                </div>
            )}
        </div>
    );
};

export default ForgotPassword;
