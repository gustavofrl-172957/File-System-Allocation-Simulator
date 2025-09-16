// Backend/src/models/core/types.ts

export type BlockId = number;

export interface Block {
  id: BlockId;
  used: boolean;
  file?: string;
  isIndex?: boolean;
  next?: BlockId | null; // encadeada
}

export interface Disk {
  totalBlocks: number;
  blockSizeBytes: number;
  blocks: Block[];
}

export type AllocationMethod = 'contigua' | 'encadeada' | 'indexada';

export interface FileEntryBase {
  name: string;
  sizeBlocks: number;
  method: AllocationMethod;
}
export interface ContiguousFileEntry extends FileEntryBase {
  start: BlockId;
}
export interface ChainedFileEntry extends FileEntryBase {
  head: BlockId;
  tail: BlockId;
  chain?: BlockId[];
}
export interface IndexedFileEntry extends FileEntryBase {
  inodeId: BlockId;
  dataBlocks?: BlockId[];
}
export type FileEntry = ContiguousFileEntry | ChainedFileEntry | IndexedFileEntry;

export interface DirectoryTable {
  files: Record<string, FileEntry>;
}

export interface ReadRequest {
  name: string;
  mode: 'sequencial' | 'aleatorio';
  randomReads?: number;
}
export interface ReadResult {
  totalCost: number;
  steps: Array<{ block: BlockId; incrementalCost: number }>;
}

export interface Costs {
  Cseek: number;
  Cread: number;
  Cptr: number;
  CoverheadPtr: number;
}

export interface AllocationStrategy {
  create(disk: Disk, dir: DirectoryTable, name: string, size: number): FileEntry;
  extend(disk: Disk, dir: DirectoryTable, name: string, delta: number): FileEntry;
  remove(disk: Disk, dir: DirectoryTable, name: string): void;
  read(disk: Disk, dir: DirectoryTable, req: ReadRequest): ReadResult;
  metrics(disk: Disk, dir: DirectoryTable): Record<string, number>;
}

export interface SimulatorState {
  disk: Disk;
  dir: DirectoryTable;
  method: AllocationMethod;
  costs: Costs;
}
