export const resetSim = (req: Request, res: Response) => {
  try {
    simulator.configureDisk(32, 1024); // Estado inicial padrão
    simulator.setMethod('contigua');
    simulator.setCosts({ Cseek: 1, Cread: 1, Cptr: 1, CoverheadPtr: 1 });
    res.json({ ok: true, data: simulator.getState() });
  } catch (error) {
    const msg = typeof error === 'string' ? error : (error instanceof Error ? error.message : 'Erro desconhecido');
    res.status(400).json({ ok: false, error: msg });
  }
};
export const applyScenario = (req: Request, res: Response) => {
  try {
    const { name } = req.params;
    simulator.applyScenario(name);
    res.json({ ok: true, data: simulator.getState() });
  } catch (error) {
    const msg = typeof error === 'string' ? error : (error instanceof Error ? error.message : 'Erro desconhecido');
    res.status(400).json({ ok: false, error: msg });
  }
};

import { simulator } from '../models/core/simulator';
import { Request, Response } from 'express';

export const configureDisk = (req: Request, res: Response) => {
  try {
    const { totalBlocks, blockSizeBytes } = req.body;
    simulator.configureDisk(totalBlocks, blockSizeBytes);
    res.json({ ok: true, data: simulator.getState() });
  } catch (error) {
    const msg = typeof error === 'string' ? error : (error instanceof Error ? error.message : 'Erro desconhecido');
    res.status(400).json({ ok: false, error: msg });
  }
};

export const setMethod = (req: Request, res: Response) => {
  try {
    const { method } = req.body;
    simulator.setMethod(method);
    res.json({ ok: true, data: simulator.getState() });
  } catch (error) {
    const msg = typeof error === 'string' ? error : (error instanceof Error ? error.message : 'Erro desconhecido');
    res.status(400).json({ ok: false, error: msg });
  }
};

export const setCosts = (req: Request, res: Response) => {
  try {
    simulator.setCosts(req.body);
    res.json({ ok: true, data: simulator.getState() });
  } catch (error) {
    const msg = typeof error === 'string' ? error : (error instanceof Error ? error.message : 'Erro desconhecido');
    res.status(400).json({ ok: false, error: msg });
  }
};

export const getState = (req: Request, res: Response) => {
  try {
    res.json({ ok: true, data: simulator.getState() });
  } catch (error) {
    const msg = typeof error === 'string' ? error : (error instanceof Error ? error.message : 'Erro desconhecido');
    res.status(400).json({ ok: false, error: msg });
  }
};

export const exportState = (req: Request, res: Response) => {
  try {
    const json = simulator.exportState();
    res.json({ ok: true, data: json });
  } catch (error) {
    const msg = typeof error === 'string' ? error : (error instanceof Error ? error.message : 'Erro desconhecido');
    res.status(400).json({ ok: false, error: msg });
  }
};

export const importState = (req: Request, res: Response) => {
  try {
    const { json } = req.body;
    simulator.importState(json);
    res.json({ ok: true, data: simulator.getState() });
  } catch (error) {
    const msg = typeof error === 'string' ? error : (error instanceof Error ? error.message : 'Erro desconhecido');
    res.status(400).json({ ok: false, error: msg });
  }
};
