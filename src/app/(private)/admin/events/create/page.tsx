'use client'

import PageTitle from "@/components/ui/page-title"
import EventForm from "../_components/event-form"

function CreateEventPage() {
  return (
    <div>
      <PageTitle title="Create Event" />
      <div className="mt-8">
        <EventForm formType="create" />
      </div>
    </div>
  )
}
export default CreateEventPage