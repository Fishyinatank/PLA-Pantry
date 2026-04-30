import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { PublicOnlyRoute } from "./components/PublicOnlyRoute";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import AppLayout from "./components/AppLayout";
import FilamentsPage from "./pages/FilamentsPage";
import StatsPage from "./pages/StatsPage";
import CollectionsPage from "./pages/CollectionsPage";
import AlertsPage from "./pages/AlertsPage";
import OrdersPage from "./pages/OrdersPage";
import IntegrationsPage from "./pages/IntegrationsPage";
import SettingsPage from "./pages/SettingsPage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import PrintsPage from "./pages/PrintsPage";
import AboutPage from "./pages/AboutPage";
import DevGate from "./components/dev/DevGate";
import DevLayout from "./components/dev/DevLayout";
import DevProtectedRoute from "./components/dev/DevProtectedRoute";
import DevAccessPage from "./pages/dev/DevAccessPage";
import DevFilamentDetailsPage from "./pages/dev/DevFilamentDetailsPage";

function ProtectedApp() {
  return (
    <ProtectedRoute>
      <AppLayout>
        <Switch>
          <Route path="/" component={FilamentsPage} />
          <Route path="/filaments" component={FilamentsPage} />
          <Route path="/prints" component={PrintsPage} />
          <Route path="/stats" component={StatsPage} />
          <Route path="/collections" component={CollectionsPage} />
          <Route path="/alerts" component={AlertsPage} />
          <Route path="/orders" component={OrdersPage} />
          <Route path="/integrations" component={IntegrationsPage} />
          <Route path="/about" component={AboutPage} />
          <Route path="/settings" component={SettingsPage} />
          <Route path="/404" component={NotFound} />
          <Route component={NotFound} />
        </Switch>
      </AppLayout>
    </ProtectedRoute>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/dev">
        <DevGate />
      </Route>
      <Route path="/dev/filament-details">
        <DevProtectedRoute>
          <DevLayout>
            <DevFilamentDetailsPage />
          </DevLayout>
        </DevProtectedRoute>
      </Route>
      <Route path="/dev/access">
        <DevProtectedRoute>
          <DevLayout>
            <DevAccessPage />
          </DevLayout>
        </DevProtectedRoute>
      </Route>
      <Route path="/login">
        <PublicOnlyRoute>
          <LoginPage />
        </PublicOnlyRoute>
      </Route>
      <Route path="/signup">
        <PublicOnlyRoute>
          <SignUpPage />
        </PublicOnlyRoute>
      </Route>
      <Route component={ProtectedApp} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark" switchable>
        <TooltipProvider>
          <AuthProvider>
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
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
