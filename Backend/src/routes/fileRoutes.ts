
import express from 'express';
import { createFile, extendFile, removeFile, readFile } from '../controllers/fileController';
const router = express.Router();

router.post('/api/files', createFile);
router.patch('/api/files/:name/extend', extendFile);
router.delete('/api/files/:name', removeFile);
router.post('/api/files/:name/read', readFile);

export default router;
