<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\TshirtSize;

class TshirtSizeSeeder extends Seeder
{
    public function run(): void
    {
        $sizes = [
            ['size_code' => 'XS', 'size_name' => 'Extra Small', 'description' => 'Chest: 34"'],
            ['size_code' => 'S', 'size_name' => 'Small', 'description' => 'Chest: 36"'],
            ['size_code' => 'M', 'size_name' => 'Medium', 'description' => 'Chest: 40"'],
            ['size_code' => 'L', 'size_name' => 'Large', 'description' => 'Chest: 44"'],
            ['size_code' => 'XL', 'size_name' => 'Extra Large', 'description' => 'Chest: 48"'],
            ['size_code' => 'XXL', 'size_name' => '2X Large', 'description' => 'Chest: 52"'],
            ['size_code' => 'XXXL', 'size_name' => '3X Large', 'description' => 'Chest: 56"'],
        ];

        foreach ($sizes as $size) {
            TshirtSize::create($size);
        }
    }
}