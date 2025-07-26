import * as React from "react"

// Create context outside component so it can be used by all children
const TabsContext = React.createContext<{
  activeTab: string
  setActiveTab: (value: string) => void
}>({
  activeTab: '',
  setActiveTab: () => {}
})

interface TabsProps {
  children: React.ReactNode
  defaultValue?: string
  className?: string
}

const Tabs = ({ children, defaultValue, className }: TabsProps) => {
  const [activeTab, setActiveTab] = React.useState(defaultValue || '')

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  )
}

interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

const TabsList = React.forwardRef<HTMLDivElement, TabsListProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={`flex space-x-1 bg-white border rounded-lg p-1 ${className || ''}`}
      {...props}
    >
      {children}
    </div>
  )
)
TabsList.displayName = "TabsList"

interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value?: string
}

const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ className, children, value, onClick, ...props }, ref) => {
    const { activeTab, setActiveTab } = React.useContext(TabsContext)
    const isActive = activeTab === value

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (value) {
        setActiveTab(value)
      }
      onClick?.(e)
    }

    return (
      <button
        ref={ref}
        className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
          isActive 
            ? 'bg-blue-600 text-white' 
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
        } ${className || ''}`}
        onClick={handleClick}
        {...props}
      >
        {children}
      </button>
    )
  }
)
TabsTrigger.displayName = "TabsTrigger"

interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string
}

const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
  ({ className, children, value, ...props }, ref) => {
    const { activeTab } = React.useContext(TabsContext)
    const isActive = activeTab === value

    if (!isActive) {
      return null
    }

    return (
      <div ref={ref} className={className} {...props}>
        {children}
      </div>
    )
  }
)
TabsContent.displayName = "TabsContent"

export { Tabs, TabsList, TabsTrigger, TabsContent } 