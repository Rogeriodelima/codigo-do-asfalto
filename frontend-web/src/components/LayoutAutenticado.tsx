import NavBottom from "./NavBottom";

export default function LayoutAutenticado({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100vh" }}>
      <NavBottom />
      {/* Conteúdo com padding para não ficar atrás do nav */}
      <main
        className="main-autenticado"
        style={{ paddingBottom: "80px" }}
      >
        {children}
      </main>
    </div>
  );
}