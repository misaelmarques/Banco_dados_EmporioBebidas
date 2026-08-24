"use client";

import { useState, useEffect } from 'react';

export default function TelaVendas() {
  const [vendas, setVendas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [enderecos, setEnderecos] = useState([]);
  
  const [form, setForm] = useState({
    id_cliente: '',
    tipo: 'Retirada',
    id_endereco: '',
    valor_frete: '',
    numero_retirada: '',
    itens: []
  });

  const [produtoSelecionado, setProdutoSelecionado] = useState('');
  const [quantidade, setQuantidade] = useState(1);

  useEffect(() => {
    carregarVendas();
    carregarClientes();
    carregarProdutos();
  }, []);

  useEffect(() => {
    if (form.id_cliente && form.tipo === 'Entrega') {
      carregarEnderecos(form.id_cliente);
    }
  }, [form.id_cliente, form.tipo]);

  const carregarVendas = async () => {
    const res = await fetch('/api/vendas');
    setVendas(await res.json());
  };

  const carregarClientes = async () => {
    const res = await fetch('/api/clientes');
    setClientes(await res.json());
  };

  const carregarProdutos = async () => {
    const res = await fetch('/api/produtos');
    setProdutos(await res.json());
  };

  const carregarEnderecos = async (id_cliente) => {
    const res = await fetch(`/api/enderecos?clienteId=${id_cliente}`);
    setEnderecos(await res.json());
  };

  const adicionarItem = () => {
    if (!produtoSelecionado || quantidade < 1) return;
    const prod = produtos.find(p => p.id_produto == produtoSelecionado);
    
    setForm({
      ...form,
      itens: [...form.itens, {
        id_produto: prod.id_produto,
        nome: prod.nome,
        quantidade: parseInt(quantidade),
        preco_unitario: parseFloat(prod.preco)
      }]
    });
    setProdutoSelecionado('');
    setQuantidade(1);
  };

  const removerItem = (index) => {
    const novosItens = form.itens.filter((_, i) => i !== index);
    setForm({ ...form, itens: novosItens });
  };

  const calcularTotalItens = () => {
    return form.itens.reduce((total, item) => total + (item.quantidade * item.preco_unitario), 0);
  };

  const salvarVenda = async (e) => {
    e.preventDefault();
    if (form.itens.length === 0) return alert("Adicione ao menos um produto!");

    const payload = {
      ...form,
      valor_total: calcularTotalItens()
    };

    const res = await fetch('/api/vendas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      setForm({ id_cliente: '', tipo: 'Retirada', id_endereco: '', valor_frete: '', numero_retirada: '', itens: [] });
      carregarVendas();
      alert("Venda registrada!");
    } else {
      alert("Erro ao registrar venda.");
    }
  };

  return (
    <div>
      <h1 style={{ color: '#0f172a', marginBottom: '20px' }}>🛒 PDV / Nova Venda</h1>

      <form onSubmit={salvarVenda} style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '30px' }}>
        <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', flexWrap: 'wrap' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', width: '300px' }}>
            <label>Cliente:</label>
            <select value={form.id_cliente} onChange={(e) => setForm({...form, id_cliente: e.target.value})} required style={{ padding: '8px' }}>
              <option value="">Selecione um cliente...</option>
              {clientes.map(c => <option key={c.id_cliente} value={c.id_cliente}>{c.nome} (CPF: {c.cpf})</option>)}
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', width: '200px' }}>
            <label>Modalidade:</label>
            <select value={form.tipo} onChange={(e) => setForm({...form, tipo: e.target.value})} style={{ padding: '8px' }}>
              <option value="Retirada">Balcão (Retirada)</option>
              <option value="Entrega">Delivery (Entrega)</option>
            </select>
          </div>

          {form.tipo === 'Entrega' && (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', width: '300px' }}>
                <label>Endereço de Entrega:</label>
                <select value={form.id_endereco} onChange={(e) => setForm({...form, id_endereco: e.target.value})} required style={{ padding: '8px' }}>
                  <option value="">Selecione o endereço...</option>
                  {enderecos.map(end => <option key={end.id_endereco} value={end.id_endereco}>{end.rua}, {end.numero} - {end.bairro}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', width: '150px' }}>
                <label>Valor do Frete (R$):</label>
                <input type="number" step="0.01" value={form.valor_frete} onChange={(e) => setForm({...form, valor_frete: e.target.value})} required style={{ padding: '8px' }} />
              </div>
            </>
          )}

          {form.tipo === 'Retirada' && (
            <div style={{ display: 'flex', flexDirection: 'column', width: '150px' }}>
              <label>Nº Ficha/Retirada:</label>
              <input type="number" value={form.numero_retirada} onChange={(e) => setForm({...form, numero_retirada: e.target.value})} required style={{ padding: '8px' }} />
            </div>
          )}
        </div>

        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '20px', marginBottom: '20px' }}>
          <h3 style={{ marginTop: 0 }}>Adicionar Produtos</h3>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
            <div style={{ display: 'flex', flexDirection: 'column', width: '300px' }}>
              <label>Produto:</label>
              <select value={produtoSelecionado} onChange={(e) => setProdutoSelecionado(e.target.value)} style={{ padding: '8px' }}>
                <option value="">Escolha...</option>
                {produtos.map(p => <option key={p.id_produto} value={p.id_produto}>{p.nome} - R$ {p.preco}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', width: '100px' }}>
              <label>Qtd:</label>
              <input type="number" min="1" value={quantidade} onChange={(e) => setQuantidade(e.target.value)} style={{ padding: '8px' }} />
            </div>
            <button type="button" onClick={adicionarItem} style={{ padding: '9px 15px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>+ Adicionar</button>
          </div>
        </div>

        {form.itens.length > 0 && (
          <table style={{ width: '100%', marginBottom: '20px', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f1f5f9', textAlign: 'left' }}>
                <th style={{ padding: '8px' }}>Produto</th>
                <th style={{ padding: '8px' }}>Qtd</th>
                <th style={{ padding: '8px' }}>Unitário</th>
                <th style={{ padding: '8px' }}>Subtotal</th>
                <th style={{ padding: '8px' }}></th>
              </tr>
            </thead>
            <tbody>
              {form.itens.map((item, index) => (
                <tr key={index} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '8px' }}>{item.nome}</td>
                  <td style={{ padding: '8px' }}>{item.quantidade}</td>
                  <td style={{ padding: '8px' }}>R$ {item.preco_unitario}</td>
                  <td style={{ padding: '8px', fontWeight: 'bold' }}>R$ {(item.quantidade * item.preco_unitario).toFixed(2)}</td>
                  <td style={{ padding: '8px' }}>
                    <button type="button" onClick={() => removerItem(index)} style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer' }}>Remover</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ color: '#16a34a', margin: 0 }}>Total Itens: R$ {calcularTotalItens().toFixed(2)}</h2>
          <button type="submit" style={{ padding: '12px 25px', backgroundColor: '#22c55e', color: 'white', border: 'none', borderRadius: '5px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}>
            Finalizar Venda
          </button>
        </div>
      </form>

      <h2 style={{ color: '#0f172a' }}>Histórico de Vendas</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <thead>
          <tr style={{ backgroundColor: '#f1f5f9', textAlign: 'left' }}>
            <th style={{ padding: '12px' }}>ID</th>
            <th style={{ padding: '12px' }}>Cliente</th>
            <th style={{ padding: '12px' }}>Data</th>
            <th style={{ padding: '12px' }}>Tipo</th>
            <th style={{ padding: '12px' }}>Total</th>
          </tr>
        </thead>
        <tbody>
          {vendas.map(v => (
            <tr key={v.id_venda} style={{ borderBottom: '1px solid #e2e8f0' }}>
              <td style={{ padding: '12px' }}>#{v.id_venda}</td>
              <td style={{ padding: '12px' }}>{v.nome_cliente}</td>
              <td style={{ padding: '12px' }}>{new Date(v.data_venda).toLocaleDateString('pt-BR')}</td>
              <td style={{ padding: '12px' }}>{v.tipo}</td>
              <td style={{ padding: '12px', fontWeight: 'bold', color: '#16a34a' }}>R$ {v.valor_total}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}