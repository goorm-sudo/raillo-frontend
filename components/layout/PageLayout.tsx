import { ReactNode } from "react"
import Header from "./Header"
import Footer from "./Footer"

interface PageLayoutProps {
  children: ReactNode
  className?: string
}

export default function PageLayout({ children, className = "" }: PageLayoutProps) {
  return (
    <div className={`min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col ${className}`}>
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  )
} 