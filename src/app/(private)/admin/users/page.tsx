"use client"

import { useEffect, useState } from "react"
import PageTitle from "@/components/ui/page-title"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { getAllUsers } from "@/actions/manage-users"
import { IUser } from "@/interfaces"
import { Plus, Search, Users } from "lucide-react"
import UserFormDialog from "@/components/user-form-dialog"
import DeleteUserDialog from "@/components/delete-user-dialog"
import UserActionsCell from "@/components/user-actions-cell"
import { formatDateTime } from "@/lib/utils"

export default function AdminUsersPage() {
  const [users, setUsers] = useState<Omit<IUser, 'password'>[]>([])
  const [filteredUsers, setFilteredUsers] = useState<Omit<IUser, 'password'>[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  // Dialog states
  const [showUserForm, setShowUserForm] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedUser, setSelectedUser] = useState<Omit<IUser, 'password'> | null>(null)
  const [userToDelete, setUserToDelete] = useState<{ id: string; name: string } | null>(null)

  // Fetch users
  const fetchUsers = async () => {
    setIsLoading(true)
    const result = await getAllUsers()
    if (result.success && result.data) {
      setUsers(result.data)
      setFilteredUsers(result.data)
    }
    setIsLoading(false)
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  // Search filter
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredUsers(users)
    } else {
      const query = searchQuery.toLowerCase()
      const filtered = users.filter(
        (user) =>
          user.name.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query) ||
          user.role.toLowerCase().includes(query)
      )
      setFilteredUsers(filtered)
    }
  }, [searchQuery, users])

  const handleCreateUser = () => {
    setSelectedUser(null)
    setShowUserForm(true)
  }

  const handleEditUser = (user: Omit<IUser, 'password'>) => {
    setSelectedUser(user)
    setShowUserForm(true)
  }

  const handleDeleteUser = (user: Omit<IUser, 'password'>) => {
    setUserToDelete({ id: user.id, name: user.name })
    setShowDeleteDialog(true)
  }

  const handleSuccess = () => {
    fetchUsers()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageTitle title="Manage Users" />
        <Button onClick={handleCreateUser} className="gap-2">
          <Plus className="w-4 h-4" />
          Create User
        </Button>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by name, email, or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="text-sm text-muted-foreground">
          {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Users Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">Loading users...</div>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 border border-border rounded-lg bg-card">
          <Users className="w-12 h-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium text-foreground">
            {searchQuery ? "No users found" : "No users yet"}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {searchQuery
              ? "Try adjusting your search query"
              : "Create your first user to get started"}
          </p>
        </div>
      ) : (
        <div className="border border-border rounded-lg bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${user.role === "admin"
                          ? "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400"
                          : "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                        }`}
                    >
                      {user.role}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${user.is_active
                          ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                          : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                        }`}
                    >
                      {user.is_active ? "Active" : "Inactive"}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDateTime(user.created_at)}
                  </TableCell>
                  <TableCell className="text-right">
                    <UserActionsCell
                      user={user}
                      onEdit={() => handleEditUser(user)}
                      onDelete={() => handleDeleteUser(user)}
                      onStatusChange={handleSuccess}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Dialogs */}
      <UserFormDialog
        open={showUserForm}
        onOpenChange={setShowUserForm}
        user={selectedUser}
        onSuccess={handleSuccess}
      />

      {userToDelete && (
        <DeleteUserDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          userId={userToDelete.id}
          userName={userToDelete.name}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  )
}
