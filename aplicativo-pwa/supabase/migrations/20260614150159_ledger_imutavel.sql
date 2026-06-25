-- Função que aborta qualquer operação que a dispare.
create or replace function bloqueia_alteracao_ledger()
returns trigger
language plpgsql
as $$
begin
  raise exception 'point_transactions é imutável: linhas não podem ser alteradas nem removidas. Para corrigir, insira uma transação compensatória (estorno/ajuste).';
end;
$$;

-- Dispara ANTES de qualquer UPDATE ou DELETE, por linha, e aborta.
create trigger trg_ledger_imutavel
  before update or delete on point_transactions
  for each row
  execute function bloqueia_alteracao_ledger();