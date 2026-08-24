import pool from '../../../lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const query = `
      SELECT DISTINCT ON (c.id_cliente) 
        c.id_cliente, c.cpf, c.nome, to_char(c.data_nascimento, 'YYYY-MM-DD') AS data_nascimento,
        e.cep, e.bairro, e.rua, e.numero
      FROM cliente c
      LEFT JOIN endereco e ON c.id_cliente = e.id_cliente
      ORDER BY c.id_cliente, e.id_endereco
    `;
    const { rows } = await pool.query(query);
    return NextResponse.json(rows, { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar clientes:", error);
    return NextResponse.json({ erro: 'Falha ao buscar clientes.' }, { status: 500 });
  }
}

export async function POST(request) {
  const client = await pool.connect();
  try {
    const { cpf, nome, data_nascimento, cep, bairro, rua, numero } = await request.json();
    
    await client.query('BEGIN');

    const resCliente = await client.query(
      'INSERT INTO cliente (cpf, nome, data_nascimento) VALUES ($1, $2, $3) RETURNING id_cliente', 
      [cpf, nome, data_nascimento]
    );
    const novoIdCliente = resCliente.rows[0].id_cliente;

    if (cep && rua) {
      await client.query(
        'INSERT INTO endereco (id_cliente, cep, bairro, rua, numero) VALUES ($1, $2, $3, $4, $5)',
        [novoIdCliente, cep, bairro, rua, numero]
      );
    }

    await client.query('COMMIT');
    return NextResponse.json({ message: 'Cliente cadastrado com sucesso!' }, { status: 201 });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Erro ao criar cliente:", error);
    if (error.code === '23505') {
      return NextResponse.json({ erro: 'Este CPF já está cadastrado no sistema.' }, { status: 400 });
    }
    return NextResponse.json({ erro: 'Falha ao criar o cliente.' }, { status: 500 });
  } finally {
    client.release();
  }
}

export async function PUT(request) {
  const client = await pool.connect();
  try {
    const { id_cliente, cpf, nome, data_nascimento, cep, bairro, rua, numero } = await request.json();
    
    await client.query('BEGIN');

    await client.query(
      'UPDATE cliente SET cpf=$1, nome=$2, data_nascimento=$3 WHERE id_cliente=$4', 
      [cpf, nome, data_nascimento, id_cliente]
    );

    const resEnd = await client.query('SELECT id_endereco FROM endereco WHERE id_cliente = $1 LIMIT 1', [id_cliente]);
    if (resEnd.rowCount > 0) {
      await client.query(
        'UPDATE endereco SET cep=$1, bairro=$2, rua=$3, numero=$4 WHERE id_cliente=$5',
        [cep, bairro, rua, numero, id_cliente]
      );
    } else {
      await client.query(
        'INSERT INTO endereco (id_cliente, cep, bairro, rua, numero) VALUES ($1, $2, $3, $4, $5)',
        [id_cliente, cep, bairro, rua, numero]
      );
    }

    await client.query('COMMIT');
    return NextResponse.json({ message: 'Cliente atualizado com sucesso!' }, { status: 200 });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Erro ao atualizar cliente:", error);
    if (error.code === '23505') {
      return NextResponse.json({ erro: 'Este CPF já está sendo usado por outro cliente.' }, { status: 400 });
    }
    return NextResponse.json({ erro: 'Falha ao atualizar o cliente.' }, { status: 500 });
  } finally {
    client.release();
  }
}

export async function DELETE(request) {
  const client = await pool.connect();
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    await client.query('BEGIN');
    
    await client.query('DELETE FROM endereco WHERE id_cliente=$1', [id]);
    await client.query('DELETE FROM cliente WHERE id_cliente=$1', [id]);
    
    await client.query('COMMIT');
    return NextResponse.json({ message: 'Cliente deletado com sucesso!' }, { status: 200 });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Erro ao deletar cliente:", error);
    return NextResponse.json({ erro: 'O cliente não pode ser deletado pois possui vendas atreladas.' }, { status: 500 });
  } finally {
    client.release();
  }
}