-- E-mail de contato do pintor (opcional). NÃO é credencial de login — login é por telefone.
-- Reservado para recuperação por e-mail futura e contato.
alter table painters
  add column email text;