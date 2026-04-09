---
name: build-all
description: Build and deploy the full Arena/Liferay portal. Usage: /build-all
disable-model-invocation: true
---

Run a full clean build and deploy from the portal root `/opt/projects/liferay/portal/arena-7.4.3.129-ga129/portal`.

## Command

```bash
ant clean all
```

## Execution

Run the command using the Bash tool with a timeout of 600000ms (10 minutes). Stream output as it runs.

On failure, show the relevant error lines (skip `[INFO]` and `[echo]` noise) and identify the failing target and likely cause.