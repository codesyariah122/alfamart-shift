<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
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
            // var_dump($storeId);
            // die;
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

            $this->scheduleGenerator->sendScheduleEmails($storeId, $month, $year, $request->user()->name);

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
        $storeId = $request->get('store_id') ?? $request->user()->store_id;

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
                'employee' => [
                    'id' => $employee->id,
                    'name' => $employee->name,
                ],
                'schedule' => $employee->schedules
                    ->filter(fn($s) => !empty($s->schedule_date) && strtotime($s->schedule_date))
                    ->keyBy(fn($s) => date('j', strtotime($s->schedule_date)))
                    ->map(fn($s) => [
                        'shift' => [
                            'shift_code' => $s->shift?->shift_code,
                            'shift_name' => $s->shift?->shift_name,
                        ],
                    ])
                    ->toArray(), // 🔴 INI PENTING
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

    public function getManualSchedule(Request $request)
    {
        $storeId = $request->query('store_id');
        $month = $request->query('month');
        $year = $request->query('year');

        if (!$storeId || !$month || !$year) {
            return response()->json(['error' => 'Parameter tidak lengkap'], 400);
        }

        $schedules = Schedule::whereYear('schedule_date', $year)
            ->whereMonth('schedule_date', $month)
            ->where('store_id', $storeId)
            ->with('shift') // relasi ke tabel shifts
            ->get();

        // Transform jadi format array: employee_id, day, shift_code
        $result = $schedules->map(function ($item) {
            return [
                'employee_id' => $item->employee_id,
                'day' => date('j', strtotime($item->schedule_date)), // 1-31
                'shift_code' => $item->shift->shift_code ?? null
            ];
        });

        return response()->json($result);
    }

    // public function getManualSchedule(Request $request)
    // {
    //     $storeId = $request->query('store_id');
    //     $month = $request->query('month');
    //     $year = $request->query('year');

    //     if (!$storeId || !$month || !$year) {
    //         return response()->json(['error' => 'Parameter tidak lengkap'], 400);
    //     }

    //     $employees = Employee::where('store_id', $storeId)
    //         ->where('status', 'active')
    //         ->get();

    //     $schedules = Schedule::whereYear('schedule_date', $year)
    //         ->whereMonth('schedule_date', $month)
    //         ->where('store_id', $storeId)
    //         ->with('shift')
    //         ->get();

    //     $grouped = [];

    //     foreach ($employees as $employee) {
    //         $filtered = $schedules->where('employee_id', $employee->id);
    //         $scheduleMap = [];

    //         foreach ($filtered as $s) {
    //             $day = date('j', strtotime($s->schedule_date));
    //             $scheduleMap[$day] = [
    //                 'shift' => [
    //                     'shift_code' => $s->shift->shift_code ?? '-',
    //                     'shift_name' => $s->shift->shift_name ?? '-'
    //                 ]
    //             ];
    //         }

    //         $grouped[$employee->id] = [
    //             'employee' => $employee,
    //             'schedule' => $scheduleMap,
    //         ];
    //     }

    //     return response()->json([
    //         'success' => true,
    //         'data' => $grouped,
    //         'created_by' => null
    //     ]);
    // }


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

        $this->scheduleGenerator->sendScheduleEmails(
            $schedule->employee->store_id,
            $schedule->month,
            $schedule->year,
            $request->user()->name
        );


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

        $service = $this->scheduleGenerator;
        $result = $service->insertManualSchedules(
            $validated['schedules'],
            $validated['store_id'],
            $validated['month'],
            $validated['year'],
            $creatorId
        );
        $this->scheduleGenerator->sendScheduleEmails(
            $validated['store_id'],
            $validated['month'],
            $validated['year'],
            $request->user()->name
        );

        return response()->json([
            'message' => 'Jadwal berhasil disimpan',
            'result' => $result,
        ]);
    }

    public function resetSchedule(Request $request)
    {
        $validated = $request->validate([
            'employee_id' => 'required|exists:employees,id',
            'store_id' => 'required|exists:stores,id',
            'month' => 'required|integer|min:1|max:12',
            'year' => 'required|integer|min:2023',
        ]);
        $services = $this->scheduleGenerator;
        $deleted =  $services->resetEmployeeSchedule($validated);

        return response()->json([
            'message' => "Berhasil reset $deleted jadwal.",
            'deleted_count' => $deleted
        ]);
    }

    public function resetAllSchedules(Request $request)
    {
        $validated = $request->validate([
            'store_id' => 'required|exists:stores,id',
            'month' => 'required|integer|min:1|max:12',
            'year' => 'required|integer|min:2023',
        ]);

        $deleted = $this->scheduleGenerator
            ->resetAllSchedulesByStore($validated);

        return response()->json([
            'message' => "Berhasil reset semua jadwal ($deleted data).",
            'deleted_count' => $deleted
        ]);
    }

    public function shiftSummary()
    {
        // Per employee: join ke employees untuk dapat nama dan NIK
        $shiftPerEmployee = DB::table('schedules')
            ->join('employees', 'schedules.employee_id', '=', 'employees.id')
            ->select(
                'employees.nik',
                'employees.name',
                DB::raw('COUNT(schedules.id) as total_shifts')
            )
            ->groupBy('employees.nik', 'employees.name')
            ->groupBy('employees.nik', 'employees.name')
            ->get();

        // Per tanggal
        $shiftPerDate = DB::table('schedules')
            ->select('schedule_date', DB::raw('COUNT(*) as total_shifts'))
            ->groupBy('schedule_date')
            ->orderBy('schedule_date')
            ->get();

        // Per toko
        $shiftPerStore = DB::table('schedules')
            ->join('employees', 'schedules.employee_id', '=', 'employees.id')
            ->join('stores', 'employees.store_id', '=', 'stores.id')
            ->select('stores.store_name', DB::raw('COUNT(schedules.id) as total_shifts'))
            ->groupBy('stores.store_name')
            ->get();

        return response()->json([
            'per_employee' => $shiftPerEmployee,
            'per_date' => $shiftPerDate,
            'per_store' => $shiftPerStore,
        ]);
    }
}
