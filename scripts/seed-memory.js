require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');

const client = new Client({ connectionString: process.env.DATABASE_URL });

// Locally generates a normalized 768-dimensional vector
function generateMock768Embedding() {
  const vector = new Array(768).fill(0).map(() => Math.random() - 0.5);
  const magnitude = Math.sqrt(vector.reduce((acc, val) => acc + val * val, 0));
  return vector.map(val => (val / magnitude).toFixed(6));
}

async function seedMemory() {
  try {
    await client.connect();
    
    const incidentRes = await client.query(`
      INSERT INTO incidents (title, status, severity, trigger_payload, resolved_at)
      VALUES ('[SEV-1] CPU Exhaustion & Connection Spikes', 'CLOSED', 'SEV-1', '{}', current_timestamp())
      RETURNING id;
    `);
    const incidentId = incidentRes.rows[0].id;
    console.log("Seeding historical incident...");

    console.log("Generating local 768-dimensional vector (Bypassing Network)...");
    const embeddingArray = generateMock768Embedding();
    const vectorString = `[${embeddingArray.join(',')}]`;

    await client.query(`
      INSERT INTO semantic_memory 
      (incident_id, symptom_signature, root_cause, remediation_summary, incident_embedding, importance_score)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [
      incidentId, 
      'API latency spikes combined with maxed database connections', 
      'Runaway analytical query blocking primary OLTP inserts', 
      'Killed PID via MCP Server and throttled analytical user', 
      vectorString, 
      0.95
    ]);

    console.log("SUCCESS: Historical memory embedded and indexed in CockroachDB.");

  } catch (error) {
    console.error("Seeding Error:", error);
  } finally {
    await client.end();
  }
}

seedMemory();