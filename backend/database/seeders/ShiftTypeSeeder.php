<?php

namespace Database\Seeders;

use App\Models\ShiftType;
use Illuminate\Database\Seeder;

class ShiftTypeSeeder extends Seeder
{
    public function run(): void
    {
        $shiftTypes = [
            [
                'code' => 'full_day',
                'name_en' => 'Full Day',
                'name_ms' => 'Sehari Penuh',
                'duration_hours' => 8.00,
                'display_order' => 1,
                'is_active' => true,
            ],
            [
                'code' => 'half_day_morning',
                'name_en' => 'Half Day (Morning)',
                'name_ms' => 'Separuh Hari (Pagi)',
                'duration_hours' => 4.00,
                'display_order' => 2,
                'is_active' => true,
            ],
            [
                'code' => 'half_day_afternoon',
                'name_en' => 'Half Day (Afternoon)',
                'name_ms' => 'Separuh Hari (Petang)',
                'duration_hours' => 4.00,
                'display_order' => 3,
                'is_active' => true,
            ],
            [
                'code' => 'evening',
                'name_en' => 'Evening Shift',
                'name_ms' => 'Syif Petang',
                'duration_hours' => 3.00,
                'display_order' => 4,
                'is_active' => true,
            ],
            [
                'code' => 'custom',
                'name_en' => 'Custom Hours',
                'name_ms' => 'Masa Tersuai',
                'duration_hours' => null,
                'display_order' => 5,
                'is_active' => true,
            ],
        ];

        foreach ($shiftTypes as $shiftType) {
            ShiftType::updateOrCreate(
                ['code' => $shiftType['code']],
                $shiftType
            );
        }
    }
}
