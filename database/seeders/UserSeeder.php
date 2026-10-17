<?php
namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder{
  public function run(): void{
    // $admin = 
    User::create([
      'name' => 'Admin User',
      'username' => 'SuperAdmin',
      'email' => 'admin@email.com',
      'password' => Hash::make('password'),
      'email_verified_at' => now(),
      // 'lang' => config('app.locale'),
      // 'theme' => 'light',
    ])
    ->assignRole(User::ROLE_ADMIN);

    // $member = 
    User::create([
      'name' => 'Member User',
      'username' => 'MemberUser',
      'email' => 'member@email.com',
      'password' => Hash::make('password'),
      'email_verified_at' => now(),
    ])
    ->assignRole(User::ROLE_MEMBER);
  }
}