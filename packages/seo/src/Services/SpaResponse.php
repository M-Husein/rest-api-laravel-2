<?php
namespace Programmeria\Seo\Services;
use Illuminate\Contracts\Support\Responsable;

class SpaResponse implements Responsable{
  private string $view;
  private array $meta;
  private array $props;
  private array $jsonLd;
  private array $headers;

  public function __construct(string $view = 'seo::spa'){
    $this->view = $view;
    $this->props = [];
    $this->jsonLd = [];
    $this->headers = [];
    $this->meta = [
      'title' => config('app.name'),
      'description' => config('app.description', 'Welcome to ' . config('app.name')),
      'image' => asset(config('app.image')),
      'url' => request()->url(),
      'type' => 'website',
      'robots' => 'index, follow, notranslate'
    ];
  }

  // Meta helpers

  public function title(
    string $title, 
    string $separator = ' • '
  ): static{
    $this->meta['title'] = $separator ? $title . $separator . config('app.name') : $title;
    return $this;
  }

  public function description(string $desc): static{
    $this->meta['description'] = $desc;
    return $this;
  }

  public function image(string $url): static{
    $this->meta['image'] = $url;
    return $this;
  }

  public function type(string $type): static{
    $this->meta['type'] = $type;
    return $this;
  }

  public function robots(string $robots): static{
    $this->meta['robots'] = $robots;
    return $this;
  }

  /**
   * Use on all auth-required or private pages.
   */
  public function noIndex(): static{
    // return $this->robots('noindex, nofollow');
    // none, noindex, nofollow, nosnippet, noarchive, noimageindex, noimageai
    $value = 'noindex, nofollow, notranslate, noai';
    $this->robots($value);
    return $this->headers(['X-Robots-Tag' => $value]);
  }

  /**
   * Set any extra meta key freely.
   */
  public function withMeta(string $key, mixed $value): static{
    $this->meta[$key] = $value;
    return $this;
  }

  /**
   * Props — passed to React via data-page attribute on #app div
   * Great for: initial auth state, feature flags, server-side config,
   * any data that avoids an extra API call on first paint
   */
  public function props(array $props): static{
    $this->props = array_merge($this->props, $props);
    return $this;
  }

  public function prop(string $key, mixed $value): static{
    $this->props[$key] = $value;
    return $this;
  }

  // JSON-LD — structured data for SEO bots and LLM crawlers

  public function jsonLd(array $schema): static{
    $this->jsonLd[] = array_merge(
      ['@context' => 'https://schema.org'],
      $schema
    );
    return $this;
  }

  // Preset schemas

  public function schemaWebSite(): static{
    return $this->jsonLd([
      '@type' => 'WebSite',
      'name' => config('app.name'),
      'url' => config('app.url')
    ]);
  }

  public function schemaOrganization(): static{
    return $this->jsonLd([
      '@type' => 'Organization',
      'name' => config('app.name'),
      'url' => config('app.url'),
      'logo' => asset('images/logo.png')
    ]);
  }

  public function schemaBreadcrumb(array $items): static{
    return $this->jsonLd([
      '@type' => 'BreadcrumbList',
      'itemListElement' => array_map(
        fn($item, $i) => [
          '@type' => 'ListItem',
          'position' => $i + 1,
          'name' => $item['name'],
          'item' => $item['url'] ?? null
        ],
        $items,
        array_keys($items)
      )
    ]);
  }

  public function schemaArticle(array $data): static{
    return $this->jsonLd(array_merge([
      '@type' => 'Article',
      'publisher' => [
        '@type' => 'Organization',
        'name' => config('app.name')
      ]
    ], $data));
  }

  public function headers(array $headers): static{
    $this->headers = array_merge($this->headers, $headers);
    return $this;
  }

  private function makeView(): \Illuminate\View\View{
    $this->meta['url'] = request()->url();

    return view($this->view, [
      'user' => auth()->user(),
      'meta' => $this->meta,
      // 'page' => [
      //   'props' => empty($this->props) ? null : $this->props, // $this->props
      //   'url' => request()->fullUrl()
      // ],
      'page' => empty($this->props) ? null : $this->props,
      'jsonLd' => $this->jsonLd
    ]);
  }

  public function toResponse($request): \Illuminate\Http\Response{
    return response($this->makeView())->withHeaders($this->headers);
  }
}