<?php
// app/Http/Controllers/AuthController.php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\Store;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{
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
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:employees',
            'nik' => 'required|string|unique:employees',
            'store_code' => 'required|string|exists:stores,store_code',
            'password' => 'required|string|min:6|confirmed',
            'gender' => 'required|in:male,female',
            'phone' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $store = Store::where('store_code', $request->store_code)->first();

        $employee = Employee::create([
            'name' => $request->name,
            'email' => $request->email,
            'nik' => $request->nik,
            'store_id' => $store->id,
            'password' => Hash::make($request->password),
            'gender' => $request->gender,
            'phone' => $request->phone,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Registrasi berhasil',
            'data' => $employee->load('store')
        ], 201);
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
}
