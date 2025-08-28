import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Sparkles, 
  RefreshCw, 
  Heart, 
  Brain, 
  Shield, 
  Lightbulb,
  Users,
  User,
  Shuffle
} from "lucide-react";

interface WisdomCard {
  id: number;
  title: string;
  verse: string;
  wisdom: string;
  guidance: string;
  theme: "strength" | "clarity" | "peace" | "courage" | "wisdom" | "love";
  chapter: string;
}

const wisdomCards: WisdomCard[] = [
  {
    id: 1,
    title: "Transform Anger into Understanding",
    verse: "Anger leads to delusion, delusion to loss of memory, loss of memory to destruction of intelligence, and destruction of intelligence leads to ruin.",
    wisdom: "When you feel anger rising, pause and breathe. See it as energy that can be redirected toward understanding and compassion.",
    guidance: "Today, when faced with frustration, ask yourself: 'What is this emotion teaching me?' Channel that energy into wisdom rather than reaction.",
    theme: "strength",
    chapter: "Bhagavad Gita 2.63"
  },
  {
    id: 2,
    title: "Embrace Your Dharma",
    verse: "Better is one's own dharma, though imperfectly performed, than the dharma of another well performed.",
    wisdom: "Your authentic path, however challenging, leads to greater fulfillment than copying another's journey.",
    guidance: "Reflect on what feels most authentic to you today. Honor your unique gifts and responsibilities, even if they seem difficult.",
    theme: "clarity",
    chapter: "Bhagavad Gita 3.35"
  },
  {
    id: 3,
    title: "Find Peace in Detachment",
    verse: "You have the right to perform your actions, but you are not entitled to the fruits of action.",
    wisdom: "Peace comes from doing your best while releasing attachment to specific outcomes.",
    guidance: "Focus on the quality of your effort today, not the results. Give your best and trust the process.",
    theme: "peace",
    chapter: "Bhagavad Gita 2.47"
  },
  {
    id: 4,
    title: "Courage in Uncertainty",
    verse: "Now I am become Death, the destroyer of worlds. Yet action must be taken in the face of duty.",
    wisdom: "Even in the face of great uncertainty, we must act with courage when duty calls.",
    guidance: "What important action have you been avoiding? Today, take one small step forward despite your fears.",
    theme: "courage",
    chapter: "Bhagavad Gita 11.32"
  },
  {
    id: 5,
    title: "The Power of Equanimity",
    verse: "One who is not disturbed by happiness and distress and is steady in both is certainly eligible for liberation.",
    wisdom: "True strength lies in maintaining inner balance regardless of external circumstances.",
    guidance: "Notice your reactions to today's ups and downs. Practice maintaining your center through both pleasant and challenging moments.",
    theme: "wisdom",
    chapter: "Bhagavad Gita 2.15"
  },
  {
    id: 6,
    title: "Universal Love",
    verse: "I am the same to all beings; none is hateful or dear to me. But those who worship me with devotion are in me, and I am in them.",
    wisdom: "Divine love flows equally to all. When we open our hearts, we become vessels for this universal compassion.",
    guidance: "Practice seeing the divine spark in everyone you meet today. Send love even to those who challenge you.",
    theme: "love",
    chapter: "Bhagavad Gita 9.29"
  },
  {
    id: 7,
    title: "Mindful Action",
    verse: "Whatever you do, whatever you eat, whatever you offer in sacrifice, whatever you give away, whatever austerities you practice—do that as an offering.",
    wisdom: "Every action becomes sacred when performed with awareness and dedication to something greater than yourself.",
    guidance: "Transform routine tasks today into mindful offerings. Approach each activity with presence and intention.",
    theme: "wisdom",
    chapter: "Bhagavad Gita 9.27"
  },
  {
    id: 8,
    title: "Inner Strength",
    verse: "The mind is restless, turbulent, obstinate and very strong. To subdue it is more difficult than controlling the wind.",
    wisdom: "Acknowledge the challenge of mental discipline while persistently training your mind with patience and practice.",
    guidance: "When your mind feels scattered today, return to your breath. Each moment of awareness strengthens your inner discipline.",
    theme: "strength",
    chapter: "Bhagavad Gita 6.34"
  }
];

const themeColors = {
  strength: "bg-red-100 border-red-300 text-red-800",
  clarity: "bg-blue-100 border-blue-300 text-blue-800",
  peace: "bg-green-100 border-green-300 text-green-800",
  courage: "bg-orange-100 border-orange-300 text-orange-800",
  wisdom: "bg-purple-100 border-purple-300 text-purple-800",
  love: "bg-pink-100 border-pink-300 text-pink-800"
};

const themeIcons = {
  strength: Shield,
  clarity: Brain,
  peace: Heart,
  courage: Sparkles,
  wisdom: Lightbulb,
  love: Heart
};

export function KrishnaPathGame() {
  const [currentCard, setCurrentCard] = useState<WisdomCard | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [gameMode, setGameMode] = useState<"solo" | "shared">("solo");
  const [hasDrawnToday, setHasDrawnToday] = useState(false);

  useEffect(() => {
    // Check if user has drawn a card today (simple localStorage check)
    const lastDrawDate = localStorage.getItem("krishna-path-last-draw");
    const today = new Date().toDateString();
    
    if (lastDrawDate === today) {
      setHasDrawnToday(true);
      const savedCard = localStorage.getItem("krishna-path-today-card");
      if (savedCard) {
        setCurrentCard(JSON.parse(savedCard));
      }
    }
  }, []);

  const drawCard = () => {
    setIsDrawing(true);
    
    setTimeout(() => {
      const randomCard = wisdomCards[Math.floor(Math.random() * wisdomCards.length)];
      setCurrentCard(randomCard);
      setIsDrawing(false);
      
      // Save today's card
      const today = new Date().toDateString();
      localStorage.setItem("krishna-path-last-draw", today);
      localStorage.setItem("krishna-path-today-card", JSON.stringify(randomCard));
      setHasDrawnToday(true);
    }, 1500);
  };

  const drawNewCard = () => {
    setCurrentCard(null);
    setHasDrawnToday(false);
    localStorage.removeItem("krishna-path-last-draw");
    localStorage.removeItem("krishna-path-today-card");
    drawCard();
  };

  const IconComponent = currentCard ? themeIcons[currentCard.theme] : Sparkles;

  return (
    <section id="krishna-path-game" className="py-16 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Sparkles className="h-8 w-8 text-orange-500 mr-3" />
            <h2 className="text-3xl font-serif font-bold text-foreground">Krishna Path Game</h2>
            <Sparkles className="h-8 w-8 text-orange-500 ml-3" />
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-6">
            Draw a wisdom card from the Bhagavad Gita. Transform emotions into strength, challenges into clarity, 
            and moments into mindful growth.
          </p>
          
          {/* Game Mode Selection */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <Button
              variant={gameMode === "solo" ? "default" : "outline"}
              onClick={() => setGameMode("solo")}
              className="flex items-center gap-2"
              data-testid="button-solo-mode"
            >
              <User className="h-4 w-4" />
              Solo Reflection
            </Button>
            <Button
              variant={gameMode === "shared" ? "default" : "outline"}
              onClick={() => setGameMode("shared")}
              className="flex items-center gap-2"
              data-testid="button-shared-mode"
            >
              <Users className="h-4 w-4" />
              Shared Journey
            </Button>
          </div>
        </div>

        {!currentCard && !isDrawing && (
          <div className="text-center">
            <Card className="max-w-md mx-auto p-8 border-2 border-dashed border-orange-300 bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/20 dark:to-amber-900/20">
              <CardContent className="pt-6">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center">
                  <Sparkles className="h-12 w-12 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Begin Your Journey</h3>
                <p className="text-muted-foreground mb-6">
                  {gameMode === "solo" 
                    ? "Draw a card for personal reflection and inner guidance."
                    : "Draw a card to share wisdom and insights with others."
                  }
                </p>
                <Button 
                  onClick={drawCard}
                  className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
                  data-testid="button-draw-card"
                >
                  <Shuffle className="mr-2 h-4 w-4" />
                  Draw Your Card
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {isDrawing && (
          <div className="text-center">
            <Card className="max-w-md mx-auto p-8">
              <CardContent className="pt-6">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center animate-spin">
                  <Sparkles className="h-12 w-12 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Drawing Your Card...</h3>
                <p className="text-muted-foreground">The universe is selecting your guidance</p>
              </CardContent>
            </Card>
          </div>
        )}

        {currentCard && (
          <div className="max-w-2xl mx-auto">
            <Card className="overflow-hidden shadow-xl border-2 border-orange-200 bg-gradient-to-br from-white to-orange-50 dark:from-gray-900 dark:to-orange-950/30">
              <CardHeader className="bg-gradient-to-r from-orange-500 to-amber-500 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <IconComponent className="h-8 w-8" />
                    <div>
                      <CardTitle className="text-xl">{currentCard.title}</CardTitle>
                      <p className="text-orange-100 text-sm">{currentCard.chapter}</p>
                    </div>
                  </div>
                  <Badge className={`${themeColors[currentCard.theme]} capitalize`}>
                    {currentCard.theme}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="p-6 space-y-6">
                <div>
                  <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-orange-500" />
                    Sacred Verse
                  </h4>
                  <blockquote className="italic text-muted-foreground border-l-4 border-orange-300 pl-4 py-2">
                    "{currentCard.verse}"
                  </blockquote>
                </div>

                <Separator />

                <div>
                  <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-orange-500" />
                    Wisdom
                  </h4>
                  <p className="text-foreground leading-relaxed">{currentCard.wisdom}</p>
                </div>

                <Separator />

                <div>
                  <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <Heart className="h-4 w-4 text-orange-500" />
                    Today's Guidance
                  </h4>
                  <p className="text-foreground leading-relaxed">{currentCard.guidance}</p>
                </div>

                <div className="flex gap-3 pt-4">
                  {hasDrawnToday && (
                    <Button
                      variant="outline"
                      onClick={drawNewCard}
                      className="flex-1"
                      data-testid="button-draw-new"
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Draw New Card
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => setCurrentCard(null)}
                    className="flex-1"
                    data-testid="button-close-card"
                  >
                    Close Card
                  </Button>
                </div>
              </CardContent>
            </Card>

            {gameMode === "shared" && (
              <Card className="mt-6 bg-blue-50 dark:bg-blue-950/20 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Users className="h-5 w-5 text-blue-500 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Shared Journey</h4>
                      <p className="text-blue-600 dark:text-blue-300 text-sm">
                        Share this wisdom with friends or discuss how this guidance applies to your shared experiences. 
                        Collective reflection deepens understanding.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        <div className="text-center mt-12">
          <p className="text-sm text-muted-foreground">
            "The mind is everything. What you think you become." - Krishna's wisdom for modern souls
          </p>
        </div>
      </div>
    </section>
  );
}