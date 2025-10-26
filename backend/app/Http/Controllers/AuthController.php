<?php

namespace App\Http\Controllers;

use App\Models\User;
use Laravel\Socialite\Facades\Socialite;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;



class AuthController extends Controller
{

    public function register(RegisterRequest $request)
    {

        $validate = $request->validated();

        try {
            // 1️⃣ Auto generate avatar berdasarkan nama user
            $avatarUrl = 'https://ui-avatars.com/api/?name=' . urlencode($validate['name']) . '&background=random&color=fff';

            // 2️⃣ Simpan user baru
            $user = User::create([
                'name' => $validate['name'],
                'email' => $validate['email'],
                'password' => Hash::make($validate['password']),
                'role' => 'user',
                'status' => true,
                'phone' => $validate['phone'],
                'birthdate' => $validate['birthdate'],
                'photo' => $avatarUrl
            ]);

            // 3️⃣ Hasilkan Sanctum token
            $token = $user->createToken('auth_token')->plainTextToken;

            // 4️⃣ Return response
            return response()->json([
                'message' => 'User registered successfully',
                'user' => $user,
                'token' => $token,
            ], 201);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Registration failed', 'error' => $e->getMessage()], 500);
        }
    }

    public function login(LoginRequest $request)
    {
        $validate = $request->validated();

        try {
            // Periksa user berdasarkan email
            $user = User::where('email', $validate['email'])->first();

            if (! $user || ! Hash::check($validate['password'], $user->password)) {
                throw ValidationException::withMessages([
                    'email' => ['Email or password is incorrect.'],
                ]);
            }

            // Hasilkan Sanctum token
            $token = $user->createToken('auth_token')->plainTextToken;

            // Return response
            return response()->json([
                'message' => 'User logged in successfully',
                'user' => $user,
                'token' => $token,
            ], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Login failed', 'error' => $e->getMessage()], 500);
        }
    }

    public function googleLogin(Request $request)
    {
        try {
            $googleToken = $request->input('token');
            /** @var GoogleProvider $provider */
            $provider = Socialite::driver('google');

            $googleUser = $provider->userFromToken($googleToken);

            // 1️⃣ Cari user ikut email
            $user = User::where('email', $googleUser->getEmail())->first();

            if ($user) {
                // 2️⃣ Kalau belum link Google ID, linkkan
                if (!$user->google_id) {
                    $user->update([
                        'google_id' => $googleUser->getId(),
                        'photo' => $googleUser->getAvatar() ?? $user->photo,
                    ]);
                }
            } else {
                // 3️⃣ Cipta user baru (tanpa phone/birthdate)
                $user = User::create([
                    'name' => $googleUser->getName(),
                    'email' => $googleUser->getEmail(),
                    'google_id' => $googleUser->getId(),
                    'password' => Hash::make(uniqid()),
                    'role' => 'user',
                    'status' => true,
                    'photo' => $googleUser->getAvatar() ?? 'https://ui-avatars.com/api/?name=' . urlencode($googleUser->getName()) . '&background=random&color=fff',
                ]);
            }

            // 4️⃣ Hasilkan token Sanctum
            $token = $user->createToken('auth_token')->plainTextToken;

            // 5️⃣ Semak sama ada profile lengkap
            $isProfileComplete = $user->phone && $user->birthdate;

            return response()->json([
                'message' => $user->wasRecentlyCreated ? 'Google registration successful' : 'Google login successful',
                'user' => $user,
                'token' => $token,
                'profile_complete' => $isProfileComplete,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Google login failed',
                'error' => $e->getMessage(),
            ], 500);
        }
    } 

    public function completeProfile(Request $request)
    {
        $request->validate([
            'phone' => 'required|string|max:30',
            'birthdate' => 'required|date',
        ]);

        $user = $request->user();
        $user->update([
            'phone' => $request->phone,
            'birthdate' => $request->birthdate,
        ]);

        return response()->json([
            'message' => 'Profile updated successfully',
            'user' => $user,
        ]);
    }


    public function logout(Request $request)
    {
        // Hapus token user sekarang
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'status' => true,
            'message' => 'User logged out successfully'
        ], 200);
    }

    public function profile(Request $request)
    {
        return response()->json([
            'status' => true,
            'user' => $request->user(),
        ]);
    }
}
