<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\ShiftService;
use App\Models\Shift;

class ShiftController extends Controller
{
    protected $service;

    public function __construct(ShiftService $service)
    {
        $this->service = $service;
    }

    public function index()
    {
        $shifts = $this->service->all();

        return response()->json([
            'success' => true,
            'data' => $shifts
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'shift_code' => 'required|string|max:50|unique:shifts,shift_code',
            'shift_name' => 'required|string|max:255',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i',
            'gender_restriction' => 'required|in:none,male_only,female_only',
        ]);

        $shift = $this->service->store($request->only([
            'shift_code',
            'shift_name',
            'start_time',
            'end_time',
            'gender_restriction',
        ]));

        return response()->json([
            'success' => true,
            'message' => 'Shift berhasil ditambahkan',
            'data' => $shift
        ]);
    }

    public function update(Request $request, Shift $shift)
    {
        $request->validate([
            'shift_code' => 'required|string|max:50|unique:shifts,shift_code,' . $shift->id,
            'shift_name' => 'required|string|max:255',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i',
            'gender_restriction' => 'required|in:none,male_only,female_only',
        ]);

        $this->service->update($shift, $request->only([
            'shift_code',
            'shift_name',
            'start_time',
            'end_time',
            'gender_restriction',
        ]));

        return response()->json([
            'success' => true,
            'message' => 'Shift berhasil diperbarui',
            'data' => $shift
        ]);
    }

    public function destroy(Shift $shift)
    {
        $shift->delete();

        return response()->json([
            'success' => true,
            'message' => 'Shift berhasil dihapus'
        ]);
    }
}
