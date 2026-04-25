import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Login from "@/pages/login";
import WorkerPage from "@/pages/worker-page";
import ClientPortal from "@/pages/client-portal";
import AdminPage from "@/pages/admin-page";
import WorkerLogin from "@/pages/worker-login";
import AdminLogin from "@/pages/admin-login";
import { getSessionToken } from "@/lib/auth-session";
import { setAuthTokenGetter, setBaseUrl } from "@workspace/api-client-react";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/worker-login" component={WorkerLogin} />
      <Route path="/worker" component={WorkerPage} />
      <Route path="/client-portal" component={ClientPortal} />
      <Route path="/admin-login" component={AdminLogin} />
      <Route path="/internal-admin-ops-8" component={AdminPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL as string | undefined;
  if (apiBaseUrl) {
    setBaseUrl(apiBaseUrl);
  }
  setAuthTokenGetter(() => getSessionToken());

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
