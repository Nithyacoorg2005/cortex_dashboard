require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');

const client = new Client({ connectionString: process.env.DATABASE_URL });

async function setupDatabase() {
  try {
    await client.connect();
    console.log("Connected to CockroachDB...");
    await client.query("DROP TABLE IF EXISTS semantic_memory CASCADE;");
    console.log("Purged legacy 1536-dimensional schema.");
    await client.query(`
      CREATE TABLE IF NOT EXISTS incidents (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          title VARCHAR(255) NOT NULL,
          status VARCHAR(50) NOT NULL DEFAULT 'OPEN',
          severity VARCHAR(20) NOT NULL,
          trigger_payload JSONB NOT NULL,
          created_at TIMESTAMPTZ DEFAULT current_timestamp(),
          resolved_at TIMESTAMPTZ
      );
    `);

    await client.query("SET use_declarative_schema_changer = 'on';");
    
    await client.query(`
      CREATE TABLE semantic_memory (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          incident_id UUID REFERENCES incidents(id) ON DELETE CASCADE,
          symptom_signature TEXT NOT NULL,
          root_cause TEXT NOT NULL,
          remediation_summary TEXT NOT NULL,
          incident_embedding VECTOR(768) NOT NULL,
          importance_score FLOAT NOT NULL CHECK (importance_score >= 0.0 AND importance_score <= 1.0),
          created_at TIMESTAMPTZ DEFAULT current_timestamp()
      );
    `);
    
    await client.query(`
      CREATE VECTOR INDEX semantic_embedding_idx 
      ON semantic_memory (incident_embedding);
    `);
    console.log("New 768-dimensional Vector Index built for Gemini.");

  } catch (err) {
    console.error("Database Setup Error:", err);
  } finally {
    await client.end();
  }
}

setupDatabase();