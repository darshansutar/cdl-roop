'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FaTrash, FaPlus, FaDownload } from 'react-icons/fa' // Add FaDownload import
import { generateImage } from '../app/actions/generateImage'
import { toast } from 'react-hot-toast'; // Add this import

const TextToImagePage: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('')
  const [inferenceSteps, setInferenceSteps] = useState<number>(0)
  const [seed, setSeed] = useState<number | ''>('');
  const [loraSections, setLoraSections] = useState<{ path: string; scale: number }[]>([{ path: '', scale: 0 }]);
  const [guidanceScale, setGuidanceScale] = useState<number>(0);
  const [syncMode, setSyncMode] = useState<boolean>(false);
  const [numImages, setNumImages] = useState<number>(1);
  const [safetyChecker, setSafetyChecker] = useState<boolean>(true);
  const [outputFormat, setOutputFormat] = useState<string>('default');
  const [generatedImages, setGeneratedImages] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handlePromptChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(event.target.value)
  }

  const addLoraSection = () => {
    setLoraSections([...loraSections, { path: '', scale: 0 }]);
  }

  const removeLoraSection = (index: number) => {
    const newSections = loraSections.filter((_, i) => i !== index);
    setLoraSections(newSections);
  }

  useEffect(() => {
    if (syncMode) {
      console.log("Sync mode is enabled");
    } else {
      console.log("Sync mode is disabled");
    }
  }, [syncMode]);

  const resetSettings = () => {
    setPrompt('');
    setInferenceSteps(0);
    setSeed('');
    setLoraSections([{ path: '', scale: 0 }]);
    setGuidanceScale(0);
    setSyncMode(false);
    setNumImages(1);
    setSafetyChecker(true);
    setOutputFormat('default');
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setIsLoading(true)
    setError(null)
    setGeneratedImages([])

    const formData = new FormData()
    formData.append('prompt', prompt)
    formData.append('imageSize', 'landscape_4_3') // You might want to make this dynamic
    formData.append('inferenceSteps', inferenceSteps.toString())
    formData.append('seed', seed.toString())
    formData.append('loras', JSON.stringify(loraSections))
    formData.append('guidanceScale', guidanceScale.toString())
    formData.append('syncMode', syncMode.toString())
    formData.append('numImages', numImages.toString())
    formData.append('safetyChecker', safetyChecker.toString())
    formData.append('outputFormat', outputFormat)

    try {
      const result = await generateImage(formData)
      console.log("Result from generateImage:", result);
      if (result && typeof result === 'object' && 'images' in result && Array.isArray(result.images)) {
        setGeneratedImages(result.images.map(img => img.url))
        toast.success('Image(s) generated successfully!');
      } else {
        console.error("Unexpected result structure:", result)
        setError("Unexpected response from the server")
        toast.error('Failed to generate image. Unexpected response from the server.');
      }
    } catch (error) {
      console.error("Error generating image:", error)
      setError(error instanceof Error ? error.message : "An unknown error occurred")
      toast.error('Failed to generate image. Please try again.');
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownload = (imageUrl: string, index: number) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `generated-image-${index + 1}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[#222620] relative p-8">
      <div className="absolute inset-0 z-0 pointer-events-none opacity-50 bg-noise" aria-hidden="true"></div>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-[#85e178] mb-8 text-center">Text to Image Generation</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-[#85e178] bg-opacity-90 backdrop-blur-sm rounded-2xl p-8 relative overflow-hidden"
          >
            <div className="absolute inset-0 z-0 pointer-events-none opacity-30 bg-noise" aria-hidden="true"></div>
            <div className="relative z-10">
              <h2 className="text-2xl font-semibold mb-4 text-[#222620]">Enter your prompt</h2>
              <div className="mb-6">
                <label htmlFor="prompt" className="block mb-2 text-lg font-bold text-black">Prompt</label>
                <textarea
                  id="prompt"
                  className="w-full h-32 p-2 border border-secondary rounded-xl text-lg bg-[#222620] text-[#85e178]"
                  placeholder="Type your prompt here..."
                  value={prompt}
                  onChange={handlePromptChange}
                ></textarea>
              </div>

              <div className="mb-6">
                <label className="block mb-2 text-lg font-bold text-black">Image Size</label>
                <div className="flex items-center space-x-4">
                  <select className="p-2 border border-secondary rounded-xl text-lg bg-[#222620] text-[#85e178]">
                    <option value="default" selected>
                      Default <span className="ml-2"></span> {/* Selection icon */}
                    </option>
                    <option value="square">Square</option>
                    <option value="squareHD">Square HD</option>
                    <option value="portrait3:4">Portrait 3:4</option>
                    <option value="portrait9:16">Portrait 9:16</option>
                    <option value="landscape4:3">Landscape 4:3</option>
                    <option value="landscape16:9">Landscape 16:9</option>
                    <option value="custom">Custom</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Width"
                    className="w-24 p-2 border border-secondary rounded-xl text-lg bg-[#222620] text-[#85e178]"
                    onKeyPress={(e) => {
                      if (!/[0-9]/.test(e.key)) {
                        e.preventDefault();
                      }
                    }}
                  />
                  <span className="text-lg text-black">x</span>
                  <input
                    type="text"
                    placeholder="Height"
                    className="w-24 p-2 border border-secondary rounded-xl text-lg bg-[#222620] text-[#85e178]"
                    onKeyPress={(e) => {
                      if (!/[0-9]/.test(e.key)) {
                        e.preventDefault();
                      }
                    }}
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block mb-2 text-lg font-bold text-black">Num of Inference Steps</label>
                <div className="flex items-center">
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={inferenceSteps}
                    className="w-full slider"
                    onChange={(e) => setInferenceSteps(Number(e.target.value))}
                  />
                  <span className="ml-4 text-lg text-black">{inferenceSteps}</span>
                </div>
              </div>

              <div className="mb-6">
                <label className="block mb-2 text-lg font-bold text-black">Seed</label>
                <div className="flex items-center space-x-4">
                  <input
                    type="text"
                    placeholder="Enter seed"
                    className="w-24 p-2 border border-secondary rounded-xl text-lg bg-[#222620] text-[#85e178]"
                    value={seed}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (/^\d*$/.test(value)) {
                        setSeed(value === '' ? '' : Number(value));
                      }
                    }}
                  />
                  <button
                    onClick={() => {
                      const randomSeed = Math.floor(Math.random() * 10000);
                      setSeed(randomSeed);
                    }}
                    className="p-2 border border-secondary rounded-xl text-lg bg-[#222620] text-[#85e178]"
                  >
                    🔄
                  </button>
                </div>
              </div>

              {loraSections.map((section, index) => (
                <div key={index} className="mb-6 bg-[#85e178] bg-opacity-90 rounded-2xl p-4 relative">
                  <button
                    onClick={() => removeLoraSection(index)}
                    className="absolute top-2 right-2 text-black hover:text-gray-800"
                    style={{ fontSize: '1.5em' }}
                  >
                    <FaTrash />
                  </button>
                  <label className="block mb-2 text-lg font-bold text-black">Lora</label>
                  <label className="block mb-2 text-md text-black">Path</label>
                  <input
                    type="text"
                    placeholder="Paste path or URL here..."
                    className="w-full p-2 border border-secondary rounded-xl text-lg bg-[#222620] text-[#85e178]"
                    value={section.path}
                    onChange={(e) => {
                      const newSections = [...loraSections];
                      newSections[index].path = e.target.value;
                      setLoraSections(newSections);
                    }}
                  />
                  <label className="block mb-2 text-black mt-4">Scale</label>
                  <div className="flex items-center">
                    <input
                      type="range"
                      min="0"
                      max="4"
                      step="0.1"
                      value={section.scale}
                      className="w-full slider"
                      onChange={(e) => {
                        const newSections = [...loraSections];
                        newSections[index].scale = Number(e.target.value);
                        setLoraSections(newSections);
                      }}
                    />
                    <span className="ml-4 text-lg text-black">{section.scale.toFixed(1)}</span>
                  </div>
                </div>
              ))}

              <button
                onClick={addLoraSection}
                className="mt-4 p-2 bg-[#222620] text-[#85e178] rounded-xl font-semibold flex items-center justify-center"
              >
                <FaPlus className="mr-2" />
              </button>

              <div className="mb-6">
                <label className="block mb-2 text-lg font-bold text-black">Guidance scale (CFG)</label>
                <div className="flex items-center">
                  <input
                    type="range"
                    min="0"
                    max="20"
                    step="0.5"
                    value={guidanceScale}
                    className="w-full slider"
                    onChange={(e) => setGuidanceScale(Number(e.target.value))}
                  />
                  <span className="ml-4 text-lg text-black">{guidanceScale}</span>
                </div>
              </div>

              <div className="mb-6 flex items-center">
                <label className="block mb-2 text-lg font-bold text-black mr-4">Sync mode</label>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only"
                    onChange={(e) => setSyncMode(e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-300 rounded-full shadow-inner"></div>
                  <div className={`dot absolute w-5 h-5 bg-[#85e178] rounded-full shadow transition ${syncMode ? 'translate-x-5' : 'translate-x-0'}`}></div>
                </label>
              </div>

              <div className="mb-6">
                <label className="block mb-2 text-lg font-bold text-black">Num Images</label>
                <div className="flex items-center">
                  <input
                    type="range"
                    min="1"
                    max="4"
                    value={numImages}
                    className="w-full slider"
                    onChange={(e) => setNumImages(Number(e.target.value))}
                  />
                  <span className="ml-4 text-lg text-black">{numImages}</span>
                </div>
              </div>

              <div className="mb-6 flex items-center">
                <label className="block mb-2 text-lg font-bold text-black mr-4">Enable Safety Checker</label>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only"
                    defaultChecked={safetyChecker}
                    onChange={(e) => setSafetyChecker(e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-300 rounded-full shadow-inner"></div>
                  <div className={`dot absolute w-5 h-5 bg-[#85e178] rounded-full shadow transition ${safetyChecker ? 'translate-x-5' : 'translate-x-0'}`}></div>
                </label>
              </div>

              <div className="mb-6">
                <label className="block mb-2 text-lg font-bold text-black">Output Format</label>
                <select
                  className="p-2 border border-secondary rounded-xl text-lg bg-[#222620] text-[#85e178]"
                  onChange={(e) => setOutputFormat(e.target.value)}
                >
                  <option value="default" selected>
                    Default
                  </option>
                  <option value="jpeg">JPEG</option>
                  <option value="png">PNG</option>
                </select>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full mt-4 p-3 bg-[#222620] text-[#85e178] rounded-2xl font-semibold shadow-lg"
                onClick={handleSubmit}
                disabled={isLoading}
              >
                {isLoading ? 'Generating...' : 'Generate Image'}
              </motion.button>
              <button
                onClick={resetSettings}
                className="w-full mt-4 p-3 bg-[#222620] text-[#85e178] rounded-2xl font-semibold shadow-lg"
              >
                Reset
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-[#85e178] bg-opacity-90 backdrop-blur-sm rounded-3xl shadow-lg p-8 relative overflow-hidden"
          >
            <div className="absolute inset-0 z-0 pointer-events-none opacity-30 bg-noise" aria-hidden="true"></div>
            <div className="relative z-10">
              <h2 className="text-2xl font-semibold mb-4 text-[#222620]">Image Output</h2>
              <div className={`grid ${numImages > 1 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'} gap-4`}>
                {isLoading ? (
                  Array.from({ length: numImages }).map((_, index) => (
                    <div key={index} className="bg-[#222620] rounded-3xl p-4 aspect-square flex items-center justify-center">
                      <div className="w-8 h-8 border-t-2 border-[#85e178] border-solid rounded-full animate-spin"></div>
                    </div>
                  ))
                ) : generatedImages.length > 0 ? (
                  generatedImages.map((imageUrl, index) => (
                    <div key={index} className="bg-[#222620] rounded-3xl p-4 aspect-square flex items-center justify-center relative">
                      <img src={imageUrl} alt={`Generated ${index + 1}`} className="max-w-full max-h-full object-contain" />
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="absolute bottom-4 right-4 p-2 bg-[#85e178] text-[#222620] rounded-full"
                        onClick={() => handleDownload(imageUrl, index)}
                      >
                        <FaDownload size={24} />
                      </motion.button>
                    </div>
                  ))
                ) : error ? (
                  <div className="bg-[#222620] rounded-3xl p-4 aspect-square flex items-center justify-center">
                    <p className="text-red-500">{error}</p>
                  </div>
                ) : (
                  <div className="bg-[#222620] rounded-3xl p-4 aspect-square flex items-center justify-center">
                    <div className="w-16 h-16 border-4 border-[#85e178] border-dashed rounded-full animate-spin-slow"></div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default TextToImagePage
