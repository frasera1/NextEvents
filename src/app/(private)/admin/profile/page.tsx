import PageTitle from "@/components/ui/page-title"
import ProfileCard from "@/components/profile-card"

function AdminProfilePage() {
  return (
    <div className="space-y-6">
      <PageTitle title="Admin Profile" />
      <ProfileCard />
    </div>
  )
}

export default AdminProfilePage
