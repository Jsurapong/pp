"use client";

// ─── Equity Curve Chart ────────────────────────────────────────────────────

const WEEKS = ["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8", "W9", "W10", "W11", "W12"];

type Series = { label: string; color: string; data: number[]; current: string };

const series: Series[] = [
  {
    label: "Forex",
    color: "var(--ant-primary)",
    current: "$12,450",
    data: [12000, 11800, 12100, 12400, 12200, 12600, 12900, 12700, 13100, 12850, 13200, 12450],
  },
  {
    label: "Crypto",
    color: "var(--ant-warning)",
    current: "$4,820",
    data: [5000, 4600, 4900, 5200, 4800, 4500, 4700, 5100, 5300, 4950, 4700, 4820],
  },
  {
    label: "Stocks",
    color: "var(--ant-success)",
    current: "$9,180",
    data: [8000, 8300, 8200, 8600, 8800, 8700, 9000, 8900, 9200, 9100, 9300, 9180],
  },
];

function polylinePoints(data: number[], w: number, h: number, yMin: number, yMax: number) {
  const pad = 16;
  const chartW = w - pad * 2;
  const chartH = h - pad * 2;
  return data
    .map((v, i) => {
      const x = pad + (i / (data.length - 1)) * chartW;
      const y = pad + chartH - ((v - yMin) / (yMax - yMin)) * chartH;
      return `${x},${y}`;
    })
    .join(" ");
}

function EquityCurveChart() {
  const W = 680;
  const H = 200;
  const pad = 16;

  const allValues = series.flatMap((s) => s.data);
  const yMin = Math.min(...allValues) * 0.97;
  const yMax = Math.max(...allValues) * 1.02;
  const initialCap = 25000; // combined initial
  const initialY = pad + (H - pad * 2) - ((initialCap * 0.48 - yMin) / (yMax - yMin)) * (H - pad * 2);

  const xLabels = [0, 3, 6, 9, 11];

  return (
    <div className="tm-card" style={{ marginBottom: 16 }}>
      <div className="tm-card-head">
        <div>
          <div className="tm-card-title">Equity Curve</div>
          <div style={{ fontSize: 13, color: "var(--ant-text-3)", marginTop: 2 }}>
            3 portfolios · last 12 weeks
          </div>
        </div>
        <div className="tm-card-extra">
          {series.map((s) => (
            <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--ant-text-2)" }}>
              <span style={{ width: 12, height: 3, borderRadius: 2, background: s.color, display: "inline-block" }} />
              {s.label}
              <span style={{ fontWeight: 600, color: "var(--ant-text)" }}>{s.current}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="tm-card-body" style={{ paddingBottom: 16 }}>
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} style={{ display: "block", overflow: "visible" }}>
          {/* Grid lines */}
          {[0.25, 0.5, 0.75].map((frac) => {
            const y = pad + (H - pad * 2) * frac;
            return (
              <line
                key={frac}
                x1={pad}
                y1={y}
                x2={W - pad}
                y2={y}
                stroke="var(--ant-border-2)"
                strokeWidth="1"
                strokeDasharray="4,4"
              />
            );
          })}

          {/* Threshold / initial capital line */}
          <line
            x1={pad}
            y1={initialY}
            x2={W - pad}
            y2={initialY}
            stroke="var(--ant-border)"
            strokeWidth="1"
            strokeDasharray="6,3"
          />
          <text x={pad + 4} y={initialY - 4} fontSize="11" fill="var(--ant-text-3)">
            Initial Capital
          </text>

          {/* Series lines */}
          {series.map((s) => (
            <polyline
              key={s.label}
              points={polylinePoints(s.data, W, H, yMin, yMax)}
              fill="none"
              stroke={s.color}
              strokeWidth="2.5"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          ))}

          {/* End dots */}
          {series.map((s) => {
            const lastVal = s.data[s.data.length - 1];
            const chartW = W - pad * 2;
            const chartH = H - pad * 2;
            const x = pad + chartW;
            const y = pad + chartH - ((lastVal - yMin) / (yMax - yMin)) * chartH;
            return (
              <circle key={s.label} cx={x} cy={y} r="4" fill={s.color} stroke="#fff" strokeWidth="2" />
            );
          })}

          {/* X-axis labels */}
          {xLabels.map((i) => {
            const chartW = W - pad * 2;
            const x = pad + (i / (WEEKS.length - 1)) * chartW;
            return (
              <text key={i} x={x} y={H} fontSize="11" fill="var(--ant-text-3)" textAnchor="middle">
                {WEEKS[i]}
              </text>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

// ─── Types ─────────────────────────────────────────────────────────────────

type TradeResult = "Win" | "Loss";
type TradeDirection = "Long" | "Short";

interface Trade {
  time: string;
  symbol: string;
  direction: TradeDirection;
  pnl: string;
  pnlPositive: boolean;
  result: TradeResult;
}

interface Portfolio {
  name: string;
  pct: number;
  label: string;
  color: string;
}

// ─── Data ──────────────────────────────────────────────────────────────────

const recentTrades: Trade[] = [
  { time: "2h ago",  symbol: "EURUSD",  direction: "Long",  pnl: "+$124",  pnlPositive: true,  result: "Win"  },
  { time: "4h ago",  symbol: "BTC/USD", direction: "Short", pnl: "-$87",   pnlPositive: false, result: "Loss" },
  { time: "6h ago",  symbol: "AAPL",    direction: "Long",  pnl: "+$203",  pnlPositive: true,  result: "Win"  },
  { time: "1d ago",  symbol: "ETH/USD", direction: "Long",  pnl: "+$156",  pnlPositive: true,  result: "Win"  },
  { time: "1d ago",  symbol: "GBPUSD",  direction: "Short", pnl: "-$45",   pnlPositive: false, result: "Loss" },
  { time: "2d ago",  symbol: "TSLA",    direction: "Long",  pnl: "+$312",  pnlPositive: true,  result: "Win"  },
];

const portfolios: Portfolio[] = [
  { name: "Forex Portfolio",  pct: 68, label: "Best performing",  color: "var(--ant-primary)"  },
  { name: "Stocks Portfolio", pct: 58, label: "Steady growth",    color: "var(--ant-success)"  },
  { name: "Crypto Portfolio", pct: 45, label: "High volatility",  color: "var(--ant-warning)"  },
];

// ─── Sub-components ────────────────────────────────────────────────────────

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20,6 9,17 4,12" />
    </svg>
  );
}

function ArrowUpIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="18,15 12,9 6,15" />
    </svg>
  );
}

function TrendingUpIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23,6 13.5,15.5 8.5,10.5 1,18" />
      <polyline points="17,6 23,6 23,12" />
    </svg>
  );
}

function TargetIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}

function DollarIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}

function ScaleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="3" x2="12" y2="21" />
      <path d="M3 6l9-3 9 3" />
      <path d="M5 10l-2 8" />
      <path d="M19 10l2 8" />
      <path d="M3 18h6" />
      <path d="M15 18h6" />
    </svg>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  return (
    <>
      {/* Page header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Welcome back — here&apos;s your trading overview.</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="tm-btn">Export</button>
          <button className="tm-btn">This Week</button>
        </div>
      </div>

      {/* Phase Pipeline */}
      <div className="tm-card" style={{ marginBottom: 16 }}>
        <div className="tm-card-head">
          <div className="tm-card-title">Build Progress</div>
          <div className="tm-card-extra">
            <span className="tm-tag tm-tag-blue">
              <span className="tm-tag-dot" />
              Phase 1 Active
            </span>
          </div>
        </div>
        <div className="tm-card-body" style={{ paddingTop: 16, paddingBottom: 16 }}>
          <div className="tm-steps">
            {/* Phase 1 — done/active */}
            <div className="tm-step active">
              <div className="tm-step-icon">1</div>
              <div className="tm-step-content">
                <div className="tm-step-title">Core Foundation</div>
                <div className="tm-step-desc">Auth + Portfolios + Journal</div>
              </div>
            </div>
            <div className="tm-step-connector" />

            {/* Phase 2 — wait */}
            <div className="tm-step">
              <div className="tm-step-icon">2</div>
              <div className="tm-step-content">
                <div className="tm-step-title">Money Engine</div>
                <div className="tm-step-desc">Position Size + RRR Calculator</div>
              </div>
            </div>
            <div className="tm-step-connector" />

            {/* Phase 3 — wait */}
            <div className="tm-step">
              <div className="tm-step-icon">3</div>
              <div className="tm-step-content">
                <div className="tm-step-title">Analytics</div>
                <div className="tm-step-desc">Charts + Reports + Insights</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="stat-row">
        {/* Net Worth */}
        <div className="stat has-icon">
          <div className="stat-label">Net Worth</div>
          <div className="stat-value">
            $12,450
          </div>
          <div className="stat-trend">
            <span className="stat-up" style={{ display: "flex", alignItems: "center", gap: 2 }}>
              <ArrowUpIcon />
              +$384
            </span>
            <span>this week</span>
          </div>
          <div className="stat-icon-bg">
            <DollarIcon />
          </div>
        </div>

        {/* Win Rate */}
        <div className="stat has-icon">
          <div className="stat-label">Win Rate</div>
          <div className="stat-value">
            58<span className="stat-suffix">%</span>
          </div>
          <div className="stat-trend">
            <span className="stat-up" style={{ display: "flex", alignItems: "center", gap: 2 }}>
              <ArrowUpIcon />
              +4%
            </span>
            <span>vs last month</span>
          </div>
          <div className="stat-icon-bg" style={{ background: "var(--ant-success-bg)", color: "var(--ant-success)" }}>
            <TargetIcon />
          </div>
        </div>

        {/* Cumulative PnL */}
        <div className="stat has-icon">
          <div className="stat-label">Cumulative PnL</div>
          <div className="stat-value" style={{ color: "var(--ant-success)" }}>
            +$2,340
          </div>
          <div className="stat-trend">
            <span className="stat-up" style={{ display: "flex", alignItems: "center", gap: 2 }}>
              <ArrowUpIcon />
              18.8%
            </span>
            <span>total return</span>
          </div>
          <div className="stat-icon-bg" style={{ background: "var(--ant-success-bg)", color: "var(--ant-success)" }}>
            <TrendingUpIcon />
          </div>
        </div>

        {/* Avg RRR */}
        <div className="stat has-icon">
          <div className="stat-label">Avg RRR</div>
          <div className="stat-value">
            2.1<span className="stat-suffix">x</span>
          </div>
          <div className="stat-trend">
            <span style={{ color: "var(--ant-text-3)" }}>127 trades recorded</span>
          </div>
          <div className="stat-icon-bg" style={{ background: "var(--ant-purple-bg)", color: "var(--ant-purple)" }}>
            <ScaleIcon />
          </div>
        </div>
      </div>

      {/* Equity Curve Chart */}
      <EquityCurveChart />

      {/* Two-column grid */}
      <div className="tm-grid-2">
        {/* Recent Trades */}
        <div className="tm-card">
          <div className="tm-card-head">
            <div className="tm-card-title">Recent Trades</div>
            <div className="tm-card-extra">
              <button className="tm-btn tm-btn-sm">View All</button>
            </div>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table className="tm-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Symbol</th>
                  <th>Direction</th>
                  <th>PnL</th>
                  <th>Result</th>
                </tr>
              </thead>
              <tbody>
                {recentTrades.map((trade, i) => (
                  <tr key={i}>
                    <td style={{ color: "var(--ant-text-3)", fontSize: 13 }}>{trade.time}</td>
                    <td>
                      <span style={{ fontWeight: 500, fontFamily: "var(--font-geist-mono, monospace)" }}>
                        {trade.symbol}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`tm-tag ${trade.direction === "Long" ? "tm-tag-blue" : "tm-tag-orange"}`}
                      >
                        {trade.direction}
                      </span>
                    </td>
                    <td>
                      <span
                        style={{
                          fontWeight: 500,
                          color: trade.pnlPositive ? "var(--ant-success)" : "var(--ant-error)",
                          fontFeatureSettings: '"tnum"',
                        }}
                      >
                        {trade.pnl}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`tm-tag ${trade.result === "Win" ? "tm-tag-green" : "tm-tag-red"}`}
                      >
                        {trade.result === "Win" && (
                          <span style={{ display: "flex", alignItems: "center" }}><CheckIcon /></span>
                        )}
                        {trade.result}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Portfolio Distribution */}
        <div className="tm-card">
          <div className="tm-card-head">
            <div className="tm-card-title">Portfolio Distribution</div>
            <div className="tm-card-extra">
              <span className="tm-tag tm-tag-default">Win Rate</span>
            </div>
          </div>
          <div className="tm-card-body">
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {portfolios.map((p) => (
                <div key={p.name}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, alignItems: "center" }}>
                    <div>
                      <div style={{ fontWeight: 500, fontSize: 14 }}>{p.name}</div>
                      <div style={{ fontSize: 12, color: "var(--ant-text-3)", marginTop: 2 }}>{p.label}</div>
                    </div>
                    <span style={{ fontWeight: 600, fontSize: 16, fontFeatureSettings: '"tnum"' }}>
                      {p.pct}%
                    </span>
                  </div>
                  <div className="tm-progress-track">
                    <div
                      className="tm-progress-fill"
                      style={{ width: `${p.pct}%`, background: p.color }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="tm-divider" />

            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontWeight: 600, fontSize: 18 }}>3</div>
                <div style={{ color: "var(--ant-text-3)" }}>Active Portfolios</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontWeight: 600, fontSize: 18, color: "var(--ant-success)" }}>127</div>
                <div style={{ color: "var(--ant-text-3)" }}>Total Trades</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontWeight: 600, fontSize: 18, color: "var(--ant-primary)" }}>+18.8%</div>
                <div style={{ color: "var(--ant-text-3)" }}>Overall Return</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
