<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;
use App\Models\{Employee, Schedule, Shift};
use App\Services\ScheduleGeneratorService;

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
            'generation_type' => 'required|in:auto,manual,hybrid,weekly',
            'store_id' => 'required|exists:stores,id',
            'from' => 'nullable|date',
            'to' => 'nullable|date',
            'month' => 'required_without:from|integer|min:1|max:12',
            'year' => 'required_without:from|required_without:to|integer|min:2024|max:2030',
            'weekly_pattern' => 'nullable|array', // ⬅️ tambahkan ini
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $storeId = $request->store_id;
            $generationType = $request->generation_type;
            $from = $request->filled('from') ? Carbon::parse($request->from) : null;
            $to = $request->filled('to') ? Carbon::parse($request->to) : null;
            $month = $request->month;
            $year = $request->year;

            $weeklyPattern = $request->input('weekly_pattern', []); // ⬅️ ambil dari request

            $result = $this->scheduleGenerator->generateSchedule(
                $storeId,
                $month,
                $year,
                $generationType,
                $from,
                $to,
                $request->user()->id,
                $weeklyPattern // ⬅️ oper ke service
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
                    ->with(['shift', 'creator']);
            }])
            ->get();

        $scheduleData = [];
        foreach ($employees as $employee) {
            foreach ($employee->schedules as $s) {
                if (!$s->schedule_date) {
                    logger()->error("Schedule tanpa tanggal! ID: {$s->id}");
                }
            }
            $scheduleData[$employee->id] = [
                'employee' => $employee,
                'schedule' => $employee->schedules
                    ->filter(fn($s) => !empty($s->schedule_date) && strtotime($s->schedule_date))
                    ->keyBy(fn($s) => date('j', strtotime($s->schedule_date))),
            ];
        }

        $firstSchedule = Schedule::where('month', $month)
            ->where('year', $year)
            ->whereHas('employee', fn($q) => $q->where('store_id', $storeId))
            ->with('creator')
            ->first();

        $createdByName = $firstSchedule?->creator?->name ?? null;

        return response()->json([
            'success' => true,
            'data' => $scheduleData,
            'debug_raw' => $employees,
            'created_by' => $createdByName,
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


    public function saveManualSchedule(Request $request)
    {
        $validated = $request->validate([
            'schedules' => 'required|array',
            'schedules.*.employee_id' => 'required|exists:employees,id',
            'schedules.*.day' => 'required|integer|min:1|max:31',
            'schedules.*.shift_code' => 'required|string',
            'month' => 'required|integer|min:1|max:12',
            'year' => 'required|integer|min:2023',
            'store_id' => 'required|exists:stores,id',
        ]);

        $creatorId = $request->user()->id ?? null;

        $service = app(\App\Services\ScheduleGeneratorService::class);
        $result = $service->insertManualSchedules(
            $validated['schedules'],
            $validated['store_id'],
            $validated['month'],
            $validated['year'],
            $creatorId
        );

        return response()->json([
            'message' => 'Jadwal berhasil disimpan',
            'result' => $result,
        ]);
    }
}
