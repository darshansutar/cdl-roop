import Link from 'next/link'

export function Header() {
  return (
    <header className="bg-white dark:bg-gray-800 shadow-md">
      <nav className="container mx-auto px-6 py-3">
        <div className="flex justify-between items-center">
          <div className="text-xl font-semibold text-gray-800 dark:text-white">
            Your Logo
          </div>
          <div>
            {/* Add other navigation items here */}
            <Link 
              href="/login" 
              className="text-gray-800 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2"
            >
              Login
            </Link>
          </div>
        </div>
      </nav>
    </header>
  )
}