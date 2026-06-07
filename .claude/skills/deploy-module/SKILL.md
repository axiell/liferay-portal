---
name: deploy-module
description: Deploy a single OSGi module or portal core into the local Tomcat bundle. Usage: /deploy-module <module-dir-name>
disable-model-invocation: true
---

Deploy a module by name into `../bundles/tomcat-9.0.90/`.

## Steps

1. Find the module directory:

```bash
find /opt/projects/liferay/portal/arena-7.4.3.129-ga129/portal/modules -maxdepth 5 -type d -name "$MODULE" 2>/dev/null | head -5
```

2. If found under `modules/`, run Gradle deploy from that directory:

```bash
cd <module-dir>
../../../../gradlew deploy
```

3. If the argument matches a core target (`portal-impl`, `portal-kernel`, `portal-web`, `util-*`), run Ant deploy from repo root:

```bash
cd /opt/projects/liferay/portal/arena-7.4.3.129-ga129/portal
ant deploy
```

4. Tail the Liferay log for bundle activation (10 seconds):

```bash
tail -f ../bundles/logs/liferay.*.log | grep -E "(STARTED|STOPPED|Exception|$MODULE)" &
sleep 10; kill %1 2>/dev/null
```

Show exit code and any ERROR/Exception lines from the log tail.