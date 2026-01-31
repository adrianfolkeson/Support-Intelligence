import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import app from '../src/api/server';

// For Vercel serverless deployment
export default app;

// For local development
if (require.main === module) {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`API server running on port ${PORT}`);
  });
}
