import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    CalendarDaysIcon,
    UsersIcon,
    ChartBarIcon,
    Cog6ToothIcon,
} from '@heroicons/react/24/outline';
import { ScheduleGenerator, ScheduleViewer } from '@/components/dashboard';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const [activeModal, setActiveModal] = useState(null);

    const navigate = useNavigate();
    const { user } = useAuth();

    const getCardsByRole = (role) => {
        switch (role) {
            case 'admin':
                return ['generate', 'schedule', 'calendar', 'employees', 'reports', 'settings'];
            case 'cos':
            case 'acos':
                return ['generate', 'schedule', 'calendar', 'reports'];
            case 'employee':
                return ['schedule', 'calendar'];
            default:
                return [];
        }
    };

    const cards = [
        {
            id: 'generate',
            title: 'Generate Jadwal',
            description: 'Buat jadwal shift otomatis atau manual',
            icon: CalendarDaysIcon,
            gradient: 'from-blue-500 to-purple-600',
            component: ScheduleGenerator
        },
        {
            id: 'schedule',
            title: 'Lihat Jadwal',
            description: 'Tampilkan jadwal shift semua karyawan',
            icon: CalendarDaysIcon,
            gradient: 'from-green-500 to-teal-600',
            component: ScheduleViewer
        },
        {
            id: 'calendar',
            title: 'Kalender',
            description: 'Lihat jadwal dalam tampilan kalender',
            icon: CalendarDaysIcon,
            gradient: 'from-purple-500 to-pink-600',
            component: null
        },
        {
            id: 'employees',
            title: 'Karyawan',
            description: 'Kelola data karyawan',
            icon: UsersIcon,
            gradient: 'from-orange-500 to-red-600',
            component: null
        },
        {
            id: 'reports',
            title: 'Laporan',
            description: 'Lihat laporan dan statistik',
            icon: ChartBarIcon,
            gradient: 'from-yellow-500 to-orange-600',
            component: null
        },
        {
            id: 'settings',
            title: 'Pengaturan',
            description: 'Konfigurasi sistem',
            icon: Cog6ToothIcon,
            gradient: 'from-gray-500 to-gray-700',
            component: null
        }
    ];
    const handleCardClick = (cardId) => {
        switch (cardId) {
            case "calendar":
                navigate('/calendar');
                break;
            default:
                openModal(cardId);
        }
    };


    const openModal = (cardId) => {
        setActiveModal(cardId);
    };

    const closeModal = () => {
        setActiveModal(null);
    };
    const visibleCards = cards.filter(card =>
        getCardsByRole(user?.role).includes(card.id)
    );
    return (
        <div className="p-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Dashboard
                </h1>
                <p className="text-gray-600">
                    Kelola jadwal shift karyawan dengan mudah dan efisien
                </p>
            </div>

            <div className="mb-6 bg-blue-50 border border-blue-100 rounded-xl p-4">
                <h2 className="text-lg font-semibold text-blue-900 mb-2">👤 Informasi Pengguna</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-sm text-gray-800">
                    <div><span className="font-medium text-gray-700">Nama:</span> {user?.name}</div>
                    <div><span className="font-medium text-gray-700">NIK:</span> {user?.nik}</div>
                    <div><span className="font-medium text-gray-700">Role:</span> {user?.role}</div>
                    <div><span className="font-medium text-gray-700">Email:</span> {user?.email || '-'}</div>
                    <div><span className="font-medium text-gray-700">Toko:</span> {user?.store?.store_name || '-'}</div>
                    <div><span className="font-medium text-gray-700">Kode Toko:</span> {user?.store?.store_code || '-'}</div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {visibleCards.map((card, index) => (
                    <motion.div
                        key={card.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100"
                        // onClick={() => openModal(card.id)}
                        onClick={() => handleCardClick(card.id)}

                    >
                        <div className={`w-12 h-12 bg-gradient-to-r ${card.gradient} rounded-xl flex items-center justify-center mb-4`}>
                            <card.icon className="h-6 w-6 text-white" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            {card.title}
                        </h3>
                        <p className="text-gray-600 text-sm">
                            {card.description}
                        </p>
                    </motion.div>
                ))}
            </div>

            {/* Modal */}
            {activeModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">
                                {cards.find(c => c.id === activeModal)?.title}
                            </h2>
                            <button
                                onClick={closeModal}
                                className="text-gray-400 hover:text-gray-600 text-2xl"
                            >
                                ×
                            </button>
                        </div>

                        {(() => {
                            const card = visibleCards.find(c => c.id === activeModal);
                            if (card?.component) {
                                const Component = card.component;
                                return <Component onClose={closeModal} />;
                            }
                            return (
                                <div className="text-center py-8">
                                    <p className="text-gray-500">Fitur sedang dalam pengembangan</p>
                                </div>
                            );
                        })()}
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
