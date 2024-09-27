import { createClient } from '../../utils/supabase/client';

export async function startTextToImageGeneration({ prompt }: { prompt: string }) {
  const supabase = createClient();

  try {
    const { data, error } = await supabase.functions.invoke('text-to-image', {
      body: { prompt },
    });

    if (error) {
      console.error('Error invoking text-to-image function:', error);
      return { success: false, error: error.message };
    }

    return { success: true, images: data.images };
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error starting text-to-image generation:', error);
      return { success: false, error: error.message };
    } else {
      console.error('Error starting text-to-image generation:', error);
      return { success: false, error: 'An unknown error occurred' };
    }
  }
}