<?php
// File: app/Services/ScheduleGeneratorService.php

namespace App\Services;

use App\Models\Employee;
use App\Models\Schedule;
use App\Models\Shift;
use App\Models\Store;
use Carbon\Carbon;
use Carbon\CarbonPeriod;

class ScheduleGeneratorService
{
    public function generateSchedule($storeId, $month, $year, $generationType, $from = null, $to = null)
    {
        $store = Store::findOrFail($storeId);
        $employees = Employee::where('store_id', $storeId)
            ->where('status', 'active')
            ->get();
        // Shift all
        $shifts = Shift::all();

        // Rentang tanggal: default 1 bulan penuh jika tidak ada input custom
        $fromDate = $from ? Carbon::parse($from) : Carbon::create($year, $month, 1);
        $toDate = $to ? Carbon::parse($to) : Carbon::create($year, $month)->endOfMonth();

        // Hapus jadwal di range ini terlebih dahulu
        Schedule::whereHas('employee', fn($q) => $q->where('store_id', $storeId))
            ->whereBetween('schedule_date', [$fromDate, $toDate])
            ->delete();

        $schedules = [];

        foreach ($employees as $employee) {
            $offDaysCount = 0;
            $requiredOffDays = $store->off_days_per_month;

            foreach (CarbonPeriod::create($fromDate, $toDate) as $date) {
                $shift = $this->determineShift(
                    $employee,
                    $date,
                    $offDaysCount,
                    $requiredOffDays,
                    $generationType,
                    $shifts,
                    $store
                );

                if ($shift->shift_code === 'O') {
                    $offDaysCount++;
                }

                $schedule = Schedule::create([
                    'employee_id' => $employee->id,
                    'shift_id' => $shift->id,
                    'schedule_date' => $date,
                    'month' => $date->month,
                    'year' => $date->year,
                    'generation_type' => $generationType
                ]);

                $schedules[] = $schedule;
            }
        }

        return [
            'total_schedules' => count($schedules),
            'from' => $fromDate->toDateString(),
            'to' => $toDate->toDateString(),
            'generation_type' => $generationType
        ];
    }

    private function determineShift($employee, $date, &$offDaysCount, $requiredOffDays, $generationType, $shifts, $store)
    {
        $offShift = $shifts->where('shift_code', 'O')->first();

        // Libur setiap 7 hari, atau jika belum mencapai kuota
        if ($offDaysCount < $requiredOffDays && $date->dayOfWeek === Carbon::SUNDAY) {
            return $offShift;
        }

        if ($generationType === 'auto') {
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
}
