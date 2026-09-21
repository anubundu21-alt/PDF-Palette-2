import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Routes, Route, useLocation } from "react-router-dom";
import { Suspense, lazy } from "react";
import Index from "./pages/Index";
import Navbar from "@/components/Navbar";
import ScrollToTop from "./components/ScrollToTop";
import ErrorBoundary from "./components/ErrorBoundary";

/**
 * Only the landing page is eager. ToolPage statically pulls `lib/pdf-utils`,
 * which in turn pulls every conversion module (pdf-lib, pdfjs, docx, tesseract,
 * Ghostscript glue) — eagerly importing it here put the whole toolchain in the
 * entry chunk, so the home page paid for 38 tools to render a grid of links.
 */
const ToolPage = lazy(() => import("./pages/ToolPage"));
const NotFound = lazy(() => import("./pages/NotFound"));
const About = lazy(() => import("./pages/About"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const Contact = lazy(() => import("./pages/Contact"));

/**
 * Painted while a lazy route chunk downloads. It renders the real Navbar
 * rather than an empty box: a blank placeholder is not "contentful", so the
 * browser withheld First Contentful Paint until the route chunk landed and
 * tool pages measured ~7s on mobile.
 */
const RouteFallback = () => (
  <div className="min-h-screen">
    <Navbar />
  </div>
);

const queryClient = new QueryClient();

/** Keyed by pathname so a render error clears the moment the user navigates away. */
const RoutedContent = () => {
  const location = useLocation();

  return (
    <ErrorBoundary key={location.pathname}>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/about" element={<About />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/premium" element={<Navigate to="/" replace />} />
          <Route path="/pdf-to-word-ilove" element={<Navigate to="/pdf-to-word" replace />} />
          <Route path="/pdf-to-word-new" element={<Navigate to="/pdf-to-word" replace />} />
          <Route path="/word-to-pdf-new" element={<Navigate to="/word-to-pdf" replace />} />
          {/* Every tool is served by one data-driven page, keyed on its route. */}
          <Route path="/:toolRoute" element={<ToolPage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <RoutedContent />
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
