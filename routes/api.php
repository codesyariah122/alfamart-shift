<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\{
    AuthController,
    ScheduleController,
    EmployeeController,
    StoreController,
    ShiftController
};

// Public routes
Route::post('/login', [AuthController::class, 'login']);
Route::middleware(['auth:sanctum', 'role:admin'])->post('/register', [AuthController::class, 'register']); // Bisa dibatasi pakai middleware jika perlu

// Protected routes (semua yang login)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // Semua role bisa lihat jadwal sendiri
    Route::get('/schedules', [ScheduleController::class, 'getSchedule']);
});

// Role-based routes
Route::middleware(['auth:sanctum', 'role:admin,cos,acos'])->group(function () {
    // Jadwal
    Route::post('/schedules/generate', [ScheduleController::class, 'generateSchedule']);
    Route::put('/schedules/{id}', [ScheduleController::class, 'updateSchedule']);
    Route::get('/schedules/daily', [ScheduleController::class, 'getDailySchedule']);
    Route::get('/schedules/export', [ScheduleController::class, 'exportSchedule']);
    Route::post('/schedules/manual-save', [ScheduleController::class, 'saveManualSchedule']);

    // Shift types (masukkan di sini)
    Route::get('/shift-types', [ShiftController::class, 'index']);

    // Karyawan
    Route::get('/employees', [EmployeeController::class, 'index']);
    Route::get('/employees/{id}', [EmployeeController::class, 'show']);
    Route::put('/employees/{id}', [EmployeeController::class, 'update']);

    // Toko
    Route::get('/stores', [StoreController::class, 'index']);
    Route::put('/stores/{id}/settings', [StoreController::class, 'updateSettings']);
});
