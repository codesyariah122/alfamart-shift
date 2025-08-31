<?php

namespace App\Http\Controllers;

use App\Models\{Store};
use Illuminate\Http\Request;
use Illuminate\Support\Facades\{Validator, Auth};

class StoreController extends Controller
{
    public function index(Request $request)
    {
        $employee = Auth::guard('sanctum')->user();

        if (!$employee) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 401);
        }

        // Cek rolenya
        $role = $employee->role;

        if ($role === 'admin') {
            // Admin: tampilkan semua store
            $stores = Store::with(['employees' => function ($query) {
                $query->where('status', 'active');
            }])->get();
        } else if (in_array($role, ['employee', 'cos', 'acos'])) {
            // COS atau ACOS: hanya tampilkan store sesuai store_id-nya
            $stores = Store::with(['employees' => function ($query) {
                $query->where('status', 'active');
            }])->where('id', $employee->store_id)->get();
        } else {
            return response()->json([
                'success' => false,
                'message' => 'Access denied'
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data' => $stores
        ]);
    }

// berdasarkan setting toko
//    public function updateSettings(Request $request, $id)
//    {
//        $validator = Validator::make($request->all(), [
//            'store_type' => 'sometimes|in:24h,normal',
//            'off_days_per_month' => 'sometimes|integer|min:1|max:10',
//            'whatsapp_number' => 'sometimes|string'
//        ]);

//        if ($validator->fails()) {
//            return response()->json([
//                'success' => false,
//                 'message' => 'Validation error',
//                 'errors' => $validator->errors()
//             ], 422);
//         }

//         $store = Store::findOrFail($id);
//         $store->update($request->only([
//             'store_type',
//             'off_days_per_month',
//             'whatsapp_number'
//         ]));

//         return response()->json([
//             'success' => true,
//             'message' => 'Pengaturan toko berhasil diupdate',
//             'data' => $store->fresh()
//         ]);
//     }


// berdasarkan /stores/{id}
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'store_name' => 'required|string|max:100',
            'store_code' => 'required|string',
            'store_type' => 'required|in:24h,normal',
            'address' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:20',
            'off_days_per_month' => 'nullable|integer|min:0|max:31',
            'whatsapp_number' => 'nullable|string|max:20',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        $store = Store::findOrFail($id);

        $store->update($request->only([
            'store_name', 'store_code', 'store_type',
            'address', 'phone', 'off_days_per_month', 'whatsapp_number'
        ]));

        return response()->json([
            'success' => true,
            'message' => 'Toko berhasil diperbarui',
            'data' => $store->fresh()
        ]);
    }
}
