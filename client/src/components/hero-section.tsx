import React from "react";
import { Button } from "@/components/ui/button";
import { Play, ArrowRight } from "lucide-react";
import { Link } from "wouter";

export function HeroSection() {
  return (
    <section className="py-12 sm:py-16 md:py-24 bg-gradient-to-b from-background to-muted/30">
      <div className="max-w-4xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 text-center">
        
        {/* Main Heading */}
        <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 sm:mb-6 leading-tight px-2 sm:px-0">
          Discover Ancient <span className="text-primary">Wisdom</span>
        </h1>
        
        {/* Description */}
        <p className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto mb-6 sm:mb-8 md:mb-10 leading-relaxed px-4 sm:px-0">
          Connect with an AI companion that understands Hindu scriptures,
          <br className="hidden sm:block" />
          Bhagavad Gita, and Vedas. Get personalized insights and join a
          <br className="hidden sm:block" />
          community of spiritual seekers.
        </p>
        
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4 sm:px-0">
          <Link href="/chat" className="w-full sm:w-auto">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base md:text-lg font-semibold rounded-lg shadow-lg w-full sm:w-auto"
              data-testid="button-start-journey"
            >
              Start Your Journey
              <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </Link>
          
          <Button
            variant="outline"
            size="lg"
            className="border-2 border-muted-foreground/20 hover:border-primary hover:bg-primary/5 px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base md:text-lg font-semibold rounded-lg w-full sm:w-auto"
            data-testid="button-watch-demo"
          >
            <Play className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
            Watch Demo
          </Button>
        </div>
        
        {/* Features Preview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mt-8 sm:mt-12 md:mt-16 max-w-2xl mx-auto px-4 sm:px-0">
          <div className="text-center">
            <div className="bg-primary/10 rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center mx-auto mb-2 sm:mb-3">
              <span className="text-lg sm:text-xl">💬</span>
            </div>
            <h3 className="font-semibold text-foreground mb-1 text-sm sm:text-base">AI Chat</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">Scripture-based guidance</p>
          </div>
          
          <div className="text-center">
            <div className="bg-primary/10 rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center mx-auto mb-2 sm:mb-3">
              <span className="text-lg sm:text-xl">👥</span>
            </div>
            <h3 className="font-semibold text-foreground mb-1 text-sm sm:text-base">Community</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">Connect with seekers</p>
          </div>
          
          <div className="text-center col-span-1 sm:col-span-2 md:col-span-1">
            <div className="bg-primary/10 rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center mx-auto mb-2 sm:mb-3">
              <span className="text-lg sm:text-xl">📖</span>
            </div>
            <h3 className="font-semibold text-foreground mb-1 text-sm sm:text-base">Krishna Path</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">Sacred guidance journey</p>
          </div>
          
        </div>
      </div>
    </section>
  );
}
