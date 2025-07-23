interface AppLayoutProps {
  navigation: React.ReactNode
  sideNavigation: React.ReactNode
  children: React.ReactNode
}

export function AppLayout({ children, navigation, sideNavigation }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      {navigation}
      
      {/* Main Content with Side Navigation */}
      <div className="flex">
        {/* Side Navigation */}
        {sideNavigation}
        
        {/* Main Content Area */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
} 