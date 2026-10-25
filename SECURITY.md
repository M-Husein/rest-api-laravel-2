# Security Policy

**Languages:** English | [Bahasa Indonesia](SECURITY-id_ID.md)

## Supported versions

| Version | Supported |
|---------|-----------|
| 0.3.x   | Yes       |
| < 0.3.0 | No        |

This project requires **PHP >= 8.5.12**. Older PHP versions are affected by PHP2Shell
(`CVE-2026-109618`, `CVE-2026-109619`) and are not supported.

## Reporting a vulnerability

Please do **not** open a public issue with vulnerability details.

This project does not currently use GitHub Security Advisories or a dedicated security
email address. Report vulnerabilities privately to the maintainer through the contact
method available on the maintainer's GitHub profile:

- https://github.com/M-Husein

If you cannot reach the maintainer privately, open a minimal public issue asking for a
private channel. Do not include reproduction steps, affected endpoints, credentials, or
other sensitive details in that issue.

Please include:

- Affected version or commit.
- PHP version and relevant environment details.
- Steps to reproduce.
- Security impact and any suggested fix.

## Disclosure

Please allow time for the issue to be investigated and fixed before public disclosure.
The maintainer will coordinate the fix and disclosure with you.

## Scope

This policy covers this repository and its bundled packages. Report vulnerabilities in
third-party dependencies to the upstream project, unless the issue is caused by how this
project configures or uses the dependency.

## Security baseline

- Never commit `.env`, application keys, OAuth secrets, database credentials, or tokens.
- Use environment variables for secrets and rotate them after exposure.
- Keep PHP at 8.5.12 or newer.
- Keep Composer and frontend dependencies up to date.

## No bug bounty

This project does not currently offer a bug bounty program.
