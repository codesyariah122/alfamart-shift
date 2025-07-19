<?php

namespace App\Services;

use App\Models\Employee;
use App\Models\Schedule;
use App\Models\Shift;
use App\Models\Store;
use Carbon\Carbon;
use Carbon\CarbonPeriod;

class ScheduleGeneratorService
{
    public function generateSchedule($storeId, $month, $year, $generationType, $from = null, $to = null, $createdBy, $weeklyPattern = [])
    {
        $store = Store::findOrFail($storeId);
        $employees = Employee::where('store_id', $storeId)->where('status', 'active')->get();
        $shifts = Shift::all();

        // Tentukan rentang tanggal
        $fromDate = $from ?? Carbon::create($year, $month, 1);
        $toDate = $to ?? Carbon::create($year, $month)->endOfMonth();

        // Hapus jadwal yang sudah ada dalam rentang
        Schedule::whereHas('employee', fn($q) => $q->where('store_id', $storeId))
            ->whereBetween('schedule_date', [$fromDate, $toDate])
            ->delete();

        // Hapus jadwal lama (berdasarkan mode)
        if ($generationType === 'hybrid') {
            Schedule::whereHas('employee', fn($q) => $q->where('store_id', $storeId))
                ->whereBetween('schedule_date', [$fromDate, $toDate])
                ->where('generation_type', '!=', 'manual') // ⬅️ Jangan hapus manual
                ->delete();
        } else {
            Schedule::whereHas('employee', fn($q) => $q->where('store_id', $storeId))
                ->whereBetween('schedule_date', [$fromDate, $toDate])
                ->delete();
        }

        $schedules = [];

        // Logika penjadwalan mingguan berdasarkan pola
        if ($generationType === 'weekly' && !empty($weeklyPattern)) {
            foreach (CarbonPeriod::create($fromDate, $toDate) as $date) {
                $day = strtolower($date->englishDayOfWeek);
                $pattern = $weeklyPattern[$day] ?? null;

                if ($pattern) {
                    $result = $this->assignShiftsForPattern($date, $employees, $shifts, $pattern, $createdBy);
                    $schedules = array_merge($schedules, $result);
                }
            }
        } else {
            // Penjadwalan harian berdasarkan logika default
            foreach (CarbonPeriod::create($fromDate, $toDate) as $date) {
                $result = $this->assignShiftsForDate($date, $employees, $shifts, $store, $generationType, $createdBy);
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

    private function assignShiftsForPattern($date, $employees, $shifts, $pattern, $createdBy)
    {
        $assigned = collect();
        $allSchedules = [];

        foreach (['P', 'S', 'M', 'O'] as $code) {
            $shift = $shifts->firstWhere('shift_code', $code);
            $jumlah = $pattern[$code] ?? 0;

            if (!$shift) continue;

            // Filter gender sesuai aturan shift
            $filtered = $employees->filter(function ($emp) use ($shift) {
                return $shift->canAssignToGender($emp->gender);
            });

            // Hindari assign yang sama
            $available = $filtered->diff($assigned)->shuffle();
            $selected = $available->take($jumlah);

            foreach ($selected as $emp) {
                $assigned->push($emp);
                $allSchedules[] = $this->createScheduleRow($emp, $shift, $date, 'weekly', $createdBy);
            }
        }

        return $allSchedules;
    }



    private function determineShift($employee, $date, &$offDaysCount, $requiredOffDays, $generationType, $createdBy, $shifts, $store)
    {
        $offShift = $shifts->where('shift_code', 'O')->first();

        // Libur setiap 7 hari, atau jika belum mencapai kuota
        if ($offDaysCount < $requiredOffDays && $date->dayOfWeek === Carbon::SUNDAY) {
            return $offShift;
        }

        if ($generationType === 'auto' || $createdBy === 'auto') {
            return $this->autoScheduleLogic($employee, $date, $shifts, $store);
        } else {
            return $this->randomScheduleLogic($employee, $shifts, $offShift);
        }
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

    private function assignShiftsForDate($date, $employees, $shifts, $store, $generationType, $createdBy = null)
    {
        $available = $employees->shuffle();
        $assigned = collect();

        $pria = $available->where('gender', 'male');
        $wanita = $available->where('gender', 'female');

        // Shift malam (khusus pria)
        $malam = $pria->take(2);
        $assigned = $assigned->merge($malam);

        // Shift pagi (3 orang)
        $sisa = $available->diff($assigned)->shuffle();
        $pagi = $sisa->take(3);
        $assigned = $assigned->merge($pagi);

        // Shift siang (3 orang)
        $sisa = $available->diff($assigned)->shuffle();
        $siang = $sisa->take(3);
        $assigned = $assigned->merge($siang);

        // Libur (2 orang)
        $sisa = $available->diff($assigned)->shuffle();
        $libur = $sisa->take(2);

        $shiftP = $shifts->firstWhere('shift_code', 'P');
        $shiftS = $shifts->firstWhere('shift_code', 'S');
        $shiftM = $shifts->firstWhere('shift_code', 'M');
        $shiftO = $shifts->firstWhere('shift_code', 'O');

        $allSchedules = [];

        foreach ($pagi as $emp) {
            $allSchedules[] = $this->createScheduleRow($emp, $shiftP, $date, $generationType, $createdBy);
        }
        foreach ($siang as $emp) {
            $allSchedules[] = $this->createScheduleRow($emp, $shiftS, $date, $generationType, $createdBy);
        }
        foreach ($malam as $emp) {
            $allSchedules[] = $this->createScheduleRow($emp, $shiftM, $date, $generationType, $createdBy);
        }
        foreach ($libur as $emp) {
            $allSchedules[] = $this->createScheduleRow($emp, $shiftO, $date, $generationType, $createdBy);
        }

        return $allSchedules;
    }

    private function createScheduleRow($employee, $shift, $date, $generationType, $createdBy = null)
    {
        return Schedule::create([
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
}
