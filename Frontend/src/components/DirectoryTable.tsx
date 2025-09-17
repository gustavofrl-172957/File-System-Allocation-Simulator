// Frontend/src/components/DirectoryTable.tsx
import React from 'react';
import { useSimStore } from '../state/useSimStore';

export function DirectoryTable() {
  const { dir, method } = useSimStore();
  if (!dir) return <div>Carregando diretório...</div>;
  const files = Object.values(dir.files || {});

  let columns: Array<{ key: string; label: string }> = [
    { key: 'name', label: 'Nome' },
    { key: 'sizeBlocks', label: 'Tamanho (blocos)' },
  ];
  if (method === 'contigua') {
    columns.push({ key: 'start', label: 'Início' });
  } else if (method === 'encadeada') {
    columns.push({ key: 'head', label: 'Head' });
    columns.push({ key: 'tail', label: 'Tail' });
  } else if (method === 'indexada') {
    columns.push({ key: 'inodeId', label: 'i-node' });
    columns.push({ key: 'dataBlocks', label: 'Blocos de dados' });
  }

  return (
    <div className="overflow-auto max-h-64 border rounded p-2 bg-white">
      <table className="min-w-full text-xs">
        <thead>
          <tr>
            {columns.map(col => (
              <th key={col.key} className="px-2 py-1 border-b text-left font-bold">{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {files.map((file: any) => (
            <tr key={file.name} className="hover:bg-gray-100">
              {columns.map(col => (
                <td key={col.key} className="px-2 py-1 border-b">
                  {Array.isArray(file[col.key]) ? file[col.key].join(', ') : file[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
