import loomData from './loom_bom.json';
import patentData from './patent.json';

// Normalize both datasets into a common shape so UI components stay generic:
// { id, title, assignee, assemblyGroups: [{name, componentIds, description}],
//   components: { [id]: {id, name, material, description, quantity?, dimensions?} } }

function normalizeLoom() {
  return {
    id: loomData.patent_id,
    title: loomData.title,
    assignee: loomData.assignee,
    assemblyGroups: loomData.assembly_groups.map((g) => ({
      name: g.name,
      componentIds: g.components,
      description: '',
    })),
    components: Object.fromEntries(
      loomData.components.map((c) => [
        c.id,
        { id: c.id, name: c.name, material: c.material, description: c.description, quantity: c.quantity, dimensions: c.dimensions },
      ])
    ),
  };
}

function normalizeClutch() {
  // Patent.json materials are assembly-level — build a lookup by ref from assembly context
  const refToMaterial = {};
  for (const [, asmData] of Object.entries(patentData.assemblies)) {
    for (const ref of asmData.components) {
      if (!refToMaterial[ref]) refToMaterial[ref] = null;
    }
  }

  return {
    id: patentData.patent_id,
    title: patentData.title,
    assignee: patentData.assignee,
    assemblyGroups: Object.entries(patentData.assemblies).map(([name, data]) => ({
      name,
      componentIds: data.components,
      description: data.description,
    })),
    components: Object.fromEntries(
      patentData.bom.map((b) => [
        b.ref,
        { id: b.ref, name: b.component, material: null, description: null },
      ])
    ),
  };
}

export const datasets = {
  loom: normalizeLoom(),
  clutch: normalizeClutch(),
};
