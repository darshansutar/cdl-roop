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
        trigger_word: selectedType,
        steps: 1, // Increased from 5 to ensure model generation
        rank: 16,
        learning_rate: 0.0004,
        caption_dropout_rate: 0.05,
      },
    });

    return { success: true, requestId: request_id };
  } catch (error) {
    console.error('Error starting training:', error);
    return { success: false, error: 'Failed to start training' };
  }
}

export async function checkTrainingStatus(requestId: string) {
  try {
    const result = await fal.queue.status("fal-ai/flux-lora-general-training", {
      requestId,
      logs: true,
    });

    console.log('Raw status result:', JSON.stringify(result, null, 2));

    if (result && typeof result === 'object' && 'status' in result) {
      const status = result.status as 'IN_PROGRESS' | 'COMPLETED' | 'IN_QUEUE' | 'FAILED';
      const logs = (result as any).logs || [];
      
      // Format the logs
      const formattedLogs = logs.map((log: any) => ({
        timestamp: new Date(log.timestamp).toLocaleTimeString(),
        message: log.message
      }));

      const response: any = {
        status: status.toLowerCase(),
        progress: 0,
        currentProcess: '',
        currentStep: 0,
        totalSteps: 0,
        logs: formattedLogs,
        outputFiles: {}
      };

      if (status === 'COMPLETED') {
        response.progress = 100;
        response.currentProcess = 'Training completed';
        if ('output' in result && result.output) {
          console.log('Training output:', JSON.stringify(result.output, null, 2));
          const output = result.output as any;
          response.outputFiles = {};

          if (output.diffusers_lora_file) {
            const fileData = await fetchFileData(output.diffusers_lora_file);
            response.outputFiles['diffusers_lora_file.safetensors'] = {
              url: output.diffusers_lora_file,
              content_type: 'application/octet-stream',
              file_name: 'diffusers_lora_file.safetensors',
              file_size: fileData.size,
              file_data: fileData.data
            };
          }

          if (output.config_file) {
            const fileData = await fetchFileData(output.config_file);
            response.outputFiles['config_file.json'] = {
              url: output.config_file,
              content_type: 'application/json',
              file_name: 'config_file.json',
              file_size: fileData.size,
              file_data: fileData.data
            };
          }

          if (output.debug_caption_files) {
            const fileData = await fetchFileData(output.debug_caption_files);
            response.outputFiles['debug_caption_files.tar.gz'] = {
              url: output.debug_caption_files,
              content_type: 'application/gzip',
              file_name: 'debug_caption_files.tar.gz',
              file_size: fileData.size,
              file_data: fileData.data
            };
          }

          if (output.experimental_multi_checkpoints && output.experimental_multi_checkpoints.length > 0) {
            for (let index = 0; index < output.experimental_multi_checkpoints.length; index++) {
              const checkpoint = output.experimental_multi_checkpoints[index];
              const fileData = await fetchFileData(checkpoint);
              response.outputFiles[`checkpoint_${index + 1}.safetensors`] = {
                url: checkpoint,
                content_type: 'application/octet-stream',
                file_name: `checkpoint_${index + 1}.safetensors`,
                file_size: fileData.size,
                file_data: fileData.data
              };
            }
          }
        } else {
          console.warn('No output files in the result');
        }
      }

      console.log('Formatted status response:', JSON.stringify(response, null, 2));
      return response;
    } else {
      throw new Error('Invalid response from fal.queue.status');
    }
  } catch (error) {
    console.error('Error in checkTrainingStatus:', error);
    return { status: 'failed', error: 'An unexpected error occurred', logs: [] };
  }
}

async function fetchFileData(url: string) {
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString('base64');
  return {
    size: arrayBuffer.byteLength,
    data: base64
  };
}

function getCurrentProcess(progress: number): string {
  if (progress < 20) return 'Initializing training';
  if (progress < 40) return 'Processing images';
  if (progress < 60) return 'Training model';
  if (progress < 80) return 'Fine-tuning';
  return 'Finalizing model';
}