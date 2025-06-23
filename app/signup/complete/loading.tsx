import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Train, Home, Printer } from "lucide-react"

export default function SignupCompleteLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Train className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-blue-600">RAIL-O</h1>
            </div>
            <nav className="hidden md:flex items-center space-x-6">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-12" />
            </nav>
          </div>
        </div>
      </header>

      {/* Page Header */}
      <div className="bg-blue-500 text-white py-6">
        <div className="container mx-auto px-4">
          <Skeleton className="h-8 w-32 mx-auto bg-blue-400" />
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Home className="h-4 w-4 text-gray-400" />
              <Skeleton className="h-4 w-8" />
              <span>/</span>
              <Skeleton className="h-4 w-20" />
            </div>
            <div className="flex items-center space-x-1">
              <Printer className="h-4 w-4 text-gray-400" />
              <Skeleton className="h-4 w-8" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <Card className="bg-white shadow-lg border-0">
            <CardContent className="p-12 text-center">
              {/* Success Icon */}
              <div className="mb-8">
                <Skeleton className="mx-auto w-24 h-24 rounded-full" />
              </div>

              {/* Success Message */}
              <div className="mb-8">
                <Skeleton className="h-8 w-80 mx-auto mb-4" />
                <Skeleton className="h-6 w-64 mx-auto" />
              </div>

              {/* Divider */}
              <Skeleton className="w-16 h-1 mx-auto mb-8" />

              {/* Member Number */}
              <div className="mb-8">
                <Skeleton className="h-6 w-48 mx-auto mb-4" />
                <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6">
                  <Skeleton className="h-10 w-32 mx-auto" />
                </div>
                <Skeleton className="h-4 w-56 mx-auto mt-2" />
              </div>

              {/* Welcome Benefits */}
              <div className="bg-gray-50 rounded-lg p-6 mb-8">
                <Skeleton className="h-6 w-24 mx-auto mb-4" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-4 w-32" />
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4">
                <Skeleton className="w-full h-12" />
                <div className="flex flex-col sm:flex-row gap-3">
                  <Skeleton className="flex-1 h-10" />
                  <Skeleton className="flex-1 h-10" />
                </div>
              </div>

              {/* Additional Info */}
              <div className="mt-8">
                <Skeleton className="h-16 w-full" />
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
