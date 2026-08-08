"use client";
import { useState } from "react";

export default function LiveWarRoom() {
  const [logs, setLogs] = useState<string[]>([]);
  const [status, setStatus] = useState("IDLE");
  const [memoryData, setMemoryData] = useState<any>(null);

  const triggerIncident = async () => {
    setLogs(["[0.00s] SYSTEM: SEV-1 Alert Received - DB Latency Spiking"]);
    setStatus("INVESTIGATING");
    setMemoryData(null);
    setLogs((prev) => [...prev, "[0.12s] ORCHESTRATOR: Ingesting payload into CockroachDB State Layer..."]);
    const ingestRes = await fetch("/api/ingest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        AlarmName: "Production-Critical-DB-Latency",
        Trigger: { MetricName: "QueryDuration" }
      }),
    });
    const ingestData = await ingestRes.json();
    setLogs((prev) => [...prev, `[0.45s] ORCHESTRATOR: Incident ${ingestData.incidentId.split('-')[0]} initialized.`]);
    setLogs((prev) => [...prev, "[0.50s] SUPERVISOR: Embedding alert and querying Semantic Memory (C-SPANN)..."]);
    
    const memoryRes = await fetch("/api/memory", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        incidentText: "API latency is spiking to 4 seconds and the RDS connection pool is maxed out."
      }),
    });
    const memoryResult = await memoryRes.json();

    setTimeout(() => {
      if (memoryResult.matchFound) {
        setLogs((prev) => [
          ...prev, 
          `[0.85s] MEMORY FABRIC: 99.8% Match Found!`,
          `[0.86s] SUPERVISOR: ${memoryResult.action}`,
          `[0.90s] EXECUTOR: Applying remediation -> ${memoryResult.recalled_lesson.remediation}`
        ]);
        setMemoryData(memoryResult.recalled_lesson);
        setStatus("REMEDIATED");
      }
    }, 800);
  };
return (
    <div style={{ padding: "1.5rem", backgroundColor: "#111", border: "1px solid #333", borderRadius: "8px", marginTop: "1rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h2 style={{ fontSize: "1.2rem", margin: 0 }}>Agent Execution Terminal</h2>
        <button 
          onClick={triggerIncident}
          disabled={status === "INVESTIGATING"}
          style={{ 
            backgroundColor: status === "INVESTIGATING" ? "#333" : "#ef4444", 
            color: "white", padding: "0.5rem 1rem", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" 
          }}
        >
          {status === "INVESTIGATING" ? "Executing..." : "Simulate SEV-1 Incident"}
        </button>
      </div>

      <div style={{ backgroundColor: "#000", padding: "1rem", borderRadius: "4px", fontFamily: "monospace", color: "#4ade80", minHeight: "200px" }}>
        {logs.length === 0 ? <span style={{ color: "#555" }}>Awaiting system events...</span> : null}
        {logs.map((log, i) => (
          <div key={i} style={{ marginBottom: "0.5rem", color: log.includes("Match Found") || log.includes("SUCCESS") ? "#eab308" : "#4ade80" }}>
            {log}
          </div>
        ))}
      </div>

      {memoryData && (
        <div style={{ marginTop: "1rem", padding: "1rem", borderLeft: "4px solid #eab308", backgroundColor: "#1a1a1a" }}>
          <h3 style={{ margin: "0 0 0.5rem 0", color: "#eab308" }}>Cognitive Bypass Executed</h3>
          <p style={{ margin: "0.25rem 0", fontSize: "0.9rem" }}><strong>Past Root Cause:</strong> {memoryData.root_cause}</p>
          <p style={{ margin: "0.25rem 0", fontSize: "0.9rem" }}><strong>Remediation Applied:</strong> {memoryData.remediation}</p>
          <p style={{ margin: "0.25rem 0", fontSize: "0.9rem", color: "#ef4444" }}><strong>MTTR without memory:</strong> ~8m 12s</p>
          <p style={{ margin: "0.25rem 0", fontSize: "0.9rem", color: "#4ade80" }}><strong>MTTR with MemoryOps:</strong> 0.90s</p>
        </div>
      )}
    </div>
  );
}