// Backend/src/models/core/simulator.ts
import { Disk, DirectoryTable, AllocationMethod, Costs, SimulatorState, FileEntry, ReadRequest, ReadResult, AllocationStrategy } from './types';
import { contiguousStrategy } from './strategies/contiguous';
import { chainedStrategy } from './strategies/chained';
import { indexedStrategy } from './strategies/indexed';

const defaultCosts: Costs = {
  Cseek: 1,
  Cread: 1,
  Cptr: 1,
  CoverheadPtr: 1
};

const strategies: Record<AllocationMethod, AllocationStrategy> = {
  contigua: contiguousStrategy,
  encadeada: chainedStrategy,
  indexada: indexedStrategy
};

export class Simulator {
  applyScenario(name: string): void {
    // Reset disk and directory for each scenario
    if (name === 'fragmentacao-contigua') {
      this.configureDisk(32, 1024);
      this.setMethod('contigua');
      // Cria arquivos para fragmentação externa
      this.createFile('A', 8);
      this.createFile('B', 6);
      this.createFile('C', 4);
      this.deleteFile('B');
      this.createFile('D', 5); // Deve fragmentar
    } else if (name === 'cadeias-longas') {
      this.configureDisk(32, 1024);
      this.setMethod('encadeada');
      this.createFile('X', 12);
      this.createFile('Y', 10);
      this.deleteFile('X');
      this.createFile('Z', 8); // Cadeia longa
    } else if (name === 'muitos-indexados') {
      this.configureDisk(32, 1024);
      this.setMethod('indexada');
      for (let i = 1; i <= 8; i++) {
        this.createFile('F' + i, 2);
      }
    } else {
      throw new Error('Cenário desconhecido');
    }
  }
  private state: SimulatorState;

  constructor(initial?: Partial<SimulatorState>) {
    this.state = {
      disk: {
        totalBlocks: initial?.disk?.totalBlocks || 32,
        blockSizeBytes: initial?.disk?.blockSizeBytes || 1024,
        blocks: Array.from({ length: initial?.disk?.totalBlocks || 32 }, (_, i) => ({ id: i, used: false }))
      },
      dir: { files: {} },
      method: initial?.method || 'contigua',
      costs: initial?.costs || { ...defaultCosts }
    };
  }

  setMethod(m: AllocationMethod) {
    this.state.method = m;
  }

  configureDisk(totalBlocks: number, blockSizeBytes: number) {
    this.state.disk = {
      totalBlocks,
      blockSizeBytes,
      blocks: Array.from({ length: totalBlocks }, (_, i) => ({ id: i, used: false }))
    };
    this.state.dir = { files: {} };
  }

  setCosts(costs: Costs) {
    this.state.costs = { ...costs };
  }

  createFile(name: string, size: number): FileEntry {
    const strat = strategies[this.state.method];
    return strat.create(this.state.disk, this.state.dir, name, size);
  }

  extendFile(name: string, delta: number): FileEntry {
    const strat = strategies[this.state.method];
    return strat.extend(this.state.disk, this.state.dir, name, delta);
  }

  deleteFile(name: string): void {
    const strat = strategies[this.state.method];
    return strat.remove(this.state.disk, this.state.dir, name);
  }

  readFile(req: ReadRequest): ReadResult {
    const strat = strategies[this.state.method];
    return strat.read(this.state.disk, this.state.dir, req, this.state.costs);
  }

  getDirectory(): DirectoryTable {
    return this.state.dir;
  }

  getDisk(): Disk {
    return this.state.disk;
  }

  getMetrics(): Record<string, number> {
    const strat = strategies[this.state.method];
    // Calcula métricas detalhadas
    const metrics = strat.metrics(this.state.disk, this.state.dir);

    // Maior segmento de blocos livres
    let maxFreeSegment = 0;
    let currentFree = 0;
    let buracos = 0;
    let lastWasFree = false;
    let internalFrag = 0;
    const blocks = this.state.disk.blocks;
    for (let i = 0; i < blocks.length; i++) {
      if (!blocks[i].used) {
        currentFree++;
        if (!lastWasFree) buracos++;
        lastWasFree = true;
      } else {
        if (currentFree > maxFreeSegment) maxFreeSegment = currentFree;
        currentFree = 0;
        lastWasFree = false;
      }
    }
    if (currentFree > maxFreeSegment) maxFreeSegment = currentFree;

    // Fragmentação interna: soma espaço desperdiçado dentro dos blocos
    // Exemplo: se arquivo ocupa menos que o bloco, o resto é fragmentação interna
    // Fragmentação interna: considera espaço não utilizado dentro dos blocos
    // Se não houver sizeBytes, assume que o arquivo ocupa todos os blocos
    Object.values(this.state.dir.files).forEach(file => {
      // Se o arquivo tem size (em bytes), calcula fragmentação interna
      // Caso contrário, assume zero fragmentação interna
      if ('size' in file && typeof file.size === 'number' && file.sizeBlocks) {
        internalFrag += (file.sizeBlocks * this.state.disk.blockSizeBytes) - file.size;
      }
    });

    metrics['MaiorSegmento'] = maxFreeSegment;
    metrics['Buracos'] = buracos;
    metrics['FragmentacaoInterna'] = internalFrag;
    return metrics;
  }

  getState() {
    return {
      disk: this.getDisk(),
      dir: this.getDirectory(),
      method: this.state.method,
      costs: this.state.costs,
      metrics: this.getMetrics()
    };
  }

  exportState(): string {
    // Export only the minimal state needed to restore
    return JSON.stringify({
      disk: this.state.disk,
      dir: this.state.dir,
      method: this.state.method,
      costs: this.state.costs
    });
  }

  importState(json: string): void {
    try {
      const obj = JSON.parse(json);
      // Basic validation
      if (!obj.disk || !obj.dir || !obj.method || !obj.costs) {
        throw new Error('Estado inválido para importação');
      }
      this.state.disk = obj.disk;
      this.state.dir = obj.dir;
      this.state.method = obj.method;
      this.state.costs = obj.costs;
    } catch (e) {
      throw new Error('Falha ao importar estado: ' + (e instanceof Error ? e.message : String(e)));
    }
  }
}

export const simulator = new Simulator();
