"use client";

import { useEffect, useState } from "react";

const loadScript = (src) => {
  return new Promise((resolve, reject) => {
    if (typeof window !== "undefined" && document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => resolve();
    script.onerror = () => reject();
    document.body.appendChild(script);
  });
};

const LABEL_MAPEAMENTO = {
  id_venda: "ID Venda",
  data_venda: "Data",
  horario_venda: "Hora",
  id_cliente: "ID Cliente",
  cliente: "Cliente",
  cpf: "CPF",
  tipo_venda: "Tipo Venda",
  id_produto: "ID Produto",
  produto: "Produto",
  quantidade: "Quantidade",
  preco_unitario: "Preço Unit.",
  subtotal_item: "Subtotal",
  valor_total: "Total Venda",
  valor_frete: "Frete",
  numero_retirada: "Nº Retirada",
  id_categoria: "ID Cat.",
  categoria: "Categoria",
  quantidade_vendas: "Nº Pedidos",
  unidades_vendidas: "Unidades Vendidas",
  faturamento_produto: "Faturamento Total",
  quantidade_compras: "Total de Pedidos",
  unidades_compradas: "Itens Comprados",
  total_gasto: "Total Gasto"
};

export default function RelatoriosPage() {
  const [activeTab, setActiveTab] = useState("vendas");
  const [data, setData] = useState({ vendas: [], produtos: [], clientes: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [customBase, setCustomBase] = useState("vendas");
  const [customData, setCustomData] = useState([]);
  const [loadingCustom, setLoadingCustom] = useState(false);
  const [loadingExport, setLoadingExport] = useState(false);

  const [colunasSelecionadas, setColunasSelecionadas] = useState([]);
  const [filtroTexto, setFiltroTexto] = useState("");
  const [filtroDataInicio, setFiltroDataInicio] = useState("");
  const [filtroDataFim, setFiltroDataFim] = useState("");
  const [filtroTipoVenda, setFiltroTipoVenda] = useState("Todos");
  const [filtroValorMin, setFiltroValorMin] = useState("");
  const [filtroValorMax, setFiltroValorMax] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("");

  const [ordenarColuna, setOrdenarColuna] = useState("");
  const [ordenarDirecao, setOrdenarDirecao] = useState("asc");

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

  const carregarDadosCustom = async (tipo) => {
    try {
      setLoadingCustom(true);
      const res = await fetch(`/api/views?tipo=${tipo}`, { cache: "no-store" });
      const json = await res.json();

      if (json.success) {
        setCustomData(json.data);
        if (tipo === "vendas") {
          setColunasSelecionadas(["id_venda", "data_venda", "cliente", "tipo_venda", "produto", "quantidade", "subtotal_item", "valor_total"]);
          setOrdenarColuna("id_venda");
        } else if (tipo === "produtos") {
          setColunasSelecionadas(["id_produto", "produto", "categoria", "quantidade_vendas", "unidades_vendidas", "faturamento_produto"]);
          setOrdenarColuna("unidades_vendidas");
        } else if (tipo === "clientes") {
          setColunasSelecionadas(["id_cliente", "cliente", "cpf", "quantidade_compras", "unidades_compradas", "total_gasto"]);
          setOrdenarColuna("total_gasto");
        }
      } else {
        setError(json.error || "Erro ao carregar dados customizados.");
      }
    } catch (err) {
      setError("Erro de conexão ao carregar dados customizados.");
    } finally {
      setLoadingCustom(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  useEffect(() => {
    if (activeTab === "customizado") {
      carregarDadosCustom(customBase);
    }
  }, [activeTab, customBase]);

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

  const obterTodasColunas = () => {
    if (customBase === "vendas") {
      return ["id_venda", "data_venda", "horario_venda", "id_cliente", "cliente", "tipo_venda", "id_produto", "produto", "quantidade", "preco_unitario", "subtotal_item", "valor_total", "valor_frete", "numero_retirada"];
    }
    if (customBase === "produtos") {
      return ["id_produto", "produto", "id_categoria", "categoria", "quantidade_vendas", "unidades_vendidas", "faturamento_produto"];
    }
    if (customBase === "clientes") {
      return ["id_cliente", "cliente", "cpf", "quantidade_compras", "unidades_compradas", "total_gasto"];
    }
    return [];
  };

  const toggleColuna = (col) => {
    if (colunasSelecionadas.includes(col)) {
      if (colunasSelecionadas.length > 1) {
        setColunasSelecionadas(colunasSelecionadas.filter(c => c !== col));
      }
    } else {
      setColunasSelecionadas([...colunasSelecionadas, col]);
    }
  };

  const handleDragStart = (e, index) => {
    e.dataTransfer.setData("text/plain", index);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    const sourceIndex = Number(e.dataTransfer.getData("text/plain"));
    if (sourceIndex === targetIndex) return;

    const newCols = [...colunasSelecionadas];
    const [removed] = newCols.splice(sourceIndex, 1);
    newCols.splice(targetIndex, 0, removed);
    setColunasSelecionadas(newCols);
  };

  const obterDadosFiltrados = () => {
    let filtrados = [...customData];

    if (filtroTexto.trim() !== "") {
      const query = filtroTexto.toLowerCase();
      filtrados = filtrados.filter(row => {
        return Object.entries(row).some(([key, val]) => {
          if (val === null || val === undefined) return false;
          return String(val).toLowerCase().includes(query);
        });
      });
    }

    if (customBase === "vendas") {
      if (filtroDataInicio) {
        const start = new Date(filtroDataInicio);
        filtrados = filtrados.filter(row => new Date(row.data_venda) >= start);
      }
      if (filtroDataFim) {
        const end = new Date(filtroDataFim);
        // Date input values default to 00:00:00, so we adjust to the end of the day to avoid excluding records from that day
        end.setHours(23, 59, 59, 999);
        filtrados = filtrados.filter(row => new Date(row.data_venda) <= end);
      }
      if (filtroTipoVenda !== "Todos") {
        filtrados = filtrados.filter(row => row.tipo_venda === filtroTipoVenda);
      }
      if (filtroValorMin) {
        filtrados = filtrados.filter(row => Number(row.subtotal_item || row.valor_total) >= Number(filtroValorMin));
      }
      if (filtroValorMax) {
        filtrados = filtrados.filter(row => Number(row.subtotal_item || row.valor_total) <= Number(filtroValorMax));
      }
    }

    if (customBase === "produtos") {
      if (filtroCategoria.trim() !== "") {
        const cat = filtroCategoria.toLowerCase();
        filtrados = filtrados.filter(row => row.categoria && row.categoria.toLowerCase().includes(cat));
      }
      if (filtroValorMin) {
        filtrados = filtrados.filter(row => Number(row.faturamento_produto) >= Number(filtroValorMin));
      }
      if (filtroValorMax) {
        filtrados = filtrados.filter(row => Number(row.faturamento_produto) <= Number(filtroValorMax));
      }
    }

    if (customBase === "clientes") {
      if (filtroValorMin) {
        filtrados = filtrados.filter(row => Number(row.total_gasto) >= Number(filtroValorMin));
      }
      if (filtroValorMax) {
        filtrados = filtrados.filter(row => Number(row.total_gasto) <= Number(filtroValorMax));
      }
    }

    if (ordenarColuna) {
      filtrados.sort((a, b) => {
        let valA = a[ordenarColuna];
        let valB = b[ordenarColuna];

        if (valA === null || valA === undefined) valA = "";
        if (valB === null || valB === undefined) valB = "";

        if (typeof valA === "number" && typeof valB === "number") {
          return ordenarDirecao === "asc" ? valA - valB : valB - valA;
        }

        if (ordenarColuna === "data_venda") {
          return ordenarDirecao === "asc"
            ? new Date(valA) - new Date(valB)
            : new Date(valB) - new Date(valA);
        }

        return ordenarDirecao === "asc"
          ? String(valA).localeCompare(String(valB))
          : String(valB).localeCompare(String(valA));
      });
    }

    return filtrados;
  };

  const dadosFiltrados = obterDadosFiltrados();

  const handleExportarCSV = () => {
    if (dadosFiltrados.length === 0) {
      alert("Nenhum dado para exportar.");
      return;
    }
    const cabecalho = colunasSelecionadas.map(c => LABEL_MAPEAMENTO[c] || c).join(";");
    const linhas = dadosFiltrados.map(row => {
      return colunasSelecionadas.map(col => {
        let val = row[col];
        if (val === null || val === undefined) return "";
        if (col === "data_venda") {
          return formatarData(val);
        }
        if (typeof val === "string") {
          return `"${val.replace(/"/g, '""')}"`;
        }
        return val;
      }).join(";");
    });

    // Add BOM for proper UTF-8 character encoding recognition in spreadsheet applications
    const csvText = "\uFEFF" + [cabecalho, ...linhas].join("\n");
    const blob = new Blob([csvText], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `relatorio_${customBase}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportarPDF = async () => {
    if (dadosFiltrados.length === 0) {
      alert("Nenhum dado para exportar.");
      return;
    }
    try {
      setLoadingExport(true);
      await loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js");
      await loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js");

      const { jsPDF } = window.jspdf;
      const doc = new jsPDF({ orientation: "landscape" });

      doc.setFillColor(30, 41, 59);
      doc.rect(0, 0, 297, 28, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.text("EMPÓRIO DE BEBIDAS", 14, 18);

      doc.setTextColor(226, 232, 240);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text("Sistema de Relatórios Administrativos", 220, 18);

      doc.setTextColor(51, 65, 85);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      const titulos = {
        vendas: "Resumo Geral e Histórico de Vendas",
        produtos: "Ranking e Performance de Produtos",
        clientes: "Histórico e Consumo de Clientes"
      };
      doc.text(`Relatório: ${titulos[customBase]}`, 14, 38);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text(`Registros retornados: ${dadosFiltrados.length}`, 14, 44);
      doc.text(`Gerado em: ${new Date().toLocaleString("pt-BR")}`, 220, 44);

      const headers = colunasSelecionadas.map(c => LABEL_MAPEAMENTO[c] || c);
      const body = dadosFiltrados.map(row => {
        return colunasSelecionadas.map(col => {
          let val = row[col];
          if (val === null || val === undefined) return "-";
          if (col === "data_venda") {
            return formatarData(val);
          }
          if (["preco_unitario", "subtotal_item", "valor_total", "faturamento_produto", "total_gasto", "valor_frete"].includes(col)) {
            return formatarMoeda(val);
          }
          if (["unidades_vendidas", "unidades_compradas"].includes(col)) {
            return `${val} un.`;
          }
          return val;
        });
      });

      doc.autoTable({
        startY: 48,
        head: [headers],
        body: body,
        theme: "striped",
        headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontStyle: "bold" },
        styles: { fontSize: 8, cellPadding: 3 },
        margin: { left: 14, right: 14 }
      });

      doc.save(`relatorio_${customBase}_${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (err) {
      console.error("Erro ao gerar PDF:", err);
      alert("Houve um erro ao processar o PDF. Verifique sua conexão à internet.");
    } finally {
      setLoadingExport(false);
    }
  };

  const handleAlternarOrdenacao = (coluna) => {
    if (ordenarColuna === coluna) {
      setOrdenarDirecao(ordenarDirecao === "asc" ? "desc" : "asc");
    } else {
      setOrdenarColuna(coluna);
      setOrdenarDirecao("asc");
    }
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
            Visualização consolidada e ferramenta de relatórios customizáveis
          </p>
        </div>

        {/* Abas - Botão de recarregar removido daqui para evitar que a barra mude de lugar */}
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
            onClick={() => setActiveTab("customizado")}
            style={{
              padding: "10px 16px",
              borderRadius: "6px",
              border: "none",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
              backgroundColor: activeTab === "customizado" ? "#15803d" : "#dcfce7",
              color: activeTab === "customizado" ? "#ffffff" : "#166534",
              transition: "all 0.2s"
            }}
          >
            ⚙️ Customizar
          </button>
        </div>
      </div>

      {loading && activeTab !== "customizado" && (
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

      {/* RENDERIZAÇÃO DAS ABAS PADRÃO */}
      {!loading && !error && activeTab !== "customizado" && (
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
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <button
                    onClick={carregarDados}
                    title="Recarregar Dados da View"
                    style={{
                      padding: "6px 12px",
                      borderRadius: "6px",
                      border: "1px solid #cbd5e1",
                      fontSize: "13px",
                      fontWeight: 600,
                      cursor: "pointer",
                      backgroundColor: "#ffffff",
                      color: "#475569",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px"
                    }}
                  >
                    🔄 Recarregar
                  </button>
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
                              backgroundColor: item.tipo_venda === "Retirada" ? "#f1f5f9" : "#e0e7ff",
                              color: item.tipo_venda === "Retirada" ? "#475569" : "#3730a3",
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
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <button
                    onClick={carregarDados}
                    title="Recarregar Dados da View"
                    style={{
                      padding: "6px 12px",
                      borderRadius: "6px",
                      border: "1px solid #cbd5e1",
                      fontSize: "13px",
                      fontWeight: 600,
                      cursor: "pointer",
                      backgroundColor: "#ffffff",
                      color: "#475569",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px"
                    }}
                  >
                    🔄 Recarregar
                  </button>
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
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <button
                    onClick={carregarDados}
                    title="Recarregar Dados da View"
                    style={{
                      padding: "6px 12px",
                      borderRadius: "6px",
                      border: "1px solid #cbd5e1",
                      fontSize: "13px",
                      fontWeight: 600,
                      cursor: "pointer",
                      backgroundColor: "#ffffff",
                      color: "#475569",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px"
                    }}
                  >
                    🔄 Recarregar
                  </button>
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

      {/* GERADOR DE RELATÓRIOS CUSTOMIZADOS */}
      {activeTab === "customizado" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "8px",
              padding: "20px",
              border: "1px solid #e2e8f0",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              display: "flex",
              flexDirection: "column",
              gap: "16px"
            }}
          >
            <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", alignItems: "center" }}>
              <div style={{ flex: 1, minWidth: "200px" }}>
                <label style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "#475569", marginBottom: "6px" }}>
                  1. Selecione a Base do Relatório
                </label>
                <div style={{ display: "flex", gap: "8px" }}>
                  <select
                    value={customBase}
                    onChange={(e) => setCustomBase(e.target.value)}
                    style={{
                      flex: 1,
                      padding: "8px 12px",
                      borderRadius: "6px",
                      border: "1px solid #cbd5e1",
                      fontSize: "14px",
                      backgroundColor: "#f8fafc",
                      color: "#1e293b",
                      fontWeight: 600
                    }}
                  >
                    <option value="vendas">Vendas Detalhadas (v_resumo_vendas)</option>
                    <option value="produtos">Ranking de Vendas de Produtos (v_produtos_mais_vendidos)</option>
                    <option value="clientes">Perfil de Compra de Clientes (v_resumo_clientes)</option>
                  </select>
                  <button
                    onClick={() => carregarDadosCustom(customBase)}
                    title="Recarregar Dados da Base Customizada"
                    style={{
                      padding: "8px 12px",
                      borderRadius: "6px",
                      border: "1px solid #cbd5e1",
                      cursor: "pointer",
                      backgroundColor: "#ffffff",
                      color: "#475569",
                      display: "flex",
                      alignItems: "center"
                    }}
                  >
                    🔄
                  </button>
                </div>
              </div>

              <div style={{ flex: 2, minWidth: "300px" }}>
                <label style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "#475569", marginBottom: "6px" }}>
                  Pesquisa
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type="text"
                    placeholder="Digite qualquer termo para buscar na tabela..."
                    value={filtroTexto}
                    onChange={(e) => setFiltroTexto(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "8px 12px 8px 36px",
                      borderRadius: "6px",
                      border: "1px solid #cbd5e1",
                      fontSize: "14px"
                    }}
                  />
                  <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }}>
                    🔍
                  </span>
                  {filtroTexto && (
                    <button
                      onClick={() => setFiltroTexto("")}
                      style={{
                        position: "absolute",
                        right: "12px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        border: "none",
                        background: "none",
                        cursor: "pointer",
                        color: "#94a3b8"
                      }}
                    >
                      ❌
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "#475569", marginBottom: "8px" }}>
                2. Selecione as Colunas para Visualização e Exportação
              </label>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "10px",
                  padding: "12px",
                  backgroundColor: "#f8fafc",
                  borderRadius: "6px",
                  border: "1px solid #e2e8f0"
                }}
              >
                {obterTodasColunas().map((col) => {
                  const active = colunasSelecionadas.includes(col);
                  return (
                    <button
                      key={col}
                      onClick={() => toggleColuna(col)}
                      style={{
                        padding: "6px 12px",
                        borderRadius: "20px",
                        fontSize: "12px",
                        fontWeight: 600,
                        cursor: "pointer",
                        border: active ? "1px solid #1e293b" : "1px solid #cbd5e1",
                        backgroundColor: active ? "#1e293b" : "#ffffff",
                        color: active ? "#ffffff" : "#64748b",
                        transition: "all 0.15s"
                      }}
                    >
                      {active ? "✓ " : "+ "}
                      {LABEL_MAPEAMENTO[col] || col}
                    </button>
                  );
                })}
              </div>

              {/* Ordem das Colunas (Drag-and-Drop) */}
              <div style={{ marginTop: "16px" }}>
                <span style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#475569", marginBottom: "8px" }}>
                  Ordem de Exibição (Arraste as colunas para reordenar a tabela e o relatório final):
                </span>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "8px",
                    padding: "12px",
                    backgroundColor: "#ffffff",
                    borderRadius: "6px",
                    border: "1px dashed #cbd5e1",
                    minHeight: "44px"
                  }}
                >
                  {colunasSelecionadas.map((col, index) => (
                    <div
                      key={col}
                      draggable
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, index)}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "6px 12px",
                        backgroundColor: "#f1f5f9",
                        border: "1px solid #cbd5e1",
                        borderRadius: "4px",
                        fontSize: "13px",
                        fontWeight: 600,
                        color: "#334155",
                        cursor: "grab",
                        userSelect: "none"
                      }}
                      title="Arraste para reordenar"
                    >
                      <span>☰</span>
                      <span>{LABEL_MAPEAMENTO[col] || col}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            <div>
              <label style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "#475569", marginBottom: "8px" }}>
                3. Filtros Avançados
              </label>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>

                {customBase === "vendas" && (
                  <>
                    <div style={{ flex: "1 1 180px" }}>
                      <span style={{ fontSize: "12px", color: "#64748b", fontWeight: 500 }}>Data Inicial</span>
                      <input
                        type="date"
                        value={filtroDataInicio}
                        onChange={(e) => setFiltroDataInicio(e.target.value)}
                        style={{ width: "100%", padding: "6px 10px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px", marginTop: "4px" }}
                      />
                    </div>
                    <div style={{ flex: "1 1 180px" }}>
                      <span style={{ fontSize: "12px", color: "#64748b", fontWeight: 500 }}>Data Final</span>
                      <input
                        type="date"
                        value={filtroDataFim}
                        onChange={(e) => setFiltroDataFim(e.target.value)}
                        style={{ width: "100%", padding: "6px 10px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px", marginTop: "4px" }}
                      />
                    </div>
                    <div style={{ flex: "1 1 150px" }}>
                      <span style={{ fontSize: "12px", color: "#64748b", fontWeight: 500 }}>Tipo de Venda</span>
                      <select
                        value={filtroTipoVenda}
                        onChange={(e) => setFiltroTipoVenda(e.target.value)}
                        style={{ width: "100%", padding: "6px 10px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px", marginTop: "4px" }}
                      >
                        <option value="Todos">Todos</option>
                        <option value="Retirada">Retirada</option>
                        <option value="Entrega">Entrega</option>
                      </select>
                    </div>
                  </>
                )}

                {customBase === "produtos" && (
                  <div style={{ flex: "1 1 200px" }}>
                    <span style={{ fontSize: "12px", color: "#64748b", fontWeight: 500 }}>Filtrar Categoria</span>
                    <input
                      type="text"
                      placeholder="Ex: Cerveja, Vinho..."
                      value={filtroCategoria}
                      onChange={(e) => setFiltroCategoria(e.target.value)}
                      style={{ width: "100%", padding: "6px 10px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px", marginTop: "4px" }}
                    />
                  </div>
                )}

                <div style={{ flex: "1 1 180px" }}>
                  <span style={{ fontSize: "12px", color: "#64748b", fontWeight: 500 }}>
                    {customBase === "vendas" ? "Subtotal Mínimo" : customBase === "produtos" ? "Faturamento Mínimo" : "Total Gasto Mínimo"}
                  </span>
                  <input
                    type="number"
                    placeholder="R$ Min"
                    value={filtroValorMin}
                    onChange={(e) => setFiltroValorMin(e.target.value)}
                    style={{ width: "100%", padding: "6px 10px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px", marginTop: "4px" }}
                  />
                </div>

                <div style={{ flex: "1 1 180px" }}>
                  <span style={{ fontSize: "12px", color: "#64748b", fontWeight: 500 }}>
                    {customBase === "vendas" ? "Subtotal Máximo" : customBase === "produtos" ? "Faturamento Máximo" : "Total Gasto Máximo"}
                  </span>
                  <input
                    type="number"
                    placeholder="R$ Max"
                    value={filtroValorMax}
                    onChange={(e) => setFiltroValorMax(e.target.value)}
                    style={{ width: "100%", padding: "6px 10px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px", marginTop: "4px" }}
                  />
                </div>

                <div style={{ display: "flex", alignItems: "flex-end" }}>
                  <button
                    onClick={() => {
                      setFiltroTexto("");
                      setFiltroDataInicio("");
                      setFiltroDataFim("");
                      setFiltroTipoVenda("Todos");
                      setFiltroValorMin("");
                      setFiltroValorMax("");
                      setFiltroCategoria("");
                    }}
                    style={{
                      padding: "8px 14px",
                      borderRadius: "6px",
                      border: "1px solid #cbd5e1",
                      backgroundColor: "#ffffff",
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "#ef4444",
                      cursor: "pointer"
                    }}
                  >
                    Limpar Filtros
                  </button>
                </div>

              </div>
            </div>

          </div>

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
                alignItems: "center",
                flexWrap: "wrap",
                gap: "12px"
              }}
            >
              <div>
                <h3>Dados Customizados</h3>
                <span style={{ fontSize: "13px", color: "#64748b" }}>
                  Exibindo {dadosFiltrados.length} de {customData.length} registros totais
                </span>
              </div>

              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  onClick={handleExportarCSV}
                  disabled={dadosFiltrados.length === 0}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "6px",
                    border: "none",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: dadosFiltrados.length === 0 ? "not-allowed" : "pointer",
                    backgroundColor: "#16a34a",
                    color: "#ffffff",
                    opacity: dadosFiltrados.length === 0 ? 0.6 : 1
                  }}
                >
                  📥 Exportar CSV
                </button>

                <button
                  onClick={handleExportarPDF}
                  disabled={dadosFiltrados.length === 0 || loadingExport}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "6px",
                    border: "none",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: (dadosFiltrados.length === 0 || loadingExport) ? "not-allowed" : "pointer",
                    backgroundColor: "#dc2626",
                    color: "#ffffff",
                    opacity: (dadosFiltrados.length === 0 || loadingExport) ? 0.6 : 1
                  }}
                >
                  {loadingExport ? "Gerando PDF..." : "📄 Exportar PDF"}
                </button>
              </div>
            </div>

            {loadingCustom ? (
              <div style={{ padding: "60px", textAlign: "center", color: "#64748b" }}>
                Consultando banco de dados PostgreSQL...
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "14px" }}>
                  <thead>
                    <tr style={{ backgroundColor: "#f8fafc", color: "#475569", borderBottom: "1px solid #e2e8f0" }}>
                      {colunasSelecionadas.map((col) => (
                        <th
                          key={col}
                          onClick={() => handleAlternarOrdenacao(col)}
                          style={{
                            padding: "12px 16px",
                            cursor: "pointer",
                            userSelect: "none",
                            backgroundColor: ordenarColuna === col ? "#f1f5f9" : "transparent"
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            {LABEL_MAPEAMENTO[col] || col}
                            {ordenarColuna === col ? (ordenarDirecao === "asc" ? "▲" : "▼") : "↕"}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {dadosFiltrados.map((item, index) => (
                      <tr
                        key={index}
                        style={{
                          borderBottom: "1px solid #f1f5f9",
                          color: "#334155",
                          backgroundColor: index % 2 === 0 ? "#ffffff" : "#f8fafc"
                        }}
                      >
                        {colunasSelecionadas.map((col) => {
                          let val = item[col];

                          if (val === null || val === undefined) {
                            val = "-";
                          } else if (col === "data_venda") {
                            val = formatarData(val);
                          } else if (["preco_unitario", "subtotal_item", "valor_total", "faturamento_produto", "total_gasto", "valor_frete"].includes(col)) {
                            val = formatarMoeda(val);
                          } else if (["unidades_vendidas", "unidades_compradas"].includes(col)) {
                            val = `${val} un.`;
                          }

                          return (
                            <td
                              key={col}
                              style={{
                                padding: "12px 16px",
                                fontWeight: ["cliente", "produto"].includes(col) ? 600 : "normal",
                                fontFamily: ["id_venda", "id_produto", "id_cliente", "cpf"].includes(col) ? "monospace" : "inherit"
                              }}
                            >
                              {val}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                    {dadosFiltrados.length === 0 && (
                      <tr>
                        <td colSpan={colunasSelecionadas.length} style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
                          Nenhum registro encontrado correspondente aos filtros.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

          </div>

        </div>
      )}
    </div>
  );
}
