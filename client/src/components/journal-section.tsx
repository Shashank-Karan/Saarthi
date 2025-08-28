import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Plus, BookOpen, Loader2, Calendar, Heart } from "lucide-react";
import { format } from "date-fns";

interface JournalEntry {
  id: string;
  title: string;
  content: string;
  author_id: string;
  created_at: string;
  mood?: string;
}

const journalEntrySchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title must be less than 100 characters"),
  content: z.string().min(1, "Content is required").max(2000, "Content must be less than 2000 characters"),
  mood: z.string().optional(),
});

type JournalEntryForm = z.infer<typeof journalEntrySchema>;

export function JournalSection() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm<JournalEntryForm>({
    resolver: zodResolver(journalEntrySchema),
    defaultValues: {
      title: "",
      content: "",
      mood: "peaceful",
    },
  });

  const { data: journalEntries = [], isLoading } = useQuery<JournalEntry[]>({
    queryKey: ["/api/journal"],
    enabled: !!user,
  });

  const createEntryMutation = useMutation({
    mutationFn: async (entry: JournalEntryForm) => {
      const res = await apiRequest("POST", "/api/journal", entry);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/journal"] });
      form.reset();
      setIsDialogOpen(false);
      toast({
        title: "Journal entry created",
        description: "Your thoughts have been saved to your personal journal.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create journal entry. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: JournalEntryForm) => {
    createEntryMutation.mutate(data);
  };

  const getMoodEmoji = (mood: string) => {
    const moods: { [key: string]: string } = {
      peaceful: "🕉️",
      grateful: "🙏",
      reflective: "🤔",
      joyful: "😊",
      contemplative: "🧘",
      inspired: "✨",
    };
    return moods[mood] || "📝";
  };

  return (
    <section id="journal" className="py-16 bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-serif font-bold text-foreground mb-2">Personal Journal</h2>
            <p className="text-muted-foreground">Reflect on your spiritual journey and capture your thoughts</p>
          </div>
          {user && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="shadow-lg hover:shadow-xl transition-all duration-300" data-testid="button-create-entry">
                  <Plus className="mr-2 h-4 w-4" />
                  New Entry
                </Button>
              </DialogTrigger>
              <DialogContent className="mx-4 sm:mx-0 sm:max-w-md max-w-[95vw]">
                <DialogHeader>
                  <DialogTitle>Create Journal Entry</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="What's on your mind today..."
                              {...field}
                              data-testid="input-entry-title"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="content"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Content</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Share your reflections, insights, or thoughts..."
                              rows={6}
                              {...field}
                              data-testid="textarea-entry-content"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="mood"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mood</FormLabel>
                          <FormControl>
                            <select 
                              {...field} 
                              className="w-full px-3 py-2 border border-input bg-background rounded-md"
                              data-testid="select-entry-mood"
                            >
                              <option value="peaceful">🕉️ Peaceful</option>
                              <option value="grateful">🙏 Grateful</option>
                              <option value="reflective">🤔 Reflective</option>
                              <option value="joyful">😊 Joyful</option>
                              <option value="contemplative">🧘 Contemplative</option>
                              <option value="inspired">✨ Inspired</option>
                            </select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={createEntryMutation.isPending}
                      data-testid="button-submit-entry"
                    >
                      {createEntryMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <BookOpen className="mr-2 h-4 w-4" />
                          Save Entry
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {!user ? (
          <Card className="text-center py-12">
            <CardContent>
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Start Your Spiritual Journal</h3>
              <p className="text-muted-foreground">
                Sign in to begin documenting your spiritual journey and personal reflections.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {isLoading ? (
              <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
                {[...Array(4)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="h-3 bg-muted rounded"></div>
                        <div className="h-3 bg-muted rounded"></div>
                        <div className="h-3 bg-muted rounded w-3/4"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : journalEntries.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Your Journal Awaits</h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first journal entry to begin documenting your spiritual journey.
                  </p>
                  <Button 
                    onClick={() => setIsDialogOpen(true)}
                    data-testid="button-first-entry"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Write Your First Entry
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2 auto-rows-max" data-testid="journal-entries">
                {journalEntries.map((entry) => (
                  <Card
                    key={entry.id}
                    className="hover:shadow-lg transition-shadow h-fit"
                    data-testid={`journal-entry-${entry.id}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <CardTitle className="text-lg font-serif line-clamp-2">
                          {entry.title}
                        </CardTitle>
                        <div className="text-2xl ml-2">
                          {getMoodEmoji(entry.mood || "peaceful")}
                        </div>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground mb-3">
                        <Calendar className="h-4 w-4 mr-1" />
                        {format(new Date(entry.created_at), "MMMM d, yyyy 'at' h:mm a")}
                      </div>
                      <p className="text-muted-foreground leading-relaxed">
                        {entry.content}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}

        {journalEntries.length > 0 && (
          <div className="text-center mt-8">
            <p className="text-sm text-muted-foreground">
              Your personal journal entries are private and only visible to you.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}