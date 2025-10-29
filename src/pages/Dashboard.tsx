import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Users, ClipboardList, LogOut, Church } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const sb = supabase as any;

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      setUser(session.user);
      
      const { data: profileData } = await sb
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();
      
      setProfile(profileData);
      setLoading(false);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Logout realizado",
      description: "Até logo!",
    });
    navigate("/auth");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-primary">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Church className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Gestão Igreja
              </h1>
              <p className="text-sm text-muted-foreground">
                Olá, {profile?.full_name}
              </p>
            </div>
          </div>
          <Button variant="ghost" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Dashboard</h2>
          <p className="text-muted-foreground">
            Bem-vindo ao sistema de gestão da sua igreja
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:shadow-elegant transition-all cursor-pointer border-l-4 border-l-primary">
            <CardHeader>
              <Calendar className="w-10 h-10 text-primary mb-2" />
              <CardTitle>Agenda</CardTitle>
              <CardDescription>
                Visualize e gerencie todos os eventos e cultos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" onClick={() => navigate("/eventos")}>
                Ver Agenda
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-elegant transition-all cursor-pointer border-l-4 border-l-accent">
            <CardHeader>
              <ClipboardList className="w-10 h-10 text-accent mb-2" />
              <CardTitle>Escalas</CardTitle>
              <CardDescription>
                Gerencie escalas e responsáveis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="secondary" onClick={() => navigate("/escalas")}>
                Ver Escalas
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-elegant transition-all cursor-pointer border-l-4 border-l-primary">
            <CardHeader>
              <Users className="w-10 h-10 text-primary mb-2" />
              <CardTitle>Membros</CardTitle>
              <CardDescription>
                Cadastro e gestão de membros e ministérios
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" onClick={() => navigate("/membros")}>
                Ver Membros
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Próximos Eventos</CardTitle>
              <CardDescription>Eventos agendados para esta semana</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Nenhum evento agendado</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Minhas Escalas</CardTitle>
              <CardDescription>Suas próximas responsabilidades</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <ClipboardList className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Você não está escalado</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;