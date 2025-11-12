import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Users, ClipboardList, TrendingUp, Video } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const sb = supabase as any;

const Dashboard = () => {
  const navigate = useNavigate();
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);

  useEffect(() => {
    loadUpcomingEvents();
  }, []);

  const loadUpcomingEvents = async () => {
    const { data } = await sb
      .from("events")
      .select("*")
      .gte("start_time", new Date().toISOString())
      .order("start_time", { ascending: true })
      .limit(3);

    if (data) {
      setUpcomingEvents(data);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-8 max-w-[1200px] mx-auto">
        <div className="mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-1 leading-tight">Dashboard</h1>
          <p className="text-gray-600 text-lg">Bem-vindo ao sistema de gestão da igreja</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {[
            { icon: Users, value: "1,234", label: "Total de Membros", badge: "+2%", badgeColor: "bg-green-500" },
            { icon: Calendar, value: "18", label: "Eventos este Mês", badge: "+5", badgeColor: "bg-green-500" },
            { icon: Video, value: "156", label: "Vídeos Publicados", badge: "+8", badgeColor: "bg-green-500" },
            { icon: TrendingUp, value: "87%", label: "Taxa de Presença", badge: "+7%", badgeColor: "bg-green-500" },
          ].map(({ icon: Icon, value, label, badge, badgeColor }, i) => (
            <Card key={i} className="shadow-sm border border-gray-200 rounded-xl hover:shadow-md transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center">
                    <Icon className="w-7 h-7 text-blue-600" />
                  </div>
                  <Badge className={`text-xs text-white px-2 py-1 rounded ${badgeColor}`}>{badge}</Badge>
                </div>
                <h3 className="text-4xl font-bold text-gray-900 mb-1">{value}</h3>
                <p className="text-sm text-gray-500 font-medium">{label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-10">
          <Card className="border border-gray-200 rounded-xl shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-3 mb-4">
                Calendário
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center text-gray-300">
                <Calendar className="w-20 h-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 rounded-xl shadow-sm">
            <CardHeader className="flex items-center justify-between border-b border-gray-200 pb-3 mb-4">
              <CardTitle className="text-xl font-semibold text-gray-900">Próximos Eventos</CardTitle>
              <button 
                onClick={() => navigate("/eventos")}
                className="text-blue-600 font-semibold hover:underline transition-colors duration-200"
              >
                Ver todos
              </button>
            </CardHeader>
            <CardContent className="space-y-5">
              {upcomingEvents.length > 0 ? (
                upcomingEvents.map((event, i) => (
                  <div key={event.id} className={`flex items-start gap-4 p-4 rounded-lg ${
                    i === 0 ? "bg-blue-50" : i === 1 ? "bg-gray-50" : "bg-gray-100"
                  }`}>
                    <div className="w-14 h-14 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 text-lg truncate">{event.title}</h4>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {format(new Date(event.start_time), "dd MMM yyyy 'às' HH:mm", { locale: ptBR })}
                      </p>
                      {event.location && (
                        <p className="text-xs text-gray-500 mt-1 truncate">{event.location}</p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-gray-400">
                  <Calendar className="w-14 h-14 mx-auto mb-3" />
                  <p className="text-sm">Nenhum evento próximo</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <Card className="border border-gray-200 rounded-xl shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-3 mb-5">
                Atividades Recentes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {[
                { text: "Novo membro cadastrado", subtitle: "Maria Silva - Lider PG - 2h atrás", color: "bg-blue-500" },
                { text: "Vídeo do culto publicado", subtitle: "Domingo - 10h atrás", color: "bg-blue-500" },
                { text: "Escala Azul confirmada", subtitle: "João Santos - Líder da Escala - 14 atrás", color: "bg-blue-500" },
                { text: "Evento de Jovens criado", subtitle: "Terça - Maio 14 - 2d atrás", color: "bg-blue-500" },
              ].map((activity, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className={`w-3 h-3 rounded-full mt-2 ${activity.color}`} />
                  <div>
                    <p className="text-base text-gray-900 font-medium">{activity.text}</p>
                    <p className="text-sm text-gray-500">{activity.subtitle}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border border-gray-200 rounded-xl shadow-sm">
            <CardHeader className="flex items-center justify-between border-b border-gray-200 pb-3 mb-4">
              <CardTitle className="text-xl font-semibold text-gray-900">Culto de Domingo - 27/10/2024</CardTitle>
              <Badge variant="destructive" className="w-fit px-3 py-1 text-sm rounded-full">Destaque</Badge>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-gray-100 rounded-xl overflow-hidden mb-4">
                <img 
                  src="https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800" 
                  alt="Culto" 
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                />
              </div>
              <p className="text-sm text-gray-600 font-medium">Mensagem: "A Fé que Move Montanhas"</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;