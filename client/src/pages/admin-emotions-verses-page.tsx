import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { Heart, BookOpen, Search, Plus, Edit, Trash2, Eye } from "lucide-react";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";

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

export default function AdminEmotionsVersesPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [emotionsSearch, setEmotionsSearch] = useState("");
  const [versesSearch, setVersesSearch] = useState("");
  const [editingEmotion, setEditingEmotion] = useState<Emotion | null>(null);
  const [editingVerse, setEditingVerse] = useState<Verse | null>(null);
  const [showEmotionDialog, setShowEmotionDialog] = useState(false);
  const [showVerseDialog, setShowVerseDialog] = useState(false);

  // Redirect if not admin
  useEffect(() => {
    if (user && !user.is_admin) {
      setLocation("/");
    }
  }, [user, setLocation]);

  // Queries
  const { data: emotions, isLoading: emotionsLoading } = useQuery({
    queryKey: ["/api/krishna-path/admin/emotions"],
    enabled: !!user?.is_admin,
  });

  const { data: verses, isLoading: versesLoading } = useQuery({
    queryKey: ["/api/krishna-path/admin/verses"],
    enabled: !!user?.is_admin,
  });

  // Filter data based on search
  const filteredEmotions = emotions?.filter((emotion: Emotion) =>
    emotion.display_name.toLowerCase().includes(emotionsSearch.toLowerCase()) ||
    emotion.name.toLowerCase().includes(emotionsSearch.toLowerCase()) ||
    (emotion.description && emotion.description.toLowerCase().includes(emotionsSearch.toLowerCase()))
  );

  const filteredVerses = verses?.filter((verse: Verse) =>
    verse.sanskrit.toLowerCase().includes(versesSearch.toLowerCase()) ||
    verse.hindi.toLowerCase().includes(versesSearch.toLowerCase()) ||
    verse.english.toLowerCase().includes(versesSearch.toLowerCase()) ||
    verse.explanation.toLowerCase().includes(versesSearch.toLowerCase()) ||
    verse.emotion.display_name.toLowerCase().includes(versesSearch.toLowerCase())
  );

  // Forms
  const emotionForm = useForm({
    defaultValues: {
      name: "",
      display_name: "",
      description: "",
      color: "#FFD700",
      is_active: true,
    }
  });

  const verseForm = useForm({
    defaultValues: {
      emotion_id: "",
      sanskrit: "",
      hindi: "",
      english: "",
      explanation: "",
      chapter: "",
      verse_number: "",
      is_active: true,
    }
  });

  // Mutations
  const createEmotionMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/krishna-path/emotions", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/krishna-path/admin/emotions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/krishna-path/emotions"] });
      toast({ title: "Success", description: "Emotion created successfully." });
      setShowEmotionDialog(false);
      emotionForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create emotion.",
        variant: "destructive",
      });
    },
  });

  const updateEmotionMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return await apiRequest("PUT", `/api/krishna-path/emotions/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/krishna-path/admin/emotions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/krishna-path/emotions"] });
      toast({ title: "Success", description: "Emotion updated successfully." });
      setShowEmotionDialog(false);
      setEditingEmotion(null);
      emotionForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update emotion.",
        variant: "destructive",
      });
    },
  });

  const deleteEmotionMutation = useMutation({
    mutationFn: async ({ emotionId, force = false }: { emotionId: string; force?: boolean }) => {
      const url = `/api/krishna-path/emotions/${emotionId}${force ? '?force=true' : ''}`;
      return await apiRequest("DELETE", url);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/krishna-path/admin/emotions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/krishna-path/emotions"] });
      toast({ title: "Success", description: "Emotion deleted successfully." });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete emotion.",
        variant: "destructive",
      });
    },
  });

  const createVerseMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/krishna-path/verses", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/krishna-path/admin/verses"] });
      toast({ title: "Success", description: "Verse created successfully." });
      setShowVerseDialog(false);
      verseForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create verse.",
        variant: "destructive",
      });
    },
  });

  const updateVerseMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return await apiRequest("PUT", `/api/krishna-path/verses/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/krishna-path/admin/verses"] });
      toast({ title: "Success", description: "Verse updated successfully." });
      setShowVerseDialog(false);
      setEditingVerse(null);
      verseForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update verse.",
        variant: "destructive",
      });
    },
  });

  const deleteVerseMutation = useMutation({
    mutationFn: async (verseId: string) => {
      return await apiRequest("DELETE", `/api/krishna-path/verses/${verseId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/krishna-path/admin/verses"] });
      toast({ title: "Success", description: "Verse deleted successfully." });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete verse.",
        variant: "destructive",
      });
    },
  });

  // Handlers
  const handleCreateEmotion = () => {
    setEditingEmotion(null);
    emotionForm.reset();
    setShowEmotionDialog(true);
  };

  const handleEditEmotion = (emotion: Emotion) => {
    setEditingEmotion(emotion);
    emotionForm.reset({
      name: emotion.name,
      display_name: emotion.display_name,
      description: emotion.description || "",
      color: emotion.color,
      is_active: emotion.is_active,
    });
    setShowEmotionDialog(true);
  };

  const handleCreateVerse = () => {
    setEditingVerse(null);
    verseForm.reset();
    setShowVerseDialog(true);
  };

  const handleEditVerse = (verse: Verse) => {
    setEditingVerse(verse);
    verseForm.reset({
      emotion_id: verse.emotion_id,
      sanskrit: verse.sanskrit,
      hindi: verse.hindi,
      english: verse.english,
      explanation: verse.explanation,
      chapter: verse.chapter || "",
      verse_number: verse.verse_number || "",
      is_active: verse.is_active,
    });
    setShowVerseDialog(true);
  };

  const onSubmitEmotion = (data: any) => {
    if (editingEmotion) {
      updateEmotionMutation.mutate({ id: editingEmotion.id, data });
    } else {
      createEmotionMutation.mutate(data);
    }
  };

  const onSubmitVerse = (data: any) => {
    if (editingVerse) {
      updateVerseMutation.mutate({ id: editingVerse.id, data });
    } else {
      createVerseMutation.mutate(data);
    }
  };

  if (!user?.is_admin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50 flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="text-center text-red-600">Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground">
              You don't have permission to access emotions and verses management.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Heart className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-gray-900">Emotions & Verses Management</h1>
          </div>
          <p className="text-gray-600">Manage spiritual emotions and their associated verses</p>
        </div>

        <Tabs defaultValue="emotions" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="emotions" data-testid="tab-emotions">
              <Heart className="h-4 w-4 mr-2" />
              Emotions ({emotions?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="verses" data-testid="tab-verses">
              <BookOpen className="h-4 w-4 mr-2" />
              Verses ({verses?.length || 0})
            </TabsTrigger>
          </TabsList>

          {/* Emotions Tab */}
          <TabsContent value="emotions">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Emotions</CardTitle>
                    <CardDescription>Manage spiritual emotions and their properties</CardDescription>
                  </div>
                  <Button onClick={handleCreateEmotion} data-testid="button-create-emotion">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Emotion
                  </Button>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex-1 max-w-md">
                    <Label htmlFor="emotions-search">Search Emotions</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="emotions-search"
                        placeholder="Search emotions by name or description..."
                        value={emotionsSearch}
                        onChange={(e) => setEmotionsSearch(e.target.value)}
                        className="pl-10"
                        data-testid="input-search-emotions"
                      />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {emotionsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading emotions...</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Color</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Display Name</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredEmotions?.map((emotion: Emotion) => (
                        <TableRow key={emotion.id}>
                          <TableCell>
                            <div 
                              className="w-6 h-6 rounded-full border border-gray-300"
                              style={{ backgroundColor: emotion.color }}
                            />
                          </TableCell>
                          <TableCell>
                            <code className="text-sm">{emotion.name}</code>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{emotion.display_name}</div>
                          </TableCell>
                          <TableCell>
                            <div className="max-w-md text-sm text-muted-foreground">
                              {emotion.description || "No description"}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={emotion.is_active ? "default" : "secondary"}>
                              {emotion.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditEmotion(emotion)}
                                data-testid={`button-edit-emotion-${emotion.id}`}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    data-testid={`button-delete-emotion-${emotion.id}`}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Emotion</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete "{emotion.display_name}"? 
                                      This action cannot be undone and will affect all associated verses.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => deleteEmotionMutation.mutate({ emotionId: emotion.id, force: true })}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      Delete (Force)
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}

                {!emotionsLoading && !filteredEmotions?.length && (
                  <div className="text-center py-8 text-muted-foreground">
                    No emotions found matching the current search.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Verses Tab */}
          <TabsContent value="verses">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Verses</CardTitle>
                    <CardDescription>Manage spiritual verses and their content</CardDescription>
                  </div>
                  <Button onClick={handleCreateVerse} data-testid="button-create-verse">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Verse
                  </Button>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex-1 max-w-md">
                    <Label htmlFor="verses-search">Search Verses</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="verses-search"
                        placeholder="Search verses by content or emotion..."
                        value={versesSearch}
                        onChange={(e) => setVersesSearch(e.target.value)}
                        className="pl-10"
                        data-testid="input-search-verses"
                      />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {versesLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading verses...</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Emotion</TableHead>
                        <TableHead>Sanskrit</TableHead>
                        <TableHead>English</TableHead>
                        <TableHead>Chapter/Verse</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredVerses?.map((verse: Verse) => (
                        <TableRow key={verse.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-4 h-4 rounded-full border border-gray-300"
                                style={{ backgroundColor: verse.emotion.color }}
                              />
                              <span className="text-sm">{verse.emotion.display_name}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="max-w-xs text-sm line-clamp-2">
                              {verse.sanskrit}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="max-w-xs text-sm line-clamp-2">
                              {verse.english}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {verse.chapter && verse.verse_number ? 
                                `Ch ${verse.chapter}, V ${verse.verse_number}` :
                                verse.chapter || verse.verse_number || "N/A"
                              }
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={verse.is_active ? "default" : "secondary"}>
                              {verse.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditVerse(verse)}
                                data-testid={`button-edit-verse-${verse.id}`}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    data-testid={`button-delete-verse-${verse.id}`}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Verse</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete this verse? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => deleteVerseMutation.mutate(verse.id)}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}

                {!versesLoading && !filteredVerses?.length && (
                  <div className="text-center py-8 text-muted-foreground">
                    No verses found matching the current search.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Emotion Dialog */}
        <Dialog open={showEmotionDialog} onOpenChange={setShowEmotionDialog}>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>
                {editingEmotion ? "Edit Emotion" : "Create New Emotion"}
              </DialogTitle>
              <DialogDescription>
                {editingEmotion ? "Update the emotion details below." : "Enter the details for the new emotion."}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={emotionForm.handleSubmit(onSubmitEmotion)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="emotion-name">Internal Name</Label>
                  <Input
                    id="emotion-name"
                    {...emotionForm.register("name", { required: true })}
                    placeholder="e.g., happy"
                    data-testid="input-emotion-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emotion-display-name">Display Name</Label>
                  <Input
                    id="emotion-display-name"
                    {...emotionForm.register("display_name", { required: true })}
                    placeholder="e.g., Happy"
                    data-testid="input-emotion-display-name"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="emotion-description">Description</Label>
                <Textarea
                  id="emotion-description"
                  {...emotionForm.register("description")}
                  placeholder="Optional description of the emotion"
                  data-testid="textarea-emotion-description"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="emotion-color">Color</Label>
                  <Input
                    id="emotion-color"
                    type="color"
                    {...emotionForm.register("color", { required: true })}
                    data-testid="input-emotion-color"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emotion-active">Active Status</Label>
                  <div className="flex items-center space-x-2 pt-2">
                    <Switch
                      id="emotion-active"
                      {...emotionForm.register("is_active")}
                      data-testid="switch-emotion-active"
                    />
                    <Label htmlFor="emotion-active">Active</Label>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowEmotionDialog(false)}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createEmotionMutation.isPending || updateEmotionMutation.isPending}
                  data-testid="button-submit-emotion"
                >
                  {editingEmotion ? "Update" : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Verse Dialog */}
        <Dialog open={showVerseDialog} onOpenChange={setShowVerseDialog}>
          <DialogContent className="sm:max-w-[725px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingVerse ? "Edit Verse" : "Create New Verse"}
              </DialogTitle>
              <DialogDescription>
                {editingVerse ? "Update the verse details below." : "Enter the details for the new verse."}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={verseForm.handleSubmit(onSubmitVerse)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="verse-emotion">Emotion</Label>
                <select 
                  {...verseForm.register("emotion_id", { required: true })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  data-testid="select-verse-emotion"
                >
                  <option value="">Select an emotion</option>
                  {emotions?.map((emotion: Emotion) => (
                    <option key={emotion.id} value={emotion.id}>
                      {emotion.display_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="verse-sanskrit">Sanskrit</Label>
                <Textarea
                  id="verse-sanskrit"
                  {...verseForm.register("sanskrit", { required: true })}
                  placeholder="Enter Sanskrit text"
                  data-testid="textarea-verse-sanskrit"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="verse-hindi">Hindi</Label>
                <Textarea
                  id="verse-hindi"
                  {...verseForm.register("hindi", { required: true })}
                  placeholder="Enter Hindi translation"
                  data-testid="textarea-verse-hindi"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="verse-english">English</Label>
                <Textarea
                  id="verse-english"
                  {...verseForm.register("english", { required: true })}
                  placeholder="Enter English translation"
                  data-testid="textarea-verse-english"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="verse-explanation">Explanation</Label>
                <Textarea
                  id="verse-explanation"
                  {...verseForm.register("explanation", { required: true })}
                  placeholder="Enter detailed explanation"
                  data-testid="textarea-verse-explanation"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="verse-chapter">Chapter</Label>
                  <Input
                    id="verse-chapter"
                    {...verseForm.register("chapter")}
                    placeholder="e.g., 2"
                    data-testid="input-verse-chapter"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="verse-number">Verse Number</Label>
                  <Input
                    id="verse-number"
                    {...verseForm.register("verse_number")}
                    placeholder="e.g., 47"
                    data-testid="input-verse-number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="verse-active">Active Status</Label>
                  <div className="flex items-center space-x-2 pt-2">
                    <Switch
                      id="verse-active"
                      {...verseForm.register("is_active")}
                      data-testid="switch-verse-active"
                    />
                    <Label htmlFor="verse-active">Active</Label>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowVerseDialog(false)}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createVerseMutation.isPending || updateVerseMutation.isPending}
                  data-testid="button-submit-verse"
                >
                  {editingVerse ? "Update" : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}