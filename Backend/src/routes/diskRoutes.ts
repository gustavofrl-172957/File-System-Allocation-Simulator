import { applyScenario, resetSim } from '../controllers/diskController';

import express from 'express';
import { configureDisk, setMethod, setCosts, getState } from '../controllers/diskController';
import { exportState, importState } from '../controllers/diskController';
const router = express.Router();

router.post('/api/scenarios/:name', applyScenario);

router.post('/api/disk/configure', configureDisk);
router.post('/api/disk/method', setMethod);
router.post('/api/disk/costs', setCosts);
router.get('/api/state', getState);

router.get('/api/state/export', exportState);
router.post('/api/state/import', importState);

router.post('/api/reset', resetSim); // Endpoint para resetar simulador

export default router;
