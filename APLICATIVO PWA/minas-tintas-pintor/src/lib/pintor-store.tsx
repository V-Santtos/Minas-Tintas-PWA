"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  bonusPts,
  type Order,
  type LojaProduct,
  type CatalogItem,
} from "./pintor-data";

export type PintorReadData = {
  saldo: number;
  profile: {
    name: string;
    firstName: string;
    phone: string;
    cpf: string;
    parceiroDesde: string;
  };
  orders: Order[];
  loja: LojaProduct[];
  pendingRedemptions: PendingRedemption[];
  clientes: {
    id: string;
    type: "pessoa" | "empresa";
    name: string;
    phone: string;
    document: string;
    cep: string;
    address: string;
    number: string;
    city: string;
    neighborhood: string;
    note: string;
  }[];
  atividade: {
    id: string;
    date: string;
    label: string;
    pts: number;
    kind: "in" | "out";
  }[];
  catalog: CatalogItem[];
};

export type PendingRedemption = {
  id: string;
  itemId: string;
  itemName: string;
  pts: number;
  requestedAt: string;
  status: "pendente";
};

export type SubmittedOrder = {
  id: string;
  clientName: string;
  payment: string;
  items: { name: string; qty: number; price: number }[];
  total: number;
};

type Store = {
  saldo: number;
  setSaldo: (n: number) => void;
  resgatar: (pts: number) => void;
  pendingRedemptions: PendingRedemption[];
  requestRedemption: (
    item: Omit<PendingRedemption, "id" | "status" | "requestedAt">,
  ) => void;
  cancelRedemption: (id: string) => void;

  data: PintorReadData;
  cart: Record<string, number>;
  addCart: (id: string, delta: number) => void;
  clearCart: () => void;
  cartQty: number;
  cartTotal: number;
  cartBonus: number;

  selectedClient: { name: string; phone: string } | null;
  setSelectedClient: (c: { name: string; phone: string } | null) => void;

  selectedPayment: string | null;
  setSelectedPayment: (p: string | null) => void;

  lastSubmitted: SubmittedOrder | null;
  setLastSubmitted: (o: SubmittedOrder | null) => void;
};

const PintorContext = createContext<Store | null>(null);

export function PintorProvider({
  data,
  children,
}: {
  data: PintorReadData;
  children: ReactNode;
}) {
  const [saldo, setSaldo] = useState(data.saldo);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [selectedClient, setSelectedClient] = useState<{
    name: string;
    phone: string;
  } | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);
  const [lastSubmitted, setLastSubmitted] = useState<SubmittedOrder | null>(
    null,
  );
  const [pendingRedemptions, setPendingRedemptions] = useState<
    PendingRedemption[]
  >(data.pendingRedemptions);

  const addCart = (id: string, delta: number) => {
    setCart((prev) => {
      const next = { ...prev };
      const q = (next[id] || 0) + delta;
      if (q <= 0) delete next[id];
      else next[id] = q;
      return next;
    });
  };

  const clearCart = () => {
    setCart({});
    setSelectedPayment(null);
    setSelectedClient(null);
  };

  const resgatar = (pts: number) => setSaldo((s) => Math.max(0, s - pts));

  const requestRedemption = (
    item: Omit<PendingRedemption, "id" | "status" | "requestedAt">,
  ) => {
    setPendingRedemptions((prev) => [
      {
        ...item,
        id: `res-${item.itemId}-${Date.now()}`,
        requestedAt: "Agora",
        status: "pendente",
      },
      ...prev,
    ]);
  };

  const cancelRedemption = (id: string) => {
    setPendingRedemptions((prev) => {
      const redemption = prev.find((item) => item.id === id);
      if (redemption) setSaldo((s) => s + redemption.pts);
      return prev.filter((item) => item.id !== id);
    });
  };

  const { cartQty, cartTotal, cartBonus } = useMemo(() => {
    const qty = Object.values(cart).reduce((a, b) => a + b, 0);
    const total = Object.keys(cart).reduce((s, id) => {
      const p = data.catalog.find((x) => x.id === id);
      return p ? s + p.price * cart[id] : s;
    }, 0);
    return { cartQty: qty, cartTotal: total, cartBonus: bonusPts(total) };
  }, [cart, data.catalog]);

  const value: Store = {
    data,
    saldo,
    setSaldo,
    resgatar,
    pendingRedemptions,
    requestRedemption,
    cancelRedemption,
    cart,
    addCart,
    clearCart,
    cartQty,
    cartTotal,
    cartBonus,
    selectedClient,
    setSelectedClient,
    selectedPayment,
    setSelectedPayment,
    lastSubmitted,
    setLastSubmitted,
  };

  return (
    <PintorContext.Provider value={value}>{children}</PintorContext.Provider>
  );
}

export function usePintor(): Store {
  const ctx = useContext(PintorContext);
  if (!ctx)
    throw new Error("usePintor deve ser usado dentro de PintorProvider");
  return ctx;
}
