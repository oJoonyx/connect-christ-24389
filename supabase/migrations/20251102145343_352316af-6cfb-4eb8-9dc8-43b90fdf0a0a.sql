-- Adicionar coluna de imagem aos eventos
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS image_url text;

-- Criar tabela de pequenos grupos
CREATE TABLE IF NOT EXISTS public.small_groups (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  leader_id uuid REFERENCES auth.users(id),
  meeting_day text,
  meeting_time time,
  location text,
  member_count integer DEFAULT 0,
  image_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Criar tabela de vídeos
CREATE TABLE IF NOT EXISTS public.videos (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  youtube_url text NOT NULL,
  thumbnail_url text,
  event_id uuid REFERENCES public.events(id),
  uploaded_by uuid REFERENCES auth.users(id) NOT NULL,
  views integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Criar tabela de notificações
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL, -- 'event', 'schedule', 'milestone', 'video'
  related_id uuid,
  read boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.small_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Políticas para small_groups
CREATE POLICY "Grupos são visíveis para todos autenticados"
  ON public.small_groups FOR SELECT
  USING (true);

CREATE POLICY "Admins e líderes podem criar grupos"
  ON public.small_groups FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'leader'::app_role));

CREATE POLICY "Líder do grupo e admins podem atualizar"
  ON public.small_groups FOR UPDATE
  USING (leader_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

-- Políticas para videos
CREATE POLICY "Vídeos são visíveis para todos autenticados"
  ON public.videos FOR SELECT
  USING (true);

CREATE POLICY "Admins e líderes podem adicionar vídeos"
  ON public.videos FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'leader'::app_role));

CREATE POLICY "Criador e admins podem atualizar vídeos"
  ON public.videos FOR UPDATE
  USING (uploaded_by = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

-- Políticas para notifications
CREATE POLICY "Usuários veem apenas suas notificações"
  ON public.notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Sistema pode criar notificações"
  ON public.notifications FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Usuários podem marcar suas notificações como lidas"
  ON public.notifications FOR UPDATE
  USING (user_id = auth.uid());

-- Trigger para updated_at em small_groups
CREATE TRIGGER update_small_groups_updated_at
  BEFORE UPDATE ON public.small_groups
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger para updated_at em videos
CREATE TRIGGER update_videos_updated_at
  BEFORE UPDATE ON public.videos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Criar bucket de storage para imagens
INSERT INTO storage.buckets (id, name, public)
VALUES ('event-images', 'event-images', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('group-images', 'group-images', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas de storage para event-images
CREATE POLICY "Imagens de eventos são públicas"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'event-images');

CREATE POLICY "Admins e líderes podem fazer upload de imagens de eventos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'event-images' AND
    (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'leader'::app_role))
  );

-- Políticas de storage para group-images
CREATE POLICY "Imagens de grupos são públicas"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'group-images');

CREATE POLICY "Admins e líderes podem fazer upload de imagens de grupos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'group-images' AND
    (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'leader'::app_role))
  );