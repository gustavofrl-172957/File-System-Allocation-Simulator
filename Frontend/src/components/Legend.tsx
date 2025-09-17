// Frontend/src/components/Legend.tsx
import React from 'react';

const legendItems = [
  { color: 'bg-gray-200', label: 'Livre' },
  { color: 'bg-blue-400', label: 'Ocupado (dados)' },
  { color: 'bg-yellow-400', label: 'Bloco de índice (i-node)' },
  { color: 'bg-green-400', label: 'Ponteiro/Encadeamento' },
];

export function Legend() {
  return (
    <div className="flex gap-4 flex-wrap items-center">
      {legendItems.map((item) => (
        <div key={item.label} className="flex items-center gap-2">
          <span className={`w-5 h-5 rounded ${item.color} border border-gray-400 inline-block`} />
          <span className="text-sm">{item.label}</span>
        </div>
      ))}
    </div>
  );
}
