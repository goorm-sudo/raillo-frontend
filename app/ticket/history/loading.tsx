import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col">
      <Header />
      <div className="flex-1 container mx-auto px-4 py-16 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">결제 내역을 불러오고 있습니다...</p>
      </div>
      <Footer />
    </div>
  )
}