import pool from '../../../lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const query = `
      SELECT v.*, c.nome as nome_cliente 
      FROM venda v
      JOIN cliente c ON v.id_cliente = c.id_cliente
      ORDER BY v.id_venda DESC
    `;
    const { rows } = await pool.query(query);
    return NextResponse.json(rows, { status: 200 });
  } catch (error) {
    return NextResponse.json({ erro: 'Falha ao buscar vendas.' }, { status: 500 });
  }
}

export async function POST(request) {
  const client = await pool.connect();
  try {
    const data = await request.json();
    await client.query('BEGIN');

    const insertVenda = `
      INSERT INTO venda (id_cliente, id_endereco, data_venda, horario_venda, valor_total, tipo, valor_frete, numero_retirada)
      VALUES ($1, $2, CURRENT_DATE, CURRENT_TIME, $3, $4, $5, $6)
      RETURNING id_venda
    `;
    const vendaValues = [
      data.id_cliente,
      data.tipo === 'Entrega' ? data.id_endereco : null,
      data.valor_total,
      data.tipo,
      data.tipo === 'Entrega' ? data.valor_frete : null,
      data.tipo === 'Retirada' ? data.numero_retirada : null
    ];
    
    const resVenda = await client.query(insertVenda, vendaValues);
    const idVenda = resVenda.rows[0].id_venda;

    for (let i = 0; i < data.itens.length; i++) {
      const item = data.itens[i];
      const insertItem = `
        INSERT INTO item_pedido (id_venda, item_venda, id_produto, quantidade, preco_unitario)
        VALUES ($1, $2, $3, $4, $5)
      `;
      await client.query(insertItem, [idVenda, i + 1, item.id_produto, item.quantidade, item.preco_unitario]);
    }

    await client.query('COMMIT');
    return NextResponse.json({ message: 'Venda registrada com sucesso!' }, { status: 201 });
  } catch (error) {
    await client.query('ROLLBACK');
    return NextResponse.json({ erro: 'Falha ao registrar venda. Verifique os dados.' }, { status: 500 });
  } finally {
    client.release();
  }
}