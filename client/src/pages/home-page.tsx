import { Navigation } from "@/components/navigation";
import { HeroSection } from "@/components/hero-section";
import { Card, CardContent } from "@/components/ui/card";
import { MessageCircle, Users, BookOpen, ArrowRight, Book, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function HomePage() {
  const features = [
    {
      title: "Chat with SaarthiAI",
      description: "Ask questions about Hindu scriptures and receive AI-powered spiritual guidance",
      icon: MessageCircle,
      href: "/chat",
      color: "from-blue-500 to-indigo-500"
    },
    {
      title: "Spiritual Community",
      description: "Connect with fellow seekers, share insights, and learn from others",
      icon: Users,
      href: "/community",
      color: "from-green-500 to-emerald-500"
    },
    {
      title: "Sacred Scriptures",
      description: "Explore the Bhagavad Gita, Vedas, Upanishads, and other sacred texts",
      icon: BookOpen,
      href: "/scripture",
      color: "from-orange-500 to-amber-500"
    },
    {
      title: "Personal Journal",
      description: "Document your spiritual journey and capture your thoughts and reflections",
      icon: Book,
      href: "/journal",
      color: "from-purple-500 to-pink-500"
    },
    {
      title: "Krishna Path Game",
      description: "Draw wisdom cards from the Bhagavad Gita for mindful guidance and reflection",
      icon: Sparkles,
      href: "/game",
      color: "from-orange-600 to-amber-600"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <HeroSection />
      
      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Explore Spiritual Wisdom
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Choose your path to discover the profound teachings of Hindu scriptures through modern technology.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6 max-w-7xl mx-auto">
            {features.map((feature, index) => (
              <Link key={index} href={feature.href}>
                <Card className="h-full hover:shadow-lg transition-all duration-300 cursor-pointer group hover:scale-105" data-testid={`feature-card-${index}`}>
                  <CardContent className="p-4 sm:p-6 text-center">
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r ${feature.color} mb-6 group-hover:scale-110 transition-transform duration-300`}>
                      <feature.icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground mb-4 leading-relaxed">
                      {feature.description}
                    </p>
                    <div className="flex items-center justify-center text-primary group-hover:text-primary/80 transition-colors">
                      <span className="text-sm font-medium mr-2">Explore</span>
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>
      
      {/* Quick Chat Access */}
      <Link href="/chat">
        <Button
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-12 h-12 sm:w-14 sm:h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-50"
          data-testid="floating-chat-button"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      </Link>
    </div>
  );
}
