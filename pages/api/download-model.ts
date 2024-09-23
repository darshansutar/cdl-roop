import { NextApiRequest, NextApiResponse } from 'next';
import fetch from 'node-fetch';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { fileUrl } = req.query;

  if (!fileUrl || typeof fileUrl !== 'string') {
    return res.status(400).json({ error: 'Invalid file URL' });
  }

  try {
    const response = await fetch(fileUrl);
    if (!response.ok) throw new Error('Failed to fetch file');

    const contentType = response.headers.get('content-type');
    const contentDisposition = response.headers.get('content-disposition');
    const fileName = contentDisposition
      ? contentDisposition.split('filename=')[1].replace(/"/g, '')
      : 'downloaded-file';

    res.setHeader('Content-Type', contentType || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

    response.body.pipe(res);
  } catch (error) {
    console.error('Error downloading file:', error);
    res.status(500).json({ error: 'Failed to download file' });
  }
}