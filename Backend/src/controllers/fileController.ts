
import { simulator } from '../models/core/simulator';
import { Request, Response } from 'express';

export const createFile = (req: Request, res: Response) => {
  try {
    const { name, sizeBlocks } = req.body;
    const entry = simulator.createFile(name, sizeBlocks);
    res.json({ ok: true, data: entry });
  } catch (error) {
    const msg = typeof error === 'string' ? error : (error instanceof Error ? error.message : 'Erro desconhecido');
    res.status(400).json({ ok: false, error: msg });
  }
};

export const extendFile = (req: Request, res: Response) => {
  try {
    const { name } = req.params;
    const { deltaBlocks } = req.body;
    const entry = simulator.extendFile(name, deltaBlocks);
    res.json({ ok: true, data: entry });
  } catch (error) {
    const msg = typeof error === 'string' ? error : (error instanceof Error ? error.message : 'Erro desconhecido');
    res.status(400).json({ ok: false, error: msg });
  }
};

export const removeFile = (req: Request, res: Response) => {
  try {
    const { name } = req.params;
    simulator.deleteFile(name);
    res.json({ ok: true });
  } catch (error) {
    const msg = typeof error === 'string' ? error : (error instanceof Error ? error.message : 'Erro desconhecido');
    res.status(400).json({ ok: false, error: msg });
  }
};

export const readFile = (req: Request, res: Response) => {
  try {
    const { name } = req.params;
    const { mode, randomReads } = req.body;
    const result = simulator.readFile({ name, mode, randomReads });
    res.json({ ok: true, data: result });
  } catch (error) {
    const msg = typeof error === 'string' ? error : (error instanceof Error ? error.message : 'Erro desconhecido');
    res.status(400).json({ ok: false, error: msg });
  }
};
