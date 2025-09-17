// Frontend/src/state/useSimStore.ts
import { create } from 'zustand';
import * as api from '../utils/api';


export interface SimState {
  disk: any;
  dir: any;
  method: string;
  costs: Record<string, number>;
  metrics: Record<string, number>;
  loading: boolean;
  error?: string;
  highlightedBlocks: number[];
  fetchState: () => Promise<void>;
  configureDisk: (totalBlocks: number, blockSizeBytes: number) => Promise<void>;
  setMethod: (method: string) => Promise<void>;
  setCosts: (costs: Record<string, number>) => Promise<void>;
  createFile: (name: string, sizeBlocks: number) => Promise<void>;
  extendFile: (name: string, deltaBlocks: number) => Promise<void>;
  deleteFile: (name: string) => Promise<void>;
  readFile: (name: string, mode: 'sequencial' | 'aleatorio', randomReads?: number) => Promise<any>;
  triggerScenario: (name: string) => Promise<void>;
  setHighlightedBlocks: (blocks: number[], timeout?: number) => void;
  resetSim: () => Promise<void>;
}


export const useSimStore = create<SimState>((set, get) => ({
  disk: null,
  dir: null,
  method: 'contigua',
  costs: { Cseek: 1, Cread: 1, Cptr: 1, CoverheadPtr: 1 },
  metrics: {},
  loading: false,
  error: undefined,
  highlightedBlocks: [],

  async fetchState() {
    set({ loading: true, error: undefined });
    const res = await api.getState();
    if (res.ok) {
      set({ ...res.data, loading: false });
    } else {
      set({ error: res.error, loading: false });
    }
  },

  async configureDisk(totalBlocks, blockSizeBytes) {
    set({ loading: true, error: undefined });
    const res = await api.configureDisk(totalBlocks, blockSizeBytes);
    if (res.ok) {
      set({ ...res.data, loading: false });
    } else {
      set({ error: res.error, loading: false });
    }
  },

  async setMethod(method) {
    set({ loading: true, error: undefined });
    const res = await api.setMethod(method);
    if (res.ok) {
      set({ ...res.data, loading: false });
    } else {
      set({ error: res.error, loading: false });
    }
  },

  async setCosts(costs) {
    set({ loading: true, error: undefined });
    const res = await api.setCosts(costs);
    if (res.ok) {
      await get().fetchState();
    } else {
      set({ error: res.error, loading: false });
    }
  },

  async createFile(name, sizeBlocks) {
    set({ loading: true, error: undefined });
    const res = await api.createFile(name, sizeBlocks);
    if (res.ok) {
      await get().fetchState();
    } else {
      set({ error: res.error, loading: false });
    }
  },

  async extendFile(name, deltaBlocks) {
    set({ loading: true, error: undefined });
    const res = await api.extendFile(name, deltaBlocks);
    if (res.ok) {
      await get().fetchState();
    } else {
      set({ error: res.error, loading: false });
    }
  },

  async deleteFile(name) {
    set({ loading: true, error: undefined });
    const res = await api.deleteFile(name);
    if (res.ok) {
      await get().fetchState();
    } else {
      set({ error: res.error, loading: false });
    }
  },

  async resetSim() {
    set({ loading: true, error: undefined });
    // Chama o reset do backend e atualiza o estado local
    const res = await api.resetSim();
    if (res.ok) {
      set({
        disk: res.data.disk,
        dir: res.data.dir,
        method: res.data.method,
        costs: res.data.costs,
        metrics: res.data.metrics,
        highlightedBlocks: [],
        loading: false,
        error: undefined
      });
    } else {
      set({ loading: false, error: res.error || 'Erro ao resetar simulador' });
    }
  },
  async readFile(name, mode, randomReads) {
    set({ loading: true, error: undefined });
    const res = await api.readFile(name, mode, randomReads);
    set({ loading: false });
    if (res.ok) {
      // Destacar blocos lidos por 1.2s
      if (res.data && res.data.blocks) {
        get().setHighlightedBlocks(res.data.blocks, 1200);
      }
      return res.data;
    } else {
      set({ error: res.error });
      return null;
    }
  },

  async triggerScenario(name) {
    set({ loading: true, error: undefined });
    const res = await api.triggerScenario(name);
    if (res.ok) {
      set({ ...res.data, loading: false });
    } else {
      set({ error: res.error, loading: false });
    }
  },


  setHighlightedBlocks(blocks, timeout = 1200) {
    set({ highlightedBlocks: blocks });
    setTimeout(() => set({ highlightedBlocks: [] }), timeout);
  }
}));
