<?php

namespace Tests\Unit;

use App\Support\Frontend\PackageManager;
use InvalidArgumentException;
use PHPUnit\Framework\TestCase;
use RuntimeException;

class PackageManagerTest extends TestCase
{
    private string $basePath;

    private string|false $previousEnvironment;

    protected function setUp(): void
    {
        $this->previousEnvironment = getenv('FRONTEND_PACKAGE_MANAGER');
        putenv('FRONTEND_PACKAGE_MANAGER');

        $this->basePath = sys_get_temp_dir().DIRECTORY_SEPARATOR.'package-manager-'.uniqid('', true);
        mkdir($this->basePath, 0777, true);
    }

    protected function tearDown(): void
    {
        if ($this->previousEnvironment === false) {
            putenv('FRONTEND_PACKAGE_MANAGER');
        } else {
            putenv('FRONTEND_PACKAGE_MANAGER='.$this->previousEnvironment);
        }

        $this->removeDirectory($this->basePath);
    }

    public function test_explicit_package_manager_is_used(): void
    {
        $manager = PackageManager::detect($this->basePath, 'npm', $this->checker(['npm']));

        $this->assertNotNull($manager);
        $this->assertSame('npm', $manager->name());
    }

    public function test_environment_package_manager_is_used(): void
    {
        putenv('FRONTEND_PACKAGE_MANAGER=pnpm');

        $manager = PackageManager::detect($this->basePath, null, $this->checker(['pnpm']));

        $this->assertNotNull($manager);
        $this->assertSame('pnpm', $manager->name());
    }

    public function test_unsupported_package_manager_is_rejected(): void
    {
        $this->expectException(InvalidArgumentException::class);

        PackageManager::detect($this->basePath, 'yarn', $this->checker(['yarn']));
    }

    public function test_missing_explicit_package_manager_is_rejected(): void
    {
        $this->expectException(RuntimeException::class);

        PackageManager::detect($this->basePath, 'npm', $this->checker([]));
    }

    public function test_node_modules_marker_is_used(): void
    {
        mkdir($this->basePath.DIRECTORY_SEPARATOR.'node_modules', 0777, true);
        file_put_contents($this->basePath.DIRECTORY_SEPARATOR.'node_modules/.modules.yaml', '');

        $manager = PackageManager::detect($this->basePath, null, $this->checker(['pnpm']));

        $this->assertNotNull($manager);
        $this->assertSame('pnpm', $manager->name());
    }

    public function test_newest_lockfile_is_used(): void
    {
        $this->touchFile('bun.lock', 1_000_000_000);
        $this->touchFile('package-lock.json', 1_000_000_200);
        $this->touchFile('pnpm-lock.yaml', 1_000_000_100);

        $manager = PackageManager::detect($this->basePath, null, $this->checker(['bun', 'npm', 'pnpm']));

        $this->assertNotNull($manager);
        $this->assertSame('npm', $manager->name());
    }

    public function test_ambiguous_lockfiles_fall_back_to_bun(): void
    {
        $this->touchFile('bun.lock', 1_000_000_000);
        $this->touchFile('package-lock.json', 1_000_000_000);
        $this->touchFile('pnpm-lock.yaml', 1_000_000_000);

        $manager = PackageManager::detect($this->basePath, null, $this->checker(['bun', 'npm', 'pnpm']));

        $this->assertNotNull($manager);
        $this->assertSame('bun', $manager->name());
    }

    public function test_returns_null_when_no_package_manager_is_available(): void
    {
        $this->assertNull(PackageManager::detect($this->basePath, null, $this->checker([])));
    }

    public function test_commands_are_package_manager_specific(): void
    {
        $npm = PackageManager::detect($this->basePath, 'npm', $this->checker(['npm']));
        $pnpm = PackageManager::detect($this->basePath, 'pnpm', $this->checker(['pnpm']));
        $bun = PackageManager::detect($this->basePath, 'bun', $this->checker(['bun']));

        $this->assertNotNull($npm);
        $this->assertNotNull($pnpm);
        $this->assertNotNull($bun);

        $this->assertSame('npm install', $npm->installCommand());
        $this->assertSame('npm run build', $npm->buildCommand());
        $this->assertSame('npm run dev', $npm->devCommand());
        $this->assertSame('npx', $npm->runner());

        $this->assertSame('pnpm install', $pnpm->installCommand());
        $this->assertSame('pnpm run build', $pnpm->buildCommand());
        $this->assertSame('pnpm run dev', $pnpm->devCommand());
        $this->assertSame('pnpm exec', $pnpm->runner());

        $this->assertSame('bun install', $bun->installCommand());
        $this->assertSame('bun run build', $bun->buildCommand());
        $this->assertSame('bun run dev', $bun->devCommand());
        $this->assertSame('bunx', $bun->runner());
    }

    /**
     * @param  array<int, string>  $available
     */
    private function checker(array $available): callable
    {
        return static fn (string $name): bool => in_array($name, $available, true);
    }

    private function touchFile(string $name, int $timestamp): void
    {
        $path = $this->basePath.DIRECTORY_SEPARATOR.$name;

        file_put_contents($path, '');
        touch($path, $timestamp);
        clearstatcache(true, $path);
    }

    private function removeDirectory(string $directory): void
    {
        if (! is_dir($directory)) {
            return;
        }

        foreach (scandir($directory) ?: [] as $entry) {
            if ($entry === '.' || $entry === '..') {
                continue;
            }

            $path = $directory.DIRECTORY_SEPARATOR.$entry;

            if (is_dir($path)) {
                $this->removeDirectory($path);
            } else {
                unlink($path);
            }
        }

        rmdir($directory);
    }
}
