import pool from "@/lib/db";
import { NextResponse } from "next/server";

// Desativa o cache do Next.js para refletir edições e inserções no banco em tempo real
export const dynamic = "force-dynamic";
export const revalidate = 0;

const VIEWS_PERMITIDAS = {
  vendas: "v_resumo_vendas",
  produtos: "v_produtos_mais_vendidos",
  clientes: "v_resumo_clientes"
};

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const tipo = searchParams.get("tipo");

    // Consulta individual sob demanda
    if (tipo && VIEWS_PERMITIDAS[tipo]) {
      const viewTable = VIEWS_PERMITIDAS[tipo];
      const result = await pool.query(`SELECT * FROM ${viewTable}`);
      return NextResponse.json(
        { success: true, data: result.rows },
        { headers: { "Cache-Control": "no-store, max-age=0" } }
      );
    }

    // Consulta paralela das 3 views com ordenações estratégicas
    const [vendasRes, produtosRes, clientesRes] = await Promise.all([
      pool.query(`SELECT * FROM ${VIEWS_PERMITIDAS.vendas} ORDER BY id_venda DESC LIMIT 50`),
      pool.query(`SELECT * FROM ${VIEWS_PERMITIDAS.produtos} ORDER BY unidades_vendidas DESC`),
      pool.query(`SELECT * FROM ${VIEWS_PERMITIDAS.clientes} ORDER BY total_gasto DESC`)
    ]);

    return NextResponse.json(
      {
        success: true,
        data: {
          vendas: vendasRes.rows,
          produtos: produtosRes.rows,
          clientes: clientesRes.rows
        }
      },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  } catch (error) {
    console.error("Erro ao consultar views no PostgreSQL:", error);
    return NextResponse.json(
      { success: false, error: "Falha ao carregar dados das visões." },
      { status: 500 }
    );
  }
}