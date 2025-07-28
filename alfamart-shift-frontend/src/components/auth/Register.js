import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useSchedule } from '@/context/ScheduleContext';
import { steps } from '@/commons';


const RegisterStepper = ({ onSwitchToLogin }) => {
    const { scheduleAPI } = useSchedule();
    const [step, setStep] = useState(0);
    const { checkNik, register: registerUser, loading } = useAuth();
    const [nikValidated, setNikValidated] = useState(false);
    const [checkingNik, setCheckingNik] = useState(false);
    const [stores, setStores] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [registerSuccess, setRegisterSuccess] = useState(false);
    const [employeeData, setEmployeeData] = useState(null);
    const {
        register,
        handleSubmit,
        formState: { errors },
        setError,
        clearErrors,
        getValues,
        trigger,
        setValue
    } = useForm();

    const nextStep = async () => {
        const valid = await trigger(stepFields[step]);
        if (valid) setStep(step + 1);
    };

    const prevStep = () => setStep(step - 1);

    const stepFields = [
        ['nik'], // Step 0
        ['name', 'email', 'store_code', 'gender', 'phone'], // Step 1
        ['password', 'password_confirmation'], // Step 2
    ];

    const onSubmit = async (data) => {
        clearErrors();
        setIsSubmitting(true);

        const payload = {
            nik: data.nik,
            email: data.email,
            password: data.password,
            password_confirmation: data.password_confirmation,
            phone: data.phone || null,
            gender: data.gender || null,
            store_code: data.store_code,
        };

        const result = await registerUser(payload);
        setIsSubmitting(false);

        if (!result.success || result.errors) {
            toast.error(result.message || 'Registrasi gagal');

            if (result.errors) {
                Object.entries(result.errors).forEach(([field, [message]]) => {
                    setError(field, { type: 'server', message });
                    toast.error(`${field.toUpperCase()}: ${message}`);
                });
            }

            return;
        }

        toast.success('Registrasi berhasil!');
        setRegisterSuccess(true);
    };



    useEffect(() => {
        const fetchStores = async () => {
            try {
                const storeList = await scheduleAPI.getListStores();
                setStores(storeList?.data || []);
            } catch (error) {
                console.error('Gagal ambil data toko:', error);
                toast.error('Gagal memuat daftar toko');
            }
        };

        fetchStores();
    }, [scheduleAPI]);

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md mx-auto">
            <div className="flex justify-between mb-6">
                {steps.map((label, i) => (
                    <div key={i} className={`flex-1 text-center text-sm font-medium ${i === step ? 'text-blue-600' : 'text-gray-400'}`}>
                        {label}
                        {i < steps.length - 1 && <span className="mx-2 text-gray-300">➔</span>}
                    </div>
                ))}
            </div>

            {isSubmitting && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white px-6 py-4 rounded-lg shadow-md flex items-center space-x-3">
                        <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                        <span className="text-sm font-medium text-gray-700">Mendaftarkan akun...</span>
                    </div>
                </div>
            )}
            {registerSuccess ? (
                <div className="text-center space-y-4">
                    <h2 className="text-2xl font-semibold text-green-600">Registrasi Berhasil!</h2>
                    <p className="text-gray-700">Akun kamu sudah terdaftar.</p>
                    <button
                        onClick={onSwitchToLogin}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                        Login Sekarang
                    </button>
                </div>
            ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {step === 0 && (
                        <>
                            <div>
                                <label>NIK</label>
                                <input
                                    {...register('nik', { required: 'NIK harus diisi' })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    disabled={nikValidated}
                                />
                                {errors.nik && <p className="text-red-600">{errors.nik.message}</p>}
                            </div>
                            {!nikValidated && (
                                <button
                                    type="button"
                                    disabled={checkingNik}
                                    onClick={async () => {
                                        clearErrors('nik');
                                        const valid = await trigger('nik');
                                        if (!valid) return;

                                        setCheckingNik(true);
                                        const { nik } = getValues();
                                        const result = await checkNik(nik);
                                        setCheckingNik(false);

                                        if (result.success) {
                                            toast.success('NIK valid, lanjut isi data');
                                            setNikValidated(true);
                                            setStep(step + 1);
                                            setEmployeeData(result.data);
                                            if (result.data) {
                                                const { name, email, nik, phone, gender } = result.data;
                                                setValue('name', name || '');
                                                setValue('email', email || '');
                                                setValue('nik', nik || '');
                                                setValue('phone', phone || '');
                                                setValue('gender', gender || '');
                                                setValue('store_code', result?.data?.store?.store_code || '');
                                            }
                                        } else {
                                            setError('nik', { type: 'manual', message: result.message });
                                            toast.error(result.message || 'NIK tidak valid');
                                        }
                                    }}
                                    className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                                >
                                    {checkingNik ? 'Memeriksa...' : 'Periksa NIK'}
                                </button>
                            )}
                        </>
                    )}
                    {step === 1 && (
                        <>
                            <div>
                                <label>Nama Lengkap</label>
                                <input {...register('name', { required: 'Nama harus diisi' })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                                {errors.name && <p className="text-red-600">{errors.name.message}</p>}
                            </div>
                            <div>
                                <label>Email</label>
                                <input
                                    {...register('email', {
                                        required: 'Email harus diisi',
                                        pattern: { value: /^\S+@\S+$/i, message: 'Format email tidak valid' },
                                    })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                {errors.email && <p className="text-red-600">{errors.email.message}</p>}
                            </div>
                            <div>
                                <label>NIK</label>
                                <input {...register('nik', { required: 'NIK harus diisi' })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                                {errors.nik && <p className="text-red-600">{errors.nik.message}</p>}
                            </div>
                        </>
                    )}

                    {step === 2 && (
                        <>
                            <div>
                                <label>Kode Toko</label>
                                <select
                                    {...register('store_code', { required: 'Kode toko harus dipilih' })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                >
                                    <option value="">Pilih toko</option>
                                    {stores.map((store) => (
                                        <option key={store.store_code} value={store.store_code}>
                                            {store.store_name} ({store.store_code})
                                        </option>
                                    ))}
                                </select>
                                {errors.store_code && <p className="text-red-600">{errors.store_code.message}</p>}

                            </div>
                            <div>
                                <label>Jenis Kelamin</label>
                                <select
                                    {...register('gender', { required: 'Jenis kelamin harus dipilih' })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >

                                    <option value="">Pilih jenis kelamin</option>
                                    <option value="male">Laki-laki</option>
                                    <option value="female">Perempuan</option>
                                </select>
                                {errors.gender && <p className="text-red-600">{errors.gender.message}</p>}
                            </div>
                            <div>
                                <label>No. Telepon</label>
                                <input {...register('phone')} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                                {errors.phone && <p className="text-red-600">{errors.phone.message}</p>}
                            </div>
                        </>
                    )}

                    {step === 2 && (
                        <>
                            <div>
                                <label>Password</label>
                                <input
                                    type="password"
                                    {...register('password', {
                                        required: 'Password harus diisi',
                                        minLength: { value: 6, message: 'Password minimal 6 karakter' },
                                    })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                {errors.password && <p className="text-red-600">{errors.password.message}</p>}
                            </div>
                            <div>
                                <label>Konfirmasi Password</label>
                                <input
                                    type="password"
                                    {...register('password_confirmation', { required: 'Konfirmasi password harus diisi' })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                {errors.password_confirmation && (
                                    <p className="text-red-600">{errors.password_confirmation.message}</p>
                                )}
                            </div>
                        </>
                    )}

                    <div className="flex justify-between mt-6">
                        {step > 0 && (
                            <button type="button" onClick={prevStep} className="text-sm text-gray-600 hover:underline">
                                Kembali
                            </button>
                        )}
                        {step < steps.length - 1 && step > 0 ? (
                            <button
                                type="button"
                                onClick={nextStep}
                                className="ml-auto bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                            >
                                Lanjut
                            </button>
                        ) : (
                            step === 2 && nikValidated && (
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="ml-auto bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 flex items-center justify-center min-w-[100px]"
                                >
                                    {isSubmitting ? (
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                        </svg>
                                    ) : (
                                        'Daftar'
                                    )}
                                </button>
                            )
                        )}
                    </div>

                    <div className="text-center">
                        <button
                            type="button"
                            onClick={onSwitchToLogin}
                            className="text-sm text-blue-600 hover:underline mt-4"
                        >
                            Sudah punya akun? Login disini
                        </button>
                    </div>
                </form>
            )}
        </motion.div>
    );
};

export default RegisterStepper;
