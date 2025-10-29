import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, Users, Plus, Loader2, Shield, User as UserIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Membros = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [members, setMembers] = useState<any[]>([]);
  const [ministries, setMinistries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [ministryDialogOpen, setMinistryDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [userRole, setUserRole] = useState<string>("");

  useEffect(() => {
    checkAuthAndLoadData();
  }, []);

  const checkAuthAndLoadData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }

    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id)
      .single();

    if (roleData) {
      setUserRole(roleData.role);
    }

    loadData();
  };

  const loadData = async () => {
    setLoading(true);

    // Carregar membros com roles
    const { data: membersData } = await supabase
      .from("profiles")
      .select(`
        *,
        user_roles (role)
      `)
      .order("full_name");

    setMembers(membersData || []);

    // Carregar ministérios com membros
    const { data: ministriesData } = await supabase
      .from("ministries")
      .select(`
        *,
        leader:leader_id (full_name),
        ministry_members (
          profiles (id, full_name, avatar_url)
        )
      `)
      .order("name");

    setMinistries(ministriesData || []);

    setLoading(false);
  };

  const handleCreateMinistry = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return;

    const ministryData = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      color: formData.get("color") as string,
      leader_id: user.id,
    };

    const { error } = await supabase.from("ministries").insert([ministryData]);

    if (error) {
      toast({
        title: "Erro ao criar ministério",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Ministério criado!",
        description: "O ministério foi adicionado com sucesso.",
      });
      setMinistryDialogOpen(false);
      loadData();
    }

    setSubmitting(false);
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return (
          <Badge className="bg-red-100 text-red-700">
            <Shield className="w-3 h-3 mr-1" />
            Admin
          </Badge>
        );
      case "leader":
        return (
          <Badge className="bg-blue-100 text-blue-700">
            <UserIcon className="w-3 h-3 mr-1" />
            Líder
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary">
            <UserIcon className="w-3 h-3 mr-1" />
            Membro
          </Badge>
        );
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const canManage = userRole === "admin" || userRole === "leader";

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">Membros e Ministérios</h1>
              <p className="text-sm text-muted-foreground">Gerencie membros e equipes</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="members" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="members">Membros</TabsTrigger>
            <TabsTrigger value="ministries">Ministérios</TabsTrigger>
          </TabsList>

          {/* Tab Membros */}
          <TabsContent value="members" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Todos os Membros</h2>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : members.length === 0 ? (
              <Card>
                <CardContent className="py-20 text-center">
                  <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">Nenhum membro cadastrado</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {members.map((member) => (
                  <Card key={member.id} className="hover:shadow-elegant transition-all">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <Avatar className="w-12 h-12">
                          <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white">
                            {getInitials(member.full_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-base truncate">
                            {member.full_name}
                          </CardTitle>
                          {member.phone && (
                            <CardDescription className="text-xs">
                              {member.phone}
                            </CardDescription>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {member.user_roles && member.user_roles.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {member.user_roles.map((roleObj: any, idx: number) => (
                            <div key={idx}>{getRoleBadge(roleObj.role)}</div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Tab Ministérios */}
          <TabsContent value="ministries" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Ministérios</h2>
              {canManage && (
                <Dialog open={ministryDialogOpen} onOpenChange={setMinistryDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Novo Ministério
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Criar Novo Ministério</DialogTitle>
                      <DialogDescription>
                        Adicione um novo ministério ou equipe
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateMinistry} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Nome *</Label>
                        <Input
                          id="name"
                          name="name"
                          placeholder="Louvor e Adoração"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="description">Descrição</Label>
                        <Textarea
                          id="description"
                          name="description"
                          placeholder="Descrição do ministério..."
                          rows={3}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="color">Cor</Label>
                        <Input
                          id="color"
                          name="color"
                          type="color"
                          defaultValue="#8B5CF6"
                        />
                      </div>
                      <div className="flex justify-end gap-2 pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setMinistryDialogOpen(false)}
                        >
                          Cancelar
                        </Button>
                        <Button type="submit" disabled={submitting}>
                          {submitting ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Criando...
                            </>
                          ) : (
                            "Criar Ministério"
                          )}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              )}
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : ministries.length === 0 ? (
              <Card>
                <CardContent className="py-20 text-center">
                  <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">Nenhum ministério criado</h3>
                  <p className="text-muted-foreground mb-4">
                    {canManage
                      ? "Comece criando seu primeiro ministério"
                      : "Aguarde os líderes criarem ministérios"}
                  </p>
                  {canManage && (
                    <Button onClick={() => setMinistryDialogOpen(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Criar Primeiro Ministério
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6">
                {ministries.map((ministry) => (
                  <Card
                    key={ministry.id}
                    className="hover:shadow-elegant transition-all border-l-4"
                    style={{ borderLeftColor: ministry.color }}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-xl">{ministry.name}</CardTitle>
                          {ministry.description && (
                            <CardDescription className="mt-2">
                              {ministry.description}
                            </CardDescription>
                          )}
                          {ministry.leader && (
                            <p className="text-sm text-muted-foreground mt-2">
                              <span className="font-medium">Líder:</span>{" "}
                              {ministry.leader.full_name}
                            </p>
                          )}
                        </div>
                        <Badge
                          style={{
                            backgroundColor: ministry.color + "20",
                            color: ministry.color,
                          }}
                        >
                          {ministry.ministry_members?.length || 0} membros
                        </Badge>
                      </div>
                    </CardHeader>
                    {ministry.ministry_members && ministry.ministry_members.length > 0 && (
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {ministry.ministry_members.map((member: any) => (
                            <div
                              key={member.profiles.id}
                              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted"
                            >
                              <Avatar className="w-6 h-6">
                                <AvatarFallback
                                  className="text-xs"
                                  style={{
                                    backgroundColor: ministry.color + "40",
                                    color: ministry.color,
                                  }}
                                >
                                  {getInitials(member.profiles.full_name)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm">{member.profiles.full_name}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    )}
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

export default Membros;