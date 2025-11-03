import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Link2, Copy, Users, UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const Convites = () => {
  const { toast } = useToast();
  const [selectedRole, setSelectedRole] = useState<string>("member");
  const [inviteLink, setInviteLink] = useState<string>("");
  const [canManage, setCanManage] = useState(false);

  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    const userRoles = roles?.map(r => r.role) || [];
    setCanManage(
      userRoles.includes('developer' as any) || 
      userRoles.includes('admin') || 
      userRoles.includes('leader')
    );
  };

  const generateInviteLink = () => {
    const baseUrl = window.location.origin;
    const token = btoa(`role:${selectedRole}:${Date.now()}`);
    const link = `${baseUrl}/auth?invite=${token}`;
    setInviteLink(link);
    
    toast({
      title: "Link gerado!",
      description: "O link de convite foi criado com sucesso.",
    });
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(inviteLink);
    toast({
      title: "Copiado!",
      description: "Link copiado para a área de transferência.",
    });
  };

  if (!canManage) {
    return (
      <DashboardLayout>
        <div className="p-8">
          <Card>
            <CardContent className="p-8 text-center">
              <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl font-semibold mb-2">Acesso Restrito</h2>
              <p className="text-muted-foreground">
                Você não tem permissão para gerenciar convites.
              </p>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-8 max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            <UserPlus className="inline-block w-8 h-8 mr-2 mb-1" />
            Sistema de Convites
          </h1>
          <p className="text-muted-foreground">
            Gere links de convite para adicionar novos membros com diferentes cargos
          </p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Gerar Link de Convite</CardTitle>
              <CardDescription>
                Selecione o cargo e gere um link personalizado para convidar novos membros
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="role">Cargo do Convidado</Label>
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Selecione um cargo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="member">Membro</SelectItem>
                    <SelectItem value="leader">Líder de Escala</SelectItem>
                    <SelectItem value="leader">Líder de Voluntários</SelectItem>
                    <SelectItem value="admin">Pastor</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={generateInviteLink} className="w-full">
                <Link2 className="w-4 h-4 mr-2" />
                Gerar Link de Convite
              </Button>

              {inviteLink && (
                <div className="space-y-2">
                  <Label htmlFor="inviteLink">Link de Convite Gerado</Label>
                  <div className="flex gap-2">
                    <Input
                      id="inviteLink"
                      value={inviteLink}
                      readOnly
                      className="flex-1"
                    />
                    <Button variant="outline" onClick={copyToClipboard}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Compartilhe este link com a pessoa que deseja convidar. 
                    Ela será cadastrada automaticamente com o cargo de{" "}
                    <strong>
                      {selectedRole === 'member' ? 'Membro' :
                       selectedRole === 'leader' ? 'Líder' :
                       'Pastor'}
                    </strong>.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Como Funciona</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-primary font-semibold">1</span>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Selecione o Cargo</h4>
                  <p className="text-sm text-muted-foreground">
                    Escolha qual será o cargo da pessoa convidada no sistema
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-primary font-semibold">2</span>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Gere o Link</h4>
                  <p className="text-sm text-muted-foreground">
                    Clique no botão para criar um link único de convite
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-primary font-semibold">3</span>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Compartilhe</h4>
                  <p className="text-sm text-muted-foreground">
                    Envie o link para a pessoa via WhatsApp, email ou outra forma de comunicação
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-primary font-semibold">4</span>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Cadastro Automático</h4>
                  <p className="text-sm text-muted-foreground">
                    Ao clicar no link, a pessoa será direcionada para criar sua conta com o cargo apropriado
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Convites;