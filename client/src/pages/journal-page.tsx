import { JournalSection } from "@/components/journal-section";
import { Navigation } from "@/components/navigation";

export default function JournalPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
        <JournalSection />
      </div>
    </div>
  );
}