import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Pages
import Index from "./pages/Index";
import Transactions from "./pages/Transactions";
import Investments from "./pages/Investments";
import Categories from "./pages/Categories";
import NotFound from "./pages/NotFound";
import Layout from "./Layout";
import Auth from "./pages/Auth";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* ROTAS QUE USAM SIDEBAR */}
          <Route element={<Layout />}>
            <Route path="/" element={<Index />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/investments" element={<Investments />} />
            <Route path="/categories" element={<Categories />} />
          </Route>
          {/* 404*/}
          <Route path="*" element={<NotFound />} />
          <Route path="/login" element={<Auth />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
