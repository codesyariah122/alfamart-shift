<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use App\Models\{Employee, ShiftSwap, Schedule};
use App\Http\Resources\ShiftSwapResource;

class ShiftSwapController extends Controller
{
    /**
     * Store a new shift swap request
     */
    public function store(Request $req)
    {
        $req->validate([
            'partner_id' => 'required|exists:employees,id',
            'date'       => 'required|date',
        ]);

        $user = $req->user();

        // ambil partner
        $partner = Employee::findOrFail($req->partner_id);

        // validasi toko dan diri sendiri
        if ($partner->store_id !== $user->store_id) {
            return response()->json(['message' => 'Partner beda toko'], 422);
        }
        if ($partner->id === $user->id) {
            return response()->json(['message' => 'Tidak bisa tukar shift dengan diri sendiri'], 422);
        }

        // validasi duplikat pengajuan untuk tanggal sama
        $existing = ShiftSwap::where('date', $req->date)
            ->where(function ($q) use ($user, $partner) {
                $q->where('requester_id', $user->id)
                    ->orWhere('partner_id', $user->id)
                    ->orWhere('requester_id', $partner->id)
                    ->orWhere('partner_id', $partner->id);
            })
            ->where('status', 'pending')
            ->first();

        if ($existing) {
            return response()->json(['message' => 'Tukar shift untuk tanggal ini sudah diajukan'], 422);
        }

        // ambil schedule masing-masing employee
        $requesterSchedule = Schedule::where('employee_id', $user->id)
            ->where('schedule_date', $req->date)
            ->first();

        $partnerSchedule = Schedule::where('employee_id', $partner->id)
            ->where('schedule_date', $req->date)
            ->first();

        if (!$requesterSchedule || !$partnerSchedule) {
            return response()->json([
                'message' => 'Tidak bisa mengajukan swap: salah satu shift belum tersedia'
            ], 422);
        }

        // create swap dengan shift_id dari schedule
        $ss = ShiftSwap::create([
            'store_id'           => $user->store_id,
            'requester_id'       => $user->id,
            'partner_id'         => $partner->id,
            'date'               => $req->date,
            'requester_shift_id' => $requesterSchedule->shift_id,
            'partner_shift_id'   => $partnerSchedule->shift_id,
            'status'             => 'pending',
        ]);

        // eager load
        $ss->load(['requester', 'partner']);

        // format date dengan Carbon
        $ss->date = Carbon::parse($ss->date)->format('Y-m-d');

        return response()->json([
            'data' => $ss,
            'message' => 'Pengajuan tukar shift berhasil'
        ], 201);
    }


    public function index(Request $req)
    {
        $user = $req->user();

        $swaps = ShiftSwap::with(['requester', 'partner', 'approvedBy'])
            ->where('store_id', $user->store_id)
            ->orderBy('date', 'desc')
            ->get();

        return ShiftSwapResource::collection($swaps)->response()->setStatusCode(200);
    }

    /**
     * Approve or reject a shift swap
     */
    public function approve(Request $req, $id)
    {
        $user = $req->user();
        $swap = ShiftSwap::with(['requester', 'partner'])->findOrFail($id);

        // Hanya COS yang bisa approve
        if ($user->role !== 'cos') {
            return response()->json(['message' => 'Hanya COS yang dapat approve'], 403);
        }

        $action = $req->input('action', 'approve'); // default approve

        if ($action === 'reject') {
            $swap->status = 'rejected';
            $swap->approved_by = $user->id;
            $swap->save();

            return response()->json([
                'data' => $swap,
                'message' => 'Pengajuan tukar shift ditolak'
            ]);
        }

        // ambil schedule masing-masing
        $schedules = Schedule::whereIn('employee_id', [$swap->requester_id, $swap->partner_id])
            ->where('schedule_date', $swap->date)
            ->get()
            ->keyBy('employee_id');

        if (!$schedules->has($swap->requester_id) || !$schedules->has($swap->partner_id)) {
            return response()->json(['message' => 'Schedule tidak ditemukan'], 404);
        }

        // lakukan swap dalam transaction
        DB::transaction(function () use ($schedules, $swap, $user) {
            $temp = $schedules[$swap->requester_id]->shift_id ?? null;
            $schedules[$swap->requester_id]->shift_id = $schedules[$swap->partner_id]->shift_id ?? null;
            $schedules[$swap->partner_id]->shift_id = $temp;

            $schedules[$swap->requester_id]->save();
            $schedules[$swap->partner_id]->save();

            $swap->status = 'approved';
            $swap->approved_by = $user->id;
            $swap->save();
        });

        return response()->json([
            'data' => $swap,
            'message' => 'Shift berhasil di-swap'
        ]);
    }
}
