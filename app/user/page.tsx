"use client"

import { useState, useEffect } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { Sidebar } from "@/components/sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Search, Plus, MoreVertical, RefreshCw, Loader2, KeyRound, Lock, Eye, Copy, Filter, Trash2, Megaphone, Send } from "lucide-react"
import { toast } from "sonner"

interface User {
  id: string
  username: string
  plan: number
  status: "Active" | "Suspended"
  machine_name_1: string | null
  machine_name_2: string | null
  machine_name_3: string | null
  discord_id: string | null
  apikey: string | null
  expires_at: string | null
  created_at: string
  updated_at: string
}

export default function UserPage() {
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [statusFilter, setStatusFilter] = useState<"All" | "Active" | "Suspended">("All")
  const [isResetPasswordDialogOpen, setIsResetPasswordDialogOpen] = useState(false)
  const [isViewDetailsDialogOpen, setIsViewDetailsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isNotifyDialogOpen, setIsNotifyDialogOpen] = useState(false)
  const [isExtendDialogOpen, setIsExtendDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [newPassword, setNewPassword] = useState<string>("")
  const [confirmPassword, setConfirmPassword] = useState<string>("")
  const [isResettingPassword, setIsResettingPassword] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isSendingNotification, setIsSendingNotification] = useState(false)
  const [notificationMessage, setNotificationMessage] = useState("")
  const [notificationTarget, setNotificationTarget] = useState<{ id: string | null; username: string } | null>(null)
  const [extendDays, setExtendDays] = useState<string>("")
  const [extendTarget, setExtendTarget] = useState<{ id: string | null; username: string } | null>(null)
  const [isExtending, setIsExtending] = useState(false)
  const [showFullApiKey, setShowFullApiKey] = useState<Record<string, boolean>>({})

  // Fetch users from API
  const fetchUsers = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter !== "All") {
        params.append("status", statusFilter)
      }
      if (searchQuery.trim()) {
        params.append("search", searchQuery.trim())
      }

      const response = await fetch(`/api/users?${params.toString()}`, {
        method: "GET",
        credentials: "include",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to fetch users")
      }

      const data = await response.json()
      setUsers(data.users || [])
      setFilteredUsers(data.users || [])
    } catch (error) {
      console.error("Failed to fetch users:", error)
      toast.error("Failed to Load Users", {
        description: error instanceof Error ? error.message : "An error occurred while fetching users.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Load users on component mount
  useEffect(() => {
    fetchUsers()
  }, [])

  // Filter users based on search query and status
  useEffect(() => {
    let filtered = [...users]

    // Filter by status (already done by API, but keep for client-side filtering if needed)
    if (statusFilter !== "All") {
      filtered = filtered.filter((user) => user.status === statusFilter)
    }

    // Filter by search query (already done by API, but keep for client-side filtering if needed)
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter((user) => user.username.toLowerCase().includes(query))
    }

    setFilteredUsers(filtered)
  }, [users, searchQuery, statusFilter])

  const handleResetPasswordClick = (user: User) => {
    setSelectedUser(user)
    setNewPassword("")
    setConfirmPassword("")
    setIsResetPasswordDialogOpen(true)
  }

  const handleViewDetailsClick = async (user: User) => {
    // Fetch full user details including apikey
    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: "GET",
        credentials: "include",
      })

      if (response.ok) {
        const data = await response.json()
        setSelectedUser(data.user)
      } else {
        // Fallback to the user from list if API fails
        setSelectedUser(user)
      }
    } catch (error) {
      console.error("Failed to fetch user details:", error)
      // Fallback to the user from list if API fails
      setSelectedUser(user)
    }
    setIsViewDetailsDialogOpen(true)
  }

  const handleDeleteClick = (user: User) => {
    setSelectedUser(user)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!selectedUser) return

    setIsDeleting(true)

    try {
      const response = await fetch(`/api/users/${selectedUser.id}`, {
        method: "DELETE",
        credentials: "include",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to delete user")
      }

      const result = await response.json()
      const deletedLicenses = result.deleted_licenses || 0

      toast.success("User Deleted", {
        description: `User "${selectedUser.username}" has been successfully deleted.${
          deletedLicenses > 0 ? ` ${deletedLicenses} associated license(s) were also deleted.` : ""
        }`,
      })

      setIsDeleteDialogOpen(false)
      setSelectedUser(null)

      // Refresh the users list
      await fetchUsers()
    } catch (error) {
      console.error("Failed to delete user:", error)
      toast.error("Delete Failed", {
        description: error instanceof Error ? error.message : "An error occurred while deleting the user. Please try again.",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const handleResetPassword = async () => {
    if (!selectedUser) return

    if (!newPassword || newPassword.length < 6) {
      toast.error("Invalid Password", {
        description: "Password must be at least 6 characters.",
      })
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error("Password Mismatch", {
        description: "Passwords do not match.",
      })
      return
    }

    setIsResettingPassword(true)

    try {
      const response = await fetch(`/api/users/${selectedUser.id}/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          password: newPassword,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to reset password")
      }

      toast.success("Password Reset", {
        description: `Password has been reset for user "${selectedUser.username}".`,
      })

      setIsResetPasswordDialogOpen(false)
      setNewPassword("")
      setConfirmPassword("")
      setSelectedUser(null)
    } catch (error) {
      console.error("Failed to reset password:", error)
      toast.error("Reset Failed", {
        description: error instanceof Error ? error.message : "An error occurred while resetting the password. Please try again.",
      })
    } finally {
      setIsResettingPassword(false)
    }
  }

  const handleCopyApiKey = async (apiKey: string) => {
    try {
      await navigator.clipboard.writeText(apiKey)
      toast.success("Copied", {
        description: "API key copied to clipboard",
      })
    } catch (error) {
      toast.error("Copy Failed", {
        description: "Failed to copy API key to clipboard",
      })
    }
  }

  const formatApiKey = (apiKey: string | null, userId: string): string => {
    if (!apiKey) return "Not set"
    if (showFullApiKey[userId]) return apiKey
    // Show first 8 and last 8 characters
    if (apiKey.length <= 20) return apiKey
    return `${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 8)}`
  }

  const toggleApiKeyVisibility = (userId: string) => {
    setShowFullApiKey(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }))
  }

  const getInitials = (username: string) => {
    return username.charAt(0).toUpperCase()
  }

  const openNotificationDialog = (user?: User) => {
    if (user) {
      setNotificationTarget({ id: user.id, username: user.username })
    } else {
      setNotificationTarget({ id: null, username: "All Users" })
    }
    setNotificationMessage("")
    setIsNotifyDialogOpen(true)
  }

  const openExtendDialog = (user?: User) => {
    if (user) {
      setExtendTarget({ id: user.id, username: user.username })
    } else {
      setExtendTarget({ id: null, username: "All Users" })
    }
    setExtendDays("")
    setIsExtendDialogOpen(true)
  }

  const handleSendNotification = async () => {
    if (!notificationTarget || !notificationMessage.trim()) return

    setIsSendingNotification(true)
    try {
      const response = await fetch("/api/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          message: notificationMessage.trim(),
          userId: notificationTarget.id,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to send notification")
      }

      const result = await response.json()
      toast.success("Notification Sent", {
        description: notificationTarget.id
          ? `Message delivered to ${notificationTarget.username}.`
          : `Message delivered to ${result.count || "all"} user(s).`,
      })

      setIsNotifyDialogOpen(false)
      setNotificationMessage("")
      setNotificationTarget(null)
    } catch (error) {
      console.error("Failed to send notification:", error)
      toast.error("Notification Failed", {
        description: error instanceof Error ? error.message : "An error occurred while sending the notification. Please try again.",
      })
    } finally {
      setIsSendingNotification(false)
    }
  }

  const handleExtendExpiry = async () => {
    if (!extendTarget) return

    const daysNum = Number(extendDays)
    if (!extendDays || !Number.isInteger(daysNum) || daysNum < 1) {
      toast.error("Invalid Days", {
        description: "Please enter a valid positive integer for days.",
      })
      return
    }

    setIsExtending(true)
    try {
      const response = await fetch("/api/users/extend-expiry", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          days: daysNum,
          userId: extendTarget.id,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to extend expiry")
      }

      const result = await response.json()
      toast.success("Expiry Extended", {
        description: extendTarget.id
          ? `Extended expiry for ${extendTarget.username} by ${daysNum} day(s).`
          : `Extended expiry for ${result.updated || "all"} user(s) by ${daysNum} day(s).`,
      })

      setIsExtendDialogOpen(false)
      setExtendDays("")
      setExtendTarget(null)

      // Refresh users to reflect new expiry dates
      await fetchUsers()
    } catch (error) {
      console.error("Failed to extend expiry:", error)
      toast.error("Extend Failed", {
        description: error instanceof Error ? error.message : "An error occurred while extending expiry. Please try again.",
      })
    } finally {
      setIsExtending(false)
    }
  }

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-background">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <DashboardHeader title="User Management" description="Manage user accounts and permissions" />
          <div className="p-6">
            <Card className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-card-foreground">All Users</CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchUsers}
                    disabled={isLoading}
                  >
                    <RefreshCw size={16} className={`mr-2 ${isLoading ? "animate-spin" : ""}`} />
                    Refresh
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openNotificationDialog()}
                  >
                    <Megaphone size={16} className="mr-2" />
                    Notify All
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openExtendDialog()}
                  >
                    <KeyRound size={16} className="mr-2" />
                    Extend All
                  </Button>
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                    <Plus size={16} className="mr-2" /> Add User
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Filter Section */}
                <div className="mb-4 flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                    <Input
                      placeholder="Search by username..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          fetchUsers()
                        }
                      }}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Filter className="text-muted-foreground" size={16} />
                    <div className="flex gap-2">
                      {(["All", "Active", "Suspended"] as const).map((status) => (
                        <Button
                          key={status}
                          variant={statusFilter === status ? "default" : "outline"}
                          size="sm"
                          onClick={() => {
                            setStatusFilter(status)
                            fetchUsers()
                          }}
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
                    <p className="ml-3 text-muted-foreground">Loading users...</p>
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">
                      {users.length === 0
                        ? "No users found. Add your first user to get started."
                        : "No users match your filters."}
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">User</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Plan</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                          <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsers.map((user) => (
                          <tr key={user.id} className="border-b border-border hover:bg-secondary/50 transition-colors">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8 bg-secondary">
                                  <AvatarFallback className="bg-secondary text-muted-foreground text-xs">
                                    {getInitials(user.username)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="text-sm font-medium text-card-foreground">{user.username}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {[user.machine_name_1, user.machine_name_2, user.machine_name_3]
                                      .filter(name => name)
                                      .length || 0} machine{([user.machine_name_1, user.machine_name_2, user.machine_name_3].filter(name => name).length || 0) !== 1 ? "s" : ""}
                                    {user.expires_at && (
                                      <> • Expires: {new Date(user.expires_at).toLocaleDateString()}</>
                                    )}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-sm text-muted-foreground">{user.plan} days</td>
                            <td className="py-3 px-4">
                              <Badge
                                className={
                                  user.status === "Active"
                                    ? "bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500/30"
                                    : "bg-red-500/20 text-red-500 hover:bg-red-500/30"
                                }
                              >
                                {user.status}
                              </Badge>
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
                                    onClick={() => handleResetPasswordClick(user)}
                                  >
                                    <Lock className="mr-2 h-4 w-4" />
                                    Reset Password
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleViewDetailsClick(user)}
                                  >
                                    <Eye className="mr-2 h-4 w-4" />
                                    View More Information
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => openNotificationDialog(user)}
                                  >
                                    <Megaphone className="mr-2 h-4 w-4" />
                                    Send Notification
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => openExtendDialog(user)}
                                  >
                                    <KeyRound className="mr-2 h-4 w-4" />
                                    Extend Expiry
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleDeleteClick(user)}
                                    className="text-destructive focus:text-destructive"
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete User
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

        {/* Reset Password Dialog */}
        <Dialog open={isResetPasswordDialogOpen} onOpenChange={setIsResetPasswordDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Reset Password</DialogTitle>
              <DialogDescription>
                Enter a new password for user "{selectedUser?.username}".
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  disabled={isResettingPassword}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  disabled={isResettingPassword}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsResetPasswordDialogOpen(false)
                  setNewPassword("")
                  setConfirmPassword("")
                  setSelectedUser(null)
                }}
                disabled={isResettingPassword}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleResetPassword}
                disabled={isResettingPassword}
              >
                {isResettingPassword ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Resetting...
                  </>
                ) : (
                  "Reset Password"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Details Dialog */}
        <Dialog open={isViewDetailsDialogOpen} onOpenChange={setIsViewDetailsDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>User Details</DialogTitle>
              <DialogDescription>
                Additional information for user "{selectedUser?.username}".
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>API Key</Label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-sm font-mono bg-secondary px-3 py-2 rounded border border-border break-all">
                    {formatApiKey(selectedUser?.apikey || null, selectedUser?.id || "")}
                  </code>
                  {selectedUser?.apikey && (
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => selectedUser && toggleApiKeyVisibility(selectedUser.id)}
                        title={showFullApiKey[selectedUser.id] ? "Hide full key" : "Show full key"}
                      >
                        <Eye size={16} />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleCopyApiKey(selectedUser.apikey!)}
                        title="Copy API key"
                      >
                        <Copy size={16} />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Machine Names</Label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label className="text-xs text-muted-foreground w-24">Machine 1:</Label>
                    <code className="flex-1 text-sm font-mono bg-secondary px-3 py-2 rounded border border-border">
                      {selectedUser?.machine_name_1 || "Not set"}
                    </code>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="text-xs text-muted-foreground w-24">Machine 2:</Label>
                    <code className="flex-1 text-sm font-mono bg-secondary px-3 py-2 rounded border border-border">
                      {selectedUser?.machine_name_2 || "Not set"}
                    </code>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="text-xs text-muted-foreground w-24">Machine 3:</Label>
                    <code className="flex-1 text-sm font-mono bg-secondary px-3 py-2 rounded border border-border">
                      {selectedUser?.machine_name_3 || "Not set"}
                    </code>
                  </div>
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Discord ID</Label>
                <p className="text-sm text-muted-foreground">{selectedUser?.discord_id || "Not set"}</p>
              </div>
              <div className="grid gap-2">
                <Label>Expires At</Label>
                <p className="text-sm text-muted-foreground">
                  {selectedUser?.expires_at 
                    ? new Date(selectedUser.expires_at).toLocaleString()
                    : "Not set"}
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsViewDetailsDialogOpen(false)
                  setSelectedUser(null)
                }}
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete User Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Delete User</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete user "{selectedUser?.username}"? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsDeleteDialogOpen(false)
                  setSelectedUser(null)
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

        {/* Send Notification Dialog */}
        <Dialog open={isNotifyDialogOpen} onOpenChange={setIsNotifyDialogOpen}>
          <DialogContent className="sm:max-w-[480px]">
            <DialogHeader>
              <DialogTitle>Send Notification</DialogTitle>
              <DialogDescription>
                {notificationTarget?.id
                  ? `Send a message to ${notificationTarget.username}.`
                  : "Send a message to all users."}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Message</Label>
                <textarea
                  className="min-h-[120px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm text-card-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  placeholder="Enter notification message..."
                  value={notificationMessage}
                  onChange={(e) => setNotificationMessage(e.target.value)}
                  disabled={isSendingNotification}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsNotifyDialogOpen(false)
                  setNotificationMessage("")
                  setNotificationTarget(null)
                }}
                disabled={isSendingNotification}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSendNotification}
                disabled={isSendingNotification || !notificationMessage.trim()}
              >
                {isSendingNotification ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Extend Expiry Dialog */}
        <Dialog open={isExtendDialogOpen} onOpenChange={setIsExtendDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Extend Expiry</DialogTitle>
              <DialogDescription>
                {extendTarget?.id
                  ? `Extend expiry for user \"${extendTarget.username}\" by N days.`
                  : "Extend expiry for all users by N days."}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="extend-days">Days to extend</Label>
                <Input
                  id="extend-days"
                  type="number"
                  min={1}
                  value={extendDays}
                  onChange={(e) => setExtendDays(e.target.value)}
                  placeholder="Enter number of days"
                  disabled={isExtending}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsExtendDialogOpen(false)
                  setExtendDays("")
                  setExtendTarget(null)
                }}
                disabled={isExtending}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleExtendExpiry}
                disabled={isExtending || !extendDays.trim()}
              >
                {isExtending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Extending...
                  </>
                ) : (
                  "Extend"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedRoute>
  )
}
