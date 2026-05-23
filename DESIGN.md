# DESIGN.md

Load this only for architecture or codegen work. `README.markdown` is generic; this file captures the repo structure and generation workflows that are easy to guess wrong.

## Repository Boundaries

- `portal-kernel` is public API/SPI. Do not put implementation code here.
- `portal-impl` is core implementation backed by Spring/Hibernate and portal internals.
- `portal-web` is the legacy WAR/JSP/Struts layer.
- `modules/` is the OSGi workspace. Typical app split is `-api`, `-service`, `-impl`, `-web`, `-test`.

## Build Boundary

- Core portal work uses Ant from repo root.
- OSGi module work uses Gradle from `modules/` or a module directory.
- Marker files under `modules/**` matter operationally:
  - `.lfrbuild-portal` opts a module into `ant all`
  - `.lfrbuild-app-server-lib`, `.lfrbuild-static`, `.lfrbuild-tool` change deploy destination

## Service Builder

- Service Builder source of truth is `service.xml` in a `*-service` module.
- Typical `*-service/build.gradle` declares where generated API and tests live, for example `modules/apps/object/object-service/build.gradle` sends generated API to `../object-api/src/main/java` and integration tests to `../object-test/src/testIntegration/java`.
- After editing `service.xml`, run `../../../../gradlew buildService` from that `*-service` module.
- `modules/build.gradle` wires `buildService` to the local tool under `modules/util/portal-tools-service-builder` when present, so generation uses the checked-in local builder.
- Do not hand-edit generated Service Builder output and skip regeneration.

## REST Builder

- REST Builder source of truth is `rest-config.yaml` in a `*-rest-impl` or `*-impl` module, for example `modules/apps/object/object-rest-impl/rest-config.yaml`.
- `rest-config.yaml` points generated API output at a sibling `-api` module via `apiDir` and declares the API package via `apiPackagePath`.
- `modules/build.gradle` wires `buildREST` to the local tool under `modules/util/portal-tools-rest-builder` when present, so local generation uses the checked-in builder.
- `modules/util/portal-tools-rest-builder/build.gradle` deploys that builder into `tools/sdk/dependencies/com.liferay.portal.tools.rest.builder/lib` and formats it after build.
- When changing REST Builder contracts, update the config/spec first, regenerate, then patch handwritten impl code around the generated surface instead of editing generated classes directly.

## Runtime Wiring

- OSGi services are declared through module metadata plus DS components; keep implementation in `-impl` or `-service`, not in `-api`.
- Legacy JSP/Struts work belongs in `portal-web`; new app-level features usually land under `modules/apps/**`.
- REST impl modules usually depend on `portal-vulcan`, JAX-RS APIs, and sibling `-api` modules rather than exposing endpoints from `portal-web`.

## Arena Scope

- Most architecture is upstream Liferay. Check `git log --grep="PLCB"` before assuming a repo behavior is Arena-specific.
