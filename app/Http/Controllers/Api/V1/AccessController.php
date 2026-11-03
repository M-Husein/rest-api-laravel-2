<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Support\Rbac\RbacAccess;
use Illuminate\Http\Request;
use InvalidArgumentException;

/**
 * @tags RBAC
 */
class AccessController extends Controller
{
    /**
     * Get the current user's RBAC access payload.
     */
    public function show(Request $request)
    {
        return jsonSuccess(RbacAccess::payload($request->user()));
    }

    /**
     * Check a record-level authorization decision.
     */
    public function check(Request $request)
    {
        $validated = $request->validate([
            'resource' => ['required', 'string'],
            'action' => ['required', 'string'],
            'id' => ['nullable'],
        ]);

        try {
            $can = RbacAccess::check(
                $request->user(),
                $validated['resource'],
                $validated['action'],
                $validated['id'] ?? null,
            );
        } catch (InvalidArgumentException $e) {
            return jsonError($e->getMessage(), 422);
        }

        return jsonSuccess(['can' => $can]);
    }
}
