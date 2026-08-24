import { Pool } from 'pg';

const pool = new Pool({
  user: process.env.DB_USER || 'admin_adega',
  password: process.env.DB_PASSWORD || 'admin_senha_123',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5433,
  database: process.env.DB_DATABASE || 'emporio_bebidas'
});

export default pool;