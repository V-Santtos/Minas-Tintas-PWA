-- Storage de imagens (item da lojinha + avatar do admin).
--
-- Bucket PÚBLICO único 'imagens', criado por SQL (versionado/reproduzível num
-- db reset, igual ao resto do schema). Público => leitura sem auth, então a URL
-- pública vai direto na coluna e os dois apps usam como <img src> sem signed-URL
-- expirando. Conteúdo é foto de produto / avatar — não-sensível.
--
-- Escrita só pelo service_role (server action admin-gated), que BYPASSA a RLS do
-- Storage => NENHUMA policy em storage.objects é necessária (leitura é pública,
-- escrita é service_role). Se um dia houver upload client-direto, entram policies
-- aditivas.
--
-- allowed_mime_types = webp-only porque a action sempre converte pra WebP antes de
-- subir (sharp): o Storage nunca recebe outro formato. file_size_limit guarda o
-- OUTPUT (webp já comprimido); o guard do INPUT (rejeitar original gigante antes do
-- sharp) fica na própria action.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('imagens', 'imagens', true, 5242880, array['image/webp'])
on conflict (id) do nothing;

-- Avatar do admin: URL pública no bucket acima. loja_items.imagem já existe
-- (migration de lojinha), então só falta a coluna do admin.
alter table admins add column avatar_url text;

comment on column admins.avatar_url is
  'URL publica do avatar no bucket Storage "imagens" (prefixo admin/). null = sem foto (exibe inicial do nome).';