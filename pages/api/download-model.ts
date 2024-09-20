import { NextApiRequest, NextApiResponse } from 'next';
import fetch from 'node-fetch';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { modelPath } = req.query;

  if (!modelPath || typeof modelPath !== 'string') {
    return res.status(400).json({ error: 'Invalid model path' });
  }

  try {
    const response = await fetch(modelPath);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const buffer = await response.buffer();

    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename=model.safetensors`);
    res.setHeader('Content-Length', buffer.length);

    res.status(200).send(buffer);
  } catch (error) {
    console.error('Error downloading model:', error);
    res.status(500).json({ error: 'Failed to download model' });
  }
}