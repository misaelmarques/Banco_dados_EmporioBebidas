import pool from '../../../lib/db';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Busca de uma venda específica com seus itens (usada na edição)
    if (id) {
      const vendaRes = await pool.query(
        `SELECT v.*, c.nome as nome_cliente
         FROM venda v
         JOIN cliente c ON v.id_cliente = c.id_cliente
         WHERE v.id_venda = $1`,
        [id]
      );

      if (vendaRes.rowCount === 0) {
        return NextResponse.json({ erro: 'Venda não encontrada.' }, { status: 404 });
      }

      const itensRes = await pool.query(
        `SELECT ip.id_produto, ip.quantidade, ip.preco_unitario, p.nome
         FROM item_pedido ip
         JOIN produto p ON p.id_produto = ip.id_produto
         WHERE ip.id_venda = $1
         ORDER BY ip.item_venda`,
        [id]
      );

      return NextResponse.json(
        { ...vendaRes.rows[0], itens: itensRes.rows },
        { status: 200 }
      );
    }

    // Listagem geral do histórico de vendas
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

// UPDATE: atualiza os dados da venda e substitui seus itens de pedido
export async function PUT(request) {
  const client = await pool.connect();
  try {
    const data = await request.json();
    await client.query('BEGIN');

    const updateVenda = `
      UPDATE venda
      SET id_cliente = $1, id_endereco = $2, valor_total = $3, tipo = $4, valor_frete = $5, numero_retirada = $6
      WHERE id_venda = $7
    `;
    const vendaValues = [
      data.id_cliente,
      data.tipo === 'Entrega' ? data.id_endereco : null,
      data.valor_total,
      data.tipo,
      data.tipo === 'Entrega' ? data.valor_frete : null,
      data.tipo === 'Retirada' ? data.numero_retirada : null,
      data.id_venda
    ];
    await client.query(updateVenda, vendaValues);

    // Substitui os itens: remove os antigos e reinsere os enviados
    await client.query('DELETE FROM item_pedido WHERE id_venda = $1', [data.id_venda]);

    for (let i = 0; i < data.itens.length; i++) {
      const item = data.itens[i];
      await client.query(
        `INSERT INTO item_pedido (id_venda, item_venda, id_produto, quantidade, preco_unitario)
         VALUES ($1, $2, $3, $4, $5)`,
        [data.id_venda, i + 1, item.id_produto, item.quantidade, item.preco_unitario]
      );
    }

    await client.query('COMMIT');
    return NextResponse.json({ message: 'Venda atualizada com sucesso!' }, { status: 200 });
  } catch (error) {
    await client.query('ROLLBACK');
    return NextResponse.json({ erro: 'Falha ao atualizar venda. Verifique os dados.' }, { status: 500 });
  } finally {
    client.release();
  }
}

// DELETE: remove a venda (os itens de pedido caem em cascata via ON DELETE CASCADE)
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    await pool.query('DELETE FROM venda WHERE id_venda = $1', [id]);
    return NextResponse.json({ message: 'Venda deletada com sucesso!' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ erro: 'Falha ao deletar a venda.' }, { status: 500 });
  }
}
