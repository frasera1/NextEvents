import PageTitle from "@/components/ui/page-title"
import ProfileCard from "@/components/profile-card"

function UserProfilePage() {
  return (
    <div className="space-y-6">
      <PageTitle title="My Profile" />
      <ProfileCard />
    </div>
  )
}

export default UserProfilePage
