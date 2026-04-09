# QWEN.md — Arena Liferay Portal 7.4.3.129 GA129

## Project Overview

This is a **customized fork of Liferay Portal 7.4.3.129 CE GA129**, branded as **"Arena"** and used by Axiell. It is an enterprise-grade Java portal platform built on a multi-module architecture with OSGi support.

**Key technologies:**
- **Java 17** (required JDK version)
- **Apache Ant** — core portal build system (`portal-impl`, `portal-kernel`, `portal-web`, `util-*`)
- **Gradle 8.5** — OSGi module build system (`modules/`)
- **Tomcat 9.0.90** — default application server
- **OSGi (Apache Felix)** — modular service runtime
- **Hibernate** — ORM layer
- **Spring Framework** — dependency injection (legacy portal-impl)
- **Service Builder** — code generation for persistence/service layers
- **ClayUI / Metal.js / React** — frontend component libraries
- **Oracle / HyperSQL** — database (Oracle for production, HSQL for dev)

## Repository Structure

```
portal/
├── portal-impl/          # Core implementation (Spring, Hibernate, DB layer)
├── portal-kernel/        # Public API/SPI — all other code depends on this
├── portal-web/           # WAR with JSPs, Struts config, taglibs, web.xml
├── util-java/            # General Java utilities
├── util-bridges/         # JSF, Struts bridge utilities
├── util-slf4j/           # SLF4J logging utilities
├── util-taglib/          # Tag library implementations
├── modules/              # OSGi/Gradle multi-project workspace
│   ├── apps/             # Liferay CE applications (178+ apps)
│   ├── dxp/apps/         # Liferay DXP (enterprise) applications
│   ├── core/             # Core OSGi framework modules (petra, portal-bootstrap, etc.)
│   └── _node-scripts/    # Frontend build scripts (Yarn/npm based)
├── sql/                  # Database schemas and migration scripts
├── tools/                # SDK, Gradle wrapper, build tooling
├── lib/                  # Development and portal JAR dependencies
└── build-*.xml           # Ant build configuration
```

**Tomcat bundle location:** `../bundles/` (one level above `portal/`)

## Building and Running

### Prerequisites
- **Java 17** (JDK 17 required)
- **Apache Ant** installed and configured
- **Gradle 8.5** (managed via wrapper in `modules/`)

### Common Commands

**Build and deploy the entire portal:**
```bash
ant all
```

**Compile portal-impl/portal-kernel:**
```bash
ant compile
```

**Build a single Gradle module and deploy to Tomcat:**
```bash
cd modules/apps/<app-name>/<module-name>
../../../../gradlew deploy
```

**Build a module without deploying:**
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

**Start/stop Tomcat:**
```bash
../bundles/tomcat-9.0.90/bin/catalina.sh run    # foreground
../bundles/tomcat-9.0.90/bin/catalina.sh start  # background
../bundles/tomcat-9.0.90/bin/catalina.sh stop
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

### Source Formatting

**Max line length: 80 characters.** Java source encoding is **ISO-8859-1**.

```bash
# From a module directory
../../../../gradlew formatSource

# Check only (no fix)
../../../../gradlew checkSourceFormatting

# From portal root (all files)
ant format-source
```

## Architecture

### Key Architectural Layers

1. **portal-kernel** — Defines all service interfaces (`*LocalService`, `*Service`), model interfaces, utility APIs. Never contains implementation code.
2. **portal-impl** — Implements kernel interfaces via Spring beans, uses Hibernate for ORM, manages DB connections (HikariCP).
3. **OSGi runtime (Apache Felix)** — Modules loaded dynamically; services registered/consumed via `@Component` / `@Reference`.
4. **portal-web** — Struts + JSP MVC for legacy actions; modern portlets use the module system.

### OSGi Module Conventions

Each app under `modules/apps/<app-name>/` follows a consistent pattern:

| Module suffix | Purpose |
|---------------|---------|
| `-api` | Public API (exported packages, interfaces) |
| `-impl` | Implementation (registered as OSGi services with `@Component`) |
| `-service` | Service Builder generated code (persistence, local/remote services) |
| `-web` | Portlet/web tier |
| `-test` | Integration tests (run inside OSGi container via Arquillian) |

Each module has a `bnd.bnd` (OSGi metadata), `build.gradle`, and optionally a `service.xml` (for Service Builder).

### Service Builder

Service Builder generates the persistence and service layers from `service.xml`. It produces:
- `<app>-api/` — `*LocalService`, `*Service`, model interfaces, `*Wrapper`
- `<app>-service/` — `*LocalServiceImpl`, `*ServiceImpl`, `*PersistenceImpl`

After modifying `service.xml`, run `../../../../gradlew buildService`.

## Configuration Override Pattern

**Never edit `.properties` files in the root directly.** Create user-specific override files:

| Base file | Override file |
|-----------|---------------|
| `build.properties` | `build.${user.name}.properties` |
| `app.server.properties` | `app.server.${user.name}.properties` |
| `test.properties` | `test.${user.name}.properties` |
| `release.properties` | `release.${user.name}.properties` |

### Runtime portal configuration
`../bundles/portal-ext.properties` — runtime portal settings (already configured for Arena)

## Database

- **Development:** HyperSQL (default)
- **Production:** Oracle (configured in `../bundles/portal-ext.properties`)
- **JDBC driver:** `ojdbc17.jar` in `lib/development/`
- Arena customizations: `OracleDB.java` and `OracleDBFactory.java` in `portal-impl/src/com/liferay/portal/dao/db/`

## Frontend

- **ClayUI** — Liferay's UI component library built on Metal.js/React
- **Yarn Workspaces** — manages npm dependencies across all modules
- **Node scripts** (`modules/_node-scripts/`) handle JS/TS/SCSS bundling via Webpack
- **Sass compiler:** Dart Sass (configured in `build.properties`)

## Arena-Specific Customizations

Arena customizations are intentionally small. To find Arena-specific commits:
```bash
git log --oneline --grep="PLCB"
```

Key customized files:
| File | Change |
|------|--------|
| `portal-impl/.../dao/db/OracleDB.java` | Oracle dialect overrides |
| `portal-impl/.../dao/db/OracleDBFactory.java` | Oracle DB factory |
| `portal-impl/.../deploy/hot/HookHotDeployListener.java` | Hook hot deploy customizations |
| `modules/apps/frontend-editor/.../CKEditorConfigContributor.java` | CKEditor toolbar/config |
| `modules/apps/portal-vulcan/.../CacheContainerResponseFilter.java` | HTTP cache headers fix (PLCB-20549) |
| `modules/apps/portal-search-elasticsearch7/.../Sidecar.java` | Elasticsearch sidecar adjustments |

### Key `portal-ext.properties` settings (Arena dev defaults)
- `auth.pipeline.enable.liferay.check=false` — SAML/SSO bypass
- `locales=cs_CZ,de_CH,de_DE,en_GB,en_NZ,en_US,fi_FI,fr_FR,nb_NO,nn_NO,ru_FI,sv_SE`
- `company.default.name=Axiell`, `company.security.auth.type=screenName`
- Default admin: screen name `support`, password `sarenat` (dev only)
- `javascript.single.page.application.enabled=false`, `minifier.enabled=false` (dev perf)

### Elasticsearch
The Elasticsearch sidecar lives at `../bundles/elasticsearch-sidecar/`. It starts automatically with the portal.

### Feature Flags
Active Arena feature flags are configured in `portal-ext.properties` (e.g., `feature.flag.LPS-165482=true`).

## Dev Environment Tips

**Tomcat logs:**
- `../bundles/tomcat-9.0.90/logs/catalina.out` (main log)
- `../bundles/logs/liferay.*.log` (Liferay-specific logs)

**OSGi console (Felix Gogo shell):**
```bash
telnet localhost 11611
```

**Glowroot (performance profiler):**
- Bundled at `../bundles/glowroot/`
- Access at `http://localhost:4000` while Tomcat is running

**Git conventions:**
- `PLCB-*` — Arena-specific Jira tickets
- `LPS-*`, `LPD-*` — upstream Liferay tickets

## Maven Artifact Publishing

`deploy-maven-artifacts.sh` publishes portal JARs to Axiell's Artifactory instance (`https://artifactory.axiell.com`). Run it when upgrading Liferay versions to keep the Maven repo in sync.

## Git Ignore Patterns

The project ignores:
- Build artifacts (`/build`, `/classes`, `/dist`, `/out`)
- IDE files (`.iml`, `.ipr`, `.iws`, `.idea`, `.settings`)
- Server configuration files (`app.server.*.properties`, `build.*.properties`)
- Database files (`/sql/lportal.*`, `/sql/create*`)
- Deployed WARs (`portal-web/*.war`)
- Node modules cache and temp directories
- Test results and coverage reports
