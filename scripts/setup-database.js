const mysql = require('mysql2/promise');
require('dotenv').config();

async function setupDatabase() {
  let connection;
  
  try {
    connection = await mysql.createConnection({
      host: process.env.MY_SQL_HOSTNAME,
      port: parseInt(process.env.MY_SQL_PORT || '3306'),
      user: process.env.MY_SQL_USERNAME,
      password: process.env.MY_SQL_PASSWORD,
      database: process.env.MY_SQL_DATABASE,
    });

    console.log('Connected to MySQL database');

    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        company_name VARCHAR(255),
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        subscription_plan ENUM('monthly', 'yearly') DEFAULT 'monthly',
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_company (company_name)
      )
    `;

    await connection.execute(createUsersTable);
    console.log('Users table created successfully');

    const createSessionsTable = `
      CREATE TABLE IF NOT EXISTS sessions (
        id VARCHAR(255) PRIMARY KEY,
        session_token VARCHAR(255) UNIQUE NOT NULL,
        user_id INT NOT NULL,
        expires TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_session_token (session_token),
        INDEX idx_user_id (user_id)
      )
    `;

    await connection.execute(createSessionsTable);
    console.log('Sessions table created successfully');

    const createAccountsTable = `
      CREATE TABLE IF NOT EXISTS accounts (
        id VARCHAR(255) PRIMARY KEY,
        user_id INT NOT NULL,
        type VARCHAR(255) NOT NULL,
        provider VARCHAR(255) NOT NULL,
        provider_account_id VARCHAR(255) NOT NULL,
        refresh_token TEXT,
        access_token TEXT,
        expires_at BIGINT,
        token_type VARCHAR(255),
        scope VARCHAR(255),
        id_token TEXT,
        session_state VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY provider_account_id (provider, provider_account_id),
        INDEX idx_user_id (user_id)
      )
    `;

    await connection.execute(createAccountsTable);
    console.log('Accounts table created successfully');

    console.log('Database setup completed successfully!');

  } catch (error) {
    console.error('Error setting up database:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

setupDatabase(); 