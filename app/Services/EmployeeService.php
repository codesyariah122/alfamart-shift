<?php

namespace App\Services;

use App\Models\Employee;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class EmployeeService
{
    public function getAllEmployees()
    {
        return Employee::with('store')
            ->where('role', '!=', 'admin')
            ->paginate(20)
            ->through(function ($employee) {
                return [
                    'id' => $employee->id,
                    'nik' => $employee->nik,
                    'name' => $employee->name,
                    'email' => $employee->email,
                    'phone' => $employee->phone,
                    'gender' => $employee->gender,
                    'status' => $employee->status,
                    'store' => [
                        'id' => $employee->store->id,
                        'name' => $employee->store->store_name,
                        'code' => $employee->store->store_code
                    ]
                ];
            });
    }


    public function getEmployeeDetail($id)
    {
        return Employee::with(['store', 'schedules.shift'])->findOrFail($id);
    }

    public function updateEmployee($id, array $data)
    {
        $employee = Employee::findOrFail($id);
        $employee->update($data);
        return $employee->fresh();
    }

    public function validateUpdate(Request $request, $id)
    {
        return Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:employees,email,' . $id,
            'phone' => 'sometimes|string',
            // 'status' => 'sometimes|in:active,inactive',
            'status' => 'required|in:' . implode(',', Employee::getStatusOptions()),
            'gender' => 'sometimes|in:male,female'
        ]);
    }
}
