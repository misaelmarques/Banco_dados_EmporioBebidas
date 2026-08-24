import Link from "next/link";

export default function Home() {
  const modulos = [
    { title: "📦 Produtos", desc: "Gerenciar catálogo, preços e estoque", href: "/produtos" },
    { title: "👥 Clientes", desc: "Cadastro de clientes, telefones e endereços", href: "/clientes" },
    { title: "🛒 Vendas", desc: "Registro e acompanhamento de pedidos", href: "/vendas" },
    { title: "📊 Relatórios (Views)", desc: "Visões consolidadas do banco de dados", href: "/relatorios" }
  ];

  return (
    <div style={{ maxWidth: "900px", margin: "40px auto", padding: "0 20px" }}>
      <h1 style={{ fontSize: "32px", color: "#1e293b", marginBottom: "8px" }}>
        Empório de Bebidas & Adega
      </h1>
      <p style={{ color: "#64748b", marginBottom: "32px", fontSize: "16px" }}>
        Selecione um módulo abaixo para navegar pelo sistema:
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "20px"
        }}
      >
        {modulos.map((mod) => (
          <Link
            key={mod.href}
            href={mod.href}
            style={{
              display: "block",
              padding: "24px",
              backgroundColor: "#ffffff",
              borderRadius: "8px",
              border: "1px solid #e2e8f0",
              textDecoration: "none",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              transition: "transform 0.15s, border-color 0.15s"
            }}
          >
            <h2 style={{ margin: "0 0 8px", fontSize: "20px", color: "#0f172a" }}>
              {mod.title}
            </h2>
            <p style={{ margin: 0, fontSize: "14px", color: "#64748b" }}>
              {mod.desc}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}