<?php
namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Support\QueryBuilder;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class UserController extends Controller{
  /**
   * Display a paginated listing of users.
   *
   * Supports:
   * - Pagination
   * - Global search (q)
   * - Column filtering (filter[field])
   * - Sorting (sort)
   *
   * Example:
   * GET /users?page=1&perPage=10
   * GET /users?q=admin
   * GET /users?filter[name]=admin
   * GET /users?sort=-created_at
   *
   * @return Illuminate\Http\JsonResponse
   */
  public function index(Request $request){
    $same = ['name','email','username'];
    $same2 = [...$same,'created_at'];
    $query = QueryBuilder::for(User::query())
      ->search($same)
      ->filter($same2)
      ->sort($same2)
      ->select([
        ...$same2,
        'email_verified_at'
      ]);

    return match($request->query('mode','table')){
      'all' => jsonSuccess($query->get()),
      'lazy' => jsonLazy($query->simplePaginate()),
      default => jsonPaginated($query->paginate())
    };
  }

  /**
   * Store a newly created user.
   *
   * @param Request $request
   * @return Illuminate\Http\JsonResponse
   */
  public function store(Request $request){
    $data = $request->validate([
      'name' => [
        'required',
        'string',
        'max:150'
      ],
      'email' => [
        'required',
        'email',
        'max:255',
        'unique:users,email'
      ],
      'username' => [
        'nullable',
        'string',
        'max:32',
        'unique:users,username'
      ],
      'password' => [
        'required',
        'string',
        'min:6'
      ]
    ]);

    $user = User::create([
      'name' => $data['name'],
      'email' => mb_strtolower($data['email']),
      'username' => $data['username'] ?? null,
      'password' => Hash::make($data['password'])
    ]);

    return jsonSuccess($user);
  }

  /**
   * Display the specified user.
   *
   * @param string $user
   * @return Illuminate\Http\JsonResponse
   */
  public function show(string $user){
    $q = User::query()
      ->where(
        is_numeric($user) || Str::isUuid($user) ? 'id' : 'username',
        $user
      )->firstOrFail();

    return jsonSuccess($q);

    // $user = User::findOrFail($id);
    // return jsonSuccess($user);
  }

  /**
   * Update the specified user.
   *
   * Password is optional.
   * If provided, the password will be updated.
   *
   * @param Request $request
   * @param string $id
   * @return Illuminate\Http\JsonResponse
   */
  public function update(
    Request $request,
    string $id
  ){
    $user = User::findOrFail($id);

    $data = $request->validate([
      'name' => [
        'required',
        'string',
        'max:150'
      ],
      'email' => [
        'required',
        'email',
        'max:255',
        Rule::unique('users','email')->ignore($user->id)
      ],
      'username' => [
        'nullable',
        'string',
        'max:32',
        Rule::unique('users','username')->ignore($user->id)
      ],
      'password' => [
        'nullable',
        'string',
        'min:6'
      ]
    ]);

    $user->name = $data['name'];
    $user->email = mb_strtolower($data['email']);
    $user->username = $data['username'] ?? null;

    if(!empty($data['password'])){
      $user->password = bcrypt(
        $data['password']
      );
    }

    $user->save();

    return jsonSuccess($user); // , 'User updated successfully.'
  }

  /**
   * Soft delete the specified user.
   *
   * @param string $id
   * @return Illuminate\Http\JsonResponse
   */
  public function destroy(string $id){
    $user = User::findOrFail($id);
    $user->delete();
    return jsonSuccess(); // null, 'User deleted successfully.'
  }

  /**
   * Soft delete multiple users.
   *
   * Expected payload:
   * {
   *   "ids": [1,2,3]
   * }
   *
   * @param Request $request
   * @return Illuminate\Http\JsonResponse
   */
  public function destroyMany(Request $request){
    $ids = $request->validate([
      'ids' => ['required','array','min:1'],
      'ids.*' => ['integer']
    ]);

    User::whereIn('id', $ids['ids'])->delete();

    return jsonSuccess(); // null, 'Users deleted successfully.'
  }
}