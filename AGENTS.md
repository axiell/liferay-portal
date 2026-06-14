# AGENTS.md

Arena fork of Liferay Portal 7.4.3.129 GA129. Treat most code as upstream Liferay; use `git log --grep="PLCB"` when you need Arena-only history.

## Read First

- `CLAUDE.md` just points here.
- `README.markdown` is generic and low-signal.
- `DESIGN.md` for module structure, REST Builder workflow, post-generation patches, and security decisions.
  Load only when working on architecture-related tasks.

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

## Layout That Changes Decisions

- `portal-impl` contains core implementation and Spring/Hibernate-backed portal internals.
- `portal-kernel` is public API/SPI; avoid putting implementation there.
- `portal-web` is the legacy WAR/JSP/Struts layer.
- `modules/` is the OSGi workspace. Typical app split is `-api`, `-service`, `-impl`, `-web`, `-test`.
- Marker files under `modules/**` are operationally important. `.lfrbuild-portal` opts a module into `ant all`; `.lfrbuild-app-server-lib`, `.lfrbuild-static`, and `.lfrbuild-tool` change deploy destination.

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

## Knowledge Graph (graphify)

A graphify knowledge graph of `portal-kernel` + `portal-impl` lives in `graphify-out/`.

- **130,197 nodes · 329,838 edges · 4,734 communities** (built 2026-06-15)
- Scope: all Java/shell/Gradle code under `portal-kernel/` and `portal-impl/`
- Interactive viz: open `graphify-out/graph.html` in a browser
- Query in-session: `/graphify query "<question>"`
- Path between two concepts: `graphify path "ThemeDisplay" "PermissionChecker"`
- Explain a node: `graphify explain "MVCCModel"`
- Rebuild after major changes: `/graphify portal-kernel portal-impl`
- Update incrementally: `graphify update .` (AST-only, no API cost)
- From a dependent project: `graphify query "<question>" /opt/projects/liferay/portal/arena-7.4.3.129-ga129/portal`

Key god nodes (highest cross-community connectivity): `MVCCModel`, `ThemeDisplay`, `PropsKeys`, `PortletWrapper`, `GroupPersistenceImpl`.

PreToolUse hooks are active — Claude will consult the graph before grep/find/Read on source files. Auto-rebuild on commit is intentionally disabled; run `graphify update .` manually after significant changes.

## Useful Local Runtime Paths

- Tomcat bundle: `../bundles/tomcat-9.0.90/`
- Main Tomcat log: `../bundles/tomcat-9.0.90/logs/catalina.out`
- Liferay logs: `../bundles/logs/liferay.*.log`
- OSGi shell: `telnet localhost 11611`
