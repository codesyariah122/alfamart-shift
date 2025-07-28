import React from 'react';
import { Routes, Route } from 'react-router-dom'; // pastikan ini sudah ada
import { BrowserRouter as Router } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth, ScheduleProvider, SettingsProvider } from '@/context';

import { DashboardPage, CalendarPage, ActivationSuccess, SetPassword, ForgotPassword, SetNewPassword } from '@/pages';

import AuthPage from '@/components/auth/AuthPage';
import Navbar from '@/components/layout/Navbar';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 1,
            refetchOnWindowFocus: false,
        },
    },
});

function AppContent() {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
                <div className="text-center text-white">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                    <p className="text-lg">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <SettingsProvider>

            <ScheduleProvider>
                <Routes>
                    {/* Route publik */}
                    <Route path="/activation-success" element={<ActivationSuccess />} />
                    <Route path="/set-password" element={<SetPassword />} />

                    {/* Route forgot password */}
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/set-new-password" element={<SetNewPassword />} />

                    {/* Jika belum login, tetap di AuthPage untuk route lain */}
                    {!isAuthenticated ? (
                        <Route path="*" element={<AuthPage />} />
                    ) : (
                        <Route
                            path="*"
                            element={
                                <div className="min-h-screen bg-gray-50">
                                    <Navbar />
                                    <main className="max-w-7xl mx-auto relative overflow-visible">
                                        <Routes>
                                            <Route path="/dashboard" element={<DashboardPage />} />
                                            <Route path="/calendar" element={<CalendarPage />} />
                                        </Routes>
                                    </main>
                                </div>
                            }
                        />
                    )}
                </Routes>
            </ScheduleProvider>
        </SettingsProvider>
    );
}


function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <Router>
                    <AppContent />
                    <Toaster
                        position="top-right"
                        toastOptions={{
                            duration: 4000,
                            style: {
                                background: '#363636',
                                color: '#fff',
                            },
                            success: {
                                style: {
                                    background: '#10B981',
                                },
                            },
                            error: {
                                style: {
                                    background: '#EF4444',
                                },
                            },
                        }}
                    />
                </Router>
            </AuthProvider>
            <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
    );
}

export default App;
