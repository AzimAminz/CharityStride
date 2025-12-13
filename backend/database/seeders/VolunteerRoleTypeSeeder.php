<?php

namespace Database\Seeders;

use App\Models\VolunteerRoleType;
use Illuminate\Database\Seeder;

class VolunteerRoleTypeSeeder extends Seeder
{
    public function run(): void
    {
        $roleTypes = [
            [
                'code' => 'event_crew',
                'name_en' => 'Event Crew',
                'name_ms' => 'Krew Acara',
                'description' => 'General event support and coordination',
                'display_order' => 1,
                'is_active' => true,
            ],
            [
                'code' => 'registration_counter',
                'name_en' => 'Registration Counter',
                'name_ms' => 'Kaunter Pendaftaran',
                'description' => 'Handle participant registration and check-in',
                'display_order' => 2,
                'is_active' => true,
            ],
            [
                'code' => 'photographer',
                'name_en' => 'Photographer',
                'name_ms' => 'Jurugambar',
                'description' => 'Event photography and documentation',
                'display_order' => 3,
                'is_active' => true,
            ],
            [
                'code' => 'logistics',
                'name_en' => 'Logistics Support',
                'name_ms' => 'Sokongan Logistik',
                'description' => 'Equipment setup and logistics management',
                'display_order' => 4,
                'is_active' => true,
            ],
            [
                'code' => 'usher',
                'name_en' => 'Usher',
                'name_ms' => 'Pengiring Tetamu',
                'description' => 'Guide participants and guests',
                'display_order' => 5,
                'is_active' => true,
            ],
            [
                'code' => 'first_aid',
                'name_en' => 'First Aid Personnel',
                'name_ms' => 'Pegawai Pertolongan Cemas',
                'description' => 'Medical and first aid support',
                'display_order' => 6,
                'is_active' => true,
            ],
            [
                'code' => 'marshal',
                'name_en' => 'Marshal',
                'name_ms' => 'Marshel',
                'description' => 'Route guidance and safety',
                'display_order' => 7,
                'is_active' => true,
            ],
            [
                'code' => 'refreshment',
                'name_en' => 'Refreshment Station',
                'name_ms' => 'Stesen Minuman',
                'description' => 'Manage hydration and refreshment points',
                'display_order' => 8,
                'is_active' => true,
            ],
            [
                'code' => 'others',
                'name_en' => 'Others (Custom)',
                'name_ms' => 'Lain-lain (Tersuai)',
                'description' => 'Custom role - specify in custom_role_name field',
                'display_order' => 99,
                'is_active' => true,
            ],
        ];

        foreach ($roleTypes as $roleType) {
            VolunteerRoleType::updateOrCreate(
                ['code' => $roleType['code']], // Find by code
                $roleType // Update with all data
            );
        }
    }
}
