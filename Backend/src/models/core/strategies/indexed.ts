// Backend/src/models/core/strategies/indexed.ts
import {
  Disk,
  DirectoryTable,
  FileEntry,
  IndexedFileEntry,
  AllocationStrategy,
  BlockId,
  Block,
  ReadRequest,
  ReadResult,
  Costs
} from '../types';

function findFreeBlocks(disk: Disk, size: number): BlockId[] {
  const free: BlockId[] = [];
  for (let i = 0; i < disk.totalBlocks && free.length < size; i++) {
    if (!disk.blocks[i].used) free.push(i);
  }
  return free.length === size ? free : [];
}

export const indexedStrategy: AllocationStrategy = {
  create(disk, dir, name, size) {
    if (dir.files[name]) throw new Error('Arquivo já existe');
    // Precisa de 1 bloco para índice + size para dados
    const blocks = findFreeBlocks(disk, size + 1);
    if (blocks.length !== size + 1) throw new Error('Espaço insuficiente');
    const inodeId = blocks[0];
    disk.blocks[inodeId].used = true;
    disk.blocks[inodeId].file = name;
    disk.blocks[inodeId].isIndex = true;
    // Blocos de dados
    const dataBlocks = blocks.slice(1);
    dataBlocks.forEach(id => {
      disk.blocks[id].used = true;
      disk.blocks[id].file = name;
      disk.blocks[id].isIndex = false;
    });
    const entry: IndexedFileEntry = {
      name,
      sizeBlocks: size,
      method: 'indexada',
      inodeId,
      dataBlocks
    };
    dir.files[name] = entry;
    return entry;
  },
  extend(disk, dir, name, delta) {
    const entry = dir.files[name];
    if (!entry || entry.method !== 'indexada') throw new Error('Arquivo não encontrado ou método incorreto');
    const indexedEntry = entry as IndexedFileEntry;
    const newBlocks = findFreeBlocks(disk, delta);
    if (newBlocks.length !== delta) throw new Error('Espaço insuficiente para extensão');
    newBlocks.forEach(id => {
      disk.blocks[id].used = true;
      disk.blocks[id].file = name;
      disk.blocks[id].isIndex = false;
    });
    indexedEntry.dataBlocks = [...(indexedEntry.dataBlocks || []), ...newBlocks];
    indexedEntry.sizeBlocks += delta;
    return indexedEntry;
  },
  remove(disk, dir, name) {
    const entry = dir.files[name];
    if (!entry || entry.method !== 'indexada') throw new Error('Arquivo não encontrado ou método incorreto');
    const indexedEntry = entry as IndexedFileEntry;
    disk.blocks[indexedEntry.inodeId].used = false;
    disk.blocks[indexedEntry.inodeId].file = undefined;
    disk.blocks[indexedEntry.inodeId].isIndex = undefined;
    (indexedEntry.dataBlocks || []).forEach(id => {
      disk.blocks[id].used = false;
      disk.blocks[id].file = undefined;
      disk.blocks[id].isIndex = undefined;
    });
    delete dir.files[name];
  },
  read(disk, dir, req, costs) {
    const entry = dir.files[req.name];
    if (!entry || entry.method !== 'indexada') throw new Error('Arquivo não encontrado ou método incorreto');
    const indexedEntry = entry as IndexedFileEntry;
    const steps = [];
    if (req.mode === 'sequencial') {
      // Custo: Cseek + Cread (ler índice) + (numBlocos * Cread)
      const totalCost = costs.Cseek + costs.Cread + ((indexedEntry.dataBlocks?.length || 0) * costs.Cread);
      // Primeiro lê o índice
      steps.push({ block: indexedEntry.inodeId, incrementalCost: costs.Cread });
      // Depois lê cada bloco de dados
      (indexedEntry.dataBlocks || []).forEach(id => {
        steps.push({ block: id, incrementalCost: costs.Cread });
      });
      return { totalCost, steps };
    } else {
      const k = Math.min(req.randomReads || 1, indexedEntry.dataBlocks?.length || 0);
      // Para acesso aleatório: Cseek + (k * Cread) - cada acesso consulta o índice
      const totalCost = costs.Cseek + (k * costs.Cread);
      for (let j = 0; j < k; j++) {
        const idx = Math.floor(Math.random() * (indexedEntry.dataBlocks?.length || 0));
        const block = (indexedEntry.dataBlocks || [])[idx];
        steps.push({ block, incrementalCost: costs.Cread });
      }
      return { totalCost, steps };
    }
  },
  metrics(disk, dir) {
    // Overhead: 1 índice por arquivo
    const files = Object.values(dir.files).filter(f => f.method === 'indexada') as IndexedFileEntry[];
    const overhead = files.length;
    // Fragmentação interna: último bloco parcialmente usado (simples)
    let interna = 0;
    files.forEach(f => {
      interna += disk.blockSizeBytes; // simplificado
    });
    // Ocupação
    const ocupados = disk.blocks.filter(b => b.used).length;
    return {
      overhead,
      interna,
      ocupacao: ocupados / disk.totalBlocks
    };
  }
};
