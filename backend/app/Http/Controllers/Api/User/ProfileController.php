<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\Rules\Password;
use App\Models\Tac;
use App\Mail\TacMail;
use Carbon\Carbon;

class ProfileController extends Controller
{
    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $user->id,
            'phone' => 'nullable|string|max:20',
            'ic_number' => 'nullable|string|max:20',
            'photo' => 'nullable|string', // Base64 encoded cropped image
        ]);

        if (isset($validated['photo']) && !empty($validated['photo'])) {
            // Handle Base64 image upload
            if (preg_match('/^data:image\/(\w+);base64,/', $validated['photo'], $type)) {
                $data = substr($validated['photo'], strpos($validated['photo'], ',') + 1);
                $type = strtolower($type[1]); // jpg, png, etc

                if (!in_array($type, ['jpg', 'jpeg', 'gif', 'png'])) {
                    return response()->json(['message' => 'Invalid image type'], 422);
                }

                $data = base64_decode($data);

                if ($data === false) {
                    return response()->json(['message' => 'base64_decode failed'], 422);
                }

                $fileName = 'profile_' . $user->id . '_' . time() . '.' . $type;
                $filePath = 'profiles/' . $fileName;

                // Delete old photo if it exists and is not a default URL
                if ($user->photo && !str_starts_with($user->photo, 'http')) {
                    Storage::disk('public')->delete($user->photo);
                }

                Storage::disk('public')->put($filePath, $data);
                $user->photo = $filePath; // Store relative path
            }
        }

        $user->name = $validated['name'];
        $user->email = $validated['email'];
        $user->phone = $validated['phone'];
        $user->ic_number = $validated['ic_number'];
        $user->save();

        return response()->json([
            'message' => 'Profile updated successfully',
            'user' => $user->fresh(),
        ]);
    }

    public function updatePassword(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'current_password' => 'required|current_password',
            'password' => ['required', 'confirmed', Password::min(8)],
        ]);

        $user->password = Hash::make($request->password);
        $user->save();

        return response()->json([
            'message' => 'Password updated successfully',
        ]);
    }

    public function requestTac(Request $request)
    {
        $user = $request->user();
        
        // Rate limiting: check if a tac was sent recently (e.g., last 1 minute)
        $existingTac = Tac::where('email', $user->email)
            ->where('created_at', '>', Carbon::now()->subMinute())
            ->first();
            
        if ($existingTac) {
            return response()->json([
                'message' => 'Please wait a minute before requesting another code.',
            ], 429);
        }

        // Generate 6-digit code
        $code = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        // Save to DB
        Tac::create([
            'email' => $user->email,
            'code' => $code,
            'expires_at' => Carbon::now()->addMinutes(10),
        ]);

        // Send Email
        Mail::to($user->email)->send(new TacMail($code));

        return response()->json([
            'message' => 'Verification code has been sent to your email.',
        ]);
    }

    public function updatePasswordWithTac(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'code' => 'required|string|size:6',
            'password' => ['required', 'confirmed', Password::min(8)],
        ]);

        // Verify TAC
        $tac = Tac::where('email', $user->email)
            ->where('code', $request->code)
            ->where('expires_at', '>', Carbon::now())
            ->first();

        if (!$tac) {
            return response()->json([
                'message' => 'Invalid or expired verification code.',
                'errors' => ['code' => ['Invalid or expired verification code.']]
            ], 422);
        }

        // Update password
        $user->password = Hash::make($request->password);
        $user->save();

        // Delete used TAC
        $tac->delete();

        return response()->json([
            'message' => 'Password has been updated successfully using email verification.',
        ]);
    }
}
