export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'APIキーが設定されていません' });

  const { spots, transport, days, people, arrivalPort, arrivalTime, departurePort, departureTime } = req.body;

  const prompt = `あなたは壱岐島専門の旅行プランナーです。以下の条件で現実的で楽しい旅程を提案してください。

条件:
- 到着: ${arrivalPort}（${arrivalTime}頃到着）
- 出発: ${departurePort}（最終出発 ${departureTime}）
- 選択スポット: ${spots.map(s => `${s.name}(所要${s.time}分,料金:${s.fee||'確認要'})`).join('、')}
- 移動手段: ${transport}
- 日数: ${days}
- 人数: ${people}名

重要なルール:
- 到着時刻から行動開始すること
- 最終日は${departureTime}までに出発港に戻ること（移動時間を考慮して余裕を持って）
- 宿泊がある場合はチェックインを17:00頃に設定すること
- スポット間の移動時間も考慮すること（レンタカーなら島内15〜25分程度）
- 現実的に回れるスポット数に絞ること

以下のJSONのみ返してください（余分なテキスト不要）:
{"summary":"プランの一言説明（25字以内）","totalTime":"行動可能時間","days":[{"day":1,"title":"テーマ（10字以内）","spots":[{"time":"09:00","name":"スポット名","detail":"ポイント（20字以内）","duration":"約XX分"}]}],"costs":{"transport":"移動費概算（1名）","admission":"入場料合計（1名）","meal":"食事代概算（1名）","total":"合計目安（${people}名分）"},"tips":"旅のコツ（40字以内）"}`;

  try {
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 8192 }
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
