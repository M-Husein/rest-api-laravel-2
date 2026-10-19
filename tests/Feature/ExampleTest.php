<?php

namespace Tests\Feature;

// use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    /**
     * A basic test example.
     */
    public function test_the_application_returns_a_successful_response(): void
    {
        if (! class_exists(\Programmeria\Seo\SeoServiceProvider::class)) {
            $this->markTestSkipped('The seo package is not installed.');
        }

        $response = $this->get('/');

        $response->assertStatus(200);
    }
}
