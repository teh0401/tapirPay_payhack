import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import Index from "./pages/Index";
import Scanner from "./pages/Scanner";
import Seller from "./pages/Seller";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Transactions from "./pages/Transactions";
import ESG from "./pages/ESG";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import { Navigation } from "@/components/Navigation";
import { SyncStatusIndicator } from "@/components/SyncStatusIndicator";
import { OfflineBanner } from "@/components/OfflineBanner";
import { OfflineProvider } from "@/contexts/OfflineContext";
import { MerchantModeProvider } from "@/contexts/MerchantModeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: (failureCount, error) => {
        // Don't retry if offline
        if (!navigator.onLine) return false;
        return failureCount < 3;
      },
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <AuthProvider>
        <OfflineProvider>
          <MerchantModeProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <div className="min-h-screen bg-background text-foreground">
                  <OfflineBanner />
                  <SyncStatusIndicator />
                  <main className="pb-20 pt-0">
                    <Routes>
                      <Route path="/auth" element={<Auth />} />
                      <Route path="/" element={
                        <ProtectedRoute>
                          <Index />
                        </ProtectedRoute>
                      } />
                      <Route path="/scanner" element={
                        <ProtectedRoute>
                          <Scanner />
                        </ProtectedRoute>
                      } />
                      <Route path="/seller" element={
                        <ProtectedRoute>
                          <Seller />
                        </ProtectedRoute>
                      } />
                      <Route path="/profile" element={
                        <ProtectedRoute>
                          <Profile />
                        </ProtectedRoute>
                      } />
                      <Route path="/settings" element={
                        <ProtectedRoute>
                          <Settings />
                        </ProtectedRoute>
                      } />
                      <Route path="/transactions" element={
                        <ProtectedRoute>
                          <Transactions />
                        </ProtectedRoute>
                      } />
                      <Route path="/esg" element={
                        <ProtectedRoute>
                          <ESG />
                        </ProtectedRoute>
                      } />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </main>
                  <Navigation />
                </div>
              </BrowserRouter>
            </TooltipProvider>
          </MerchantModeProvider>
        </OfflineProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
