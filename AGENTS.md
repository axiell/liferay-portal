# AGENTS.md

Arena fork of Liferay Portal 7.4.3.129 GA129. Treat most code as upstream Liferay; use `git log --grep="PLCB"` when you need Arena-only history.

## Read First

- `CLAUDE.md` just points here.
- `README.markdown` is generic and low-signal.
- `DESIGN.md` has module boundaries, build boundary, Service Builder, REST Builder, and OSGi wiring. Load it for architecture or codegen work.

## Execution Discipline

- Think before coding: surface assumptions, ambiguities, and simpler alternatives instead of choosing silently.
- Keep changes surgical: touch only what the request requires; do not refactor adjacent code unless your change made it necessary.
- Prefer the minimum code that solves the request; avoid speculative abstractions and extra configurability.
- Define concrete success criteria and verify against them before calling the work done.

## Build System

- This repo uses two build systems. Do not guess.
- Use Ant at repo root for core portal code: `portal-impl`, `portal-kernel`, `portal-web`, `util-*`.
- Use Gradle from `modules/` for OSGi modules under `modules/apps`, `modules/core`, `modules/dxp`, `modules/util`, `modules/test`.
- Root Gradle wrapper is patched Liferay Gradle 8.5: `gradle/wrapper/gradle-wrapper.properties`.

## Safe Local Overrides

- Root `build.properties`, `app.server.properties`, and `test.properties` are template files marked `DO NOT EDIT`.
- Put local overrides in `build.${user.name}.properties`, `app.server.${user.name}.properties`, and `test.${user.name}.properties` instead.
- `app.server.properties` points the server bundle at `../bundles` and defaults to Tomcat.

## Commands That Matter

- Full portal rebuild and redeploy: `ant all`
- Compile portal core only: `ant compile`
- Hot deploy current portal + modules into local bundle: `ant deploy`
- Format whole repo: `ant format-source`
- Run root unit suites wired by Ant: `ant test-unit`
- Run one Ant test class: `ant test-class -Dtest.class=StringUtilTest`
- Run one Ant test method: `ant test-method -Dtest.class=StringUtilTest -Dtest.methods=testAppendParentheticalSuffixInteger`
- From a module dir, build jar only: `../../../../gradlew jar`
- From a module dir, deploy module: `../../../../gradlew deploy`
- From a module dir, run module unit tests: `../../../../gradlew test`
- From a module dir, run one Gradle test class: `../../../../gradlew test --tests "com.example.MyTest"`
- From a module dir, run formatter: `../../../../gradlew formatSource`
- From a module dir, formatter check only: `../../../../gradlew checkSourceFormatting`
- From a `*-service` module after changing `service.xml`: `../../../../gradlew buildService`

## Verification Quirks

- Prefer the smallest native verifier for the area you changed: Ant for portal core, Gradle for `modules/**`.
- `modules/build.gradle` disables `test` and `testIntegration` tasks automatically when that source set does not exist. A skipped task can be expected, not a misconfiguration.
- `buildService` in modules is wired to the local service-builder tool under `modules/util/portal-tools-service-builder` when present; do not hand-edit generated Service Builder output and skip regeneration.

## Formatting And Style Constraints

- Source formatter max line length is 80: `build.properties` and `source-formatter.properties`.
- Java source encoding is `ISO-8859-1`: `build.properties`.
- Gradle files in this repo conventionally use double quotes and explicit types; follow existing file style when editing.

## Java / Runtime Reality

- Do not repeat the old "Java 17 required" claim. Verified build config and CI still compile most code with Java 8 compatibility, and CI publishes workspaces with JDK 8.
- `app.server.properties` includes `--add-opens` JVM args for the local app server; if runtime issues mention module access, check there before inventing flags.

## Arena-Specific Notes

- Arena customizations are intentionally narrow; search `PLCB-*` commits before assuming a behavior is project-specific.
- `deploy-maven-artifacts.sh` is for publishing portal artifacts to Axiell Artifactory during upgrade/release work, not normal development.
- `.claude/agents/*` definitions mentioning eHub are for a different product and should be ignored in this repo.

## Knowledge Graph (understand-anything)

An understand-anything knowledge graph of `portal-impl` lives in `portal-impl/.understand-anything/knowledge-graph.json`.

- **10,292 nodes · 11,619 edges** (built 2026-06-27, scope: `portal-impl/src/`)
- Query in-session: `/understand-chat` (loads the graph and answers questions)
- From a dependent project: invoke `/understand-chat` with `project=/opt/projects/liferay/portal/arena-7.4.3.129-ga129/portal/portal-impl`
- Rebuild: run `/understand` from within `portal-impl/` to regenerate
- Graph is a local artifact (untracked); regenerate after major refactors

PreToolUse hooks mandate consulting the graph before grepping or reading source files.

## Useful Local Runtime Paths

- Tomcat bundle: `../bundles/tomcat-9.0.90/`
- Main Tomcat log: `../bundles/tomcat-9.0.90/logs/catalina.out`
- Liferay logs: `../bundles/logs/liferay.*.log`
- OSGi shell: `telnet localhost 11611`

## Axiell Vault

Decision and history questions — why something is like this, what changed, which branch or pin we are on, whether it was already investigated — go to the Axiell Obsidian vault before grepping source. A grep is the fallback when the vault has no answer, not the first move. Check it for upgrade history, module boundary rationale, and cross-repo Arena context before assuming this fork matches upstream Liferay behavior; route context-heavy lookups through `@obsidian-helper`.

Canonical notes: `Arena-Liferay-Portal` (entity), `arena-liferay-portal-repo-docs` (source), `project-summary-arena-liferay-portal` (analysis), `arena-liferay-portal-moc` (entry point), `arena-liferay-portal-repo-summary` (reference).

Those notes are pinned to **this** checkout — `/opt/projects/liferay/portal/arena-7.4.3.129-ga129/portal`, branch `arena-7.4.3.129-ga129`. Where they record an earlier `arena-7.4.3.149-2026.q2.0` pin, that is deliberate history: a separate, non-ancestor release line kept for comparison, not a description of this tree. Do not use `arena-liferay-workspace` notes for this repo — that is the separate Blade workspace — and do not use the `arena-liferay-portal-7-0-6-ga7` notes, which cover the old 7.0.6 fork.

How to reach it — the same in Claude Code, OpenCode and Hermes:
- The vault is selected by `.claude-obsidian.json` at this repo's root, which also carries the opt-in (`"session_context": true`). It is host-local and untracked because it holds an absolute path, so a fresh clone must recreate it. No such file means no vault, and every mechanism here is correctly silent.
- Emission additionally requires this vault to be listed in the user's `~/.config/claude-obsidian/allowed-vaults`. No `CLAUDE_OBSIDIAN_*` variable is exported machine-wide.
- `wiki/hot.md` arrives at session start via each harness's adapter around `claude-obsidian hook session-start`. If it is absent from session context, read it yourself.
- `/wiki-query` for anything deeper. After substantive findings run `/wiki-save`; `wiki/hot.md` is a cache, not a journal — four sections, under 500 words, overwritten whole.
- `/audit-vault-config` verifies the whole chain from this repo and says which half is missing.
