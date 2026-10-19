<?php

namespace App\Console\Commands;

use App\Support\Starter\FeatureRepository;
use Illuminate\Console\Command;

class StarterFeaturesCommand extends Command
{
    protected $signature = 'starter:features';

    protected $description = 'List available and selected starterkit features';

    public function handle(): int
    {
        $repository = new FeatureRepository(base_path());
        $selected = $repository->selected();

        $rows = [];

        foreach ($repository->all() as $feature) {
            $rows[] = [
                $feature->name,
                $feature->composerName,
                $feature->constraint(),
                in_array($feature->name, $selected, true) ? 'yes' : 'no',
                implode(', ', $feature->presets) ?: '-',
            ];
        }

        if ($rows === []) {
            $rows[] = ['-', '-', '-', '-', '-'];
        }

        $this->table(['Feature', 'Composer', 'Constraint', 'Selected', 'Presets'], $rows);

        $presetRows = [];

        foreach ($repository->presets() as $name => $features) {
            $presetRows[] = [
                $name,
                $name === $repository->defaultPreset() ? 'yes' : 'no',
                implode(', ', $features) ?: 'none',
            ];
        }

        if ($presetRows === []) {
            $presetRows[] = ['-', '-', '-'];
        }

        $this->table(['Preset', 'Default', 'Features'], $presetRows);

        return self::SUCCESS;
    }
}
