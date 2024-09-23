import { NextApiRequest, NextApiResponse } from 'next';
import { checkTrainingStatus } from '@/actions/trainingActions';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { requestId } = req.query;

  if (!requestId || typeof requestId !== 'string') {
    return res.status(400).json({ error: 'Invalid request ID' });
  }

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
  });

  const sendUpdate = async () => {
    try {
      const status = await checkTrainingStatus(requestId);
      console.log('Training status:', status);  // Add this line for debugging
      res.write(`data: ${JSON.stringify(status)}\n\n`);

      if (status.status === 'completed' || status.status === 'failed') {
        res.end();
      } else {
        setTimeout(sendUpdate, 5000); // Check every 5 seconds
      }
    } catch (error) {
      console.error('Error checking training status:', error);
      res.write(`data: ${JSON.stringify({ error: 'An error occurred while checking training status' })}\n\n`);
      res.end();
    }
  };

  sendUpdate();
}