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
import JournalPage from "@/pages/journal-page";
import KrishnaPathPage from "@/pages/krishna-path-page";
import AdminDashboardPage from "@/pages/admin-dashboard-page";
import AdminUsersPage from "@/pages/admin-users-page";
import AdminContentPage from "@/pages/admin-content-page";
import AdminEmotionsVersesPage from "@/pages/admin-emotions-verses-page";
import AdminThoughtsPage from "@/pages/admin-thoughts-page";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={HomePage} />
      <ProtectedRoute path="/chat" component={ChatPage} />
      <ProtectedRoute path="/community" component={CommunityPage} />
      <ProtectedRoute path="/journal" component={JournalPage} />
      <ProtectedRoute path="/krishna-path" component={KrishnaPathPage} />
      <ProtectedRoute path="/admin" component={AdminDashboardPage} />
      <ProtectedRoute path="/admin/users" component={AdminUsersPage} />
      <ProtectedRoute path="/admin/content" component={AdminContentPage} />
      <ProtectedRoute path="/admin/emotions-verses" component={AdminEmotionsVersesPage} />
      <ProtectedRoute path="/admin/thoughts" component={AdminThoughtsPage} />
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
