import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userId } = req.query;

  if (!userId || typeof userId !== 'string') {
    return res.status(400).json({ error: 'Invalid user ID' });
  }

  try {
    const { data: models, error } = await supabase
      .from('user_models')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;

    // Group files by model_name
    const groupedModels = models.reduce((acc, model) => {
      if (!acc[model.model_name]) {
        acc[model.model_name] = {
          id: model.id,
          model_name: model.model_name,
          files: []
        };
      }
      acc[model.model_name].files.push({
        id: model.id,
        file_name: model.file_name,
        file_url: model.file_url
      });
      return acc;
    }, {});

    res.status(200).json({ models: Object.values(groupedModels) });
  } catch (error) {
    console.error('Error fetching user models:', error);
    res.status(500).json({ error: 'Failed to fetch user models' });
  }
}