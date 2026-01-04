import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/_core/hooks/useAuth";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Onboarding from "./pages/Onboarding";
import Home from "./pages/Home";
import ProjectDetail from "./pages/ProjectDetail";
import Marketplace from "./pages/Marketplace";
import Dashboard from "./pages/Dashboard";
import ProfileSetup from "./pages/ProfileSetup";
import NotFound from "./pages/NotFound";
import { Loader2 } from "lucide-react";

function Router() {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-purple-600" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated - show onboarding
  if (!isAuthenticated) {
    return (
      <Switch>
        <Route path="/" component={Onboarding} />
        <Route path="*" component={Onboarding} />
      </Switch>
    );
  }

  // Authenticated but no user type selected
  if (!user?.userType) {
    return (
      <Switch>
        <Route path="/" component={ProfileSetup} />
        <Route path="*" component={ProfileSetup} />
      </Switch>
    );
  }

  // Authenticated with user type - show full app
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/marketplace" component={Marketplace} />
      <Route path="/project/:id" component={ProjectDetail} />
      <Route path="/profile" component={ProfileSetup} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
