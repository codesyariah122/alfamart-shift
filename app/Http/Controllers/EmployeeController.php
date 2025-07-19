<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class EmployeeController extends Controller
{
    public function index(Request $request)
    {
        $storeId = $request->user()->store_id;

        $employees = Employee::where('store_id', $storeId)
            ->with('store')
            ->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $employees
        ]);
    }

    public function show($id)
    {
        $employee = Employee::with(['store', 'schedules.shift'])
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $employee
        ]);
    }

    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:employees,email,' . $id,
            'phone' => 'sometimes|string',
            'status' => 'sometimes|in:active,inactive',
            'gender' => 'sometimes|in:male,female'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $employee = Employee::findOrFail($id);
        $employee->update($request->only([
            'name',
            'email',
            'phone',
            'status',
            'gender'
        ]));

        return response()->json([
            'success' => true,
            'message' => 'Data karyawan berhasil diupdate',
            'data' => $employee->fresh()
        ]);
    }
}
