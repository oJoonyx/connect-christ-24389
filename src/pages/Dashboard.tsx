import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Users, ClipboardList, TrendingUp, Video } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const Dashboard = () => {
  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Bem-vindo ao sistema de gestão da igreja</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <Badge variant="success" className="text-xs">+2%</Badge>
              </div>
              <h3 className="text-3xl font-bold text-foreground mb-1">1,234</h3>
              <p className="text-sm text-muted-foreground">Total de Membros</p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-primary" />
                </div>
                <Badge variant="success" className="text-xs">+5</Badge>
              </div>
              <h3 className="text-3xl font-bold text-foreground mb-1">18</h3>
              <p className="text-sm text-muted-foreground">Eventos este Mês</p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Video className="w-6 h-6 text-primary" />
                </div>
                <Badge variant="success" className="text-xs">+8</Badge>
              </div>
              <h3 className="text-3xl font-bold text-foreground mb-1">156</h3>
              <p className="text-sm text-muted-foreground">Vídeos Publicados</p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
                <Badge variant="success" className="text-xs">+7%</Badge>
              </div>
              <h3 className="text-3xl font-bold text-foreground mb-1">87%</h3>
              <p className="text-sm text-muted-foreground">Taxa de Presença</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Calendário</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                <Calendar className="w-16 h-16 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-foreground">Próximos Eventos</CardTitle>
              <button className="text-sm text-primary hover:underline">Ver todos</button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                <div className="w-12 h-12 rounded-lg bg-blue-500 flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-foreground">Culto de Domingo - 10h</h4>
                  <p className="text-sm text-muted-foreground">03 Nov 2024 às 10:00</p>
                </div>
                <span className="text-sm text-foreground font-medium">450</span>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-foreground">Culto de Domingo - 18h</h4>
                  <p className="text-sm text-muted-foreground">03 Nov 2024 às 18:00</p>
                </div>
                <span className="text-sm text-foreground font-medium">300</span>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-foreground">Evento de Jovens</h4>
                  <p className="text-sm text-muted-foreground">04 Nov 2024 às 19:00</p>
                </div>
                <span className="text-sm text-foreground font-medium">200</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Atividades Recentes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { text: "Novo membro cadastrado", subtitle: "Maria Silva - Lider PG - 2h atrás", color: "text-primary" },
                { text: "Vídeo do culto publicado", subtitle: "Domingo - 10h atrás", color: "text-primary" },
                { text: "Escala Azul confirmada", subtitle: "João Santos - Líder da Escala - 14 atrás", color: "text-primary" },
                { text: "Evento de Jovens criado", subtitle: "Terça - Maio 14 - 2d atrás", color: "text-primary" },
              ].map((activity, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full ${activity.color} mt-2`} />
                  <div>
                    <p className="text-sm text-foreground">{activity.text}</p>
                    <p className="text-xs text-muted-foreground">{activity.subtitle}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Culto de Domingo - 27/10/2024</CardTitle>
              <Badge variant="destructive" className="w-fit">Destaque</Badge>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-muted rounded-lg overflow-hidden mb-3">
                <img 
                  src="https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800" 
                  alt="Culto" 
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-sm text-muted-foreground">Mensagem: "A Fé que Move Montanhas"</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;