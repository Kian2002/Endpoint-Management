import mysql from 'mysql2/promise';

console.log('Database Configuration:', {
  host: process.env.MY_SQL_HOSTNAME,
  port: process.env.MY_SQL_PORT,
  user: process.env.MY_SQL_USERNAME,
  database: process.env.MY_SQL_DATABASE
});

const pool = mysql.createPool({
  host: process.env.MY_SQL_HOSTNAME,
  port: parseInt(process.env.MY_SQL_PORT || '3306'),
  user: process.env.MY_SQL_USERNAME,
  password: process.env.MY_SQL_PASSWORD,
  database: process.env.MY_SQL_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 10000,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

// Test the connection with retry logic
async function testConnection(retries = 3, delay = 2000) {
  for (let i = 0; i < retries; i++) {
    try {
      const connection = await pool.getConnection();
      console.log('Successfully connected to MySQL database');
      connection.release();
      return true;
    } catch (err) {
      console.error(`Connection attempt ${i + 1} failed:`, err);
      if (i < retries - 1) {
        console.log(`Retrying in ${delay/1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  console.error('Failed to connect to MySQL database after all retries');
  return false;
}

// Initial connection test
testConnection();

export async function query(sql: string, params: any[]) {
  try {
    const [results] = await pool.execute(sql, params);
    return results;
  } catch (error) {
    console.error('Database query error:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        code: (error as any).code,
        errno: (error as any).errno,
        sqlState: (error as any).sqlState,
        sqlMessage: (error as any).sqlMessage
      });
    }
    throw error;
  }
}

export default pool; 