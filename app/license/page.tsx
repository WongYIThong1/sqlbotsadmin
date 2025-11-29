"use client"

import { useState, useEffect } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { Sidebar } from "@/components/sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Plus, Copy, Loader2, RefreshCw, MoreVertical, Trash2, Download, Search, Filter } from "lucide-react"
import { toast } from "sonner"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface License {
  id: string
  license_key: string
  status: "Active" | "Expired" | "Inactive"
  day: number
  created_at: string
  updated_at: string
}

export default function LicensePage() {
  const [licenses, setLicenses] = useState<License[]>([])
  const [filteredLicenses, setFilteredLicenses] = useState<License[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [licenseToDelete, setLicenseToDelete] = useState<{ id: string; key: string } | null>(null)
  const [quantity, setQuantity] = useState<string>("1")
  const [plan, setPlan] = useState<"30" | "90">("30")
  const [isGenerating, setIsGenerating] = useState(false)
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [statusFilter, setStatusFilter] = useState<"All" | "Active" | "Expired" | "Inactive">("All")

  // Fetch licenses from API
  const fetchLicenses = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/licenses", {
        method: "GET",
        credentials: "include",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to fetch licenses")
      }

      const data = await response.json()
      setLicenses(data.licenses || [])
      setFilteredLicenses(data.licenses || [])
    } catch (error) {
      console.error("Failed to fetch licenses:", error)
      toast.error("Failed to Load Licenses", {
        description: error instanceof Error ? error.message : "An error occurred while fetching licenses.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Load licenses on component mount
  useEffect(() => {
    fetchLicenses()
  }, [])

  // Filter licenses based on search query and status
  useEffect(() => {
    let filtered = [...licenses]

    // Filter by status
    if (statusFilter !== "All") {
      filtered = filtered.filter((license) => license.status === statusFilter)
    }

    // Filter by search query
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter((license) =>
        license.license_key.toLowerCase().includes(query)
      )
    }

    setFilteredLicenses(filtered)
  }, [licenses, searchQuery, statusFilter])

  const handleGenerateClick = () => {
    setIsDialogOpen(true)
    setQuantity("1")
    setPlan("30")
  }

  const handleGenerate = async () => {
    const quantityNum = parseInt(quantity)
    
    if (!quantity || isNaN(quantityNum) || quantityNum < 1) {
      toast.error("Invalid Quantity", {
        description: "Please enter a valid quantity (minimum 1).",
      })
      return
    }

    setIsGenerating(true)

    try {
      const response = await fetch("/api/licenses/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          quantity: quantityNum,
          day: parseInt(plan),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to generate licenses")
      }

      const data = await response.json()
      
      toast.success("Licenses Generated", {
        description: `Successfully generated ${data.count} license(s) for ${plan}-day plan.`,
      })
      
      setIsDialogOpen(false)
      setQuantity("1")
      setPlan("30")
      
      // Refresh the licenses list
      await fetchLicenses()
    } catch (error) {
      toast.error("Generation Failed", {
        description: error instanceof Error ? error.message : "An error occurred while generating licenses. Please try again.",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCopyLicense = async (licenseKey: string) => {
    try {
      await navigator.clipboard.writeText(licenseKey)
      toast.success("Copied", {
        description: "License key copied to clipboard",
      })
    } catch (error) {
      toast.error("Copy Failed", {
        description: "Failed to copy license key to clipboard",
      })
    }
  }

  const handleDeleteClick = (licenseId: string, licenseKey: string) => {
    setLicenseToDelete({ id: licenseId, key: licenseKey })
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!licenseToDelete) return

    try {
      const response = await fetch(`/api/licenses/${licenseToDelete.id}`, {
        method: "DELETE",
        credentials: "include",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to delete license")
      }

      toast.success("License Deleted", {
        description: "License has been successfully deleted.",
      })

      setIsDeleteDialogOpen(false)
      setLicenseToDelete(null)

      // Refresh the licenses list
      await fetchLicenses()
    } catch (error) {
      console.error("Failed to delete license:", error)
      toast.error("Delete Failed", {
        description: error instanceof Error ? error.message : "An error occurred while deleting the license. Please try again.",
      })
    }
  }

  const handleExportLicenses = () => {
    // Export as CSV
    const headers = ["License Key", "Status", "Days", "Created At", "Updated At"]
    const rows = filteredLicenses.map((license) => [
      license.license_key,
      license.status,
      license.day.toString(),
      new Date(license.created_at).toLocaleString(),
      new Date(license.updated_at).toLocaleString(),
    ])

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `licenses_${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast.success("Export Successful", {
      description: `Exported ${filteredLicenses.length} license(s) to CSV.`,
    })
  }

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-background">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <DashboardHeader title="License Management" description="Manage software licenses and subscriptions" />
          <div className="p-6">
            <Card className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-card-foreground">All Licenses</CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchLicenses}
                    disabled={isLoading}
                  >
                    <RefreshCw size={16} className={`mr-2 ${isLoading ? "animate-spin" : ""}`} />
                    Refresh
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExportLicenses}
                    disabled={isLoading || filteredLicenses.length === 0}
                  >
                    <Download size={16} className="mr-2" />
                    Export All License
                  </Button>
                  <Button 
                    onClick={handleGenerateClick}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    <Plus size={16} className="mr-2" /> Generate License
                  </Button>
                </div>
              </CardHeader>
            <CardContent>
              {/* Filter Section */}
              <div className="mb-4 flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                  <Input
                    placeholder="Search by license key..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="text-muted-foreground" size={16} />
                  <div className="flex gap-2">
                    {(["All", "Active", "Expired", "Inactive"] as const).map((status) => (
                      <Button
                        key={status}
                        variant={statusFilter === status ? "default" : "outline"}
                        size="sm"
                        onClick={() => setStatusFilter(status)}
                        className={statusFilter === status ? "" : "bg-background"}
                      >
                        {status}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="ml-3 text-muted-foreground">Loading licenses...</p>
                </div>
              ) : filteredLicenses.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    {licenses.length === 0
                      ? "No licenses found. Generate your first license to get started."
                      : "No licenses match your filters."}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">License Key</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Days</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Created At</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLicenses.map((license) => (
                        <tr key={license.id} className="border-b border-border hover:bg-secondary/50 transition-colors">
                          <td className="py-3 px-4">
                            <code className="text-sm text-card-foreground font-mono bg-secondary px-2 py-1 rounded">
                              {license.license_key}
                            </code>
                          </td>
                          <td className="py-3 px-4 text-sm text-muted-foreground">{license.day} days</td>
                          <td className="py-3 px-4">
                            <Badge
                              className={
                                license.status === "Active"
                                  ? "bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500/30"
                                  : license.status === "Expired"
                                  ? "bg-red-500/20 text-red-500 hover:bg-red-500/30"
                                  : "bg-gray-500/20 text-gray-500 hover:bg-gray-500/30"
                              }
                            >
                              {license.status}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-sm text-muted-foreground">
                            {new Date(license.created_at).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-muted-foreground hover:text-foreground"
                                >
                                  <MoreVertical size={16} />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => handleCopyLicense(license.license_key)}
                                >
                                  <Copy className="mr-2 h-4 w-4" />
                                  Copy License Key
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDeleteClick(license.id, license.license_key)}
                                  className="text-destructive focus:text-destructive"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete License
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Generate License Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Generate License</DialogTitle>
            <DialogDescription>
              Enter the number of licenses to generate and select the plan duration.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="Enter number of licenses"
                disabled={isGenerating}
              />
            </div>
            <div className="grid gap-3">
              <Label>Plan Duration</Label>
              <RadioGroup value={plan} onValueChange={(value) => setPlan(value as "30" | "90")} disabled={isGenerating}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="30" id="plan-30" />
                  <Label htmlFor="plan-30" className="font-normal cursor-pointer">
                    30 Days
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="90" id="plan-90" />
                  <Label htmlFor="plan-90" className="font-normal cursor-pointer">
                    90 Days
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={isGenerating}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete License</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete license "{licenseToDelete?.key}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false)
                setLicenseToDelete(null)
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteConfirm}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    </ProtectedRoute>
  )
}
