<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Ngo;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create test NGO user
        $user = User::create([
            'name' => 'Test NGO User',
            'email' => 'ngo@charitystride.com',
            'password' => Hash::make('abc123'),
            'role' => 'ngo',
            'phone' => '0123456789',
            'birthdate' => '1990-01-15',
            'photo' => 'https://ui-avatars.com/api/?name=NGO+User&background=10b981&color=fff',
            'status' => true,
        ]);

        // Create NGO profile for the user
        Ngo::create([
            'user_id' => $user->id,
            'name' => 'Test NGO Organization',
            'registration_no' => 'TEST123456',
            'address' => '123 Test Street, Kuala Lumpur',
            'city' => 'Kuala Lumpur',
            'state' => 'Wilayah Persekutuan',
            'postcode' => '50000',
            'contact_phone' => '0123456789',
            'contact_email' => 'contact@testngo.com',
            'bank_name' => 'Maybank',
            'bank_account_no' => '1234567890',
            'bank_account_name' => 'Test NGO Organization',
            'latitude' => 3.139003,
            'longitude' => 101.686855,
            'status' => 'approved',
        ]);

        // Create test regular user (donor)
        User::create([
            'name' => 'Test Donor',
            'email' => 'donor@charitystride.com',
            'password' => Hash::make('abc123'),
            'role' => 'user',
            'phone' => '0198765432',
            'birthdate' => '1995-06-20',
            'photo' => 'https://ui-avatars.com/api/?name=Test+Donor&background=3b82f6&color=fff',
            'status' => true,
        ]);

        // Create admin user
        User::create([
            'name' => 'Admin User',
            'email' => 'admin@charitystride.com',
            'password' => Hash::make('abc123'),
            'role' => 'admin',
            'phone' => '0187654321',
            'birthdate' => '1985-03-10',
            'photo' => 'https://ui-avatars.com/api/?name=Admin+User&background=ef4444&color=fff',
            'status' => true,
        ]);

        $this->command->info('✅ Test users created successfully!');
        $this->command->info('📧 NGO User: ngo@charitystride.com / abc123');
        $this->command->info('📧 Donor User: donor@charitystride.com / abc123');
        $this->command->info('📧 Admin User: admin@charitystride.com / abc123');
    }
}
