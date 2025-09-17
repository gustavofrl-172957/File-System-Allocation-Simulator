
import React, { useEffect, useRef } from 'react';
import { useSimStore } from '../state/useSimStore';
import { DiskGrid } from '../components/DiskGrid';
import { FileOperations } from '../components/FileOperations';
import { Legend } from '../components/Legend';
import { DirectoryTable } from '../components/DirectoryTable';
import { InodePanel } from '../components/InodePanel';
import * as metrics from '../utils/metrics';

export default function Home() {
  const {
    fetchState,
    disk,
    method,
    costs,
    metrics: simMetrics,
    setMethod,
    setCosts,
    configureDisk,
    loading,
    error,
    triggerScenario,
    highlightedBlocks,
      resetSim,
    } = useSimStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchState();
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      {/* Botões de cenários */}
      <div className="flex gap-2 mb-4">
        <button className="bg-blue-500 text-white px-3 py-1 rounded" onClick={() => triggerScenario('fragmentacao-contigua')}>Fragmentação Contígua</button>
        <button className="bg-green-500 text-white px-3 py-1 rounded" onClick={() => triggerScenario('cadeias-longas')}>Cadeias Longas</button>
        <button className="bg-yellow-500 text-white px-3 py-1 rounded" onClick={() => triggerScenario('muitos-indexados')}>Muitos Indexados</button>
          <button className="bg-red-500 text-white px-3 py-1 rounded" onClick={() => resetSim()}>Limpar</button>
      </div>
      <h1 className="text-2xl font-bold mb-2">Simulador de Alocação em Sistemas de Arquivos</h1>
      {/* Configurações */}
      <div className="bg-white border rounded p-4 mb-4 flex flex-wrap gap-4 items-center">
        <div>
          <label className="font-bold mr-2">Método:</label>
          <select className="border px-2 py-1 rounded" value={method} onChange={e => setMethod(e.target.value as any)}>
            <option value="contigua">Contígua</option>
            <option value="encadeada">Encadeada</option>
            <option value="indexada">Indexada</option>
          </select>
        </div>
        <div>
          <label className="font-bold mr-2">Blocos:</label>
          <input className="border px-2 py-1 rounded w-20" type="number" min={8} max={256} defaultValue={disk?.totalBlocks || 32} onBlur={e => configureDisk(Number(e.target.value), disk?.blockSizeBytes || 1024)} />
        </div>
        <div>
          <label className="font-bold mr-2">Tamanho do bloco:</label>
          <input className="border px-2 py-1 rounded w-20" type="number" min={128} max={8192} defaultValue={disk?.blockSizeBytes || 1024} onBlur={e => configureDisk(disk?.totalBlocks || 32, Number(e.target.value))} />
        </div>
        <div>
          <label className="font-bold mr-2">Custos:</label>
          {Object.keys(costs).map(k => (
            <span key={k} className="mr-2">
              {k}: <input className="border px-1 py-0.5 rounded w-12" type="number" min={1} value={costs[k]} onChange={e => setCosts({ ...costs, [k]: Number(e.target.value) })} />
            </span>
          ))}
        </div>
      </div>
      {/* Operações de arquivo */}
      <div className="bg-white border rounded p-4 mb-4">
        <FileOperations />
      </div>
      {/* Visual do disco */}
      <div className="bg-white border rounded p-4 mb-4">
        <div className="mb-2 flex justify-between items-center">
          <span className="font-bold">Visualização do Disco</span>
          <Legend />
        </div>
  <DiskGrid highlightBlocks={highlightedBlocks} />
      </div>
      {/* Diretório & i-nodes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border rounded p-4">
          <span className="font-bold">Tabela de Diretório</span>
          <DirectoryTable />
        </div>
        <div className="bg-white border rounded p-4">
          <span className="font-bold">Painel de i-nodes</span>
          <InodePanel />
        </div>
      </div>
      {/* Métricas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
        <div className="bg-white border rounded p-4 text-center">
          <div className="font-bold">Ocupação</div>
          <div>{metrics.percentOcupacao(simMetrics.ocupacao || 0)}</div>
        </div>
        <div className="bg-white border rounded p-4 text-center">
          <div className="font-bold">Maior Segmento</div>
          <div>{metrics.formatMaiorSegmento(simMetrics.maiorSegmento || 0)}</div>
        </div>
        <div className="bg-white border rounded p-4 text-center">
          <div className="font-bold">Buracos</div>
          <div>{metrics.formatBuracos(simMetrics.buracos || 0)}</div>
        </div>
        <div className="bg-white border rounded p-4 text-center">
          <div className="font-bold">Fragmentação Interna</div>
          <div>{metrics.formatInterna(simMetrics.interna || 0, disk?.blockSizeBytes || 1024)}</div>
        </div>
        {method === 'encadeada' && (
          <div className="bg-white border rounded p-4 text-center">
            <div className="font-bold">Avg Chain</div>
            <div>{metrics.formatAvgChain(simMetrics.avgChain || 0)}</div>
          </div>
        )}
        {method === 'indexada' && (
          <div className="bg-white border rounded p-4 text-center">
            <div className="font-bold">Overhead</div>
            <div>{metrics.formatOverhead(simMetrics.overhead || 0)}</div>
          </div>
        )}
      </div>
      {loading && <div className="text-blue-500 mt-4">Carregando...</div>}
      {error && <div className="text-red-500 mt-4">{error}</div>}
    </div>
  );
}
