<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Seed lookup tables for production database
        $this->call([
            UserSeeder::class,
            VolunteerRoleTypeSeeder::class,
            ShiftTypeSeeder::class,
        ]);
    }
}
