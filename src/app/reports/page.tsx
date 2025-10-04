import { ReportsPanel } from '@/components/ReportsPanel'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default function ReportsPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        <div className="mb-6">
          <Button variant="outline" asChild>
            <a href="/" className="inline-flex items-center">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Timer
            </a>
          </Button>
        </div>
        <ReportsPanel />
      </div>
    </main>
  )
}