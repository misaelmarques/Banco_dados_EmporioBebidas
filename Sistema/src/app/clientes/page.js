"use client";

import { useState, useEffect } from 'react';

export default function TelaClientes() {
  const [clientes, setClientes] = useState([]);
  
  const estadoInicial = { cpf: '', nome: '', data_nascimento: '', cep: '', bairro: '', rua: '', numero: '' };
  const [form, setForm] = useState(estadoInicial);
  const [editandoId, setEditandoId] = useState(null);
  const [busca, setBusca] = useState('');

  useEffect(() => {
    carregarClientes();
  }, []);

  const carregarClientes = async () => {
    try {
      const resposta = await fetch('/api/clientes');
      const dados = await resposta.json();
      if (Array.isArray(dados)) {
        setClientes(dados);
      } else {
        setClientes([]);
        console.error("Erro do backend:", dados);
      }
    } catch (error) {
      console.error("Erro de conexão:", error);
      setClientes([]);
    }
  };

  const salvarCliente = async (e) => {
    e.preventDefault();
    const metodo = editandoId ? 'PUT' : 'POST';
    const pacoteDeDados = editandoId ? { ...form, id_cliente: editandoId } : form;

    const resposta = await fetch('/api/clientes', {
      method: metodo,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pacoteDeDados),
    });

    const dados = await resposta.json();

    if (resposta.ok) {
      setForm(estadoInicial);
      setEditandoId(null);
      carregarClientes();
    } else {
      alert("Erro: " + dados.erro);
    }
  };

  const deletarCliente = async (id) => {
    if (confirm("Tem certeza que deseja deletar este cliente e seus endereços?")) {
      const resposta = await fetch(`/api/clientes?id=${id}`, { method: 'DELETE' });
      if (resposta.ok) {
        carregarClientes();
      } else {
        alert("Erro ao deletar. O cliente deve ter vendas registradas.");
      }
    }
  };

  const prepararEdicao = (cliente) => {
    setForm({
      cpf: cliente.cpf,
      nome: cliente.nome,
      data_nascimento: cliente.data_nascimento,
      cep: cliente.cep || '',
      bairro: cliente.bairro || '',
      rua: cliente.rua || '',
      numero: cliente.numero || ''
    });
    setEditandoId(cliente.id_cliente);
  };

  const clientesFiltrados = clientes.filter(cliente => 
    cliente.nome.toLowerCase().includes(busca.toLowerCase()) ||
    cliente.cpf.includes(busca)
  );

  return (
    <div>
      <h1 style={{ color: '#0f172a', marginBottom: '20px' }}>👥 Gestão de Clientes e Endereços</h1>

      <form onSubmit={salvarCliente} style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '30px' }}>
        
        <h3 style={{ marginTop: 0, borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>Dados Pessoais</h3>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-end', flexWrap: 'wrap', marginBottom: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label>Nome Completo:</label>
            <input type="text" value={form.nome} onChange={(e) => setForm({...form, nome: e.target.value})} required style={{ padding: '8px', width: '300px' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label>CPF (só números):</label>
            <input type="text" maxLength="11" value={form.cpf} onChange={(e) => setForm({...form, cpf: e.target.value})} required style={{ padding: '8px', width: '150px' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label>Data de Nascimento:</label>
            <input type="date" value={form.data_nascimento} onChange={(e) => setForm({...form, data_nascimento: e.target.value})} required style={{ padding: '8px', width: '150px' }} />
          </div>
        </div>

        <h3 style={{ marginTop: 0, borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>Endereço Principal</h3>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-end', flexWrap: 'wrap', marginBottom: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label>CEP:</label>
            <input type="text" maxLength="8" value={form.cep} onChange={(e) => setForm({...form, cep: e.target.value})} required style={{ padding: '8px', width: '120px' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label>Rua/Avenida:</label>
            <input type="text" value={form.rua} onChange={(e) => setForm({...form, rua: e.target.value})} required style={{ padding: '8px', width: '300px' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label>Número:</label>
            <input type="text" value={form.numero} onChange={(e) => setForm({...form, numero: e.target.value})} required style={{ padding: '8px', width: '80px' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label>Bairro:</label>
            <input type="text" value={form.bairro} onChange={(e) => setForm({...form, bairro: e.target.value})} required style={{ padding: '8px', width: '200px' }} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button type="submit" style={{ padding: '10px 20px', backgroundColor: editandoId ? '#eab308' : '#22c55e', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
            {editandoId ? 'Atualizar Cliente' : 'Cadastrar Cliente'}
          </button>

          {editandoId && (
            <button type="button" onClick={() => { setEditandoId(null); setForm(estadoInicial) }} style={{ padding: '10px', backgroundColor: '#94a3b8', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
              Cancelar
            </button>
          )}
        </div>
      </form>

      <div style={{ marginBottom: '20px' }}>
        <input 
          type="text" 
          placeholder="🔍 Buscar cliente por nome ou CPF..." 
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          style={{ padding: '10px', width: '300px', borderRadius: '5px', border: '1px solid #cbd5e1' }}
        />
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <thead>
          <tr style={{ backgroundColor: '#f1f5f9', textAlign: 'left' }}>
            <th style={{ padding: '12px', borderBottom: '2px solid #cbd5e1' }}>ID</th>
            <th style={{ padding: '12px', borderBottom: '2px solid #cbd5e1' }}>Nome</th>
            <th style={{ padding: '12px', borderBottom: '2px solid #cbd5e1' }}>CPF</th>
            <th style={{ padding: '12px', borderBottom: '2px solid #cbd5e1' }}>Bairro Principal</th>
            <th style={{ padding: '12px', borderBottom: '2px solid #cbd5e1' }}>Ações</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(clientesFiltrados) && clientesFiltrados.map(cliente => (
            <tr key={cliente.id_cliente} style={{ borderBottom: '1px solid #e2e8f0' }}>
              <td style={{ padding: '12px' }}>{cliente.id_cliente}</td>
              <td style={{ padding: '12px' }}>{cliente.nome}</td>
              <td style={{ padding: '12px' }}>{cliente.cpf}</td>
              <td style={{ padding: '12px' }}>{cliente.bairro || '-'}</td>
              <td style={{ padding: '12px', display: 'flex', gap: '10px' }}>
                <button onClick={() => prepararEdicao(cliente)} style={{ padding: '5px 10px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                  Editar
                </button>
                <button onClick={() => deletarCliente(cliente.id_cliente)} style={{ padding: '5px 10px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
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