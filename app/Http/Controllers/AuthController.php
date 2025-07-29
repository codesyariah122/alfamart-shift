<?php
// app/Http/Controllers/AuthController.php

namespace App\Http\Controllers;

use App\Models\{Employee, Store, User};
use Carbon\Carbon;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\{Auth, Hash, Validator, DB};

class AuthController extends Controller
{
    /**
     * Handle user login.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nik' => 'required|string',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $employee = Employee::where('nik', $request->nik)->first();

        if (!$employee || !Hash::check($request->password, $employee->password)) {
            return response()->json([
                'success' => false,
                'message' => 'NIK atau password salah'
            ], 401);
        }

        $token = $employee->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Login berhasil',
            'data' => [
                'employee' => $employee->load('store'),
                'token' => $token
            ]
        ]);
    }

    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nik' => 'required|string|exists:employees,nik',
            'email' => 'required|email',
            'password' => 'required|string|min:6|confirmed',
            'phone' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $employee = Employee::where('nik', $request->nik)
            ->where('email', $request->email)
            ->first();


        if (!$employee) {
            return response()->json([
                'success' => false,
                'message' => 'NIK atau Email tidak ditemukan, silahkan hubungi admin.'
            ], 404);
        }

        $token = Str::random(60);
        $employee->activation_token = $token;
        $employee->status = 'active'; // Set status to active upon registration
        $employee->password = Hash::make($request->password);
        // $employee->role = 'admin';

        if ($request->phone) {
            $employee->phone = $request->phone;
        }
        $employee->save();

        return response()->json([
            'success' => true,
            'message' => 'Registrasi berhasil, silahkan login.',
            'data' => $employee->load('store')
        ], 200);
    }

    public function checkNik(Request $request)
    {
        $request->validate([
            'nik' => 'required|string',
        ]);

        $employee = Employee::where('nik', $request->nik)->first();

        if (!$employee) {
            return response()->json([
                'status' => false,
                'message' => 'NIK tidak ditemukan di data karyawan.',
            ], 404);
        }

        // Cek apakah user dengan NIK ini sudah register (jika ada tabel `users`)
        // Misalnya user disimpan berdasarkan NIK juga
        // if (User::where('nik', $request->nik)->exists()) {
        //     return response()->json([
        //         'status' => false,
        //         'message' => 'NIK sudah digunakan untuk register.',
        //     ], 409);
        // }

        $store = Store::where('id', $employee->store_id)->first();

        return response()->json([
            'status' => true,
            'message' => 'NIK valid.',
            'data' => [
                'name' => $employee->name,
                'email' => $employee->email,
                'phone' => $employee->phone,
                'nik' => $employee->nik,
                'gender' => $employee->gender,
                'store' => $store,
                'activation_token' => $employee->activation_token,
                'status' => $employee->status,
            ],
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logout berhasil'
        ]);
    }

    public function me(Request $request)
    {
        return response()->json([
            'success' => true,
            'data' => $request->user()->load('store')
        ]);
    }

    public function setPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|min:6',
        ]);

        $employee = Employee::where('email', $request->email)->first();
        if (!$employee) {
            return response()->json(['message' => 'Email tidak ditemukan'], 404);
        }

        $employee->update([
            'password' => Hash::make($request->password),
        ]);

        return response()->json(['nik' => $employee->nik, 'message' => 'Password berhasil disimpan']);
    }

    public function forgotPassword(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        $employee = Employee::where('email', $request->email)->first();
        if (!$employee) {
            return response()->json(['message' => 'Email tidak ditemukan'], 404);
        }

        $token = Str::random(60);

        DB::table('password_resets')->updateOrInsert(
            ['email' => $request->email],
            [
                'email' => $request->email,
                'token' => $token,
                'created_at' => Carbon::now()
            ]
        );

        // Kirim email (pastikan `emails.reset-password` tersedia)
        Mail::send('emails.reset-password', ['token' => $token], function ($message) use ($request) {
            $message->to($request->email);
            $message->subject('Reset Password');
        });

        return response()->json(['message' => 'Link reset password sudah dikirim ke email.']);
    }

    public function setNewPassword(Request $request)
    {
        $request->validate([
            'token' => 'required|string',
            'password' => 'required|string|min:6',
        ]);

        $record = DB::table('password_resets')->where('token', $request->token)->first();

        if (!$record) {
            return response()->json(['message' => 'Token tidak valid atau sudah kadaluarsa'], 400);
        }

        $employee = Employee::where('email', $record->email)->first();
        if (!$employee) {
            return response()->json(['message' => 'User tidak ditemukan'], 404);
        }

        $employee->password = bcrypt($request->password);
        $employee->save();

        DB::table('password_resets')->where('email', $record->email)->delete();

        return response()->json(['message' => 'Password berhasil diubah']);
    }


    public function changePassword(Request $request)
    {
        /** @var Employee $employee */
        $employee = Auth::user();

        if (!$employee) {
            return response()->json(['message' => 'User tidak ditemukan.'], 404);
        }

        // Validasi input
        $validator = Validator::make($request->all(), [
            'old_password' => 'required|string',
            'password' => 'required|string|min:6|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validasi gagal.',
                'errors' => $validator->errors(),
            ], 422);
        }

        if (!Hash::check($request->old_password, $employee->password)) {
            return response()->json(['message' => 'Password lama tidak cocok.'], 422);
        }

        $employee->password = bcrypt($request->password);
        $employee->save();

        return response()->json(['message' => 'Password berhasil diubah.']);
    }
}
