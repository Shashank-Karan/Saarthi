import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";

export function HeroSection() {
  const scrollToChat = () => {
    document.getElementById('chat')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative py-12 sm:py-20 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20"></div>
      <div className="relative max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 text-center">
        <div className="mb-8">
          <div className="text-6xl mb-6">🕉️</div>
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-serif font-bold text-foreground mb-4 sm:mb-6">
            Discover Ancient <span className="text-primary">Wisdom</span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-6 sm:mb-8 px-4">
            Connect with an AI companion that understands Hindu scriptures, Bhagavad Gita, and Vedas. 
            Get personalized insights and join a community of spiritual seekers.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4">
          <Button
            size="lg"
            className="px-8 py-3 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
            onClick={scrollToChat}
            data-testid="button-start-journey"
          >
            Start Your Journey
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="px-8 py-3 text-lg"
            data-testid="button-watch-demo"
          >
            <Play className="mr-2 h-4 w-4" />
            Watch Demo
          </Button>
        </div>
      </div>
    </section>
  );
}
