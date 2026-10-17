<?php
namespace App\Facades;
use App\Services\Spa\SpaResponse;

/**
 * @method static SpaResponse title(string $title, bool $withSuffix = true)
 * @method static SpaResponse description(string $description)
 * @method static SpaResponse image(string $url)
 * @method static SpaResponse type(string $type)
 * @method static SpaResponse robots(string $robots)
 * @method static SpaResponse noIndex()
 * @method static SpaResponse withMeta(string $key, mixed $value)
 * @method static SpaResponse props(array $props)
 * @method static SpaResponse prop(string $key, mixed $value)
 * @method static SpaResponse jsonLd(array $schema)
 * @method static SpaResponse schemaWebSite()
 * @method static SpaResponse schemaOrganization()
 * @method static SpaResponse schemaBreadcrumb(array $items)
 * @method static SpaResponse schemaArticle(array $data)
 */
class Spa{
  /**
   * Create a new SpaResponse for the public SPA shell.
   */
  public static function render(): SpaResponse{
    return new SpaResponse('spa');
  }

  /**
   * Create a new SpaResponse for the admin shell.
   */
  public static function admin(): SpaResponse{
    return new SpaResponse('admin');
  }

  /**
   * Create a new SpaResponse for a custom view.
   */
  public static function view(string $view): SpaResponse{
    return new SpaResponse($view);
  }
}