import React from "react";
import { Navigation } from "@/components/navigation";
import { HeroSection } from "@/components/hero-section";
import { ThoughtOfTheDay } from "@/components/thought-of-the-day";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { Link } from "wouter";

export default function HomePage() {

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <ThoughtOfTheDay />
      <HeroSection />
      
      {/* Quick Chat Access */}
      <Link href="/chat">
        <Button
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-14 h-14 sm:w-16 sm:h-16 rounded-full shadow-lg bg-primary hover:bg-primary/90 z-50"
          data-testid="floating-chat-button"
        >
          <MessageCircle className="h-6 w-6 text-primary-foreground" />
        </Button>
      </Link>
    </div>
  );
}
