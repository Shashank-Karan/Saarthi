import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  Sparkles, 
  Heart, 
  Brain, 
  Shield, 
  Lightbulb,
  Crown,
  Flower2,
  Feather,
  ArrowRight,
  RotateCcw,
  Home,
  Smile,
  AlertTriangle,
  Flame,
  Cloud,
  Moon,
  User
} from "lucide-react";

// Types
interface Emotion {
  id: string;
  name: string;
  display_name: string;
  description?: string;
  color: string;
  is_active: boolean;
  created_at: string;
}

interface Verse {
  id: string;
  emotion_id: string;
  sanskrit: string;
  hindi: string;
  english: string;
  explanation: string;
  chapter?: string;
  verse_number?: string;
  is_active: boolean;
  created_at: string;
  emotion: Emotion;
}

type JourneyStep = "welcome" | "emotion-selection" | "slip-drawing" | "verse-display";

const emotionIcons: Record<string, any> = {
  happy: Smile,
  peace: Flower2,
  anxious: AlertTriangle,
  angry: Flame,
  sad: Cloud,
  protection: Shield,
  lazy: Moon,
  lonely: User,
};

// Function to generate dynamic colors based on emotion color
const getEmotionCardStyle = (emotionColor: string) => {
  return {
    backgroundColor: emotionColor + '20', // Light background
    iconBackgroundColor: emotionColor, // Icon background
    textColor: emotionColor, // Text color
    borderColor: emotionColor + '40' // Border color
  };
};

export function KrishnaPathJourney() {
  const [currentStep, setCurrentStep] = useState<JourneyStep>("welcome");
  const [selectedEmotion, setSelectedEmotion] = useState<Emotion | null>(null);
  const [selectedVerse, setSelectedVerse] = useState<Verse | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const queryClient = useQueryClient();

  // Fetch emotions
  const { data: emotions = [], isLoading: emotionsLoading } = useQuery<Emotion[]>({
    queryKey: ["/api/krishna-path/emotions"],
    enabled: currentStep === "emotion-selection"
  });

  // Fetch verse count for selected emotion
  const { data: verseCount = 0 } = useQuery<number>({
    queryKey: ["/api/krishna-path/verses/count", selectedEmotion?.id],
    enabled: currentStep === "slip-drawing" && !!selectedEmotion,
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/krishna-path/verses/count/${selectedEmotion?.id}`);
      const data = await response.json();
      return data.count || 0;
    }
  });

  // Mutation to track interaction
  const trackInteraction = useMutation({
    mutationFn: async (data: { emotion_id: string; verse_id: string; session_id?: string }) => {
      const response = await apiRequest('POST', `/api/krishna-path/interactions`, data);
      return response.json();
    }
  });

  // Fetch random verse for selected emotion
  const getRandomVerse = async (emotionId: string): Promise<Verse> => {
    const response = await apiRequest('GET', `/api/krishna-path/verses/${emotionId}/random`);
    return response.json();
  };

  const handleEmotionSelect = (emotion: Emotion) => {
    setSelectedEmotion(emotion);
    setCurrentStep("slip-drawing");
  };

  const handleDrawSlip = async () => {
    if (!selectedEmotion) return;
    
    try {
      const verse = await getRandomVerse(selectedEmotion.id);
      setSelectedVerse(verse);
      
      // Track interaction
      await trackInteraction.mutateAsync({
        emotion_id: selectedEmotion.id,
        verse_id: verse.id,
        session_id: Date.now().toString()
      });
      
      setCurrentStep("verse-display");
    } catch (error) {
      console.error("Error fetching verse:", error);
    }
  };

  const resetJourney = () => {
    setCurrentStep("welcome");
    setSelectedEmotion(null);
    setSelectedVerse(null);
    setIsDrawing(false);
  };

  const goToEmotionSelection = () => {
    setCurrentStep("emotion-selection");
    setSelectedVerse(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6 md:space-y-8 px-3 sm:px-4">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center mb-3 sm:mb-4">
          <Crown className="h-6 w-6 sm:h-8 sm:w-8 text-orange-500 mr-2 sm:mr-3" />
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
            Krishna Path
          </h1>
          <Crown className="h-6 w-6 sm:h-8 sm:w-8 text-orange-500 ml-2 sm:ml-3" />
        </div>
        <p className="text-muted-foreground text-sm sm:text-base md:text-lg max-w-2xl mx-auto px-4 sm:px-0">
          A sacred journey through emotions guided by Krishna's timeless wisdom
        </p>
      </div>

      {/* Progress Indicator */}
      <div className="flex justify-center mb-4 sm:mb-6 md:mb-8 overflow-x-auto px-4">
        <div className="flex items-center space-x-2 sm:space-x-4 min-w-max">
          {[
            { step: "welcome", label: "Welcome", icon: Home },
            { step: "emotion-selection", label: "Choose Emotion", icon: Heart },
            { step: "slip-drawing", label: "Draw Slip", icon: Sparkles },
            { step: "verse-display", label: "Receive Wisdom", icon: Flower2 }
          ].map(({ step, label, icon: Icon }, index) => {
            const isActive = currentStep === step;
            const isCompleted = ["welcome", "emotion-selection", "slip-drawing"].indexOf(currentStep) > 
                              ["welcome", "emotion-selection", "slip-drawing"].indexOf(step);
            
            return (
              <div key={step} className="flex items-center">
                <div className={`
                  flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 transition-all duration-300
                  ${isActive ? 'bg-orange-500 border-orange-500 text-white' : 
                    isCompleted ? 'bg-green-500 border-green-500 text-white' : 
                    'bg-white border-gray-300 text-gray-400'}
                `}>
                  <Icon className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5" />
                </div>
                {index < 3 && (
                  <div className={`
                    w-4 sm:w-6 md:w-8 h-0.5 mx-1 sm:mx-2 transition-all duration-300
                    ${isCompleted ? 'bg-green-500' : 'bg-gray-300'}
                  `} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <div className="min-h-[400px] sm:min-h-[500px] flex items-center justify-center">
        
        {/* Welcome Step */}
        {currentStep === "welcome" && (
          <Card className="max-w-2xl w-full glass-card border-2 border-orange-200 bg-gradient-to-br from-white/80 to-orange-50/80 backdrop-blur-sm">
            <CardHeader className="text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-3 sm:mb-4 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center sacred-float">
                <Crown className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
              </div>
              <CardTitle className="text-xl sm:text-2xl font-serif">Welcome to Your Sacred Journey</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4 sm:space-y-6 p-4 sm:p-6">
              <p className="text-muted-foreground text-sm sm:text-base md:text-lg leading-relaxed">
                In the depths of the Bhagavad Gita lie timeless truths that speak to every human emotion. 
                Krishna's wisdom transforms our feelings into pathways of growth and understanding.
              </p>
              <div className="bg-orange-100/50 rounded-lg p-3 sm:p-4 space-y-2">
                <h3 className="font-semibold text-orange-800 text-sm sm:text-base">Your Journey</h3>
                <p className="text-orange-700 text-xs sm:text-sm">
                  Choose your current emotion, draw a sacred slip, and receive personalized guidance 
                  from Krishna's eternal wisdom in Sanskrit, Hindi, and English.
                </p>
              </div>
              <Button 
                onClick={() => setCurrentStep("emotion-selection")}
                className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-6 sm:px-8 py-2 sm:py-3 text-sm sm:text-base md:text-lg sacred-pulse w-full sm:w-auto"
                data-testid="button-begin-journey"
              >
                Begin Your Journey
                <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Emotion Selection Step */}
        {currentStep === "emotion-selection" && (
          <div className="w-full max-w-4xl">
            <Card className="glass-card border-2 border-orange-200 bg-gradient-to-br from-white/80 to-orange-50/80 backdrop-blur-sm">
              <CardHeader className="text-center p-4 sm:p-6">
                <CardTitle className="text-xl sm:text-2xl font-serif">Choose Your Current Emotion</CardTitle>
                <p className="text-muted-foreground text-sm sm:text-base">
                  Select the emotion that resonates with your heart right now
                </p>
              </CardHeader>
              <CardContent className="p-3 sm:p-4 md:p-6">
                {emotionsLoading ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                    {[...Array(8)].map((_, i) => (
                      <div key={i} className="min-h-[120px] sm:min-h-[140px] bg-gray-200 rounded-2xl animate-pulse" />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                    {emotions.map((emotion: Emotion) => {
                      const IconComponent = emotionIcons[emotion.name] || Heart;
                      const cardStyle = getEmotionCardStyle(emotion.color);
                      return (
                        <div
                          key={emotion.id}
                          onClick={() => handleEmotionSelect(emotion)}
                          className="rounded-2xl p-3 sm:p-4 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg border backdrop-blur-sm min-h-[120px] sm:min-h-[140px] flex flex-col justify-between"
                          style={{
                            backgroundColor: cardStyle.backgroundColor,
                            borderColor: cardStyle.borderColor
                          }}
                          data-testid={`emotion-${emotion.name}`}
                        >
                          <div className="flex flex-col items-start">
                            <div 
                              className="p-2 sm:p-3 rounded-xl mb-2 sm:mb-3 shadow-sm"
                              style={{ backgroundColor: cardStyle.iconBackgroundColor }}
                            >
                              <IconComponent className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-white" />
                            </div>
                            <h3 
                              className="font-semibold text-sm sm:text-base md:text-lg mb-1"
                              style={{ color: cardStyle.textColor }}
                            >
                              {emotion.display_name}
                            </h3>
                            {emotion.description && (
                              <p 
                                className="text-xs sm:text-sm opacity-75 leading-relaxed break-words"
                                style={{ color: cardStyle.textColor }}
                              >
                                {emotion.description}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Slip Drawing Step */}
        {currentStep === "slip-drawing" && selectedEmotion && (
          <Card 
            className="max-w-2xl w-full glass-card border-2 backdrop-blur-sm"
            style={{
              backgroundColor: selectedEmotion.color + "10",
              borderColor: selectedEmotion.color + "40"
            }}
          >
            <CardHeader className="text-center p-4 sm:p-6">
              <CardTitle className="text-xl sm:text-2xl font-serif">Draw Your Sacred Slip</CardTitle>
              <p className="text-muted-foreground text-sm sm:text-base">
                You have chosen: <Badge style={{ backgroundColor: selectedEmotion.color + "20", color: selectedEmotion.color }} className="text-xs sm:text-sm">
                  {selectedEmotion.display_name}
                </Badge>
              </p>
            </CardHeader>
            <CardContent className="text-center space-y-4 sm:space-y-6 p-4 sm:p-6">
              <p className="text-muted-foreground mb-4 sm:mb-6 text-sm sm:text-base">
                Take a moment to center yourself. Choose a slip to receive Krishna's guidance.
              </p>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 sm:gap-4 max-w-xs sm:max-w-md mx-auto">
                {verseCount > 0 ? (
                  [...Array(verseCount)].map((_, index) => (
                    <div
                      key={index}
                      onClick={() => handleDrawSlip()}
                      className="aspect-square rounded-2xl cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg flex items-center justify-center p-2 sm:p-3 md:p-4"
                      style={{
                        backgroundColor: selectedEmotion.color + '20',
                        border: `2px solid ${selectedEmotion.color}40`
                      }}
                      data-testid={`slip-card-${index}`}
                    >
                      <div 
                        className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: selectedEmotion.color }}
                      >
                        <Flower2 className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-4 text-center text-muted-foreground py-8">
                    <p>No verses available for this emotion yet.</p>
                    <p className="text-sm mt-2">Please try another emotion or contact the administrator.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Verse Display Step */}
        {currentStep === "verse-display" && selectedVerse && (
          <div className="w-full max-w-3xl">
            <Card className="glass-card border-2 border-orange-200 bg-gradient-to-br from-white/80 to-orange-50/80 backdrop-blur-sm shadow-xl">
              <CardHeader className="bg-gradient-to-r from-orange-500 to-amber-500 text-white p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Flower2 className="h-6 w-6 sm:h-8 sm:w-8 flex-shrink-0" />
                    <div className="min-w-0">
                      <CardTitle className="text-lg sm:text-xl">Krishna's Wisdom</CardTitle>
                      <p className="text-orange-100 text-xs sm:text-sm break-words">
                        {selectedVerse.chapter && selectedVerse.verse_number && 
                          `Bhagavad Gita ${selectedVerse.chapter}.${selectedVerse.verse_number}`
                        }
                      </p>
                    </div>
                  </div>
                  <Badge 
                    style={{ 
                      backgroundColor: selectedEmotion?.color + "20", 
                      color: selectedEmotion?.color,
                      borderColor: selectedEmotion?.color 
                    }}
                    className="border text-xs sm:text-sm flex-shrink-0"
                  >
                    {selectedEmotion?.display_name}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                {/* Sanskrit */}
                <div>
                  <h4 className="font-semibold text-orange-600 mb-2 flex items-center gap-2 text-sm sm:text-base">
                    <Crown className="h-3 w-3 sm:h-4 sm:w-4" />
                    Sanskrit (Original)
                  </h4>
                  <blockquote className="text-sm sm:text-base md:text-lg font-serif italic text-orange-800 border-l-4 border-orange-300 pl-3 sm:pl-4 py-2 bg-orange-50 rounded-r break-words">
                    {selectedVerse.sanskrit}
                  </blockquote>
                </div>

                {/* Hindi */}
                <div>
                  <h4 className="font-semibold text-amber-600 mb-2 flex items-center gap-2 text-sm sm:text-base">
                    <Heart className="h-3 w-3 sm:h-4 sm:w-4" />
                    Hindi (हिन्दी)
                  </h4>
                  <blockquote className="text-sm sm:text-base md:text-lg font-medium text-amber-800 border-l-4 border-amber-300 pl-3 sm:pl-4 py-2 bg-amber-50 rounded-r break-words">
                    {selectedVerse.hindi}
                  </blockquote>
                </div>

                {/* English */}
                <div>
                  <h4 className="font-semibold text-yellow-600 mb-2 flex items-center gap-2 text-sm sm:text-base">
                    <Lightbulb className="h-3 w-3 sm:h-4 sm:w-4" />
                    English Translation
                  </h4>
                  <blockquote className="text-sm sm:text-base md:text-lg text-yellow-800 border-l-4 border-yellow-300 pl-3 sm:pl-4 py-2 bg-yellow-50 rounded-r break-words">
                    {selectedVerse.english}
                  </blockquote>
                </div>

                {/* Explanation */}
                <div className="bg-gradient-to-br from-orange-100 to-amber-100 rounded-lg p-3 sm:p-4">
                  <h4 className="font-semibold text-orange-800 mb-2 flex items-center gap-2 text-sm sm:text-base">
                    <Brain className="h-3 w-3 sm:h-4 sm:w-4" />
                    Wisdom for Your Journey
                  </h4>
                  <p className="text-orange-700 leading-relaxed text-sm sm:text-base break-words">{selectedVerse.explanation}</p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-3 sm:pt-4">
                  <Button
                    variant="outline"
                    onClick={goToEmotionSelection}
                    className="flex-1 text-xs sm:text-sm"
                    data-testid="button-new-emotion"
                  >
                    <Heart className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden xs:inline">Choose Different Emotion</span>
                    <span className="xs:hidden">New Emotion</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={resetJourney}
                    className="flex-1 text-xs sm:text-sm"
                    data-testid="button-start-over"
                  >
                    <RotateCcw className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden xs:inline">Start Over</span>
                    <span className="xs:hidden">Reset</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}