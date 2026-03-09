"use client";

// Number formatter
export const fmt = (n: number, d = 2) => Math.abs(n).toLocaleString("es-ES", { minimumFractionDigits: d, maximumFractionDigits: d });

// Grouping by month for charts
export const MONTHS = ["ENE","FEB","MAR","ABR","MAY","JUN","JUL","AGO","SEP","OCT","NOV","DIC"];

export function groupByMonth(transactions: any[]) {
  const now = new Date();
  const labels = [];
  const flows = [];
  const nets = [];
  for (let i = 7; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
    labels.push(MONTHS[d.getMonth()]);
    const monthTxs = transactions.filter(t => t.fecha && t.fecha.startsWith(key));
    const flow = monthTxs.reduce((s, t) => s + (t.tipo === "ingreso" ? Math.abs(t.cantidad) : -Math.abs(t.cantidad)), 0);
    flows.push(Math.round(flow));
    nets.push(0);
  }
  let running = 0;
  flows.forEach((f, i) => { running += f; nets[i] = running; });
  return { labels, flows, nets };
}

export function groupByCategory(transactions: any[], categorias: any[]) {
  const expenses = transactions.filter(t => t.tipo === "gasto");
  const grouped: Record<number, number> = {};
  
  expenses.forEach(t => {
    const cid = t.id_categoria || 0;
    grouped[cid] = (grouped[cid] || 0) + Math.abs(t.cantidad);
  });
  
  const result = Object.entries(grouped)
    .map(([cid, total]) => {
      const cat = categorias.find(c => c.id_categoria === parseInt(cid));
      return { id: cid, name: cat ? cat.nombre : "Sin categoría", total };
    })
    .sort((a, b) => b.total - a.total);
    
  return {
    catLabels: result.map(r => r.name),
    catData: result.map(r => r.total),
    catDetails: result
  };
}

// Chart.js lazy load
let ChartJS: any = null;
export const loadChart = () => {
  if (typeof window !== "undefined" && !ChartJS) {
    return import("chart.js/auto").then(m => { ChartJS = m.default || m; return ChartJS; }).catch(() => null);
  }
  return Promise.resolve(ChartJS);
};
