import { Toaster } from "@/components/ui/feedback/toaster";
import { Toaster as Sonner } from "@/components/ui/feedback/sonner";
import { TooltipProvider } from "@/components/ui/overlay/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Header from "./components/ImprovedHeader";
import Footer from "./components/Footer";
import Index from "./pages/Root/Index";
import Login from "./pages/Auth/Login";
import Signup from "./pages/Auth/Signup";
import Dashboard from "./pages/Dashboard/Dashboard";
import Generate from "./pages/Generate/Generate";
import Editor from "./pages/Editor/Editor";
import QnA from "./pages/QnA/QnA";
import Profile from "./pages/Profile/Profile";
import ReviewAnalysis from "./pages/ReviewAnalysis/ReviewAnalysisInput";
import ReviewAnalysisResult from "./pages/ReviewAnalysis/ReviewAnalysisResult";
import NotFound from "./pages/NotFound/NotFound";
import ProtectedRoute from "./routes/ProtectedRoute";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import TermsOfServicePage from "./pages/Policy/TermsOfServicePage";
import PrivacyPolicyPage from "./pages/Policy/PrivacyPolicyPage";
import CookiePolicyPage from "./pages/Policy/CookiePolicyPage";
import ABTest from "./pages/ABTest/ABTest";
import ABTestManager from "./pages/ABTest/ABTestManager";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner 
          toastOptions={{
            classNames: {
              toast: 'bg-background text-foreground border-border shadow-lg',
              title: 'text-sm font-semibold',
              description: 'text-sm',
              actionButton: 'bg-primary text-primary-foreground',
              cancelButton: 'bg-muted text-muted-foreground',
            },
          }}
        />
        <BrowserRouter>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/abtest" element={<ABTest />} />
                <Route path="/abtest/manage" element={<ABTestManager />} />
                
                {/* Policy Pages */}
                <Route path="/terms-of-service" element={<TermsOfServicePage />} />
                <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                <Route path="/cookie-policy" element={<CookiePolicyPage />} />

                <Route path="/generate" element={<Generate />} />
                <Route path="/editor/:pageId" element={<Editor />} />

                {/* Protected Routes */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/qna" element={<QnA />} />
                  <Route path="/review-analysis" element={<ReviewAnalysis />} />
                  <Route path="/review-analysis-result" element={<ReviewAnalysisResult />} />
                  <Route path="/profile" element={<Profile />} />
                </Route>

                <Route path="*" element={<NotFound />} />

                {/* Admin Protected Routes */}
                <Route element={<ProtectedRoute adminOnly={true} />}>
                  <Route path="/sangsangplus-admin-dashboard-portal" element={<AdminDashboard />} />
                </Route>
              </Routes>
            </main>
            <Footer />
          </div>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
