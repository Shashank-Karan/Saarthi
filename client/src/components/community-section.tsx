import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Heart, MessageCircle, Share, Plus, Loader2, Upload, Image, Video, X } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { type PostWithAuthor, insertPostSchema, InsertPost } from "@/types/api";
import { formatDistanceToNow, isValid } from "date-fns";

// Safe relative date formatting utility
const safeFormatDistanceToNow = (dateString: string) => {
  try {
    const date = new Date(dateString);
    if (isValid(date)) {
      return formatDistanceToNow(date, { addSuffix: true });
    }
    return 'Unknown time';
  } catch {
    return 'Unknown time';
  }
};
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

type PostFormData = z.infer<typeof insertPostSchema>;

export function CommunitySection() {
  const { user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [videoPreview, setVideoPreview] = useState<string>("");

  const { data: posts = [], isLoading } = useQuery<PostWithAuthor[]>({
    queryKey: ["/api/posts"],
  });

  const createPostMutation = useMutation({
    mutationFn: async (data: PostFormData) => {
      // Convert files to base64 data URLs for storage
      let imageDataUrl = undefined;
      let videoDataUrl = undefined;
      
      if (selectedImage) {
        imageDataUrl = await fileToDataUrl(selectedImage);
      }
      
      if (selectedVideo) {
        videoDataUrl = await fileToDataUrl(selectedVideo);
      }
      
      const postData = {
        ...data,
        image_url: imageDataUrl,
        video_url: videoDataUrl,
      };
      const res = await apiRequest("POST", "/api/posts", postData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      setIsDialogOpen(false);
      resetForm();
    },
  });

  const likePostMutation = useMutation({
    mutationFn: async (postId: string) => {
      await apiRequest("POST", `/api/posts/${postId}/like`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PostFormData>({
    resolver: zodResolver(insertPostSchema),
    defaultValues: {
      title: "",
      content: "",
    },
  });

  const onSubmit = (data: PostFormData) => {
    createPostMutation.mutate(data);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
      setSelectedVideo(file);
      const reader = new FileReader();
      reader.onload = () => {
        setVideoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview("");
  };

  const removeVideo = () => {
    setSelectedVideo(null);
    setVideoPreview("");
  };

  const resetForm = () => {
    reset();
    setSelectedImage(null);
    setSelectedVideo(null);
    setImagePreview("");
    setVideoPreview("");
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleSharePost = async (post: PostWithAuthor) => {
    const shareText = `Check out this spiritual insight: "${post.title}" by ${post.author.name}`;
    const shareUrl = `${window.location.origin}#community`;
    
    // Check if the Web Share API is supported
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: shareText,
          url: shareUrl,
        });
      } catch (error) {
        // If user cancels or sharing fails, fallback to clipboard
        if (error instanceof Error && error.name !== 'AbortError') {
          copyToClipboard(shareText + ' ' + shareUrl);
        }
      }
    } else {
      // Fallback to copying to clipboard
      copyToClipboard(shareText + ' ' + shareUrl);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here if you have a toast system
      alert('Post link copied to clipboard!');
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Post link copied to clipboard!');
    }
  };

  const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  return (
    <section id="community" className="py-16 bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-serif font-bold text-foreground mb-2">Community</h2>
            <p className="text-muted-foreground">Share your spiritual journey and learn from others</p>
          </div>
          {user && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="shadow-lg hover:shadow-xl transition-all duration-300" data-testid="button-create-post">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Post
                </Button>
              </DialogTrigger>
              <DialogContent className="mx-4 sm:mx-0 sm:max-w-md max-w-[95vw]">
                <DialogHeader>
                  <DialogTitle>Create New Post</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      placeholder="Share your spiritual insight..."
                      {...register("title")}
                      data-testid="input-post-title"
                    />
                    {errors.title && (
                      <p className="text-sm text-destructive mt-1">{errors.title.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="content">Content</Label>
                    <Textarea
                      id="content"
                      placeholder="Tell us about your spiritual experience or question..."
                      rows={4}
                      {...register("content")}
                      data-testid="textarea-post-content"
                    />
                    {errors.content && (
                      <p className="text-sm text-destructive mt-1">{errors.content.message}</p>
                    )}
                  </div>

                  {/* Media Upload Section */}
                  <div className="space-y-4">
                    <Label>Add Media (Optional)</Label>
                    
                    {/* Image Upload */}
                    <div className="flex items-center space-x-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload"
                      />
                      <Label
                        htmlFor="image-upload"
                        className="flex items-center space-x-2 cursor-pointer bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-md border border-blue-200 transition-colors"
                      >
                        <Image className="h-4 w-4 text-blue-600" />
                        <span className="text-sm text-blue-600">Add Image</span>
                      </Label>
                      
                      {/* Video Upload */}
                      <input
                        type="file"
                        accept="video/*"
                        onChange={handleVideoUpload}
                        className="hidden"
                        id="video-upload"
                      />
                      <Label
                        htmlFor="video-upload"
                        className="flex items-center space-x-2 cursor-pointer bg-green-50 hover:bg-green-100 px-3 py-2 rounded-md border border-green-200 transition-colors"
                      >
                        <Video className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-green-600">Add Video</span>
                      </Label>
                    </div>

                    {/* Image Preview */}
                    {imagePreview && (
                      <div className="relative inline-block">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-32 h-32 object-cover rounded-lg border"
                        />
                        <button
                          type="button"
                          onClick={removeImage}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    )}

                    {/* Video Preview */}
                    {videoPreview && (
                      <div className="relative inline-block">
                        <video
                          src={videoPreview}
                          className="w-32 h-32 object-cover rounded-lg border"
                          controls
                        />
                        <button
                          type="button"
                          onClick={removeVideo}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={createPostMutation.isPending}
                    data-testid="button-submit-post"
                  >
                    {createPostMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Share Post"
                    )}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
        
        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="p-6">
                <div className="animate-pulse">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-muted rounded-full"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-muted rounded w-20"></div>
                      <div className="h-3 bg-muted rounded w-16"></div>
                    </div>
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className="h-4 bg-muted rounded"></div>
                    <div className="h-3 bg-muted rounded w-3/4"></div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-foreground mb-2">No posts yet</h3>
            <p className="text-muted-foreground mb-6">
              Be the first to share your spiritual journey with the community.
            </p>
            {user && (
              <Button onClick={() => setIsDialogOpen(true)} data-testid="button-first-post">
                Create First Post
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 auto-rows-max" data-testid="posts-grid">
            {posts.map((post: PostWithAuthor) => (
              <Card key={post.id} className="hover:shadow-lg transition-shadow h-fit" data-testid={`post-${post.id}`}>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {getInitials(post.author.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-semibold text-foreground">{post.author.name}</h4>
                      <p className="text-xs text-muted-foreground">
                        {safeFormatDistanceToNow(post.createdAt)}
                      </p>
                    </div>
                  </div>
                  <h3 className="font-semibold text-foreground mb-2" data-testid={`post-title-${post.id}`}>
                    {post.title}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-3" data-testid={`post-content-${post.id}`}>
                    {post.content}
                  </p>
                  
                  {/* Media Display */}
                  {post.image_url && (
                    <div className="my-4">
                      <img
                        src={post.image_url}
                        alt="Post image"
                        className="w-full max-h-96 object-contain rounded-lg border bg-gray-50"
                      />
                    </div>
                  )}
                  
                  {post.video_url && (
                    <div className="my-4">
                      <video
                        src={post.video_url}
                        controls
                        className="w-full max-h-96 object-contain rounded-lg border bg-gray-50"
                      />
                    </div>
                  )}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex space-x-4">
                      <button
                        onClick={() => user && likePostMutation.mutate(post.id)}
                        disabled={!user || likePostMutation.isPending}
                        className="text-muted-foreground hover:text-red-500 transition-colors flex items-center space-x-1"
                        data-testid={`button-like-${post.id}`}
                      >
                        <Heart className="h-4 w-4" />
                        <span>{post.likes}</span>
                      </button>
                      <button className="text-muted-foreground hover:text-primary transition-colors flex items-center space-x-1">
                        <MessageCircle className="h-4 w-4" />
                        <span>{post.comments}</span>
                      </button>
                    </div>
                    <button 
                      onClick={() => handleSharePost(post)}
                      className="text-muted-foreground hover:text-primary transition-colors"
                      data-testid={`button-share-${post.id}`}
                    >
                      <Share className="h-4 w-4" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        
        {posts.length > 0 && (
          <div className="text-center mt-8">
            <Button variant="outline" data-testid="button-load-more">
              Load More Posts
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
