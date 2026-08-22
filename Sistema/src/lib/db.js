import { Pool } from 'pg';

const pool = new Pool({
  user: 'admin_adega',       
  password: 'admin_senha_123',  
  host: 'localhost',      
  port: 5433,             
  database: 'emporio_bebidas'  
});

export default pool;