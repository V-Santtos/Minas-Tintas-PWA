"use client";

import { createContext, useContext, useState } from "react";

type AdminProfile = { name: string; photo: string | null };

const AdminContext = createContext<{
  profile: AdminProfile;
  setProfile: (p: AdminProfile) => void;
} | null>(null);

export function AdminProvider({
  children,
  initialName = "Admin",
  initialPhoto = null,
}: {
  children: React.ReactNode;
  initialName?: string;
  initialPhoto?: string | null;
}) {
  const [profile, setProfile] = useState<AdminProfile>({
    name: initialName,
    photo: initialPhoto,
  });
  return (
    <AdminContext.Provider value={{ profile, setProfile }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin fora do AdminProvider");
  return ctx;
}
