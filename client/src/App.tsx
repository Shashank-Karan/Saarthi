import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "./lib/protected-route";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import ChatPage from "@/pages/chat-page";
import CommunityPage from "@/pages/community-page";
import ScripturePage from "@/pages/scripture-page";
import JournalPage from "@/pages/journal-page";
import GamePage from "@/pages/game-page";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={HomePage} />
      <ProtectedRoute path="/chat" component={ChatPage} />
      <ProtectedRoute path="/community" component={CommunityPage} />
      <ProtectedRoute path="/scripture" component={ScripturePage} />
      <ProtectedRoute path="/scripture/:scriptureType" component={ScripturePage} />
      <ProtectedRoute path="/journal" component={JournalPage} />
      <ProtectedRoute path="/game" component={GamePage} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
