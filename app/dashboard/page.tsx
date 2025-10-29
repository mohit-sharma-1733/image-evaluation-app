"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Sidebar } from "@/components/sidebar"
import { ThemeToggle } from "@/components/theme-toggle"
import { getScoreColor, formatDate } from "@/lib/utils"

interface Prompt {
  _id: string
  imagePath: string
  prompt: string
  llmModel: string
  channel: string
  timestamp: string
  mediaType: string
  user: {
    userName: string
  }
  brand: {
    brandName: string
    colors: string
  }
  evaluation: {
    finalScore: number
    agents: {
      sizeComplianceAgent: { score: number; reasoning: string }
      subjectAdherenceAgent: { score: number; reasoning: string }
      creativityAgent: { score: number; reasoning: string }
      moodConsistencyAgent: { score: number; reasoning: string }
    }
  } | null
}

export default function DashboardPage() {
  const router = useRouter()
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [loading, setLoading] = useState(true)
  const [evaluating, setEvaluating] = useState<string | null>(null)
  const [filter, setFilter] = useState({ channel: "", brandId: "" })
  const [sortBy, setSortBy] = useState("date")
  const [sidebarOpen, setSidebarOpen] = useState(false) // Start closed on mobile, will be open on desktop via CSS
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  // Set sidebar open on desktop by default
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) { // lg breakpoint
        setSidebarOpen(true)
      } else {
        setSidebarOpen(false)
      }
    }
    
    // Set initial state
    handleResize()
    
    // Listen for resize
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    fetchPrompts()
  }, [filter, sortBy])

  const fetchPrompts = async () => {
    try {
      const params = new URLSearchParams()
      if (filter.channel) params.append("channel", filter.channel)
      if (filter.brandId) params.append("brandId", filter.brandId)
      params.append("sortBy", sortBy)

      const response = await fetch(`/api/prompts?${params}`)
      const data = await response.json()

      if (data.success) {
        setPrompts(data.data)
      }
    } catch (error) {
      console.error("Error fetching prompts:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleEvaluate = async (promptId: string) => {
    setEvaluating(promptId)
    try {
      const response = await fetch("/api/evaluations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ promptId }),
      })

      const data = await response.json()

      if (data.success) {
        // Fetch updated prompts
        await fetchPrompts()
        
        // If modal is open, fetch and update the selected prompt with new evaluation
        if (selectedPrompt?._id === promptId) {
          const promptResponse = await fetch(`/api/prompts?_id=${promptId}`)
          const promptData = await promptResponse.json()
          if (promptData.success && promptData.data.length > 0) {
            setSelectedPrompt(promptData.data[0])
          }
        }
      }
    } catch (error) {
      console.error("Error evaluating:", error)
    } finally {
      setEvaluating(null)
    }
  }

  const handleCardClick = (prompt: Prompt) => {
    setSelectedPrompt(prompt)
    setDialogOpen(true)
  }

  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" })
    router.push("/login")
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Collapsible on desktop, overlay on mobile */}
      <aside
        className={`
          fixed lg:relative inset-y-0 left-0 z-50
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          ${sidebarOpen ? "w-64" : "lg:w-20"}
          transition-all duration-300 border-r bg-card overflow-hidden
        `}
      >
        <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40">
          <div className="flex items-center justify-between px-4 sm:px-6 py-4">
            <div className="flex items-center gap-4">
              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </Button>

              <div className="hidden sm:block">
                <h1 className="text-xl sm:text-2xl font-bold">Dashboard</h1>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Manage and evaluate your content
                </p>
              </div>
              
              {/* Mobile Title */}
              <div className="sm:hidden">
                <h1 className="text-lg font-bold">Dashboard</h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="gap-2 hidden sm:flex"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </Button>
              <Button
                onClick={handleLogout}
                variant="outline"
                size="icon"
                className="sm:hidden"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </Button>
            </div>
          </div>
        </header>

        {/* Filters */}
        <div className="px-4 sm:px-6 py-4 border-b bg-card/30">
          <div className="flex flex-wrap gap-3 sm:gap-4 items-center">
            <div className="flex items-center gap-2  sm:flex">
              <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <span className="font-medium text-sm">Filters:</span>
            </div>
            
            <select
              value={filter.channel}
              onChange={(e) => setFilter({ ...filter, channel: e.target.value })}
              className="px-3 sm:px-4 py-2 rounded-lg border bg-background text-xs sm:text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">All Channels</option>
              <option value="Instagram">Instagram</option>
              <option value="TikTok">TikTok</option>
              <option value="LinkedIn">LinkedIn</option>
              <option value="Facebook">Facebook</option>
            </select>

            <select
              value={filter.brandId}
              onChange={(e) => setFilter({ ...filter, brandId: e.target.value })}
              className="px-3 sm:px-4 py-2 rounded-lg border bg-background text-xs sm:text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">All Brands</option>
              <option value="7e9c1a3b-5d7f-40b4-a1c2-3d4e5f6a7b8c">ChromaBloom Studios</option>
              <option value="5d7f9b1a-3e5c-48a0-8f9e-6c7b8a9d0c1b">PulseForge Fitness</option>
              <option value="a9c7b5d3-e1f2-47c8-9d0a-1b2c3d4e5f60">Æther & Crumb</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 sm:px-4 py-2 rounded-lg border bg-background text-xs sm:text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="date">Sort by Date</option>
              <option value="score">Sort by Score</option>
            </select>

            <div className="ml-auto flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {prompts.length} {prompts.length === 1 ? "item" : "items"}
              </Badge>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {prompts.map((prompt) => (
              <Card 
                key={prompt._id} 
                className="group overflow-hidden hover:shadow-2xl transition-all duration-300 border-2 hover:border-primary/50 cursor-pointer"
                onClick={() => handleCardClick(prompt)}
              >
                <CardHeader className="p-0">
                  <div className="relative h-48 bg-muted overflow-hidden">
                    {prompt.mediaType === "video" ? (
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#E81784]/20 to-purple-500/20">
                        <svg className="w-16 h-16 text-primary" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                        </svg>
                      </div>
                    ) : (
                      <Image
                        src={`/${prompt.imagePath}`}
                        alt={prompt.prompt}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.png"
                        }}
                      />
                    )}
                    
                    {/* Channel Badge */}
                    <div className="absolute top-2 left-2">
                      <Badge className="backdrop-blur-sm bg-background/90 text-foreground border border-border">
                        {prompt.channel}
                      </Badge>
                    </div>

                    {/* Score Badge */}
                    {prompt.evaluation && (
                      <div className="absolute top-2 right-2">
                        <div className={`px-3 py-1.5 rounded-full font-bold text-sm shadow-lg backdrop-blur-sm ${getScoreColor(prompt.evaluation.finalScore)}`}>
                          {prompt.evaluation.finalScore}
                        </div>
                      </div>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="p-4 space-y-3">
                  {/* Prompt */}
                  <p className="text-sm font-medium line-clamp-2 min-h-[40px]">
                    {prompt.prompt}
                  </p>

                  {/* Meta Info */}
                  <div className="space-y-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      {prompt.user?.userName || "Unknown"}
                    </div>

                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      {prompt.brand?.brandName || "Unknown Brand"}
                    </div>

                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {formatDate(prompt.timestamp)}
                    </div>
                  </div>

                  {/* Evaluation Scores */}
                  {prompt.evaluation && (
                    <div className="pt-3 border-t">
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex justify-between items-center p-2 rounded bg-muted/50">
                          <span className="text-muted-foreground">Size:</span>
                          <span className="font-bold">{prompt.evaluation.agents.sizeComplianceAgent.score}</span>
                        </div>
                        <div className="flex justify-between items-center p-2 rounded bg-muted/50">
                          <span className="text-muted-foreground">Subject:</span>
                          <span className="font-bold">{prompt.evaluation.agents.subjectAdherenceAgent.score}</span>
                        </div>
                        <div className="flex justify-between items-center p-2 rounded bg-muted/50">
                          <span className="text-muted-foreground">Creative:</span>
                          <span className="font-bold">{prompt.evaluation.agents.creativityAgent.score}</span>
                        </div>
                        <div className="flex justify-between items-center p-2 rounded bg-muted/50">
                          <span className="text-muted-foreground">Mood:</span>
                          <span className="font-bold">{prompt.evaluation.agents.moodConsistencyAgent.score}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>

                <CardFooter className="p-4 pt-0">
                  <Button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleEvaluate(prompt._id)
                    }}
                    disabled={evaluating === prompt._id}
                    className="w-full bg-gradient-to-r from-[#E81784] to-purple-600 hover:from-[#E81784]/90 hover:to-purple-700 shadow-lg"
                    size="sm"
                  >
                    {evaluating === prompt._id ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Evaluating...
                      </div>
                    ) : prompt.evaluation ? (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Re-evaluate
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                        </svg>
                        Evaluate
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          {prompts.length === 0 && (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">No prompts found</h3>
              <p className="text-muted-foreground">Try adjusting your filters</p>
            </div>
          )}
        </main>
      </div>

      {/* Detail Modal */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedPrompt && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">Content Details</DialogTitle>
                <DialogDescription>
                  View complete information and evaluation results
                </DialogDescription>
              </DialogHeader>

              <div className="grid md:grid-cols-2 gap-6 mt-4">
                {/* Media Preview */}
                <div className="space-y-4">
                  <div className="relative h-64 md:h-96 bg-muted rounded-lg overflow-hidden">
                    {selectedPrompt.mediaType === "video" ? (
                      <video
                        src={`/${selectedPrompt.imagePath}`}
                        controls
                        className="w-full h-full object-contain"
                      >
                        Your browser does not support the video tag.
                      </video>
                    ) : (
                      <Image
                        src={`/${selectedPrompt.imagePath}`}
                        alt={selectedPrompt.prompt}
                        fill
                        className="object-contain"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.png"
                        }}
                      />
                    )}
                  </div>

                  {/* Metadata */}
                  <div className="space-y-3 p-4 bg-muted/30 rounded-lg">
                    <h3 className="font-semibold text-sm text-muted-foreground uppercase">Metadata</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Channel:</span>
                        <Badge>{selectedPrompt.channel}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">User:</span>
                        <span className="font-medium">{selectedPrompt.user?.userName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Brand:</span>
                        <span className="font-medium">{selectedPrompt.brand?.brandName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Model:</span>
                        <span className="font-medium">{selectedPrompt.llmModel}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Date:</span>
                        <span className="font-medium">{formatDate(selectedPrompt.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Details & Evaluation */}
                <div className="space-y-4">
                  {/* Prompt */}
                  <div>
                    <h3 className="font-semibold mb-2">Prompt</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {selectedPrompt.prompt}
                    </p>
                  </div>

                  {/* Evaluation Results */}
                  {selectedPrompt.evaluation ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">Evaluation Results</h3>
                        <div className={`px-4 py-2 rounded-full font-bold text-lg ${getScoreColor(selectedPrompt.evaluation.finalScore)}`}>
                          {selectedPrompt.evaluation.finalScore}
                        </div>
                      </div>

                      {/* Agent Scores */}
                      <div className="space-y-3">
                        {/* Size Compliance */}
                        <div className="p-4 rounded-lg bg-muted/30 space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-sm">Size Compliance</span>
                            <span className="font-bold">{selectedPrompt.evaluation.agents.sizeComplianceAgent.score}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {selectedPrompt.evaluation.agents.sizeComplianceAgent.reasoning}
                          </p>
                        </div>

                        {/* Subject Adherence */}
                        <div className="p-4 rounded-lg bg-muted/30 space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-sm">Subject Adherence</span>
                            <span className="font-bold">{selectedPrompt.evaluation.agents.subjectAdherenceAgent.score}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {selectedPrompt.evaluation.agents.subjectAdherenceAgent.reasoning}
                          </p>
                        </div>

                        {/* Creativity */}
                        <div className="p-4 rounded-lg bg-muted/30 space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-sm">Creativity</span>
                            <span className="font-bold">{selectedPrompt.evaluation.agents.creativityAgent.score}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {selectedPrompt.evaluation.agents.creativityAgent.reasoning}
                          </p>
                        </div>

                        {/* Mood Consistency */}
                        <div className="p-4 rounded-lg bg-muted/30 space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-sm">Mood Consistency</span>
                            <span className="font-bold">{selectedPrompt.evaluation.agents.moodConsistencyAgent.score}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {selectedPrompt.evaluation.agents.moodConsistencyAgent.reasoning}
                          </p>
                        </div>
                      </div>

                      <Button
                        onClick={() => handleEvaluate(selectedPrompt._id)}
                        disabled={evaluating === selectedPrompt._id}
                        className="w-full bg-gradient-to-r from-[#E81784] to-purple-600 hover:from-[#E81784]/90 hover:to-purple-700"
                      >
                        {evaluating === selectedPrompt._id ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Re-evaluating...
                          </div>
                        ) : (
                          <>
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Re-evaluate
                          </>
                        )}
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground mb-4">No evaluation yet</p>
                      <Button
                        onClick={() => handleEvaluate(selectedPrompt._id)}
                        disabled={evaluating === selectedPrompt._id}
                        className="bg-gradient-to-r from-[#E81784] to-purple-600 hover:from-[#E81784]/90 hover:to-purple-700"
                      >
                        {evaluating === selectedPrompt._id ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Evaluating...
                          </div>
                        ) : (
                          <>
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                            </svg>
                            Evaluate Now
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
