import { useParams, useLocation } from "wouter";
import { Navigation } from "@/components/navigation";
import { ScriptureSection } from "@/components/scripture-section";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Scroll, Feather, Clover, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ScriptureData {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  content: {
    introduction: string;
    keyTeachings: string[];
    famousVerses: { verse: string; translation: string; chapter?: string }[];
  };
}

const scriptureData: Record<string, ScriptureData> = {
  "bhagavad-gita": {
    title: "Bhagavad Gita",
    description: "The eternal dialogue between Prince Arjuna and Lord Krishna",
    icon: BookOpen,
    content: {
      introduction: "The Bhagavad Gita, often referred to as the Gita, is a 700-verse Hindu scripture that is part of the epic Mahabharata. It consists of a conversation between Prince Arjuna and his guide Lord Krishna on the battlefield of Kurukshetra.",
      keyTeachings: [
        "Dharma (Righteous Duty)",
        "Karma Yoga (Path of Action)",
        "Bhakti Yoga (Path of Devotion)",
        "Jnana Yoga (Path of Knowledge)",
        "The nature of the eternal soul (Atman)",
        "Detachment from results of action"
      ],
      famousVerses: [
        {
          verse: "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन। मा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि।।",
          translation: "You have the right to perform your prescribed duties, but never to the fruits of action. Never consider yourself the cause of the results of your activities, nor be attached to inaction.",
          chapter: "Chapter 2, Verse 47"
        },
        {
          verse: "योगस्थः कुरु कर्माणि सङ्गं त्यक्त्वा धनञ्जय। सिद्ध्यसिद्ध्योः समो भूत्वा समत्वं योग उच्यते।।",
          translation: "Perform your duty equipoised, O Arjuna, abandoning all attachment to success or failure. Such equanimity is called yoga.",
          chapter: "Chapter 2, Verse 48"
        }
      ]
    }
  },
  "vedas": {
    title: "Vedas",
    description: "The foundational scriptures of Hinduism containing ancient wisdom",
    icon: Scroll,
    content: {
      introduction: "The Vedas are a large body of religious texts originating in ancient India. Composed in Vedic Sanskrit, they are the oldest Hindu scriptures and are considered shruti (divine revelation) by Hindus.",
      keyTeachings: [
        "Rigveda - Hymns of praise and worship",
        "Samaveda - Melodies and chants",
        "Yajurveda - Sacrificial formulas",
        "Atharvaveda - Spells and everyday rituals",
        "The cosmic order (Rita)",
        "Fire sacrifices and rituals"
      ],
      famousVerses: [
        {
          verse: "एकं सद्विप्रा बहुधा वदन्ति।",
          translation: "Truth is one, but the wise call it by many names.",
          chapter: "Rigveda 1.164.46"
        },
        {
          verse: "वसुधैव कुटुम्बकम्।",
          translation: "The world is one family.",
          chapter: "Maha Upanishad 6.71"
        }
      ]
    }
  },
  "upanishads": {
    title: "Upanishads",
    description: "Philosophical texts exploring the nature of ultimate reality",
    icon: Feather,
    content: {
      introduction: "The Upanishads are late Vedic Sanskrit texts that form the theoretical basis for the Hindu religion. They are also known as Vedanta, the end of the Vedas, as they constitute the final portion of the Vedic corpus.",
      keyTeachings: [
        "The nature of Brahman (Ultimate Reality)",
        "The identity of Atman (Individual Soul) and Brahman",
        "The doctrine of Maya (Illusion)",
        "The path to Moksha (Liberation)",
        "Meditation and self-inquiry",
        "The four great statements (Mahavakyas)"
      ],
      famousVerses: [
        {
          verse: "तत्त्वमसि।",
          translation: "Thou art That.",
          chapter: "Chandogya Upanishad"
        },
        {
          verse: "अहं ब्रह्मास्मि।",
          translation: "I am Brahman.",
          chapter: "Brihadaranyaka Upanishad"
        }
      ]
    }
  },
  "puranas": {
    title: "Puranas",
    description: "Ancient stories and legends conveying spiritual wisdom",
    icon: Clover,
    content: {
      introduction: "The Puranas are a genre of important Hindu, Jain and Sikh religious texts, notably consisting of narratives of the history of the universe from creation to destruction, genealogies of kings, heroes, sages, and demigods.",
      keyTeachings: [
        "Stories of creation and cosmic cycles",
        "Lives and teachings of avatars",
        "Devotional practices and rituals",
        "Genealogies of gods and sages",
        "Moral and ethical instructions",
        "Sacred geography and pilgrimage sites"
      ],
      famousVerses: [
        {
          verse: "धर्मो रक्षति रक्षितः।",
          translation: "Dharma protects those who protect it.",
          chapter: "Various Puranas"
        },
        {
          verse: "यदा यदा हि धर्मस्य ग्लानिर्भवति भारत।",
          translation: "Whenever there is a decline in dharma, O Bharata...",
          chapter: "Bhagavata Purana"
        }
      ]
    }
  }
};

export default function ScripturePage() {
  const { scriptureType } = useParams<{ scriptureType?: string }>();
  const [, setLocation] = useLocation();

  // If no specific scripture is selected, show the overview
  if (!scriptureType) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <ScriptureSection />
        </div>
      </div>
    );
  }

  const scripture = scriptureData[scriptureType];
  
  if (!scripture) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Scripture not found</h1>
            <Button onClick={() => setLocation('/scripture')} className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Scriptures
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const IconComponent = scripture.icon;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <Button 
          onClick={() => setLocation('/scripture')} 
          variant="outline" 
          className="mb-6"
          data-testid="button-back-to-scriptures"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Scriptures
        </Button>
        
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-primary/20 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <IconComponent className="h-10 w-10" />
            </div>
            <h1 className="text-4xl font-serif font-bold text-foreground mb-2">
              {scripture.title}
            </h1>
            <p className="text-lg text-muted-foreground">
              {scripture.description}
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-1">
            {/* Introduction */}
            <Card data-testid="card-introduction">
              <CardHeader>
                <CardTitle>Introduction</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {scripture.content.introduction}
                </p>
              </CardContent>
            </Card>

            {/* Key Teachings */}
            <Card data-testid="card-key-teachings">
              <CardHeader>
                <CardTitle>Key Teachings</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {scripture.content.keyTeachings.map((teaching, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-muted-foreground">{teaching}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Famous Verses */}
            <Card data-testid="card-famous-verses">
              <CardHeader>
                <CardTitle>Famous Verses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {scripture.content.famousVerses.map((verse, index) => (
                    <div key={index} className="border-l-4 border-primary pl-4">
                      <p className="text-lg font-sanskrit mb-2 text-foreground">
                        {verse.verse}
                      </p>
                      <p className="text-muted-foreground mb-2 italic">
                        {verse.translation}
                      </p>
                      {verse.chapter && (
                        <p className="text-sm text-primary font-medium">
                          {verse.chapter}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}