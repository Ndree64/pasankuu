<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\Profile;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class InitialAdminSeeder extends Seeder
{
    public function run(): void
    {
        $accounts = [
            [
                'email' => 'admin@pasanku.test',
                'full_name' => 'Admin Pasanku',
                'role' => UserRole::Admin,
            ],
            [
                'email' => 'validator@pasanku.test',
                'full_name' => 'Validator Bahasa Pasan',
                'role' => UserRole::Validator,
            ],
        ];

        foreach ($accounts as $account) {
            $user = User::firstOrCreate(
                ['email' => $account['email']],
                ['password' => Hash::make('password123')]
            );

            Profile::updateOrCreate(
                ['id' => $user->id],
                [
                    'full_name' => $account['full_name'],
                    'role' => $account['role'],
                    'is_active' => true,
                ]
            );
        }
    }
}
