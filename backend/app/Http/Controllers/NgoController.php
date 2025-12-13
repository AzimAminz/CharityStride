<?php

namespace App\Http\Controllers;

use App\Http\Requests\NgoRegistrationRequest;
use App\Models\Ngo;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class NgoController extends Controller
{
    /**
     * Register a new NGO
     * 
     * @param NgoRegistrationRequest $request
     * @return JsonResponse
     */
    public function register(NgoRegistrationRequest $request): JsonResponse
    {
        try {
            // Get authenticated user
            $user = Auth::user();

            // Check if user already has an NGO registered
            if ($user->ngo) {
                return response()->json([
                    'message' => 'You have already registered an NGO',
                    'ngo' => $user->ngo
                ], 409); // 409 Conflict
            }

            // Create NGO with validated data
            $ngo = Ngo::create([
                'user_id' => $user->id,
                'name' => $request->name,
                'registration_no' => $request->registration_no,
                'registration_type' => $request->registration_type,
                'category' => $request->category,
                'established_date' => $request->established_date,
                'description' => $request->description,
                
                // Address
                'address' => $request->address,
                'city' => $request->city,
                'state' => $request->state,
                'postcode' => $request->postcode,
                'latitude' => $request->latitude,
                'longitude' => $request->longitude,
                
                // Contact
                'contact_email' => $request->contact_email,
                'contact_phone' => $request->contact_phone,
                
                // Banking (optional)
                'bank_name' => $request->bank_name,
                'bank_account_no' => $request->bank_account_no,
                'bank_account_name' => $request->bank_account_name,
                
                // Files
                'logo_url' => $request->logo_url,
                'registration_doc_url' => $request->registration_doc_url,
                
                // Default status
                'status' => 'pending',
            ]);

            return response()->json([
                'message' => 'NGO registration submitted successfully. Your application is pending approval.',
                'ngo' => $ngo
            ], 201); // 201 Created

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to register NGO',
                'error' => $e->getMessage()
            ], 500); // 500 Internal Server Error
        }
    }
}
