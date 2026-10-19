# Language Ports

**English** · [Bahasa Indonesia](https://github.com/M-Husein/rest-api-laravel-2/wiki/id/Language-Ports)

The preset names are language-independent. Repository and package names may differ per
ecosystem, but the capabilities must match the preset contract.

## Roadmap

| No | Target | Suggested repository | Status |
|----|--------|----------------------|--------|
| 1 | PHP / Laravel | `rest-api-laravel-2` | Reference implementation, in progress |
| 2 | Go | `rest-api-go` | Planned |
| 3 | Rust | `rest-api-rust` | Planned |
| 4 | Node.js (Express/NestJS) | `rest-api-node` | Planned |
| 5 | Bun (ElysiaJS) | `rest-api-bun` | Planned |
| 6 | Python | `rest-api-python` | Planned |

## Rules for ports

- Keep the same five preset names: `api`, `api-ui`, `multilingual`, `multilingual-ui`,
  `site`.
- Do not add language names to preset names (`api-go`, `api-rust`, and so on).
- Define and version the API contract early; the React UI can be reused across backends
  when the contract is stable.
- `site` requires a server-rendered shell and metadata. If a port cannot support it yet,
  document the limitation instead of renaming the preset.

## Package naming

The PHP/Laravel reference uses Composer `programmeria/laravel-<feature>` and npm
`@programmeria/<feature>`. Other ecosystems may use their own conventions, but the feature
capabilities and preset membership must match.

## Shared frontend

Because the UI is a separate package that talks to a stable API, a port can reuse the same
React/Ant Design UI. Keep feature boundaries and the API contract aligned.
