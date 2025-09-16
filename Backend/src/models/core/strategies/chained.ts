// Backend/src/models/core/strategies/chained.ts
import {
  Disk,
  DirectoryTable,
  FileEntry,
  ChainedFileEntry,
  AllocationStrategy,
  BlockId,
  Block,
  ReadRequest,
  ReadResult
} from '../types';

function findFreeBlocks(disk: Disk, size: number): BlockId[] {
  const free: BlockId[] = [];
  for (let i = 0; i < disk.totalBlocks && free.length < size; i++) {
    if (!disk.blocks[i].used) free.push(i);
  }
  return free.length === size ? free : [];
}

export const chainedStrategy: AllocationStrategy = {
  create(disk, dir, name, size) {
    if (dir.files[name]) throw new Error('Arquivo já existe');
    const blocks = findFreeBlocks(disk, size);
    if (blocks.length !== size) throw new Error('Espaço insuficiente');
    // Encadeia os blocos
    for (let i = 0; i < blocks.length; i++) {
      const id = blocks[i];
      disk.blocks[id].used = true;
      disk.blocks[id].file = name;
      disk.blocks[id].next = i < blocks.length - 1 ? blocks[i + 1] : null;
    }
    const entry: ChainedFileEntry = {
      name,
      sizeBlocks: size,
      method: 'encadeada',
      head: blocks[0],
      tail: blocks[blocks.length - 1],
      chain: blocks
    };
    dir.files[name] = entry;
    return entry;
  },
  extend(disk, dir, name, delta) {
    const entry = dir.files[name];
    if (!entry || entry.method !== 'encadeada') throw new Error('Arquivo não encontrado ou método incorreto');
    const chainedEntry = entry as ChainedFileEntry;
    const newBlocks = findFreeBlocks(disk, delta);
    if (newBlocks.length !== delta) throw new Error('Espaço insuficiente para extensão');
    // Encadeia ao tail
    let prev = chainedEntry.tail;
    for (let i = 0; i < newBlocks.length; i++) {
      const id = newBlocks[i];
      disk.blocks[id].used = true;
      disk.blocks[id].file = name;
      disk.blocks[id].next = null;
      disk.blocks[prev].next = id;
      prev = id;
    }
    chainedEntry.tail = prev;
    chainedEntry.sizeBlocks += delta;
    chainedEntry.chain = [...(chainedEntry.chain || []), ...newBlocks];
    return chainedEntry;
  },
  remove(disk, dir, name) {
    const entry = dir.files[name];
    if (!entry || entry.method !== 'encadeada') throw new Error('Arquivo não encontrado ou método incorreto');
    const chainedEntry = entry as ChainedFileEntry;
    (chainedEntry.chain || []).forEach(id => {
      disk.blocks[id].used = false;
      disk.blocks[id].file = undefined;
      disk.blocks[id].next = undefined;
    });
    delete dir.files[name];
  },
  read(disk, dir, req) {
    const entry = dir.files[req.name];
    if (!entry || entry.method !== 'encadeada') throw new Error('Arquivo não encontrado ou método incorreto');
    const chainedEntry = entry as ChainedFileEntry;
    const steps = [];
    if (req.mode === 'sequencial') {
      let id = chainedEntry.head;
      for (let i = 0; i < chainedEntry.sizeBlocks; i++) {
        steps.push({ block: id, incrementalCost: 1 });
        id = disk.blocks[id].next ?? id;
      }
      return { totalCost: chainedEntry.sizeBlocks, steps };
    } else {
      const k = Math.min(req.randomReads || 1, chainedEntry.sizeBlocks);
      for (let j = 0; j < k; j++) {
        const idx = Math.floor(Math.random() * chainedEntry.sizeBlocks);
        const block = (chainedEntry.chain || [])[idx];
        steps.push({ block, incrementalCost: 1 });
      }
      return { totalCost: k, steps };
    }
  },
  metrics(disk, dir) {
    // Comprimento médio de cadeia
    const chains = Object.values(dir.files).filter(f => f.method === 'encadeada') as ChainedFileEntry[];
    const avgChain = chains.length ? chains.reduce((acc, f) => acc + f.sizeBlocks, 0) / chains.length : 0;
    // Overhead de ponteiro: 1 ponteiro por bloco
    const overhead = chains.reduce((acc, f) => acc + f.sizeBlocks, 0);
    // Ocupação
    const ocupados = disk.blocks.filter(b => b.used).length;
    return {
      avgChain,
      overhead,
      ocupacao: ocupados / disk.totalBlocks
    };
  }
};
