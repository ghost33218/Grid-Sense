import { motion } from 'framer-motion'

function StatCard({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div className="bg-[#E2E0D8] border border-[#C8C5BC] p-4" style={{ borderTop: `2px solid ${accent}` }}>
      <div className="text-[9px] font-mono uppercase tracking-[0.12em] text-[#9A9690] mb-2">{label}</div>
      <div className="font-mono font-bold text-[28px]" style={{ color: accent }}>{value}</div>
    </div>
  )
}

const PIPELINE = [
  { label: 'INPUT', value: '8,173 Bangalore incidents, Jan–May 2024' },
  { label: '63 FEATURES', value: 'Time · Domain severity · Interactions · Statistical maps' },
  { label: '3 MODELS', value: 'LightGBM · CatBoost · XGBoost (Optuna-tuned)' },
  { label: 'ENSEMBLE', value: 'Weighted vote — LGBM 30% / Cat 40% / XGB 30%' },
  { label: 'OUTPUT', value: 'Congestion level + deployment recommendation' },
]

export function About() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      style={{ padding: '32px 40px', maxWidth: 900 }}
    >
      <h1 className="font-sans font-bold text-[#1A1A18] lowercase" style={{ fontSize: 52, letterSpacing: '-0.03em' }}>
        about
      </h1>
      <p className="text-[14px] font-sans text-[#6B6860] mt-2">
        GridSense — AI Traffic Operations Co-pilot for Bangalore
      </p>

      {/* Section 1 — Problem */}
      <div className="mt-8 border border-[#C8C5BC] p-5">
        <div className="text-[9px] font-mono uppercase tracking-[0.12em] text-[#9A9690] mb-3">THE PROBLEM</div>
        <p className="text-[13px] font-sans text-[#1A1A18] leading-[1.7]">
          Bangalore traffic police currently have no system to forecast event-driven congestion before it happens.
          Resource deployment — officer counts, barricade placement, diversion routes — is based on experience
          rather than data. There is also no mechanism to learn from past incidents and improve future response.
        </p>
      </div>

      {/* Section 2 — Solution */}
      <div className="mt-4 border border-[#C8C5BC] p-5">
        <div className="text-[9px] font-mono uppercase tracking-[0.12em] text-[#9A9690] mb-3">THE SOLUTION</div>
        <p className="text-[13px] font-sans text-[#1A1A18] leading-[1.7]">
          GridSense ingests historical incident data and predicts congestion severity (Low/Medium/High) for new
          events in real time, then generates specific deployment recommendations — officer count, barricade count,
          diversion routes — backed by similarity matching against comparable past incidents.
        </p>
      </div>

      {/* Section 3 — AI Architecture */}
      <div className="mt-4 border border-[#C8C5BC] p-5">
        <div className="text-[9px] font-mono uppercase tracking-[0.12em] text-[#9A9690] mb-4">AI ARCHITECTURE</div>
        <div className="flex flex-wrap items-center gap-2">
          {PIPELINE.map((stage, i) => (
            <div key={stage.label} className="flex items-center gap-2">
              <div className="border border-[#C8C5BC] px-3.5 py-2.5">
                <div className="text-[9px] font-mono text-[#9A9690] uppercase">{stage.label}</div>
                <div className="text-[10px] font-mono text-[#1A1A18] mt-1 max-w-[160px]">{stage.value}</div>
              </div>
              {i < PIPELINE.length - 1 && <span className="text-[#C84B2F] font-mono text-[14px]">→</span>}
            </div>
          ))}
        </div>

        {/* E5.2 Dataset Provenance */}
        <div className="mt-4 border border-[#C8C5BC] p-4">
          <div className="text-[9px] font-mono uppercase tracking-[0.12em] text-[#9A9690] mb-3">DATASET SOURCE</div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-[12px] font-sans font-semibold text-[#1A1A18]">Bangalore Traffic Incident Dataset</div>
              <div className="text-[11px] font-mono text-[#1A1A18] mt-1">8,173 incidents</div>
              <div className="text-[11px] font-mono text-[#6B6860]">January – May 2024</div>
            </div>
            <div>
              <div className="text-[9px] font-mono text-[#9A9690] uppercase mb-1">FIELDS USED</div>
              <div className="text-[11px] font-mono text-[#1A1A18] leading-relaxed">
                Cause, Corridor, Zone, Priority, Road Closure, Police Station, Duration, Time Features
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 4 — Results */}
      <div className="mt-4">
        <div className="text-[9px] font-mono uppercase tracking-[0.12em] text-[#9A9690] mb-3">RESULTS</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <StatCard label="F1 SCORE (MACRO)" value="0.640" accent="#1A1A18" />
          <StatCard label="ACCURACY" value="63.8%" accent="#B8820A" />
          <StatCard label="HIGH-RISK RECALL" value="75.5%" accent="#C84B2F" />
          <StatCard label="TRAINING DATA" value="8,173" accent="#2D6A4F" />
        </div>
        <p className="text-[11px] font-mono text-[#9A9690] mt-3 leading-relaxed">
          Model evaluated via stratified 80/20 hold-out split. High-risk recall prioritized — missing a critical
          incident costs more than a false alarm in operational deployment.
        </p>

        <div className="mt-4 border border-[#C8C5BC] border-l-[3px] border-l-[#C84B2F] bg-[#E2E0D8] px-5 py-4">
          <div className="text-[9px] font-mono uppercase tracking-[0.12em] text-[#C84B2F]">MODEL OBJECTIVE</div>
          <p className="text-[13px] font-sans font-medium text-[#1A1A18] mt-2 leading-relaxed">
            Operational priority: maximize recall of HIGH-risk incidents, even at the cost of additional false positives.
          </p>
          <p className="text-[12px] font-sans text-[#6B6860] mt-1.5 leading-[1.6]">
            Reason: missing a critical congestion event creates higher operational cost than over-preparing for one
            that doesn't materialize. The ensemble is tuned accordingly — accuracy is a secondary metric here,
            not the optimization target.
          </p>
        </div>
      </div>

      {/* Section 5 — Impact */}
      <div className="mt-4 border border-[#C8C5BC] p-5">
        <div className="text-[9px] font-mono uppercase tracking-[0.12em] text-[#9A9690] mb-4">IMPACT</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            '75.5% of HIGH-risk incidents correctly flagged',
            '63 engineered features per incident',
            '8,173 historical incidents analyzed',
            '3-model ensemble vs single-model baseline',
          ].map(item => (
            <div key={item} className="flex gap-2 items-start">
              <span className="text-[#2D6A4F] font-mono font-bold text-[12px]">✓</span>
              <span className="text-[13px] font-sans text-[#1A1A18]">{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Section 6 — Future Scope */}
      <div className="mt-4 border border-[#C8C5BC] p-5">
        <div className="text-[9px] font-mono uppercase tracking-[0.12em] text-[#9A9690] mb-3">FUTURE SCOPE</div>
        <ul className="flex flex-col gap-2">
          {[
            'Real-time traffic API integration for live officer GPS tracking',
            'Weather data integration (rain accounts for major duration variance)',
            'Crowd-size estimation from event registration APIs',
            'Mobile app for field officers to submit feedback on-site',
          ].map(item => (
            <li key={item} className="text-[13px] font-sans text-[#1A1A18] flex gap-2">
              <span className="text-[#C8C5BC]">—</span>{item}
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  )
}
