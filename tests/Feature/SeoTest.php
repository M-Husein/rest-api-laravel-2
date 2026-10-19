<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Programmeria\Seo\Models\PageTranslation;
use Programmeria\Seo\SeoServiceProvider;
use Tests\TestCase;

class SeoTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        if (! class_exists(SeoServiceProvider::class)) {
            $this->markTestSkipped('The seo package is not installed.');
        }
    }

    public function test_home_page_renders_meta_and_structured_data(): void
    {
        $response = $this->get('/');

        $response->assertOk();
        $response->assertSee('<title>', false);
        $response->assertSee('rel="canonical"', false);
        $response->assertSee('application/ld+json', false);
        $response->assertSee('WebSite', false);
        $response->assertSee('Organization', false);
    }

    public function test_page_translation_endpoint_returns_localized_content(): void
    {
        PageTranslation::create([
            'name' => 'contact-us',
            'lang' => 'en',
            'text' => ['title' => 'Contact Us', 'desc' => 'Reach our team'],
        ]);

        $response = $this->getJson('/api/v1/locales/en/page/contact-us');

        $response->assertOk();
        $response->assertJsonPath('data.title', 'Contact Us');
        $response->assertJsonPath('data.desc', 'Reach our team');
    }
}
