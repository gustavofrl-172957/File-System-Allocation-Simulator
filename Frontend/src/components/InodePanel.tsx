// Frontend/src/components/InodePanel.tsx
import React, { useState } from 'react';
import { useSimStore } from '../state/useSimStore';

export function InodePanel() {
  const { dir, method } = useSimStore();
  const [selected, setSelected] = useState<string>('');
  if (method !== 'indexada' || !dir) return null;
  const files = Object.values(dir.files || {}).filter((f: any) => f.method === 'indexada');
  const inode = files.find((f: any) => f.name === selected);

  return (
    <div className="border rounded p-2 bg-white">
      <div className="mb-2 flex gap-2 items-center">
        <label className="font-bold text-sm">Arquivo:</label>
        <select className="border px-2 py-1 rounded" value={selected} onChange={e => setSelected(e.target.value)}>
          <option value="">Selecione</option>
          {files.map((f: any) => (
            <option key={f.name} value={f.name}>{f.name}</option>
          ))}
        </select>
      </div>
      {inode && (
        <div className="text-xs">
          <div><span className="font-bold">i-node:</span> {inode.inodeId}</div>
          <div><span className="font-bold">Blocos de dados:</span> {(inode.dataBlocks || []).join(', ')}</div>
        </div>
      )}
    </div>
  );
}
