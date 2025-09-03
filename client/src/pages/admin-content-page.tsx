import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { queryClient, apiRequest, getToken } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
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
import { FileText, MessageSquare, Search, Trash2, Eye, Wifi, WifiOff, RefreshCw, Clock } from "lucide-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

export default function AdminContentPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [postsSearch, setPostsSearch] = useState("");
  const [commentsSearch, setCommentsSearch] = useState("");
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isLiveUpdating, setIsLiveUpdating] = useState(true);

  // Redirect if not admin
  useEffect(() => {
    if (user && !user.is_admin) {
      setLocation("/");
    }
  }, [user, setLocation]);

  const { data: posts, isLoading: postsLoading, dataUpdatedAt: postsUpdatedAt } = useQuery({
    queryKey: ["/api/admin/posts", { search: postsSearch }],
    enabled: !!user?.is_admin && isLiveUpdating,
    refetchInterval: isLiveUpdating ? 3000 : false, // Poll every 3 seconds when live updating is enabled
    refetchIntervalInBackground: true, // Continue polling even when window is not focused
    staleTime: 1000, // Consider data stale after 1 second
    queryFn: async () => {
      const params = new URLSearchParams();
      if (postsSearch) params.append('search', postsSearch);
      const url = `/api/admin/posts${params.toString() ? '?' + params.toString() : ''}`;
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${getToken()}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch posts');
      return response.json();
    },
  });

  const { data: comments, isLoading: commentsLoading, dataUpdatedAt: commentsUpdatedAt } = useQuery({
    queryKey: ["/api/admin/comments", { search: commentsSearch }],
    enabled: !!user?.is_admin && isLiveUpdating,
    refetchInterval: isLiveUpdating ? 3000 : false, // Poll every 3 seconds when live updating is enabled
    refetchIntervalInBackground: true, // Continue polling even when window is not focused
    staleTime: 1000, // Consider data stale after 1 second
    queryFn: async () => {
      const params = new URLSearchParams();
      if (commentsSearch) params.append('search', commentsSearch);
      const url = `/api/admin/comments${params.toString() ? '?' + params.toString() : ''}`;
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${getToken()}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch comments');
      return response.json();
    },
  });

  // Update last updated time when data changes
  useEffect(() => {
    const latestUpdate = Math.max(postsUpdatedAt || 0, commentsUpdatedAt || 0);
    if (latestUpdate) {
      setLastUpdated(new Date(latestUpdate));
    }
  }, [postsUpdatedAt, commentsUpdatedAt]);

  const deletePostMutation = useMutation({
    mutationFn: async (postId: string) => {
      return await apiRequest("DELETE", `/api/admin/posts/${postId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/posts"] });
      toast({
        title: "Post deleted",
        description: "The post and all its comments have been deleted.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete post.",
        variant: "destructive",
      });
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: string) => {
      return await apiRequest("DELETE", `/api/admin/comments/${commentId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/comments"] });
      toast({
        title: "Comment deleted",
        description: "The comment has been deleted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete comment.",
        variant: "destructive",
      });
    },
  });

  if (!user?.is_admin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50 flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="text-center text-red-600">Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground">
              You don't have permission to access content moderation.
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
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold text-gray-900">Content Moderation</h1>
            </div>
            <div className="flex items-center gap-4">
              {/* Live Update Status */}
              <div className="flex items-center gap-2 text-sm">
                {isLiveUpdating ? (
                  <Wifi className="h-4 w-4 text-green-500" />
                ) : (
                  <WifiOff className="h-4 w-4 text-gray-400" />
                )}
                <span className={isLiveUpdating ? "text-green-600" : "text-gray-500"}>
                  {isLiveUpdating ? "Live" : "Paused"}
                </span>
              </div>
              
              {/* Last Updated */}
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Clock className="h-4 w-4" />
                <span>Updated {lastUpdated.toLocaleTimeString()}</span>
              </div>
              
              {/* Live Update Toggle */}
              <Button
                variant={isLiveUpdating ? "destructive" : "default"}
                size="sm"
                onClick={() => setIsLiveUpdating(!isLiveUpdating)}
                data-testid="button-toggle-live-updates"
              >
                {isLiveUpdating ? (
                  <>
                    <WifiOff className="h-4 w-4 mr-2" />
                    Pause Live Updates
                  </>
                ) : (
                  <>
                    <Wifi className="h-4 w-4 mr-2" />
                    Enable Live Updates
                  </>
                )}
              </Button>
            </div>
          </div>
          <p className="text-gray-600">Manage posts, comments, and community content • Real-time updates {isLiveUpdating ? 'enabled' : 'disabled'}</p>
        </div>

        <Tabs defaultValue="posts" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="posts" data-testid="tab-posts">
              <FileText className="h-4 w-4 mr-2" />
              Posts ({Array.isArray(posts) ? posts.length : 0})
            </TabsTrigger>
            <TabsTrigger value="comments" data-testid="tab-comments">
              <MessageSquare className="h-4 w-4 mr-2" />
              Comments ({Array.isArray(comments) ? comments.length : 0})
            </TabsTrigger>
          </TabsList>

          {/* Posts Tab */}
          <TabsContent value="posts">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      Community Posts
                      {isLiveUpdating && (
                        <RefreshCw className="h-4 w-4 animate-spin text-green-500" />
                      )}
                    </CardTitle>
                    <CardDescription>All posts created by users • Live updates {isLiveUpdating ? 'active' : 'paused'}</CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // Force manual refresh
                      queryClient.invalidateQueries({ queryKey: ["/api/admin/posts"] });
                      setLastUpdated(new Date());
                    }}
                    data-testid="button-manual-refresh-posts"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh Posts
                  </Button>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex-1 max-w-md">
                    <Label htmlFor="posts-search">Search Posts</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="posts-search"
                        placeholder="Search posts by title or content..."
                        value={postsSearch}
                        onChange={(e) => setPostsSearch(e.target.value)}
                        className="pl-10"
                        data-testid="input-search-posts"
                      />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {postsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading posts...</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Post</TableHead>
                        <TableHead>Author</TableHead>
                        <TableHead>Engagement</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Array.isArray(posts) && posts.map((post: any) => (
                        <TableRow key={post.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium line-clamp-2">{post.title}</div>
                              <div className="text-sm text-muted-foreground line-clamp-2 max-w-md">
                                {post.content.substring(0, 100)}
                                {post.content.length > 100 && "..."}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{post.author.name}</div>
                              <div className="text-sm text-muted-foreground">@{post.author.username}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-4 text-sm">
                              <span>{post.likes} likes</span>
                              <span>{post.comments} comments</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {new Date(post.created_at).toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setLocation(`/community`)}
                                data-testid={`button-view-post-${post.id}`}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    data-testid={`button-delete-post-${post.id}`}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Post</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete this post? This action cannot be undone
                                      and will also delete all comments on this post.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => deletePostMutation.mutate(post.id)}
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

                {!postsLoading && (!posts || !Array.isArray(posts) || posts.length === 0) && (
                  <div className="text-center py-8 text-muted-foreground">
                    No posts found matching the current search.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Comments Tab */}
          <TabsContent value="comments">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      Comments
                      {isLiveUpdating && (
                        <RefreshCw className="h-4 w-4 animate-spin text-green-500" />
                      )}
                    </CardTitle>
                    <CardDescription>All comments posted by users • Live updates {isLiveUpdating ? 'active' : 'paused'}</CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // Force manual refresh
                      queryClient.invalidateQueries({ queryKey: ["/api/admin/comments"] });
                      setLastUpdated(new Date());
                    }}
                    data-testid="button-manual-refresh-comments"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh Comments
                  </Button>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex-1 max-w-md">
                    <Label htmlFor="comments-search">Search Comments</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="comments-search"
                        placeholder="Search comments by content..."
                        value={commentsSearch}
                        onChange={(e) => setCommentsSearch(e.target.value)}
                        className="pl-10"
                        data-testid="input-search-comments"
                      />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {commentsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading comments...</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Comment</TableHead>
                        <TableHead>Author</TableHead>
                        <TableHead>Post</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Array.isArray(comments) && comments.map((comment: any) => (
                        <TableRow key={comment.id}>
                          <TableCell>
                            <div className="max-w-md">
                              <div className="text-sm line-clamp-3">
                                {comment.content}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{comment.author.name}</div>
                              <div className="text-sm text-muted-foreground">@{comment.author.username}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="link"
                              size="sm"
                              onClick={() => setLocation(`/community`)}
                              className="p-0 h-auto text-left"
                              data-testid={`button-view-comment-post-${comment.post_id}`}
                            >
                              View Post
                            </Button>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {new Date(comment.created_at).toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  data-testid={`button-delete-comment-${comment.id}`}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Comment</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this comment? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => deleteCommentMutation.mutate(comment.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}

                {!commentsLoading && (!comments || !Array.isArray(comments) || comments.length === 0) && (
                  <div className="text-center py-8 text-muted-foreground">
                    No comments found matching the current search.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}