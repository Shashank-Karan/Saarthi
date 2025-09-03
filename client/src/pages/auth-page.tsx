import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema, type InsertUser } from "@/types/api";
import { z } from "zod";
import { Loader2, BookOpen } from "lucide-react";

const loginSchema = insertUserSchema.pick({ username: true, password: true });
type LoginData = z.infer<typeof loginSchema>;

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const { user, loginMutation, registerMutation } = useAuth();

  const loginForm = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const registerForm = useForm<InsertUser>({
    resolver: zodResolver(insertUserSchema),
    defaultValues: {
      username: "",
      name: "",
      password: "",
    },
  });

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      setLocation("/");
    }
  }, [user, setLocation]);

  const onLogin = (data: LoginData) => {
    loginMutation.mutate(data);
  };

  const onRegister = (data: InsertUser) => {
    registerMutation.mutate(data);
  };

  if (user) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Column - Auth Forms */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 bg-background">
        <Card className="w-full max-w-md mx-4 sm:mx-0">
          <CardContent className="pt-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-2xl font-serif font-bold text-foreground">
                Join Our Spiritual Community
              </h2>
              <p className="text-muted-foreground mt-2">
                Connect with ancient wisdom through AI guidance
              </p>
            </div>

            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin" data-testid="signin-tab">Sign In</TabsTrigger>
                <TabsTrigger value="signup" data-testid="signup-tab">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="signin" className="space-y-4">
                <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                  <div>
                    <Label htmlFor="signin-username">Username</Label>
                    <Input
                      id="signin-username"
                      placeholder="Enter your username"
                      {...loginForm.register("username")}
                      data-testid="input-signin-username"
                    />
                    {loginForm.formState.errors.username && (
                      <p className="text-sm text-destructive mt-1">
                        {loginForm.formState.errors.username.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="signin-password">Password</Label>
                    <Input
                      id="signin-password"
                      type="password"
                      placeholder="Enter your password"
                      {...loginForm.register("password")}
                      data-testid="input-signin-password"
                    />
                    {loginForm.formState.errors.password && (
                      <p className="text-sm text-destructive mt-1">
                        {loginForm.formState.errors.password.message}
                      </p>
                    )}
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={loginMutation.isPending}
                    data-testid="button-signin-submit"
                  >
                    {loginMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing In...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="space-y-4">
                <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
                  <div>
                    <Label htmlFor="signup-name">Full Name</Label>
                    <Input
                      id="signup-name"
                      placeholder="Enter your full name"
                      {...registerForm.register("name")}
                      data-testid="input-signup-name"
                    />
                    {registerForm.formState.errors.name && (
                      <p className="text-sm text-destructive mt-1">
                        {registerForm.formState.errors.name.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="signup-username">Username</Label>
                    <Input
                      id="signup-username"
                      placeholder="Choose a username"
                      {...registerForm.register("username")}
                      data-testid="input-signup-username"
                    />
                    {registerForm.formState.errors.username && (
                      <p className="text-sm text-destructive mt-1">
                        {registerForm.formState.errors.username.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="Create a password"
                      {...registerForm.register("password")}
                      data-testid="input-signup-password"
                    />
                    {registerForm.formState.errors.password && (
                      <p className="text-sm text-destructive mt-1">
                        {registerForm.formState.errors.password.message}
                      </p>
                    )}
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={registerMutation.isPending}
                    data-testid="button-signup-submit"
                  >
                    {registerMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Right Column - Hero Section */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary/20 to-accent/20 items-center justify-center p-4 sm:p-8">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-6">🕉️</div>
          <h1 className="text-4xl font-serif font-bold text-foreground mb-4">
            Discover Ancient <span className="text-primary">Wisdom</span>
          </h1>
          <p className="text-muted-foreground text-lg mb-6">
            Connect with an AI companion that understands Hindu scriptures, Bhagavad Gita, and Vedas. 
            Get personalized insights and join a community of spiritual seekers.
          </p>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>✨ AI-powered scripture guidance</p>
            <p>🤝 Vibrant spiritual community</p>
            <p>📚 Comprehensive scripture library</p>
          </div>
        </div>
      </div>
    </div>
  );
}
