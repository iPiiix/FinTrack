import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

/* ─────────────────────────────────────────────
   Strategy: Yahoo Finance v8 spark endpoint (no cookie needed)
   Fallback: v7/finance/quote with a fresh crumb
────────────────────────────────────────────── */

const HEADERS = {
    "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    Accept: "application/json, text/plain, */*",
    "Accept-Language": "en-US,en;q=0.9",
    Origin: "https://finance.yahoo.com",
    Referer: "https://finance.yahoo.com/",
};

/* ── Primary: v8 chart 1d range gives us last close + % change ── */
async function fetchViaChart(symbols: string[]) {
    const results: QuoteResult[] = [];

    await Promise.allSettled(
        symbols.map(async (sym) => {
            try {
                const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(sym)}?interval=1d&range=5d`;
                const res = await fetch(url, { headers: HEADERS, next: { revalidate: 0 } });
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const json = await res.json();
                const meta = json?.chart?.result?.[0]?.meta;
                if (!meta) throw new Error("no meta");

                const price = meta.regularMarketPrice ?? meta.previousClose ?? 0;
                const prevClose = meta.chartPreviousClose ?? meta.previousClose ?? price;
                const change = price - prevClose;
                const changePct = prevClose > 0 ? (change / prevClose) * 100 : 0;

                results.push({
                    symbol: sym,
                    name: meta.longName ?? meta.shortName ?? sym,
                    price,
                    change,
                    changePercent: changePct,
                    prevClose,
                    volume: meta.regularMarketVolume ?? 0,
                    low52: meta.fiftyTwoWeekLow ?? 0,
                    high52: meta.fiftyTwoWeekHigh ?? 0,
                    currency: meta.currency ?? "USD",
                    marketCap: 0,
                });
            } catch (e) {
                console.error(`[chart] ${sym}:`, e);
            }
        })
    );

    return results;
}

/* ── Fallback: v7 quote endpoint (may return 401 in some regions) ── */
async function fetchViaQuote(symbols: string[]) {
    const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbols.map(encodeURIComponent).join(",")}&fields=regularMarketPrice,regularMarketChange,regularMarketChangePercent,regularMarketPreviousClose,shortName,currency,regularMarketVolume,fiftyTwoWeekLow,fiftyTwoWeekHigh`;
    const res = await fetch(url, { headers: HEADERS, next: { revalidate: 0 } });
    if (!res.ok) throw new Error(`v7/quote HTTP ${res.status}`);
    const json = await res.json();
    return (json?.quoteResponse?.result ?? []).map(
        (q: Record<string, number | string>) => ({
            symbol: q.symbol as string,
            name: (q.shortName ?? q.symbol) as string,
            price: (q.regularMarketPrice as number) ?? 0,
            change: (q.regularMarketChange as number) ?? 0,
            changePercent: (q.regularMarketChangePercent as number) ?? 0,
            prevClose: (q.regularMarketPreviousClose as number) ?? 0,
            volume: (q.regularMarketVolume as number) ?? 0,
            low52: (q.fiftyTwoWeekLow as number) ?? 0,
            high52: (q.fiftyTwoWeekHigh as number) ?? 0,
            currency: (q.currency as string) ?? "USD",
            marketCap: 0,
        })
    ) as QuoteResult[];
}

interface QuoteResult {
    symbol: string; name: string; price: number; change: number;
    changePercent: number; prevClose: number; volume: number;
    low52: number; high52: number; currency: string; marketCap: number;
    error?: boolean;
}

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const raw = searchParams.get("symbols") ?? "";
    const symbols = raw.split(",").map((s) => s.trim()).filter(Boolean);

    if (!symbols.length)
        return NextResponse.json({ error: "No symbols provided" }, { status: 400 });

    // Try chart endpoint first (most reliable, no auth needed)
    let quotes = await fetchViaChart(symbols);

    // For any symbols that failed in chart, try v7/quote
    const fetched = new Set(quotes.map((q) => q.symbol));
    const missing = symbols.filter((s) => !fetched.has(s));
    if (missing.length) {
        try {
            const extra = await fetchViaQuote(missing);
            quotes = [...quotes, ...extra];
        } catch (e) {
            console.error("[v7/quote fallback]", e);
        }
    }

    // For any still-missing symbols, add stubs
    const allFetched = new Set(quotes.map((q) => q.symbol));
    for (const sym of symbols) {
        if (!allFetched.has(sym)) {
            quotes.push({ symbol: sym, name: sym, price: 0, change: 0, changePercent: 0, prevClose: 0, volume: 0, low52: 0, high52: 0, currency: "USD", marketCap: 0, error: true });
        }
    }

    return NextResponse.json({ quotes, ts: Date.now() });
}
