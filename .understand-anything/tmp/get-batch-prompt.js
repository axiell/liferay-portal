#!/usr/bin/env node
// Usage: node get-batch-prompt.js <batchIndex>
const fs = require('fs');
const idx = parseInt(process.argv[2]);
const batches = JSON.parse(fs.readFileSync('/opt/projects/liferay/portal/arena-7.4.3.129-ga129/portal/.understand-anything/intermediate/batches.json','utf8'));
const batch = batches.batches.find(b => b.batchIndex === idx);
if (!batch) { console.error('Batch not found:', idx); process.exit(1); }
const filesStr = batch.files.map((f, i) => `${i+1}. \`${f.path}\` (${f.sizeLines} lines, language: \`${f.language}\`, fileCategory: \`${f.fileCategory}\`)`).join('\n');
const prompt = `Analyze these files and produce GraphNode and GraphEdge objects.
Project root: /opt/projects/liferay/portal/arena-7.4.3.129-ga129/portal
Project: Arena Liferay Portal — An Arena fork of Liferay Portal 7.4.3.129 GA129, a Java enterprise portal platform with OSGi modular architecture.
Languages: Java
Batch: ${batch.batchIndex}/${batches.batches.length}
Skill directory (for bundled scripts): /home/wos/.claude/plugins/cache/understand-anything/understand-anything/2.8.1/skills/understand
Output: write to /opt/projects/liferay/portal/arena-7.4.3.129-ga129/portal/.understand-anything/intermediate/batch-${batch.batchIndex}.json (single-file mode)

Pre-resolved import data for this batch (use directly — do NOT re-resolve imports from source):
\`\`\`json
${JSON.stringify(batch.batchImportData, null, 2)}
\`\`\`

Cross-batch neighbors with their exported symbols (confidence boost for cross-batch edges):
\`\`\`json
${JSON.stringify(batch.neighborMap, null, 2)}
\`\`\`

Files to analyze in this batch (every entry MUST be passed through to batchFiles with all four fields — path, language, sizeLines, fileCategory):
${filesStr}

**Additional context from main session:**

Project: Arena Liferay Portal — Arena fork of Liferay Portal 7.4.3.129 GA129
Languages: Java
Frameworks: OSGi, Ant, Gradle, Spring, Hibernate, Lucene/Elasticsearch
Architecture: portal-kernel/ is the API/SPI layer (interfaces, model APIs, service APIs, kernel utilities), portal-impl/ is the implementation layer (service impls, DAO, persistence, model impls, infrastructure).
This is a large enterprise Java portal with OSGi component model. Classes follow Liferay conventions: *Impl = implementation, *Util = utility, *Model = model interface, *ModelImpl = model implementation, *Service = service interface, *ServiceImpl = service impl, *Persistence = persistence interface, *PersistenceImpl = persistence impl.
`;
process.stdout.write(prompt);
