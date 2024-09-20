import { NextApiRequest, NextApiResponse } from 'next';
import { getTrainingOutput, getOutputFileUrl } from '../../src/utils/trainingUtils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { requestId } = req.query;

  if (!requestId || typeof requestId !== 'string') {
    return res.status(400).json({ error: 'Invalid request ID' });
  }

  try {
    const output = await getTrainingOutput(requestId);
    const outputFileUrl = await getOutputFileUrl(requestId);
    res.status(200).json({ output, outputFileUrl });
  } catch (error) {
    console.error('Error fetching training output:', error);
    res.status(500).json({ error: 'Failed to fetch training output' });
  }
}