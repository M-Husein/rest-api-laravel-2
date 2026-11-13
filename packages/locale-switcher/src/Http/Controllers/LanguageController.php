<?php

namespace Programmeria\LocaleSwitcher\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Cache;
use Programmeria\LocaleSwitcher\Models\Language;
use Programmeria\LocaleSwitcher\Support\LocalePresets;
use Programmeria\LocaleSwitcher\Support\TranslationImporter;

class LanguageController extends Controller
{
    public function index(): JsonResponse
    {
        $languages = Language::query()->ordered()->get();

        return jsonSuccess($languages);
    }

    public function show(string $code): JsonResponse
    {
        return jsonSuccess(Language::query()->where('code', $code)->firstOrFail());
    }

    public function presets(): JsonResponse
    {
        $existing = Language::query()->pluck('code')->all();

        $items = array_map(fn (array $p) => $p + ['added' => in_array($p['code'], $existing, true)], LocalePresets::all());

        return jsonSuccess(array_values($items));
    }

    public function store(Request $request): JsonResponse
    {
        $preset = is_string($request->input('code')) ? LocalePresets::find(strtolower(trim($request->input('code')))) : null;

        $validated = $request->validate([
            'code' => ['required', 'string', 'max:10', 'regex:/^[a-z]{2,3}(-[a-z]{2,4})?$/', 'unique:languages,code'],
            'name' => [$preset !== null ? 'nullable' : 'required', 'string', 'max:100'],
            'native_name' => ['nullable', 'string', 'max:100'],
            'direction' => ['nullable', 'string', 'in:ltr,rtl'],
            'is_active' => ['nullable', 'boolean'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ]);

        $code = strtolower(trim($validated['code']));

        $language = Language::create([
            'code' => $code,
            'name' => $validated['name'] ?? $preset['name'],
            'native_name' => $validated['native_name'] ?? $preset['native_name'] ?? ($validated['name'] ?? $preset['name']),
            'direction' => $validated['direction'] ?? $preset['direction'] ?? 'ltr',
            'is_active' => $validated['is_active'] ?? true,
            'is_default' => false,
            'sort_order' => $validated['sort_order'] ?? ((int) Language::query()->max('sort_order') + 1),
        ]);

        Cache::forget(Language::CACHE_KEY);

        return jsonSuccess($language->fresh(), "Language [{$code}] added.", 201);
    }

    public function update(Request $request, string $code): JsonResponse
    {
        $language = Language::query()->where('code', $code)->firstOrFail();

        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:100'],
            'native_name' => ['sometimes', 'nullable', 'string', 'max:100'],
            'direction' => ['sometimes', 'string', 'in:ltr,rtl'],
            'is_active' => ['sometimes', 'boolean'],
            'sort_order' => ['sometimes', 'integer', 'min:0'],
        ]);

        $language->fill($validated)->save();
        Cache::forget(Language::CACHE_KEY);

        return jsonSuccess($language->fresh());
    }

    public function destroy(string $code): JsonResponse
    {
        $language = Language::query()->where('code', $code)->firstOrFail();

        if ($language->is_default) {
            return jsonError('The default language cannot be deleted. Set another language as default first.', 422);
        }

        $language->delete();
        Cache::forget(Language::CACHE_KEY);

        return jsonSuccess(null, "Language [{$code}] deleted.");
    }

    public function setDefault(string $code): JsonResponse
    {
        $language = Language::query()->where('code', $code)->firstOrFail();
        $language->makeDefault();
        Cache::forget(Language::CACHE_KEY);

        return jsonSuccess(
            $language->fresh(),
            "Language [{$code}] is now the default in DB. Also update APP_FALLBACK_LOCALE in .env to match."
        );
    }

    public function sync(Request $request, string $code): JsonResponse
    {
        Language::query()->where('code', $code)->firstOrFail();

        $validated = $request->validate(['force' => ['sometimes', 'boolean']]);

        $importer = new TranslationImporter();
        $count = $importer->importLocale($code, (bool) ($validated['force'] ?? false));
        TranslationImporter::clearTranslationCache();

        return jsonSuccess(
            ['code' => $code, 'imported' => $count],
            "Synced {$count} lines for [{$code}]. Missing files fall back to English at runtime."
        );
    }
}
