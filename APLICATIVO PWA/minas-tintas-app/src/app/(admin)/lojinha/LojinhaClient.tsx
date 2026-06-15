"use client";

import { useState, useRef, useEffect } from "react";
import {
  Gift,
  SlidersHorizontal,
  Plus,
  Pencil,
  Eye,
  EyeOff,
  X,
  Check,
  Trash2,
  ImagePlus,
  CheckCircle,
  XCircle,
  User,
  Clock,
  PaintRoller,
  Paintbrush,
  Shield,
  Shirt,
  Droplets,
  Briefcase,
  Wrench,
  HardHat,
  Package,
  Scissors,
  Search,
} from "lucide-react";
import { CATALOG, type Reward, type Resgate } from "@/lib/mock";

const ICON_MAP: Record<
  string,
  React.ComponentType<{ size?: number; color?: string }>
> = {
  scissors: Scissors,
  "hard-hat": HardHat,
  paintbrush: Paintbrush,
  shield: Shield,
  shirt: Shirt,
  "paint-roller": PaintRoller,
  droplets: Droplets,
  briefcase: Briefcase,
  wrench: Wrench,
  package: Package,
};

function pts(n: number) {
  return Math.round(n).toLocaleString("pt-BR");
}
function fmtMod(v: number) {
  if (v === 0) return "0×";
  return (
    (v > 0 ? "+" : "") +
    v.toLocaleString("pt-BR", { maximumFractionDigits: 2 }) +
    "×"
  );
}
function calcPts(custo: number, mod: number, gm: number) {
  return Math.round(custo * (gm + mod));
}

function imgSrc(img: string | null | undefined): string | null {
  if (!img) return null;
  if (img.startsWith("data:") || img.startsWith("/") || img.startsWith("http"))
    return img;
  return `/assets/${encodeURIComponent(img)}`;
}

export default function LojinhaClient({
  rewards: rewardsProp,
  resgates: resgatesProp,
  globalMult: globalMultProp,
}: {
  rewards: Reward[];
  resgates: Resgate[];
  globalMult: number;
}) {
  const [rewards, setRewards] = useState<Reward[]>(rewardsProp);
  const [resgates, setResgates] = useState<Resgate[]>(resgatesProp);
  const [hidden, setHidden] = useState(new Set<string>());

  const [tab, setTab] = useState<"produtos" | "resgates">("produtos");
  const [resgatesFiltro, setResgatesFiltro] = useState<
    "pendentes" | "entregues" | "recusados"
  >("pendentes");
  const [resgatesBusca, setResgatesBusca] = useState("");

  // Multiplicadores modal
  const [multOpen, setMultOpen] = useState(false);
  const [globalMult, setGlobalMult] = useState(globalMultProp);
  const [multDraft, setMultDraft] = useState(globalMultProp);

  // Editar item modal
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editStock, setEditStock] = useState("");
  const [editMod, setEditMod] = useState(0);
  const [editPhoto, setEditPhoto] = useState<string | null>(null);
  const [editPhotoPos, setEditPhotoPos] = useState({ x: 50, y: 50 });
  const [editDesc, setEditDesc] = useState("");
  const editFileRef = useRef<HTMLInputElement>(null);

  // Adicionar item modal
  const [addOpen, setAddOpen] = useState(false);
  const [addSearch, setAddSearch] = useState("");
  const [addCusto, setAddCusto] = useState("");
  const [addVenda, setAddVenda] = useState<number | null>(null);
  const [addMod, setAddMod] = useState(0);
  const [addPhoto, setAddPhoto] = useState<string | null>(null);
  const [addPhotoPos, setAddPhotoPos] = useState({ x: 50, y: 50 });
  const [addStock, setAddStock] = useState("");
  const [addDesc, setAddDesc] = useState("");
  const [addCatalogSel, setAddCatalogSel] = useState(false);
  const addFileRef = useRef<HTMLInputElement>(null);

  // Photo drag
  const [dragging, setDragging] = useState<"edit" | "add" | null>(null);
  const dragRef = useRef<{
    mx: number;
    my: number;
    px: number;
    py: number;
  } | null>(null);

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e: MouseEvent) => {
      if (!dragRef.current) return;
      const dx = (e.clientX - dragRef.current.mx) * 0.4;
      const dy = (e.clientY - dragRef.current.my) * 0.4;
      const nx = Math.max(0, Math.min(100, dragRef.current.px + dx));
      const ny = Math.max(0, Math.min(100, dragRef.current.py + dy));
      if (dragging === "edit") setEditPhotoPos({ x: nx, y: ny });
      else setAddPhotoPos({ x: nx, y: ny });
    };
    const onUp = () => {
      setDragging(null);
      dragRef.current = null;
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };
  }, [dragging]);

  // Derived
  const pendingCount = resgates.filter((r) => r.status === "pendente").length;
  const editReward = editId
    ? (rewards.find((r) => r.id === editId) ?? null)
    : null;
  const acResults =
    addSearch.trim() && !addCatalogSel
      ? CATALOG.filter(
          (c) =>
            c.name.toLowerCase().includes(addSearch.toLowerCase()) ||
            c.brand.toLowerCase().includes(addSearch.toLowerCase()) ||
            c.code.toLowerCase().includes(addSearch.toLowerCase()),
        ).slice(0, 5)
      : [];

  // Handlers
  function toggleHidden(id: string) {
    setHidden((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }

  function openEdit(id: string) {
    const r = rewards.find((x) => x.id === id);
    if (!r) return;
    setEditId(id);
    setEditName(r.name);
    setEditStock(String(r.stock));
    setEditMod(r.itemMod || 0);
    setEditDesc(r.desc || "");
    setEditPhoto(imgSrc(r.img));
    setEditPhotoPos(r.imgPos || { x: 50, y: 50 });
  }

  function saveEdit() {
    if (!editId) return;
    setRewards((prev) =>
      prev.map((r) =>
        r.id !== editId
          ? r
          : {
              ...r,
              name: editName.trim() || r.name,
              stock: Math.max(0, parseInt(editStock) || 0),
              itemMod: editMod,
              desc: editDesc,
              img: editPhoto || "",
              imgPos: editPhotoPos,
            },
      ),
    );
    setEditId(null);
  }

  function handleEditUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const rd = new FileReader();
    rd.onload = (ev) => {
      setEditPhoto(ev.target?.result as string);
      setEditPhotoPos({ x: 50, y: 50 });
    };
    rd.readAsDataURL(f);
  }

  function handleAddUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const rd = new FileReader();
    rd.onload = (ev) => {
      setAddPhoto(ev.target?.result as string);
      setAddPhotoPos({ x: 50, y: 50 });
    };
    rd.readAsDataURL(f);
  }

  function selectCatalog(c: (typeof CATALOG)[0]) {
    setAddSearch(c.name);
    setAddCusto(String(c.cost));
    setAddVenda(c.price);
    setAddStock(String(c.stock));
    setAddCatalogSel(true);
  }

  function submitAdd() {
    if (!addSearch.trim() || !parseFloat(addCusto)) return;
    setRewards((prev) => [
      ...prev,
      {
        id: "new-" + Date.now(),
        name: addSearch,
        custo: parseFloat(addCusto),
        venda: addVenda || 0,
        itemMod: addMod,
        stock: parseInt(addStock) || 0,
        icon: "package",
        img: addPhoto || "",
        desc: addDesc,
        imgPos: addPhotoPos,
      },
    ]);
    closeAdd();
  }

  function closeAdd() {
    setAddOpen(false);
    setAddSearch("");
    setAddCusto("");
    setAddVenda(null);
    setAddMod(0);
    setAddPhoto(null);
    setAddPhotoPos({ x: 50, y: 50 });
    setAddStock("");
    setAddDesc("");
    setAddCatalogSel(false);
  }

  // Pts calculations
  const editCusto = editReward?.custo || 0;
  const editPts = calcPts(editCusto, editMod, globalMult);
  const editOrigPts = editMod < 0 ? calcPts(editCusto, 0, globalMult) : null;
  const editPedidosEquiv = Math.ceil(editPts / 300);
  const addCustoNum = parseFloat(addCusto) || 0;
  const addPts = addCustoNum ? calcPts(addCustoNum, addMod, globalMult) : 0;
  const addOrigPts =
    addCustoNum && addMod < 0 ? calcPts(addCustoNum, 0, globalMult) : null;
  const addPedidosEquiv = addPts > 0 ? Math.ceil(addPts / 300) : 0;

  const resgateList = resgates
    .filter((r) =>
      resgatesFiltro === "pendentes"
        ? r.status === "pendente"
        : resgatesFiltro === "entregues"
          ? r.status === "entregue"
          : r.status === "recusado",
    )
    .filter(
      (r) =>
        !resgatesBusca.trim() ||
        r.pintorName.toLowerCase().includes(resgatesBusca.toLowerCase()),
    );

  // Shared style objects
  const modalOverlay: React.CSSProperties = {
    position: "fixed",
    inset: 0,
    background: "rgba(28,26,23,.55)",
    backdropFilter: "blur(3px)",
    zIndex: 50,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  };
  const modalPanel: React.CSSProperties = {
    background: "var(--card)",
    borderRadius: 16,
    width: "100%",
    maxWidth: 460,
    boxShadow: "0 18px 50px rgba(28,26,23,.22)",
    border: "1px solid var(--line)",
    display: "flex",
    flexDirection: "column",
    maxHeight: "90vh",
    overflow: "hidden",
  };
  const modalHead: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "20px 22px 16px",
    borderBottom: "1px solid var(--line)",
    flexShrink: 0,
  };
  const modalBody: React.CSSProperties = {
    padding: "22px 22px 6px",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: 14,
  };
  const modalFoot: React.CSSProperties = {
    display: "flex",
    gap: 8,
    justifyContent: "flex-end",
    padding: "14px 22px 20px",
    borderTop: "1px solid var(--line)",
    background: "var(--paper)",
    flexShrink: 0,
  };
  const inputSt: React.CSSProperties = {
    padding: "0 12px",
    height: "40px",
    borderRadius: 10,
    fontSize: 13,
    border: "1px solid var(--line)",
    background: "var(--card)",
    color: "var(--ink)",
    fontFamily: "var(--font-body)",
    outline: "none",
    width: "100%",
  };
  const labelSt: React.CSSProperties = {
    fontSize: 12,
    fontWeight: 600,
    color: "var(--ink-2)",
  };
  const btnGhost: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "8px 16px",
    borderRadius: 10,
    border: "1.5px solid var(--line)",
    background: "transparent",
    fontSize: 13,
    fontWeight: 600,
    color: "var(--ink)",
    cursor: "pointer",
  };
  const btnPrimary: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "8px 16px",
    borderRadius: 10,
    border: "none",
    background: "var(--brand)",
    fontSize: 13,
    fontWeight: 600,
    color: "#fff",
    cursor: "pointer",
  };
  const btnDark: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "8px 16px",
    borderRadius: 10,
    border: "none",
    background: "var(--ink)",
    fontSize: 13,
    fontWeight: 600,
    color: "#fff",
    cursor: "pointer",
  };
  const stepperSt: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    border: "1.5px solid var(--line)",
    borderRadius: 8,
    overflow: "hidden",
    height: 38,
  };
  const stepperBtn: React.CSSProperties = {
    width: 38,
    height: "100%",
    border: "none",
    background: "transparent",
    cursor: "pointer",
    fontSize: 18,
    fontWeight: 300,
    color: "var(--ink)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };
  const stepperVal: React.CSSProperties = {
    padding: "0 16px",
    fontFamily: "var(--font-jakarta)",
    fontWeight: 800,
    fontSize: 16,
    letterSpacing: "-0.02em",
    minWidth: 64,
    textAlign: "center",
    borderLeft: "1.5px solid var(--line)",
    borderRight: "1.5px solid var(--line)",
  };

  function PhotoBox({
    photo,
    pos,
    onDragStart,
    onUpload,
    onRemove,
    fileRef,
  }: {
    photo: string | null;
    pos: { x: number; y: number };
    onDragStart: (e: React.MouseEvent) => void;
    onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onRemove: () => void;
    fileRef: React.RefObject<HTMLInputElement | null>;
  }) {
    return photo ? (
      <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
        <div
          onMouseDown={onDragStart}
          style={{
            width: 120,
            height: 120,
            flexShrink: 0,
            borderRadius: 10,
            overflow: "hidden",
            border: "1.5px solid var(--line)",
            cursor: "grab",
            backgroundImage: `url('${photo}')`,
            backgroundSize: "cover",
            backgroundPosition: `${pos.x}% ${pos.y}%`,
            userSelect: "none",
          }}
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
            paddingTop: 4,
          }}
        >
          <div
            style={{ fontSize: 11.5, color: "var(--muted)", lineHeight: 1.6 }}
          >
            Arraste para reposicionar.
          </div>
          <button onClick={() => fileRef.current?.click()} style={btnGhost}>
            Trocar
          </button>
          <button
            onClick={onRemove}
            style={{
              ...btnGhost,
              color: "var(--muted)",
              borderColor: "transparent",
              background: "var(--paper-deep)",
            }}
          >
            <Trash2 size={13} /> Remover
          </button>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={onUpload}
        />
      </div>
    ) : (
      <div>
        <div
          onClick={() => fileRef.current?.click()}
          style={{
            width: 120,
            height: 120,
            borderRadius: 10,
            border: "1.5px dashed var(--line)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            cursor: "pointer",
            background: "var(--paper-deep)",
            color: "var(--muted)",
          }}
        >
          <ImagePlus size={26} />
          <span style={{ fontSize: 12, textAlign: "center", lineHeight: 1.4 }}>
            Adicionar
            <br />
            foto
          </span>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={onUpload}
        />
      </div>
    );
  }

  return (
    <div style={{ background: "var(--paper)", minHeight: "100%" }}>
      {/* Page Header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          padding: "24px 32px 18px",
          gap: 24,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--muted)",
              marginBottom: 6,
            }}
          >
            {tab === "produtos" ? "CATÁLOGO DE RESGATES" : "GESTÃO DE RESGATES"}
          </div>
          <h1
            style={{
              fontFamily: "var(--font-jakarta)",
              fontWeight: 800,
              fontSize: 28,
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
              color: "var(--ink)",
            }}
          >
            Lojinha
          </h1>
          <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 4 }}>
            {tab === "produtos"
              ? "Itens disponíveis para os pintores trocarem por pontos."
              : "Solicitações de resgate aguardando retirada na loja."}
          </p>
        </div>
        {tab === "produtos" && (
          <div
            style={{ display: "flex", gap: 8, flexShrink: 0, paddingTop: 4 }}
          >
            <button
              onClick={() => {
                setMultDraft(globalMult);
                setMultOpen(true);
              }}
              style={btnGhost}
            >
              <SlidersHorizontal size={15} /> Multiplicadores
            </button>
            <button onClick={() => setAddOpen(true)} style={btnDark}>
              <Plus size={15} /> Adicionar item
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          padding: "0 32px",
          borderBottom: "1.5px solid var(--line)",
        }}
      >
        {[
          { key: "produtos" as const, label: "Produtos", Icon: Package },
          { key: "resgates" as const, label: "Resgates", Icon: Gift },
        ].map(({ key, label, Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "10px 16px",
              border: "none",
              borderBottom: `2px solid ${tab === key ? "var(--brand)" : "transparent"}`,
              background: "transparent",
              fontSize: 13.5,
              fontWeight: tab === key ? 600 : 500,
              color: tab === key ? "var(--ink)" : "var(--muted)",
              cursor: "pointer",
              marginBottom: -1.5,
              transition: "color .12s",
            }}
          >
            <Icon size={14} />
            {label}
            {key === "resgates" && pendingCount > 0 && (
              <span
                style={{
                  background: "var(--brand)",
                  color: "#fff",
                  fontSize: 10,
                  fontWeight: 700,
                  padding: "1px 6px",
                  borderRadius: 999,
                  lineHeight: 1.6,
                }}
              >
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── PRODUTOS ── */}
      {tab === "produtos" && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            gap: 16,
            padding: "24px 32px",
          }}
        >
          {rewards.map((r) => {
            const rPts = calcPts(r.custo, r.itemMod || 0, globalMult);
            const rOrig =
              (r.itemMod || 0) < 0 ? calcPts(r.custo, 0, globalMult) : null;
            const isHidden = hidden.has(r.id);
            const IconComp = ICON_MAP[r.icon] || Package;
            const src = imgSrc(r.img);
            return (
              <div
                key={r.id}
                style={{
                  background: "var(--card)",
                  border: "1.5px solid var(--line)",
                  borderRadius: 14,
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  opacity: isHidden ? 0.45 : 1,
                  transition: "opacity .18s",
                }}
              >
                {/* Thumb */}
                <div
                  style={{
                    aspectRatio: "1 / 1",
                    background: "var(--paper-deep)",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  {src ? (
                    <img
                      src={src}
                      alt={r.name}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        filter: isHidden ? "grayscale(1)" : "none",
                      }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <IconComp size={40} color="var(--muted)" />
                    </div>
                  )}
                  {(r.itemMod || 0) < 0 && (
                    <span
                      style={{
                        position: "absolute",
                        top: 8,
                        left: 8,
                        background: "var(--brand)",
                        color: "#fff",
                        fontSize: 9,
                        fontWeight: 800,
                        letterSpacing: ".1em",
                        padding: "3px 7px",
                        borderRadius: 6,
                      }}
                    >
                      PROMO
                    </span>
                  )}
                  {isHidden && (
                    <span
                      style={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        background: "rgba(28,26,23,.55)",
                        color: "#fff",
                        fontSize: 9,
                        fontWeight: 700,
                        letterSpacing: ".08em",
                        padding: "3px 7px",
                        borderRadius: 6,
                      }}
                    >
                      Oculto
                    </span>
                  )}
                </div>

                {/* Body */}
                <div
                  style={{
                    padding: "10px 12px 12px",
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <div
                    style={{
                      fontWeight: 600,
                      fontSize: 13,
                      color: "var(--ink)",
                      lineHeight: 1.25,
                      marginBottom: 3,
                    }}
                  >
                    {r.name}
                  </div>
                  <div
                    style={{
                      fontSize: 11.5,
                      color: "var(--muted)",
                      lineHeight: 1.4,
                      marginBottom: 8,
                      flex: 1,
                    }}
                  >
                    {r.desc}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "baseline",
                      marginBottom: 8,
                    }}
                  >
                    <div>
                      {rOrig && (
                        <div
                          style={{
                            fontSize: 11,
                            color: "var(--muted)",
                            textDecoration: "line-through",
                          }}
                        >
                          {pts(rOrig)} pts
                        </div>
                      )}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 3,
                          fontFamily: "var(--font-jakarta)",
                          fontWeight: 800,
                          fontSize: 15,
                          letterSpacing: "-0.02em",
                          color: rOrig ? "var(--brand)" : "var(--ink)",
                        }}
                      >
                        {pts(rPts)}
                        <img
                          src="/assets/dollar-coin.svg"
                          alt=""
                          style={{ width: 15, height: 15 }}
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display =
                              "none";
                          }}
                        />
                        <small
                          style={{
                            fontFamily: "var(--font-body)",
                            fontSize: 11,
                            fontWeight: 500,
                            color: "var(--muted)",
                          }}
                        >
                          pts
                        </small>
                      </div>
                    </div>
                    <div style={{ fontSize: 11, color: "var(--muted)" }}>
                      {r.stock} disponíveis
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button
                      onClick={() => openEdit(r.id)}
                      style={{
                        flex: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 5,
                        padding: "7px 10px",
                        borderRadius: 8,
                        border: "1.5px solid var(--line)",
                        background: "transparent",
                        fontSize: 12.5,
                        fontWeight: 600,
                        color: "var(--ink)",
                        cursor: "pointer",
                      }}
                    >
                      <Pencil size={13} /> Editar
                    </button>
                    <button
                      onClick={() => toggleHidden(r.id)}
                      title={
                        isHidden ? "Tornar visível" : "Ocultar dos pintores"
                      }
                      style={{
                        padding: "7px 10px",
                        borderRadius: 8,
                        border: "1.5px solid var(--line)",
                        background: "var(--paper-deep)",
                        color: "var(--muted)",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      {isHidden ? <Eye size={13} /> : <EyeOff size={13} />}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── RESGATES ── */}
      {tab === "resgates" && (
        <div style={{ padding: "24px 32px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 20,
            }}
          >
            {[
              {
                key: "pendentes" as const,
                label: "Pendentes",
                count: resgates.filter((r) => r.status === "pendente").length,
              },
              { key: "entregues" as const, label: "Entregues", count: null },
              { key: "recusados" as const, label: "Recusados", count: null },
            ].map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => setResgatesFiltro(key)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 14px",
                  borderRadius: 999,
                  border: "1.5px solid var(--line)",
                  background:
                    resgatesFiltro === key ? "var(--ink)" : "transparent",
                  color: resgatesFiltro === key ? "#fff" : "var(--ink)",
                  fontSize: 13,
                  fontWeight: resgatesFiltro === key ? 600 : 500,
                  cursor: "pointer",
                  transition: "all .12s",
                }}
              >
                {label}
                {count !== null && count > 0 && (
                  <span
                    style={{
                      background:
                        resgatesFiltro === key
                          ? "rgba(255,255,255,.25)"
                          : "var(--brand)",
                      color: "#fff",
                      fontSize: 10,
                      fontWeight: 700,
                      padding: "1px 6px",
                      borderRadius: 999,
                      lineHeight: 1.6,
                    }}
                  >
                    {count}
                  </span>
                )}
              </button>
            ))}
            <div style={{ marginLeft: "auto", position: "relative" }}>
              <Search
                size={13}
                style={{
                  position: "absolute",
                  left: 10,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--muted)",
                  pointerEvents: "none",
                }}
              />
              <input
                value={resgatesBusca}
                onChange={(e) => setResgatesBusca(e.target.value)}
                placeholder="Buscar pintor…"
                style={{
                  paddingLeft: 30,
                  paddingRight: 12,
                  height: 34,
                  borderRadius: 999,
                  border: "1.5px solid var(--line)",
                  background: "var(--card)",
                  fontSize: 13,
                  color: "var(--ink)",
                  outline: "none",
                  width: 180,
                  fontFamily: "var(--font-body)",
                }}
              />
            </div>
          </div>

          <div
            style={{
              background: "var(--card)",
              border: "1.5px solid var(--line)",
              borderRadius: 14,
              overflow: "hidden",
            }}
          >
            {resgateList.length === 0 ? (
              <div
                style={{
                  padding: "48px 32px",
                  textAlign: "center",
                  color: "var(--muted)",
                  fontSize: 13.5,
                }}
              >
                <CheckCircle
                  size={32}
                  style={{
                    margin: "0 auto 12px",
                    display: "block",
                    opacity: 0.45,
                  }}
                />
                {resgatesBusca.trim()
                  ? `Nenhum resultado para "${resgatesBusca}".`
                  : resgatesFiltro === "pendentes"
                    ? "Nenhum resgate pendente."
                    : resgatesFiltro === "entregues"
                      ? "Nenhum resgate entregue ainda."
                      : "Nenhum resgate recusado."}
              </div>
            ) : (
              resgateList.map((re, i) => {
                const item = rewards.find((x) => x.id === re.itemId);
                if (!item) return null;
                const src = imgSrc(item.img);
                const IconComp = ICON_MAP[item.icon] || Package;
                const dataFmt = re.data.split("-").reverse().join("/");
                return (
                  <div
                    key={re.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                      padding: "14px 20px",
                      borderBottom:
                        i < resgateList.length - 1
                          ? "1px solid var(--line)"
                          : "none",
                    }}
                  >
                    {/* Thumbnail */}
                    <div
                      style={{
                        width: 52,
                        height: 52,
                        borderRadius: 10,
                        flexShrink: 0,
                        background: "var(--paper-deep)",
                        overflow: "hidden",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {src ? (
                        <img
                          src={src}
                          alt={item.name}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display =
                              "none";
                          }}
                        />
                      ) : (
                        <IconComp size={24} color="var(--muted)" />
                      )}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 13.5,
                          fontWeight: 600,
                          color: "var(--ink)",
                        }}
                      >
                        {item.name}
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          color: "var(--muted)",
                          marginTop: 2,
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <User size={12} /> {re.pintorName}
                      </div>
                    </div>

                    {/* Meta + actions */}
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div
                        style={{
                          fontFamily: "var(--font-jakarta)",
                          fontWeight: 800,
                          fontSize: 15,
                          letterSpacing: "-0.02em",
                        }}
                      >
                        {pts(re.pts)} pts
                      </div>
                      {re.status === "recusado" && (
                        <div
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            color: "var(--success)",
                            marginTop: 2,
                          }}
                        >
                          pontos devolvidos
                        </div>
                      )}
                      <div
                        style={{
                          fontSize: 11,
                          color: "var(--muted)",
                          marginTop: 2,
                        }}
                      >
                        {dataFmt}
                      </div>
                      {re.status === "pendente" ? (
                        <div
                          style={{
                            display: "flex",
                            gap: 6,
                            marginTop: 8,
                            justifyContent: "flex-end",
                          }}
                        >
                          <button
                            onClick={() =>
                              setResgates((prev) =>
                                prev.map((r) =>
                                  r.id === re.id
                                    ? { ...r, status: "recusado" }
                                    : r,
                                ),
                              )
                            }
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 4,
                              padding: "5px 10px",
                              borderRadius: 8,
                              border: "1.5px solid var(--brand)",
                              background: "transparent",
                              fontSize: 12,
                              fontWeight: 600,
                              color: "var(--brand)",
                              cursor: "pointer",
                            }}
                          >
                            <X size={12} /> Recusar
                          </button>
                          <button
                            onClick={() =>
                              setResgates((prev) =>
                                prev.map((r) =>
                                  r.id === re.id
                                    ? { ...r, status: "entregue" }
                                    : r,
                                ),
                              )
                            }
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 4,
                              padding: "5px 12px",
                              borderRadius: 8,
                              border: "none",
                              background: "var(--ink)",
                              fontSize: 12,
                              fontWeight: 600,
                              color: "#fff",
                              cursor: "pointer",
                            }}
                          >
                            <Check size={12} /> Confirmar entrega
                          </button>
                        </div>
                      ) : re.status === "entregue" ? (
                        <div
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            color: "var(--success)",
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                            marginTop: 6,
                            justifyContent: "flex-end",
                          }}
                        >
                          <CheckCircle size={12} /> Entregue
                        </div>
                      ) : (
                        <div
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            color: "var(--brand)",
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                            marginTop: 6,
                            justifyContent: "flex-end",
                          }}
                        >
                          <XCircle size={12} /> Recusado
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ══ MODAL: Multiplicadores ══ */}
      {multOpen && (
        <div style={modalOverlay} onClick={() => setMultOpen(false)}>
          <div style={modalPanel} onClick={(e) => e.stopPropagation()}>
            <div style={modalHead}>
              <span
                style={{ fontSize: 15, fontWeight: 700, color: "var(--ink)" }}
              >
                Multiplicadores
              </span>
              <button
                onClick={() => setMultOpen(false)}
                style={{
                  padding: 6,
                  borderRadius: 10,
                  border: "1px solid var(--line)",
                  background: "var(--card)",
                  cursor: "pointer",
                  display: "flex",
                }}
              >
                <X size={15} />
              </button>
            </div>
            <div style={modalBody}>
              <div>
                <div style={{ ...labelSt, marginBottom: 10 }}>
                  Multiplicador global
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={stepperSt}>
                    <button
                      onClick={() =>
                        setMultDraft((m) =>
                          Math.max(0.25, Math.round((m - 0.25) * 100) / 100),
                        )
                      }
                      style={stepperBtn}
                    >
                      −
                    </button>
                    <span style={stepperVal}>{multDraft}×</span>
                    <button
                      onClick={() =>
                        setMultDraft((m) => Math.round((m + 0.25) * 100) / 100)
                      }
                      style={stepperBtn}
                    >
                      +
                    </button>
                  </div>
                  <span
                    style={{
                      fontSize: 12,
                      color: "var(--muted)",
                      lineHeight: 1.4,
                    }}
                  >
                    Afeta o preço base de
                    <br />
                    todos os itens ao mesmo tempo.
                  </span>
                </div>
              </div>

              <div
                style={{
                  background: "var(--paper-deep)",
                  border: "1.5px solid var(--line)",
                  borderRadius: 10,
                  padding: "14px 16px",
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: ".12em",
                    textTransform: "uppercase",
                    color: "var(--muted)",
                    marginBottom: 10,
                  }}
                >
                  Como o preço é calculado
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    fontFamily: "var(--font-jakarta)",
                    fontWeight: 800,
                    fontSize: 15,
                    letterSpacing: "-0.02em",
                    flexWrap: "wrap",
                  }}
                >
                  <span>Custo</span>
                  <span
                    style={{
                      color: "var(--muted)",
                      fontFamily: "var(--font-body)",
                      fontWeight: 400,
                      fontSize: 14,
                    }}
                  >
                    ×
                  </span>
                  <span>{multDraft}</span>
                  <span
                    style={{
                      color: "var(--muted)",
                      fontFamily: "var(--font-body)",
                      fontWeight: 400,
                      fontSize: 14,
                    }}
                  >
                    =
                  </span>
                  <span>Preço em pts</span>
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: "var(--muted)",
                    marginTop: 10,
                    lineHeight: 1.5,
                  }}
                >
                  Ex: R$ 300 × {multDraft} ={" "}
                  <strong>{pts(300 * multDraft)}</strong> pts
                </div>
              </div>

              <div
                style={{
                  background: "var(--success-tint)",
                  borderRadius: 10,
                  padding: "14px 16px",
                  fontSize: 12.5,
                  lineHeight: 1.5,
                  border: "1.5px solid rgba(79,122,74,.2)",
                }}
              >
                <strong>Quando vira promoção?</strong>
                <br />
                Cada item pode ter um modificador individual. Se o modificador
                resultar em um preço <em>abaixo</em> do multiplicador global, o
                item entra automaticamente em{" "}
                <strong style={{ color: "var(--brand)" }}>PROMO</strong> — com o
                preço original riscado.
              </div>
            </div>
            <div style={modalFoot}>
              <button onClick={() => setMultOpen(false)} style={btnGhost}>
                Cancelar
              </button>
              <button
                onClick={() => {
                  setGlobalMult(multDraft);
                  setMultOpen(false);
                }}
                style={btnPrimary}
              >
                <Check size={15} /> Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ MODAL: Editar item ══ */}
      {editId && editReward && (
        <div style={modalOverlay} onClick={() => setEditId(null)}>
          <div
            style={{ ...modalPanel, maxWidth: 460 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={modalHead}>
              <span
                style={{ fontSize: 15, fontWeight: 700, color: "var(--ink)" }}
              >
                Editar item
              </span>
              <button
                onClick={() => setEditId(null)}
                style={{
                  padding: 6,
                  borderRadius: 10,
                  border: "1px solid var(--line)",
                  background: "var(--card)",
                  cursor: "pointer",
                  display: "flex",
                }}
              >
                <X size={15} />
              </button>
            </div>
            <div style={{ ...modalBody, maxHeight: "68vh" }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 14,
                }}
              >
                <div
                  style={{
                    gridColumn: "1 / -1",
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                  }}
                >
                  <label style={labelSt}>
                    Nome do item{" "}
                    <span style={{ color: "var(--brand)" }}>*</span>
                  </label>
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    style={inputSt}
                    autoComplete="off"
                  />
                </div>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 6 }}
                >
                  <label style={labelSt}>Preço de venda</label>
                  <div
                    style={{
                      ...inputSt,
                      background: "var(--paper-deep)",
                      color: "var(--muted)",
                      height: 42,
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    {editReward.venda
                      ? `R$ ${editReward.venda.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
                      : "—"}
                  </div>
                </div>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 6 }}
                >
                  <label style={labelSt}>Unidades disponíveis</label>
                  <input
                    type="number"
                    value={editStock}
                    onChange={(e) => setEditStock(e.target.value)}
                    min={0}
                    style={inputSt}
                  />
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ ...labelSt, marginBottom: 4 }}>
                  Modificador individual
                </label>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={stepperSt}>
                    <button
                      onClick={() =>
                        setEditMod((m) => Math.round((m - 0.25) * 100) / 100)
                      }
                      style={stepperBtn}
                    >
                      −
                    </button>
                    <span style={stepperVal}>{fmtMod(editMod)}</span>
                    <button
                      onClick={() =>
                        setEditMod((m) => Math.round((m + 0.25) * 100) / 100)
                      }
                      style={stepperBtn}
                    >
                      +
                    </button>
                  </div>
                  <span
                    style={{
                      fontSize: 12,
                      color: "var(--muted)",
                      lineHeight: 1.4,
                    }}
                  >
                    Ajuste em relação ao
                    <br />
                    multiplicador global ({globalMult}×)
                  </span>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={labelSt}>Pontos resultantes</label>
                <div
                  style={{
                    fontSize: 13,
                    padding: "9px 12px",
                    background: "var(--paper-deep)",
                    borderRadius: 8,
                    border: "1.5px solid var(--line)",
                    minHeight: 36,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  {editOrigPts && (
                    <span
                      style={{
                        textDecoration: "line-through",
                        color: "var(--muted)",
                        fontSize: 12,
                      }}
                    >
                      {pts(editOrigPts)} pts
                    </span>
                  )}
                  <strong
                    style={{
                      color: editOrigPts ? "var(--brand)" : "var(--ink)",
                    }}
                  >
                    {pts(editPts)} pts
                  </strong>
                  {editOrigPts && (
                    <span
                      style={{
                        background: "var(--brand)",
                        color: "#fff",
                        fontSize: 9,
                        fontWeight: 800,
                        letterSpacing: ".1em",
                        padding: "2px 6px",
                        borderRadius: 5,
                      }}
                    >
                      PROMO
                    </span>
                  )}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: "var(--muted)",
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                  }}
                >
                  <Clock size={12} /> Equivale a{" "}
                  <strong style={{ marginLeft: 2 }}>
                    {editPedidosEquiv} pedido{editPedidosEquiv !== 1 ? "s" : ""}
                  </strong>
                  &nbsp;de R$ 3.000 aprovados
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={labelSt}>Foto do item</label>
                <PhotoBox
                  photo={editPhoto}
                  pos={editPhotoPos}
                  onDragStart={(e) => {
                    e.preventDefault();
                    dragRef.current = {
                      mx: e.clientX,
                      my: e.clientY,
                      px: editPhotoPos.x,
                      py: editPhotoPos.y,
                    };
                    setDragging("edit");
                  }}
                  onUpload={handleEditUpload}
                  onRemove={() => setEditPhoto(null)}
                  fileRef={editFileRef}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={labelSt}>Descrição</label>
                <textarea
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  rows={3}
                  style={{
                    ...inputSt,
                    height: "auto",
                    padding: "8px 12px",
                    resize: "vertical",
                  }}
                />
              </div>
            </div>
            <div style={modalFoot}>
              <button onClick={() => setEditId(null)} style={btnGhost}>
                Cancelar
              </button>
              <button onClick={saveEdit} style={btnPrimary}>
                <Check size={15} /> Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ MODAL: Adicionar item ══ */}
      {addOpen && (
        <div style={modalOverlay} onClick={closeAdd}>
          <div
            style={{ ...modalPanel, maxWidth: 480 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={modalHead}>
              <span
                style={{ fontSize: 15, fontWeight: 700, color: "var(--ink)" }}
              >
                Adicionar item
              </span>
              <button
                onClick={closeAdd}
                style={{
                  padding: 6,
                  borderRadius: 10,
                  border: "1px solid var(--line)",
                  background: "var(--card)",
                  cursor: "pointer",
                  display: "flex",
                }}
              >
                <X size={15} />
              </button>
            </div>
            <div style={{ ...modalBody, maxHeight: "68vh" }}>
              {/* Nome / busca */}
              <div
                style={{
                  position: "relative",
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                }}
              >
                <label style={labelSt}>
                  Nome do brinde{" "}
                  <span style={{ color: "var(--brand)" }}>*</span>
                </label>
                <input
                  value={addSearch}
                  onChange={(e) => {
                    setAddSearch(e.target.value);
                    setAddCatalogSel(false);
                    setAddVenda(null);
                  }}
                  style={inputSt}
                  placeholder="Buscar produto da loja ou digitar nome do brinde…"
                  autoComplete="off"
                />
                {acResults.length > 0 && (
                  <div
                    style={{
                      position: "absolute",
                      top: "calc(100% + 2px)",
                      left: 0,
                      right: 0,
                      zIndex: 20,
                      background: "var(--card)",
                      border: "1.5px solid var(--line)",
                      borderRadius: 10,
                      overflow: "hidden",
                      boxShadow: "0 8px 24px rgba(0,0,0,.12)",
                    }}
                  >
                    {acResults.map((c) => (
                      <div
                        key={c.id}
                        onClick={() => selectCatalog(c)}
                        style={{
                          padding: "10px 14px",
                          cursor: "pointer",
                          fontSize: 13,
                          borderBottom: "1px solid var(--line)",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background =
                            "var(--paper-deep)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background = "")
                        }
                      >
                        <div>
                          <div
                            style={{
                              fontWeight: 600,
                              color: "var(--ink)",
                              fontSize: 12.5,
                            }}
                          >
                            {c.name}
                          </div>
                          <div style={{ fontSize: 11, color: "var(--muted)" }}>
                            {c.brand} · {c.code}
                          </div>
                        </div>
                        <div
                          style={{
                            fontSize: 12,
                            color: "var(--muted)",
                            flexShrink: 0,
                            marginLeft: 10,
                          }}
                        >
                          custo R${" "}
                          {c.cost.toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div
                style={{
                  fontSize: 11.5,
                  color: "var(--muted)",
                  marginTop: -8,
                  lineHeight: 1.5,
                }}
              >
                Produto da loja? O preço de custo e venda serão preenchidos
                automaticamente ao selecionar.
              </div>

              {/* Custo + Venda */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 14,
                }}
              >
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 6 }}
                >
                  <label style={labelSt}>
                    Custo (R$){" "}
                    {!addCatalogSel && (
                      <span style={{ color: "var(--brand)" }}>*</span>
                    )}
                  </label>
                  {addCatalogSel ? (
                    <div
                      style={{
                        ...inputSt,
                        background: "var(--paper-deep)",
                        color: "var(--muted)",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      R${" "}
                      {parseFloat(addCusto).toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                      })}
                    </div>
                  ) : (
                    <input
                      type="number"
                      value={addCusto}
                      onChange={(e) => setAddCusto(e.target.value)}
                      min={0}
                      step={0.01}
                      style={inputSt}
                      placeholder="0,00"
                    />
                  )}
                </div>
                {addVenda !== null && (
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 6 }}
                  >
                    <label style={labelSt}>Preço de venda</label>
                    <div
                      style={{
                        ...inputSt,
                        background: "var(--paper-deep)",
                        color: "var(--muted)",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      R${" "}
                      {addVenda.toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Foto */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={labelSt}>Foto do item</label>
                <PhotoBox
                  photo={addPhoto}
                  pos={addPhotoPos}
                  onDragStart={(e) => {
                    e.preventDefault();
                    dragRef.current = {
                      mx: e.clientX,
                      my: e.clientY,
                      px: addPhotoPos.x,
                      py: addPhotoPos.y,
                    };
                    setDragging("add");
                  }}
                  onUpload={handleAddUpload}
                  onRemove={() => setAddPhoto(null)}
                  fileRef={addFileRef}
                />
              </div>

              {/* Modificador */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ ...labelSt, marginBottom: 4 }}>
                  Modificador individual
                </label>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={stepperSt}>
                    <button
                      onClick={() =>
                        setAddMod((m) => Math.round((m - 0.25) * 100) / 100)
                      }
                      style={stepperBtn}
                    >
                      −
                    </button>
                    <span style={stepperVal}>{fmtMod(addMod)}</span>
                    <button
                      onClick={() =>
                        setAddMod((m) => Math.round((m + 0.25) * 100) / 100)
                      }
                      style={stepperBtn}
                    >
                      +
                    </button>
                  </div>
                  <span
                    style={{
                      fontSize: 12,
                      color: "var(--muted)",
                      lineHeight: 1.4,
                    }}
                  >
                    Ajuste em relação ao multiplicador global ({globalMult}×).
                    <br />
                    Negativo = <strong>PROMO</strong> automático.
                  </span>
                </div>
              </div>

              {/* Pts preview */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={labelSt}>Pontos resultantes</label>
                <div
                  style={{
                    fontSize: 13,
                    padding: "9px 12px",
                    background: "var(--paper-deep)",
                    borderRadius: 8,
                    border: "1.5px solid var(--line)",
                    minHeight: 36,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  {addPts > 0 ? (
                    <>
                      {addOrigPts && (
                        <span
                          style={{
                            textDecoration: "line-through",
                            color: "var(--muted)",
                            fontSize: 12,
                          }}
                        >
                          {pts(addOrigPts)} pts
                        </span>
                      )}
                      <strong
                        style={{
                          color: addOrigPts ? "var(--brand)" : "var(--ink)",
                        }}
                      >
                        {pts(addPts)} pts
                      </strong>
                      {addOrigPts && (
                        <span
                          style={{
                            background: "var(--brand)",
                            color: "#fff",
                            fontSize: 9,
                            fontWeight: 800,
                            letterSpacing: ".1em",
                            padding: "2px 6px",
                            borderRadius: 5,
                          }}
                        >
                          PROMO
                        </span>
                      )}
                    </>
                  ) : (
                    <span style={{ color: "var(--muted)" }}>—</span>
                  )}
                </div>
                {addPts > 0 && (
                  <div
                    style={{
                      fontSize: 12,
                      color: "var(--muted)",
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                    }}
                  >
                    <Clock size={12} /> Equivale a{" "}
                    <strong style={{ marginLeft: 2 }}>
                      {addPedidosEquiv} pedido{addPedidosEquiv !== 1 ? "s" : ""}
                    </strong>
                    &nbsp;de R$ 3.000 aprovados
                  </div>
                )}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={labelSt}>Unidades disponíveis</label>
                <input
                  type="number"
                  value={addStock}
                  onChange={(e) => setAddStock(e.target.value)}
                  min={0}
                  style={inputSt}
                  placeholder="0"
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={labelSt}>Descrição</label>
                <textarea
                  value={addDesc}
                  onChange={(e) => setAddDesc(e.target.value)}
                  rows={3}
                  style={{
                    ...inputSt,
                    height: "auto",
                    padding: "8px 12px",
                    resize: "vertical",
                  }}
                  placeholder="Descreva o item…"
                />
              </div>
            </div>
            <div style={modalFoot}>
              <button onClick={closeAdd} style={btnGhost}>
                Cancelar
              </button>
              <button onClick={submitAdd} style={btnPrimary}>
                <Plus size={15} /> Adicionar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
