import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarIcon, Plus, ArrowLeft, MapPin, Clock, User, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, getDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const sb = supabase as any;

const Eventos = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [userRole, setUserRole] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  useEffect(() => {
    checkAuthAndLoadData();
  }, []);

  const checkAuthAndLoadData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }

    // Verificar role do usuário
    const { data: roleData } = await sb
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id)
      .single();

    if (roleData) {
      setUserRole(roleData.role);
    }

    loadEvents();
  };

  const loadEvents = async () => {
    setLoading(true);
  const { data, error } = await sb
      .from("events")
      .select(`
        *,
        profiles:created_by (full_name)
      `)
      .order("start_time", { ascending: true });

    if (error) {
      toast({
        title: "Erro ao carregar eventos",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setEvents(data || []);
    }
    setLoading(false);
  };

  const handleCreateEvent = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return;

    const eventData = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      event_type: formData.get("event_type") as string,
      start_time: formData.get("start_time") as string,
      end_time: formData.get("end_time") as string,
      location: formData.get("location") as string,
      is_recurring: formData.get("is_recurring") === "true",
      created_by: user.id,
    };

    const { error } = await sb.from("events").insert([eventData]);

    if (error) {
      toast({
        title: "Erro ao criar evento",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Evento criado!",
        description: "O evento foi adicionado à agenda.",
      });
      setDialogOpen(false);
      loadEvents();
    }

    setSubmitting(false);
  };


  const canCreateEvent = userRole === "admin" || userRole === "leader";

  const getEventColor = (eventType: string) => {
    const colors: Record<string, string> = {
      "Culto": "bg-destructive",
      "Reunião": "bg-secondary",
      "Estudo": "bg-accent",
      "Outros": "bg-muted"
    };
    return colors[eventType] || "bg-muted";
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => 
      isSameDay(new Date(event.start_time), date)
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Eventos</h1>
              <p className="text-sm text-muted-foreground">Gerencie a agenda da igreja</p>
            </div>
          </div>
          {canCreateEvent && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Evento
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Criar Novo Evento</DialogTitle>
                  <DialogDescription>
                    Preencha as informações do evento
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateEvent} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Título *</Label>
                    <Input id="title" name="title" required placeholder="Ex: Culto de Celebração" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="event_type">Tipo de Evento *</Label>
                    <Select name="event_type" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Culto">Culto</SelectItem>
                        <SelectItem value="Reunião">Reunião</SelectItem>
                        <SelectItem value="Estudo">Estudo Bíblico</SelectItem>
                        <SelectItem value="Outros">Outros</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="start_time">Data e Hora de Início *</Label>
                      <Input id="start_time" name="start_time" type="datetime-local" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="end_time">Data e Hora de Término *</Label>
                      <Input id="end_time" name="end_time" type="datetime-local" required />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Local</Label>
                    <Input id="location" name="location" placeholder="Ex: Templo Principal" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      name="description"
                      placeholder="Descreva o evento..."
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="is_recurring">Evento Recorrente</Label>
                    <Select name="is_recurring" defaultValue="false">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="false">Não</SelectItem>
                        <SelectItem value="true">Sim</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={submitting}>
                      {submitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Criando...
                        </>
                      ) : (
                        "Criar Evento"
                      )}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="calendar" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-6">
            <TabsTrigger value="calendar">Calendário</TabsTrigger>
            <TabsTrigger value="list">Lista</TabsTrigger>
          </TabsList>

          <TabsContent value="calendar" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Calendário de Eventos</CardTitle>
                <CardDescription>
                  Cores: Culto (Vermelho), Reunião (Amarelo), Estudo (Verde), Outros (Cinza)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-2 mb-4">
                  {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                    <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">
                      {day}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {eachDayOfInterval({
                    start: startOfMonth(currentMonth),
                    end: endOfMonth(currentMonth)
                  }).map((day, idx) => {
                    const dayEvents = getEventsForDate(day);
                    const firstEvent = dayEvents[0];
                    const colorClass = firstEvent ? getEventColor(firstEvent.event_type) : '';
                    
                    return (
                      <button
                        key={idx}
                        onClick={() => setSelectedDate(day)}
                        className={cn(
                          "min-h-20 p-2 rounded-lg border transition-all hover:scale-105",
                          isSameMonth(day, currentMonth) ? "bg-card text-card-foreground" : "bg-muted/30 text-muted-foreground",
                          isSameDay(day, selectedDate) && "ring-2 ring-primary",
                          colorClass && `border-2 ${colorClass}`
                        )}
                      >
                        <div className="text-sm font-medium">{format(day, 'd')}</div>
                        {dayEvents.length > 0 && (
                          <div className="mt-1 text-xs">
                            {dayEvents.length} evento{dayEvents.length > 1 ? 's' : ''}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
                
                <div className="mt-6 space-y-3">
                  <h3 className="font-semibold">
                    Eventos em {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
                  </h3>
                  {getEventsForDate(selectedDate).length === 0 ? (
                    <p className="text-sm text-muted-foreground">Nenhum evento nesta data</p>
                  ) : (
                    getEventsForDate(selectedDate).map((event) => (
                      <Card key={event.id} className={cn("border-l-4", getEventColor(event.event_type))}>
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">{event.title}</CardTitle>
                            <Badge variant="outline">{event.event_type}</Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              {format(new Date(event.start_time), "HH:mm")}
                            </div>
                            {event.location && (
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                {event.location}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="list">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : events.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <CalendarIcon className="w-16 h-16 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Nenhum evento encontrado</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    {canCreateEvent 
                      ? "Comece criando o primeiro evento para a comunidade."
                      : "Aguarde os líderes criarem eventos."}
                  </p>
                  {canCreateEvent && (
                    <Button onClick={() => setDialogOpen(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Criar Primeiro Evento
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {events.map((event) => (
                  <Card key={event.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <CardTitle>{event.title}</CardTitle>
                            <Badge variant="outline" className={cn("text-white", getEventColor(event.event_type))}>
                              {event.event_type}
                            </Badge>
                            {event.is_recurring && (
                              <Badge variant="secondary">Recorrente</Badge>
                            )}
                          </div>
                          {event.description && (
                            <CardDescription className="mt-2">
                              {event.description}
                            </CardDescription>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-3 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span>
                            {format(new Date(event.start_time), "PPP 'às' HH:mm", { locale: ptBR })}
                          </span>
                        </div>
                        {event.location && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <MapPin className="w-4 h-4" />
                            <span>{event.location}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <User className="w-4 h-4" />
                          <span>Criado por {event.profiles?.full_name}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Eventos;