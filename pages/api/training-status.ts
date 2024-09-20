import { NextApiRequest, NextApiResponse } from 'next';
import { checkTrainingStatus } from '../../src/actions/trainingActions';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { requestId } = req.query;

  if (!requestId || typeof requestId !== 'string') {
    return res.status(400).json({ error: 'Invalid request ID' });
  }

  try {
    const status = await checkTrainingStatus(requestId);
    res.status(200).json(status);
  } catch (error) {
    console.error('Error fetching training status:', error);
    res.status(500).json({ error: 'Failed to fetch training status' });
  }
}