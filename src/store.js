import { create } from 'zustand';
import patentData from './data/patent.json';

const assemblyNames = Object.keys(patentData.assemblies);

const initialVisible = assemblyNames.reduce((acc, name) => {
  acc[name] = true;
  return acc;
}, {});

export const useStore = create((set) => ({
  selectedRef: null,
  setSelected: (ref) => set((s) => ({ selectedRef: s.selectedRef === ref ? null : ref })),

  visibleAssemblies: { ...initialVisible },
  toggleAssembly: (name) =>
    set((s) => ({
      visibleAssemblies: { ...s.visibleAssemblies, [name]: !s.visibleAssemblies[name] },
    })),
  isolateAssembly: (name) =>
    set(() => ({
      visibleAssemblies: assemblyNames.reduce((acc, n) => {
        acc[n] = n === name;
        return acc;
      }, {}),
    })),
  showAll: () => set(() => ({ visibleAssemblies: { ...initialVisible } })),

  exploded: false,
  toggleExplode: () => set((s) => ({ exploded: !s.exploded })),

  animating: false,
  toggleAnimation: () => set((s) => ({ animating: !s.animating })),
}));
