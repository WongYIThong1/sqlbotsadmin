"use client"

import { useState, useEffect } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { Sidebar } from "@/components/sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { RefreshCw, Loader2, Search, Filter, Server, MoreVertical, Trash2, User } from "lucide-react"
import { toast } from "sonner"

interface Machine {
  id: string
  user_id: string
  apikey: string
  ram: string | null
  core: number | null
  ip: string
  status: string | null
  last_heartbeat: string | null
  created_at: string | null
  updated_at: string | null
  name: string | null
  users?: {
    username: string
  } | null
}

export default function MachinePage() {
  const [machines, setMachines] = useState<Machine[]>([])
  const [filteredMachines, setFilteredMachines] = useState<Machine[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [statusFilter, setStatusFilter] = useState<"All" | "Active" | "Inactive">("All")
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [machineToDelete, setMachineToDelete] = useState<{ id: string; name: string } | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Fetch machines from API
  const fetchMachines = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter !== "All") {
        params.append("status", statusFilter)
      }
      if (searchQuery.trim()) {
        params.append("search", searchQuery.trim())
      }

      const response = await fetch(`/api/machines?${params.toString()}`, {
        method: "GET",
        credentials: "include",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to fetch machines")
      }

      const data = await response.json()
      setMachines(data.machines || [])
      setFilteredMachines(data.machines || [])
    } catch (error) {
      console.error("Failed to fetch machines:", error)
      toast.error("Failed to Load Machines", {
        description: error instanceof Error ? error.message : "An error occurred while fetching machines.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Load machines on component mount
  useEffect(() => {
    fetchMachines()
  }, [])

  // Filter machines based on search query and status
  useEffect(() => {
    let filtered = [...machines]

    // Filter by status
    if (statusFilter !== "All") {
      filtered = filtered.filter((machine) => machine.status === statusFilter)
    }

    // Filter by search query
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter((machine) =>
        (machine.name?.toLowerCase().includes(query) || 
         machine.ip?.toLowerCase().includes(query))
      )
    }

    setFilteredMachines(filtered)
  }, [machines, searchQuery, statusFilter])

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleString()
  }

  const getStatusBadge = (status: string | null) => {
    if (status === "Active") {
      return (
        <Badge className="bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500/30">
          {status}
        </Badge>
      )
    }
    return (
      <Badge className="bg-gray-500/20 text-gray-500 hover:bg-gray-500/30">
        {status || "Unknown"}
      </Badge>
    )
  }

  const handleDeleteClick = (machineId: string, machineName: string) => {
    setMachineToDelete({ id: machineId, name: machineName })
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!machineToDelete) return

    setIsDeleting(true)

    try {
      const response = await fetch(`/api/machines/${machineToDelete.id}`, {
        method: "DELETE",
        credentials: "include",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to delete machine")
      }

      toast.success("Machine Deleted", {
        description: "Machine has been successfully deleted.",
      })

      setIsDeleteDialogOpen(false)
      setMachineToDelete(null)

      // Refresh the machines list
      await fetchMachines()
    } catch (error) {
      console.error("Failed to delete machine:", error)
      toast.error("Delete Failed", {
        description: error instanceof Error ? error.message : "An error occurred while deleting the machine. Please try again.",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-background">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <DashboardHeader title="Machine Management" description="Manage and monitor all machines" />
          <div className="p-6">
            <Card className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-card-foreground">All Machines</CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchMachines}
                    disabled={isLoading}
                  >
                    <RefreshCw size={16} className={`mr-2 ${isLoading ? "animate-spin" : ""}`} />
                    Refresh
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Filter Section */}
                <div className="mb-4 flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                    <Input
                      placeholder="Search by name or IP..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Filter className="text-muted-foreground" size={16} />
                    <div className="flex gap-2">
                      {(["All", "Active", "Inactive"] as const).map((status) => (
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
                    <p className="ml-3 text-muted-foreground">Loading machines...</p>
                  </div>
                ) : filteredMachines.length === 0 ? (
                  <div className="text-center py-12">
                    <Server className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <p className="text-muted-foreground">
                      {machines.length === 0
                        ? "No machines found."
                        : "No machines match your filters."}
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Name</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">User</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">IP Address</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">RAM</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Cores</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Last Heartbeat</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Created At</th>
                          <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredMachines.map((machine) => (
                          <tr key={machine.id} className="border-b border-border hover:bg-secondary/50 transition-colors">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <Server size={16} className="text-muted-foreground" />
                                <span className="text-sm font-medium text-card-foreground">
                                  {machine.name || "Unnamed Machine"}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <User size={16} className="text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">
                                  {machine.users?.username || "Unknown User"}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <code className="text-sm text-card-foreground font-mono bg-secondary px-2 py-1 rounded">
                                {machine.ip}
                              </code>
                            </td>
                            <td className="py-3 px-4 text-sm text-muted-foreground">
                              {machine.ram || "N/A"}
                            </td>
                            <td className="py-3 px-4 text-sm text-muted-foreground">
                              {machine.core !== null ? machine.core : "N/A"}
                            </td>
                            <td className="py-3 px-4">
                              {getStatusBadge(machine.status)}
                            </td>
                            <td className="py-3 px-4 text-sm text-muted-foreground">
                              {formatDate(machine.last_heartbeat)}
                            </td>
                            <td className="py-3 px-4 text-sm text-muted-foreground">
                              {formatDate(machine.created_at)}
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
                                    onClick={() => handleDeleteClick(machine.id, machine.name || "Unnamed Machine")}
                                    className="text-destructive focus:text-destructive"
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete Machine
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
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Machine</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete machine "{machineToDelete?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false)
                setMachineToDelete(null)
              }}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ProtectedRoute>
  )
}
