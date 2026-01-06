<?php

namespace App\Http\Controllers\Api\Ngo;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class NgoProfileController extends Controller
{
    public function updateProfile(Request $request)
    {
        $user = $request->user();
        $ngo = $user->ngo;

        if (!$ngo) {
            return response()->json(['message' => 'NGO not found'], 404);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'contact_email' => 'required|email',
            'contact_phone' => 'required|string|max:20',
            'address' => 'required|string',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'postcode' => 'nullable|string|max:10',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'photo' => 'nullable|string', // Base64 logo
        ]);

        if (isset($validated['photo']) && !empty($validated['photo'])) {
            if (preg_match('/^data:image\/(\w+);base64,/', $validated['photo'], $type)) {
                $data = substr($validated['photo'], strpos($validated['photo'], ',') + 1);
                $type = strtolower($type[1]);

                if (!in_array($type, ['jpg', 'jpeg', 'gif', 'png'])) {
                    return response()->json(['message' => 'Invalid image type'], 422);
                }

                $data = base64_decode($data);
                $fileName = 'ngo_' . $ngo->id . '_' . time() . '.' . $type;
                $filePath = 'logos/' . $fileName;

                if ($ngo->logo_url && !str_starts_with($ngo->logo_url, 'http')) {
                    Storage::disk('public')->delete($ngo->logo_url);
                }

                Storage::disk('public')->put($filePath, $data);
                $ngo->logo_url = $filePath;
            }
        }

        $ngo->update([
            'name' => $validated['name'],
            'description' => $validated['description'],
            'contact_email' => $validated['contact_email'],
            'contact_phone' => $validated['contact_phone'],
            'address' => $validated['address'],
            'city' => $validated['city'],
            'state' => $validated['state'],
            'postcode' => $validated['postcode'],
            'latitude' => $validated['latitude'] ?? $ngo->latitude,
            'longitude' => $validated['longitude'] ?? $ngo->longitude,
        ]);

        return response()->json([
            'message' => 'NGO profile updated successfully',
            'ngo' => $ngo->fresh(),
        ]);
    }

    public function updateBank(Request $request)
    {
        $user = $request->user();
        $ngo = $user->ngo;

        if (!$ngo) {
            return response()->json(['message' => 'NGO not found'], 404);
        }

        $validated = $request->validate([
            'bank_name' => 'required|string|max:255',
            'bank_account_name' => 'required|string|max:255',
            'bank_account_no' => 'required|string|max:255',
        ]);

        $ngo->update($validated);

        return response()->json([
            'message' => 'Bank details updated successfully',
            'ngo' => $ngo->fresh(),
        ]);
    }
}
