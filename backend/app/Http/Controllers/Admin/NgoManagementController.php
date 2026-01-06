<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Ngo;
use App\Mail\NgoStatusUpdated;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Mail;

class NgoManagementController extends Controller
{
    /**
     * List NGOs with filters and pagination
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        $status = $request->query('status');
        $search = $request->query('search');
        $perPage = $request->query('per_page', 10);

        $query = Ngo::with('user:id,name,email')
            ->withSum('donationRegistrations as total_funds_raised', 'amount_paid');

        // Filter by status
        if ($status && in_array($status, ['pending', 'approved', 'rejected', 'blocked'])) {
            $query->where('status', $status);
        }

        // Search by name, registration_no, or category
        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('registration_no', 'like', "%{$search}%")
                  ->orWhere('category', 'like', "%{$search}%");
            });
        }

        // Order by latest first
        $query->orderBy('created_at', 'desc');

        // Paginate
        $ngos = $query->paginate($perPage);

        return response()->json([
            'data' => $ngos->items(),
            'meta' => [
                'current_page' => $ngos->currentPage(),
                'total' => $ngos->total(),
                'per_page' => $ngos->perPage(),
                'last_page' => $ngos->lastPage(),
                'from' => $ngos->firstItem(),
                'to' => $ngos->lastItem(),
            ]
        ]);
    }

    /**
     * Get NGO details
     * 
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        $ngo = Ngo::with('user:id,name,email,phone')->find($id);

        if (!$ngo) {
            return response()->json([
                'message' => 'NGO not found'
            ], 404);
        }

        return response()->json([
            'ngo' => $ngo,
            'user' => $ngo->user
        ]);
    }

    /**
     * Update NGO status
     * 
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateStatus(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'status' => 'required|in:pending,approved,rejected,blocked'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $ngo = Ngo::with('user')->find($id);

        if (!$ngo) {
            return response()->json([
                'message' => 'NGO not found'
            ], 404);
        }

        $oldStatus = $ngo->status;
        $newStatus = $request->status;

        // Update NGO status
        $ngo->status = $newStatus;
        $ngo->save();

        // Automatic role changes based on NGO status
        if ($oldStatus !== $newStatus && $ngo->user) {
            $user = $ngo->user;
            
            switch ($newStatus) {
                case 'approved':
                    // Change role from 'user' to 'ngo'
                    $user->role = 'ngo';
                    $user->status = true; // Ensure account is active
                    $user->save();
                    break;
                    
                case 'rejected':
                    // Change role from 'ngo' back to 'user' (if was ngo)
                    if ($user->role === 'ngo') {
                        $user->role = 'user';
                    }
                    $user->status = true; // Keep account active
                    $user->save();
                    break;
                    
                case 'blocked':
                    // Block the user account
                    $user->status = false; // Disable login
                    $user->save();
                    break;
            }
            
            // Force logout by deleting all user tokens
            // User will get 401 on next API call and be forced to re-login
            $user->tokens()->delete();
        }

        // Send email notification if status actually changed
        if ($oldStatus !== $newStatus && $ngo->user) {
            try {
                Mail::to($ngo->user->email)->send(new NgoStatusUpdated($ngo, $newStatus));
            } catch (\Exception $e) {
                // Log error but don't fail the request
                \Log::error('Failed to send NGO status email: ' . $e->getMessage());
            }
        }

        return response()->json([
            'message' => 'NGO status updated successfully',
            'ngo' => $ngo,
            'user_role_updated' => $oldStatus !== $newStatus,
            'tokens_revoked' => $oldStatus !== $newStatus // Inform frontend
        ]);
    }
}
