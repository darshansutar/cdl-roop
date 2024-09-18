'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Upload, Play } from 'lucide-react'

export function ImageToVideoPage() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="min-h-screen bg-[#222620] relative p-8">
      <div className="absolute inset-0 z-0 pointer-events-none opacity-50 bg-noise" aria-hidden="true"></div>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-[#85e178] mb-8 text-center">Image to Video Conversion</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Image Upload Placeholder */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-[#85e178] bg-opacity-90 backdrop-blur-sm rounded-3xl shadow-lg p-8 relative overflow-hidden"
          >
            <div className="absolute inset-0 z-0 pointer-events-none opacity-30 bg-noise" aria-hidden="true"></div>
            <div className="relative z-10">
              <h2 className="text-2xl font-semibold mb-4 text-[#222620]">Upload Image</h2>
              <div className="border-2 border-dashed border-[#222620] rounded-3xl p-8 text-center bg-[#222620] bg-opacity-20 relative">
                {uploadedImage ? (
                  <img src={uploadedImage} alt="Uploaded" className="max-w-full h-auto mx-auto rounded-2xl" />
                ) : (
                  <>
                    <Upload size={48} className="mx-auto mb-4 text-[#222620]" />
                    <p className="text-[#222620]">Drag image here, or click to select.</p>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full mt-4 p-3 bg-[#222620] text-[#85e178] rounded-2xl font-semibold shadow-lg"
              >
                Process Image
              </motion.button>
            </div>
          </motion.div>

          {/* Video Output Placeholder */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-[#85e178] bg-opacity-90 backdrop-blur-sm rounded-3xl shadow-lg p-8 relative overflow-hidden"
          >
            <div className="absolute inset-0 z-0 pointer-events-none opacity-30 bg-noise" aria-hidden="true"></div>
            <div className="relative z-10">
              <h2 className="text-2xl font-semibold mb-4 text-[#222620]">Video Output</h2>
              <div className="bg-[#222620] rounded-3xl p-4 aspect-video flex items-center justify-center">
                <Play size={64} className="text-[#85e178] opacity-50" />
              </div>
              <p className="mt-4 text-[#222620] text-center">
                Your processed video will appear here.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}