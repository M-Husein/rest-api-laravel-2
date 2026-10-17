<?php
namespace App\Http\Controllers\Api\V1;
use App\Http\Controllers\Controller;
// use App\Http\Requests\ClearCacheRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\{Artisan,Log};

class ClearCacheController extends Controller{
  public function __invoke(Request $request){
    $typeToCommand = [
      'cache' => 'cache:clear',
      'config' => 'config:clear',
      'route' => 'route:clear',
      'view' => 'view:clear',
      'event' => 'event:clear',
      'compiled' => 'clear-compiled'
    ];

    $cleared = [];
    foreach ($request->types as $type) {
      $command = $typeToCommand[$type];
      $exitCode = Artisan::call($command);

      if ($exitCode === 0) {
        $cleared[] = $type;
      } else {
        // Log the failure for debugging, but continue processing other caches.
        Log::channel('maintenance')->warning("Failed to clear {$type} cache.", [
          'command' => $command,
          'exitCode' => $exitCode
        ]);
      }
    }

    if (empty($cleared)) {
      return jsonError('No caches were cleared due to errors.', 500); // 422
    }

    $user = $request->user();
    Log::channel('maintenance')->info("Cache cleared by {$user->username}.", [
      'types' => implode(',', $cleared),
      'user_id' => $user->id,
      'email' => $user->email, // Option
      'ip' => $request->ip()
    ]);

    return jsonSuccess(); // $cleared, 'Selected caches cleared successfully.'
  }
}