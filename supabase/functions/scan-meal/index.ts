import 'jsr:@supabase/functions-js/edge-runtime.d.ts';

const GEMINI_MODEL = 'gemini-2.5-flash';

const SYSTEM_PROMPT = `You are a Ghanaian food and nutrition expert with deep knowledge of traditional Ghanaian cuisine.
Identify every food item visible in the image, estimate realistic Ghanaian portion sizes, and return calories and macronutrients.
Return only a valid JSON array using this shape:
[{"name":"Banku","portion_g":400,"calories":412,"protein_g":9.6,"carbs_g":91.2,"fat_g":1.6,"confidence":0.92}]
Use confidence below 0.6 when identification is uncertain. Return [] when the image is not food.`;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('GEMINI_API_KEY');
    if (!apiKey) throw new Error('GEMINI_API_KEY is not configured');

    const { imageBase64, mimeType = 'image/jpeg' } = await request.json();
    if (!imageBase64 || typeof imageBase64 !== 'string') {
      return Response.json({ error: 'imageBase64 is required' }, { status: 400, headers: corsHeaders });
    }

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: [
            {
              parts: [
                { inline_data: { mime_type: mimeType, data: imageBase64 } },
                { text: 'Identify this meal and return its nutritional information.' },
              ],
            },
          ],
          generationConfig: {
            responseMimeType: 'application/json',
            maxOutputTokens: 1024,
          },
        }),
      }
    );

    if (!geminiResponse.ok) {
      throw new Error(`Gemini returned ${geminiResponse.status}`);
    }

    const payload = await geminiResponse.json();
    const text = payload?.candidates?.[0]?.content?.parts?.[0]?.text ?? '[]';
    const items = JSON.parse(text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim());

    return Response.json(Array.isArray(items) ? items : [], {
      headers: { ...corsHeaders, 'Cache-Control': 'no-store' },
    });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : 'Meal scan failed' },
      { status: 500, headers: corsHeaders }
    );
  }
});
