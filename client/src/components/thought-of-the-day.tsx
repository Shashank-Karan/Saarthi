import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Quote, Sparkles } from "lucide-react";

interface ThoughtOfTheDay {
  id: string;
  content: string;
  author?: string;
  language: string;
  category?: string;
  created_at: string;
}

export function ThoughtOfTheDay() {
  const { data: thought, isLoading, error } = useQuery<ThoughtOfTheDay>({
    queryKey: ['/api/thought-of-the-day/current'],
    refetchInterval: 60000, // Poll every 60 seconds for thought updates
    refetchIntervalInBackground: true, // Continue polling even when window is not focused
    staleTime: 30000, // Consider data stale after 30 seconds
  });

  if (isLoading) {
    return (
      <section className="py-6 sm:py-8 px-3 sm:px-4 bg-muted/30">
        <div className="max-w-3xl mx-auto">
          <Card className="border-0 shadow-lg bg-background">
            <CardContent className="p-4 sm:p-6 md:p-8">
              <div className="flex items-center justify-center space-x-2 mb-4 sm:mb-6">
                <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                <h2 className="text-lg sm:text-xl font-bold text-foreground">Thought of the Day</h2>
              </div>
              <div className="space-y-3">
                <div className="h-5 bg-muted rounded-lg w-3/4 mx-auto"></div>
                <div className="h-5 bg-muted rounded-lg w-1/2 mx-auto"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

  if (error || !thought) {
    return (
      <section className="py-6 sm:py-8 px-3 sm:px-4 bg-muted/30">
        <div className="max-w-3xl mx-auto">
          <Card className="border-0 shadow-lg bg-background">
            <CardContent className="p-4 sm:p-6 md:p-8 text-center">
              <div className="flex items-center justify-center space-x-2 mb-4 sm:mb-6">
                <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                <h2 className="text-lg sm:text-xl font-bold text-foreground">Thought of the Day</h2>
              </div>
              <blockquote className="text-sm sm:text-base md:text-lg text-muted-foreground italic leading-relaxed mb-3 sm:mb-4">
                "The mind is everything. What you think you become."
              </blockquote>
              <cite className="text-xs sm:text-sm font-medium text-primary">— Buddha</cite>
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

  return (
    <section className="py-6 sm:py-8 px-3 sm:px-4 bg-muted/30" data-testid="thought-of-the-day-section">
      <div className="max-w-3xl mx-auto">
        <Card className="border-0 shadow-lg bg-background">
          <CardContent className="p-4 sm:p-6 md:p-8 text-center">
            <div className="flex items-center justify-center space-x-2 mb-6">
              <Sparkles className="h-6 w-6 text-primary" />
              <h2 className="text-xl font-bold text-foreground">
                Thought of the Day
              </h2>
            </div>
            
            <div className="relative">
              <Quote className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-primary/20 mx-auto mb-3 sm:mb-4" />
              <blockquote 
                className="text-foreground text-sm sm:text-base md:text-lg lg:text-xl leading-relaxed italic mb-4 sm:mb-6 max-w-2xl mx-auto break-words"
                data-testid="thought-content"
              >
                "{thought.content}"
              </blockquote>
              
              {thought.author && (
                <cite 
                  className="text-primary text-sm sm:text-base font-semibold not-italic block mb-3 sm:mb-4"
                  data-testid="thought-author"
                >
                  — {thought.author}
                </cite>
              )}
              
              {thought.category && (
                <div className="flex justify-center">
                  <span 
                    className="inline-block bg-primary/10 text-primary text-xs sm:text-sm px-3 sm:px-4 py-1 sm:py-2 rounded-full font-medium capitalize"
                    data-testid="thought-category"
                  >
                    {thought.category}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}