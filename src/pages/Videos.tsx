import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Plus, Video, Eye, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DashboardLayout } from "@/components/DashboardLayout";
import { z } from "zod";

const videoSchema = z.object({
  title: z.string().trim().min(1, "Título é obrigatório").max(200, "Título deve ter no máximo 200 caracteres"),
  youtube_url: z.string().trim().url("URL inválida").refine(
    (url) => /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/.test(url),
    "URL deve ser do YouTube"
  ),
  description: z.string().trim().max(1000, "Descrição deve ter no máximo 1000 caracteres").optional(),
});

const sb = supabase as any;

const Videos = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
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

    const { data: roleData } = await sb
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id)
      .single();

    if (roleData) {
      setUserRole(roleData.role);
    }

    loadVideos();
  };

  const loadVideos = async () => {
    setLoading(true);
    const { data, error } = await sb
      .from("videos")
      .select(`
        *,
        profiles:uploaded_by (full_name)
      `)
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Erro ao carregar vídeos",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setVideos(data || []);
    }
    setLoading(false);
  };

  const extractYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const handleCreateVideo = async (e: React.FormEvent<HTMLFormElement>) => {
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
        youtube_url: formData.get("youtube_url") as string,
        description: (formData.get("description") as string) || "",
      };

      const validatedData = videoSchema.parse(rawData);
      const videoId = extractYouTubeId(validatedData.youtube_url);

      const videoData = {
        ...validatedData,
        thumbnail_url: videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null,
        uploaded_by: user.id,
      };

      const { error } = await sb.from("videos").insert([videoData]);

      if (error) {
        toast({
          title: "Erro ao adicionar vídeo",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Vídeo adicionado!",
          description: "O vídeo foi adicionado à biblioteca.",
        });
        setDialogOpen(false);
        loadVideos();
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
          title: "Erro ao adicionar vídeo",
          description: "Ocorreu um erro ao processar os dados.",
          variant: "destructive",
        });
      }
    }

    setSubmitting(false);
  };

  const canAddVideo = userRole === "admin" || userRole === "leader";

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
                <h1 className="text-xl font-bold">Vídeos</h1>
                <p className="text-sm text-muted-foreground">Biblioteca de vídeos do YouTube</p>
              </div>
            </div>
            {canAddVideo && (
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Vídeo
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Adicionar Vídeo do YouTube</DialogTitle>
                    <DialogDescription>
                      Cole o link do YouTube para adicionar à biblioteca
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateVideo} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Título *</Label>
                      <Input id="title" name="title" placeholder="Título do vídeo" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="youtube_url">URL do YouTube *</Label>
                      <Input 
                        id="youtube_url" 
                        name="youtube_url" 
                        placeholder="https://www.youtube.com/watch?v=..." 
                        required 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Descrição</Label>
                      <Textarea
                        id="description"
                        name="description"
                        placeholder="Descrição do vídeo..."
                        rows={3}
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setDialogOpen(false)}
                      >
                        Cancelar
                      </Button>
                      <Button type="submit" disabled={submitting}>
                        {submitting ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Adicionando...
                          </>
                        ) : (
                          "Adicionar Vídeo"
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
          ) : videos.length === 0 ? (
            <Card>
              <CardContent className="py-20 text-center">
                <Video className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-semibold mb-2">Nenhum vídeo cadastrado</h3>
                <p className="text-muted-foreground mb-4">
                  {canAddVideo
                    ? "Comece adicionando seu primeiro vídeo"
                    : "Aguarde os líderes adicionarem vídeos"}
                </p>
                {canAddVideo && (
                  <Button onClick={() => setDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Primeiro Vídeo
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.map((video) => {
                const videoId = extractYouTubeId(video.youtube_url);
                return (
                  <Card key={video.id} className="hover:shadow-elegant transition-all overflow-hidden">
                    <div className="aspect-video bg-muted overflow-hidden">
                      {video.thumbnail_url ? (
                        <img 
                          src={video.thumbnail_url} 
                          alt={video.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Video className="w-16 h-16 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <CardHeader>
                      <CardTitle className="text-lg line-clamp-2">{video.title}</CardTitle>
                      <CardDescription>
                        Por: {video.profiles?.full_name || "Usuário"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {video.description && (
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {video.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {video.views || 0} visualizações
                        </div>
                        <span>
                          {format(new Date(video.created_at), "dd/MM/yyyy", { locale: ptBR })}
                        </span>
                      </div>
                      <Button 
                        className="w-full" 
                        onClick={() => window.open(video.youtube_url, '_blank')}
                      >
                        Assistir no YouTube
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </DashboardLayout>
  );
};

export default Videos;
