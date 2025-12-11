import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

// Database connection configuration
const poolConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
  // Connection pool settings
  max: 20, // Maximum number of clients in the pool
  min: 2, // Minimum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 10000, // Return an error after 10 seconds if connection cannot be established
  maxUses: 7500, // Close (and replace) a connection after it has been used 7500 times
};

// Create connection pool
const pool = new Pool(poolConfig);

// Connection event handlers
pool.on("connect", (client) => {
  console.log("✅ Database client connected");
});

pool.on("acquire", (client) => {
  // Fired whenever a client is acquired from the pool
  // Useful for debugging connection pool usage
});

pool.on("remove", (client) => {
  console.log("🔌 Database client removed from pool");
});

pool.on("error", (err, client) => {
  console.error("❌ Unexpected database error on idle client:", err);
  // Don't exit the process, let the pool handle reconnection
});

// Helper function to test database connection
export const testConnection = async () => {
  try {
    const client = await pool.connect();
    const result = await client.query("SELECT NOW()");
    client.release();
    console.log("✅ Database connection test successful");
    console.log("📅 Database time:", result.rows[0].now);
    return true;
  } catch (err) {
    console.error("❌ Database connection test failed:", err.message);
    return false;
  }
};

// Helper function to execute queries with error handling
export const query = async (text, params) => {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log("📊 Executed query", { text, duration, rows: result.rowCount });
    return result;
  } catch (err) {
    console.error("❌ Query error:", err.message);
    throw err;
  }
};

// Helper function to get a client from the pool for transactions
export const getClient = async () => {
  const client = await pool.connect();
  const query = client.query.bind(client);
  const release = client.release.bind(client);

  // Set a timeout of 5 seconds, after which we will log this client's last query
  const timeout = setTimeout(() => {
    console.error("⚠️ A client has been checked out for more than 5 seconds!");
  }, 5000);

  // Monkey patch the release method to clear our timeout
  client.release = () => {
    clearTimeout(timeout);
    client.release = release;
    return release();
  };

  return client;
};

// Graceful shutdown
export const closePool = async () => {
  try {
    await pool.end();
    console.log("👋 Database pool has ended");
  } catch (err) {
    console.error("❌ Error closing database pool:", err);
  }
};

// Handle process termination
process.on("SIGINT", async () => {
  await closePool();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await closePool();
  process.exit(0);
});

export default pool;
