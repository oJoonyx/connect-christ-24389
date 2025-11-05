-- Permitir que admins e líderes deletem eventos
CREATE POLICY "Admins e líderes podem deletar eventos"
ON public.events
FOR DELETE
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'leader'::app_role)
);

-- Permitir que líderes também atualizem eventos (além de criadores e admins)
DROP POLICY IF EXISTS "Criador e admins podem atualizar eventos" ON public.events;
CREATE POLICY "Criador, líderes e admins podem atualizar eventos"
ON public.events
FOR UPDATE
USING (
  created_by = auth.uid() OR 
  has_role(auth.uid(), 'admin'::app_role) OR
  has_role(auth.uid(), 'leader'::app_role)
);

-- Permitir que líderes gerenciem roles (promover outros a líder)
CREATE POLICY "Líderes podem gerenciar roles"
ON public.user_roles
FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'leader'::app_role) OR
  has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Líderes podem atualizar roles"
ON public.user_roles
FOR UPDATE
USING (
  has_role(auth.uid(), 'leader'::app_role) OR
  has_role(auth.uid(), 'admin'::app_role)
);