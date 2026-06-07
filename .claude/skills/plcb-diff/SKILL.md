---
name: plcb-diff
description: Show Arena-specific customizations for a PLCB ticket or list all PLCB commits. Usage: /plcb-diff [PLCB-NNNNN]
---

Show Arena-specific changes from `git log --grep=PLCB`.

## With a ticket argument (e.g. `/plcb-diff PLCB-20571`)

```bash
cd /opt/projects/liferay/portal/arena-7.4.3.129-ga129/portal
git log --grep="$TICKET" --oneline
```

For each commit SHA returned, show the diff and list touched modules:

```bash
git show <sha> --stat
git show <sha>
```

Summarise: which modules were changed, what the patch does, whether any generated files were hand-edited.

## Without an argument (`/plcb-diff`)

List all PLCB commits with their touched paths:

```bash
cd /opt/projects/liferay/portal/arena-7.4.3.129-ga129/portal
git log --grep="PLCB" --oneline
git log --grep="PLCB" --name-only --pretty="format:--- %h %s" | head -120
```

Group results by module path and flag any commit that touched generated Service Builder or REST Builder output.