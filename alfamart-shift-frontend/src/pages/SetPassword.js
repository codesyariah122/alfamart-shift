import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext'; // ← tambahkan ini

export default function SetPassword() {
    const [searchParams] = useSearchParams();
    const email = searchParams.get('email');
    const { setPassword } = useAuth(); // ← gunakan dari context
    const [password, setPasswordInput] = useState('');
    const [confirm, setConfirm] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirm) {
            setMessage('Password tidak cocok');
            return;
        }

        setLoading(true);
        const result = await setPassword({ email, password });
        setLoading(false);

        if (result.success) {
            const nikParam = encodeURIComponent(result.nik); // ambil NIK dari response
            window.location.href = `/activation-success?nik=${nikParam}`;
        } else {
            setMessage(result.message);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <form
                onSubmit={handleSubmit}
                className="bg-white shadow-md rounded-lg p-8 max-w-md w-full"
            >
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Buat Password Baru</h2>
                <p className="text-sm text-gray-600 mb-6">
                    Email: <strong>{email}</strong>
                </p>
                {message && <div className="mb-4 text-red-500">{message}</div>}

                <input
                    type="password"
                    placeholder="Password Baru"
                    className="w-full mb-3 px-4 py-2 border rounded"
                    value={password}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    required
                    disabled={loading}
                />
                <input
                    type="password"
                    placeholder="Konfirmasi Password"
                    className="w-full mb-4 px-4 py-2 border rounded"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                    disabled={loading}
                />

                <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded flex items-center justify-center gap-2"
                    disabled={loading}
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
                    {loading ? 'Menyimpan...' : 'Simpan Password'}
                </button>

            </form>
        </div>
    );
}
