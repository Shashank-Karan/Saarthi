import { KrishnaPathGame } from "@/components/krishna-path-game";
import { Navigation } from "@/components/navigation";

export default function GamePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <KrishnaPathGame />
      </div>
    </div>
  );
}