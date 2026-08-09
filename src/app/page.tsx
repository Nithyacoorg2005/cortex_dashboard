import { query } from "@/lib/db";
import LiveWarRoom from "./components/LiveWarRoom";

export const dynamic = "force-dynamic";

type Incident = {
  id: string;
  title: string;
  status: string;
  severity: string;
  created_at: string;
};

export default async function DashboardHome() {
  const result = await query<Incident>(`
    SELECT
      id,
      title,
      status,
      severity,
      created_at
    FROM incidents
    ORDER BY created_at DESC
    LIMIT 8;
  `);

  const incidents = result.rows;

  const activeIncidents = incidents.filter(
    (incident) =>
      incident.status?.toLowerCase() === "open" ||
      incident.status?.toLowerCase() === "active"
  );

  const sev1Count = incidents.filter(
    (incident) => incident.severity?.toUpperCase() === "SEV-1"
  ).length;

  return (
    <main className="min-h-screen bg-[#070707] text-zinc-200">
      {/* Header */}
      <header className="border-b border-white/[0.08]">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between px-6 py-5">
          <div>
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-emerald-400" />

              <h1 className="text-[15px] font-medium tracking-tight text-white">
                Cortex Memory Fabric
              </h1>
            </div>

            <p className="mt-1 pl-5 text-[11px] tracking-wide text-zinc-600">
              Persistent memory for autonomous operations
            </p>
          </div>

          <div className="flex items-center gap-8 text-[10px] font-mono uppercase tracking-wider">
            <div className="text-right">
              <p className="text-zinc-600">Environment</p>
              <p className="mt-1 text-zinc-300">Production</p>
            </div>

            <div className="text-right">
              <p className="text-zinc-600">Region</p>
              <p className="mt-1 text-zinc-300">us-east-1</p>
            </div>

            <div className="text-right">
              <p className="text-zinc-600">Memory</p>
              <p className="mt-1 text-emerald-400">Operational</p>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1500px] px-6 py-6">
        {/* Metrics */}
        <section className="grid grid-cols-2 border border-white/[0.08] bg-[#0a0a0a] md:grid-cols-4">
          <Metric
            label="Active incidents"
            value={String(activeIncidents.length)}
          />

          <Metric
            label="SEV-1 incidents"
            value={String(sev1Count)}
          />

          <Metric
            label="Memories stored"
            value="—"
            detail="CockroachDB"
          />

          <Metric
            label="Vector index"
            value="ONLINE"
            detail="HNSW / cosine"
            valueClass="text-emerald-400"
          />
        </section>

        {/* Main grid */}
        <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
          {/* LEFT */}
          <div className="min-w-0 space-y-6">
            {/* Agent execution */}
            <section className="border border-white/[0.08] bg-[#0a0a0a]">
              <SectionHeader
                title="Agent execution"
                right="LIVE"
                rightClass="text-emerald-400"
              />

              <div className="border-t border-white/[0.06]">
                <div className="grid grid-cols-5 divide-x divide-white/[0.06]">
                  <PipelineStep
                    number="01"
                    title="Ingest"
                    description="Incident received"
                    state="complete"
                  />

                  <PipelineStep
                    number="02"
                    title="Retrieve"
                    description="Memory search"
                    state="complete"
                  />

                  <PipelineStep
                    number="03"
                    title="Reason"
                    description="Root cause"
                    state="complete"
                  />

                  <PipelineStep
                    number="04"
                    title="Remediate"
                    description="Action"
                    state="active"
                  />

                  <PipelineStep
                    number="05"
                    title="Reflect"
                    description="Store outcome"
                    state="pending"
                  />
                </div>
              </div>
            </section>

            {/* War room */}
            <section className="border border-white/[0.08] bg-[#090909]">
              <SectionHeader
                title="Execution terminal"
                right="memoryops-supervisor"
              />

              <div className="min-h-[420px] border-t border-white/[0.06] p-4">
                <LiveWarRoom />
              </div>
            </section>

            {/* Memory evidence */}
            <section className="border border-white/[0.08] bg-[#0a0a0a]">
              <SectionHeader
                title="Memory retrieval"
                right="CockroachDB"
              />

              <div className="border-t border-white/[0.06]">
                <div className="grid grid-cols-1 divide-y divide-white/[0.06] md:grid-cols-3 md:divide-x md:divide-y-0">
                  <MemoryStat
                    label="Index"
                    value="HNSW"
                    description="Distributed vector index"
                  />

                  <MemoryStat
                    label="Distance"
                    value="Cosine"
                    description="Semantic similarity"
                  />

                  <MemoryStat
                    label="Embedding"
                    value="1536-D"
                    description="Incident representation"
                  />
                </div>
              </div>
            </section>
          </div>

          {/* RIGHT */}
          <aside className="min-w-0 space-y-6">
            {/* Current incident */}
            <section className="border border-white/[0.08] bg-[#0a0a0a]">
              <SectionHeader
                title="Current incident"
                right="SEV-1"
                rightClass="text-red-400"
              />

              <div className="border-t border-white/[0.06] p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-white">
                      Query duration anomaly
                    </p>

                    <p className="mt-1 font-mono text-[10px] text-zinc-600">
                      {incidents[0]?.id?.slice(0, 12) ?? "NO ACTIVE INCIDENT"}
                    </p>
                  </div>

                  <span className="border border-red-500/20 bg-red-500/5 px-2 py-1 text-[9px] font-mono uppercase tracking-wider text-red-400">
                    {incidents[0]?.status ?? "IDLE"}
                  </span>
                </div>

                <div className="mt-6 space-y-3">
                  <IncidentProperty
                    label="Service"
                    value="CockroachDB"
                  />

                  <IncidentProperty
                    label="Signal"
                    value="Query latency"
                  />

                  <IncidentProperty
                    label="Memory"
                    value="Historical match"
                  />

                  <IncidentProperty
                    label="Action"
                    value="Pending verification"
                  />
                </div>
              </div>
            </section>

            {/* Decision */}
            <section className="border border-white/[0.08] bg-[#0a0a0a]">
              <SectionHeader
                title="Agent decision"
                right="RETRIEVAL"
              />

              <div className="border-t border-white/[0.06] p-5">
                <p className="text-xs leading-5 text-zinc-400">
                  A previous incident with a matching symptom signature was
                  retrieved from semantic memory.
                </p>

                <div className="mt-5 border-l border-emerald-500/40 pl-4">
                  <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-600">
                    Retrieved experience
                  </p>

                  <p className="mt-2 text-xs leading-5 text-zinc-200">
                    Runaway analytical query caused sustained database
                    contention.
                  </p>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-white/[0.06] pt-4">
                  <span className="text-[10px] font-mono text-zinc-600">
                    CONFIDENCE
                  </span>

                  <span className="text-sm font-mono text-emerald-400">
                    99.8%
                  </span>
                </div>
              </div>
            </section>

            {/* System status */}
            <section className="border border-white/[0.08] bg-[#0a0a0a]">
              <SectionHeader title="System status" />

              <div className="divide-y divide-white/[0.06] border-t border-white/[0.06]">
                <StatusRow
                  name="CockroachDB"
                  status="Operational"
                />

                <StatusRow
                  name="Vector indexing"
                  status="Operational"
                />

                <StatusRow
                  name="Agent runtime"
                  status="Operational"
                />

                <StatusRow
                  name="AWS telemetry"
                  status="Operational"
                />
              </div>
            </section>
          </aside>
        </div>

        {/* Incident ledger */}
        <section className="mt-6 border border-white/[0.08] bg-[#0a0a0a]">
          <SectionHeader
            title="Incident ledger"
            right={`${incidents.length} recent`}
          />

          <div className="overflow-x-auto border-t border-white/[0.06]">
            <table className="w-full min-w-[700px] border-collapse">
              <thead>
                <tr className="border-b border-white/[0.06] text-left">
                  <TableHead>Severity</TableHead>
                  <TableHead>Incident</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Memory</TableHead>
                </tr>
              </thead>

              <tbody>
                {incidents.length > 0 ? (
                  incidents.map((incident) => (
                    <tr
                      key={incident.id}
                      className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.015]"
                    >
                      <TableCell>
                        <Severity severity={incident.severity} />
                      </TableCell>

                      <TableCell>
                        <div>
                          <p className="text-xs text-zinc-200">
                            {incident.title}
                          </p>

                          <p className="mt-1 font-mono text-[9px] text-zinc-700">
                            {incident.id}
                          </p>
                        </div>
                      </TableCell>

                      <TableCell>
                        <StatusBadge status={incident.status} />
                      </TableCell>

                      <TableCell>
                        <span className="font-mono text-[10px] text-zinc-500">
                          {formatDate(incident.created_at)}
                        </span>
                      </TableCell>

                      <TableCell>
                        <span className="font-mono text-[10px] text-zinc-500">
                          —
                        </span>
                      </TableCell>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-5 py-12 text-center font-mono text-[10px] uppercase tracking-wider text-zinc-700"
                    >
                      No incidents recorded
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}

/* ---------------------------------------------------------
   Components
--------------------------------------------------------- */

function Metric({
  label,
  value,
  detail,
  valueClass = "text-white",
}: {
  label: string;
  value: string;
  detail?: string;
  valueClass?: string;
}) {
  return (
    <div className="border-r border-white/[0.06] px-5 py-5 last:border-r-0">
      <p className="text-[9px] font-mono uppercase tracking-[0.15em] text-zinc-600">
        {label}
      </p>

      <p className={`mt-2 font-mono text-xl tracking-tight ${valueClass}`}>
        {value}
      </p>

      {detail && (
        <p className="mt-1 text-[9px] font-mono text-zinc-700">
          {detail}
        </p>
      )}
    </div>
  );
}

function SectionHeader({
  title,
  right,
  rightClass = "text-zinc-600",
}: {
  title: string;
  right?: string;
  rightClass?: string;
}) {
  return (
    <div className="flex items-center justify-between px-5 py-3">
      <h2 className="text-[10px] font-mono uppercase tracking-[0.15em] text-zinc-500">
        {title}
      </h2>

      {right && (
        <span
          className={`text-[9px] font-mono uppercase tracking-wider ${rightClass}`}
        >
          {right}
        </span>
      )}
    </div>
  );
}

function PipelineStep({
  number,
  title,
  description,
  state,
}: {
  number: string;
  title: string;
  description: string;
  state: "complete" | "active" | "pending";
}) {
  const stateClass = {
    complete: "text-zinc-200",
    active: "text-emerald-400",
    pending: "text-zinc-700",
  }[state];

  return (
    <div className="min-h-[105px] p-4">
      <p className="font-mono text-[9px] text-zinc-700">{number}</p>

      <p className={`mt-4 text-[11px] font-medium ${stateClass}`}>
        {title}
      </p>

      <p className="mt-1 text-[9px] leading-4 text-zinc-700">
        {description}
      </p>
    </div>
  );
}

function MemoryStat({
  label,
  value,
  description,
}: {
  label: string;
  value: string;
  description: string;
}) {
  return (
    <div className="p-5">
      <p className="text-[9px] font-mono uppercase tracking-wider text-zinc-600">
        {label}
      </p>

      <p className="mt-3 font-mono text-sm text-zinc-200">
        {value}
      </p>

      <p className="mt-1 text-[9px] text-zinc-700">
        {description}
      </p>
    </div>
  );
}

function IncidentProperty({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-[9px] font-mono uppercase tracking-wider text-zinc-700">
        {label}
      </span>

      <span className="text-right text-[10px] text-zinc-400">
        {value}
      </span>
    </div>
  );
}

function StatusRow({
  name,
  status,
}: {
  name: string;
  status: string;
}) {
  return (
    <div className="flex items-center justify-between px-5 py-3">
      <span className="text-[10px] text-zinc-400">{name}</span>

      <div className="flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

        <span className="text-[9px] font-mono text-zinc-600">
          {status}
        </span>
      </div>
    </div>
  );
}

function Severity({ severity }: { severity: string }) {
  const normalized = severity?.toUpperCase();

  const className =
    normalized === "SEV-1"
      ? "text-red-400"
      : normalized === "SEV-2"
        ? "text-amber-400"
        : "text-zinc-500";

  return (
    <span className={`font-mono text-[9px] ${className}`}>
      {normalized || "UNKNOWN"}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const normalized = status?.toUpperCase();

  const className =
    normalized === "OPEN" || normalized === "ACTIVE"
      ? "border-amber-500/20 text-amber-400"
      : normalized === "RESOLVED" || normalized === "CLOSED"
        ? "border-emerald-500/20 text-emerald-400"
        : "border-white/[0.08] text-zinc-500";

  return (
    <span
      className={`border px-2 py-1 font-mono text-[8px] uppercase tracking-wider ${className}`}
    >
      {normalized || "UNKNOWN"}
    </span>
  );
}

function TableHead({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-5 py-3 text-[8px] font-mono font-normal uppercase tracking-[0.15em] text-zinc-700">
      {children}
    </th>
  );
}

function TableCell({ children }: { children: React.ReactNode }) {
  return (
    <td className="px-5 py-4 align-middle">
      {children}
    </td>
  );
}

function formatDate(value: string) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(value));
}