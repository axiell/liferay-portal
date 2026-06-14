---
name: find-plcb-module
description: List OSGi modules and portal-core targets changed by a PLCB ticket, with deploy commands. Usage: /find-plcb-module PLCB-NNNNN
---

Identify what needs deploying after applying a PLCB ticket.

## Steps

1. List all files touched by commits matching the ticket:

```bash
cd /opt/projects/liferay/portal/arena-7.4.3.129-ga129/portal
git log --grep="$TICKET" --name-only --pretty="format:" | sort -u | grep -v '^$'
```

2. Group into two buckets:

**Portal core** — paths starting with `portal-impl/`, `portal-kernel/`, `portal-web/`, or `util-*/`:
- Deploy command: `ant deploy` from repo root

**OSGi modules** — paths starting with `modules/`:
- For each unique module directory (first 3 path segments under `modules/`), show the bundle symbolic name from `bnd.bnd` if present
- Deploy command: `cd <module-dir> && ../../../../gradlew deploy`

3. Print a concise deploy checklist ordered: portal core first (if any), then each module with its `gradlew deploy` invocation.

If no commits match the ticket, say so and suggest checking the ticket ID format.
