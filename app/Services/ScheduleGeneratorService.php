<?php

namespace App\Services;

use Carbon\Carbon;
use Carbon\CarbonPeriod;
use Illuminate\Support\Facades\Mail;
use App\Models\{Employee, Schedule, Shift, Store};
use App\Mail\ScheduleGeneratedMail;
use App\Jobs\SendScheduleEmailJob;

class ScheduleGeneratorService
{
    public function generateSchedule(
        $storeId,
        $month,
        $year,
        $generationType,
        $from = null,
        $to = null,
        $createdBy,
        $weeklyPattern = [],
        $dayOfWeek = null,
        $dayOfMonth = null
    ) {
        $store = Store::findOrFail($storeId);
        $employees = Employee::where('store_id', $storeId)
            ->where('status', 'active')
            ->where('role', '!=', 'admin')
            ->get();
        $shifts = Shift::all();

        $fromDate = $from ?? Carbon::create($year, $month, 1);
        $toDate = $to ?? Carbon::create($year, $month)->endOfMonth();

        Schedule::whereHas('employee', fn($q) => $q->where('store_id', $storeId))
            ->whereBetween('schedule_date', [$fromDate, $toDate])
            ->delete();

        if ($generationType === 'hybrid') {
            Schedule::whereHas('employee', fn($q) => $q->where('store_id', $storeId))
                ->whereBetween('schedule_date', [$fromDate, $toDate])
                ->where('generation_type', '!=', 'manual')
                ->delete();
        } else {
            Schedule::whereHas('employee', fn($q) => $q->where('store_id', $storeId))
                ->whereBetween('schedule_date', [$fromDate, $toDate])
                ->delete();
        }

        $schedules = [];

        if ($generationType === 'weekly' && !empty($weeklyPattern)) {
            foreach (CarbonPeriod::create($fromDate, $toDate) as $date) {
                $day = strtolower($date->englishDayOfWeek);
                $pattern = $weeklyPattern[$day] ?? null;

                if ($pattern) {
                    $result = $this->assignShiftsForPattern($storeId, $date, $employees, $shifts, $pattern, $createdBy);
                    $schedules = array_merge($schedules, $result);
                }
            }
        } else {
            foreach (CarbonPeriod::create($fromDate, $toDate) as $date) {
                // Jika daily filter aktif, cek tanggal hari dan tanggal
                if ($generationType === 'auto' && $dayOfWeek !== null && $dayOfMonth !== null) {
                    // Nama hari bahasa Inggris lowercase, contoh 'monday', 'tuesday'
                    $dayName = strtolower($date->format('l'));
                    if ($dayName !== strtolower($dayOfWeek) || $date->day !== (int)$dayOfMonth) {
                        continue; // skip tanggal ini karena tidak cocok filter daily
                    }
                }

                $result = $this->assignShiftsForDate($storeId, $date, $employees, $shifts, $store, $generationType, $createdBy);
                $schedules = array_merge($schedules, $result);
            }
        }

        return [
            'total_schedules' => count($schedules),
            'from' => $fromDate->toDateString(),
            'to' => $toDate->toDateString(),
            'generation_type' => $generationType,
            'created_by' => $createdBy,
        ];
    }

    private function assignShiftsForPattern($storeId, $date, $employees, $shifts, $pattern, $createdBy)
    {
        $assigned = collect();
        $allSchedules = [];

        // Pastikan admin tidak masuk jadwal
        $employees = $employees->filter(fn($emp) => $emp->role !== 'admin');

        foreach (['P', 'S', 'M', 'O'] as $code) {
            $shift = $shifts->firstWhere('shift_code', $code);
            $jumlah = $pattern[$code] ?? 0;

            if (!$shift) continue;

            $filtered = $employees->filter(fn($emp) => $shift->canAssignToGender($emp->gender));
            $available = $filtered->diff($assigned)->shuffle();
            $selected = $available->take($jumlah);

            foreach ($selected as $emp) {
                $assigned->push($emp);
                $allSchedules[] = $this->createScheduleRow($emp, $shift, $date, 'weekly', $createdBy, $storeId);
            }
        }

        return $allSchedules;
    }

    private function autoScheduleLogic($employee, $date, $shifts, $store)
    {
        $availableShifts = $shifts->filter(fn($shift) =>
        $shift->canAssignToGender($employee->gender) && $shift->shift_code !== 'O');

        $dayOfWeek = $date->dayOfWeek;

        if ($store->store_type === '24h') {
            if ($employee->gender === 'female') {
                return $availableShifts->whereIn('shift_code', ['P', 'S'])->random();
            } else {
                return $availableShifts->random();
            }
        } else {
            return $availableShifts->whereIn('shift_code', ['P', 'S'])->random();
        }
    }

    private function randomScheduleLogic($employee, $shifts, $offShift)
    {
        if (rand(1, 6) === 1) {
            return $offShift;
        }

        $availableShifts = $shifts->filter(fn($shift) =>
        $shift->canAssignToGender($employee->gender) && $shift->shift_code !== 'O');

        return $availableShifts->random();
    }

    private function assignShiftsForDate($storeId, $date, $employees, $shifts, $store, $generationType, $createdBy)
    {
        $employees = $employees->filter(fn($emp) => $emp->role !== 'admin');

        $pattern = ['O', 'M', 'S', 'P', 'M', 'S', 'P'];
        $allSchedules = [];

        foreach ($employees as $emp) {
            $dayIndex = $date->day - 1; // index hari dalam bulan
            $patternIndex = ($dayIndex + $emp->id) % count($pattern);
            $shiftCode = $pattern[$patternIndex];

            // ❌ Khusus perempuan, ganti 'M' dengan shift aman (misal Pagi)
            if ($emp->gender === 'female' && $shiftCode === 'M') {
                $shiftCode = 'P'; // bisa diganti 'S' kalau lebih cocok
            }

            $shift = $shifts->firstWhere('shift_code', $shiftCode);

            if (!$shift) {
                continue; // skip kalau shift tidak ketemu
            }

            $allSchedules[] = $this->createScheduleRow(
                $emp,
                $shift,
                $date,
                $generationType,
                $createdBy,
                $storeId
            );
        }

        return $allSchedules;
    }




    private function createScheduleRow($employee, $shift, $date, $generationType, $createdBy = null, $storeId)
    {
        // ✅ Kalau shift dummy "-", jangan simpan ke DB (atau bisa simpan dengan shift_id = null)
        if ($shift->id === null || $shift->shift_code === '-') {
            return Schedule::create([
                'store_id' => $storeId,
                'employee_id' => $employee->id,
                'shift_id' => null, // tidak ada shift valid
                'schedule_date' => $date,
                'month' => $date->month,
                'year' => $date->year,
                'generation_type' => $generationType,
                'status' => 'pending',
                'created_by' => $createdBy,
            ]);
        }

        return Schedule::create([
            'store_id' => $storeId,
            'employee_id' => $employee->id,
            'shift_id' => $shift->id,
            'schedule_date' => $date,
            'month' => $date->month,
            'year' => $date->year,
            'generation_type' => $generationType,
            'status' => 'pending',
            'created_by' => $createdBy,
        ]);
    }



    private function determineShift($employee, $date, &$offDaysCount, $requiredOffDays, $generationType, $createdBy, $shifts, $store)
    {
        $offShift = $shifts->where('shift_code', 'O')->first();

        // ✅ Hitung jumlah O yang sudah dimiliki karyawan ini di bulan berjalan
        $countOff = Schedule::where('employee_id', $employee->id)
            ->where('store_id', $store->id)
            ->where('month', $date->month)
            ->where('year', $date->year)
            ->whereHas('shift', fn($q) => $q->where('shift_code', 'O'))
            ->count();

        if ($countOff >= 5) {
            // ✅ Kalau sudah 5x O, kasih tanda "-" (bisa shift dummy atau null)
            return (object) [
                'id' => null,
                'shift_code' => '-', // tandanya tidak ada jadwal
            ];
        }

        // Aturan lama libur tiap minggu
        if ($offDaysCount < $requiredOffDays && $date->dayOfWeek === Carbon::SUNDAY) {
            return $offShift;
        }

        if ($generationType === 'auto' || $createdBy === 'auto') {
            return $this->autoScheduleLogic($employee, $date, $shifts, $store);
        } else {
            return $this->randomScheduleLogic($employee, $shifts, $offShift);
        }
    }


    public function insertManualSchedules(array $rawSchedules, int $storeId, int $month, int $year, ?int $createdBy)
    {
        // Hapus data sebelumnya (khusus store dan bulan/tahun ini)
        Schedule::whereHas('employee', fn($q) => $q->where('store_id', $storeId))
            ->where('month', $month)
            ->where('year', $year)
            ->delete();

        // Mapping shift_code ke shift_id
        $shiftMap = Shift::pluck('id', 'shift_code')->toArray();

        $schedules = collect($rawSchedules)->map(function ($item) use ($month, $year, $shiftMap, $createdBy, $storeId) {
            $shiftCode = $item['shift_code'];
            $shiftId = $shiftMap[$shiftCode] ?? null;

            if (!$shiftId) {
                throw new \Exception("Shift code {$shiftCode} tidak valid.");
            }

            return [
                'employee_id' => $item['employee_id'],
                'shift_id' => $shiftId,
                'schedule_date' => date("Y-m-d", strtotime("{$year}-{$month}-{$item['day']}")),
                'month' => $month,
                'year' => $year,
                'store_id' => $storeId, // ✅ tambahkan ini
                'generation_type' => 'manual',
                'status' => 'pending',
                'created_by' => $createdBy,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        })->toArray();

        Schedule::insert($schedules);

        return [
            'inserted' => count($schedules),
            'month' => $month,
            'year' => $year,
            'created_by' => $createdBy,
        ];
    }

    public function resetEmployeeSchedule(array $data): int
    {
        return Schedule::where('employee_id', $data['employee_id'])
            ->where('store_id', $data['store_id'])
            ->where('month', $data['month'])
            ->where('year', $data['year'])
            ->delete();
    }

    public function resetAllSchedulesByStore(array $params): int
    {
        $storeId = $params['store_id'];
        $month = $params['month'];
        $year = $params['year'];

        return Schedule::where('store_id', $storeId)
            ->where('month', $month)
            ->where('year', $year)
            ->delete();
    }

    // public function sendScheduleEmails($storeId, $month, $year, $createdBy)
    // {
    //     $employees = Employee::where('store_id', $storeId)
    //         ->where('status', 'active')
    //         ->with(['schedules' => function ($query) use ($month, $year) {
    //             $query->where('month', $month)->where('year', $year)->with('shift');
    //         }])->get();

    //     foreach ($employees as $employee) {
    //         if (!$employee->email) continue;

    //         $schedules = $employee->schedules;

    //         if ($schedules->isEmpty()) continue;

    //         Mail::to($employee->email)->queue(new ScheduleGeneratedMail(
    //             $employee,
    //             $schedules,
    //             $employee->schedules->first()->creator->name ?? $createdBy,
    //             $month,
    //             $year
    //         ));
    //     }
    // }



    public function sendScheduleEmails($storeId, $month, $year, $createdBy)
    {
        $employees = Employee::where('store_id', $storeId)
            ->where('status', 'active')
            ->with(['schedules' => function ($query) use ($month, $year) {
                $query->where('month', $month)
                    ->where('year', $year)
                    ->with('shift');
            }])->get();

        $countEmployees = $employees->count();

        foreach ($employees as $employee) {
            if (!$employee->email) {
                continue;
            }

            $schedules = $employee->schedules;

            if ($schedules->isEmpty()) {
                continue;
            }

            if ($countEmployees > 1000) {
                // kirim via queue (lebih ringan)
                dispatch(new SendScheduleEmailJob(
                    $employee,
                    $schedules,
                    $employee->schedules->first()->creator->name ?? $createdBy,
                    $month,
                    $year
                ));
            } else {
                // kirim langsung (sync)
                Mail::to($employee->email)->send(new ScheduleGeneratedMail(
                    $employee,
                    $schedules,
                    $employee->schedules->first()->creator->name ?? $createdBy,
                    $month,
                    $year
                ));
            }
        }
    }
}
