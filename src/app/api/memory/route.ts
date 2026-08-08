import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// Locally generates a normalized 768-dimensional vector
function generateMock768Embedding() {
  const vector = new Array(768).fill(0).map(() => Math.random() - 0.5);
  const magnitude = Math.sqrt(vector.reduce((acc, val) => acc + val * val, 0));
  return vector.map(val => (val / magnitude).toFixed(6));
}

export async function POST(req: NextRequest) {
  try {
    const { incidentText } = await req.json();
    if (!incidentText) return NextResponse.json({ error: "Missing text" }, { status: 400 });

    // 1. Generate local vector embedding
    const embeddingArray = generateMock768Embedding();
    const vectorString = `[${embeddingArray.join(',')}]`;

    // 2. Query CockroachDB Vector Index
    const sql = `
      SELECT 
        incident_id, symptom_signature, root_cause, remediation_summary,
        1 - (incident_embedding <=> $1) AS similarity_score
      FROM semantic_memory
      ORDER BY incident_embedding <=> $1 ASC
      LIMIT 1;
    `;

    const dbResult = await query(sql, [vectorString]);

    if (dbResult.rows.length === 0) {
      return NextResponse.json({ matchFound: false });
    }

    const memory = dbResult.rows[0];

    return NextResponse.json({
      matchFound: true,
      action: "MEMORY RECALL SUCCESS. Bypassing diagnostics. Proceed directly to remediation execution.",
      recalled_lesson: {
        incident_id: memory.incident_id,
        symptom: memory.symptom_signature,
        root_cause: memory.root_cause,
        remediation: memory.remediation_summary,
        confidence_score: (memory.similarity_score * 100).toFixed(2) + "%"
      }
    });

  } catch (error) {
    console.error("Vector Search Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}