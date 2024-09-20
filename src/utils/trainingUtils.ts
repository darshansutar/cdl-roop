const trainingData: { [key: string]: { progress: number; output: string | null; outputFileUrl: string | null; modelPath: string | null } } = {};

export async function getTrainingProgress(requestId: string): Promise<number> {
  if (!trainingData[requestId]) {
    trainingData[requestId] = { progress: 0, output: null, outputFileUrl: null, modelPath: null };
  }

  // Simulate progress
  if (trainingData[requestId].progress < 100) {
    trainingData[requestId].progress += Math.random() * 10;
    if (trainingData[requestId].progress > 100) {
      trainingData[requestId].progress = 100;
      trainingData[requestId].output = "Training completed successfully. Model saved.";
      trainingData[requestId].outputFileUrl = `/api/output-file?requestId=${requestId}`;
      trainingData[requestId].modelPath = `/path/to/models/${requestId}.zip`;
    }
  }

  return trainingData[requestId].progress;
}

export async function getTrainingOutput(requestId: string): Promise<string | null> {
  return trainingData[requestId]?.output || null;
}

export async function getOutputFileUrl(requestId: string): Promise<string | null> {
  return trainingData[requestId]?.outputFileUrl || null;
}

export async function getModelDownloadUrl(requestId: string): Promise<string | null> {
  return trainingData[requestId]?.modelPath || null;
}