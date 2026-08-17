# Architecture & Design

Source build reference: [Building Liferay Source](https://learn.liferay.com/w/reference/contributing-to-liferay-development/building-liferay-source).

## Build Layout

- Portal core is Ant-based: `portal-kernel`, `portal-impl`, `portal-web`, `portal-test`, `util-*`, and `support-tomcat`.
- OSGi and app modules are Gradle-based under `modules/`; the wrapper is root `./gradlew`, so from `modules/` use `../gradlew` or `./gradlew --project-dir modules` from repo root.
- `modules/package.json` is the Yarn workspace root for frontend packages; workspaces include `apps/*/*`, `apps/*/*/*`, `dxp/apps/*/*`, `frontend-sdk/*`, and `test/playwright`.

## Module Markers

- `.lfrbuild-portal` controls inclusion in `ant all` deployment; deploy location is separately controlled by marker files such as `.lfrbuild-app-server-lib`, `.lfrbuild-static`, and `.lfrbuild-tool`.
- `.lfrbuild-spring-boot` marks Spring Boot modules; `.lfrbuild-ci*` markers change Jenkins behavior.
