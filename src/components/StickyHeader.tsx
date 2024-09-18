import { UserCircle} from 'lucide-react'
import LoginLogoutButton from './ui/LoginLogoutButton'

interface StickyHeaderProps {
  isLoggedIn: boolean
}

export function StickyHeader({ isLoggedIn }: StickyHeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 bg-[#222620] bg-opacity-80 backdrop-blur-sm z-50 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-[#85e178] text-2xl font-bold">CDL ROOP</div>
        {isLoggedIn ? (
          <div className="flex items-center space-x-4">
            <UserCircle className="w-8 h-8 text-[#85e178]" />
            <LoginLogoutButton />
          </div>
        ) : null}
      </div>
    </header>
  )
}