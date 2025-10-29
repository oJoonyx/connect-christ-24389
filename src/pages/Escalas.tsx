import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ClipboardList, Plus, CheckCircle, XCircle, Clock, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const Escalas = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [schedules, setSchedules] = useState<any[]>([]);
  const [myAssignments, setMyAssignments] = useState<any[]>([]);
  const [swapRequests, setSwapRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string>("");
  const [userId, setUserId] = useState<string>("");

  useEffect(() => {
    checkAuthAndLoadData();
  }, []);

  const checkAuthAndLoadData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }

    setUserId(session.user.id);

    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id)
      .single();

    if (roleData) {
      setUserRole(roleData.role);
    }

    loadData(session.user.id);
  };

  const loadData = async (currentUserId: string) => {
    setLoading(true);

    // Carregar escalas com eventos e atribuições
    const { data: schedulesData } = await supabase
      .from("schedules")
      .select(`
        *,
        events (*),
        ministries (name, color),
        schedule_assignments (
          *,
          profiles (full_name, avatar_url)
        )
      `)
      .order("created_at", { ascending: false });

    setSchedules(schedulesData || []);

    // Carregar minhas atribuições
    const { data: myAssignmentsData } = await supabase
      .from("schedule_assignments")
      .select(`
        *,
        schedules (
          *,
          events (*)
        )
      `)
      .eq("user_id", currentUserId)
      .order("created_at", { ascending: false });

    setMyAssignments(myAssignmentsData || []);

    // Carregar solicitações de troca
    const { data: swapData } = await supabase
      .from("swap_requests")
      .select(`
        *,
        requester:requester_id (full_name),
        target:target_user_id (full_name),
        schedule_assignments (
          schedules (
            role_name,
            events (title, start_time)
          )
        )
      `)
      .order("created_at", { ascending: false });

    setSwapRequests(swapData || []);

    setLoading(false);
  };

  const handleConfirmAssignment = async (assignmentId: string) => {
    const { error } = await supabase
      .from("schedule_assignments")
      .update({ confirmed: true })
      .eq("id", assignmentId);

    if (error) {
      toast({
        title: "Erro ao confirmar",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Confirmado!",
        description: "Sua presença foi confirmada.",
      });
      loadData(userId);
    }
  };

  const handleApproveSwap = async (swapId: string, approve: boolean) => {
    const { error } = await supabase
      .from("swap_requests")
      .update({
        status: approve ? "approved" : "rejected",
        approved_by: userId,
      })
      .eq("id", swapId);

    if (error) {
      toast({
        title: "Erro ao processar",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: approve ? "Troca aprovada!" : "Troca rejeitada",
        description: approve
          ? "A solicitação de troca foi aprovada."
          : "A solicitação foi rejeitada.",
      });
      loadData(userId);
    }
  };

  const canManageSchedules = userRole === "admin" || userRole === "leader";

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">Escalas</h1>
              <p className="text-sm text-muted-foreground">Gerencie escalas e atribuições</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Minhas Escalas */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Minhas Escalas</h2>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : myAssignments.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <ClipboardList className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">Você não está escalado no momento</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {myAssignments.map((assignment) => (
                <Card key={assignment.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">
                          {assignment.schedules?.events?.title}
                        </CardTitle>
                        <CardDescription>
                          {format(
                            new Date(assignment.schedules?.events?.start_time),
                            "dd/MM/yyyy 'às' HH:mm",
                            { locale: ptBR }
                          )}
                        </CardDescription>
                      </div>
                      {assignment.confirmed ? (
                        <Badge className="bg-green-100 text-green-700">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Confirmado
                        </Badge>
                      ) : (
                        <Badge variant="outline">
                          <Clock className="w-3 h-3 mr-1" />
                          Pendente
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">
                          Função: {assignment.schedules?.role_name}
                        </p>
                      </div>
                      {!assignment.confirmed && (
                        <Button
                          size="sm"
                          onClick={() => handleConfirmAssignment(assignment.id)}
                        >
                          Confirmar Presença
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Solicitações de Troca */}
        {canManageSchedules && swapRequests.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-4">Solicitações de Troca</h2>
            <div className="grid gap-4">
              {swapRequests
                .filter((req) => req.status === "pending")
                .map((request) => (
                  <Card key={request.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">
                            {request.schedule_assignments?.schedules?.events?.title}
                          </CardTitle>
                          <CardDescription>
                            {request.requester?.full_name} solicitou troca de turno
                          </CardDescription>
                        </div>
                        <Badge variant="outline">
                          <Clock className="w-3 h-3 mr-1" />
                          Pendente
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <p className="text-sm">
                          <span className="font-medium">Função:</span>{" "}
                          {request.schedule_assignments?.schedules?.role_name}
                        </p>
                        {request.reason && (
                          <p className="text-sm">
                            <span className="font-medium">Motivo:</span> {request.reason}
                          </p>
                        )}
                        <div className="flex gap-2 pt-2">
                          <Button
                            size="sm"
                            onClick={() => handleApproveSwap(request.id, true)}
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Aprovar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleApproveSwap(request.id, false)}
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Rejeitar
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </section>
        )}

        {/* Todas as Escalas */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Todas as Escalas</h2>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : schedules.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <ClipboardList className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">Nenhuma escala criada ainda</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {schedules.map((schedule) => (
                <Card key={schedule.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">
                          {schedule.events?.title}
                        </CardTitle>
                        <CardDescription>
                          {format(
                            new Date(schedule.events?.start_time),
                            "dd/MM/yyyy 'às' HH:mm",
                            { locale: ptBR }
                          )}
                        </CardDescription>
                      </div>
                      {schedule.ministries && (
                        <Badge
                          style={{
                            backgroundColor: schedule.ministries.color + "20",
                            color: schedule.ministries.color,
                          }}
                        >
                          {schedule.ministries.name}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <p className="text-sm font-medium">
                        Função: {schedule.role_name}
                      </p>
                      {schedule.notes && (
                        <p className="text-sm text-muted-foreground">{schedule.notes}</p>
                      )}
                      {schedule.schedule_assignments &&
                        schedule.schedule_assignments.length > 0 && (
                          <div className="pt-2">
                            <p className="text-sm font-medium mb-2">Escalados:</p>
                            <div className="flex flex-wrap gap-2">
                              {schedule.schedule_assignments.map((assignment: any) => (
                                <Badge key={assignment.id} variant="secondary">
                                  {assignment.profiles?.full_name}
                                  {assignment.confirmed && (
                                    <CheckCircle className="w-3 h-3 ml-1 text-green-600" />
                                  )}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Escalas;