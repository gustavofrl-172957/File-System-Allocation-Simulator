export async function triggerScenario(name: string) {
  return request(`/api/scenarios/${encodeURIComponent(name)}`, {
    method: 'POST'
  });
}


const BASE = 'http://localhost:3001';

async function request(url: string, options?: RequestInit) {
  try {
    const res = await fetch(BASE + url, {
      headers: { 'Content-Type': 'application/json' },
      ...options
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { ok: false, error: data?.error || `HTTP ${res.status}` };
    }
    return data;
  } catch (e) {
    return { ok: false, error: (e instanceof Error ? e.message : 'erro de rede') };
  }
}

export async function configureDisk(totalBlocks: number, blockSizeBytes: number) {
  return request('/api/disk/configure', {
    method: 'POST',
    body: JSON.stringify({ totalBlocks, blockSizeBytes })
  });
}

export async function setMethod(method: string) {
  return request('/api/disk/method', {
    method: 'POST',
    body: JSON.stringify({ method })
  });
}

export async function setCosts(costs: Record<string, number>) {
  return request('/api/disk/costs', {
    method: 'POST',
    body: JSON.stringify(costs)
  });
}

export async function getState() {
  return request('/api/state');
}

export async function createFile(name: string, sizeBlocks: number) {
  return request('/api/files', {
    method: 'POST',
    body: JSON.stringify({ name, sizeBlocks })
  });
}

export async function extendFile(name: string, deltaBlocks: number) {
  return request(`/api/files/${encodeURIComponent(name)}/extend`, {
    method: 'PATCH',
    body: JSON.stringify({ deltaBlocks })
  });
}

export async function deleteFile(name: string) {
  return request(`/api/files/${encodeURIComponent(name)}`, {
    method: 'DELETE'
  });
}

export async function readFile(name: string, mode: 'sequencial' | 'aleatorio', randomReads?: number) {
  return request(`/api/files/${encodeURIComponent(name)}/read`, {
    method: 'POST',
    body: JSON.stringify({ mode, randomReads })
  });
}
export async function resetSim() {
  return await request('/api/reset', {
    method: 'POST'
  });
}

