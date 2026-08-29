# SECURITY_REVIEW — Aikido findings, `arena-7.4.3.129-ga129`

**Date:** 2026-08-29
**Source scan:** `aikido-scan --full --no-fail --force-create-repository-for-branch` (all six stages completed: code, secrets, dependencies, SAST, licenses, IaC)
**Dashboard:** https://app.aikido.dev/repositories/2914481 (repo `axiell/liferay-portal`, branch `arena-7.4.3.129-ga129`, head `1ef98b4`)
**Accepted-risk drift check:** clean — `.aikido-ignore` is empty (no risks accepted yet; nothing configured and unapplied).

---

## 1. Executive summary

| Measure | Count | Meaning |
|---|---|---|
| Latest clean scan (this tree, current excludes) | **55** | What the scanner reports on the checked-out working tree today |
| Export, open records repo-wide | 13,348 | API-visible state accumulated since Feb 2026 |
| …of which point at paths **not in this checkout** | **12,886** | Contamination from foreign working trees scanned under the same repo name/branch |
| …of which point at paths **that exist here** | **462** | The real, actionable backlog |
| Distinct open groups (in-tree) | ~120 | The actual unit of triage decision |

**Two headline conclusions:**

1. **The dashboard state is ~96% contaminated.** Of 6,835 unique `affected_file` paths among open records, only 96 exist in this checkout. Foreign paths include `/alma/mock-alma/build/target/tomcat-7.0.73/**` (absolute, Tomcat 7 jars), `central/`, `common/`, `services/`, and a root `pom.xml` — none exist here. Earlier scans of *other* working trees (Arena `alma`/`central` services: Spring 6.1.x, spring-boot 3.3.x, solr-core 9.8.x, Tomcat 10.1.34 — none of which is this portal's stack) were published under the same `--repositoryname` + branch. Do not triage those records as if they belonged to this tree; remediation belongs to the project that owns those paths.
2. **The real in-tree backlog is 462 open records / 67 critical + 142 high**, dominated by a handful of dependency groups where one package pinned across many files multiplies the record count (axios 1.6.2 alone accounts for 73 records = one bump decision).

---

## 2. In-tree findings by type

| Type | Open (in-tree) | Notes |
|---|---|---|
| open_source (CVEs) | 370 | Group-triaged below; mostly frontend JS + some platform-pinned Java |
| leaked_secret | 64 | Needs file-by-file human review — see §4 |
| license | 15 | AGPL/SSPL/Elastic-licensed deps (percolator-client 7.17.24 critical-tagged, etc.) |
| eol | 13 | spring-core/spring-expression 4.1.9 line (12+ records) |

### Top in-tree groups (the unit of decision)

| Records | Sev | Package | Version | CVE | Group | First bucket |
|---|---|---|---|---|---|---|
| 73 | med | axios | 1.6.2 | CVE-2024-39338 | 21258589 | Patchable — one bump clears all 73 |
| 28 | high | Spring Boot | 2.7.18 | CVE-2025-22235 | 42734346 | Platform-pinned (2.7 line) — candidate accepted risk |
| 16 | high | (secret) | — | — | 42882047 | Human review required |
| 16 | high | bcprov-jdk18on | 1.78 | AIKIDO-2026-10630 | 42882240 | Patchable (1.78 → 1.78.x) |
| 15 | crit | billboard.js | 1.12.11 | CVE-2025-49223 | 31965692 | Patchable (frontend dep) |
| 13 | crit | lodash | 4.17.21 | CVE-2026-4800 | 21258606 | Patchable |
| 13 | crit | lodash-es | 4.17.11 | CVE-2019-10744 | 31965697 | Patchable |
| 12 | low | spring-core | 4.1.9.RELEASE | AIKIDO-2024-10363 | 20662662 | Platform-pinned legacy line |
| 11 | med | dompurify | 3.0.2 | CVE-2024-47875 | 31965696 | Patchable |
| 11 | med | undici | 5.0.0 | CVE-2026-1526 | 42882181 | Patchable |
| 9 | med | Spring Framework | 5.3.39 | CVE-2024-38820 | 36518070 | Platform-pinned (Liferay 7.4 bundles 5.3.x) |
| 9 | high | (secret) | — | — | 42882038 | Human review required |
| 8 | med | follow-redirects | 1.15.3 | CVE-2024-28849 | 34571388 | Patchable |
| 8 | crit | Spring Security | 5.5.1 | CVE-2022-22978 | 42380289 | Check platform pin before bump |
| 8 | med | tar | 7.2.0 | AIKIDO-2026-11058 | 42882290 | Patchable |
| 7 | low | (secret) | — | — | 33507607 | Human review required |
| 7 | med | @babel/traverse | 7.16.10 | AIKIDO-2025-10745 | 42882229 | Patchable |
| 7 | med | rollup | 1.32.1 | AIKIDO-2024-10288 | 42882281 | Patchable |
| 7 | crit | percolator-client | 7.17.24 | license | 42884913 | License policy decision |
| 7 | med | spring-expression | 4.1.9.RELEASE | AIKIDO-2026-687238 | 42380294 | Platform-pinned legacy line |

(Generic defaults applied — no prior project security-review doc existed. Bucket legend per triage: *patchable* = real manifest, same major/minor patch-line bump; *platform-pinned* = version line fixed by the surrounding platform; *human review* = secrets, never auto-bucketed.)

---

## 3. Foreign-tree contamination (do not triage here)

| Evidence | Detail |
|---|---|
| Absolute foreign paths | `/alma/…`, incl. `/alma/mock-alma/build/target/tomcat-7.0.73/**` |
| Relative paths absent from this checkout | `central/` (1,158 recs), `common/` (341), `services/` (376), `local/` (673 — this tree's `local/` differs), `alma/` (147), `legacy-services/` (130), `freelib-webapp/` (135), `mock-alma/` (240) |
| Stack mismatch | spring-core 4.3.10 (981 recs), spring-webmvc 6.1.13 (482), spring-boot 3.3.8, solr-core 9.8.1, Tomcat 10.1.34 — not the Liferay 7.4.3.129 stack |
| Root `pom.xml` findings (544 recs) | This repo has no root `pom.xml` |

**Cause (hypothesis):** `--repositoryname` derived from the git remote's last path component (`liferay-portal`) matches other Arena checkouts' remotes; scans run from those trees published into `axiell/liferay-portal [arena-7.4.3.129-ga129]`.

**Options:** (a) have an Aikido admin split/rename the affected repos, or (b) ignore-by-group the foreign groups with justification "foreign tree — belongs to `<project>`", or (c) accept the noise and keep triaging against in-tree paths only (what this review does). Do **not** bulk-delete repo rows — the per-branch row hosts this branch's real history.

---

## 4. Secrets (in-tree: 64 open) — human review required

Top files (in-tree, open): `tools/tck/htmlunit-tests.xml` (11), `federated-search-service/src/test/resources/data/latest-snapshot/source.json` (8), `portal/view/portlets-wicket/.../ZeroHitPanel.html` (8), `.idea/workspace.xml` (7), unit-test sources with fake password fixtures (7+7), `src/test/resources/central_service_response*.json` (6+6), `local/local-rest-api/.../openapi.yaml` (5), `modules/plugins/eidentitet-idp/src/test/resources/.../eidentitetConfig.properties` (4).

Most look like **test fixtures and IDE state** (fake passwords, sample JSON). Two files deserve closer eyes: `.idea/workspace.xml` (can contain real saved credentials) and any `portlet.properties`/config in shipped resources. 60 of the 312 repo-wide secret records were first detected in Aug 2026 (gitleaks walks the whole tree — `--exclude` does not apply to it).

**Action:** file-by-file verdict — "test fixture / not shipped" (ignore with justification + review date) or rotate-and-remove.

---

## 5. IaC, EOL, license (in-tree)

- **IaC:** 84 open repo-wide, all container hygiene (Docker runs as root: 52+1; auto-upgrading base images: 30; S3 public-access block: 1). Small, fixable in Dockerfiles.
- **EOL:** in-tree 13, all the spring 4.1.9 line — rides with the platform-pin decision below.
- **License:** 15 in-tree. `percolator-client@7.17.24` (crit-tagged), AGPL/SSPL/Elastic families. Policy call, not a code fix.

---

## 6. Recommended actions (priority order)

1. **Secrets review (§4)** — 30 minutes of eyes; rotate anything real. Highest signal-per-effort.
2. **axios 1.6.2 → 1.6.x patch (group 21258589)** — 73 records, one dependency family, one PR. Verify the consuming manifests first (safe-fix: patch-line only, same major/minor).
3. **Frontend batch, one family per PR:** lodash 4.17.21, lodash-es 4.17.11, billboard.js 1.12.11, dompurify 3.0.2, follow-redirects 1.15.3, @babel/traverse 7.16.10, rollup 1.32.1, tar 7.2.0 — each patch-line bump clears its whole group on the next scan.
4. **bcprov-jdk18on 1.78 → 1.78.x** (group 42882240).
5. **Platform-pinned candidates — do NOT bump yet; check the platform pin first:** Spring Framework 5.3.39 (Liferay 7.4 bundles the 5.3.x line), Spring Boot 2.7.18, Spring Security 5.5.1, spring-core/spring-expression 4.1.9. If confirmed pinned by the platform, record in `.aikido-ignore` via the bulk-ignore flow (§7) with justification, owner, review date.
6. **IaC Dockerfile fixes** — runs-as-root and base-image pinning; ~84 findings, mechanical.
7. **License policy decision** for the AGPL/SSPL/Elastic set.
8. **Contamination cleanup (§3)** — admin-level, separate from this branch's remediation.

After each patch: run the smallest affected build/test scope, then re-scan with `aikido-scan`.

---

## 7. Recording accepted risks

Accepted-risk group ids go in **`.aikido-ignore`** at the repo root (`<group_id> <reason incl. owner + review date>`, one per line). `bulk-ignore-groups.sh` **prints** the Aikido API call for a human to review and run — it never mutates the dashboard itself. Applying an ignore is always a deliberate, reviewed, manual step. Re-run the drift check (`check-accepted-risk-drift.sh <export.json>`) after any rescan to catch expired/reopened ignores.

---

## 8. Methodology notes / caveats

- Export counts are **repository-wide API state**, not the scan page's introduced/solved diff. The 55 vs 13,348 gap is explained by §1/§3 (contamination + records predating the tightened excludes; 2,324 open records point into now-excluded `target/`/`build/` trees).
- Dashboard `sidebarIssue` ids (e.g. 42882275) are a different id space than export record `id`s — correlation is by `group_id` only.
- The scanner link list truncates (19 links printed for 55 findings); counts come from the scanner summary line and the export, not the link list.
- `--exclude` is a plain substring match (no globs, no root anchoring; `test/` also matches `-test/`), and gitleaks ignores excludes entirely.
- `--scan-timeout` must stay at the 900000 default — at 300000 SAST and IaC silently fail while the run still exits 0.
- Repo-wide open by severity (incl. contamination): 751 critical / 3,204 high / 7,977 medium / 1,416 low. In-tree: 67 / 142 / 193 / 60.
