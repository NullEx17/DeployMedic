# Security Policy

## Supported versions

| Version | Supported |
| --- | --- |
| 0.1.x | Yes |

## What DeployMedic does with data

- The CLI reads files under the scan root you pass. Paths are confined to that root (symlink escape and `../` traversal are rejected).
- Individual file reads are capped (1 MiB).
- Report JSON parsing is capped (2 MiB) in both the CLI and the browser viewer.
- The report viewer parses JSON entirely in the browser and does not upload reports.
- `--url` probes allow only `http:` and `https:` schemes.

## Reporting a vulnerability

Please use [GitHub private vulnerability reporting](https://github.com/NullEx17/DeployMedic/security/advisories/new) on this repository, or contact the maintainer via [NullEx17](https://github.com/NullEx17) / [nullex17.me](https://nullex17.me/), with:

1. Affected package and version
2. Reproduction steps
3. Impact assessment

Do not open a public issue for unfixed vulnerabilities.

We aim to acknowledge reports within 7 days.
