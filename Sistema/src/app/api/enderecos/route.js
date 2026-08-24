import pool from '../../../lib/db';
import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const clienteId = searchParams.get('clienteId');
  
  if (!clienteId) return NextResponse.json([], { status: 200 });

  try {
    const { rows } = await pool.query('SELECT * FROM endereco WHERE id_cliente = $1', [clienteId]);
    return NextResponse.json(rows, { status: 200 });
  } catch (error) {
    return NextResponse.json({ erro: 'Erro ao buscar endereços' }, { status: 500 });
  }
}