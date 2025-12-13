<?php

namespace Database\Seeders;

use App\Models\ParticipantCategoryType;
use Illuminate\Database\Seeder;

class ParticipantCategoryTypeSeeder extends Seeder
{
    public function run(): void
    {
        $categoryTypes = [
            [
                'code' => 'adult',
                'name_en' => 'Adult',
                'name_ms' => 'Dewasa',
                'description' => 'Ages 18 and above',
                'display_order' => 1,
                'is_active' => true,
            ],
            [
                'code' => 'student',
                'name_en' => 'Student',
                'name_ms' => 'Pelajar',
                'description' => 'Full-time students with valid ID',
                'display_order' => 2,
                'is_active' => true,
            ],
            [
                'code' => 'senior_citizen',
                'name_en' => 'Senior Citizen',
                'name_ms' => 'Warga Emas',
                'description' => 'Ages 60 and above',
                'display_order' => 3,
                'is_active' => true,
            ],
            [
                'code' => 'children',
                'name_en' => 'Children',
                'name_ms' => 'Kanak-kanak',
                'description' => 'Ages 12-17',
                'display_order' => 4,
                'is_active' => true,
            ],
            [
                'code' => 'family',
                'name_en' => 'Family Package',
                'name_ms' => 'Pakej Keluarga',
                'description' => 'Family bundle for 2 adults + 2 children',
                'display_order' => 5,
                'is_active' => true,
            ],
            [
                'code' => 'pwd',
                'name_en' => 'Person with Disabilities (PWD)',
                'name_ms' => 'Orang Kurang Upaya (OKU)',
                'description' => 'Special category for PWD participants',
                'display_order' => 6,
                'is_active' => true,
            ],
        ];

        foreach ($categoryTypes as $categoryType) {
            ParticipantCategoryType::updateOrCreate(
                ['code' => $categoryType['code']],
                $categoryType
            );
        }
    }
}
