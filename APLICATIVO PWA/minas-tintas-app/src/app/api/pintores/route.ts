import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";

export async function POST(request: Request) {
  // 1. Quem está chamando é admin?
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }
  const { data: admin } = await supabase
    .from("admins")
    .select("auth_user_id")
    .eq("auth_user_id", user.id)
    .maybeSingle();
  if (!admin) {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }

  // 2. Lê e valida a entrada
  const body = await request.json();
  const { nome, email, senha, telefone, documento } = body ?? {};
  if (!nome || !email || !senha) {
    return NextResponse.json(
      { error: "Nome, e-mail e senha são obrigatórios." },
      { status: 400 },
    );
  }

  const adminClient = createAdminClient();

  // 3. Cria o usuário de auth
  const { data: created, error: authError } =
    await adminClient.auth.admin.createUser({
      email,
      password: senha,
      email_confirm: true,
    });
  if (authError || !created.user) {
    return NextResponse.json(
      { error: authError?.message ?? "Falha ao criar o login." },
      { status: 400 },
    );
  }

  // 4. Insere a linha de domínio, linkando ao usuário de auth
  const { data: painter, error: dbError } = await adminClient
    .from("painters")
    .insert({
      nome,
      telefone: telefone ?? null,
      documento: documento ?? null,
      auth_user_id: created.user.id,
    })
    .select()
    .single();

  // 5. Se a etapa 4 falhar, desfaz a etapa 3 (sem usuário órfão)
  if (dbError) {
    await adminClient.auth.admin.deleteUser(created.user.id);
    return NextResponse.json({ error: dbError.message }, { status: 400 });
  }

  return NextResponse.json({ painter }, { status: 201 });
}

export async function PATCH(request: Request) {
  // 1. Quem chama é admin? (igual ao POST)
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }
  const { data: admin } = await supabase
    .from("admins")
    .select("auth_user_id")
    .eq("auth_user_id", user.id)
    .maybeSingle();
  if (!admin) {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }

  // 2. Entrada: qual pintor e a nova senha
  const body = await request.json();
  const { painter_id, senha } = body ?? {};
  if (!painter_id || !senha) {
    return NextResponse.json(
      { error: "Pintor e nova senha são obrigatórios." },
      { status: 400 },
    );
  }

  const adminClient = createAdminClient();

  // 3. Descobre o auth_user_id a partir do pintor
  const { data: painter } = await adminClient
    .from("painters")
    .select("auth_user_id")
    .eq("id", painter_id)
    .maybeSingle();
  if (!painter?.auth_user_id) {
    return NextResponse.json(
      { error: "Pintor sem login vinculado." },
      { status: 400 },
    );
  }

  // 4. Atualiza a senha desse usuário de auth
  const { error } = await adminClient.auth.admin.updateUserById(
    painter.auth_user_id,
    { password: senha },
  );
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
