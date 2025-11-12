import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Plus, Users, MapPin, Calendar, Clock, Loader2, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { DashboardLayout } from "@/components/DashboardLayout";
import { z } from "zod";

const groupSchema = z.object({
  name: z.string().trim().min(1, "Nome é obrigatório").max(100, "Nome deve ter no máximo 100 caracteres"),
  description: z.string().trim().max(500, "Descrição deve ter no máximo 500 caracteres").optional(),
  meeting_day: z.string().trim().max(50, "Dia da reunião deve ter no máximo 50 caracteres").optional(),
  meeting_time: z.string().optional(),
  location: z.string().trim().max(200, "Local deve ter no máximo 200 caracteres").optional(),
  image_url: z.string().url("URL de imagem inválida").optional().or(z.literal("")),
});

const sb = supabase as any;

const PequenosGrupos = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [userRole, setUserRole] = useState<string>("");
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    checkAuthAndLoadData();
  }, []);

  const checkAuthAndLoadData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }

    const { data: roleData } = await sb
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id)
      .single();

    if (roleData) {
      setUserRole(roleData.role);
    }

    loadGroups();
  };

  const loadGroups = async () => {
    setLoading(true);
    const { data, error } = await sb
      .from("small_groups")
      .select(`
        *,
        profiles:leader_id (full_name)
      `)
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Erro ao carregar grupos",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setGroups(data || []);
    }
    setLoading(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const fileExt = file.name.split('.').pop();
    const filePath = `${user.id}/${Math.random()}.${fileExt}`;

    const { error: uploadError, data } = await supabase.storage
      .from('group-images')
      .upload(filePath, file);

    if (uploadError) {
      toast({
        title: "Erro ao fazer upload",
        description: uploadError.message,
        variant: "destructive",
      });
    } else {
      const { data: { publicUrl } } = supabase.storage
        .from('group-images')
        .getPublicUrl(filePath);
      
      (e.target.form?.elements.namedItem('image_url') as HTMLInputElement).value = publicUrl;
      
      toast({
        title: "Imagem enviada!",
        description: "A imagem foi carregada com sucesso.",
      });
    }
    setUploadingImage(false);
  };

  const handleCreateGroup = async (e: React.FormEvent<HTMLFormElement>) => {
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
        name: formData.get("name") as string,
        description: (formData.get("description") as string) || "",
        meeting_day: (formData.get("meeting_day") as string) || "",
        meeting_time: (formData.get("meeting_time") as string) || "",
        location: (formData.get("location") as string) || "",
        image_url: (formData.get("image_url") as string) || "",
      };

      const validatedData = groupSchema.parse(rawData);

      const groupData = {
        ...validatedData,
        leader_id: user.id,
      };

      const { error } = await sb.from("small_groups").insert([groupData]);

      if (error) {
        toast({
          title: "Erro ao criar grupo",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Grupo criado!",
          description: "O pequeno grupo foi adicionado.",
        });
        setDialogOpen(false);
        loadGroups();
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
          title: "Erro ao criar grupo",
          description: "Ocorreu um erro ao processar os dados.",
          variant: "destructive",
        });
      }
    }

    setSubmitting(false);
  };

  const canCreateGroup = userRole === "admin" || userRole === "leader";

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold">Pequenos Grupos</h1>
                <p className="text-sm text-muted-foreground">Gerencie os grupos da igreja</p>
              </div>
            </div>
            {canCreateGroup && (
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Grupo
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Criar Pequeno Grupo</DialogTitle>
                    <DialogDescription>
                      Adicione um novo pequeno grupo
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateGroup} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome do Grupo *</Label>
                      <Input id="name" name="name" placeholder="Grupo de Jovens" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Descrição</Label>
                      <Textarea
                        id="description"
                        name="description"
                        placeholder="Descrição do grupo..."
                        rows={3}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="meeting_day">Dia da Reunião</Label>
                        <Input id="meeting_day" name="meeting_day" placeholder="Terça-feira" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="meeting_time">Horário</Label>
                        <Input id="meeting_time" name="meeting_time" type="time" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Local</Label>
                      <Input id="location" name="location" placeholder="Casa do líder" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="image">Imagem do Grupo</Label>
                      <Input 
                        id="image" 
                        type="file" 
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploadingImage}
                      />
                      <Input type="hidden" name="image_url" />
                      {uploadingImage && (
                        <p className="text-sm text-muted-foreground">
                          <Loader2 className="w-3 h-3 inline animate-spin mr-2" />
                          Enviando imagem...
                        </p>
                      )}
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setDialogOpen(false)}
                      >
                        Cancelar
                      </Button>
                      <Button type="submit" disabled={submitting || uploadingImage}>
                        {submitting ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Criando...
                          </>
                        ) : (
                          "Criar Grupo"
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
          ) : groups.length === 0 ? (
            <Card>
              <CardContent className="py-20 text-center">
                <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-semibold mb-2">Nenhum grupo cadastrado</h3>
                <p className="text-muted-foreground mb-4">
                  {canCreateGroup
                    ? "Comece criando seu primeiro pequeno grupo"
                    : "Aguarde os líderes criarem grupos"}
                </p>
                {canCreateGroup && (
                  <Button onClick={() => setDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Criar Primeiro Grupo
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {groups.map((group) => (
                <Card key={group.id} className="hover:shadow-elegant transition-all overflow-hidden">
                  {group.image_url && (
                    <div className="aspect-video bg-muted overflow-hidden">
                      <img 
                        src={group.image_url} 
                        alt={group.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="text-lg">{group.name}</CardTitle>
                    <CardDescription>
                      Líder: {group.profiles?.full_name || "Não definido"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {group.description && (
                      <p className="text-sm text-muted-foreground">{group.description}</p>
                    )}
                    <div className="space-y-2 text-sm">
                      {group.meeting_day && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          {group.meeting_day}
                        </div>
                      )}
                      {group.meeting_time && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          {group.meeting_time}
                        </div>
                      )}
                      {group.location && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="w-4 h-4" />
                          {group.location}
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="w-4 h-4" />
                        {group.member_count || 0} membros
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    </DashboardLayout>
  );
};

export default PequenosGrupos;
