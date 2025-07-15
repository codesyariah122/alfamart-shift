<?php

namespace App\Http\Controllers;

use App\Models\Store;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class StoreController extends Controller
{
    public function index(Request $request)
    {
        $stores = Store::with(['employees' => function($query) {
            $query->where('status', 'active');
        }])->get();

        return response()->json([
            'success' => true,
            'data' => $stores
        ]);
    }

    public function updateSettings(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'store_type' => 'sometimes|in:24h,normal',
            'off_days_per_month' => 'sometimes|integer|min:1|max:10',
            'whatsapp_number' => 'sometimes|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $store = Store::findOrFail($id);
        $store->update($request->only([
            'store_type', 'off_days_per_month', 'whatsapp_number'
        ]));

        return response()->json([
            'success' => true,
            'message' => 'Pengaturan toko berhasil diupdate',
            'data' => $store->fresh()
        ]);
    }
}