<?php

namespace App\Support\Frontend;

use Closure;
use InvalidArgumentException;
use RuntimeException;
use Symfony\Component\Process\Process;
use Throwable;

final class PackageManager
{
    public const BUN = 'bun';

    public const NPM = 'npm';

    public const PNPM = 'pnpm';

    /**
     * @var array<int, string>
     */
    private const SUPPORTED = [self::BUN, self::NPM, self::PNPM];

    /**
     * @var array<string, string>
     */
    private const LOCKFILES = [
        self::BUN => 'bun.lock',
        self::NPM => 'package-lock.json',
        self::PNPM => 'pnpm-lock.yaml',
    ];

    /**
     * @var array<string, string>
     */
    private const NODE_MODULES_MARKERS = [
        self::NPM => 'node_modules/.package-lock.json',
        self::PNPM => 'node_modules/.modules.yaml',
    ];

    /**
     * @var array<int, string>
     */
    private const FALLBACK_ORDER = [self::BUN, self::PNPM, self::NPM];

    private function __construct(private readonly string $name) {}

    public static function detect(
        string $basePath,
        ?string $preferred = null,
        ?callable $hasBinary = null,
    ): ?self {
        $checker = $hasBinary !== null
            ? Closure::fromCallable($hasBinary)
            : static fn (string $binary): bool => self::binaryExists($binary, $basePath);

        if ($preferred !== null && trim($preferred) !== '') {
            $name = strtolower(trim($preferred));

            if (! in_array($name, self::SUPPORTED, true)) {
                throw new InvalidArgumentException(
                    "Unsupported package manager [{$preferred}]. Supported: ".implode(', ', self::SUPPORTED).'.'
                );
            }

            if (! $checker($name)) {
                throw new RuntimeException("Package manager [{$name}] is not available in PATH.");
            }

            return new self($name);
        }

        $detected = self::detectFromNodeModules($basePath) ?? self::detectFromLockfiles($basePath);

        if ($detected !== null && $checker($detected)) {
            return new self($detected);
        }

        foreach (self::FALLBACK_ORDER as $name) {
            if ($checker($name)) {
                return new self($name);
            }
        }

        return null;
    }

    /**
     * @return array<int, string>
     */
    public static function supported(): array
    {
        return self::SUPPORTED;
    }

    public function name(): string
    {
        return $this->name;
    }

    public function installCommand(): string
    {
        return "{$this->name} install";
    }

    public function buildCommand(): string
    {
        return $this->runScriptCommand('build');
    }

    public function devCommand(): string
    {
        return $this->runScriptCommand('dev');
    }

    public function runScriptCommand(string $script): string
    {
        return "{$this->name} run {$script}";
    }

    public function runner(): string
    {
        return match ($this->name) {
            self::BUN => 'bunx',
            self::NPM => 'npx',
            self::PNPM => 'pnpm exec',
        };
    }

    private static function detectFromNodeModules(string $basePath): ?string
    {
        $candidates = [];

        foreach (self::NODE_MODULES_MARKERS as $name => $path) {
            $marker = $basePath.DIRECTORY_SEPARATOR.str_replace('/', DIRECTORY_SEPARATOR, $path);

            if (is_file($marker)) {
                $candidates[$name] = filemtime($marker) ?: 0;
            }
        }

        return self::newestUnique($candidates);
    }

    private static function detectFromLockfiles(string $basePath): ?string
    {
        $candidates = [];

        foreach (self::LOCKFILES as $name => $file) {
            $path = $basePath.DIRECTORY_SEPARATOR.$file;

            if (is_file($path)) {
                $candidates[$name] = filemtime($path) ?: 0;
            }
        }

        return self::newestUnique($candidates);
    }

    /**
     * @param  array<string, int>  $candidates
     */
    private static function newestUnique(array $candidates): ?string
    {
        if ($candidates === []) {
            return null;
        }

        $newest = array_keys($candidates, max($candidates), true);

        return count($newest) === 1 ? $newest[0] : null;
    }

    private static function binaryExists(string $binary, string $basePath): bool
    {
        try {
            $process = Process::fromShellCommandline(
                $binary.' --version',
                $basePath,
                null,
                null,
                30
            );

            $process->run();

            return $process->isSuccessful();
        } catch (Throwable) {
            return false;
        }
    }
}
