'use server'

import * as fal from "@fal-ai/serverless-client";
import JSZip from 'jszip';

export async function startTraining({
  modelName,
  selectedType,
  imageDataUrls,
}: {
  modelName: string;
  selectedType: string;
  imageDataUrls: string[];
}) {
  try {
    // Combine all images into a single zip file
    const zip = new JSZip();
    imageDataUrls.forEach((dataUrl, index) => {
      const base64Data = dataUrl.split(',')[1];
      zip.file(`image_${index}.jpg`, base64Data, { base64: true });
    });
    const zipBlob = await zip.generateAsync({ type: 'blob' });

    // Upload the zip file to fal storage
    const zipUrl = await fal.storage.upload(new File([zipBlob], 'images.zip'));

    // Start the training process
    const { request_id } = await fal.queue.submit("fal-ai/flux-lora-general-training", {
      input: {
        images_data_url: zipUrl,
        trigger_word: modelName,
        steps: 1000, // You can adjust this or make it configurable
        rank: 16, // You can adjust this or make it configurable
        learning_rate: 0.0004, // You can adjust this or make it configurable
        caption_dropout_rate: 0.05, // You can adjust this or make it configurable
      },
    });

    return { success: true, requestId: request_id };
  } catch (error) {
    console.error('Error starting training:', error);
    return { success: false, error: 'Failed to start training' };
  }
}