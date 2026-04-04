import { create } from 'zustand';
import { datasets } from './data/datasets';

function initialVisible(key) {
  return Object.fromEntries(datasets[key].assemblyGroups.map((g) => [g.name, true]));
}

export const useStore = create((set) => ({
  activePatent: 'loom',
  setPatent: (key) =>
    set(() => ({
      activePatent: key,
      visibleAssemblies: initialVisible(key),
      selectedRef: null,
      exploded: false,
      animating: false,
    })),

  selectedRef: null,
  setSelected: (ref) => set((s) => ({ selectedRef: s.selectedRef === ref ? null : ref })),

  visibleAssemblies: initialVisible('loom'),
  toggleAssembly: (name) =>
    set((s) => ({ visibleAssemblies: { ...s.visibleAssemblies, [name]: !s.visibleAssemblies[name] } })),
  isolateAssembly: (name) =>
    set((s) => ({
      visibleAssemblies: Object.fromEntries(
        Object.keys(s.visibleAssemblies).map((n) => [n, n === name])
      ),
    })),
  showAll: () =>
    set((s) => ({
      visibleAssemblies: Object.fromEntries(Object.keys(s.visibleAssemblies).map((n) => [n, true])),
    })),

  exploded: false,
  toggleExplode: () => set((s) => ({ exploded: !s.exploded })),

  animating: false,
  toggleAnimation: () => set((s) => ({ animating: !s.animating })),
}));
