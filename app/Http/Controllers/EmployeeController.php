<?php

namespace App\Http\Controllers;

use Illuminate\Support\Str;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Mail;
use App\Services\EmployeeService;
use App\Models\Employee;
use App\Mail\EmployeeActivationMail;

class EmployeeController extends Controller
{
    protected $employeeService;

    public function __construct(EmployeeService $employeeService)
    {
        $this->employeeService = $employeeService;
    }

    public function index(Request $request)
    {
        $storeId = $request->user()->store_id;
        $employees = $this->employeeService->getAllEmployees($storeId);

        return response()->json([
            'success' => true,
            'data' => $employees
        ]);
    }

    public function show($id)
    {
        $employee = $this->employeeService->getEmployeeDetail($id);

        return response()->json([
            'success' => true,
            'data' => $employee
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:employees,email',
            'nik' => 'required|string|max:20|unique:employees,nik',
            'gender' => 'required|in:male,female',
            // 'status' => 'required|in:active,inactive',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }
        $token = Str::random(60);
        $employee = Employee::create([
            'store_id' => $request->store_id,
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'nik' => $request->nik,
            'gender' => $request->gender,
            'status' => Employee::STATUS_INACTIVE,
            'activation_token' => $token,
        ]);
        Mail::to($employee->email)->send(new EmployeeActivationMail($employee));

        return response()->json([
            'success' => true,
            'message' => 'Karyawan berhasil ditambahkan',
            'data' => $employee
        ]);
    }


    public function update(Request $request, $id)
    {
        $validator = $this->employeeService->validateUpdate($request, $id);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $employee = $this->employeeService->updateEmployee($id, $request->only([
            'name',
            'email',
            'phone',
            'status',
            'gender'
        ]));

        return response()->json([
            'success' => true,
            'message' => 'Data karyawan berhasil diupdate',
            'data' => $employee
        ]);
    }

    public function destroy($id)
    {
        $employee = Employee::find($id);

        if (!$employee) {
            return response()->json(['message' => 'Karyawan tidak ditemukan'], 404);
        }

        // Hapus dulu jadwal terkait dengan employee ini
        $employee->schedules()->delete();

        // Baru hapus employee-nya
        $employee->delete();

        return response()->json(['message' => 'Karyawan berhasil dihapus'], 200);
    }



    public function activateEmployee($token)
    {
        $employee = Employee::where('activation_token', $token)->first();

        if (!$employee) {
            return response()->view('emails.activation_failed', [], 404); // atau tampilkan view khusus gagal
        }

        // Update status menjadi active & hapus token
        $employee->update([
            'status' => Employee::STATUS_ACTIVE,
            'email_verified_at' => Carbon::now(),
        ]);
        $frontendUrl = env('FRONTEND_APP'); // "http://localhost:3000"
        // return redirect()->to($frontendUrl . '/activation-success?email=' . urlencode($employee->email));
        return redirect()->to($frontendUrl . '/set-password?email=' . urlencode($employee->email));

        // return response()->view('emails.activation_success', ['employee' => $employee]);
    }

    public function findEmployeeByNik(Request $request)
    {
        $request->validate([
            'nik' => 'required|string',
        ]);

        $employee = Employee::where('nik', $request->nik)->first();

        if (!$employee) {
            return response()->json(['message' => 'Karyawan tidak ditemukan.'], 404);
        }

        return response()->json([
            'message' => 'Karyawan ditemukan.',
            'data' => [
                'id' => $employee->id,
                'nik' => $employee->nik,
                'name' => $employee->name,
                // tambahkan data lain yang ingin ditampilkan
            ],
        ]);
    }


    public function resetPasswordByNik(Request $request)
    {
        $request->validate([
            'nik' => 'required|string|exists:employees,nik',
            'password' => 'required|string|min:6|confirmed',
        ]);

        $employee = Employee::where('nik', $request->nik)->first();

        if (!$employee) {
            return response()->json(['message' => 'Karyawan tidak ditemukan.'], 404);
        }

        $employee->password = bcrypt($request->password);
        $employee->save();

        return response()->json([
            'message' => 'Password karyawan berhasil diubah.',
        ]);
    }
}
