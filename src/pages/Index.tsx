import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Church, Calendar, Users, ClipboardList, Sparkles } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10">
      <nav className="container mx-auto px-4 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-glow">
            <Church className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Gestão Igreja
          </span>
        </div>
        <Button onClick={() => navigate("/auth")}>
          Entrar
        </Button>
      </nav>

      <main className="container mx-auto px-4 py-20">
        <div className="text-center mb-16 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            Sistema Completo de Gestão
          </div>
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent leading-tight">
            Organize sua igreja
            <br />
            de forma simples
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Gerencie eventos, escalas, membros e ministérios em um único lugar.
            Tudo que você precisa para uma gestão eficiente.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button size="lg" onClick={() => navigate("/auth")} className="text-lg shadow-elegant">
              Começar Agora
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/auth")}>
              Ver Demonstração
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          <div className="bg-card p-6 rounded-xl border hover:shadow-elegant transition-all">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <Calendar className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Agenda Inteligente</h3>
            <p className="text-muted-foreground text-sm">
              Calendário completo com eventos recorrentes e notificações automáticas
            </p>
          </div>

          <div className="bg-card p-6 rounded-xl border hover:shadow-elegant transition-all">
            <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
              <ClipboardList className="w-6 h-6 text-accent" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Escalas</h3>
            <p className="text-muted-foreground text-sm">
              Sistema completo de escalas com troca de turnos e aprovação de líderes
            </p>
          </div>

          <div className="bg-card p-6 rounded-xl border hover:shadow-elegant transition-all">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Gestão de Membros</h3>
            <p className="text-muted-foreground text-sm">
              Organize membros por ministérios e acompanhe participação
            </p>
          </div>

          <div className="bg-card p-6 rounded-xl border hover:shadow-elegant transition-all">
            <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
              <Church className="w-6 h-6 text-accent" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Controle de Acesso</h3>
            <p className="text-muted-foreground text-sm">
              Diferentes níveis de permissão para admins, líderes e membros
            </p>
          </div>
        </div>
      </main>

      <footer className="container mx-auto px-4 py-8 mt-20 border-t text-center text-muted-foreground text-sm">
        <p>© 2025 Gestão Igreja. Sistema desenvolvido para facilitar a gestão de igrejas.</p>
      </footer>
    </div>
  );
};

export default Index;
