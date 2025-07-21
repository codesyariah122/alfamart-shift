<?php
// routes/web.php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\{EmployeeController};

Route::get('/', function () {
    return response()->json(['message' => 'Welcome to Alfamart Shift System API']);
});

Route::get('/activate/{token}', [EmployeeController::class, 'activateEmployee']);


// Testing email
// Route::get('/test-email/{id}', function ($id) {
//     $employee = Employee::findOrFail($id);

//     Mail::to($employee->email)->send(new EmployeeActivationMail($employee));

//     return 'Email test sudah dikirim ke ' . $employee->email;
// });
