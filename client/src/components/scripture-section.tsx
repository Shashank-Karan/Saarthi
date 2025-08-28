import { useState } from "react";
import { useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search, BookOpen, Scroll, Feather, Clover } from "lucide-react";

export function ScriptureSection() {
  const [searchQuery, setSearchQuery] = useState("");
  const [, setLocation] = useLocation();

  const scriptures = [
    {
      title: "Bhagavad Gita",
      description: "700 verses of divine wisdom and guidance",
      icon: BookOpen,
      color: "bg-primary/20 text-primary",
      path: "/scripture/bhagavad-gita",
    },
    {
      title: "Vedas",
      description: "Ancient hymns and spiritual knowledge",
      icon: Scroll,
      color: "bg-secondary/20 text-secondary",
      path: "/scripture/vedas",
    },
    {
      title: "Upanishads",
      description: "Philosophical texts on ultimate reality",
      icon: Feather,
      color: "bg-accent/20 text-accent",
      path: "/scripture/upanishads",
    },
    {
      title: "Puranas",
      description: "Stories and teachings of divine",
      icon: Clover,
      color: "bg-primary/20 text-primary",
      path: "/scripture/puranas",
    },
  ];

  const handleScriptureClick = (scripture: typeof scriptures[0]) => {
    setLocation(scripture.path);
  };

  return (
    <section id="scriptures" className="py-16 bg-muted/30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-serif font-bold text-foreground mb-4">
            Explore Sacred Texts
          </h2>
          <p className="text-muted-foreground text-lg">
            Dive deep into the wisdom of ancient Hindu scriptures
          </p>
        </div>
        
        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search scriptures, verses, or topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-4 py-4 text-lg"
              data-testid="input-scripture-search"
            />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
          </div>
        </div>
        
        {/* Scripture Categories */}
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" data-testid="scripture-categories">
          {scriptures.map((scripture, index) => (
            <Card
              key={index}
              className="hover:shadow-lg transition-shadow cursor-pointer hover:scale-105 transition-transform"
              onClick={() => handleScriptureClick(scripture)}
              data-testid={`scripture-card-${scripture.title.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <CardContent className="p-6 text-center">
                <div className={`w-16 h-16 ${scripture.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <scripture.icon className="h-8 w-8" />
                </div>
                <h3 className="font-serif font-semibold text-foreground mb-2">
                  {scripture.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {scripture.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {searchQuery && (
          <div className="mt-8 text-center">
            <p className="text-muted-foreground">
              Search functionality will be implemented to find specific verses and topics
              across all scriptures.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
