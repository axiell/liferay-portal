# Security Review — Arena Liferay Portal 7.0.6-ga7

Security posture of the `axiell/liferay-portal` fork (branch `feature/security-patch`) as changed by the security-patch PR.
PR: [#14 — PLCB-24908 Security Fix : Arena 4.7.X + Liferay (7.0.6)](https://github.com/axiell/liferay-portal/pull/14) (base branch `arena-7.0.6-ga7`).

## Summary

The PR remediates the actionable Aikido findings on this fork: it upgrades every runtime-shipped library that has a safe same-line patch, replaces log4j 1.x with reload4j across the portal and all OSGi modules, hard-removes the TunnelUtil TLS hostname-verification bypass, strips vulnerable Shiro jars out of the opensocial WAR, removes a checked-in Oracle JDBC binary in favor of a verified Maven Central download, and adds Aikido scan tooling with a reviewed accepted-risk registry (`.aikido-ignore`). Findings without a safe fix on this frozen platform line (Tomcat, Spring 4.1.9, Node.js 6 theme toolchain, xalan, EOL commons/struts 1.x artifacts) are documented accepted risks, several with compensating HAProxy controls in front of the portal.

## Changes

### Bundled library upgrades (`lib/portal/dependencies.properties`)

Jars in `lib/portal` are resolved from these pins at build time; each bump ships in the portal WAR classpath.

| Library | From | To | Why |
|---|---|---|---|
| xstream | 1.4.7 | 1.4.21 | Deserialization RCE. Deny-all + allowlist security framework is already wired in `PortletDataContextImpl`; jar swap only. OSGi export version updated in `modules/core/portal-bootstrap/system.packages.extra.bnd`. |
| log4j | log4j:1.2.17 | ch.qos.reload4j:reload4j:1.2.26 | Fixes the whole log4j 1.x CVE cluster (incl. CVE-2019-17571) via an API/ABI-compatible maintained fork that keeps the `org.apache.log4j.*` classes `log4j-extras` needs. `log4j-extras` 1.2.17 stays (no reload4j equivalent; ABI-compatible). OSGi `org.apache.log4j.*` export versions bumped to 1.2.26. |
| commons-fileupload | 1.3.2 | 1.6.0 | Improper access control / upload-handling CVEs. |
| commons-beanutils | 1.9.2 | 1.9.4 | Improper access control (`class` property access). |
| commons-io | 2.5 | 2.15.1 | Input-validation CVEs. |
| httpclient | 4.5.9 | 4.5.14 | Input-validation CVEs. |
| xercesImpl | 2.11.0 | 2.12.2 | XML parsing infinite-loop DoS. |
| json-java | com.redhat.qe:20110202 | org.json:json:20240303 | Memory corruption / crash in stale unofficial artifact. |
| dom4j | 1.6.1 | org.dom4j:dom4j:2.1.4 | XXE-class fixes; version also updated in `lib/versions-complete.xml` and `lib/versions-ext.xml`. |

Development-only: hsqldb 2.3.3 → 2.7.1 (`lib/development/dependencies.properties`).

### OSGi module dependency updates (Gradle)

- `commons-lang3` 3.4 → 3.14.0 (`compileInclude`, i.e. embedded in the bundle) in `petra-doulos` and `portal-template-soy` — the two modules that ship it.
- `org.json` → 20240303 and `com.redhat.qe:json-java` dropped in `petra-doulos`, `portal-template-soy` (compile-only).
- xstream compile-only pin 1.4.7 → 1.4.21 in `export-import-service`.
- log4j → reload4j 1.2.26 in every module that declared it: `petra-log4j`, `portal-log4j-extender`, `ip-geocoder`, `server-admin-web`, `portal-dao-orm-custom-sql`, `portal-output-stream-container`, `hot-deploy-jmx-listener`, `portal-tools-service-builder`.
- Transitive test-scope log4j pulls excluded (`easyconf`, `slf4j-log4j12`, `arquillian-container-felix-embedded`) in `registry-test`, `portal-search-elasticsearch`, `portal-search-elasticsearch6-impl`, `adaptive-media-document-library-thumbnails`, with reload4j substituted where a log4j API is still needed at test time.

### Code hardening

- `portal-kernel/src/com/liferay/portal/kernel/service/http/TunnelUtil.java` — the TLS hostname-verification bypass is removed outright: the `_VERIFY_SSL_HOSTNAME` flag and the `HostnameVerifier` that unconditionally returned `true` are gone, so inter-node tunnel HTTPS connections always verify hostnames. The corresponding `TunnelUtil.verify.ssl.hostname` property is removed from `portal-impl/src/portal.properties` — the insecure mode can no longer be configured.
- `modules/apps/opensocial/opensocial-portlet/build.xml` — `shiro-core-1.0.0-incubating.jar`, `shiro-web-1.0.0-incubating.jar`, and the Shindig Shiro sample classes are deleted from the WAR at build time (CVE-2010-3863 authorization bypass, CVE-2014-0074 path traversal); the old step that repacked shiro-web is removed.

### Supply-chain and build hygiene

- Checked-in `lib/development/ojdbc8.jar` binary removed from the repo and gitignored; `build.xml` gains a `download-oracle-jdbc-driver` target that fetches ojdbc8 23.x from Maven Central over HTTPS before `deploy-additional-jars`.
- HikariCP setup URL in `portal.properties` fixed from dead plaintext `http://central.maven.org` (2.6.0) to `https://repo1.maven.org` (4.0.3); `build-dist.xml` copies the local `lib/portal/hikaricp.jar` instead of downloading during distribution builds.
- Gradle builds resolve from `https://repo1.maven.org/maven2` and `https://plugins.gradle.org/m2` (dead Liferay repos removed as resolution sources); `scripts/sweep-deps.sh` bootstraps all dependencies the dead Liferay CDNs can no longer serve so a fresh clone builds reproducibly; `scripts/deploy-maven-artifacts.sh` publishes portal artifacts to Axiell Artifactory with check-before-fetch downloads.
- `tools/sdk/dependencies/org.codehaus.groovy/lib/groovy-all.jar` upgraded 2.0.1 → 2.4.21 (CVE-2015-3253 MethodClosure remote code execution, CVE-2016-6497 deserialization RCE). Jar fetched from Maven Central and verified against its published SHA-1; checked in for build reproducibility — SDK tooling only, never deployed to the portal; see Decisions.

### Security scanning infrastructure

- `.aikido-ignore` — reviewed accepted-risk registry (one Aikido group id per line with owner, reason, review date), consumed by drift-check tooling so silent divergence between documented accepted risks and dashboard state is detected.
- `.aikido-exclude` / `.aikido-clean` — scan-scope excludes and pre-scan cleanup globs, so scans run against tracked source instead of generated `build/`/`classes/` trees (earlier scans were dominated by generated-artifact noise).
- `aikido-scan`, `aikido-analyse` (with `bulk-ignore-groups.sh`, `check-accepted-risk-drift.sh`), `cve-triage`, and `release-cut` skills codify the scan → triage → accepted-risk workflow; `aikido-scan`/`aikido-analyse` are maintained centrally as portable manual skills (`~/.agents/manual-skills/`, invoked via `/aikido-scan` / `/aikido-analyse`) rather than checked into this repo, so they stay identical across every Axiell project. `cve-triage` and `release-cut` remain repo-local under `.claude/skills/`.

## Decisions and rationale

Platform context: this is a frozen fork of Liferay Portal 7.0.6-ga7 on Java 8. It embeds Spring 4.1.9 in the ROOT webapp classloader; Arena WARs bundle and isolate their own Spring copies, so portal-side Spring exposure does not propagate to Arena application code. Wholesale Spring, Tomcat, or platform upgrades are out of scope for this line. All inbound browser traffic passes through HAProxy (`arena.cfg`): strict JSONWS service allowlist, `/WEB-INF` and `/webdav` path denies, admin-page URL-parameter blocks, internal-API IP restriction, HTTPS enforcement.

- **Spring 4.1.9 not upgraded** — bound into the ROOT classloader of the frozen platform; a Spring bump is a platform migration, not a patch. CVE-2018-1271's primary vector (traversal into `WEB-INF/`) is blocked by the HAProxy `path_beg /WEB-INF` deny; CVE-2018-1272 (multipart path traversal) is now also covered — arena-install's `stage/haproxy/arena/arena.cfg` (branch `feature/security-patch`, commit `d225089d`) adds a `path_reg` deny for raw and percent-encoded `../` sequences ahead of any backend routing, closing the gap this review originally flagged. See [arena-install/SECURITY_REVIEW.md](../../../../arena-install/develop/arena-install/SECURITY_REVIEW.md).
- **Tomcat (bundled, EOL) not upgraded** — same frozen-platform constraint; HTTPS termination at HAProxy reduces TLS-layer exposure, application-layer CVEs accepted for this line.
- **log4j replaced with reload4j rather than migrated to log4j2/slf4j** — `log4j-extras` (`EnhancedPatternLayout`, rolling appenders) depends on log4j 1.x internals, ruling out a `log4j-over-slf4j` swap; reload4j keeps the same classes and ships the CVE fixes.
- **Node.js 6.6.0 build toolchain kept** (bundles zlib 1.2.8, openssl 1.0.x, v8 5.x, c-ares 1.x) — a Node 18 upgrade breaks `ant clean all` in legacy theme modules (gulp 3 / `graceful-fs` `primordials` crash on Node 12+). Build-machine exposure only; never deployed to the portal. Recorded in `.aikido-ignore`.
- **xalan 2.7.2 kept** — no patched 2.7.x exists for CVE-2022-34169; the XSLT path is reachable only by authenticated admins, not via JSONWS. Accepted in `.aikido-ignore`.
- **Shiro stripped, not upgraded** — the opensocial portlet's shiro 1.0.0-incubating jars are removed from the built WAR entirely instead of chasing an upgrade inside a legacy portlet.
- **groovy-all 2.4.21 checked in under `tools/sdk/dependencies/`** — SDK build tooling only, not deployed to the portal; kept in-repo for build reproducibility. The JSONWS allowlist also blocks API-driven Groovy script execution from the internet.
- **commons-collections stays 3.2.2, commons-lang stays 2.6, struts-core/struts-tiles stay 1.3.10** — each is the final release of its line with no same-package upgrade path. Struts CVE-2014-0114-class attacks are mitigated by the existing `struts.portlet.ignored.parameters.regexp` blocking `class.*`/`[class]` parameters in `PortalRequestProcessor`.
- **Bootstrap XSS finding accepted** — transitive via `liferay-theme-deps-7.0`; exploitable only through unsanitised user-controlled `data-*` attributes on Bootstrap JS components.
- **Legacy AUI JS findings accepted** (`eval`/`document.write` in `frontend-js-web`, `frontend-js-aui-web`) — inputs flow from portal configuration, not direct user input; low practical exploitability.
- **SAST SQL-injection findings in upgrade/schema utilities not reworked** — code runs at portal startup, not in response to HTTP requests; not web-exploitable.
- **Exposed-secrets findings are false positives** — hex color constants, a PEM header string literal, method parameters, and build-output copies; ignored in Aikido.

## Future recommendations

1. Audit the flagged path-traversal servlets (`WebServerServlet`, `DynamicResourceServlet`) for docroot normalisation, and SSRF-flagged callers (`SimpleHTTPSender`, `SocketUtil`) for user-controlled URLs.
2. ~~Add HAProxy belt-and-suspenders rules...~~ **Done** — arena-install `feature/security-patch` (`d225089d`) adds the path-traversal regex deny (`\.\./`, `%2e%2e%2f`, `\.\.%2f`, `%2e%2e/`) closing the CVE-2018-1272 gap, plus `p_p_id` 82/167 (Script Console, DDM template-editor) denies restricted to the internal source whitelist. Live `p_p_id` re-verification against a running deployment remains an open pre-flight check — see arena-install's review, Future recommendations #1.
3. ~~Confirm whether Arena deployments ship the opensocial portlet at all...~~ **Confirmed not shipped** (2026-07-20) — the opensocial portlet is never deployed through arena-parent. `scripts/deploy-maven-artifacts.sh` now excludes `osgi/war/opensocial-portlet-*.war` from the published `com.liferay.portal.osgi` zip, and `.aikido-exclude` drops the whole `modules/apps/opensocial/opensocial-portlet/**` module from scan scope (superseding the earlier per-vendor-file entries) rather than tracking its blobs one at a time. `jamwiki-1.0.7-src.zip` (`wiki-engine-mediawiki`) is excluded separately — that module's jar *is* present in the built bundle, so its deployment status is unconfirmed and only the vendor source archive is excluded, not the module. Fully removing the opensocial-portlet build target instead of excluding+building is still open if it's confirmed dead weight end-to-end.
4. Audit `BeanPropertiesImpl` (Struts parameter binding) for user-controlled deserialised input.
5. Replace xalan with Saxon-HE if the admin XSLT feature must stay; otherwise keep the accepted-risk entry.
6. Migrate the theme build toolchain off gulp 3 / Node 6 so the Node.js runtime (and its bundled zlib/openssl/v8/c-ares) can be upgraded.
7. Register `feature/security-patch` (or its successor) explicitly in Aikido so feature-branch scan correlation is exact.
8. Platform migration — newer Liferay/Tomcat/Spring line — is the only path that retires the Tomcat, Spring 4.1.9, and EOL commons/struts findings; out of scope for this fork.
