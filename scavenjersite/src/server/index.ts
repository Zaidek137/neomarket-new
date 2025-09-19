import express from 'express';
import cors from 'cors';
import { traitRouter } from './routes/traits';
import { assetRouter } from './routes/assets';
import { errorHandler } from './middleware/errorHandler';

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/traits', traitRouter);
app.use('/api/assets', assetRouter);

// Error handling
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});