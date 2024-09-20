import { NextApiRequest, NextApiResponse } from 'next';
import { getTrainingProgress } from '../../src/utils/trainingUtils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { requestId } = req.query;

  if (!requestId || typeof requestId !== 'string') {
    return res.status(400).json({ error: 'Invalid request ID' });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const sendProgress = async () => {
    try {
      const progress = await getTrainingProgress(requestId);
      res.write(`data: ${JSON.stringify({ progress })}\n\n`);

      if (progress < 100) {
        setTimeout(sendProgress, 1000); // Update every second
      } else {
        res.end();
      }
    } catch (error) {
      console.error('Error fetching training progress:', error);
      res.write(`data: ${JSON.stringify({ error: 'Failed to fetch progress' })}\n\n`);
      res.end();
    }
  };

  sendProgress();
}