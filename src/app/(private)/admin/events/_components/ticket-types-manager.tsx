"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import TicketTypesTable from "./ticket-types-table"
import TicketTypeForm from "./ticket-type-form"
import { deleteTicketType } from "@/actions/events-ticket-types"
import { IEventTicketType } from "@/interfaces"
import toast from "react-hot-toast"

interface TicketTypesManagerProps {
  eventId: number
  ticketTypes: IEventTicketType[]
}

export default function TicketTypesManager({
  eventId,
  ticketTypes,
}: TicketTypesManagerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedTicketType, setSelectedTicketType] =
    useState<IEventTicketType | null>(null)
  const [ticketTypeToDelete, setTicketTypeToDelete] = useState<number | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  const handleCreate = () => {
    setSelectedTicketType(null)
    setIsDialogOpen(true)
  }

  const handleEdit = (ticketType: IEventTicketType) => {
    setSelectedTicketType(ticketType)
    setIsDialogOpen(true)
  }

  const handleDelete = (id: number) => {
    setTicketTypeToDelete(id)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!ticketTypeToDelete) return

    setIsDeleting(true)
    try {
      const response = await deleteTicketType(ticketTypeToDelete)
      if (response.success) {
        toast.success(response.message)
        router.refresh()
        setIsDeleteDialogOpen(false)
        setTicketTypeToDelete(null)
      } else {
        toast.error(response.message)
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to delete ticket type")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleClose = () => {
    setIsDialogOpen(false)
    setSelectedTicketType(null)
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Ticket Types</h2>
          <Button onClick={handleCreate}>Add Ticket Type</Button>
        </div>
        <div>
          <TicketTypesTable
            data={ticketTypes}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedTicketType ? "Edit Ticket Type" : "Create Ticket Type"}
            </DialogTitle>
          </DialogHeader>
          <TicketTypeForm
            eventId={eventId}
            initialData={selectedTicketType || undefined}
            onClose={handleClose}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Ticket Type</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this ticket type? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false)
                setTicketTypeToDelete(null)
              }}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

