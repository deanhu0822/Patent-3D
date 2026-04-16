import * as THREE from 'three';
import { STLExporter } from 'three/addons/exporters/STLExporter.js';

const textEncoder = new TextEncoder();
const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>';
const WELD_PRECISION = 100000;
const MIN_TRIANGLE_AREA_SQ = 1e-10;
const MIN_SHELL_VOLUME = 1e-9;
const HIGH_TRIANGLE_THRESHOLD = 500000;

function sanitizeFileName(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'model';
}

function formatNumber(value) {
  return Number(value.toFixed(5)).toString();
}

function escapeXml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function triggerDownload(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

function clonePrintableRoot(root) {
  root.updateWorldMatrix(true, true);
  const clone = root.clone(true);
  clone.updateWorldMatrix(true, true);
  return clone;
}

function getPartRefForObject(object) {
  let current = object;

  while (current) {
    const partRef = current.userData?.partRef;
    if (partRef) return partRef;
    current = current.parent;
  }

  return null;
}

function filterCloneToPart(root, selectedRef) {
  if (!selectedRef) return root;

  const toRemove = [];
  root.traverse((object) => {
    if (!object.isMesh) return;
    if (getPartRefForObject(object) !== selectedRef) {
      toRemove.push(object);
    }
  });

  for (const object of toRemove) {
    object.parent?.remove(object);
  }

  root.updateWorldMatrix(true, true);
  return root;
}

function countDegenerateTriangles(vertices, triangles) {
  const ab = new THREE.Vector3();
  const ac = new THREE.Vector3();
  let count = 0;

  for (const [a, b, c] of triangles) {
    const [ax, ay, az] = vertices[a];
    const [bx, by, bz] = vertices[b];
    const [cx, cy, cz] = vertices[c];

    ab.set(bx - ax, by - ay, bz - az);
    ac.set(cx - ax, cy - ay, cz - az);

    if (a === b || b === c || a === c || ab.cross(ac).lengthSq() <= MIN_TRIANGLE_AREA_SQ) {
      count += 1;
    }
  }

  return count;
}

function getPrintableMeshData(root) {
  const vertex = new THREE.Vector3();
  const edgeKey = (a, b) => (a < b ? `${a}:${b}` : `${b}:${a}`);
  const faceKey = (a, b, c) => [a, b, c].sort((left, right) => left - right).join(':');
  const getVertexKey = (x, y, z) => [x, y, z].map((value) => Math.round(value * WELD_PRECISION)).join(':');
  const ab = new THREE.Vector3();
  const ac = new THREE.Vector3();

  const vertices = [];
  const triangles = [];
  const edgeCounts = new Map();
  const adjacency = new Map();
  const stats = {
    meshCount: 0,
    sourceTriangles: 0,
    sourceVertices: 0,
    invalidVertexCount: 0,
    weldedVertices: 0,
    keptTriangles: 0,
    removedDegenerateTriangles: 0,
    removedDuplicateFaces: 0,
  };

  function getVertexIndex(x, y, z, localVertexMap) {
    const key = getVertexKey(x, y, z);
    const existing = localVertexMap.get(key);

    if (existing !== undefined) {
      return existing;
    }

    const index = vertices.length;
    localVertexMap.set(key, index);
    vertices.push([x, y, z]);
    adjacency.set(index, new Set());
    return index;
  }

  function addTriangle(a, b, c, localFaceMap) {
    const [ax, ay, az] = vertices[a];
    const [bx, by, bz] = vertices[b];
    const [cx, cy, cz] = vertices[c];

    ab.set(bx - ax, by - ay, bz - az);
    ac.set(cx - ax, cy - ay, cz - az);

    if (a === b || b === c || a === c || ab.cross(ac).lengthSq() <= MIN_TRIANGLE_AREA_SQ) {
      stats.removedDegenerateTriangles += 1;
      return;
    }

    const key = faceKey(a, b, c);
    if (localFaceMap.has(key)) {
      stats.removedDuplicateFaces += 1;
      return;
    }

    localFaceMap.add(key);
    triangles.push([a, b, c]);

    for (const pair of [[a, b], [b, c], [c, a]]) {
      const [start, end] = pair;
      adjacency.get(start).add(end);
      adjacency.get(end).add(start);
      const currentKey = edgeKey(start, end);
      edgeCounts.set(currentKey, (edgeCounts.get(currentKey) ?? 0) + 1);
    }
  }

  root.traverse((object) => {
    if (!object.isMesh || !object.visible || !object.geometry?.isBufferGeometry) return;

    stats.meshCount += 1;

    const sourceGeometry = object.geometry;
    const geometry = sourceGeometry.index ? sourceGeometry.toNonIndexed() : sourceGeometry;
    const positions = geometry.getAttribute('position');

    if (!positions) {
      if (geometry !== sourceGeometry) geometry.dispose();
      return;
    }

    stats.sourceVertices += positions.count;
    stats.sourceTriangles += positions.count / 3;
    const localVertexIndices = [];
    const localVertexMap = new Map();
    const localFaceMap = new Set();

    for (let i = 0; i < positions.count; i++) {
      vertex.fromBufferAttribute(positions, i).applyMatrix4(object.matrixWorld);

      if (!Number.isFinite(vertex.x) || !Number.isFinite(vertex.y) || !Number.isFinite(vertex.z)) {
        stats.invalidVertexCount += 1;
        localVertexIndices.push(null);
        continue;
      }

      localVertexIndices.push(getVertexIndex(vertex.x, vertex.y, vertex.z, localVertexMap));
    }

    for (let i = 0; i < localVertexIndices.length; i += 3) {
      const a = localVertexIndices[i];
      const b = localVertexIndices[i + 1];
      const c = localVertexIndices[i + 2];

      if (a === null || b === null || c === null) {
        stats.removedDegenerateTriangles += 1;
        continue;
      }

      addTriangle(a, b, c, localFaceMap);
    }

    if (geometry !== sourceGeometry) geometry.dispose();
  });

  stats.weldedVertices = vertices.length;
  stats.keptTriangles = triangles.length;

  const shellSummaries = getShellSummaries(adjacency, triangles, vertices);
  const shellCount = shellSummaries.length;
  const emptyShellCount = shellSummaries.filter((shell) => shell.boundingBoxVolume <= MIN_SHELL_VOLUME).length;
  const openEdgeCount = [...edgeCounts.values()].filter((count) => count === 1).length;
  const nonManifoldEdgeCount = [...edgeCounts.values()].filter((count) => count > 2).length;
  const degenerateTriangleCount = countDegenerateTriangles(vertices, triangles);

  const repairs = [];
  const warnings = [];

  if (stats.removedDegenerateTriangles > 0) {
    repairs.push(`Removed ${stats.removedDegenerateTriangles} degenerate triangles.`);
  }

  if (stats.removedDuplicateFaces > 0) {
    repairs.push(`Removed ${stats.removedDuplicateFaces} duplicate faces.`);
  }

  if (openEdgeCount > 0) {
    warnings.push(`Mesh has ${openEdgeCount} open edges and may not be watertight.`);
  }

  if (nonManifoldEdgeCount > 0) {
    warnings.push(`Mesh has ${nonManifoldEdgeCount} non-manifold edges that may confuse slicers.`);
  }

  if (shellCount > 1) {
    warnings.push('Export contains multiple disconnected bodies.');
  }

  if (triangles.length > HIGH_TRIANGLE_THRESHOLD) {
    warnings.push('Mesh is very dense and may load slowly in slicers.');
  }

  return {
    vertices,
    triangles,
    repairs,
    warnings,
    stats: {
      ...stats,
      triangleCount: triangles.length,
      degenerateTriangleCount,
      openEdgeCount,
      nonManifoldEdgeCount,
      shellCount,
      emptyShellCount,
    },
  };
}

function getShellSummaries(adjacency, triangles, vertices) {
  const usedVertices = new Set();
  for (const [a, b, c] of triangles) {
    usedVertices.add(a);
    usedVertices.add(b);
    usedVertices.add(c);
  }

  const visited = new Set();
  const shells = [];

  for (const start of usedVertices) {
    if (visited.has(start)) continue;

    const stack = [start];
    visited.add(start);
    const shellVertices = [];

    while (stack.length > 0) {
      const current = stack.pop();
      shellVertices.push(current);

      for (const next of adjacency.get(current) ?? []) {
        if (visited.has(next)) continue;
        visited.add(next);
        stack.push(next);
      }
    }

    const shellVertexSet = new Set(shellVertices);
    let triangleCount = 0;
    let minX = Infinity;
    let minY = Infinity;
    let minZ = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    let maxZ = -Infinity;

    for (const index of shellVertices) {
      const [x, y, z] = vertices[index];
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      minZ = Math.min(minZ, z);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
      maxZ = Math.max(maxZ, z);
    }

    for (const [a, b, c] of triangles) {
      if (shellVertexSet.has(a) && shellVertexSet.has(b) && shellVertexSet.has(c)) {
        triangleCount += 1;
      }
    }

    shells.push({
      triangleCount,
      boundingBoxVolume: (maxX - minX) * (maxY - minY) * (maxZ - minZ),
    });
  }

  return shells;
}

function getStrictBlockingReasons(printableMesh) {
  const { stats } = printableMesh;
  const reasons = [];

  if (stats.triangleCount === 0) {
    reasons.push('No printable mesh remained after cleanup.');
  }

  if (stats.openEdgeCount > 0) {
    reasons.push('Mesh has open edges and is not watertight.');
  }

  if (stats.nonManifoldEdgeCount > 0) {
    reasons.push('Mesh has non-manifold edges.');
  }

  if (stats.invalidVertexCount > 0) {
    reasons.push('Mesh contains invalid vertex data.');
  }

  if (stats.degenerateTriangleCount > 0) {
    reasons.push('Mesh still contains degenerate triangles after cleanup.');
  }

  if (stats.emptyShellCount > 0) {
    reasons.push('Mesh contains empty or invalid shells.');
  }

  return reasons;
}

function getBlockingReasons(printableMesh, { strict }) {
  const reasons = [];

  if (printableMesh.stats.triangleCount === 0) {
    reasons.push('No printable mesh remained after cleanup.');
  }

  if (strict) {
    for (const reason of getStrictBlockingReasons(printableMesh)) {
      if (!reasons.includes(reason)) {
        reasons.push(reason);
      }
    }
  }

  return reasons;
}

function buildExportReport(printableMesh, { strict, format }) {
  const blockingReasons = strict ? getStrictBlockingReasons(printableMesh) : [];
  const blockedReasons = getBlockingReasons(printableMesh, { strict });
  const strictBlocked = blockingReasons.length > 0;
  const blocked = blockedReasons.length > 0;
  const status = blocked ? 'blocked' : printableMesh.warnings.length > 0 ? 'warning' : 'printable';

  return {
    format,
    status,
    blocked,
    blockingTitle: blocked
      ? strictBlocked
        ? 'Export blocked by strict print checks.'
        : 'Export could not be created.'
      : null,
    blockingReasons: blockedReasons,
    strict: {
      enabled: strict,
      blocked: strictBlocked,
      passed: strict && !strictBlocked,
      blockingTitle: strictBlocked ? 'Export blocked by strict print checks.' : null,
      blockingReasons,
      helpText: strict ? 'Blocks STL/3MF export when the mesh is not a valid printable solid.' : null,
      successMessage: strict && !strictBlocked ? 'Strict export passed. Mesh meets print-quality checks.' : null,
    },
    repairs: printableMesh.repairs,
    warnings: printableMesh.warnings,
    stats: printableMesh.stats,
    exported: false,
  };
}

function buildPrintableGeometry(vertices, triangles) {
  const flatVertices = new Float32Array(vertices.length * 3);

  for (let i = 0; i < vertices.length; i++) {
    const [x, y, z] = vertices[i];
    flatVertices[i * 3] = x;
    flatVertices[i * 3 + 1] = y;
    flatVertices[i * 3 + 2] = z;
  }

  const flatIndices = new Uint32Array(triangles.length * 3);
  for (let i = 0; i < triangles.length; i++) {
    const [a, b, c] = triangles[i];
    flatIndices[i * 3] = a;
    flatIndices[i * 3 + 1] = b;
    flatIndices[i * 3 + 2] = c;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(flatVertices, 3));
  geometry.setIndex(new THREE.BufferAttribute(flatIndices, 1));
  geometry.computeVertexNormals();

  return geometry;
}

function build3mfModel(name, printableMesh) {
  const { vertices, triangles } = printableMesh;
  const vertexXml = vertices
    .map(([x, y, z]) => `        <vertex x="${formatNumber(x)}" y="${formatNumber(y)}" z="${formatNumber(z)}" />`)
    .join('\n');
  const triangleXml = triangles
    .map(([v1, v2, v3]) => `        <triangle v1="${v1}" v2="${v2}" v3="${v3}" />`)
    .join('\n');

  return `${xmlHeader}
<model unit="millimeter" xml:lang="en-US" xmlns="http://schemas.microsoft.com/3dmanufacturing/core/2015/02">
  <metadata name="Title">${escapeXml(name)}</metadata>
  <metadata name="Application">ShapeFlow</metadata>
  <resources>
    <object id="1" type="model">
      <mesh>
        <vertices>
${vertexXml}
        </vertices>
        <triangles>
${triangleXml}
        </triangles>
      </mesh>
    </object>
  </resources>
  <build>
    <item objectid="1" />
  </build>
</model>`;
}

function getCrcTable() {
  const table = new Uint32Array(256);

  for (let i = 0; i < 256; i++) {
    let crc = i;
    for (let j = 0; j < 8; j++) {
      crc = (crc & 1) ? (0xedb88320 ^ (crc >>> 1)) : (crc >>> 1);
    }
    table[i] = crc >>> 0;
  }

  return table;
}

const crcTable = getCrcTable();

function crc32(bytes) {
  let crc = 0xffffffff;

  for (let i = 0; i < bytes.length; i++) {
    crc = crcTable[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
  }

  return (crc ^ 0xffffffff) >>> 0;
}

function concatBytes(chunks) {
  const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const output = new Uint8Array(totalLength);
  let offset = 0;

  for (const chunk of chunks) {
    output.set(chunk, offset);
    offset += chunk.length;
  }

  return output;
}

function writeUint16(target, offset, value) {
  target[offset] = value & 0xff;
  target[offset + 1] = (value >>> 8) & 0xff;
}

function writeUint32(target, offset, value) {
  target[offset] = value & 0xff;
  target[offset + 1] = (value >>> 8) & 0xff;
  target[offset + 2] = (value >>> 16) & 0xff;
  target[offset + 3] = (value >>> 24) & 0xff;
}

function buildStoredZip(files) {
  const localChunks = [];
  const centralChunks = [];
  let localOffset = 0;

  for (const file of files) {
    const nameBytes = textEncoder.encode(file.name);
    const dataBytes = typeof file.data === 'string' ? textEncoder.encode(file.data) : file.data;
    const checksum = crc32(dataBytes);

    const localHeader = new Uint8Array(30 + nameBytes.length);
    writeUint32(localHeader, 0, 0x04034b50);
    writeUint16(localHeader, 4, 20);
    writeUint16(localHeader, 6, 0);
    writeUint16(localHeader, 8, 0);
    writeUint16(localHeader, 10, 0);
    writeUint16(localHeader, 12, 0);
    writeUint32(localHeader, 14, checksum);
    writeUint32(localHeader, 18, dataBytes.length);
    writeUint32(localHeader, 22, dataBytes.length);
    writeUint16(localHeader, 26, nameBytes.length);
    writeUint16(localHeader, 28, 0);
    localHeader.set(nameBytes, 30);

    localChunks.push(localHeader, dataBytes);

    const centralHeader = new Uint8Array(46 + nameBytes.length);
    writeUint32(centralHeader, 0, 0x02014b50);
    writeUint16(centralHeader, 4, 20);
    writeUint16(centralHeader, 6, 20);
    writeUint16(centralHeader, 8, 0);
    writeUint16(centralHeader, 10, 0);
    writeUint16(centralHeader, 12, 0);
    writeUint16(centralHeader, 14, 0);
    writeUint32(centralHeader, 16, checksum);
    writeUint32(centralHeader, 20, dataBytes.length);
    writeUint32(centralHeader, 24, dataBytes.length);
    writeUint16(centralHeader, 28, nameBytes.length);
    writeUint16(centralHeader, 30, 0);
    writeUint16(centralHeader, 32, 0);
    writeUint16(centralHeader, 34, 0);
    writeUint16(centralHeader, 36, 0);
    writeUint32(centralHeader, 38, 0);
    writeUint32(centralHeader, 42, localOffset);
    centralHeader.set(nameBytes, 46);

    centralChunks.push(centralHeader);
    localOffset += localHeader.length + dataBytes.length;
  }

  const centralDirectory = concatBytes(centralChunks);
  const endRecord = new Uint8Array(22);
  writeUint32(endRecord, 0, 0x06054b50);
  writeUint16(endRecord, 4, 0);
  writeUint16(endRecord, 6, 0);
  writeUint16(endRecord, 8, files.length);
  writeUint16(endRecord, 10, files.length);
  writeUint32(endRecord, 12, centralDirectory.length);
  writeUint32(endRecord, 16, localOffset);
  writeUint16(endRecord, 20, 0);

  return concatBytes([...localChunks, centralDirectory, endRecord]);
}

function exportStl(root, { selectedRef } = {}) {
  const printableRoot = filterCloneToPart(clonePrintableRoot(root), selectedRef);
  return getPrintableMeshData(printableRoot);
}

function downloadStl(printableMesh, name) {
  const geometry = buildPrintableGeometry(printableMesh.vertices, printableMesh.triangles);
  const mesh = new THREE.Mesh(geometry);
  const scene = new THREE.Scene();
  scene.add(mesh);
  const exporter = new STLExporter();
  const data = exporter.parse(scene, { binary: true });
  const bytes = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
  const blob = new Blob([bytes], { type: 'model/stl' });

  geometry.dispose();

  triggerDownload(blob, `${sanitizeFileName(name)}.stl`);
}

function export3mf(root, { selectedRef } = {}) {
  const printableRoot = filterCloneToPart(clonePrintableRoot(root), selectedRef);
  return getPrintableMeshData(printableRoot);
}

function download3mf(printableMesh, name) {
  const modelXml = build3mfModel(name, printableMesh);
  const archive = buildStoredZip([
    {
      name: '[Content_Types].xml',
      data: `${xmlHeader}
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml" />
  <Default Extension="model" ContentType="application/vnd.ms-package.3dmanufacturing-3dmodel+xml" />
</Types>`,
    },
    {
      name: '_rels/.rels',
      data: `${xmlHeader}
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Target="3D/3dmodel.model" Id="rel0" Type="http://schemas.microsoft.com/3dmanufacturing/2013/01/3dmodel" />
</Relationships>`,
    },
    {
      name: '3D/3dmodel.model',
      data: modelXml,
    },
  ]);

  const blob = new Blob([archive], { type: 'application/vnd.ms-package.3dmanufacturing-3dmodelpackage' });
  triggerDownload(blob, `${sanitizeFileName(name)}.3mf`);
}

function getPrintableMeshReport(root, { strict = false, format = '3mf', selectedRef = null } = {}) {
  if (!root) {
    throw new Error('The printable model is not ready yet.');
  }

  if (format !== 'stl' && format !== '3mf') {
    throw new Error(`Unsupported export format: ${format}`);
  }

  const printableMesh = format === 'stl'
    ? exportStl(root, { selectedRef })
    : export3mf(root, { selectedRef });

  return buildExportReport(printableMesh, { strict, format });
}

export function analyzePrintableModel(root, options) {
  return getPrintableMeshReport(root, options);
}

export function exportPrintableModel(root, { format, name, strict = false, selectedRef = null }) {
  if (!root) {
    throw new Error('The printable model is not ready yet.');
  }

  if (format !== 'stl' && format !== '3mf') {
    throw new Error(`Unsupported export format: ${format}`);
  }

  const printableMesh = format === 'stl'
    ? exportStl(root, { selectedRef })
    : export3mf(root, { selectedRef });
  const report = buildExportReport(printableMesh, { strict, format });

  if (report.blocked) {
    return report;
  }

  if (format === 'stl') {
    downloadStl(printableMesh, name);
  } else {
    download3mf(printableMesh, name);
  }

  return { ...report, exported: true };
}
