const fs = require('fs');

const extractResults = JSON.parse(fs.readFileSync(
  '/opt/projects/liferay/portal/arena-7.4.3.129-ga129/portal/.understand-anything/tmp/ua-file-extract-results-1.json', 'utf8'));

const importData = JSON.parse(fs.readFileSync(
  '/opt/projects/liferay/portal/arena-7.4.3.129-ga129/portal/.understand-anything/tmp/ua-file-analyzer-input-1.json', 'utf8')).batchImportData;

const batchFiles = [
  {"path":"portal-impl/src/com/liferay/counter/model/impl/CounterModelImpl.java","sizeLines":518,"language":"java","fileCategory":"code"},
  {"path":"portal-impl/src/com/liferay/portal/change/tracking/registry/CTModelRegistration.java","sizeLines":36,"language":"java","fileCategory":"code"},
  {"path":"portal-impl/src/com/liferay/portal/change/tracking/registry/CTModelRegistry.java","sizeLines":79,"language":"java","fileCategory":"code"},
  {"path":"portal-impl/src/com/liferay/portal/cluster/ClusterableAdvice.java","sizeLines":73,"language":"java","fileCategory":"code"},
  {"path":"portal-impl/src/com/liferay/portal/cluster/ClusterableInvoker.java","sizeLines":76,"language":"java","fileCategory":"code"},
  {"path":"portal-impl/src/com/liferay/portal/cluster/ClusterableRequest.java","sizeLines":62,"language":"java","fileCategory":"code"},
  {"path":"portal-impl/src/com/liferay/portal/cluster/ClusterInvokeAcceptor.java","sizeLines":69,"language":"java","fileCategory":"code"},
  {"path":"portal-impl/src/com/liferay/portal/cluster/ClusterInvokeThreadLocal.java","sizeLines":42,"language":"java","fileCategory":"code"},
  {"path":"portal-impl/src/com/liferay/portal/events/StartupHelper.java","sizeLines":1196,"language":"java","fileCategory":"code"},
  {"path":"portal-impl/src/com/liferay/portal/events/StartupHelperUtil.java","sizeLines":42,"language":"java","fileCategory":"code"},
  {"path":"portal-impl/src/com/liferay/portal/file/install/FileInstall.java","sizeLines":57,"language":"java","fileCategory":"code"},
  {"path":"portal-impl/src/com/liferay/portal/file/install/FileInstallImpl.java","sizeLines":873,"language":"java","fileCategory":"code"},
  {"path":"portal-impl/src/com/liferay/portal/file/install/FileInstallImplBootstrapBundleActivator.java","sizeLines":295,"language":"java","fileCategory":"code"},
  {"path":"portal-impl/src/com/liferay/portal/file/install/FileInstallImplCustomFilter.java","sizeLines":38,"language":"java","fileCategory":"code"},
  {"path":"portal-impl/src/com/liferay/portal/file/install/FileInstallImplFileTracker.java","sizeLines":151,"language":"java","fileCategory":"code"},
  {"path":"portal-impl/src/com/liferay/portal/file/install/FileInstallImplSubdirWalker.java","sizeLines":42,"language":"java","fileCategory":"code"},
  {"path":"portal-impl/src/com/liferay/portal/file/install/FileInstallListener.java","sizeLines":32,"language":"java","fileCategory":"code"},
  {"path":"portal-impl/src/com/liferay/portal/file/install/FileInstallManager.java","sizeLines":53,"language":"java","fileCategory":"code"},
  {"path":"portal-impl/src/com/liferay/portal/file/install/Scanner.java","sizeLines":132,"language":"java","fileCategory":"code"},
  {"path":"portal-impl/src/com/liferay/portal/file/install/ScannerImpl.java","sizeLines":727,"language":"java","fileCategory":"code"},
  {"path":"portal-impl/src/com/liferay/portal/file/install/ScannerListener.java","sizeLines":37,"language":"java","fileCategory":"code"},
  {"path":"portal-impl/src/com/liferay/portal/file/install/ScannerUtil.java","sizeLines":63,"language":"java","fileCategory":"code"},
  {"path":"portal-impl/src/com/liferay/portal/file/install/SettingsFileInstall.java","sizeLines":68,"language":"java","fileCategory":"code"},
  {"path":"portal-impl/src/com/liferay/portal/file/install/SettingsFileInstallJARScanner.java","sizeLines":97,"language":"java","fileCategory":"code"},
  {"path":"portal-impl/src/com/liferay/portal/file/install/SettingsFileInstallWatcher.java","sizeLines":128,"language":"java","fileCategory":"code"},
  {"path":"portal-impl/src/com/liferay/portal/file/install/SettingsFileInstallWatcherListener.java","sizeLines":99,"language":"java","fileCategory":"code"},
  {"path":"portal-impl/src/com/liferay/portal/file/install/configuration/FileInstallConfiguration.java","sizeLines":40,"language":"java","fileCategory":"code"},
  {"path":"portal-impl/src/com/liferay/portal/file/install/configuration/FileInstallConfigurationImpl.java","sizeLines":90,"language":"java","fileCategory":"code"},
  {"path":"portal-impl/src/com/liferay/portal/file/install/configuration/FileInstallConfigurationListener.java","sizeLines":43,"language":"java","fileCategory":"code"},
  {"path":"portal-impl/src/com/liferay/portal/file/install/configuration/FileInstallConfigurationManager.java","sizeLines":42,"language":"java","fileCategory":"code"},
  {"path":"portal-impl/src/com/liferay/portal/file/install/internal/FileInstallImplBundleActivator.java","sizeLines":119,"language":"java","fileCategory":"code"},
  {"path":"portal-impl/src/com/liferay/portal/file/install/internal/FileInstallImplBundleListener.java","sizeLines":58,"language":"java","fileCategory":"code"},
  {"path":"portal-impl/src/com/liferay/portal/file/install/internal/FileInstallImplFilter.java","sizeLines":62,"language":"java","fileCategory":"code"},
  {"path":"portal-impl/src/com/liferay/portal/file/install/internal/FileInstallImplMBean.java","sizeLines":72,"language":"java","fileCategory":"code"},
  {"path":"portal-impl/src/com/liferay/portal/file/install/internal/FileInstallImplManagedFactoryRegistrar.java","sizeLines":44,"language":"java","fileCategory":"code"}
];

function tagsFromPath(path) {
  // Match: .../com/liferay/<package-path>/File.java
  const match = path.match(/com\/liferay\/(.+)\.java/);
  if (!match) return [];
  const pkg = match[1].replace(/\/[^\/]+$/, ''); // remove filename
  return ['liferay'].concat(pkg.split('/'));
}

function complexityFor(extracted, category) {
  if (!extracted) return 'unknown';
  const fc = extracted.functions ? extracted.functions.length : 0;
  if (category === 'file') {
    if (extracted.totalLines > 500) return 'complex';
    if (extracted.totalLines > 100) return 'moderate';
    return 'simple';
  }
  return 'simple';
}

function summaryFor(path, extracted) {
  const name = path.split('/').pop().replace('.java', '');
  const folder = path.split('/').slice(-3, -1).join('/');
  if (!extracted) return name + ' in liferay/' + folder + ' (not on disk)';
  return name + ' in liferay/' + folder;
}

// Build lookup of extraction results by path
const extractedMap = {};
for (const r of extractResults.results) {
  extractedMap[r.path] = r;
}

const nodes = [];
const edges = [];
const nodeSet = new Set();

function addNode(node) {
  if (nodeSet.has(node.id)) return;
  nodeSet.add(node.id);
  nodes.push(node);
}

// Process each batch file
for (const bf of batchFiles) {
  const path = bf.path;
  const extracted = extractedMap[path];
  const isAnalyzed = !!extracted;

  // File node
  addNode({
    id: 'file:' + path,
    type: 'file',
    name: path.split('/').pop(),
    filePath: path,
    summary: summaryFor(path, extracted),
    tags: tagsFromPath(path),
    complexity: isAnalyzed ? complexityFor(extracted, 'file') : 'unknown'
  });

  // Class and function nodes for analyzed files
  if (isAnalyzed) {
    // Class nodes
    for (const cls of (extracted.classes || [])) {
      const classId = 'class:' + path + ':' + cls.name;
      addNode({
        id: classId,
        type: 'class',
        name: cls.name,
        filePath: path,
        lineRange: [cls.startLine, cls.endLine],
        summary: cls.name + ' class',
        tags: tagsFromPath(path),
        complexity: complexityFor(extracted, 'class')
      });

      // contains: file -> class
      edges.push({
        source: 'file:' + path,
        target: classId,
        type: 'contains',
        direction: 'forward',
        weight: 1
      });

      // exports: file -> class
      edges.push({
        source: 'file:' + path,
        target: classId,
        type: 'exports',
        direction: 'forward',
        weight: 0.8
      });

      // contains: class -> method for each method
      for (const method of (extracted.functions || [])) {
        const funcId = 'function:' + path + ':' + method.name;
        // Only create function node if it's in the class methods list
        if (cls.methods.includes(method.name) && !nodeSet.has(funcId)) {
          addNode({
            id: funcId,
            type: 'function',
            name: method.name,
            filePath: path,
            lineRange: [method.startLine, method.endLine],
            summary: method.name + '(' + method.params.join(', ') + ')',
            tags: tagsFromPath(path).concat(method.name.toLowerCase()),
            complexity: 'simple'
          });

          // contains: class -> method
          edges.push({
            source: classId,
            target: funcId,
            type: 'contains',
            direction: 'forward',
            weight: 1
          });

          // contains: file -> function
          edges.push({
            source: 'file:' + path,
            target: funcId,
            type: 'contains',
            direction: 'forward',
            weight: 1
          });
        }
      }
    }

    // Export edges for additional exports (fields, constants) that are not class/function nodes
    for (const exp of (extracted.exports || [])) {
      // Check if this export is a class or function we already have
      const isClass = extracted.classes.some(c => c.name === exp.name);
      const isFunc = extracted.functions.some(f => f.name === exp.name);
      if (!isClass && !isFunc) {
        // This is a static field/constant export - create an exports edge from file to the symbol
        // Don't create a node for constants, just the edge
        edges.push({
          source: 'file:' + path,
          target: exp.name,
          type: 'exports',
          direction: 'forward',
          weight: 0.8
        });
      }
    }

    // Call graph edges
    for (const call of (extracted.callGraph || [])) {
      const callerFuncId = 'function:' + path + ':' + call.caller;
      // Only add calls edge if caller is a known function node
      if (nodeSet.has(callerFuncId)) {
        // Check if callee is also a local function (in the same file)
        const calleeIsLocal = extracted.functions.some(f => call.callee === f.name);
        if (calleeIsLocal) {
          const calleeFuncId = 'function:' + path + ':' + call.callee;
          edges.push({
            source: callerFuncId,
            target: calleeFuncId,
            type: 'calls',
            direction: 'forward',
            weight: 0.9,
            lineNumber: call.lineNumber
          });
        } else {
          // External call - create a depends_on edge from the function
          edges.push({
            source: callerFuncId,
            target: call.callee,
            type: 'depends_on',
            direction: 'forward',
            weight: 0.5,
            lineNumber: call.lineNumber
          });
        }
      }
    }
  }
}

// Import edges from batchImportData
for (const [sourcePath, imports] of Object.entries(importData)) {
  for (const targetPath of imports) {
    // Skip self-referencing imports
    if (sourcePath === targetPath) continue;
    edges.push({
      source: 'file:' + sourcePath,
      target: 'file:' + targetPath,
      type: 'imports',
      direction: 'forward',
      weight: 0.7
    });
  }
}

const output = {
  batchIndex: 1,
  partIndex: 1,
  partCount: 1,
  nodes: nodes,
  edges: edges
};

const outPath = '/opt/projects/liferay/portal/arena-7.4.3.129-ga129/portal/.understand-anything/intermediate/batch-1.json';
fs.writeFileSync(outPath, JSON.stringify(output, null, 2));

console.log('Done. Nodes:', nodes.length, 'Edges:', edges.length);
