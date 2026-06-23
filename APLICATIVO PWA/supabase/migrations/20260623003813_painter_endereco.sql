-- Endereço do pintor (opcional). Espelha o padrão de `clients` (cep/rua/numero/
-- complemento/bairro/cidade). Mantido pelo ADMIN (mesma policy "admin edita painters",
-- sem mudança de RLS). Pintor lê via a própria policy de SELECT (exibição read-only).
alter table painters
  add column cep text,
  add column rua text,
  add column numero text,
  add column complemento text,
  add column bairro text,
  add column cidade text;