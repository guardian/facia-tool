# switch-container-type

Migrates legacy Fronts container types to supported container types.

This script fetches collection configuration from the Fronts tool, identifies collections using deprecated container types, and updates them in-place.

> **Warning**
>
> This script performs live updates against the Fronts API.

---

## Overview

The script:

1. Fetches `/config` from a Fronts environment
2. Identifies collections requiring migration
3. Determines which fronts reference each collection
4. Updates the collection via `/config/collections/:id`
5. Writes a log file containing the results

Collections that do not match the defined migration rules are skipped.

---

## Supported stages

| Stage | Base URL |
|-------|----------|
| `PROD`  | https://fronts.gutools.co.uk |
| `CODE`  | https://fronts.code.dev-gutools.co.uk |
| `LOCAL` | https://fronts.local.dev-gutools.co.uk |

You must supply `--stage`.

---

## Authentication

Authentication is provided via a Fronts cookie.

The cookie **must** be supplied as an environment variable:

{STAGE}_FRONTS_COOKIE

Example:

```bash
export CODE_FRONTS_COOKIE="<full cookie header value>"
```
The value must be the complete Cookie header copied from an authenticated browser session.

The script will exit if the cookie is not set.

---

## Usage

```
node ./switch-container-type --stage CODE
```
```
node ./switch-container-type --stage LOCAL
```


Production safeguard

When running with:
```
--stage PROD
```
You will be prompted to confirm:
```
This will run in the PROD environment. Proceed? (y/n):
```
The script will abort unless you confirm.

---
## Logging

After execution, the script writes the following log locally :
```
switch-container-type-log.json
```

Structure:
```
{
"updates": [],
"skipped": [],
"succeeded": [],
"failed": []
}

```
The log includes:

- All attempted updates
- Skipped collections
- Successful updates
- Failures (with error messages)
