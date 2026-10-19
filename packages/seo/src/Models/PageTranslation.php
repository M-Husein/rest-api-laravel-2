<?php
namespace Programmeria\Seo\Models;
use Illuminate\Database\Eloquent\Model;

class PageTranslation extends Model{
  protected $table = 'page_translations';

  protected $fillable = [
    'name',
    'lang',
    'text',
    // 'is_system',
  ];

  protected $casts = [
    'text' => 'array',
    // 'is_system' => 'boolean'
  ];

  /**
   * Get translations for a specific page and language.
   */
  public static function getForPage(string $name, string $lang): array{
    $record = self::query()
      ->where('name', $name)
      ->where('lang', $lang)
      ->first();
    return $record ? $record->text : [];
  }
}