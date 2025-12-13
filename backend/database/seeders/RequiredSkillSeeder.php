<?php

namespace Database\Seeders;

use App\Models\RequiredSkill;
use Illuminate\Database\Seeder;

class RequiredSkillSeeder extends Seeder
{
    public function run(): void
    {
        $skills = [
            [
                'code' => 'no_skill_required',
                'name_en' => 'No Skill Required',
                'name_ms' => 'Tiada Kemahiran Diperlukan',
                'description' => 'Open to all volunteers',
                'display_order' => 1,
                'is_active' => true,
            ],
            [
                'code' => 'first_aid',
                'name_en' => 'First Aid Certified',
                'name_ms' => 'Bertauliah Pertolongan Cemas',
                'description' => 'Valid first aid certification required',
                'display_order' => 2,
                'is_active' => true,
            ],
            [
                'code' => 'photography',
                'name_en' => 'Photography Skills',
                'name_ms' => 'Kemahiran Fotografi',
                'description' => 'Experience in event photography',
                'display_order' => 3,
                'is_active' => true,
            ],
            [
                'code' => 'emcee',
                'name_en' => 'MC/Public Speaking',
                'name_ms' => 'Pengacara Majlis',
                'description' => 'Public speaking and event hosting',
                'display_order' => 4,
                'is_active' => true,
            ],
            [
                'code' => 'technical',
                'name_en' => 'Technical Skills',
                'name_ms' => 'Kemahiran Teknikal',
                'description' => 'Sound, lighting, or AV equipment',
                'display_order' => 5,
                'is_active' => true,
            ],
        ];

        foreach ($skills as $skill) {
            RequiredSkill::updateOrCreate(
                ['code' => $skill['code']],
                $skill
            );
        }
    }
}
