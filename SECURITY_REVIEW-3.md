# Security Review 3 - Aikido Feature-Branch Scan 149057757

Source: `https://app.aikido.dev/featurebranch/scan/149057757?groupId=64852`

## Scan Context

- Repository reported by scanner: `liferay-portal`
- Local branch scanned: `feature/security-patch`
- Compared commits: `3070ead089c4b151dd0533b8d217d2faadce45b9` vs `3a42ed9dec38dee96a6c27c1f021a5468f70ef07`
- Scan stages completed: secrets, dependencies, SAST, IaC
- Aikido result: `no new issues with critical severity or higher found`

## Executive Summary

This feature-branch scan passed its critical gate. No new critical-or-higher issues were introduced by the diff scanned in `149057757`.

Follow-up analysis used the Aikido public export API to triage open findings by `group_id`. That export is repository-wide, not feature-branch-diff scoped, so its counts do not contradict the passing feature-branch gate. They show backlog still open on the registered repository.

Important Aikido registration detail: the local git branch `feature/security-patch` is not registered in Aikido as its own code repository. The live repository record found by API is:

- Repository id: `2327591`
- Repository name: `axiell/liferay-portal`
- Registered branch: `arena-7.0.6-ga7`

Accepted-risk drift check against `.aikido-ignore` reported no drift: all currently configured accepted-risk groups are already ignored in Aikido.

## Repository-Wide Export Context

Export file used for triage:

- `/tmp/aikido-axiell-liferay-portal-feature-security-patch.json`

Open issue counts from export:

| Severity | Open count |
|---|---:|
| Critical | 516 |
| High | 1631 |
| Medium | 3263 |
| Low | 663 |

These raw counts are not the unit of work for this repo. The same dependency version is reported once per affected manifest or packaged artifact. Triage must stay at `group_id` level.

## Key Open Groups

| Group ID | Package / Rule | Version | Severity | Count | Assessment |
|---|---|---|---|---:|---|
| `21258634` | JSP scriptlets are used and are hard to keep secure |  | Medium | 1825 | Large SAST backlog. Not a single fix. Treat separately from dependency cleanup. |
| `21256491` | Apache Tomcat / `CVE-2025-24813` | `10.1.34` | Critical | 410 | Not from this legacy portal tree alone. Likely packaged artifacts or adjacent build outputs in scanned workspace/export. Verify source ownership before action. |
| `20662655` | `jackson-databind` / `CVE-2018-14721` | `2.9.2` | Critical | 279 | Real dependency family. Needs source-manifest ownership check before proposing bump. |
| `21256730` | `com.thoughtworks.xstream:xstream` / `CVE-2021-21345` | `1.4.10` | Critical | 278 | Real dependency family. Needs source-manifest ownership check before proposing bump. |
| `20662662` | `spring-core` / `AIKIDO-2026-11158` | `6.1.16` | High | 249 | Not expected from this legacy branch alone. Verify whether export includes packaged adjacent projects. |
| `21255858` | Log4j / `CVE-2019-17571` | `1.2.0` | Critical | 188 | Matches accepted-risk guidance in `SECURITY_REVIEW-2.md`. Candidate to record in `.aikido-ignore` by `group_id` after human review. |
| `31646449` | `spring-boot` / `AIKIDO-2026-10661` | `3.3.4` | High | 141 | Not expected from this legacy portal tree alone. Verify ownership before action. |
| `21256075` | Stacktrace might be exposed to end user |  | Medium | 133 | Broad SAST rule. Triage by concrete path clusters, not by count alone. |

## Documented Accepted-Risk / Suppress Candidates Still Open

The following open groups align with already-documented accepted-risk or suppress guidance and should be reviewed for addition to `.aikido-ignore` if not already recorded there:

| Group ID | Finding | Review guidance |
|---|---|---|
| `21255858` | Log4j `CVE-2019-17571` | Accepted risk. `SECURITY_REVIEW-2.md` documents SocketServer not started. |
| `33507626` | `xalan:xalan` `CVE-2022-34169` | Suppress/accept with justification unless replaced; admin-authenticated XSLT path only. |
| `33507407` | `madler/zlib` `CVE-2022-37434` | Accepted risk with Node.js build-toolchain finding. |
| `33507404` | `openssl/openssl` `CVE-2022-1292` | Accepted risk with Node.js build-toolchain finding. |
| `33507406` | `c-ares/c-ares` `CVE-2016-5180` | Accepted risk with Node.js build-toolchain finding. |
| `33507411` | `v8/v8` `CVE-2016-1669` | Accepted risk with Node.js build-toolchain finding. |

One more group needs special review:

- `21256638` `com.google.protobuf:protobuf-java` `CVE-2024-7254` remains open in export, but `SECURITY_REVIEW-1.md` says this branch does not ship the previously suspected Elasticsearch 7 module. Re-check exact file paths behind this group before treating it as real work.

## Observed Noise / Ownership Warnings

Top exported file keys include entries such as:

- `pom.xml`
- `service/pom.xml`
- `resource/pom.xml`
- `target/...jar/...`
- embedded WAR paths
- `Unmanaged C/C++ Dependency`

This indicates the export still mixes true source manifests with packaged artifacts and non-portal material. Do not patch from counts alone. Confirm each candidate is:

1. Source-controlled in this repository.
2. Actually resolved by this legacy branch's build.
3. Not already covered by accepted-risk guidance.

## Earlier Noisy Feature-Branch Scan

Previous scan `141607394` was dominated by generated `build/`, `classes/`, `tmp/`, `.gradle/`, and Aikido `/scan/` pseudo-path artifacts rather than tracked source. That earlier conclusion still stands: scanner hygiene matters, and cleanup before scan materially improves signal quality.

## Recommendations

1. Keep feature-branch scans running from a cleaned workspace. Pre-scan cleanup already removed generated `classes/` and `build/` trees before `149057757`.
2. Continue triage by `group_id`, never by raw issue count.
3. Add only human-reviewed accepted-risk groups to `.aikido-ignore`; do not apply dashboard ignores automatically.
4. First candidates for reviewed ignore entries: `21255858`, `33507626`, `33507407`, `33507404`, `33507406`, `33507411`.
5. Re-check `21256638` (`protobuf-java`) against actual paths before accepting or fixing; prior review says it is not applicable on this branch.
6. For real dependency remediation, patch only source-controlled manifest-owned dependencies and stay within same release line unless a later review explicitly approves broader movement.
7. If Aikido repository registration for `feature/security-patch` is needed long-term, register that branch explicitly so future export/scan correlation is exact instead of inferred through the base repository record.
