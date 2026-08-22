import Link from 'next/link';

export const metadata = {
  title: 'Empório de Bebidas - Admin',
  description: 'Sistema de Gestão do Banco de Dados',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body style={{ display: 'flex', margin: 0, fontFamily: 'system-ui, sans-serif', height: '100vh' }}>
        
        {/* menu lateral */}
        <aside style={{ width: '250px', backgroundColor: '#1e293b', color: 'white', padding: '20px', display: 'flex', flexDirection: 'column' }}>
          
          <h2 style={{ textAlign: 'center', borderBottom: '1px solid #334155', paddingBottom: '15px' }}>
            Empório Bebidas
          </h2>
          
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '30px' }}>
            <Link href="/produtos" style={{ color: '#cbd5e1', textDecoration: 'none', fontSize: '18px' }}>
              📦 Produtos
            </Link>
            
            <Link href="/clientes" style={{ color: '#cbd5e1', textDecoration: 'none', fontSize: '18px' }}>
              👥 Clientes
            </Link>
            
            <Link href="/vendas" style={{ color: '#cbd5e1', textDecoration: 'none', fontSize: '18px' }}>
              🛒 Vendas
            </Link>
            
            <Link href="/relatorios" style={{ color: '#cbd5e1', textDecoration: 'none', fontSize: '18px' }}>
              📊 Relatórios
            </Link>
          </nav>
        </aside>

        {/* area Principal */}
        <main style={{ flex: 1, padding: '40px', backgroundColor: '#f8fafc', overflowY: 'auto' }}>
          {children}
        </main>

      </body>
    </html>
  );
}