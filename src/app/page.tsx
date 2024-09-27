import { VisionaryTrainingComponent } from '../components/visionary-training'
import { GrainOverlay } from '../components/GrainOverlay'
import TextToImagePage from '../components/TextToImagePage'

export default function Home() {
  return (
    <>
      <GrainOverlay />
      <VisionaryTrainingComponent />
      {/* <TextToImagePage /> */}
    </>
  )
}
