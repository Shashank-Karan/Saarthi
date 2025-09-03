import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Navigation } from "@/components/navigation";
import { Shield, Sparkles, Plus, Search, Edit, Trash2, Star, StarOff } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";

interface ThoughtOfTheDay {
  id: string;
  content: string;
  author?: string;
  language: string;
  category?: string;
  target_date?: string;
  is_active: boolean;
  is_featured: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
  creator?: {
    id: string;
    name: string;
    username: string;
  };
}

interface ThoughtFormData {
  content: string;
  author: string;
  language: string;
  category: string;
  is_active: boolean;
  is_featured: boolean;
}

export default function AdminThoughtsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingThought, setEditingThought] = useState<ThoughtOfTheDay | null>(null);
  const [deletingThought, setDeletingThought] = useState<ThoughtOfTheDay | null>(null);
  const [formData, setFormData] = useState<ThoughtFormData>({
    content: "",
    author: "",
    language: "english",
    category: "",
    is_active: true,
    is_featured: false
  });

  // Redirect non-admin users
  if (!user?.is_admin) {
    return <Redirect to="/" />;
  }

  // Fetch thoughts
  const { data: thoughts, isLoading, refetch } = useQuery<ThoughtOfTheDay[]>({
    queryKey: ['/api/admin/thought-of-the-day'],
  });

  // Create thought mutation
  const createMutation = useMutation({
    mutationFn: (data: ThoughtFormData) => apiRequest('POST', '/api/admin/thought-of-the-day', data),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Thought created successfully",
      });
      setShowCreateDialog(false);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['/api/admin/thought-of-the-day'] });
      queryClient.invalidateQueries({ queryKey: ['/api/thought-of-the-day/current'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create thought",
        variant: "destructive",
      });
    },
  });

  // Update thought mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ThoughtFormData> }) =>
      apiRequest('PUT', `/api/admin/thought-of-the-day/${id}`, data),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Thought updated successfully",
      });
      setEditingThought(null);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['/api/admin/thought-of-the-day'] });
      queryClient.invalidateQueries({ queryKey: ['/api/thought-of-the-day/current'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update thought",
        variant: "destructive",
      });
    },
  });

  // Delete thought mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest('DELETE', `/api/admin/thought-of-the-day/${id}`),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Thought deleted successfully",
      });
      setDeletingThought(null);
      queryClient.invalidateQueries({ queryKey: ['/api/admin/thought-of-the-day'] });
      queryClient.invalidateQueries({ queryKey: ['/api/thought-of-the-day/current'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete thought",
        variant: "destructive",
      });
    },
  });

  // Feature thought mutation
  const featureMutation = useMutation({
    mutationFn: (id: string) => apiRequest('PUT', `/api/admin/thought-of-the-day/${id}/feature`),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Thought featured successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/thought-of-the-day'] });
      queryClient.invalidateQueries({ queryKey: ['/api/thought-of-the-day/current'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to feature thought",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      content: "",
      author: "",
      language: "english",
      category: "",
      is_active: true,
      is_featured: false
    });
  };

  const handleCreate = () => {
    setShowCreateDialog(true);
    resetForm();
  };

  const handleEdit = (thought: ThoughtOfTheDay) => {
    setEditingThought(thought);
    setFormData({
      content: thought.content,
      author: thought.author || "",
      language: thought.language,
      category: thought.category || "",
      is_active: thought.is_active,
      is_featured: thought.is_featured
    });
  };

  const handleSubmit = () => {
    if (!formData.content.trim()) {
      toast({
        title: "Error",
        description: "Content is required",
        variant: "destructive",
      });
      return;
    }

    if (editingThought) {
      updateMutation.mutate({ id: editingThought.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (thought: ThoughtOfTheDay) => {
    setDeletingThought(thought);
  };

  const confirmDelete = () => {
    if (deletingThought) {
      deleteMutation.mutate(deletingThought.id);
    }
  };

  const handleFeature = (thought: ThoughtOfTheDay) => {
    featureMutation.mutate(thought.id);
  };

  // Filter thoughts based on search
  const filteredThoughts = thoughts?.filter(thought =>
    thought.content.toLowerCase().includes(search.toLowerCase()) ||
    thought.author?.toLowerCase().includes(search.toLowerCase()) ||
    thought.category?.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Thoughts Management</h1>
          </div>
          <p className="text-muted-foreground">Manage daily spiritual thoughts and wisdom</p>
        </div>

        {/* Main Content */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Thoughts of the Day</CardTitle>
                <CardDescription>Create and manage inspirational thoughts for your users</CardDescription>
              </div>
              <Button onClick={handleCreate} data-testid="button-create-thought">
                <Plus className="h-4 w-4 mr-2" />
                Add Thought
              </Button>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex-1 max-w-md">
                <Label htmlFor="thoughts-search">Search Thoughts</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="thoughts-search"
                    placeholder="Search by content, author, or category..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                    data-testid="input-search-thoughts"
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading thoughts...</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Content</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredThoughts.map((thought) => (
                    <TableRow key={thought.id}>
                      <TableCell>
                        <div className="max-w-xs">
                          <p className="truncate text-sm">{thought.content}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {thought.author || "Unknown"}
                        </span>
                      </TableCell>
                      <TableCell>
                        {thought.category ? (
                          <span className="inline-block bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
                            {thought.category}
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-xs">No category</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <span className={`text-xs px-2 py-1 rounded-full inline-block w-fit ${
                            thought.is_active 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {thought.is_active ? 'Active' : 'Inactive'}
                          </span>
                          {thought.is_featured && (
                            <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 inline-block w-fit">
                              Featured
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {new Date(thought.created_at).toLocaleDateString()}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(thought)}
                            data-testid={`button-edit-thought-${thought.id}`}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleFeature(thought)}
                            disabled={thought.is_featured}
                            data-testid={`button-feature-thought-${thought.id}`}
                          >
                            {thought.is_featured ? <StarOff className="h-4 w-4" /> : <Star className="h-4 w-4" />}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(thought)}
                            className="text-red-600 hover:text-red-700"
                            data-testid={`button-delete-thought-${thought.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredThoughts.length === 0 && !isLoading && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No thoughts found matching the current search.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Create/Edit Dialog */}
        <Dialog open={showCreateDialog || !!editingThought} onOpenChange={(open) => {
          if (!open) {
            setShowCreateDialog(false);
            setEditingThought(null);
            resetForm();
          }
        }}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingThought ? 'Edit Thought' : 'Create New Thought'}
              </DialogTitle>
              <DialogDescription>
                {editingThought ? 'Update the thought content and settings.' : 'Add a new inspirational thought for your users.'}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              <div>
                <Label htmlFor="content">Content *</Label>
                <Textarea
                  id="content"
                  placeholder="Enter the thought content..."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="min-h-24"
                  data-testid="textarea-thought-content"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="author">Author</Label>
                  <Input
                    id="author"
                    placeholder="e.g., Buddha, Krishna, Rumi..."
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    data-testid="input-thought-author"
                  />
                </div>
                
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    placeholder="e.g., wisdom, meditation, love..."
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    data-testid="input-thought-category"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="language">Language</Label>
                <Input
                  id="language"
                  placeholder="e.g., english, hindi, sanskrit..."
                  value={formData.language}
                  onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                  data-testid="input-thought-language"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                    data-testid="switch-thought-active"
                  />
                  <Label htmlFor="is_active">Active</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_featured"
                    checked={formData.is_featured}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
                    data-testid="switch-thought-featured"
                  />
                  <Label htmlFor="is_featured">Feature as today's thought</Label>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowCreateDialog(false);
                  setEditingThought(null);
                  resetForm();
                }}
                data-testid="button-cancel-thought"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={createMutation.isPending || updateMutation.isPending}
                data-testid="button-save-thought"
              >
                {(createMutation.isPending || updateMutation.isPending) ? 'Saving...' : (editingThought ? 'Update' : 'Create')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deletingThought} onOpenChange={() => setDeletingThought(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Thought</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this thought? This action cannot be undone.
                <br />
                <br />
                <strong>Content:</strong> {deletingThought?.content.substring(0, 100)}...
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel data-testid="button-cancel-delete-thought">Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                className="bg-red-600 hover:bg-red-700"
                data-testid="button-confirm-delete-thought"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}