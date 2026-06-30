import { NextRequest } from 'next/server';
import { ok, err, withAuth } from '@/lib/api';
import { getDb } from '@/lib/db';

export const runtime = 'nodejs';

export const GET = withAuth(async (req: NextRequest, user) => {
  if (!user.api_key) {
    return err('API Key required', 402);
  }

  const db = getDb();
  const cuentas = db.prepare('SELECT nombre, balance FROM cuentas WHERE activa = 1 AND usuario_id = ?').all(user.id);
  const totalNetWorth = cuentas.reduce((sum: number, c: any) => sum + (c.balance || 0), 0);

  const transacciones = db.prepare(`
    SELECT t.cantidad, t.tipo, c.nombre as categoria
    FROM transacciones t
    LEFT JOIN categorias c ON t.categoria_id = c.id
    WHERE t.cuenta_id IN (SELECT id FROM cuentas WHERE usuario_id = ?)
    ORDER BY t.fecha DESC LIMIT 50
  `).all(user.id);

  let income = 0;
  let expenses = 0;
  for (const t of transacciones as any[]) {
    if (t.tipo === 'ingreso') income += t.cantidad;
    if (t.tipo === 'gasto') expenses += t.cantidad;
  }

  const prompt = `
Eres un analista financiero experto de FinTrack.
Analiza la siguiente información de patrimonio y transacciones del usuario.
Patrimonio Total: €${totalNetWorth}
Total Ingresos (recientes): €${income}
Total Gastos (recientes): €${expenses}

Detalles de cuentas:
${JSON.stringify(cuentas)}

Transacciones recientes:
${JSON.stringify(transacciones)}

Instrucciones IMPORTANTES: Responde ÚNICAMENTE con un objeto JSON válido con este formato, sin markdown ni explicaciones adicionales:
{
  "data_source": "ai",
  "projected_net_worth": número estimado para el próximo mes asumiendo la tendencia actual,
  "projected_change": cambio numérico (+ o -) estimado,
  "savings_rate": número (porcentaje de ahorro),
  "recommendations": [
    { "type": "positive"|"warning"|"negative", "title": "...", "message": "..." }
  ],
  "anomalies": [
    { "message": "Gasto inusual en X", "amount": 100 } // opcional si detectas alguna anomalía importante
  ]
}
`;

  try {
    let resultJsonStr = "";
    
    if (user.ai_provider === 'openai') {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.api_key}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.2
        })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error.message);
      resultJsonStr = data.choices[0].message.content;
    } else if (user.ai_provider === 'anthropic') {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': user.api_key,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307',
          max_tokens: 1024,
          messages: [{ role: 'user', content: prompt }]
        })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error.message);
      resultJsonStr = data.content[0].text;
    } else if (user.ai_provider === 'gemini') {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${user.api_key}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error.message);
      resultJsonStr = data.candidates[0].content.parts[0].text;
    }

    resultJsonStr = resultJsonStr.replace(/```json/g, '').replace(/```/g, '').trim();
    const insights = JSON.parse(resultJsonStr);
    insights.data_source = user.ai_provider;

    return ok(insights);
  } catch (e: any) {
    console.error("AI Insights Error:", e);
    return err(e.message || 'Error processing AI insights', 500);
  }
});
