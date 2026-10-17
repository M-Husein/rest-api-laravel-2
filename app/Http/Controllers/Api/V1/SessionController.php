<?php
namespace App\Http\Controllers\Api\V1;
use App\Http\Controllers\Controller;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * @tags Sessions
 */
class SessionController extends Controller{
  /**
   * List all active sessions for the authenticated user.
   */
  public function index(Request $request){
    $sessions = DB::table('sessions')
      ->where('user_id', $request->user()->id)
      ->orderByDesc('last_activity')
      ->get()
      ->map(fn($sess) => [
        'id' => $sess->id,
        'ip_address' => $sess->ip_address,
        'user_agent' => $sess->user_agent,
        'uad' => json_decode($sess->uad, true),
        'last_active' => Carbon::createFromTimestamp($sess->last_activity)->diffForHumans(),
        'is_current' => $sess->id === $request->session()->getId()
      ]);

    return jsonSuccess($sessions);
  }

  /**
   * Logout current session only.
   */
  public function destroyCurrent(Request $request){
    $sess = $request->session();
    $sess->invalidate();
    $sess->regenerateToken();
    return jsonSuccess(); // ['message' => 'Current session ended.']
  }

  /**
   * Logout all other sessions, keep current.
   */
  public function destroyOthers(Request $request){
    $currentSessId = $request->session()->getId();
    DB::table('sessions')
      ->where('user_id', $request->user()->id)
      ->where('id', '!=', $currentSessId)
      ->delete();

    return jsonSuccess('All other sessions ended.');
  }

  /**
   * Logout all sessions including current.
   */
  public function destroyAll(Request $request){
    DB::table('sessions')
      ->where('user_id', $request->user()->id)
      ->delete();

    return jsonSuccess(); // ['message' => 'All sessions ended.']
  }

  /**
   * Logout a specific session by ID.
   */
  public function destroy(Request $request, string $sessionId){
    $deleted = DB::table('sessions')
      ->where('user_id', $request->user()->id)
      ->where('id', $sessionId)
      ->delete();

    if(!$deleted) return jsonError('Session not found.', 404);
    return jsonSuccess(); // ['message' => 'Session ended.']
  }
}