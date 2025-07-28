<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\{Store};

class PublicApiController extends Controller
{
    public function listStore(Request $request)
    {
        $stores = Store::with(['employees' => function ($query) {
            $query->where('status', 'active');
        }])->get();

        return response()->json([
            'success' => true,
            'data' => $stores
        ]);
    }
}
