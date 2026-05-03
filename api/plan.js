export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'APIキーが設定されていません' });

  const { spots, transport, days, people } = req.body;

  const prompt = `あなたは壱岐島専門の旅行プランナーです。以下の条件で旅程を提案してください。

条件:
- スポット: ${spots.map(s => `${s.name}(${s.area},${s.time}分,¥${s.fee})`).join('、')}
- 移動手段: ${transport}
- 日数: ${days}
- 人数: ${people}名

以下のJSONを返してください。JSONのみ、余分なテキストなし:
{"summary":"説明25字以内","totalTime":"合計時間","days":[{"day":1,"title":"テーマ","spots":[{"time":"09:00","name":"名前","detail":"メモ","duration":"時間"}]}],"costs":{"transport":"移動費","admission":"入場料","meal":"食事代","total":"合計"},"tips":"コツ"}`;

  try {
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { 
            temperature: 0.7, 
            maxOutputTokens: 8192,
          }
        })
      }
    );

    if (!geminiRes.ok) {
      const err = await geminiRes.json();
      return res.status(geminiRes.status).json({ error: err.error?.message || 'Gemini APIエラー' });
    }

    const data = await geminiRes.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const clean = text.replace(/```json|```/g, '').trim();
    const plan = JSON.parse(clean);
    res.status(200).json(plan);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
