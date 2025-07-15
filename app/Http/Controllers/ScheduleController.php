<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\Schedule;
use App\Models\Shift;
use App\Services\ScheduleGeneratorService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ScheduleController extends Controller
{
    protected $scheduleGenerator;

    public function __construct(ScheduleGeneratorService $scheduleGenerator)
    {
        $this->scheduleGenerator = $scheduleGenerator;
    }

    public function generateSchedule(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'generation_type' => 'required|in:auto,manual,hybrid',
            'store_id' => 'required|exists:stores,id',

            // jika from/to ada, maka abaikan month/year
            'from' => 'nullable|date',
            'to' => 'nullable|date',
            'month' => 'required_without:from|integer|min:1|max:12',
            'year' => 'required_without:from|required_without:to|integer|min:2024|max:2030',
        ]);
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $result = $this->scheduleGenerator->generateSchedule(
                $request->store_id,
                $request->month,
                $request->year,
                $request->generation_type
            );

            return response()->json([
                'success' => true,
                'message' => 'Jadwal berhasil di-generate',
                'data' => $result
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error generating schedule: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getSchedule(Request $request)
    {
        $month = $request->get('month', date('n'));
        $year = $request->get('year', date('Y'));
        $storeId = $request->user()->store_id;

        $employees = Employee::where('store_id', $storeId)
            ->where('status', 'active')
            ->with(['schedules' => function ($query) use ($month, $year) {
                $query->where('month', $month)
                    ->where('year', $year)
                    ->with('shift');
            }])
            ->get();

        $scheduleData = [];
        foreach ($employees as $employee) {
            $scheduleData[$employee->id] = [
                'employee' => $employee,
                'schedule' => $employee->schedules->keyBy(function ($schedule) {
                    return $schedule->schedule_date->day;
                })
            ];
        }

        return response()->json([
            'success' => true,
            'data' => $scheduleData
        ]);
    }

    public function getDailySchedule(Request $request)
    {
        $date = $request->get('date', date('Y-m-d'));
        $storeId = $request->user()->store_id;

        $schedules = Schedule::whereDate('schedule_date', $date)
            ->whereHas('employee', function ($query) use ($storeId) {
                $query->where('store_id', $storeId);
            })
            ->with(['employee', 'shift'])
            ->get();

        return response()->json([
            'success' => true,
            'data' => $schedules
        ]);
    }

    public function updateSchedule(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'shift_id' => 'required|exists:shifts,id',
            'notes' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $schedule = Schedule::findOrFail($id);
        $schedule->update([
            'shift_id' => $request->shift_id,
            'notes' => $request->notes
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Jadwal berhasil diupdate',
            'data' => $schedule->load(['employee', 'shift'])
        ]);
    }
}
