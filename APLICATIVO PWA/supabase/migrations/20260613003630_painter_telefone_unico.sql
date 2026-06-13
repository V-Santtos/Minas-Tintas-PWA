-- Telefone do pintor vira credencial: obrigatório e único (formato: só dígitos com DDD)
alter table painters
  alter column telefone set not null;

alter table painters
  add constraint painters_telefone_unique unique (telefone);