<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Carbon\{Carbon, CarbonPeriod};
use App\Models\{LeaveRequest, Shift, Schedule, Employee};

class LeaveRequestController extends Controller
{
    public function store(Request $req)
    {
        $user = $req->user(); // diasumsikan sudah return Employee model via auth

        $req->validate([
            'type'       => 'required|in:izin,cuti,sakit',
            'start_date' => 'required|date',
            'end_date'   => 'required|date|after_or_equal:start_date',
            'reason'     => 'nullable|string',
        ]);

        // minimal 7 hari sebelum start_date (kecuali sakit)
        $daysDiff = now()->diffInDays(Carbon::parse($req->start_date), false);
        if ($daysDiff < 7 && $req->type !== 'sakit') {
            return response()->json(['message' => 'Pengajuan minimal 7 hari sebelum tanggal mulai'], 422);
        }

        $lr = LeaveRequest::create([
            'store_id'    => $user->store_id,
            'employee_id' => $user->id,
            'type'        => $req->type,
            'start_date'  => $req->start_date,
            'end_date'    => $req->end_date,
            'reason'      => $req->reason,
            'status'      => 'pending',
        ]);

        // TODO: kirim notifikasi ke COS (email/notification queue)

        return response()->json($lr, 201);
    }

    public function index(Request $req)
    {
        $user = $req->user();

        if (in_array($user->role, ['cos', 'supervisor'])) {
            $list = LeaveRequest::where('store_id', $user->store_id)
                ->with('employee')
                ->orderBy('status')
                ->get();
        } else {
            $list = LeaveRequest::with(['employee', 'approver'])
                ->where('store_id', $user->store_id)
                ->orderBy('status')
                ->get();
        }

        // format tanggal
        $list = $list->map(function ($lr) {
            return [
                'id' => $lr->id,
                'employee' => $lr->employee,
                'type' => $lr->type,
                'start_date' => $lr->start_date->format('d-m-Y'),
                'end_date' => $lr->end_date->format('d-m-Y'),
                'status' => $lr->status,
                'approved_by' => $lr->approved_by,
            ];
        });

        return response()->json($list); // ⚡ wajib
    }



    public function approve(Request $req, $id)
    {
        $user = $req->user(); // approver
        $lr   = LeaveRequest::findOrFail($id);

        $requester = $lr->employee()->first();

        // validasi role approver
        if ($requester->role === 'cos' && $user->role !== 'supervisor') {
            return response()->json(['message' => 'Hanya supervisor yang dapat approve pengajuan COS'], 403);
        }
        if ($requester->role !== 'cos' && $user->role !== 'cos') {
            return response()->json(['message' => 'Hanya COS / Supervisor yang dapat approve'], 403);
        }

        $action = $req->input('action');

        if ($action === 'approve') {
            $lr->status      = 'approved';
            $lr->approved_by = $user->id;
            $lr->save();

            $offShift = Shift::where('shift_code', 'O')->first();
            if (!$offShift) {
                return response()->json(['message' => 'Shift Off (O) tidak ditemukan'], 404);
            }

            Schedule::where('employee_id', $lr->employee_id)
                ->whereBetween('schedule_date', [$lr->start_date, $lr->end_date])
                ->delete();

            $period = CarbonPeriod::create($lr->start_date, $lr->end_date);
            foreach ($period as $d) {
                try {
                    Schedule::create([
                        'store_id'       => $lr->store_id,
                        'employee_id'    => $lr->employee_id,
                        'shift_id'       => $offShift->id,
                        'schedule_date'  => $d->toDateString(),
                        'month'          => $d->month,
                        'year'           => $d->year,
                        'generation_type' => 'leave',
                        'status'         => 'approved',
                        'created_by'     => $user->id,
                    ]);
                } catch (\Exception $e) {
                    Log::warning('Schedule warning: ' . $e->getMessage());
                }
            }
        }
    }
}
