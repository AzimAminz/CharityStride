<?php

namespace App\Http\Controllers\Api\Ngo;

use App\Http\Controllers\Controller;
use App\Models\SavedLocation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class SavedLocationController extends Controller
{
    /**
     * Get all saved locations for the authenticated NGO
     */
    public function index()
    {
        $ngo = Auth::user()->ngo;
        
        if (!$ngo) {
            return response()->json(['message' => 'NGO profile not found'], 404);
        }
        
        $locations = SavedLocation::where('ngo_id', $ngo->id)
            ->orderBy('name')
            ->get();
        
        return response()->json($locations);
    }

    /**
     * Save a new location
     */
    public function store(Request $request)
    {
        $ngo = Auth::user()->ngo;
        
        if (!$ngo) {
            return response()->json(['message' => 'NGO profile not found'], 404);
        }
        
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'address' => 'required|string',
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $location = SavedLocation::create([
            'ngo_id' => $ngo->id,
            ...$request->only(['name', 'address', 'latitude', 'longitude', 'notes'])
        ]);

        return response()->json($location, 201);
    }

    /**
     * Delete a saved location
     */
    public function destroy($id)
    {
        $ngo = Auth::user()->ngo;
        
        if (!$ngo) {
            return response()->json(['message' => 'NGO profile not found'], 404);
        }
        
        $location = SavedLocation::where('ngo_id', $ngo->id)
            ->findOrFail($id);
        
        $location->delete();
        
        return response()->json(['message' => 'Location deleted successfully']);
    }
}
