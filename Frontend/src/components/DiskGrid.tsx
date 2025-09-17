
import React from 'react';
import { useSimStore } from '../state/useSimStore';

interface DiskGridProps {
  highlightBlocks?: number[];
}

export function DiskGrid({ highlightBlocks = [] }: DiskGridProps) {
  const { disk, dir, method } = useSimStore();
  if (!disk) return <div>Carregando disco...</div>;

  const N = disk.totalBlocks;
  const gridCols = N > 16 ? 16 : N;
  const gridRows = Math.ceil(N / gridCols);

  return (
    <div className="overflow-auto max-h-96 border rounded p-2 bg-white">
      <div
        className="grid gap-1"
        style={{ gridTemplateColumns: `repeat(${gridCols}, minmax(24px, 1fr))` }}
      >
        {disk.blocks.map((block: any, idx: number) => {
          let color = 'bg-gray-200';
          if (block.used && block.isIndex) color = 'bg-yellow-400';
          else if (block.used && method === 'encadeada') color = 'bg-green-400';
          else if (block.used) color = 'bg-blue-400';
          if (highlightBlocks.includes(idx)) color += ' ring-2 ring-red-500';
          return (
            <div
              key={block.id}
              className={`h-7 w-7 flex items-center justify-center text-xs font-bold rounded ${color} border border-gray-300 relative`}
              title={`Bloco ${block.id}\n${block.used ? `Arquivo: ${block.file}` : 'Livre'}${block.isIndex ? '\nÍndice/i-node' : ''}`}
            >
              {block.id}
            </div>
          );
        })}
      </div>
    </div>
  );
}
