"use client"

import { Pencil, Trash } from "lucide-react"
import { IEventTicketType } from "@/interfaces"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface TicketTypesTableProps {
  data: IEventTicketType[]
  onEdit?: (ticketType: IEventTicketType) => void
  onDelete?: (id: number) => void
}

export default function TicketTypesTable({
  data,
  onEdit,
  onDelete,
}: TicketTypesTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Available</TableHead>
            <TableHead>Booked</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((ticket) => (
            <TableRow key={ticket.id}>
              <TableCell className="font-medium">{ticket.name}</TableCell>
              <TableCell>
                {new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                }).format(ticket.price ?? 0)}
              </TableCell>
              <TableCell>{ticket.total_tickets}</TableCell>
              <TableCell>{ticket.available_tickets}</TableCell>
              <TableCell>{ticket.booked_tickets}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  {onEdit && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(ticket)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  )}
                  {onDelete && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(ticket.id)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
          {data.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                No ticket types found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}