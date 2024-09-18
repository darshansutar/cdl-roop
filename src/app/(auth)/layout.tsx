import { GrainOverlay } from "@/components/GrainOverlay";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#222620] flex flex-col">
      <GrainOverlay />
      {children}
    </div>
  )
}