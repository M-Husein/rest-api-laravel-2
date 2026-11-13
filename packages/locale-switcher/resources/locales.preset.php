<?php

// Preset catalog for addable languages. Single source of truth for the
// backend (validation, admin Select options, artisan). The frontend mirrors
// only weekStart/direction in its own static map (see localeMeta.ts).
// weekStart: 0 = Sunday, 1 = Monday. Adjust per project needs.
return [
  ['code' => 'en', 'name' => 'English', 'native_name' => 'English', 'direction' => 'ltr', 'weekStart' => 0],
  ['code' => 'id', 'name' => 'Indonesia', 'native_name' => 'Indonesia', 'direction' => 'ltr', 'weekStart' => 1],
  ['code' => 'zh', 'name' => 'Chinese', 'native_name' => '中文简体', 'direction' => 'ltr', 'weekStart' => 1],
  ['code' => 'ar', 'name' => 'Arabic', 'native_name' => 'العربية', 'direction' => 'rtl', 'weekStart' => 0],
  ['code' => 'es', 'name' => 'Spanish', 'native_name' => 'Español', 'direction' => 'ltr', 'weekStart' => 1],
  ['code' => 'fr', 'name' => 'French', 'native_name' => 'Français', 'direction' => 'ltr', 'weekStart' => 1],
  ['code' => 'de', 'name' => 'German', 'native_name' => 'Deutsch', 'direction' => 'ltr', 'weekStart' => 1],
  ['code' => 'ru', 'name' => 'Russian', 'native_name' => 'Русский', 'direction' => 'ltr', 'weekStart' => 1],
  ['code' => 'it', 'name' => 'Italian', 'native_name' => 'Italiano', 'direction' => 'ltr', 'weekStart' => 1],
  ['code' => 'pt', 'name' => 'Portuguese', 'native_name' => 'Português', 'direction' => 'ltr', 'weekStart' => 1],
  ['code' => 'ja', 'name' => 'Japanese', 'native_name' => '日本語', 'direction' => 'ltr', 'weekStart' => 0],
  ['code' => 'ko', 'name' => 'Korean', 'native_name' => '한국어', 'direction' => 'ltr', 'weekStart' => 0],
  ['code' => 'hi', 'name' => 'Hindi', 'native_name' => 'हिन्दी', 'direction' => 'ltr', 'weekStart' => 1],
  ['code' => 'vi', 'name' => 'Vietnamese', 'native_name' => 'Tiếng Việt', 'direction' => 'ltr', 'weekStart' => 1],
  ['code' => 'th', 'name' => 'Thai', 'native_name' => 'ไทย', 'direction' => 'ltr', 'weekStart' => 1],
  ['code' => 'ms', 'name' => 'Malay', 'native_name' => 'Bahasa Melayu', 'direction' => 'ltr', 'weekStart' => 1],
];
