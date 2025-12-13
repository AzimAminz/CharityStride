<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\DonationConfig;
use App\Models\MoneyDonationOption;
use App\Models\ItemDonationOption;
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
                'accepts_money' => false,
                'accepts_items' => false
            ]);
        }
        
        return response()->json($config);
    }
    
    public function saveConfig(Request $request, $eventId)
    {
        $validator = Validator::make($request->all(), [
            'accepts_money' => 'required|boolean',
            'accepts_items' => 'required|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $config = DonationConfig::updateOrCreate(
            ['event_id' => $eventId],
            $request->only(['accepts_money', 'accepts_items'])
        );

        return response()->json($config);
    }
    
    // ===== MONEY OPTIONS =====
    
    public function getMoneyOptions($eventId)
    {
        $options = MoneyDonationOption::where('event_id', $eventId)->get();
        return response()->json($options);
    }
    
    public function createMoneyOption(Request $request, $eventId)
    {
        $validator = Validator::make($request->all(), [
            'amount_type' => 'required|in:fixed,free_amount,package',
            'amount' => 'nullable|integer|min:0',
            'package_name' => 'nullable|string|max:100',
            'package_description' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $option = MoneyDonationOption::create([
            'event_id' => $eventId,
            ...$request->only(['amount_type', 'amount', 'package_name', 'package_description'])
        ]);

        return response()->json($option, 201);
    }
    
    public function updateMoneyOption(Request $request, $optionId)
    {
        $option = MoneyDonationOption::findOrFail($optionId);
        
        $validator = Validator::make($request->all(), [
            'amount_type' => 'sometimes|in:fixed,free_amount,package',
            'amount' => 'nullable|integer|min:0',
            'package_name' => 'nullable|string|max:100',
            'package_description' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $option->update($request->only(['amount_type', 'amount', 'package_name', 'package_description']));

        return response()->json($option);
    }
    
    public function deleteMoneyOption($optionId)
    {
        $option = MoneyDonationOption::findOrFail($optionId);
        $option->delete();
        
        return response()->json(['message' => 'Money option deleted successfully']);
    }
    
    // ===== ITEM OPTIONS =====
    
    public function getItemOptions($eventId)
    {
        $options = ItemDonationOption::where('event_id', $eventId)->get();
        return response()->json($options);
    }
    
    public function createItemOption(Request $request, $eventId)
    {
        $validator = Validator::make($request->all(), [
            'item_category' => 'required|in:food,clothing,medical_supplies,school_supplies',
            'item_name' => 'required|string',
            'item_description' => 'nullable|string',
            'quantity_type' => 'required|in:fixed,flexible',
            'target_quantity' => 'nullable|integer|min:0',
            'unit' => 'required|string|max:50',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $option = ItemDonationOption::create([
            'event_id' => $eventId,
            'current_quantity' => 0,
            ...$request->only(['item_category', 'item_name', 'item_description', 'quantity_type', 'target_quantity', 'unit'])
        ]);

        return response()->json($option, 201);
    }
    
    public function updateItemOption(Request $request, $optionId)
    {
        $option = ItemDonationOption::findOrFail($optionId);
        
        $validator = Validator::make($request->all(), [
            'item_category' => 'sometimes|in:food,clothing,medical_supplies,school_supplies',
            'item_name' => 'sometimes|string',
            'item_description' => 'nullable|string',
            'quantity_type' => 'sometimes|in:fixed,flexible',
            'target_quantity' => 'nullable|integer|min:0',
            'unit' => 'sometimes|string|max:50',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $option->update($request->only(['item_category', 'item_name', 'item_description', 'quantity_type', 'target_quantity', 'unit']));

        return response()->json($option);
    }
    
    public function deleteItemOption($optionId)
    {
        $option = ItemDonationOption::findOrFail($optionId);
        $option->delete();
        
        return response()->json(['message' => 'Item option deleted successfully']);
    }
}
