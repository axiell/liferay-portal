# AGENTS.md

## Scope

- This is the Liferay Portal monorepo for `release-2026.q2`; root build files set `git.working.branch.name=release-2026.q2`.
- Architecture and build layout notes live in `DESIGN.md`; keep this file focused on commands, constraints, and gotchas.
- Read more specific `AGENTS.md` files when working below `modules/frontend-sdk/*` or `modules/apps/frontend-js/frontend-js-clay-web/clay`.

## Commands

- Full portal build/deploy: `ANT_OPTS="-Xmx2560m" ant all`. This runs `clean`, `compile`, then `deploy` and may run `git clean` per `build.git.clean.command`; do not run casually in a dirty tree.
- Core compile only: `ANT_OPTS="-Xmx2560m" ant compile`. `ant start` is deprecated and only calls `compile`.
- Module compile/test/deploy: from a module directory run `../../../../gradlew classes`, `../../../../gradlew test --tests <TestClassName>`, `../../../../gradlew testIntegration --tests <TestClassName>`, or `../../../../gradlew deploy` with the relative wrapper path adjusted to the module depth.
- Modules root alternative: `./gradlew --project-dir modules :apps:<area>:<module>:test --tests <TestClassName>`.
- Portal core tests: `ANT_OPTS="-Xmx2560m" ant test-unit`, `ANT_OPTS="-Xmx2560m" ant test-unit -Dtest.class=SomeTest`, or `ANT_OPTS="-Xmx2560m" ant test-package -Dtest.package=com.liferay...`.
- Frontend formatting/tests from `modules/`: `yarn formatLocalChanges`, `yarn formatCurrentBranch`, `yarn checkFormat`, `yarn test:all`.

## Formatting

- Java/JSP/Gradle/XML/etc. use Liferay Source Formatter, not generic formatters.
- For a Gradle module: run that module's `formatSource` task.
- For changed files across portal: from `portal-impl/`, run `ANT_OPTS="-Xmx2560m" ant format-source-current-branch`; use `format-source-all` only when you intend a full-tree pass.
- `ant format-source` defaults to current-branch behavior when the branch differs from `release-2026.q2`, and validates commit-message/security keywords.

## Config And Generated Files

- Do not edit `build.properties`, `app.server.properties`, or `test.properties` for local needs; create `build.${USER}.properties`, `app.server.${USER}.properties`, or `test.${USER}.properties`.
- `app.server.type` defaults to Tomcat; bundle location resolves under `../bundles` unless overridden in `app.server.${USER}.properties`.
- Gradle uses the patched wrapper distribution `tools/gradle-8.5.LIFERAY-PATCHED-1-bin.zip`; do not substitute system Gradle for verification.
- Generated frontend config lives at `modules/node-scripts.config.js`; regenerate from `modules/` with `node-scripts generate:global-config` instead of hand-editing.
- Local source versions of `rest-builder`, `service-builder`, `lang-builder`, and `source-formatter` are enabled by default via `*.ignore.local=false`; changes to those tools can affect downstream module builds.

## Operational Notes

- Deploying `portal-kernel`, `portal-impl`, or `portal-test` is not the same as a normal OSGi module deploy; use that directory's Ant deploy flow and expect a server restart.
- Runtime logs for the default Tomcat bundle are under `../bundles/tomcat-10.1.54/logs` unless local app-server properties override paths.
- This repo has no root GitHub workflow files; CI behavior is mostly encoded in Ant/Gradle/test properties and Jenkins-oriented scripts.
