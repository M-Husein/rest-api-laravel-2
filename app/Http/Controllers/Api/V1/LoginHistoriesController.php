<?php
namespace App\Http\Controllers\Api\V1;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Support\QueryBuilder;
use App\Models\LoginHistory;

class LoginHistoriesController extends Controller{
  public function index(Request $request){
    $same = ['user_id','ip_address'];
    $same2 = [...$same,'created_at'];
    $query = QueryBuilder::for(LoginHistory::query())
      ->search($same)
      ->filter($same2)
      ->sort($same2);

    return match($request->query('mode','table')){
      'all' => jsonSuccess($query->get()),
      'lazy' => jsonLazy($query->cursorPaginate()),
      default => jsonPaginated($query->paginate())
    };
  }

  /**
   * Store a newly user login data.
   *
   * @param Request $request
   * @return Illuminate\Http\JsonResponse
   */
  public function store(Request $request){
    $request->validate([
      'meta' => 'nullable|array' // 'nullable|json|max:2048'
    ]);

    // // Insert into permanent history
    // \DB::table('login_histories')->insert([
    //   'user_id' => $request->user()->id,
    //   'ip_address' => $request->ip(),
    //   'meta' => $request->meta,
    //   'created_at' => now(),
    // ]);

    $user = $request->user();

    LoginHistory::create([
      'user_id' => $user->id,
      'ip_address' => $request->ip(),
      'meta' => $request->meta
    ]);

    return jsonSuccess($user);
  }

  /**
   * Display the specified data.
   *
   * @param string $id
   * @return Illuminate\Http\JsonResponse
   */
  public function show(string $id){
    $data = LoginHistory::findOrFail($id);
    return jsonSuccess($data);
  }

  /**
   * Delete the specified data.
   *
   * @param string $id
   * @return Illuminate\Http\JsonResponse
   */
  public function destroy(string $id){
    $data = LoginHistory::findOrFail($id);
    $data->delete();
    return jsonSuccess();
  }

  /**
   * Delete multiple datas.
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
    LoginHistory::whereIn('id', $ids['ids'])->delete();
    return jsonSuccess();
  }
}