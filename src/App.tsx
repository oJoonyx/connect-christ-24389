import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Eventos from "./pages/Eventos";
import Escalas from "./pages/Escalas";
import Membros from "./pages/Membros";
import PequenosGrupos from "./pages/PequenosGrupos";
import Videos from "./pages/Videos";
import Notificacoes from "./pages/Notificacoes";
import MinhaConta from "./pages/MinhaConta";
import Convites from "./pages/Convites";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/eventos" element={<Eventos />} />
          <Route path="/escalas" element={<Escalas />} />
          <Route path="/membros" element={<Membros />} />
          <Route path="/pequenos-grupos" element={<PequenosGrupos />} />
          <Route path="/videos" element={<Videos />} />
          <Route path="/notificacoes" element={<Notificacoes />} />
          <Route path="/minha-conta" element={<MinhaConta />} />
          <Route path="/convites" element={<Convites />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
