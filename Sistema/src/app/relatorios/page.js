"use client";

import { useEffect, useState } from "react";

export default function RelatoriosPage() {
  const [activeTab, setActiveTab] = useState("vendas");
  const [data, setData] = useState({ vendas: [], produtos: [], clientes: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Busca dados sem cache para garantir sincronismo após operações de CRUD
  const carregarDados = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/views", { cache: "no-store" });
      const json = await res.json();

      if (json.success) {
        setData(json.data);
      } else {
        setError(json.error || "Erro ao consultar dados.");
      }
    } catch (err) {
      setError("Erro de conexão ao carregar relatórios.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const formatarMoeda = (valor) => {
    return Number(valor || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    });
  };

  const formatarData = (dataIso) => {
    if (!dataIso) return "-";
    return new Date(dataIso).toLocaleDateString("pt-BR");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Cabeçalho */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
          borderBottom: "1px solid #cbd5e1",
          paddingBottom: "16px"
        }}
      >
        <div>
          <h1 style={{ margin: 0, color: "#1e293b", fontSize: "28px" }}>
            Painel de Relatórios & Visões
          </h1>
          <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: "14px" }}>
            Visualização consolidada através das Views do Banco de Dados
          </p>
        </div>

        {/* Abas */}
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <button
            onClick={() => setActiveTab("vendas")}
            style={{
              padding: "10px 16px",
              borderRadius: "6px",
              border: "none",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
              backgroundColor: activeTab === "vendas" ? "#1e293b" : "#e2e8f0",
              color: activeTab === "vendas" ? "#ffffff" : "#475569",
              transition: "all 0.2s"
            }}
          >
            🛒 Resumo de Vendas
          </button>
          <button
            onClick={() => setActiveTab("produtos")}
            style={{
              padding: "10px 16px",
              borderRadius: "6px",
              border: "none",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
              backgroundColor: activeTab === "produtos" ? "#1e293b" : "#e2e8f0",
              color: activeTab === "produtos" ? "#ffffff" : "#475569",
              transition: "all 0.2s"
            }}
          >
            🏆 Produtos Mais Vendidos
          </button>
          <button
            onClick={() => setActiveTab("clientes")}
            style={{
              padding: "10px 16px",
              borderRadius: "6px",
              border: "none",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
              backgroundColor: activeTab === "clientes" ? "#1e293b" : "#e2e8f0",
              color: activeTab === "clientes" ? "#ffffff" : "#475569",
              transition: "all 0.2s"
            }}
          >
            👥 Resumo dos Clientes
          </button>
          <button
            onClick={carregarDados}
            title="Recarregar Dados"
            style={{
              padding: "10px 14px",
              borderRadius: "6px",
              border: "1px solid #cbd5e1",
              fontSize: "14px",
              cursor: "pointer",
              backgroundColor: "#ffffff",
              color: "#475569"
            }}
          >
            🔄
          </button>
        </div>
      </div>

      {loading && (
        <div style={{ padding: "40px", textAlign: "center", color: "#64748b", fontSize: "16px" }}>
          Processando visões do banco de dados...
        </div>
      )}

      {error && (
        <div
          style={{
            padding: "16px",
            backgroundColor: "#fee2e2",
            color: "#991b1b",
            borderRadius: "6px",
            border: "1px solid #f87171"
          }}
        >
          {error}
        </div>
      )}

      {!loading && !error && (
        <div>
          {/* VIEW 1: Resumo das Vendas */}
          {activeTab === "vendas" && (
            <div
              style={{
                backgroundColor: "#ffffff",
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                overflow: "hidden"
              }}
            >
              <div
                style={{
                  padding: "16px 20px",
                  borderBottom: "1px solid #e2e8f0",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}
              >
                <div>
                  <h3 style={{ margin: 0, color: "#1e293b" }}>View: v_resumo_vendas</h3>
                  <span style={{ fontSize: "13px", color: "#64748b" }}>
                    Junção de Vendas, Clientes, Itens de Pedido e Produtos
                  </span>
                </div>
                <span
                  style={{
                    backgroundColor: "#e0f2fe",
                    color: "#0369a1",
                    padding: "4px 10px",
                    borderRadius: "12px",
                    fontSize: "12px",
                    fontWeight: 600
                  }}
                >
                  {data.vendas.length} registros
                </span>
              </div>

              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "14px" }}>
                  <thead>
                    <tr style={{ backgroundColor: "#f8fafc", color: "#475569", borderBottom: "1px solid #e2e8f0" }}>
                      <th style={{ padding: "12px 16px" }}>ID Venda</th>
                      <th style={{ padding: "12px 16px" }}>Data / Hora</th>
                      <th style={{ padding: "12px 16px" }}>Cliente</th>
                      <th style={{ padding: "12px 16px" }}>Tipo</th>
                      <th style={{ padding: "12px 16px" }}>Produto</th>
                      <th style={{ padding: "12px 16px", textAlign: "center" }}>Qtd</th>
                      <th style={{ padding: "12px 16px", textAlign: "right" }}>Preço Unit.</th>
                      <th style={{ padding: "12px 16px", textAlign: "right" }}>Subtotal Item</th>
                      <th style={{ padding: "12px 16px", textAlign: "right" }}>Total Venda</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.vendas.map((item, index) => (
                      <tr key={index} style={{ borderBottom: "1px solid #f1f5f9", color: "#334155" }}>
                        <td style={{ padding: "12px 16px", fontFamily: "monospace" }}>#{item.id_venda}</td>
                        <td style={{ padding: "12px 16px" }}>
                          {formatarData(item.data_venda)} {item.horario_venda ? `às ${item.horario_venda}` : ""}
                        </td>
                        <td style={{ padding: "12px 16px", fontWeight: 600 }}>{item.cliente}</td>
                        <td style={{ padding: "12px 16px" }}>
                          <span
                            style={{
                              backgroundColor: item.tipo_venda === "Presencial" ? "#f1f5f9" : "#e0e7ff",
                              color: item.tipo_venda === "Presencial" ? "#475569" : "#3730a3",
                              padding: "2px 8px",
                              borderRadius: "4px",
                              fontSize: "12px"
                            }}
                          >
                            {item.tipo_venda || "Padrão"}
                          </span>
                        </td>
                        <td style={{ padding: "12px 16px" }}>{item.produto}</td>
                        <td style={{ padding: "12px 16px", textAlign: "center" }}>{item.quantidade}</td>
                        <td style={{ padding: "12px 16px", textAlign: "right" }}>
                          {formatarMoeda(item.preco_unitario)}
                        </td>
                        <td style={{ padding: "12px 16px", textAlign: "right", fontWeight: 600, color: "#15803d" }}>
                          {formatarMoeda(item.subtotal_item)}
                        </td>
                        <td style={{ padding: "12px 16px", textAlign: "right", fontWeight: 700, color: "#0f172a" }}>
                          {formatarMoeda(item.valor_total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* VIEW 2: Produtos Mais Vendidos */}
          {activeTab === "produtos" && (
            <div
              style={{
                backgroundColor: "#ffffff",
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                overflow: "hidden"
              }}
            >
              <div
                style={{
                  padding: "16px 20px",
                  borderBottom: "1px solid #e2e8f0",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}
              >
                <div>
                  <h3 style={{ margin: 0, color: "#1e293b" }}>View: v_produtos_mais_vendidos</h3>
                  <span style={{ fontSize: "13px", color: "#64748b" }}>
                    Desempenho de vendas e faturamento consolidado por produto
                  </span>
                </div>
                <span
                  style={{
                    backgroundColor: "#fef3c7",
                    color: "#92400e",
                    padding: "4px 10px",
                    borderRadius: "12px",
                    fontSize: "12px",
                    fontWeight: 600
                  }}
                >
                  Ranking de Saída
                </span>
              </div>

              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "14px" }}>
                  <thead>
                    <tr style={{ backgroundColor: "#f8fafc", color: "#475569", borderBottom: "1px solid #e2e8f0" }}>
                      <th style={{ padding: "12px 16px" }}>Cód</th>
                      <th style={{ padding: "12px 16px" }}>Produto</th>
                      <th style={{ padding: "12px 16px" }}>Categoria</th>
                      <th style={{ padding: "12px 16px", textAlign: "center" }}>Nº de Pedidos</th>
                      <th style={{ padding: "12px 16px", textAlign: "center" }}>Unidades Vendidas</th>
                      <th style={{ padding: "12px 16px", textAlign: "right" }}>Faturamento Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.produtos.map((item, index) => (
                      <tr key={index} style={{ borderBottom: "1px solid #f1f5f9", color: "#334155" }}>
                        <td style={{ padding: "12px 16px", fontFamily: "monospace" }}>#{item.id_produto}</td>
                        <td style={{ padding: "12px 16px", fontWeight: 600 }}>{item.produto}</td>
                        <td style={{ padding: "12px 16px" }}>{item.categoria}</td>
                        <td style={{ padding: "12px 16px", textAlign: "center" }}>{item.quantidade_vendas}</td>
                        <td style={{ padding: "12px 16px", textAlign: "center", fontWeight: "bold", color: "#b45309" }}>
                          {item.unidades_vendidas} un.
                        </td>
                        <td
                          style={{
                            padding: "12px 16px",
                            textAlign: "right",
                            fontWeight: 700,
                            fontFamily: "monospace",
                            color: "#15803d"
                          }}
                        >
                          {formatarMoeda(item.faturamento_produto)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* VIEW 3: Resumo dos Clientes */}
          {activeTab === "clientes" && (
            <div
              style={{
                backgroundColor: "#ffffff",
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                overflow: "hidden"
              }}
            >
              <div
                style={{
                  padding: "16px 20px",
                  borderBottom: "1px solid #e2e8f0",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}
              >
                <div>
                  <h3 style={{ margin: 0, color: "#1e293b" }}>View: v_resumo_clientes</h3>
                  <span style={{ fontSize: "13px", color: "#64748b" }}>
                    Histórico consolidado de compras, volume e total investido por cliente
                  </span>
                </div>
                <span
                  style={{
                    backgroundColor: "#dcfce7",
                    color: "#166534",
                    padding: "4px 10px",
                    borderRadius: "12px",
                    fontSize: "12px",
                    fontWeight: 600
                  }}
                >
                  Base Ativa
                </span>
              </div>

              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "14px" }}>
                  <thead>
                    <tr style={{ backgroundColor: "#f8fafc", color: "#475569", borderBottom: "1px solid #e2e8f0" }}>
                      <th style={{ padding: "12px 16px" }}>Cód</th>
                      <th style={{ padding: "12px 16px" }}>Cliente</th>
                      <th style={{ padding: "12px 16px" }}>CPF</th>
                      <th style={{ padding: "12px 16px", textAlign: "center" }}>Total de Pedidos</th>
                      <th style={{ padding: "12px 16px", textAlign: "center" }}>Itens Comprados</th>
                      <th style={{ padding: "12px 16px", textAlign: "right" }}>Total Gasto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.clientes.map((item, index) => (
                      <tr key={index} style={{ borderBottom: "1px solid #f1f5f9", color: "#334155" }}>
                        <td style={{ padding: "12px 16px", fontFamily: "monospace" }}>#{item.id_cliente}</td>
                        <td style={{ padding: "12px 16px", fontWeight: 600 }}>{item.cliente}</td>
                        <td style={{ padding: "12px 16px", color: "#64748b" }}>{item.cpf || "-"}</td>
                        <td style={{ padding: "12px 16px", textAlign: "center" }}>{item.quantidade_compras}</td>
                        <td style={{ padding: "12px 16px", textAlign: "center", fontWeight: "bold" }}>
                          {item.unidades_compradas} un.
                        </td>
                        <td
                          style={{
                            padding: "12px 16px",
                            textAlign: "right",
                            fontWeight: 700,
                            fontFamily: "monospace",
                            color: "#15803d"
                          }}
                        >
                          {formatarMoeda(item.total_gasto)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}