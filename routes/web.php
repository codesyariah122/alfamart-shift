<?php
// routes/web.php

use Illuminate\Support\Facades\Route;
use App\Mail\EmployeeActivationMail;
use Illuminate\Support\Facades\Mail;
use App\Models\Employee;
use App\Http\Controllers\{EmployeeController};

Route::get('/', function () {
    return view('welcome');
});

Route::get('/activate/{token}', [EmployeeController::class, 'activateEmployee']);


// Testing email
// Route::get('/test-email/{id}', function ($id) {
//     $employee = Employee::findOrFail($id);

//     Mail::to($employee->email)->send(new EmployeeActivationMail($employee));

//     return 'Email test sudah dikirim ke ' . $employee->email;
// });
