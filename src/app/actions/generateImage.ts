'use server'

import * as fal from "@fal-ai/serverless-client";

export async function generateImage(formData: FormData) {
  console.log("generateImage function called");

  const prompt = formData.get('prompt') as string;
  const imageSize = formData.get('imageSize') as string;
  const numInferenceSteps = parseInt(formData.get('inferenceSteps') as string);
  const seed = formData.get('seed') ? parseInt(formData.get('seed') as string) : undefined;
  const loras = JSON.parse(formData.get('loras') as string);
  const guidanceScale = parseFloat(formData.get('guidanceScale') as string);
  const syncMode = formData.get('syncMode') === 'true';
  const numImages = parseInt(formData.get('numImages') as string);
  const enableSafetyChecker = formData.get('safetyChecker') === 'true';
  const outputFormat = formData.get('outputFormat') as string;

  console.log("Input parameters:", {
    prompt,
    imageSize,
    numInferenceSteps,
    seed,
    loras,
    guidanceScale,
    syncMode,
    numImages,
    enableSafetyChecker,
    outputFormat
  });

  try {
    console.log("Calling fal.subscribe");
    const result = await fal.subscribe("fal-ai/flux-lora", {
      input: {
        prompt,
        image_size: imageSize,
        num_inference_steps: numInferenceSteps,
        seed,
        loras,
        guidance_scale: guidanceScale,
        sync_mode: syncMode,
        num_images: numImages,
        enable_safety_checker: enableSafetyChecker,
        output_format: outputFormat,
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === "IN_PROGRESS") {
          console.log("Queue update:", update.logs.map((log) => log.message));
        }
      },
    });

    console.log("fal.subscribe result:", result);
    return result;
  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
}