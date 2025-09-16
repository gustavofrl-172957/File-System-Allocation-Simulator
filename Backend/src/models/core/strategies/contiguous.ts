// Backend/src/models/core/strategies/contiguous.ts
import {
  Disk,
  DirectoryTable,
  FileEntry,
  ContiguousFileEntry,
  AllocationStrategy,
  BlockId,
  Block,
  ReadRequest,
  ReadResult
} from '../types';

function findContiguousFreeBlocks(disk: Disk, size: number): BlockId | null {
  let count = 0;
  let start = -1;
  for (let i = 0; i < disk.totalBlocks; i++) {
    if (!disk.blocks[i].used) {
      if (count === 0) start = i;
      count++;
      if (count === size) return start;
    } else {
      count = 0;
      start = -1;
    }
  }
  return null;
}

export const contiguousStrategy: AllocationStrategy = {
  create(disk, dir, name, size) {
    if (dir.files[name]) throw new Error('Arquivo já existe');
    const start = findContiguousFreeBlocks(disk, size);
    if (start === null) throw new Error('Espaço contíguo insuficiente');
    for (let i = start; i < start + size; i++) {
      disk.blocks[i].used = true;
      disk.blocks[i].file = name;
    }
    const entry: ContiguousFileEntry = {
      name,
      sizeBlocks: size,
      method: 'contigua',
      start
    };
    dir.files[name] = entry;
    return entry;
  },
  extend(disk, dir, name, delta) {
    const entry = dir.files[name];
    if (!entry || entry.method !== 'contigua') throw new Error('Arquivo não encontrado ou método incorreto');
    const contiguousEntry = entry as ContiguousFileEntry;
    // Tenta anexar contiguamente
    let canExtend = true;
    for (let i = contiguousEntry.start + contiguousEntry.sizeBlocks; i < contiguousEntry.start + contiguousEntry.sizeBlocks + delta; i++) {
      if (i >= disk.totalBlocks || disk.blocks[i].used) {
        canExtend = false;
        break;
      }
    }
    if (canExtend) {
      for (let i = contiguousEntry.start + contiguousEntry.sizeBlocks; i < contiguousEntry.start + contiguousEntry.sizeBlocks + delta; i++) {
        disk.blocks[i].used = true;
        disk.blocks[i].file = name;
      }
      contiguousEntry.sizeBlocks += delta;
      return contiguousEntry;
    } else {
      // Realocação: busca novo segmento
      const newStart = findContiguousFreeBlocks(disk, contiguousEntry.sizeBlocks + delta);
      if (newStart === null) throw new Error('Não há espaço contíguo para realocação');
      // Libera blocos antigos
      for (let i = contiguousEntry.start; i < contiguousEntry.start + contiguousEntry.sizeBlocks; i++) {
        disk.blocks[i].used = false;
        disk.blocks[i].file = undefined;
      }
      // Aloca novos blocos
      for (let i = newStart; i < newStart + contiguousEntry.sizeBlocks + delta; i++) {
        disk.blocks[i].used = true;
        disk.blocks[i].file = name;
      }
      contiguousEntry.start = newStart;
      contiguousEntry.sizeBlocks += delta;
      return contiguousEntry;
    }
  },
  remove(disk, dir, name) {
    const entry = dir.files[name];
    if (!entry || entry.method !== 'contigua') throw new Error('Arquivo não encontrado ou método incorreto');
    const contiguousEntry = entry as ContiguousFileEntry;
    for (let i = contiguousEntry.start; i < contiguousEntry.start + contiguousEntry.sizeBlocks; i++) {
      disk.blocks[i].used = false;
      disk.blocks[i].file = undefined;
    }
    delete dir.files[name];
  },
  read(disk, dir, req) {
    const entry = dir.files[req.name];
    if (!entry || entry.method !== 'contigua') throw new Error('Arquivo não encontrado ou método incorreto');
    const contiguousEntry = entry as ContiguousFileEntry;
    const steps = [];
    if (req.mode === 'sequencial') {
      for (let i = contiguousEntry.start; i < contiguousEntry.start + contiguousEntry.sizeBlocks; i++) {
        steps.push({ block: i, incrementalCost: 1 });
      }
      return { totalCost: contiguousEntry.sizeBlocks, steps };
    } else {
      const k = Math.min(req.randomReads || 1, contiguousEntry.sizeBlocks);
      for (let j = 0; j < k; j++) {
        const block = contiguousEntry.start + Math.floor(Math.random() * contiguousEntry.sizeBlocks);
        steps.push({ block, incrementalCost: 1 });
      }
      return { totalCost: k, steps };
    }
  },
  metrics(disk, dir) {
    // Fragmentação externa: buracos e maior segmento livre
    let buracos = 0;
    let maiorSegmento = 0;
    let atual = 0;
    for (let i = 0; i < disk.totalBlocks; i++) {
      if (!disk.blocks[i].used) {
        atual++;
        if (i === disk.totalBlocks - 1 && atual > 0) {
          buracos++;
          if (atual > maiorSegmento) maiorSegmento = atual;
        }
      } else {
        if (atual > 0) {
          buracos++;
          if (atual > maiorSegmento) maiorSegmento = atual;
          atual = 0;
        }
      }
    }
    // Fragmentação interna: último bloco parcialmente usado (simples)
    let interna = 0;
    Object.values(dir.files).forEach(f => {
      if (f.method === 'contigua') {
        interna += disk.blockSizeBytes; // simplificado
      }
    });
    // Ocupação
    const ocupados = disk.blocks.filter(b => b.used).length;
    return {
      buracos,
      maiorSegmento,
      interna,
      ocupacao: ocupados / disk.totalBlocks
    };
  }
};
