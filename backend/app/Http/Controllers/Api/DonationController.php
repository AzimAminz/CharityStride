<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\DonationConfig;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class DonationController extends Controller
{
    // ===== CONFIG =====
    
    public function getConfig($eventId)
    {
        $config = DonationConfig::where('event_id', $eventId)->first();
        
        if (!$config) {
            return response()->json([
                'has_target' => false,
                'target_amount' => null,
                'poster_url' => null
            ]);
        }
        
        return response()->json($config);
    }
    
    public function saveConfig(Request $request, $eventId)
    {
        $validator = Validator::make($request->all(), [
            'has_target' => 'required|boolean',
            'poster_url' => 'nullable|string',
            'target_amount' => 'nullable|integer|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $config = DonationConfig::updateOrCreate(
            ['event_id' => $eventId],
            $request->only(['has_target', 'poster_url', 'target_amount'])
        );

        return response()->json($config);
    }
    


}
