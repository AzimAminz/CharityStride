<?php

namespace App\Http\Controllers;

use App\Models\User;
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

    public function logout(Request $request){
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
