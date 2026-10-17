<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use App\Models\User;

class RolesSeeder extends Seeder{
  /**
   * Run the database seeds.
   */
  public function run(): void{
    Role::firstOrCreate([
      'name' => User::ROLE_ADMIN, // 'Admin',
      'guard_name' => 'web',
    ]);

    Role::firstOrCreate([
      'name' => User::ROLE_MEMBER, // 'Member',
      'guard_name' => 'web',
    ]);
  }
}