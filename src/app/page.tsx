import { query } from "@/lib/db";
import LiveWarRoom from "./components/LiveWarRoom";

export const dynamic = "force-dynamic";

export default async function DashboardHome() {
  const result = await query(`
    SELECT id, title, status, severity, created_at 
    FROM incidents 
    ORDER BY created_at DESC 
    LIMIT 5;
  `);
  
  const incidents = result.rows;

  return (
    <main style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      <header style={{ borderBottom: "1px solid #333", paddingBottom: "1rem", marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.5rem", margin: 0 }}>Cortex Memory Fabric</h1>
        <p style={{ color: "#888", margin: "0.5rem 0 0 0" }}>Persistent cognitive memory for autonomous operations.</p>
      </header>

      <section style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1rem" }}>
        <LiveWarRoom />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginTop: "1rem" }}>
          <div style={{ padding: "1.5rem", backgroundColor: "#111", border: "1px solid #333", borderRadius: "8px" }}>
            <h2 style={{ fontSize: "1.2rem", marginTop: 0, marginBottom: "1rem" }}>Incident Ledger (CockroachDB)</h2>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {incidents.map((inc) => (
                <li key={inc.id} style={{ 
                  padding: "1rem", backgroundColor: "#1a1a1a", marginBottom: "0.5rem", borderRadius: "4px",
                  borderLeft: inc.severity === 'SEV-1' ? "4px solid #ef4444" : "4px solid #eab308"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <strong>{inc.title}</strong>
                    <span style={{ fontSize: "0.8rem", padding: "0.2rem 0.5rem", backgroundColor: "#333", borderRadius: "12px", color: "#fff" }}>
                      {inc.status}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          
          <div style={{ padding: "1.5rem", backgroundColor: "#111", border: "1px solid #333", borderRadius: "8px" }}>
            <h2 style={{ fontSize: "1.2rem", marginTop: 0 }}>Vector Index Status</h2>
            <div style={{ padding: "1rem", backgroundColor: "#1a1a1a", borderRadius: "4px" }}>
              <p style={{ color: "#4ade80", margin: "0 0 0.5rem 0", fontFamily: "monospace" }}>● C-SPANN ONLINE</p>
              <p style={{ color: "#888", fontSize: "0.9rem", margin: 0 }}>Dimensions: 786</p>
              <p style={{ color: "#888", fontSize: "0.9rem", margin: 0 }}>Similarity Threshold: {">"} 90%</p>
              <p style={{ color: "#888", fontSize: "0.9rem", margin: 0 }}>Node Distribution: Multi-Region</p>
            </div>
          </div>
        </div>

      </section>
    </main>
  );
}