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
                'username' => 'admin',
                'legacy_email' => 'admin@pasanku.test',
                'full_name' => 'Admin Pasanku',
                'role' => UserRole::Admin,
            ],
            [
                'username' => 'validator',
                'legacy_email' => 'validator@pasanku.test',
                'full_name' => 'Validator Bahasa Pasan',
                'role' => UserRole::Validator,
            ],
        ];

        foreach ($accounts as $account) {
            $user = User::where('username', $account['username'])
                ->orWhere('email', $account['legacy_email'])
                ->first();

            if ($user) {
                $user->update([
                    'username' => $account['username'],
                    'email' => null,
                ]);
            } else {
                $user = User::create([
                    'username' => $account['username'],
                    'email' => null,
                    'password' => Hash::make('password123'),
                ]);
            }

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
