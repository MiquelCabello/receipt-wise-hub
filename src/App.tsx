import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Auth from "./pages/Auth";
import AcceptInvitation from "./pages/AcceptInvitation";
import AppLayout from "./components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import Upload from "./pages/Upload";
import Expenses from "./pages/Expenses";
import Analytics from "./pages/Analytics";
import Employees from "./pages/Employees";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/accept-invitation" element={<AcceptInvitation />} />
            <Route path="/" element={<AppLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="expenses" element={<Expenses />} />
              <Route path="upload" element={<Upload />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="employees" element={<Employees />} />
              <Route path="settings" element={<Settings />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
