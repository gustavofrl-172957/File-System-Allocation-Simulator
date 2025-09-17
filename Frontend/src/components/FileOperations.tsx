
import React, { useState } from 'react';
import { useSimStore } from '../state/useSimStore';

export function FileOperations() {
  const { createFile, extendFile, deleteFile, readFile, dir, loading, error } = useSimStore();
  const [name, setName] = useState('');
  const [size, setSize] = useState(1);
  const [delta, setDelta] = useState(1);
  const [readMode, setReadMode] = useState<'sequencial' | 'aleatorio'>('sequencial');
  const [randomReads, setRandomReads] = useState(1);
  const [readResult, setReadResult] = useState<any>(null);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    await createFile(name, size);
    setName('');
    setSize(1);
  }

  async function handleExtend(e: React.FormEvent) {
    e.preventDefault();
    await extendFile(name, delta);
    setDelta(1);
  }

  async function handleDelete(e: React.FormEvent) {
    e.preventDefault();
    await deleteFile(name);
    setName('');
  }

  async function handleRead(e: React.FormEvent) {
    e.preventDefault();
    const result = await readFile(name, readMode, randomReads);
    setReadResult(result);
  }

  return (
    <div className="space-y-4">
      <form className="flex gap-2 items-center" onSubmit={handleCreate}>
        <input className="border px-2 py-1 rounded" value={name} onChange={e => setName(e.target.value)} placeholder="Nome do arquivo" required />
        <input className="border px-2 py-1 rounded w-20" type="number" min={1} value={size} onChange={e => setSize(Number(e.target.value))} placeholder="Tamanho" required />
        <button className="bg-blue-500 text-white px-3 py-1 rounded" type="submit" disabled={loading}>Criar</button>
      </form>
      <form className="flex gap-2 items-center" onSubmit={handleExtend}>
        <input className="border px-2 py-1 rounded" value={name} onChange={e => setName(e.target.value)} placeholder="Nome do arquivo" required />
        <input className="border px-2 py-1 rounded w-20" type="number" min={1} value={delta} onChange={e => setDelta(Number(e.target.value))} placeholder="+Blocos" required />
        <button className="bg-green-500 text-white px-3 py-1 rounded" type="submit" disabled={loading}>Estender</button>
      </form>
      <form className="flex gap-2 items-center" onSubmit={handleDelete}>
        <input className="border px-2 py-1 rounded" value={name} onChange={e => setName(e.target.value)} placeholder="Nome do arquivo" required />
        <button className="bg-red-500 text-white px-3 py-1 rounded" type="submit" disabled={loading}>Excluir</button>
      </form>
      <form className="flex gap-2 items-center" onSubmit={handleRead}>
        <input className="border px-2 py-1 rounded" value={name} onChange={e => setName(e.target.value)} placeholder="Nome do arquivo" required />
        <select className="border px-2 py-1 rounded" value={readMode} onChange={e => setReadMode(e.target.value as any)}>
          <option value="sequencial">Sequencial</option>
          <option value="aleatorio">Aleatório</option>
        </select>
        {readMode === 'aleatorio' && (
          <input className="border px-2 py-1 rounded w-20" type="number" min={1} value={randomReads} onChange={e => setRandomReads(Number(e.target.value))} placeholder="K" />
        )}
        <button className="bg-purple-500 text-white px-3 py-1 rounded" type="submit" disabled={loading}>Ler</button>
      </form>
      {readResult && (
        <div className="mt-2 p-2 bg-gray-100 rounded text-sm">
          <div>Tempo estimado: {readResult.totalCost} ms</div>
          <div>Blocos lidos: {readResult.steps.map((s: any) => s.block).join(', ')}</div>
        </div>
      )}
      {error && <div className="text-red-500">{error}</div>}
    </div>
  );
}
