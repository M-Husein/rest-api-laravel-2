import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const manifestPath = resolve(root, 'features.json');
const outPath = resolve(root, 'packages/ui/resources/ts/features.generated.ts');

const toIdentifier = (name) =>
  name
    .replace(/[^a-zA-Z0-9]+(.)/g, (_match, char) => char.toUpperCase())
    .replace(/^[^a-zA-Z_]/, '_');

const manifest = JSON.parse(
  readFileSync(manifestPath, 'utf8').replace(/^\uFEFF/, '')
);
const selected = Array.isArray(manifest.features) ? manifest.features : [];
const features = Array.isArray(manifest.frontend)
  ? manifest.frontend
  : selected;
const inRepo = manifest.inRepo ?? {};

const imports = features
  .map((name) => {
    const local = inRepo[name];
    if (local) {
      return `import { ${local.export} as ${toIdentifier(name)} } from '${local.path}';`;
    }
    return `import ${toIdentifier(name)} from '@programmeria/${name}';`;
  })
  .join('\n');

const entries = features.map((name) => `  ${toIdentifier(name)},`).join('\n');

const content = `// AUTO-GENERATED FILE - DO NOT EDIT MANUALLY.
// Source of truth: features.json
// Regenerate with: bun run generate:features
import type { FeatureDescriptor } from '@/core/feature';
${imports ? imports + '\n' : ''}
export const FEATURES: FeatureDescriptor[] = [
${entries}
];
`;

writeFileSync(outPath, content, 'utf8');
console.log(
  `Generated features.generated.ts (${features.length} feature(s): ${features.join(', ') || 'none'})`
);
