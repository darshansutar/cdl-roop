'use client'
import { motion } from 'framer-motion'
import { Brain, Image as ImageIcon, Video, Clock } from 'lucide-react'
import LoginButton from './ui/LoginLogoutButton'


export function WelcomePage({ showLoginButton }: { showLoginButton: boolean }) {

  const features = [
    { icon: Brain, title: 'Model Training', description: 'Train custom AI models for your specific needs.' },
    { icon: ImageIcon, title: 'Image Generation', description: 'Generate images using your trained model.' },
    { icon: Video, title: 'Image to Video', description: 'Convert your images into captivating videos.' },
    { icon: Clock, title: 'Quick Training', description: 'Train your model in just 20 minutes.' },
  ]

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#222620] p-8 text-[#85e178]">

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-bold mb-2">Welcome to CDL ROOP</h1>
        <p className="text-xl text-[#85e178] opacity-80">Unleash the power of AI-driven creativity</p>
      </motion.div>

      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="relative w-32 h-32 mb-8"
      >
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <path
            id="curve"
            d="M50,10 a40,40 0 0,1 0,80 a40,40 0 0,1 0,-80"
            fill="none"
            stroke="none"
          />
          <text className="text-gray-200 text-[12px] font-bold uppercase">
            <textPath xlinkHref="#curve">
              CDL ROOP • CDL ROOP • CDL ROOP •
            </textPath>
          </text>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 bg-[#85e178] rounded-full"></div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="bg-[#85e178] bg-opacity-90 backdrop-blur-sm rounded-2xl p-6 flex flex-col items-center text-center text-[#222620]"
          >
            <feature.icon className="w-12 h-12 text-[#222620] mb-4" />
            <h2 className="text-xl font-semibold mb-2">{feature.title}</h2>
            <p className="text-[#222620] opacity-80">{feature.description}</p>
          </motion.div>
        ))}
      </div>
    

      {showLoginButton && <LoginButton />}
    </div>
  )
}