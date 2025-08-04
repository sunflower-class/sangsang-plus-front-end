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
import ProtectedRoute from "./routes/ProtectedRoute"; // Import ProtectedRoute
import AdminDashboard from "./pages/Admin/AdminDashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                
                {/* Protected Routes */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/generate" element={<Generate />} />
                  <Route path="/editor/:pageId" element={<Editor />} />
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
