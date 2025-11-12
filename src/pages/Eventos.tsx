import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Calendar, Plus, ArrowLeft, MapPin, Clock, User, Loader2, Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { z } from "zod";

const eventSchema = z.object({
  title: z.string().trim().min(1, "Título é obrigatório").max(200, "Título deve ter no máximo 200 caracteres"),
  description: z.string().trim().max(1000, "Descrição deve ter no máximo 1000 caracteres").optional(),
  event_type: z.enum(['culto', 'ensaio', 'reuniao', 'curso', 'evento_especial'], {
    errorMap: () => ({ message: "Tipo de evento inválido" })
  }),
  start_time: z.string().min(1, "Data/hora de início é obrigatória"),
  end_time: z.string().min(1, "Data/hora de fim é obrigatória"),
  location: z.string().trim().max(200, "Local deve ter no máximo 200 caracteres").optional(),
  is_recurring: z.boolean(),
});

const sb = supabase as any;

const Eventos = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [userRole, setUserRole] = useState<string>("");
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<any>(null);

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

    if (!user) {
      setSubmitting(false);
      return;
    }

    try {
      const rawData = {
        title: formData.get("title") as string,
        description: (formData.get("description") as string) || "",
        event_type: formData.get("event_type") as string,
        start_time: formData.get("start_time") as string,
        end_time: formData.get("end_time") as string,
        location: (formData.get("location") as string) || "",
        is_recurring: formData.get("is_recurring") === "true",
      };

      const validatedData = eventSchema.parse(rawData);

      if (editingEvent) {
        // Update existing event
        const { error } = await sb
          .from("events")
          .update(validatedData)
          .eq("id", editingEvent.id);

        if (error) {
          toast({
            title: "Erro ao atualizar evento",
            description: error.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Evento atualizado!",
            description: "As alterações foram salvas.",
          });
          setDialogOpen(false);
          setEditingEvent(null);
          loadEvents();
        }
      } else {
        // Create new event
        const eventData = {
          ...validatedData,
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
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Dados inválidos",
          description: error.errors[0].message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erro ao criar evento",
          description: "Ocorreu um erro ao processar os dados.",
          variant: "destructive",
        });
      }
    }

    setSubmitting(false);
  };

  const handleDeleteEvent = async () => {
    if (!eventToDelete) return;

    const { error } = await sb
      .from("events")
      .delete()
      .eq("id", eventToDelete.id);

    if (error) {
      toast({
        title: "Erro ao deletar evento",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Evento deletado!",
        description: "O evento foi removido da agenda.",
      });
      setDeleteDialogOpen(false);
      setEventToDelete(null);
      loadEvents();
    }
  };

  const canManageEvent = (event: any) => {
    return userRole === "admin" || userRole === "leader" || event.created_by === event.created_by;
  };

  const canCreateEvent = userRole === "admin" || userRole === "leader";

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">Agenda de Eventos</h1>
              <p className="text-sm text-muted-foreground">Gerencie cultos e eventos</p>
            </div>
          </div>
          {canCreateEvent && (
            <Dialog open={dialogOpen} onOpenChange={(open) => {
              setDialogOpen(open);
              if (!open) setEditingEvent(null);
            }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Evento
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingEvent ? "Editar Evento" : "Criar Novo Evento"}</DialogTitle>
                  <DialogDescription>
                    {editingEvent ? "Atualize as informações do evento" : "Adicione um novo evento ou culto à agenda"}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateEvent} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Título *</Label>
                    <Input 
                      id="title" 
                      name="title" 
                      placeholder="Culto de Celebração" 
                      defaultValue={editingEvent?.title}
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="event_type">Tipo de Evento *</Label>
                    <Select name="event_type" defaultValue={editingEvent?.event_type} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="culto">Culto</SelectItem>
                        <SelectItem value="ensaio">Ensaio</SelectItem>
                        <SelectItem value="reuniao">Reunião</SelectItem>
                        <SelectItem value="curso">Curso</SelectItem>
                        <SelectItem value="evento_especial">Evento Especial</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="start_time">Data/Hora Início *</Label>
                      <Input
                        id="start_time"
                        name="start_time"
                        type="datetime-local"
                        defaultValue={editingEvent?.start_time ? new Date(editingEvent.start_time).toISOString().slice(0, 16) : ""}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="end_time">Data/Hora Fim *</Label>
                      <Input
                        id="end_time"
                        name="end_time"
                        type="datetime-local"
                        defaultValue={editingEvent?.end_time ? new Date(editingEvent.end_time).toISOString().slice(0, 16) : ""}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Local</Label>
                    <Input 
                      id="location" 
                      name="location" 
                      placeholder="Templo Principal" 
                      defaultValue={editingEvent?.location}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      name="description"
                      placeholder="Detalhes sobre o evento..."
                      defaultValue={editingEvent?.description}
                      rows={3}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="is_recurring"
                      name="is_recurring"
                      value="true"
                      defaultChecked={editingEvent?.is_recurring}
                      className="rounded"
                    />
                    <Label htmlFor="is_recurring">Evento recorrente</Label>
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setDialogOpen(false);
                        setEditingEvent(null);
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={submitting}>
                      {submitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          {editingEvent ? "Salvando..." : "Criando..."}
                        </>
                      ) : (
                        editingEvent ? "Salvar Alterações" : "Criar Evento"
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
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : events.length === 0 ? (
          <Card>
            <CardContent className="py-20 text-center">
              <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">Nenhum evento agendado</h3>
              <p className="text-muted-foreground mb-4">
                {canCreateEvent
                  ? "Comece criando seu primeiro evento"
                  : "Aguarde os líderes criarem eventos"}
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
              <Card key={event.id} className="hover:shadow-elegant transition-all">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-xl">{event.title}</CardTitle>
                      <CardDescription className="mt-1">
                        <span className="inline-block px-2 py-1 rounded-full text-xs bg-primary/10 text-primary">
                          {event.event_type}
                        </span>
                        {event.is_recurring && (
                          <span className="ml-2 inline-block px-2 py-1 rounded-full text-xs bg-accent/10 text-accent">
                            Recorrente
                          </span>
                        )}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          event.status === "scheduled"
                            ? "bg-blue-100 text-blue-700"
                            : event.status === "ongoing"
                            ? "bg-green-100 text-green-700"
                            : event.status === "completed"
                            ? "bg-gray-100 text-gray-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {event.status === "scheduled"
                          ? "Agendado"
                          : event.status === "ongoing"
                          ? "Em Andamento"
                          : event.status === "completed"
                          ? "Concluído"
                          : "Cancelado"}
                      </div>
                      {canManageEvent(event) && (
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setEditingEvent(event);
                              setDialogOpen(true);
                            }}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setEventToDelete(event);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {event.description && (
                    <p className="text-sm text-muted-foreground">{event.description}</p>
                  )}
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      {format(new Date(event.start_time), "dd/MM/yyyy 'às' HH:mm", {
                        locale: ptBR,
                      })}
                    </div>
                    {event.location && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        {event.location}
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <User className="w-4 h-4" />
                      Por: {event.profiles?.full_name || "Usuário"}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja deletar o evento "{eventToDelete?.title}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setEventToDelete(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteEvent} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Deletar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Eventos;