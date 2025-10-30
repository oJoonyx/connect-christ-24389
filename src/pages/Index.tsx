import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Church, Calendar, Users, ClipboardList, Sparkles } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import agendaDemo from "@/assets/agenda-demo.jpg";
import agendaDemo2 from "@/assets/agenda-demo-2.jpg";
import escalasDemo from "@/assets/escalas-demo.jpg";
import escalasDemo2 from "@/assets/escalas-demo-2.jpg";
import membrosDemo from "@/assets/membros-demo.jpg";
import membrosDemo2 from "@/assets/membros-demo-2.jpg";
import acessoDemo from "@/assets/acesso-demo.jpg";
import acessoDemo2 from "@/assets/acesso-demo-2.jpg";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative overflow-hidden bg-black">
      <div className="absolute inset-y-0 left-0 w-px bg-white" />
      <div className="absolute inset-y-0 right-0 w-px bg-white" />
      <div className="relative z-10">
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

        <Carousel 
          className="w-full max-w-6xl mx-auto"
          plugins={[
            Autoplay({
              delay: 3000,
              stopOnInteraction: false,
            })
          ]}
          opts={{
            loop: true,
            align: "start",
          }}
        >
          <CarouselContent className="-ml-4">
            <CarouselItem className="pl-4 md:basis-1/2 lg:basis-1/3">
              <div className="space-y-3">
                <div className="bg-card p-6 rounded-xl border hover:shadow-elegant transition-all">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Calendar className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Agenda Inteligente</h3>
                  <p className="text-muted-foreground text-sm">
                    Calendário completo com eventos recorrentes e notificações automáticas
                  </p>
                </div>
                <img src={agendaDemo} alt="Demonstração de calendário de eventos" className="w-full h-48 object-cover rounded-lg shadow-lg" />
              </div>
            </CarouselItem>

            <CarouselItem className="pl-4 md:basis-1/2 lg:basis-1/3">
              <div className="space-y-3">
                <div className="bg-card p-6 rounded-xl border hover:shadow-elegant transition-all">
                  <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                    <ClipboardList className="w-6 h-6 text-accent" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Escalas</h3>
                  <p className="text-muted-foreground text-sm">
                    Sistema completo de escalas com troca de turnos e aprovação de líderes
                  </p>
                </div>
                <img src={escalasDemo} alt="Demonstração de sistema de escalas" className="w-full h-48 object-cover rounded-lg shadow-lg" />
              </div>
            </CarouselItem>

            <CarouselItem className="pl-4 md:basis-1/2 lg:basis-1/3">
              <div className="space-y-3">
                <div className="bg-card p-6 rounded-xl border hover:shadow-elegant transition-all">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Gestão de Membros</h3>
                  <p className="text-muted-foreground text-sm">
                    Organize membros por ministérios e acompanhe participação
                  </p>
                </div>
                <img src={membrosDemo} alt="Demonstração de gestão de membros" className="w-full h-48 object-cover rounded-lg shadow-lg" />
              </div>
            </CarouselItem>

            <CarouselItem className="pl-4 md:basis-1/2 lg:basis-1/3">
              <div className="space-y-3">
                <div className="bg-card p-6 rounded-xl border hover:shadow-elegant transition-all">
                  <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                    <Church className="w-6 h-6 text-accent" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Controle de Acesso</h3>
                  <p className="text-muted-foreground text-sm">
                    Diferentes níveis de permissão para admins, líderes e membros
                  </p>
                </div>
                <img src={acessoDemo} alt="Demonstração de controle de acesso" className="w-full h-48 object-cover rounded-lg shadow-lg" />
              </div>
            </CarouselItem>

            <CarouselItem className="pl-4 md:basis-1/2 lg:basis-1/3">
              <div className="space-y-3">
                <div className="bg-card p-6 rounded-xl border hover:shadow-elegant transition-all">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Calendar className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Calendário Mensal</h3>
                  <p className="text-muted-foreground text-sm">
                    Visualize todos os eventos do mês em uma única tela
                  </p>
                </div>
                <img src={agendaDemo2} alt="Demonstração de calendário mensal" className="w-full h-48 object-cover rounded-lg shadow-lg" />
              </div>
            </CarouselItem>

            <CarouselItem className="pl-4 md:basis-1/2 lg:basis-1/3">
              <div className="space-y-3">
                <div className="bg-card p-6 rounded-xl border hover:shadow-elegant transition-all">
                  <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                    <ClipboardList className="w-6 h-6 text-accent" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Gestão de Turnos</h3>
                  <p className="text-muted-foreground text-sm">
                    Atribua e gerencie turnos de forma simples e eficiente
                  </p>
                </div>
                <img src={escalasDemo2} alt="Demonstração de gestão de turnos" className="w-full h-48 object-cover rounded-lg shadow-lg" />
              </div>
            </CarouselItem>

            <CarouselItem className="pl-4 md:basis-1/2 lg:basis-1/3">
              <div className="space-y-3">
                <div className="bg-card p-6 rounded-xl border hover:shadow-elegant transition-all">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Lista de Membros</h3>
                  <p className="text-muted-foreground text-sm">
                    Acesse informações completas de todos os membros
                  </p>
                </div>
                <img src={membrosDemo2} alt="Demonstração de lista de membros" className="w-full h-48 object-cover rounded-lg shadow-lg" />
              </div>
            </CarouselItem>

            <CarouselItem className="pl-4 md:basis-1/2 lg:basis-1/3">
              <div className="space-y-3">
                <div className="bg-card p-6 rounded-xl border hover:shadow-elegant transition-all">
                  <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                    <Church className="w-6 h-6 text-accent" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Permissões</h3>
                  <p className="text-muted-foreground text-sm">
                    Configure permissões específicas para cada usuário
                  </p>
                </div>
                <img src={acessoDemo2} alt="Demonstração de permissões de usuários" className="w-full h-48 object-cover rounded-lg shadow-lg" />
              </div>
            </CarouselItem>
          </CarouselContent>
          <CarouselPrevious className="left-0" />
          <CarouselNext className="right-0" />
        </Carousel>
      </main>

      <footer className="container mx-auto px-4 py-8 mt-20 border-t text-center text-muted-foreground text-sm">
        <p>© 2025 Gestão Igreja. Sistema desenvolvido para facilitar a gestão de igrejas.</p>
      </footer>
      </div>
    </div>
  );
};

export default Index;
