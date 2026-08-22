"use client";

import { useState, useEffect } from 'react';

export default function TelaProdutos() {
  const [produtos, setProdutos] = useState([]);
  const [form, setForm] = useState({ nome: '', preco: '', id_categoria: '', quantidade_estoque: '' });
  const [editandoId, setEditandoId] = useState(null);

  useEffect(() => {
    carregarProdutos();
  }, []);

  const carregarProdutos = async () => {
    try {
      const resposta = await fetch('/api/produtos');
      const dados = await resposta.json();
      
      if (Array.isArray(dados)) {
        setProdutos(dados);
      } else {
        setProdutos([]);
        console.error("Erro do backend:", dados);
      }
    } catch (error) {
      console.error("Erro de conexão:", error);
      setProdutos([]); 
    }
  };

  const salvarProduto = async (e) => {
    e.preventDefault();

    const metodo = editandoId ? 'PUT' : 'POST';
    
    const pacoteDeDados = editandoId ? { ...form, id_produto: editandoId } : form;

    const resposta = await fetch('/api/produtos', {
      method: metodo,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pacoteDeDados),
    });

    if (resposta.ok) {
      setForm({ nome: '', preco: '', id_categoria: '', quantidade_estoque: '' });
      setEditandoId(null);
      carregarProdutos();
    } else {
      alert("Erro ao salvar o produto.");
    }
  };

  const deletarProduto = async (id) => {
    if (confirm("Tem certeza que deseja deletar este produto?")) {
      const resposta = await fetch(`/api/produtos?id=${id}`, { method: 'DELETE' });
      if (resposta.ok) {
        carregarProdutos();
      } else {
        alert("Erro ao deletar. O produto pode estar em alguma venda.");
      }
    }
  };

  const prepararEdicao = (produto) => {
    setForm({
      nome: produto.nome,
      preco: produto.preco,
      id_categoria: produto.id_categoria,
      quantidade_estoque: produto.quantidade_estoque
    });
    setEditandoId(produto.id_produto);
  };

  return (
    <div>
      <h1 style={{ color: '#0f172a', marginBottom: '20px' }}>📦 Gestão de Produtos</h1>

      {/* FORMULÁRIO */}
      <form onSubmit={salvarProduto} style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '30px', display: 'flex', gap: '15px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
        
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label>Nome do Produto:</label>
          <input type="text" value={form.nome} onChange={(e) => setForm({...form, nome: e.target.value})} required style={{ padding: '8px', width: '200px' }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label>Preço (R$):</label>
          <input type="number" step="0.01" value={form.preco} onChange={(e) => setForm({...form, preco: e.target.value})} required style={{ padding: '8px', width: '100px' }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label>ID da Categoria:</label>
          <input type="number" value={form.id_categoria} onChange={(e) => setForm({...form, id_categoria: e.target.value})} required style={{ padding: '8px', width: '100px' }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label>Estoque:</label>
          <input type="number" value={form.quantidade_estoque} onChange={(e) => setForm({...form, quantidade_estoque: e.target.value})} required style={{ padding: '8px', width: '100px' }} />
        </div>

        <button type="submit" style={{ padding: '10px 20px', backgroundColor: editandoId ? '#eab308' : '#22c55e', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
          {editandoId ? 'Atualizar Produto' : 'Cadastrar Produto'}
        </button>

        {editandoId && (
          <button type="button" onClick={() => { setEditandoId(null); setForm({ nome: '', preco: '', id_categoria: '', quantidade_estoque: '' }) }} style={{ padding: '10px', backgroundColor: '#94a3b8', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
            Cancelar
          </button>
        )}
      </form>

      {/* TABELA DE DADOS */}
      <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <thead>
          <tr style={{ backgroundColor: '#f1f5f9', textAlign: 'left' }}>
            <th style={{ padding: '12px', borderBottom: '2px solid #cbd5e1' }}>ID</th>
            <th style={{ padding: '12px', borderBottom: '2px solid #cbd5e1' }}>Nome</th>
            <th style={{ padding: '12px', borderBottom: '2px solid #cbd5e1' }}>Preço</th>
            <th style={{ padding: '12px', borderBottom: '2px solid #cbd5e1' }}>Estoque</th>
            <th style={{ padding: '12px', borderBottom: '2px solid #cbd5e1' }}>ID Categoria</th>
            <th style={{ padding: '12px', borderBottom: '2px solid #cbd5e1' }}>Ações</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(produtos) && produtos.map(produto => (
            <tr key={produto.id_produto} style={{ borderBottom: '1px solid #e2e8f0' }}>
              <td style={{ padding: '12px' }}>{produto.id_produto}</td>
              <td style={{ padding: '12px' }}>{produto.nome}</td>
              <td style={{ padding: '12px' }}>R$ {produto.preco}</td>
              <td style={{ padding: '12px' }}>{produto.quantidade_estoque} un.</td>
              <td style={{ padding: '12px' }}>{produto.id_categoria}</td>
              <td style={{ padding: '12px', display: 'flex', gap: '10px' }}>
                <button onClick={() => prepararEdicao(produto)} style={{ padding: '5px 10px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                  Editar
                </button>
                <button onClick={() => deletarProduto(produto.id_produto)} style={{ padding: '5px 10px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                  Deletar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}