'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { User } from "@supabase/supabase-js";
import { Upload,Package, User as Person, Paintbrush, Box, Type, PawPrint, Utensils, CheckCircle, X, Home, Compass, Camera, Lock, LogOut, Menu, UserCircle, Trash2 } from 'lucide-react'

import { createClient } from "../../utils/supabase/client";

import { ImageToVideoPage } from './ImageToVideoPage'
import UserGreetText from './UserGreetText'
import { WelcomePage } from './WelcomePage'
import LoginButton from './ui/LoginLogoutButton'
import { useRouter } from 'next/navigation'
import { signout } from '@/lib/auth-actions'
const LockedPageOverlay = () => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
    <div className="text-center bg-[#222620] p-8 rounded-lg">
      <Lock className="mx-auto mb-4 text-[#85e178]" size={48} />
      <h2 className="text-2xl font-bold text-[#85e178] mb-4">Login to get into the world of Roop</h2>
      <LoginButton />
    </div>
  </div>
);

const PageWrapper = ({ children, isLocked }: { children: React.ReactNode, isLocked: boolean }) => (
  <div className="relative min-h-full">
    {children}
    {isLocked && <LockedPageOverlay />}
  </div>
);

export function VisionaryTrainingComponent() {
  const [modelName, setModelName] = useState('')
  const [selectedType, setSelectedType] = useState('')
  const [tutorialTab, setTutorialTab] = useState('Person')
  const tutorialTabs = ['Person', 'Product', 'Style', 'Pet']
  const [currentPage, setCurrentPage] = useState('Home')
  const [user, setUser] = useState<User | null>(null);
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const [showLoginButton, setShowLoginButton] = useState(!user);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setShowLoginButton(!user);
    };
    fetchUser();

    const handleLogout = () => {
      setUser(null);
      setCurrentPage('Home');
      setShowLoginButton(true);
    };
    window.addEventListener('userLoggedOut', handleLogout);

    return () => {
      window.removeEventListener('userLoggedOut', handleLogout);
    };
  }, []);

  const typeButtons = [
    { icon: <Person size={24} />, label: 'Man' },
    { icon: <Person size={24} />, label: 'Woman' },
    { icon: <Package size={24} />, label: 'Product' },
    { icon: <Paintbrush size={24} />, label: 'Style' },
    { icon: <Box size={24} />, label: 'Object' },
    { icon: <Type size={24} />, label: 'Text' },
    { icon: <PawPrint size={24} />, label: 'Pet' },
    { icon: <Utensils size={24} />, label: 'Food' },
  ]

  const renderTutorialContent = () => {
    switch (tutorialTab) {
      case 'Person':
        return (
          <div className="space-y-6">
            <div className="bg-[#85e178] bg-opacity-90 backdrop-blur-sm rounded-2xl p-4 relative overflow-hidden">
              <div className="absolute inset-0 z-0 pointer-events-none opacity-30 bg-noise" aria-hidden="true"></div>
              <div className="relative z-10">
                <div className="flex items-start mb-4">
                  <CheckCircle className="text-[#222620] mr-4 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-[#222620] mb-2">Input model name and type</h4>
                    <p className="text-[#222620]">Name your model any name you want, and select the type of subject (Person, Man, Woman)</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div className="bg-[#222620] h-24 rounded-lg"></div>
                  <div className="bg-[#222620] h-24 rounded-lg"></div>
                  <div className="bg-[#222620] h-24 rounded-lg"></div>
                  <div className="bg-[#222620] h-24 rounded-lg"></div>
                </div>
              </div>
            </div>
            <div className="bg-[#85e178] bg-opacity-90 backdrop-blur-sm rounded-2xl p-4 relative overflow-hidden">
              <div className="absolute inset-0 z-0 pointer-events-none opacity-30 bg-noise" aria-hidden="true"></div>
              <div className="relative z-10">
                <div className="flex items-start mb-4">
                  <CheckCircle className="text-[#222620] mr-4 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-[#222620] mb-2">Choose good pictures</h4>
                    <p className="text-[#222620]">5-10 high-quality samples, front facing, square aspect ratio, 1 person in frame, variety</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div className="bg-[#222620] h-24 rounded-lg"></div>
                  <div className="bg-[#222620] h-24 rounded-lg"></div>
                  <div className="bg-[#222620] h-24 rounded-lg"></div>
                  <div className="bg-[#222620] h-24 rounded-lg"></div>
                </div>
              </div>
            </div>
            <div className="bg-[#85e178] bg-opacity-90 backdrop-blur-sm rounded-2xl p-4 relative overflow-hidden">
              <div className="absolute inset-0 z-0 pointer-events-none opacity-30 bg-noise" aria-hidden="true"></div>
              <div className="relative z-10">
                <div className="flex items-start mb-4">
                  <X className="text-[#222620] mr-4 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-[#222620] mb-2">Example of bad pictures</h4>
                    <p className="text-[#222620]">Multiple subjects, face covered, NSFW images, blurry, uncropped, full length</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <div className="bg-[#222620] h-24 rounded-lg"></div>
                  <div className="bg-[#222620] h-24 rounded-lg"></div>
                  <div className="bg-[#222620] h-24 rounded-lg"></div>
                </div>
              </div>
            </div>
            <div className="bg-[#85e178] bg-opacity-90 backdrop-blur-sm rounded-2xl p-4 relative overflow-hidden">
              <div className="absolute inset-0 z-0 pointer-events-none opacity-30 bg-noise" aria-hidden="true"></div>
              <div className="relative z-10">
                <div className="flex items-start">
                  <CheckCircle className="text-[#222620] mr-4 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-[#222620] mb-2">Train your model</h4>
                    <p className="text-[#222620]">Training your model takes ~30 minutes. You can leave the page and come back later.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-[#85e178] bg-opacity-90 backdrop-blur-sm rounded-2xl p-4 relative overflow-hidden">
              <div className="absolute inset-0 z-0 pointer-events-none opacity-30 bg-noise" aria-hidden="true"></div>
              <div className="relative z-10">
                <div className="flex items-start">
                  <CheckCircle className="text-[#222620] mr-4 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-[#222620] mb-2">Generate Images</h4>
                    <p className="text-[#222620]">Once your model is trained, you can generate images using prompts. Make sure to include the subject keyword in your prompts.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      case 'Product':
        return (
          <div className="space-y-6">
            <div className="bg-[#85e178] bg-opacity-90 backdrop-blur-sm rounded-2xl p-4 relative overflow-hidden">
              <div className="absolute inset-0 z-0 pointer-events-none opacity-30 bg-noise" aria-hidden="true"></div>
              <div className="relative z-10">
                <div className="flex items-start mb-4">
                  <CheckCircle className="text-[#222620] mr-4 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-[#222620] mb-2">Input model name and type</h4>
                    <p className="text-[#222620]">Name your model any name you want, and select the type of subject (Product). Training works best for simple products.</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div className="bg-[#222620] h-24 rounded-lg"></div>
                  <div className="bg-[#222620] h-24 rounded-lg"></div>
                  <div className="bg-[#222620] h-24 rounded-lg"></div>
                  <div className="bg-[#222620] h-24 rounded-lg"></div>
                </div>
              </div>
            </div>
            <div className="bg-[#85e178] bg-opacity-90 backdrop-blur-sm rounded-2xl p-4 relative overflow-hidden">
              <div className="absolute inset-0 z-0 pointer-events-none opacity-30 bg-noise" aria-hidden="true"></div>
              <div className="relative z-10">
                <div className="flex items-start mb-4">
                  <CheckCircle className="text-[#222620] mr-4 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-[#222620] mb-2">Choose good pictures</h4>
                    <p className="text-[#222620]">5-10 high-quality samples, front facing, square aspect ratio, 1 product in frame, variety</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div className="bg-[#222620] h-24 rounded-lg"></div>
                  <div className="bg-[#222620] h-24 rounded-lg"></div>
                  <div className="bg-[#222620] h-24 rounded-lg"></div>
                  <div className="bg-[#222620] h-24 rounded-lg"></div>
                </div>
              </div>
            </div>
            <div className="bg-[#85e178] bg-opacity-90 backdrop-blur-sm rounded-2xl p-4 relative overflow-hidden">
              <div className="absolute inset-0 z-0 pointer-events-none opacity-30 bg-noise" aria-hidden="true"></div>
              <div className="relative z-10">
                <div className="flex items-start mb-4">
                  <X className="text-[#222620] mr-4 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-[#222620] mb-2">Example of bad pictures</h4>
                    <p className="text-[#222620]">Side profile, lateral, frontal, cropped poorly, multiple subjects</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div className="bg-[#222620] h-24 rounded-lg"></div>
                  <div className="bg-[#222620] h-24 rounded-lg"></div>
                  <div className="bg-[#222620] h-24 rounded-lg"></div>
                  <div className="bg-[#222620] h-24 rounded-lg"></div>
                </div>
              </div>
            </div>
            <div className="bg-[#85e178] bg-opacity-90 backdrop-blur-sm rounded-2xl p-4 relative overflow-hidden">
              <div className="absolute inset-0 z-0 pointer-events-none opacity-30 bg-noise" aria-hidden="true"></div>
              <div className="relative z-10">
                <div className="flex items-start">
                  <CheckCircle className="text-[#222620] mr-4 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-[#222620] mb-2">Train your model</h4>
                    <p className="text-[#222620]">Training your model takes ~30 minutes. You can leave the page and come back later.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-[#85e178] bg-opacity-90 backdrop-blur-sm rounded-2xl p-4 relative overflow-hidden">
              <div className="absolute inset-0 z-0 pointer-events-none opacity-30 bg-noise" aria-hidden="true"></div>
              <div className="relative z-10">
                <div className="flex items-start">
                  <CheckCircle className="text-[#222620] mr-4 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-[#222620] mb-2">Generate Images</h4>
                    <p className="text-[#222620]">Once your model is trained, you can generate images using prompts. Make sure to include the subject keyword in your prompts.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      case 'Style':
        return (
          <div className="space-y-6">
            <div className="bg-[#85e178] bg-opacity-90 backdrop-blur-sm rounded-2xl p-4 relative overflow-hidden">
              <div className="absolute inset-0 z-0 pointer-events-none opacity-30 bg-noise" aria-hidden="true"></div>
              <div className="relative z-10">
                <div className="flex items-start mb-4">
                  <CheckCircle className="text-[#222620] mr-4 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-[#222620] mb-2">Input model name and type</h4>
                    <p className="text-[#222620]">Name your model any name you want, and select the type of subject (Style)</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div className="bg-[#222620] h-24 rounded-lg"></div>
                  <div className="bg-[#222620] h-24 rounded-lg"></div>
                  <div className="bg-[#222620] h-24 rounded-lg"></div>
                  <div className="bg-[#222620] h-24 rounded-lg"></div>
                </div>
              </div>
            </div>
            <div className="bg-[#85e178] bg-opacity-90 backdrop-blur-sm rounded-2xl p-4 relative overflow-hidden">
              <div className="absolute inset-0 z-0 pointer-events-none opacity-30 bg-noise" aria-hidden="true"></div>
              <div className="relative z-10">
                <div className="flex items-start mb-4">
                  <CheckCircle className="text-[#222620] mr-4 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-[#222620] mb-2">Choose good pictures</h4>
                    <p className="text-[#222620]">5-10 high-quality samples, front facing, square aspect ratio, 1 style in frame, variety</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div className="bg-[#222620] h-24 rounded-lg"></div>
                  <div className="bg-[#222620] h-24 rounded-lg"></div>
                  <div className="bg-[#222620] h-24 rounded-lg"></div>
                  <div className="bg-[#222620] h-24 rounded-lg"></div>
                </div>
              </div>
            </div>
            <div className="bg-[#85e178] bg-opacity-90 backdrop-blur-sm rounded-2xl p-4 relative overflow-hidden">
              <div className="absolute inset-0 z-0 pointer-events-none opacity-30 bg-noise" aria-hidden="true"></div>
              <div className="relative z-10">
                <div className="flex items-start">
                  <CheckCircle className="text-[#222620] mr-4 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-[#222620] mb-2">Train your model</h4>
                    <p className="text-[#222620]">Training your model takes ~30 minutes. You can leave the page and come back later.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-[#85e178] bg-opacity-90 backdrop-blur-sm rounded-2xl p-4 relative overflow-hidden">
              <div className="absolute inset-0 z-0 pointer-events-none opacity-30 bg-noise" aria-hidden="true"></div>
              <div className="relative z-10">
                <div className="flex items-start">
                  <CheckCircle className="text-[#222620] mr-4 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-[#222620] mb-2">Generate Images</h4>
                    <p className="text-[#222620]">Once your model is trained, you can generate images using prompts. Make sure to include the subject keyword in your prompts.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      case 'Pet':
        return (
          <div className="space-y-6">
            <div className="bg-[#85e178] bg-opacity-90 backdrop-blur-sm rounded-2xl p-4 relative overflow-hidden">
              <div className="absolute inset-0 z-0 pointer-events-none opacity-30 bg-noise" aria-hidden="true"></div>
              <div className="relative z-10">
                <div className="flex items-start mb-4">
                  <CheckCircle className="text-[#222620] mr-4 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-[#222620] mb-2">Input model name and type</h4>
                    <p className="text-[#222620]">Name your model any name you want, and select the type of subject (Dog, Cat, Animal)</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div className="bg-[#222620] h-24 rounded-lg"></div>
                  <div className="bg-[#222620] h-24 rounded-lg"></div>
                  <div className="bg-[#222620] h-24 rounded-lg"></div>
                  <div className="bg-[#222620] h-24 rounded-lg"></div>
                </div>
              </div>
            </div>
            <div className="bg-[#85e178] bg-opacity-90 backdrop-blur-sm rounded-2xl p-4 relative overflow-hidden">
              <div className="absolute inset-0 z-0 pointer-events-none opacity-30 bg-noise" aria-hidden="true"></div>
              <div className="relative z-10">
                <div className="flex items-start mb-4">
                  <CheckCircle className="text-[#222620] mr-4 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-[#222620] mb-2">Choose good pictures</h4>
                    <p className="text-[#222620]">5-10 high-quality samples, front facing, square aspect ratio, 1 pet in frame, variety</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <div className="bg-[#222620] h-24 rounded-lg"></div>
                  <div className="bg-[#222620] h-24 rounded-lg"></div>
                  <div className="bg-[#222620] h-24 rounded-lg"></div>
                </div>
              </div>
            </div>
            <div className="bg-[#85e178] bg-opacity-90 backdrop-blur-sm rounded-2xl p-4 relative overflow-hidden">
              <div className="absolute inset-0 z-0 pointer-events-none opacity-30 bg-noise" aria-hidden="true"></div>
              <div className="relative z-10">
                <div className="flex items-start">
                  <CheckCircle className="text-[#222620] mr-4 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-[#222620] mb-2">Train your model</h4>
                    <p className="text-[#222620]">Training your model takes ~30 minutes. You can leave the page and come back later.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-[#85e178] bg-opacity-90 backdrop-blur-sm rounded-2xl p-4 relative overflow-hidden">
              <div className="absolute inset-0 z-0 pointer-events-none opacity-30 bg-noise" aria-hidden="true"></div>
              <div className="relative z-10">
                <div className="flex items-start">
                  <CheckCircle className="text-[#222620] mr-4 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-[#222620] mb-2">Generate Images</h4>
                    <p className="text-[#222620]">Once your model is trained, you can generate images using prompts. Make sure to include the subject keyword in your prompts.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      default:
        return (
          <div className="bg-[#85e178] bg-opacity-90 backdrop-blur-sm rounded-2xl p-4 relative overflow-hidden">
            <div className="absolute inset-0 z-0 pointer-events-none opacity-30 bg-noise" aria-hidden="true"></div>
            <div className="relative z-10">
              <p className="text-[#222620]">Select a tab to view the tutorial content.</p>
            </div>
          </div>
        )
    }
  }

  const HeaderOption = ({ icon: Icon, label }: { icon: React.ElementType; label: string }) => {
    return (
      <motion.button
        className={`flex items-center transition-colors relative px-3 py-2 ${
          currentPage === label ? 'text-white' : 'text-[#222620] hover:text-white'
        }`}
        onClick={() => {
          setCurrentPage(label)
          setIsMenuOpen(false)
        }}
        whileHover="hover"
      >
        <Icon size={20} className="mr-2" />
        <span>{label}</span>
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#222620]"
          initial={{ scaleX: 0 }}
          variants={{
            hover: { scaleX: 1 },
          }}
          transition={{ duration: 0.2 }}
        />
        {currentPage === label && (
          <motion.div
            className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#222620]"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </motion.button>
    );
  };

  const renderPageContent = () => {
    const content = () => {
      switch (currentPage) {
        case 'Home':
          return (
            <>
              <WelcomePage showLoginButton={showLoginButton} />
            </>
          )
        case 'Discover':
          return (
            <div className="h-full overflow-y-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center py-12 px-4"
              >
                <h2 className="text-4xl font-bold mb-8">Discover</h2>
                <p className="text-xl text-[#85e178] opacity-80 mb-12">Your AI Model Gallery</p>
                
                <div className="max-w-4xl mx-auto mb-12">
                  <p className="text-[#85e178] opacity-80 mb-8">
                    This is where your trained AI models will be saved. Create new models and access them easily from this gallery.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                  {[1, 2, 3, 4, 5, 6].map((index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="bg-[#85e178] bg-opacity-20 backdrop-blur-sm rounded-2xl p-6 flex flex-col items-center"
                    >
                      <div className="w-full h-48 bg-[#222620] rounded-lg mb-4 flex items-center justify-center">
                        <Camera size={48} className="text-[#85e178] opacity-50" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">Model {index}</h3>
                      <p className="text-[#85e178] opacity-80 text-sm">
                        Your trained model description will appear here.
                      </p>
                    </motion.div>
                  ))}
                </div>
                
                <p className="mt-12 text-center max-w-md mx-auto text-[#85e178] opacity-80">
                  Start creating your AI models now and see them populate this gallery!
                </p>
              </motion.div>
            </div>
          )
        case 'New Model':
          return (
            <div className="h-full overflow-auto">
              <>
                <h2 className="text-4xl font-bold mb-8 text-center">Create a New Model</h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <section className="bg-[#85e178] bg-opacity-90 backdrop-blur-sm rounded-2xl p-8 text-[#222620] w-full max-w-2xl mx-auto">
                    <h3 className="text-2xl font-semibold mb-6">Model Details</h3>
                    
                    <div className="mb-6">
                      <label htmlFor="modelName" className="block mb-2 text-lg font-bold">Model Name</label>
                      <input
                        type="text"
                        id="modelName"
                        value={modelName}
                        onChange={(e) => setModelName(e.target.value)}
                        className="w-full px-4 py-3 bg-[#222620] text-[#85e178] rounded-xl text-lg"
                        placeholder="Enter model name"
                      />
                    </div>

                    <div className="mb-6">
                      <label className="block mb-2 text-lg font-bold">Select Type</label>
                      <div className="grid grid-cols-2 gap-3">
                        {typeButtons.map((button) => (
                          <button
                            key={button.label}
                            onClick={() => setSelectedType(button.label)}
                            className={`flex items-center justify-center p-4 rounded-lg h-24 transition-colors duration-200 ${
                              selectedType === button.label
                                ? 'bg-[#222620] text-[#85e178]'
                                : 'bg-[#85e178] text-[#222620]'
                            }`}
                          >
                            <div className="flex flex-col items-center">
                              {button.icon}
                              <span className="mt-2 text-base">{button.label}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="mb-6">
                      <h3 className="text-lg font-semibold mb-2">Upload Images</h3>
                      <label htmlFor="imageUpload" className="block">
                        <div className="border-2 border-dashed border-[#222620] rounded-lg p-4 text-center cursor-pointer bg-[#a1e99b] flex flex-col items-center justify-center min-h-[200px]">
                          {uploadedImages.length === 0 ? (
                            <>
                              <Upload size={40} className="text-[#222620] mb-3" />
                              <p className="text-[#222620] text-lg">
                                Drag 'n' drop images here, or click to select
                              </p>
                            </>
                          ) : (
                            <div className="grid grid-cols-3 gap-4 w-full">
                              {uploadedImages.map((image, index) => (
                                <div key={index} className="relative">
                                  <img
                                    src={URL.createObjectURL(image)}
                                    alt={`Uploaded ${index + 1}`}
                                    className="w-full h-24 object-cover rounded-lg"
                                  />
                                  <button
                                    onClick={(e) => {
                                      e.preventDefault();
                                      handleImageDelete(index);
                                    }}
                                    className="absolute top-1 right-1 bg-[#222620] text-[#85e178] p-1 rounded-full"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                              ))}
                              {uploadedImages.length < 20 && (
                                <div className="flex items-center justify-center h-24 bg-[#222620] text-[#85e178] rounded-lg">
                                  <Upload size={24} />
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </label>
                      <input
                        id="imageUpload"
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </div>

                    <button
                      
                      className="w-full font-semibold py-4 rounded-xl bg-[#222620] text-[#85e178] text-xl mb-6"
                    >
                      Start Training
                    </button>

                    <div className="bg-[#a1e99b] rounded-xl p-6 text-[#222620]">
                      <h4 className="text-lg font-semibold mb-3">Important Details & Tips</h4>
                      
                      <ul className="list-disc pl-5 space-y-2 mb-4">
                        <li>Training usually takes between 20 to 40 minutes.</li>
                        <li>When your model is ready, we&apos;ll send you an email.</li>
                        <li>No nudes / NSFW images allowed.</li>
                      </ul>

                      <h5 className="font-semibold mb-2">Tips for Better Results:</h5>
                      <ul className="list-disc pl-5 space-y-2">
                        <li><strong>Use Square Samples:</strong> For the best results, upload images with a 1:1 aspect ratio (square).</li>
                        <li><strong>Use Multiple Zoom Levels:</strong> Upload 10-20 high-quality photos of the person, object, or style you want to train on. If training on a person, we recommend using 10 close-ups (face only), 5 mid-shots (from the chest up), and 3 full-body shots.</li>
                        <li><strong>Add Variety:</strong> Change up poses, backgrounds, and where the subject is looking. This makes your model better.</li>
                        <li>You&apos;ll be more likely to get a good model by uploading high quality samples.</li>
                      </ul>

                      <p className="mt-4 italic">Keep in mind there is no single best way to train a great model, it may take some experimentation to get the results.</p>
                    </div>

                  </section>

                  <section className="bg-[#85e178] bg-opacity-90 backdrop-blur-sm rounded-2xl p-8 text-[#222620] w-full max-w-2xl mx-auto">
                    <h3 className="text-2xl font-semibold mb-6">Tutorial</h3>
                    <div className="flex mb-4 space-x-2">
                      {tutorialTabs.map((tab) => (
                        <button
                          key={tab}
                          onClick={() => setTutorialTab(tab)}
                          className={`px-4 py-2 ${
                            tutorialTab === tab 
                              ? 'bg-[#222620] text-[#85e178]' 
                              : 'bg-[#a1e99b] text-[#222620] hover:bg-[#90d88a]'
                          } transition-colors duration-200`}
                        >
                          {tab}
                        </button>
                      ))}
                    </div>
                    {renderTutorialContent()}
                  </section>
                </div>
              </>
            </div>
          )
        case 'Image to Video':
          return (
            <div className="h-full overflow-auto">
              <ImageToVideoPage />
            </div>
          )
        default:
          return <WelcomePage showLoginButton={showLoginButton} />
      }
    };

    if (currentPage === 'Discover' || currentPage === 'New Model' || currentPage === 'Image to Video') {
      return (
        <PageWrapper isLocked={!user}>
          {content()}
        </PageWrapper>
      );
    }

    return content();
  }

  const handleLogout = async () => {
    setIsLoading(true);
    await signout();
    setUser(null);
    setIsLoading(false);
    setCurrentPage('Home');
    setShowLoginButton(true);
    
    // Dispatch a custom event to notify other components
    window.dispatchEvent(new Event('userLoggedOut'));
    
    // Redirect to the home page
    router.push('/');
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newImages = Array.from(event.target.files);
      setUploadedImages(prevImages => [...prevImages, ...newImages]);
    }
  };

  const handleImageDelete = (index: number) => {
    setUploadedImages(prevImages => prevImages.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-[#222620] text-[#85e178] flex flex-col">
      <header className="sticky top-0 z-50 bg-[#85e178] text-[#222620] p-4 shadow-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="relative w-12 h-12 md:w-16 md:h-16"
            >
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <path
                  id="curve"
                  d="M50,10 a40,40 0 0,1 0,80 a40,40 0 0,1 0,-80"
                  fill="none"
                  stroke="none"
                />
                <text className="text-[#222620] text-[12px] font-bold uppercase">
                  <textPath xlinkHref="#curve">
                    CDL ROOP • CDL ROOP • CDL ROOP •
                  </textPath>
                </text>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-6 h-6 md:w-8 md:h-8 bg-[#222620] rounded-full"></div>
              </div>
            </motion.div>
            <h1 className="text-xl md:text-2xl font-bold">CDL ROOP</h1>
          </div>
          <nav className="hidden md:block">
            <ul className="flex items-center">
              <li><HeaderOption icon={Home} label="Home" /></li>
              <li><HeaderOption icon={Compass} label="Discover" /></li>
              <li><HeaderOption icon={Box} label="New Model" /></li>
              <li><HeaderOption icon={Camera} label="Image to Video" /></li>
            </ul>
          </nav>
          <div className="flex items-center space-x-4">
            <div className="hidden md:block">
              <UserGreetText />
            </div>
            {user ? (
              <button
                onClick={handleLogout}
                disabled={isLoading}
                className="text-[#222620] hover:text-white transition-colors"
              >
                {isLoading ? (
                  <span className="spinner"></span>
                ) : (
                  <LogOut size={24} />
                )}
              </button>
            ) : (
              <>
                <div className="hidden md:block">
                  {/* <LoginButton /> */}
                </div>
                <div className="md:hidden">
                  <UserCircle size={24} className="text-[#222620]" />
                </div>
              </>
            )}
            <button
              className="md:hidden text-[#222620] hover:text-white transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-[#85e178] text-[#222620] p-4">
          <nav>
            <ul className="space-y-2">
              <li><HeaderOption icon={Home} label="Home" /></li>
              <li><HeaderOption icon={Compass} label="Discover" /></li>
              <li><HeaderOption icon={Box} label="New Model" /></li>
              <li><HeaderOption icon={Camera} label="Image to Video" /></li>
            </ul>
          </nav>
          {!user && (
            <div className="mt-4">
              {/* <LoginButton /> */}
            </div>
          )}
        </div>
      )}

      <main className="flex-grow flex justify-center relative">
        <div className="w-full max-w-7xl">
          {renderPageContent()}
        </div>
      </main>
    </div>
  )
}
