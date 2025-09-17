
export function percentOcupacao(ocupacao: number) {
  return `${(ocupacao * 100).toFixed(1)}%`;
}

export function formatMaiorSegmento(maiorSegmento: number) {
  return `${maiorSegmento} blocos`;
}

export function formatBuracos(buracos: number) {
  return `${buracos} buraco${buracos === 1 ? '' : 's'}`;
}

export function formatInterna(interna: number, blockSizeBytes: number) {
  return `${(interna / 1024).toFixed(2)} KiB (${interna} bytes)`;
}

export function formatOverhead(overhead: number) {
  return `${overhead} bloco${overhead === 1 ? '' : 's'} de índice`;
}

export function formatAvgChain(avgChain: number) {
  return `${avgChain.toFixed(2)} blocos`;
}

export function formatTempoAcesso(cost: number) {
  return `${cost} ms (estimado)`;
}
