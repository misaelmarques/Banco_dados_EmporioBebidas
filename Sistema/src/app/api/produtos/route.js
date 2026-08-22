import pool from '../../../lib/db';
import { NextResponse } from 'next/server';

// READ
export async function GET() {
  try {
    const query = `
      SELECT p.*, c.nome AS nome_categoria 
      FROM produto p
      JOIN categoria c ON p.id_categoria = c.id_categoria
      ORDER BY p.id_produto
    `;
    const { rows } = await pool.query(query);
    return NextResponse.json(rows, { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar produtos:", error);
    return NextResponse.json({ erro: 'Falha ao buscar produtos.' }, { status: 500 });
  }
}

// CREATE 
export async function POST(request) {
  try {
    const { id_categoria, nome, preco, quantidade_estoque } = await request.json();
    
    const query = `
      INSERT INTO produto (id_categoria, nome, preco, quantidade_estoque) 
      VALUES ($1, $2, $3, $4)
    `;
    
    // Se a quantidade vier vazia da tela, forçamos o zero para respeitar o banco
    const estoque = quantidade_estoque || 0; 

    await pool.query(query, [id_categoria, nome, preco, estoque]);
    return NextResponse.json({ message: 'Produto criado com sucesso!' }, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar produto:", error);
    return NextResponse.json({ erro: 'Falha ao criar o produto. Verifique os dados enviados.' }, { status: 500 });
  }
}

//UPDATE categoria, nome, preco e quantidade_estoque do produto 
export async function PUT(request) {
  try {
    const { id_produto, id_categoria, nome, preco, quantidade_estoque } = await request.json();
    
    const query = `
      UPDATE produto 
      SET id_categoria = $1, nome = $2, preco = $3, quantidade_estoque = $4 
      WHERE id_produto = $5
    `;
    
    await pool.query(query, [id_categoria, nome, preco, quantidade_estoque, id_produto]);
    return NextResponse.json({ message: 'Produto atualizado com sucesso!' }, { status: 200 });
  } catch (error) {
    console.error("Erro ao atualizar produto:", error);
    return NextResponse.json({ erro: 'Falha ao atualizar o produto.' }, { status: 500 });
  }
}

// DELETE 
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    await pool.query('DELETE FROM produto WHERE id_produto=$1', [id]);
    return NextResponse.json({ message: 'Produto deletado com sucesso!' }, { status: 200 });
  } catch (error) {
    console.error("Erro ao deletar produto:", error);
    return NextResponse.json({ erro: 'O produto não pode ser deletado pois já está vinculado a uma venda.' }, { status: 500 });
  }
}