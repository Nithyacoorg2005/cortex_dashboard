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
    <main className="min-h-screen bg-[#050505] text-zinc-300 p-6 md:p-10 font-sans selection:bg-emerald-500/30">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-end justify-between border-b border-white/10 pb-6 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]"></div>
              <p className="text-xs font-mono text-emerald-500 tracking-wider">SYSTEM ONLINE</p>
            </div>
            <h1 className="text-3xl font-semibold text-white tracking-tight">Cortex Memory Fabric</h1>
            <p className="text-zinc-500 mt-1 text-sm">Persistent cognitive memory for autonomous operations.</p>
          </div>
          <div className="text-right font-mono text-xs text-zinc-600">
            <p>ENV: PRODUCTION</p>
            <p>REGION: US-EAST-1</p>
          </div>
        </header>
        <section className="flex flex-col gap-6">
          
          <div className="rounded-xl border border-white/10 bg-black/40 backdrop-blur-md shadow-2xl overflow-hidden">
            <div className="border-b border-white/5 bg-white/[0.02] px-4 py-2 flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full bg-rose-500/20 border border-rose-500/50"></div>
                <div className="h-3 w-3 rounded-full bg-amber-500/20 border border-amber-500/50"></div>
                <div className="h-3 w-3 rounded-full bg-emerald-500/20 border border-emerald-500/50"></div>
              </div>
              <span className="ml-2 font-mono text-xs text-zinc-500">agent-execution-terminal.sh</span>
            </div>
            <div className="p-1">
              <LiveWarRoom />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            <div className="lg:col-span-2 rounded-xl border border-white/10 bg-[#0a0a0a] p-6 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-medium text-white tracking-tight">Incident Ledger</h2>
                <span className="text-xs font-mono text-zinc-500 bg-white/5 px-2 py-1 rounded">CockroachDB</span>
              </div>
              
              <ul className="space-y-3">
                {incidents.map((inc) => (
                  <li 
                    key={inc.id} 
                    className="group flex items-center justify-between p-4 rounded-lg bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-white/10 transition-all duration-200"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`h-full w-1 rounded-full ${inc.severity === 'SEV-1' ? 'bg-rose-500 shadow-[0_0_10px_#e11d48]' : 'bg-amber-500 shadow-[0_0_10px_#f59e0b]'}`}>&nbsp;</div>
                      <div>
                        <p className="font-medium text-zinc-200 group-hover:text-white transition-colors">{inc.title}</p>
                        <p className="text-xs font-mono text-zinc-600 mt-1">{inc.id.split('-')[0]}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono tracking-wider px-2.5 py-1 uppercase border border-white/10 rounded-full bg-white/5 text-zinc-300">
                      {inc.status}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Vector Index Status */}
            <div className="rounded-xl border border-white/10 bg-[#0a0a0a] p-6 shadow-lg flex flex-col">
              <h2 className="text-lg font-medium text-white tracking-tight mb-6">Vector Index Status</h2>
              
              <div className="flex-1 rounded-lg border border-emerald-500/20 bg-emerald-500/[0.02] p-5 flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
                  <div className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                  </div>
                  <p className="font-mono text-emerald-400 text-sm tracking-wide">C-SPANN ONLINE</p>
                </div>
                
                <div className="space-y-4 font-mono text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500">Dimensions</span>
                    <span className="text-zinc-300">768-d</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500">Similarity Threshold</span>
                    <span className="text-zinc-300">&gt; 90%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500">Node Distribution</span>
                    <span className="text-zinc-300">Multi-Region</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500">Model Framework</span>
                    <span className="text-zinc-300">Deterministic Engine</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>
      </div>
    </main>
  );
}