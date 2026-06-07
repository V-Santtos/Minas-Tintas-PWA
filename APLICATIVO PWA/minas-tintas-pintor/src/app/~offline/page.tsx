export const metadata = { title: "Sem conexão — Minas Tintas" };

export default function Offline() {
  return (
    <main
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        padding: 24,
        background: "#FAF7F2",
        color: "#1C1A17",
        textAlign: "center",
      }}
    >
      <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>
        Você está offline
      </h1>
      <p
        style={{ color: "#8A817A", maxWidth: 320, lineHeight: 1.6, margin: 0 }}
      >
        Sem conexão no momento. Assim que a internet voltar, é só recarregar
        para continuar de onde parou.
      </p>
    </main>
  );
}
