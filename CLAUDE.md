# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a customized fork of **Liferay Portal 7.4.3.129 CE GA129**, branded as "Arena" and used by Axiell. The branch `arena-7.4.3.129-ga129` tracks Liferay's upstream releases and adds Arena/Axiell-specific customizations. Commit messages referencing `PLCB-*` are Arena-specific Jira tickets; `LPS-*` and `LPD-*` are upstream Liferay tickets.

The Tomcat bundle lives at `../bundles/` (one level above `portal/`). The running server is `../bundles/tomcat-9.0.90/`.

## Build System

This project uses **two parallel build systems**:

- **Apache Ant** (`ant`) — for the core portal (`portal-impl`, `portal-kernel`, `portal-web`, `util-*`). All main targets are in `build.xml` / `build-common.xml`.
- **Gradle** (`./gradlew` inside `modules/`) — for OSGi modules under `modules/`. Most module work is done with Gradle from within a module directory.

**Never edit `build.properties` or `build.wos.properties` directly.** Override them in `build.${user.name}.properties`. Same applies to `app.server.properties` and `test.properties`.

### Common Commands

**Build and deploy the entire portal:**
```bash
ant all
```

**Build a single Gradle module and deploy to Tomcat:**
```bash
cd modules/apps/<app-name>/<module-name>
../../../../gradlew deploy
```

**Build without deploying:**
```bash
../../../../gradlew jar
```

**Run unit tests for a Gradle module:**
```bash
cd modules/apps/<app-name>/<module-name>
../../../../gradlew test
```

**Run a single test class (Gradle):**
```bash
../../../../gradlew test --tests "com.example.MyTest"
```

**Run Ant unit tests (portal-impl, portal-kernel, etc.):**
```bash
ant test-unit
```

**Run a single test class (Ant):**
```bash
ant test-class -Dtest.class=StringUtilTest
```

**Run a single test method (Ant):**
```bash
ant test-method -Dtest.class=StringUtilTest -Dtest.methods=testAppendParentheticalSuffixInteger
```

**Format source code (source formatter):**
```bash
# From module dir
../../../../gradlew formatSource

# From portal root (all files)
ant format-source
```

**Compile portal-impl/portal-kernel:**
```bash
ant compile
```

**Deploy hot (to running Tomcat without full restart):**
```bash
ant deploy
```

**Service Builder (regenerate service layer from service.xml):**
```bash
cd modules/apps/<app-name>/<module-name>-service
../../../../gradlew buildService
```

**Start/stop Tomcat:**
```bash
../bundles/tomcat-9.0.90/bin/catalina.sh run    # foreground
../bundles/tomcat-9.0.90/bin/catalina.sh start  # background
../bundles/tomcat-9.0.90/bin/catalina.sh stop
```

## Architecture

### Repository Structure

```
portal/
├── portal-impl/          # Core portal implementation (Spring, Hibernate, DB layer)
├── portal-kernel/        # Public API / SPI — all other code depends on this
├── portal-web/           # WAR with JSPs, Struts config, taglibs, web.xml
├── util-java/            # General Java utilities
├── util-bridges/         # JSF, Struts bridge utilities
├── util-taglib/          # Tag library implementations
├── modules/              # OSGi/Gradle multi-project workspace
│   ├── apps/             # Liferay CE applications (178+ apps)
│   ├── dxp/apps/         # Liferay DXP (enterprise) applications
│   ├── core/             # Core OSGi framework modules (petra, portal-bootstrap, etc.)
│   └── _node-scripts/    # Frontend build scripts (Yarn/npm based)
└── portal-web/
    └── docroot/          # Web application root (JSPs, WEB-INF, etc.)
```

### OSGi Module Conventions

Each app under `modules/apps/<app-name>/` follows a consistent pattern:

- `<app>-api` — public API (exported packages, interfaces)
- `<app>-impl` — implementation (registered as OSGi services with `@Component`)
- `<app>-service` — Service Builder generated code (persistence, local/remote services)
- `<app>-web` — portlet/web tier
- `<app>-test` — integration tests (run inside OSGi container via Arquillian)

Each module has a `bnd.bnd` (OSGi metadata), `build.gradle`, and optionally a `service.xml` (for Service Builder).

### Service Builder

Service Builder generates the persistence and service layers from `service.xml`. It produces:
- `<app>-api/` — `*LocalService`, `*Service`, model interfaces, `*Wrapper`
- `<app>-service/` — `*LocalServiceImpl`, `*ServiceImpl`, `*PersistenceImpl`

After modifying `service.xml`, run `../../../../gradlew buildService`.

### Key Architectural Layers

1. **portal-kernel** — defines all service interfaces (`*LocalService`, `*Service`), model interfaces, utility APIs. Never contains implementation code.
2. **portal-impl** — implements kernel interfaces via Spring beans, uses Hibernate for ORM, manages DB connections (HikariCP).
3. **OSGi runtime** (Felix) — modules loaded dynamically; services registered/consumed via `@Component` / `@Reference`.
4. **portal-web** — Struts + JSP MVC for legacy actions; modern portlets use the module system.

### Database

Default configuration uses HyperSQL for development. Oracle is supported and configured in `../bundles/portal-ext.properties` (JDBC settings are commented out; uncomment and configure for Oracle). The JDBC driver `ojdbc17.jar` is in `lib/development/`.

Arena customizations include Oracle-specific DB classes in `portal-impl/src/com/liferay/portal/dao/db/OracleDB.java` and `OracleDBFactory.java`.

### Frontend

- **ClayUI** — Liferay's UI component library built on Metal.js/React
- **Yarn** (Workspaces) — manages npm dependencies across all modules
- Node scripts (`modules/_node-scripts/`) handle JS/TS/SCSS bundling via Webpack
- Source formatting for JS/TS uses ESLint + Prettier (configured via `modules/npmscripts.config.js`)

### Configuration Override Pattern

All `.properties` files in the root are "DO NOT EDIT" templates. To override:
- `build.${user.name}.properties` — build overrides
- `app.server.${user.name}.properties` — server path overrides
- `test.${user.name}.properties` — test overrides
- `../bundles/portal-ext.properties` — runtime portal configuration (already present)

## Arena-Specific Customizations

To find all Arena-specific code changes: `git log --oneline --grep="PLCB"`. The set of customized files is intentionally small:

| File | Change |
|------|--------|
| `portal-impl/src/com/liferay/portal/dao/db/OracleDB.java` | Oracle dialect overrides |
| `portal-impl/src/com/liferay/portal/dao/db/OracleDBFactory.java` | Oracle DB factory |
| `portal-impl/src/com/liferay/portal/deploy/hot/HookHotDeployListener.java` | Hook hot deploy customizations |
| `modules/apps/frontend-editor/frontend-editor-ckeditor-web/.../CKEditorConfigContributor.java` | CKEditor toolbar/config for Arena |
| `modules/apps/portal-vulcan/portal-vulcan-impl/.../CacheContainerResponseFilter.java` | HTTP cache headers fix (PLCB-20549) |
| `modules/apps/portal-search-elasticsearch7/.../sidecar/Sidecar.java` | Elasticsearch sidecar adjustments |

Key `portal-ext.properties` settings (Arena dev defaults):
- `auth.pipeline.enable.liferay.check=false` — SAML/SSO bypass
- `locales=cs_CZ,de_CH,de_DE,en_GB,en_NZ,en_US,fi_FI,fr_FR,nb_NO,nn_NO,ru_FI,sv_SE`
- `company.default.name=Axiell`, `company.security.auth.type=screenName`
- Default admin: screen name `support`, password `sarenat` (dev only)
- `javascript.single.page.application.enabled=false`, `minifier.enabled=false` (dev perf)

### Elasticsearch

The Elasticsearch sidecar lives at `../bundles/elasticsearch-sidecar/`. It starts automatically with the portal. No separate setup is needed for local development.

### Maven Artifact Publishing

`deploy-maven-artifacts.sh` publishes portal JARs to Axiell's Artifactory instance (`https://artifactory.axiell.com`). Run it when upgrading Liferay versions to keep the Maven repo in sync.

## Source Formatter

Max line length is **80 characters**. Run before committing:
```bash
# From a module
../../../../gradlew formatSource

# Check only (no fix)
../../../../gradlew checkSourceFormatting
```

Java source encoding is **ISO-8859-1** (set in `build.properties`).

## Dev Environment

**Tomcat logs**: `../bundles/tomcat-9.0.90/logs/catalina.out` (main log), `../bundles/logs/liferay.*.log` (Liferay-specific).

**OSGi console** (Felix Gogo shell): `telnet localhost 11611`

**Glowroot** (performance profiler): bundled at `../bundles/glowroot/`. Access at `http://localhost:4000` while Tomcat is running. Useful for diagnosing slow requests.

**Feature flags**: Active Arena feature flags are configured in `portal-ext.properties` (e.g., `feature.flag.LPS-165482=true`). To enable/disable a feature flag for testing, add `feature.flag.<flag-id>=true/false` to `portal-ext.properties`.

## Java Version

Java 17 is required. Source and target compatibility are set to 17 throughout.

## Note on `.claude/` Agents

The agent definitions in `.claude/agents/` (`oracle-dba`, `emedia-architecture-reviewer`) describe the **eHub** application (a separate Axiell product built on Spring Boot + CXF + Wicket). They do not apply to this Liferay repository and should be ignored.
