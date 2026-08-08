import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { CloudWatchAlert } from "@/types/database";

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const payload: CloudWatchAlert = await req.json();
    if (!payload.AlarmName || !payload.Trigger) {
      return NextResponse.json(
        { error: "Invalid CloudWatch Payload" },
        { status: 400 },
      );
    }
    const severity = payload.AlarmName.includes("Critical") ? "SEV-1" : "SEV-2";
    const title = `[${severity}] ${payload.Trigger.MetricName} Anomaly Detected`;
    const sql = `
      INSERT INTO incidents (title, status, severity, trigger_payload)
      VALUES ($1, $2, $3, $4)
      RETURNING id, created_at;
    `;

    const values = [title, "OPEN", severity, JSON.stringify(payload)];

    const result = await query(sql, values);
    const newIncident = result.rows[0];

    return NextResponse.json(
      {
        message: "Incident ingested and initialized in MemoryOps.",
        incidentId: newIncident.id,
        timestamp: newIncident.created_at,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Ingestion Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
