<?php

namespace Database\Seeders;

use App\Enums\ContentStatus;
use App\Models\Lesson;
use App\Models\Unit;
use App\Models\UnitQuiz;
use Illuminate\Database\Seeder;

class InitialCurriculumSeeder extends Seeder
{
    public function run(): void
    {
        $curriculum = [
            1 => [
                'title' => 'Sapaan dan Ungkapan Dasar',
                'description' => 'Mengenal Bahasa Pasan, sapaan saat bertemu, menanyakan kabar, ucapan terima kasih, dan perpisahan.',
                'lessons' => [
                    1 => 'Pengenalan Bahasa Pasan & Kosakata Dasar',
                    2 => 'Sapaan Sederhana',
                    3 => 'Menanyakan Kabar & Responsnya',
                    4 => 'Terima Kasih & Permintaan Maaf',
                    5 => 'Ungkapan Perpisahan',
                ],
            ],
            2 => [
                'title' => 'Perkenalan Diri dan Identitas',
                'description' => 'Mempelajari kata ganti orang, menyebutkan nama, asal daerah, tempat tinggal, dan perkenalan diri.',
                'lessons' => [
                    1 => 'Kata Ganti Orang (Saya, Kamu, Dia)',
                    2 => 'Menyebutkan Nama',
                    3 => 'Menanyakan & Menyebutkan Asal',
                    4 => 'Menyebutkan Tempat Tinggal',
                    5 => 'Memperkenalkan Diri',
                ],
            ],
            3 => [
                'title' => 'Angka dan Benda di Sekitar',
                'description' => 'Mengenal angka 1 sampai 10, benda di sekitar, menyebutkan jumlah benda, dan penggunaannya dalam ungkapan.',
                'lessons' => [
                    1 => 'Angka 1 sampai 5',
                    2 => 'Angka 6 sampai 10',
                    3 => 'Benda-benda di Sekitar',
                    4 => 'Menyebutkan Jumlah Benda',
                    5 => 'Angka & Nama Benda dalam Ungkapan',
                ],
            ],
            4 => [
                'title' => 'Keluarga dan Kehidupan Sehari-hari',
                'description' => 'Mengenal anggota keluarga, orang di sekitar, makanan dan minuman, serta aktivitas sehari-hari.',
                'lessons' => [
                    1 => 'Anggota Keluarga',
                    2 => 'Orang-orang di Sekitar',
                    3 => 'Makanan dan Minuman',
                    4 => 'Aktivitas Sehari-hari',
                    5 => 'Kosakata dalam Ungkapan Sederhana',
                ],
            ],
            5 => [
                'title' => 'Ungkapan dan Percakapan Sederhana',
                'description' => 'Menyusun ungkapan sederhana serta mempraktikkan percakapan seputar sapaan, perkenalan, dan keluarga.',
                'lessons' => [
                    1 => 'Susunan Ungkapan Sederhana',
                    2 => 'Percakapan Sapaan',
                    3 => 'Percakapan Perkenalan Diri',
                    4 => 'Percakapan tentang Keluarga',
                    5 => 'Percakapan Sehari-hari',
                ],
            ],
        ];

        foreach ($curriculum as $unitOrder => $unitData) {
            $unit = Unit::updateOrCreate(
                ['order_number' => $unitOrder],
                [
                    'title' => $unitData['title'],
                    'description' => $unitData['description'],
                    'status' => ContentStatus::Published,
                ]
            );

            foreach ($unitData['lessons'] as $lessonOrder => $lessonTitle) {
                Lesson::firstOrCreate(
                    [
                        'unit_id' => $unit->id,
                        'order_number' => $lessonOrder,
                    ],
                    [
                        'title' => $lessonTitle,
                        'description' => null,
                        'objective' => null,
                        'content_version' => 1,
                        'status' => ContentStatus::Draft,
                    ]
                );
            }

            UnitQuiz::firstOrCreate(
                ['unit_id' => $unit->id],
                [
                    'title' => "Quiz Unit {$unitOrder}: {$unitData['title']}",
                    'description' => "Evaluasi pemahaman seluruh materi pada Unit {$unitOrder}.",
                    'passing_score' => 75.00,
                    'content_version' => 1,
                    'status' => ContentStatus::Draft,
                ]
            );
        }
    }
}
