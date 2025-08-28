import { Navigation } from "@/components/navigation";
import { CommunitySection } from "@/components/community-section";

export default function CommunityPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
        <CommunitySection />
      </div>
    </div>
  );
}