import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CheckCircleIcon, ClipboardIcon } from '@heroicons/react/24/solid';

export default function ActivationSuccess() {
    const [searchParams] = useSearchParams();
    const email = searchParams.get('email');
    const nik = searchParams.get('nik');

    const [copied, setCopied] = useState(false);

    // Simpan NIK ke localStorage saat komponen mount
    useEffect(() => {
        if (nik) {
            localStorage.setItem('nik', nik);
        }
    }, [nik]);

    const handleCopy = () => {
        navigator.clipboard.writeText(nik);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-green-50 px-4">
            <div className="bg-white rounded-xl shadow-xl p-10 max-w-md w-full text-center">
                <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Akun Berhasil Diaktivasi!</h2>
                <p className="text-gray-600 mb-4">
                    Terima kasih, akun dengan email{' '}
                    <span className="font-medium text-black">{email}</span> telah berhasil diaktifkan.
                </p>

                {nik && (
                    <div className="bg-gray-100 rounded-md p-4 mb-4 flex items-center justify-between">
                        <div className="text-sm font-mono text-gray-700">NIK: {nik}</div>
                        <button
                            onClick={handleCopy}
                            className="ml-2 text-green-600 hover:text-green-800"
                            title="Copy NIK"
                        >
                            <ClipboardIcon className="w-5 h-5" />
                        </button>
                    </div>
                )}

                {copied && (
                    <div className="text-green-600 text-sm mb-2 transition">
                        NIK berhasil disalin!
                    </div>
                )}

                <a
                    href="/dashboard"
                    className="inline-block mt-4 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-md transition"
                >
                    Masuk ke Dashboard
                </a>
            </div>
        </div>
    );
}
