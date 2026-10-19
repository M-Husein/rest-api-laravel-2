<?php

namespace Tests\Unit;

use App\Support\Starter\JsonFile;
use PHPUnit\Framework\TestCase;

class JsonFileTest extends TestCase
{
    private string $path;

    protected function setUp(): void
    {
        $this->path = tempnam(sys_get_temp_dir(), 'jsonfile');
    }

    protected function tearDown(): void
    {
        if (is_file($this->path)) {
            unlink($this->path);
        }
    }

    public function test_write_uses_lf_line_endings(): void
    {
        JsonFile::write($this->path, ['features' => ['ui']]);

        $contents = file_get_contents($this->path);

        $this->assertStringEndsWith("\n", $contents);
        $this->assertStringNotContainsString("\r\n", $contents);
        $this->assertSame(['features' => ['ui']], JsonFile::read($this->path));
    }

    public function test_write_is_idempotent(): void
    {
        JsonFile::write($this->path, ['features' => ['ui']]);

        $first = file_get_contents($this->path);

        JsonFile::write($this->path, ['features' => ['ui']]);

        $this->assertSame($first, file_get_contents($this->path));
    }
}
