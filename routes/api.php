<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\{
    AuthController,
    ScheduleController,
    EmployeeController,
    StoreController,
    ShiftController,
    SettingsController
};

// Public routes
Route::post('/login', [AuthController::class, 'login']);
Route::post('/set-password', [AuthController::class, 'setPassword']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/set-new-password', [AuthController::class, 'setNewPassword']);

Route::middleware(['auth:sanctum', 'role:admin'])->post('/register', [AuthController::class, 'register']); // Bisa dibatasi pakai middleware jika perlu

// Protected routes (semua yang login)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // Semua role bisa lihat jadwal sendiri
    Route::get('/schedules', [ScheduleController::class, 'getSchedule']);
    Route::get('/schedules/manual', [ScheduleController::class, 'getManualSchedule']);
});

// Role-based routes
Route::middleware(['auth:sanctum', 'role:admin,cos,acos'])->group(function () {
    // Jadwal
    Route::put('/schedules/reset-all', [ScheduleController::class, 'resetAllSchedules']);
    Route::post('/schedules/generate', [ScheduleController::class, 'generateSchedule']);
    Route::put('/schedules/{id}', [ScheduleController::class, 'updateSchedule']);
    Route::get('/schedules/daily', [ScheduleController::class, 'getDailySchedule']);
    Route::get('/schedules/export', [ScheduleController::class, 'exportSchedule']);
    Route::post('/schedules/manual-save', [ScheduleController::class, 'saveManualSchedule']);
    Route::post('/schedules/reset', [ScheduleController::class, 'resetSchedule']);

    // Shift types (masukkan di sini)
    Route::get('/shift-types', [ShiftController::class, 'index']);

    // Karyawan
    Route::resource('employees', EmployeeController::class);
    Route::get('/employees', [EmployeeController::class, 'index']);
    Route::get('/employees/{id}', [EmployeeController::class, 'show']);
    Route::put('/employees/{id}', [EmployeeController::class, 'update']);

    // Report
    Route::get('/reports/shift-summary', [ScheduleController::class, 'shiftSummary']);

    // Toko
    Route::get('/stores', [StoreController::class, 'index']);
    Route::put('/stores/{id}/settings', [StoreController::class, 'updateSettings']);

    // Settings
    Route::post('/settings/store', [SettingsController::class, 'updateStore']);
    Route::get('/shifts', [ShiftController::class, 'index']);
    Route::post('/shifts', [ShiftController::class, 'store']);
    Route::put('/shifts/{shift}', [ShiftController::class, 'update']);
    Route::delete('/shifts/{shift}', [ShiftController::class, 'destroy']);
    Route::post('/schedules/reset', [ScheduleController::class, 'reset']);
    Route::post('/auth/change-password', [AuthController::class, 'changePassword']);
    Route::post('/employees/{id}/reset-password', [EmployeeController::class, 'resetPassword']);
    Route::post('/change-password', [AuthController::class, 'changePassword']);

    // Reset password by NIK
    Route::post('/employees/find-by-nik', [EmployeeController::class, 'findEmployeeByNik']);
    Route::post('/employees/reset-password', [EmployeeController::class, 'resetPasswordByNik']);
});
