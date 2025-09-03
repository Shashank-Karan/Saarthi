import { Navigation } from "@/components/navigation";
import { KrishnaPathJourney } from "@/components/krishna-path-journey";

export default function KrishnaPathPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-orange-950/20 dark:via-amber-950/20 dark:to-yellow-950/20">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <KrishnaPathJourney />
      </div>
    </div>
  );
}