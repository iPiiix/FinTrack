"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from "recharts";
import {
    ArrowUpRight,
    TrendingUp,
    TrendingDown,
    RefreshCw,
    Activity,
    DollarSign,
    Briefcase,
    Globe,
} from "lucide-react";

/* ============================================================
   DESIGN SYSTEM — shared with landing page
============================================================ */
function GlobalStyles() {
    return (
        <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Mono:wght@300;400;500&family=DM+Sans:ital,opsz,wght@0,9..40,100..900;1,9..40,300&display=swap');
      :root { --bg:#09090B; --white:#FAFAF9; --accent:#E8FF47; }
      html { scroll-behavior:smooth; }
      body { background:var(--bg); }

      @keyframes ticker { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
      .ticker-track { display:inline-block; animation:ticker 44s linear infinite; white-space:nowrap; }

      @keyframes pls { 0%,100%{opacity:1} 50%{opacity:.25} }
      @keyframes spin { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }
      .spin { animation:spin .8s linear infinite; }

      @keyframes fadeIn { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
      .fade-in { animation:fadeIn .55s cubic-bezier(.16,1,.3,1) both; }

      @keyframes scanDown {
        0%   { transform: translateY(-2px); opacity: .4; }
        100% { transform: translateY(100vh); opacity: 0; }
      }

      .grain::after {
        content:''; position:fixed; inset:-200%; width:400%; height:400%;
        pointer-events:none; z-index:250; opacity:.018;
        background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.78' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
        background-size:180px 180px; animation:grn .45s steps(1) infinite;
      }
      @keyframes grn {
        0%,100%{transform:translate(0,0)} 10%{transform:translate(-2%,-3%)} 20%{transform:translate(3%,2%)}
        30%{transform:translate(-1%,4%)} 40%{transform:translate(4%,-1%)} 50%{transform:translate(-3%,3%)}
        60%{transform:translate(2%,-4%)} 70%{transform:translate(-4%,1%)} 80%{transform:translate(1%,2%)} 90%{transform:translate(3%,-2%)}
      }

      .page-grid {
        background-image:linear-gradient(rgba(255,255,255,.008) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.008) 1px,transparent 1px);
        background-size:80px 80px;
      }
      ::-webkit-scrollbar { width:3px; }
      ::-webkit-scrollbar-track { background:var(--bg); }
      ::-webkit-scrollbar-thumb { background:#27272A; }

      .row-hover { transition:background .15s ease; }
      .row-hover:hover { background:rgba(232,255,71,.025); }

      .card-hover { transition:border-color .3s ease, background .3s ease; }
      .card-hover:hover { border-color: rgba(232,255,71,.22) !important; }

      .recharts-tooltip-wrapper .custom-tooltip {
        background:#111113; border:1px solid #27272A; border-radius:2px;
        padding:10px 14px; font-family:'DM Mono',monospace; font-size:11px;
      }
    `}</style>
    );
}

/* ============================================================
   TYPES
============================================================ */
interface Quote {
    symbol: string;
    name: string;
    price: number;
    change: number;
    changePercent: number;
    prevClose: number;
    volume: number;
    low52: number;
    high52: number;
    currency: string;
    error?: boolean;
}

interface Position {
    symbol: string;
    name: string;
    qty: number;
    avgCost: number;
    category: "Equity" | "ETF" | "Crypto" | "Cash";
    color: string;
}

/* ============================================================
   PORTFOLIO CONFIG — edit this to match your real holdings
============================================================ */
const POSITIONS: Position[] = [
    { symbol: "AAPL", name: "Apple Inc.", qty: 15, avgCost: 152.30, category: "Equity", color: "#E8FF47" },
    { symbol: "MSFT", name: "Microsoft Corp.", qty: 8, avgCost: 310.00, category: "Equity", color: "#A3FF85" },
    { symbol: "VOO", name: "Vanguard S&P 500", qty: 12, avgCost: 385.50, category: "ETF", color: "#51E5FF" },
    { symbol: "QQQ", name: "Invesco QQQ", qty: 6, avgCost: 340.00, category: "ETF", color: "#7FBAFF" },
    { symbol: "BTC-USD", name: "Bitcoin", qty: 0.15, avgCost: 45000, category: "Crypto", color: "#FF9F51" },
    { symbol: "ETH-USD", name: "Ethereum", qty: 1.2, avgCost: 2800, category: "Crypto", color: "#C08AFF" },
];

const CASH_BALANCE = 8450.00; // EUR / your local cash
const CASH_COLOR = "#52D9A0";

// Market indices to show in top ticker
const INDEX_SYMBOLS = ["^GSPC", "^IXIC", "^DJI", "^VIX", "EURUSD=X", "BTC-USD"];

/* ============================================================
   TICKER BAR
============================================================ */
function TickerBar({ indices }: { indices: Record<string, Quote> }) {
    const tickers = Object.values(indices);
    const seg = tickers.length
        ? tickers
            .map(
                (q) =>
                    `${q.symbol.replace("^", "").replace("=X", "")}  ${q.price > 0
                        ? q.price < 10
                            ? q.price.toFixed(4)
                            : q.price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                        : "—"
                    }  ${q.changePercent >= 0 ? "▲" : "▼"} ${Math.abs(q.changePercent).toFixed(2)}%  •  `
            )
            .join("")
        : "OWN YOUR FUTURE  •  KNOW YOUR NUMBERS  •  NET WORTH TRACKING  •  ";

    return (
        <div className="fixed top-0 left-0 right-0 z-50 overflow-hidden border-b border-zinc-800/80 bg-[#09090B]/90 backdrop-blur-md py-2">
            <div className="ticker-track font-mono text-[10px] tracking-[0.22em] text-zinc-600">
                {(seg + seg).repeat(3)}
            </div>
        </div>
    );
}

/* ============================================================
   NAV
============================================================ */
function Nav() {
    const [scrolled, setScrolled] = useState(false);
    useEffect(() => {
        const fn = () => setScrolled(window.scrollY > 50);
        window.addEventListener("scroll", fn, { passive: true });
        return () => window.removeEventListener("scroll", fn);
    }, []);
    return (
        <nav
            className="fixed left-0 right-0 z-40 transition-all duration-700"
            style={{
                top: 33,
                background: scrolled ? "rgba(9,9,11,0.96)" : "transparent",
                backdropFilter: scrolled ? "blur(14px)" : "none",
                borderBottom: scrolled ? "1px solid #27272A" : "1px solid transparent",
            }}
        >
            <div className="mx-auto flex max-w-screen-xl items-center justify-between px-8 py-5">
                <a href="/" className="flex items-center gap-3">
                    <div className="flex h-5 w-5 items-center justify-center border border-[#E8FF47]">
                        <div className="h-1.5 w-1.5 bg-[#E8FF47]" />
                    </div>
                    <span className="font-mono text-[11px] tracking-[0.35em] text-[#FAFAF9]">FINTRACK</span>
                </a>
                <div className="hidden items-center gap-12 md:flex">
                    {[
                        { label: "Dashboard", href: "/dashboard" },
                        { label: "Portfolio", href: "/portfolio" },
                        { label: "Ledger", href: "#" },
                        { label: "Analytics", href: "#" },
                    ].map((item) => (
                        <a
                            key={item.label}
                            href={item.href}
                            className="font-mono text-[10px] tracking-[0.22em] text-zinc-600 transition-colors duration-200 hover:text-zinc-200"
                            style={item.href === "/portfolio" ? { color: "#E8FF47" } : {}}
                        >
                            {item.label.toUpperCase()}
                        </a>
                    ))}
                </div>
                <a
                    href="/"
                    className="group flex items-center gap-2 border border-zinc-700 px-5 py-2.5 font-mono text-[10px] tracking-[0.18em] text-zinc-200 transition-all duration-200 hover:border-[#E8FF47] hover:bg-[#E8FF47] hover:text-black"
                >
                    HOME
                    <ArrowUpRight size={11} className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
            </div>
        </nav>
    );
}

/* ============================================================
   SUMMARY CARD
============================================================ */
function SummaryCard({
    label, value, sub, icon: Icon, positive, delay = 0,
}: {
    label: string; value: string; sub?: string; icon: React.ElementType;
    positive?: boolean; delay?: number;
}) {
    return (
        <div
            className="card-hover fade-in border border-zinc-800 bg-[#0d0d10] p-6"
            style={{ animationDelay: `${delay}ms` }}
        >
            <div className="mb-4 flex items-center justify-between">
                <span className="font-mono text-[9px] tracking-[0.38em] text-zinc-700">{label}</span>
                <Icon size={13} className="text-zinc-700" strokeWidth={1.5} />
            </div>
            <div
                className="leading-none"
                style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "clamp(1.8rem,3vw,2.8rem)", letterSpacing: "-.01em", color: "#FAFAF9" }}
            >
                {value}
            </div>
            {sub && (
                <div
                    className="mt-1.5 font-mono text-[11px]"
                    style={{ color: positive === undefined ? "#71717a" : positive ? "#E8FF47" : "#FF5757" }}
                >
                    {sub}
                </div>
            )}
        </div>
    );
}

/* ============================================================
   CUSTOM TOOLTIP
============================================================ */
function ChartTooltip({ active, payload, label }: {
    active?: boolean; payload?: { value: number }[]; label?: string;
}) {
    if (!active || !payload?.length) return null;
    return (
        <div className="custom-tooltip">
            <div className="text-zinc-600">{label}</div>
            <div className="mt-1" style={{ color: "#E8FF47" }}>
                ${payload[0].value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
        </div>
    );
}

/* ============================================================
   SPARKLINE CHART — generates intra-day synthetic + real history
============================================================ */
function generateSparkData(currentValue: number, days = 30) {
    const data = [];
    const now = new Date();
    let v = currentValue * (0.82 + Math.random() * 0.06);
    for (let i = days; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        v = v * (1 + (Math.random() - 0.46) * 0.025);
        data.push({
            date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
            value: Math.round(v * 100) / 100,
        });
    }
    // Ensure last value = current
    data[data.length - 1].value = currentValue;
    return data;
}

/* ============================================================
   ALLOCATION PIE
============================================================ */
type AllocData = { name: string; value: number; color: string };

function AllocationPie({ data }: { data: AllocData[] }) {
    const [active, setActive] = useState<number | null>(null);

    return (
        <div className="flex flex-col items-center gap-6 lg:flex-row lg:items-start">
            <div style={{ width: 200, height: 200, flexShrink: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={55}
                            outerRadius={90}
                            strokeWidth={0}
                            dataKey="value"
                            onMouseEnter={(_, i) => setActive(i)}
                            onMouseLeave={() => setActive(null)}
                        >
                            {data.map((entry, i) => (
                                <Cell
                                    key={entry.name}
                                    fill={entry.color}
                                    opacity={active === null || active === i ? 1 : 0.35}
                                    style={{ transition: "opacity .2s ease", cursor: "pointer" }}
                                />
                            ))}
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
            </div>
            <div className="flex flex-col gap-3 w-full">
                {data.map((d, i) => (
                    <div
                        key={d.name}
                        className="flex items-center justify-between"
                        onMouseEnter={() => setActive(i)}
                        onMouseLeave={() => setActive(null)}
                        style={{ opacity: active === null || active === i ? 1 : 0.45, transition: "opacity .2s ease", cursor: "default" }}
                    >
                        <div className="flex items-center gap-2.5">
                            <div className="h-2 w-2 rounded-full flex-shrink-0" style={{ background: d.color }} />
                            <span className="font-mono text-[10px] tracking-[0.18em] text-zinc-400">{d.name}</span>
                        </div>
                        <span className="font-mono text-[10px] tabular-nums text-zinc-300">
                            {d.value.toFixed(1)}%
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ============================================================
   MAIN PAGE
============================================================ */
export default function PortfolioPage() {
    const [quotes, setQuotes] = useState<Record<string, Quote>>({});
    const [indices, setIndices] = useState<Record<string, Quote>>({});
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
    const [countdown, setCountdown] = useState(30);
    const [sparkData, setSparkData] = useState<{ date: string; value: number }[]>([]);
    const sparkSeededRef = useRef(false);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const allSymbols = POSITIONS.map((p) => p.symbol);
    const indexSymbols = INDEX_SYMBOLS;

    /* ── fetch quotes ── */
    const fetchAll = useCallback(async (quiet = false) => {
        if (!quiet) setLoading(true);
        else setRefreshing(true);
        try {
            const [portfolioRes, indexRes] = await Promise.all([
                fetch(`/api/quote?symbols=${allSymbols.join(",")}`),
                fetch(`/api/quote?symbols=${indexSymbols.join(",")}`),
            ]);
            const [portfolioData, indexData] = await Promise.all([
                portfolioRes.json(), indexRes.json(),
            ]);

            const qMap: Record<string, Quote> = {};
            for (const q of portfolioData.quotes ?? []) qMap[q.symbol] = q;
            setQuotes(qMap);

            const iMap: Record<string, Quote> = {};
            for (const q of indexData.quotes ?? []) iMap[q.symbol] = q;
            setIndices(iMap);

            setLastUpdate(new Date());
            setCountdown(30);
        } catch (e) {
            console.error("Fetch error", e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [allSymbols.join(","), indexSymbols.join(",")]);

    /* initial + auto-refresh every 30s */
    useEffect(() => {
        fetchAll(false);
        timerRef.current = setInterval(() => fetchAll(true), 30_000);
        countdownRef.current = setInterval(() => {
            setCountdown((c) => (c <= 1 ? 30 : c - 1));
        }, 1_000);
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            if (countdownRef.current) clearInterval(countdownRef.current);
        };
    }, []);

    /* ── derived calculations ── */
    const positions = POSITIONS.map((pos) => {
        const q = quotes[pos.symbol];
        const price = q?.price ?? 0;
        const cost = pos.qty * pos.avgCost;
        const mktVal = pos.qty * price;
        const pnl = mktVal - cost;
        const pnlPct = cost > 0 ? (pnl / cost) * 100 : 0;
        return { ...pos, quote: q, price, cost, mktVal, pnl, pnlPct };
    });

    const totalMktVal = positions.reduce((s, p) => s + p.mktVal, 0) + CASH_BALANCE;
    const totalCost = positions.reduce((s, p) => s + p.cost, 0) + CASH_BALANCE;
    const totalPnl = totalMktVal - totalCost;
    const totalPnlPct = totalCost > 0 ? (totalPnl / totalCost) * 100 : 0;
    const dayChanges = positions.map((p) => (p.quote?.change ?? 0) * p.qty);
    const dayPnl = dayChanges.reduce((s, v) => s + v, 0);
    const dayPnlPct = totalMktVal > 0 ? (dayPnl / (totalMktVal - dayPnl)) * 100 : 0;

    /* allocation pie data */
    const categoryMap: Record<string, number> = {};
    for (const p of positions) {
        categoryMap[p.category] = (categoryMap[p.category] ?? 0) + p.mktVal;
    }
    categoryMap["Cash"] = CASH_BALANCE;
    const totalForPie = Object.values(categoryMap).reduce((s, v) => s + v, 0);
    const catColors: Record<string, string> = {
        Equity: "#E8FF47", ETF: "#51E5FF", Crypto: "#FF9F51", Cash: CASH_COLOR,
    };
    const allocData: AllocData[] = Object.entries(categoryMap).map(([name, val]) => ({
        name,
        value: totalForPie > 0 ? (val / totalForPie) * 100 : 0,
        color: catColors[name] ?? "#888",
    }));

    /* sparkline history — seed once, then update last point immutably */
    useEffect(() => {
        if (totalMktVal <= 0) return;
        if (!sparkSeededRef.current) {
            sparkSeededRef.current = true;
            setSparkData(generateSparkData(totalMktVal));
        } else {
            setSparkData((prev) => {
                if (!prev.length) return prev;
                const next = [...prev];
                next[next.length - 1] = { ...next[next.length - 1], value: totalMktVal };
                return next;
            });
        }
    }, [totalMktVal]);

    /* ── format helpers ── */
    const fmt = (n: number, d = 2) =>
        n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
    const fmtK = (n: number) =>
        Math.abs(n) >= 1_000_000
            ? `$${(n / 1_000_000).toFixed(2)}M`
            : `$${fmt(n)}`;

    return (
        <div className="grain min-h-screen bg-[#09090B] text-white antialiased" style={{ fontFamily: "'DM Sans',sans-serif" }}>
            <GlobalStyles />
            <TickerBar indices={indices} />
            <Nav />

            {/* ── scanning beam ── */}
            <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
                <div style={{
                    position: "absolute", left: 0, right: 0, height: 1,
                    background: "linear-gradient(90deg,transparent,rgba(232,255,71,.04),transparent)",
                    animation: "scanDown 14s linear infinite",
                }} />
            </div>
            <div className="pointer-events-none absolute inset-0 page-grid opacity-40 z-0" />

            <div className="relative z-10 mx-auto max-w-screen-xl px-8" style={{ paddingTop: 120 }}>

                {/* ── PAGE HEADER ── */}
                <div className="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between fade-in">
                    <div>
                        <div className="mb-3 flex items-center gap-3">
                            <div className="h-px w-5 bg-[#E8FF47]" />
                            <span className="font-mono text-[9px] tracking-[0.42em] text-zinc-600">PORTFOLIO — LIVE VIEW</span>
                        </div>
                        <h1
                            className="leading-none"
                            style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "clamp(52px,7vw,96px)", letterSpacing: "-.02em", color: "#FAFAF9" }}
                        >
                            MY PORTFOLIO
                        </h1>
                    </div>

                    {/* refresh controls */}
                    <div className="flex flex-col items-end gap-2">
                        <button
                            onClick={() => fetchAll(true)}
                            disabled={refreshing || loading}
                            className="group flex items-center gap-2 border border-zinc-700 px-5 py-2.5 font-mono text-[10px] tracking-[0.18em] text-zinc-200 transition-all hover:border-[#E8FF47] hover:text-[#E8FF47] disabled:opacity-40"
                        >
                            <RefreshCw size={11} className={refreshing ? "spin" : "transition-transform group-hover:rotate-180 duration-300"} />
                            {refreshing ? "UPDATING…" : "REFRESH"}
                        </button>
                        <div className="flex items-center gap-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-[#E8FF47]" style={{ animation: "pls 2s ease-in-out infinite" }} />
                            <span className="font-mono text-[9px] tracking-[0.2em] text-zinc-700">
                                {lastUpdate
                                    ? `UPDATED ${lastUpdate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" })} · NEXT IN ${countdown}s`
                                    : "CONNECTING…"}
                            </span>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-40 gap-4">
                        <RefreshCw size={24} className="spin text-zinc-600" />
                        <span className="font-mono text-[10px] tracking-[0.3em] text-zinc-700">FETCHING LIVE DATA…</span>
                    </div>
                ) : (
                    <>
                        {/* ── SUMMARY CARDS ── */}
                        <div className="mb-8 grid grid-cols-2 gap-px bg-zinc-800 md:grid-cols-4">
                            <SummaryCard
                                label="TOTAL VALUE"
                                value={totalMktVal > 0 ? fmtK(totalMktVal) : "—"}
                                icon={Briefcase}
                                delay={0}
                            />
                            <SummaryCard
                                label="TOTAL P&L"
                                value={totalPnl >= 0 ? `+${fmtK(totalPnl)}` : fmtK(totalPnl)}
                                sub={`${totalPnlPct >= 0 ? "▲" : "▼"} ${Math.abs(totalPnlPct).toFixed(2)}% all-time`}
                                icon={TrendingUp}
                                positive={totalPnl >= 0}
                                delay={60}
                            />
                            <SummaryCard
                                label="DAY CHANGE"
                                value={dayPnl >= 0 ? `+${fmtK(dayPnl)}` : fmtK(dayPnl)}
                                sub={`${dayPnlPct >= 0 ? "▲" : "▼"} ${Math.abs(dayPnlPct).toFixed(2)}% today`}
                                icon={dayPnl >= 0 ? TrendingUp : TrendingDown}
                                positive={dayPnl >= 0}
                                delay={120}
                            />
                            <SummaryCard
                                label="CASH RESERVE"
                                value={`$${fmt(CASH_BALANCE)}`}
                                sub={`${((CASH_BALANCE / totalMktVal) * 100).toFixed(1)}% of portfolio`}
                                icon={DollarSign}
                                delay={180}
                            />
                        </div>

                        {/* ── CHART + ALLOCATION ROW ── */}
                        <div className="mb-8 grid grid-cols-1 gap-px bg-zinc-800 lg:grid-cols-[1fr_320px]">
                            {/* Area chart */}
                            <div className="card-hover border-0 bg-[#0d0d10] p-8 fade-in" style={{ animationDelay: "200ms" }}>
                                <div className="mb-6 flex items-center justify-between">
                                    <div>
                                        <div className="mb-1 flex items-center gap-3">
                                            <Activity size={12} className="text-zinc-600" strokeWidth={1.5} />
                                            <span className="font-mono text-[9px] tracking-[0.38em] text-zinc-600">PORTFOLIO VALUE — 30D</span>
                                        </div>
                                        <div
                                            className="leading-none"
                                            style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "clamp(1.6rem,2.5vw,2.2rem)", color: "#FAFAF9", letterSpacing: "-.01em" }}
                                        >
                                            {totalMktVal > 0 ? fmtK(totalMktVal) : "—"}
                                        </div>
                                    </div>
                                    <div
                                        className="font-mono text-sm tabular-nums"
                                        style={{ color: totalPnlPct >= 0 ? "#E8FF47" : "#FF5757" }}
                                    >
                                        {totalPnlPct >= 0 ? "+" : ""}{totalPnlPct.toFixed(2)}%
                                    </div>
                                </div>
                                <ResponsiveContainer width="100%" height={220} minWidth={0}>
                                    <AreaChart data={sparkData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#E8FF47" stopOpacity={0.15} />
                                                <stop offset="100%" stopColor="#E8FF47" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <XAxis
                                            dataKey="date"
                                            tick={{ fontFamily: "'DM Mono',monospace", fontSize: 9, fill: "#3f3f46" }}
                                            axisLine={false} tickLine={false}
                                            interval={Math.floor(sparkData.length / 5)}
                                        />
                                        <YAxis hide domain={["auto", "auto"]} />
                                        <Tooltip content={<ChartTooltip />} />
                                        <Area
                                            type="monotone"
                                            dataKey="value"
                                            stroke="#E8FF47"
                                            strokeWidth={1.5}
                                            fill="url(#grad)"
                                            dot={false}
                                            animationDuration={800}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Allocation */}
                            <div className="card-hover bg-[#0d0d10] p-8 fade-in" style={{ animationDelay: "260ms" }}>
                                <div className="mb-6 flex items-center gap-3">
                                    <Globe size={12} className="text-zinc-600" strokeWidth={1.5} />
                                    <span className="font-mono text-[9px] tracking-[0.38em] text-zinc-600">ALLOCATION</span>
                                </div>
                                <AllocationPie data={allocData} />
                            </div>
                        </div>

                        {/* ── POSITIONS TABLE ── */}
                        <div className="mb-16 border border-zinc-800 bg-zinc-950 fade-in" style={{ animationDelay: "320ms" }}>
                            {/* Header */}
                            <div
                                className="grid border-b border-zinc-800 bg-zinc-900/40 px-6 py-3"
                                style={{ gridTemplateColumns: "1.4fr 1fr 0.8fr 0.8fr 0.8fr 0.9fr 0.8fr" }}
                            >
                                {["ASSET", "MARKET VALUE", "PRICE", "CHANGE", "QTY", "AVG COST", "P&L"].map((h) => (
                                    <span key={h} className="font-mono text-[8px] tracking-[0.35em] text-zinc-700">
                                        {h}
                                    </span>
                                ))}
                            </div>

                            {/* Rows */}
                            {positions.map((pos, i) => {
                                const hasData = pos.price > 0;
                                return (
                                    <div
                                        key={pos.symbol}
                                        className="row-hover grid items-center border-b border-zinc-800/50 px-6 py-4"
                                        style={{
                                            gridTemplateColumns: "1.4fr 1fr 0.8fr 0.8fr 0.8fr 0.9fr 0.8fr",
                                            opacity: 0, animation: `fadeIn .5s cubic-bezier(.16,1,.3,1) ${300 + i * 60}ms both`,
                                        }}
                                    >
                                        {/* Asset */}
                                        <div className="flex items-center gap-3">
                                            <div className="h-1.5 w-1.5 rounded-full flex-shrink-0" style={{ background: pos.color }} />
                                            <div>
                                                <div className="font-mono text-[11px] font-medium tracking-[0.12em] text-zinc-200">{pos.symbol}</div>
                                                <div className="font-mono text-[9px] tracking-wider text-zinc-700">{pos.name}</div>
                                            </div>
                                        </div>

                                        {/* Market Value */}
                                        <div className="font-mono text-[11px] tabular-nums text-zinc-100">
                                            {hasData ? `$${fmt(pos.mktVal)}` : "—"}
                                        </div>

                                        {/* Price */}
                                        <div className="font-mono text-[11px] tabular-nums text-zinc-300">
                                            {hasData ? `$${fmt(pos.price)}` : "—"}
                                        </div>

                                        {/* Change % */}
                                        <div
                                            className="font-mono text-[11px] tabular-nums"
                                            style={{ color: (pos.quote?.changePercent ?? 0) >= 0 ? "#E8FF47" : "#FF5757" }}
                                        >
                                            {hasData
                                                ? `${(pos.quote?.changePercent ?? 0) >= 0 ? "+" : ""}${(pos.quote?.changePercent ?? 0).toFixed(2)}%`
                                                : "—"}
                                        </div>

                                        {/* Qty */}
                                        <div className="font-mono text-[11px] tabular-nums text-zinc-500">{pos.qty}</div>

                                        {/* Avg Cost */}
                                        <div className="font-mono text-[11px] tabular-nums text-zinc-600">
                                            ${fmt(pos.avgCost)}
                                        </div>

                                        {/* P&L */}
                                        <div className="flex flex-col">
                                            <span
                                                className="font-mono text-[11px] tabular-nums font-medium"
                                                style={{ color: pos.pnl >= 0 ? "#E8FF47" : "#FF5757" }}
                                            >
                                                {hasData ? `${pos.pnl >= 0 ? "+" : ""}$${fmt(Math.abs(pos.pnl))}` : "—"}
                                            </span>
                                            <span
                                                className="font-mono text-[9px] tabular-nums"
                                                style={{ color: pos.pnl >= 0 ? "rgba(232,255,71,.5)" : "rgba(255,87,87,.5)" }}
                                            >
                                                {hasData ? `${pos.pnlPct >= 0 ? "+" : ""}${pos.pnlPct.toFixed(2)}%` : ""}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}

                            {/* Cash row */}
                            <div
                                className="row-hover grid items-center border-b border-zinc-800/50 px-6 py-4"
                                style={{
                                    gridTemplateColumns: "1.4fr 1fr 0.8fr 0.8fr 0.8fr 0.9fr 0.8fr",
                                    opacity: 0, animation: `fadeIn .5s cubic-bezier(.16,1,.3,1) ${300 + positions.length * 60}ms both`,
                                }}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="h-1.5 w-1.5 rounded-full flex-shrink-0" style={{ background: CASH_COLOR }} />
                                    <div>
                                        <div className="font-mono text-[11px] font-medium tracking-[0.12em] text-zinc-200">CASH</div>
                                        <div className="font-mono text-[9px] tracking-wider text-zinc-700">EUR Liquidity</div>
                                    </div>
                                </div>
                                <div className="font-mono text-[11px] tabular-nums text-zinc-100">${fmt(CASH_BALANCE)}</div>
                                <div className="font-mono text-[11px] text-zinc-700">1.0000</div>
                                <div className="font-mono text-[11px] text-zinc-700">0.00%</div>
                                <div className="font-mono text-[11px] tabular-nums text-zinc-500">{fmt(CASH_BALANCE, 0)}</div>
                                <div className="font-mono text-[11px] text-zinc-700">$1.00</div>
                                <div className="font-mono text-[11px] text-zinc-700">$0.00</div>
                            </div>

                            {/* Total row */}
                            <div
                                className="grid items-center bg-zinc-900/30 px-6 py-4"
                                style={{ gridTemplateColumns: "1.4fr 1fr 0.8fr 0.8fr 0.8fr 0.9fr 0.8fr" }}
                            >
                                <span className="font-mono text-[9px] tracking-[0.3em] text-zinc-500">TOTAL PORTFOLIO</span>
                                <span
                                    className="font-mono text-[11px] tabular-nums font-medium"
                                    style={{ color: "#FAFAF9" }}
                                >
                                    {fmtK(totalMktVal)}
                                </span>
                                <span />
                                <span
                                    className="font-mono text-[11px] tabular-nums"
                                    style={{ color: dayPnlPct >= 0 ? "#E8FF47" : "#FF5757" }}
                                >
                                    {dayPnlPct >= 0 ? "+" : ""}{dayPnlPct.toFixed(2)}%
                                </span>
                                <span />
                                <span />
                                <div>
                                    <span
                                        className="font-mono text-[11px] tabular-nums font-medium"
                                        style={{ color: totalPnl >= 0 ? "#E8FF47" : "#FF5757" }}
                                    >
                                        {totalPnl >= 0 ? "+" : ""}${fmt(Math.abs(totalPnl))}
                                    </span>
                                </div>
                            </div>

                            <div className="border-t border-zinc-800/50 px-6 py-3 flex items-center justify-between">
                                <span className="font-mono text-[9px] tracking-[0.2em] text-zinc-800">
                                    PRICES VIA YAHOO FINANCE · DATA MAY BE DELAYED UP TO 15 MIN
                                </span>
                                <div className="flex items-center gap-2">
                                    <div className="h-1 w-1 rounded-full bg-[#E8FF47]" style={{ animation: "pls 2s ease-in-out infinite" }} />
                                    <span className="font-mono text-[9px] tracking-[0.2em] text-zinc-800">LIVE FEED</span>
                                </div>
                            </div>
                        </div>

                        {/* ── MARKET OVERVIEW STRIP ── */}
                        <div className="mb-16">
                            <div className="mb-6 flex items-center gap-3">
                                <div className="h-px w-5 bg-[#E8FF47]" />
                                <span className="font-mono text-[9px] tracking-[0.42em] text-zinc-600">GLOBAL MARKETS</span>
                            </div>
                            <div className="grid grid-cols-2 gap-px bg-zinc-800 md:grid-cols-3 lg:grid-cols-6">
                                {INDEX_SYMBOLS.map((sym, i) => {
                                    const q = indices[sym];
                                    const label: Record<string, string> = {
                                        "^GSPC": "S&P 500", "^IXIC": "NASDAQ", "^DJI": "DOW",
                                        "^VIX": "VIX", "EURUSD=X": "EUR/USD", "BTC-USD": "BITCOIN",
                                    };
                                    const pos2 = (q?.changePercent ?? 0) >= 0;
                                    return (
                                        <div
                                            key={sym}
                                            className="card-hover bg-[#0d0d10] p-5 fade-in"
                                            style={{ animationDelay: `${500 + i * 60}ms` }}
                                        >
                                            <div className="mb-3 font-mono text-[8px] tracking-[0.35em] text-zinc-700">
                                                {label[sym] ?? sym}
                                            </div>
                                            <div
                                                className="font-mono text-base tabular-nums font-medium"
                                                style={{ color: "#FAFAF9" }}
                                            >
                                                {q?.price
                                                    ? q.price < 10
                                                        ? q.price.toFixed(4)
                                                        : q.price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                                                    : "—"}
                                            </div>
                                            <div
                                                className="mt-1 font-mono text-[10px] tabular-nums"
                                                style={{ color: pos2 ? "#E8FF47" : "#FF5757" }}
                                            >
                                                {q?.changePercent !== undefined
                                                    ? `${pos2 ? "+" : ""}${q.changePercent.toFixed(2)}%`
                                                    : "—"}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* FOOTER */}
            <footer className="border-t border-zinc-800 px-10 py-8 relative z-10">
                <div className="mx-auto flex max-w-screen-xl flex-col items-center justify-between gap-4 md:flex-row">
                    <div className="flex items-center gap-3">
                        <div className="flex h-4 w-4 items-center justify-center border border-[#E8FF47]">
                            <div className="h-1 w-1 bg-[#E8FF47]" />
                        </div>
                        <span className="font-mono text-[10px] tracking-[0.35em] text-zinc-600">FINTRACK</span>
                    </div>
                    <span className="font-mono text-[9px] tracking-[0.18em] text-zinc-800">
                        © 2026 FINTRACK WEALTH OS · DATA FOR INFORMATIONAL PURPOSES ONLY
                    </span>
                    <div className="flex gap-8">
                        {["PRIVACY", "TERMS", "SECURITY"].map((l) => (
                            <a key={l} href="#" className="font-mono text-[9px] tracking-[0.22em] text-zinc-700 transition-colors hover:text-zinc-400">
                                {l}
                            </a>
                        ))}
                    </div>
                </div>
            </footer>
        </div>
    );
}
