import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/sidebar";
import Dashboard from "@/pages/dashboard";
import Members from "@/pages/members";
import Videos from "@/pages/videos";
import Analytics from "@/pages/analytics";
import Settings from "@/pages/settings";
import Download from "@/pages/download";
import NotFound from "@/pages/not-found";

function Layout({ children }: { children: React.ReactNode }) {
  const { data: botStatus } = useQuery({
    queryKey: ["/api/bot/status"],
    refetchInterval: 5000, // Poll every 5 seconds for bot status
  });

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900" dir="rtl">
      <Sidebar botStatus={botStatus as any} />
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/members" component={Members} />
      <Route path="/videos" component={Videos} />
      <Route path="/analytics" component={Analytics} />
      <Route path="/settings" component={Settings} />
      <Route path="/download" component={Download} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Layout>
          <Router />
        </Layout>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
