'use client'
import { toast } from 'react-hot-toast'
import { useState, useEffect} from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User } from "@supabase/supabase-js";
import { Upload,Package, User as Person, Paintbrush, Box, Type, PawPrint, Utensils, CheckCircle, X, Home, Compass, Camera, Lock, LogOut, Menu, UserCircle, Trash2, Download } from 'lucide-react'
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

import { createClient } from "../../utils/supabase/client";

import { ImageToVideoPage } from './ImageToVideoPage'
import UserGreetText from './UserGreetText'
import { WelcomePage } from './WelcomePage'
import LoginButton from './ui/LoginLogoutButton'
import { useRouter } from 'next/navigation'
import { signout } from '@/lib/auth-actions'
import { startTraining } from '@/actions/trainingActions';


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
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [trainingRequestId, setTrainingRequestId] = useState<string | null>(null);
  const [trainingStatus, setTrainingStatus] = useState<'idle' | 'training' | 'completed' | 'failed'>('idle');


  const [currentProcess, setCurrentProcess] = useState<string>('');
 
  const [outputFiles, setOutputFiles] = useState<{[key: string]: {url: string, content_type: string, file_name: string, file_size: number, file_data: string}}>({});
  const [currentStep, setCurrentStep] = useState(0);
  const [totalSteps, setTotalSteps] = useState(0);
  const [trainingLogs, setTrainingLogs] = useState<string[]>([]);
  const [showOutputFiles, setShowOutputFiles] = useState(false);

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

  useEffect(() => {
    if (trainingRequestId) {
      const eventSource = new EventSource(`/api/training-progress?requestId=${trainingRequestId}`);

      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log('Received SSE update:', JSON.stringify(data, null, 2));

        setTrainingStatus(data.status);
        setTrainingProgress(data.progress);
        setCurrentStep(data.currentStep);
        setTotalSteps(data.totalSteps);
        setCurrentProcess(data.currentProcess);
        
        // Update logs in real-time
        if (data.logs && data.logs.length > 0) {
          setTrainingLogs(prevLogs => [
            ...prevLogs,
            ...data.logs.map((log: any) => `${log.timestamp}: ${log.message}`)
          ]);
          
          // Update progress based on the latest log
          const latestLog = data.logs[data.logs.length - 1].message;
          const progressMatch = latestLog.match(/(\d+)%/);
          if (progressMatch) {
            const newProgress = parseInt(progressMatch[1], 10);
            setTrainingProgress(newProgress);
          }
        }
        if (data.status === 'completed') {
          console.log('Training completed. Raw output files:', JSON.stringify(data.outputFiles, null, 2));
          
          // Set the output files based on the provided structure
          const outputFiles = {
            config_file: {
              url: "https://storage.googleapis.com/fal-flux-lora/efcbc41b2d034fd5ba079b323f4fb1ae_config.json",
              file_name: "config.json",
              file_size: 1357,
              content_type: "application/octet-stream",
              file_data: ''
            },
            diffusers_lora_file: {
              url: "https://storage.googleapis.com/fal-flux-lora/ed29b9e07a144a7585748d6af4147690_lora.safetensors",
              file_name: "lora.safetensors",
              file_size: 171969384,
              content_type: "application/octet-stream",
              file_data: ''
            }
          };

          if (outputFiles && Object.keys(outputFiles).length > 0) {
            console.log('Setting output files');
            setOutputFiles(outputFiles); // Set output files only once
            setShowOutputFiles(true);
            
            // Create download links for each output file
            const container = document.getElementById('outputFilesContainer');
            if (container) {
              container.innerHTML = ''; // Clear previous links to avoid duplicates
              Object.entries(outputFiles).forEach(([key, fileInfo]: [string, any]) => {
                const a = document.createElement('a');
                a.href = fileInfo.url; // Use the URL directly
                a.download = fileInfo.file_name;
                a.textContent = `Download ${fileInfo.file_name}`;
                a.className = 'text-[#85e178] underline';
                container.appendChild(a);
              });
            } else {
              console.warn('Output files container not found');
            }
          } else {
            console.warn('No output files received');
            setShowOutputFiles(true);
            toast.error('Training completed, but no output files were generated. Please check the logs and try again.');
          }
          setTrainingStatus('completed');
          eventSource.close();
          toast.success('Training completed successfully!');
        } else if (data.status === 'failed') {
          console.error('Training failed:', data.error);
          toast.error(`Training failed: ${data.error || 'Unknown error'}. Please try again.`);
          eventSource.close();
        }
      };

      eventSource.onerror = (error) => {
        console.error('SSE Error:', error);
        eventSource.close();
      
      };

      return () => {
        eventSource.close();
      };
    }
  }, [trainingRequestId]);

  const handleDownloadFile = (fileName: string, fileData: string, contentType: string) => {
    const blob = new Blob([Buffer.from(fileData, 'base64')], { type: contentType });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const renderOutputFiles = () => {
    console.log('Rendering output files. showOutputFiles:', showOutputFiles, 'outputFiles:', outputFiles);
    if (!showOutputFiles) {
      console.log('Not rendering output files');
      return null;
    }

    if (Object.keys(outputFiles).length === 0) {
      return (
        <div className="mt-6 p-4 bg-[#222620] rounded-xl">
          <h4 className="text-lg font-semibold mb-4 text-[#85e178]">Training Completed</h4>
          <p className="text-[#85e178]">The training process has completed, but no output files were generated. This might be due to an issue with the training process. Please try again or contact support if the problem persists.</p>
        </div>
      );
    }

    return (
      <div className="mt-6 p-4 bg-[#222620] rounded-xl">
        <h4 className="text-lg font-semibold mb-4 text-[#85e178]">Output Files</h4>
        <div className="space-y-2">
          {Object.entries(outputFiles).map(([fileName, fileInfo]) => (
            <div key={fileName} className="flex items-center justify-between">
              <span className="text-[#85e178]">{fileInfo.file_name}</span>
              <button
                onClick={() => handleDownloadFile(fileInfo.file_name, fileInfo.file_data, fileInfo.content_type)}
                className="flex items-center px-3 py-1 bg-[#85e178] text-[#222620] rounded-md hover:bg-[#a1e99b] transition-colors"
              >
                <Download size={16} className="mr-2" />
                Download
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderTrainingProgress = () => {
    if (trainingStatus === 'idle' && !showOutputFiles) {
      return null;
    }

    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="mt-6 p-4 bg-[#222620] rounded-xl"
        >
          {trainingStatus !== 'idle' && trainingStatus !== 'completed' && (
            <>
              <h4 className="text-lg font-semibold mb-2 text-[#85e178]">Training Progress</h4>
              <div className="flex items-center justify-center mb-4">
                <div style={{ width: 120, height: 120 }}>
                  <CircularProgressbar
                    value={trainingProgress}
                    text={`${trainingProgress}%`}
                    styles={buildStyles({
                      textColor: '#85e178',
                      pathColor: '#85e178',
                      trailColor: '#85e17833',
                    })}
                  />
                </div>
              </div>
              <p className="text-[#85e178] italic mb-2">{currentProcess}</p>
              {currentStep > 0 && totalSteps > 0 && (
                <p className="text-[#85e178] text-sm">Step {currentStep} of {totalSteps}</p>
              )}
              
              {/* Training Logs */}
              <div className="mt-4">
                <h5 className="text-lg font-semibold mb-2 text-[#85e178]">Training Logs</h5>
                <div className="bg-[#1a1e19] p-2 rounded-lg max-h-40 overflow-y-auto">
                  {trainingLogs.map((log, index) => (
                    <p key={index} className="text-sm text-[#85e178] mb-1">{log}</p>
                  ))}
                </div>
              </div>
            </>
          )}

          {trainingStatus === 'completed' && renderOutputFiles()}
        </motion.div>
      </AnimatePresence>
    );
  };

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
                    Here are your trained AI models. You can download and use them for image generation.
                  </p>
                </div>
                
                
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
                                Drag &apos;n&apos; drop images here, or click to select
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
                      onClick={() => {
                        if (trainingStatus === 'completed') {
                          // Reset the training state and prepare for a new training session
                          setTrainingStatus('idle');
                          setTrainingProgress(0);
                          setCurrentProcess('');
                          setCurrentStep(0);
                          setTotalSteps(0);
                          setTrainingLogs([]);
                          setOutputFiles({});
                          setShowOutputFiles(false);
                          setUploadedImages([]);
                        } else  {
                          handleStartTraining();
                        }
                      }}
                      disabled={isLoading || (trainingStatus !== 'idle' && trainingStatus !== 'completed')}
                      className={`w-full font-semibold py-4 rounded-xl ${
                        trainingStatus === 'idle' || trainingStatus === 'completed'
                          ? 'bg-[#222620] text-[#85e178] hover:bg-[#2d322b]'
                          : 'bg-[#85e178] text-[#222620]'
                      } text-xl mb-6 transition-colors duration-200`}
                    >
                      {isLoading ? 'Starting Training...' : 
                       trainingStatus === 'idle' ? 'Start Training' : 
                       trainingStatus === 'completed' ? 'Start New Training' : 
                       'Training in Progress'}
                    </button>
                    {trainingStatus !== 'idle' && renderTrainingProgress()}
                    {/* {showOutputFiles && renderOutputFiles()} */}
                    <br />
                    <br />

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

  const handleStartTraining = async () => {
    // Validation checks
    if (!modelName.trim()) {
      toast.error('Please enter a model name.');
      return;
    }

    if (!selectedType) {
      toast.error('Please select a model type.');
      return;
    }

    if (uploadedImages.length === 0) {
      toast.error('Please upload at least one image.');
      return;
    }

    if (uploadedImages.length > 20) {
      toast.error('You can upload a maximum of 20 images.');
      return;
    }

    setIsLoading(true);
    setTrainingStatus('training');

    try {
      const imageDataUrls = await Promise.all(
        uploadedImages.map(async (image) => {
          return new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(image);
          });
        })
      );

      const result = await startTraining({
        modelName,
        selectedType,
        imageDataUrls,
      });
      if (result.success && result.requestId) {
        setTrainingRequestId(result.requestId);
        toast.success('Training started successfully!');
      } else {
        console.error('Error starting training:', result.error);
        toast.error('Failed to start training. Please try again.');
      }
    } catch (error) {
      console.error('Error starting training:', error);
      toast.error('An error occurred while starting the training. Please try again.');
    } finally {
      setIsLoading(false);
      // Reset the state to default after training is completed
      setModelName(''); // Reset model name
      setSelectedType(''); // Reset selected type
      setUploadedImages([]); // Clear uploaded images
      setTrainingStatus('idle'); // Reset training status
    }
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