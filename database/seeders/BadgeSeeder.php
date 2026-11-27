<?php

namespace Database\Seeders;

use App\Models\Badge;
use Illuminate\Database\Seeder;

class BadgeSeeder extends Seeder
{
    public function run(): void
    {
        $badges = [
            [
                'code' => 'first_lesson',
                'name' => 'Langkah Pertama',
                'description' => 'Menyelesaikan lesson Bahasa Pasan pertama dengan nilai lulus.',
                'icon' => 'sparkles',
            ],
            [
                'code' => 'first_unit',
                'name' => 'Penakluk Unit Pertama',
                'description' => 'Lulus Quiz Unit 1 dengan skor minimal 75.',
                'icon' => 'trophy',
            ],
            [
                'code' => 'comeback_learner',
                'name' => 'Pantang Menyerah',
                'description' => 'Menyelesaikan lesson remedial pertama setelah evaluasi quiz.',
                'icon' => 'flame',
            ],
            [
                'code' => 'xp_collector_100',
                'name' => 'Pengumpul 100 XP',
                'description' => 'Mengumpulkan minimal 100 XP dari seluruh aktivitas belajar.',
                'icon' => 'award',
            ],
            [
                'code' => 'curriculum_master',
                'name' => 'Penjelajah Bahasa Pasan',
                'description' => 'Menyelesaikan seluruh 5 Quiz Unit pada kurikulum Pasanku.',
                'icon' => 'crown',
            ],
        ];

        foreach ($badges as $badge) {
            Badge::updateOrCreate(
                ['code' => $badge['code']],
                $badge
            );
        }
    }
}
