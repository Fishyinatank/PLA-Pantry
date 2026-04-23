import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import AppLayout from "./components/AppLayout";
import FilamentsPage from "./pages/FilamentsPage";
import StatsPage from "./pages/StatsPage";
import CollectionsPage from "./pages/CollectionsPage";
import AlertsPage from "./pages/AlertsPage";
import OrdersPage from "./pages/OrdersPage";
import IntegrationsPage from "./pages/IntegrationsPage";
import SettingsPage from "./pages/SettingsPage";

function Router() {
  return (
    <AppLayout>
      <Switch>
        <Route path="/" component={FilamentsPage} />
        <Route path="/filaments" component={FilamentsPage} />
        <Route path="/stats" component={StatsPage} />
        <Route path="/collections" component={CollectionsPage} />
        <Route path="/alerts" component={AlertsPage} />
        <Route path="/orders" component={OrdersPage} />
        <Route path="/integrations" component={IntegrationsPage} />
        <Route path="/settings" component={SettingsPage} />
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster
            theme="dark"
            toastOptions={{
              style: {
                background: "oklch(0.14 0.008 240)",
                border: "1px solid oklch(0.22 0.008 240)",
                color: "oklch(0.96 0.005 240)",
              },
            }}
          />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
