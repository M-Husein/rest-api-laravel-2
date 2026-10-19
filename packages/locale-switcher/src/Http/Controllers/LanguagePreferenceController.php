<?php

namespace Programmeria\LocaleSwitcher\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class LanguagePreferenceController extends Controller
{
    public function __invoke(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'lang' => 'required|string|in:' . implode(',', config('localizer.supported_locales', [])),
        ]);

        $user->lang = $validated['lang'];
        $user->save();

        return jsonSuccess($user->fresh());
    }
}
