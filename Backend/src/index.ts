import express from 'express';
import diskRoutes from './routes/diskRoutes';
import fileRoutes from './routes/fileRoutes';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

app.use(diskRoutes);
app.use(fileRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Backend listening on port ${PORT}`);
});
