import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Get Gemini API key from Supabase secrets
const geminiApiKey = Deno.env.get('GEMINI_API_KEY');

interface Merchant {
  rank: number;
  name: string;
  location: string;
  score: number;
  category: string;
  relevance?: string;
}

const defaultMerchants: Merchant[] = [
  { rank: 1, name: "Eco Mart KLCC", location: "KLCC", score: 98, category: "Sustainable Retail" },
  { rank: 2, name: "GreenTech KL Solutions", location: "Mont Kiara", score: 96, category: "Clean Technology" },
  { rank: 3, name: "Urban Farm Bangsar", location: "Bangsar", score: 94, category: "Organic Food" },
  { rank: 4, name: "Solar City Sdn Bhd", location: "Cheras", score: 92, category: "Renewable Energy" },
  { rank: 5, name: "KL Recycle Hub", location: "Wangsa Maju", score: 90, category: "Waste Management" },
  { rank: 6, name: "Artisan Craft Pavilion", location: "Bukit Bintang", score: 88, category: "Sustainable Crafts" },
  { rank: 7, name: "EcoRide KL", location: "Ampang", score: 86, category: "Green Transportation" },
  { rank: 8, name: "Bamboo Home KL", location: "Kepong", score: 84, category: "Eco-Furniture" },
  { rank: 9, name: "Clean Energy KL", location: "Sentul", score: 82, category: "Solar Solutions" },
  { rank: 10, name: "Sustainable Bites", location: "Mid Valley", score: 80, category: "Organic Food" }
];

async function searchWithGemini(query: string): Promise<Merchant[]> {
  try {
    const prompt = `You are an AI assistant helping users find sustainable merchants based on their shopping needs.

Given this user query: "${query}"

Available merchants:
${defaultMerchants.map(m => `${m.name} (${m.category}) - ESG Score: ${m.score}, Location: ${m.location}`).join('\n')}

Your task:
1. Identify which merchants are most relevant to the user's query
2. Provide a relevance explanation for each relevant merchant
3. Return the results ordered by ESG score (highest first)

Return ONLY a JSON array with this exact format:
[
  {
    "name": "Merchant Name",
    "location": "Location", 
    "score": 98,
    "category": "Category",
    "relevance": "Brief explanation of why this merchant matches the query"
  }
]

Important:
- Only include merchants that are actually relevant to the query
- If no merchants match, return an empty array []
- Always order by ESG score (highest first)
- Keep relevance explanations brief (max 10 words)
- Return valid JSON only, no other text`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.1,
            topK: 1,
            topP: 1,
            maxOutputTokens: 2048,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!text) {
      throw new Error('No response from Gemini');
    }

    // Parse JSON from Gemini response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('Invalid JSON in Gemini response');
    }

    const merchants = JSON.parse(jsonMatch[0]) as Merchant[];
    
    // Add rank numbers based on order
    return merchants.map((merchant, index) => ({
      ...merchant,
      rank: index + 1
    }));

  } catch (error) {
    console.error('Gemini search error:', error);
    throw error;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    if (!geminiApiKey) {
      throw new Error('Gemini API key not configured');
    }

    const { query } = await req.json()

    if (!query || typeof query !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Query is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Try AI search first, fallback to basic filtering
    let merchants: Merchant[] = [];
    
    try {
      merchants = await searchWithGemini(query);
    } catch (error) {
      console.error('AI search failed, using fallback:', error);
      
      // Fallback: Simple keyword matching
      const queryLower = query.toLowerCase();
      merchants = defaultMerchants
        .filter(merchant => {
          const searchText = `${merchant.name} ${merchant.category}`.toLowerCase();
          return queryLower.split(' ').some(keyword => 
            searchText.includes(keyword)
          );
        })
        .map((merchant, index) => ({
          ...merchant,
          rank: index + 1,
          relevance: "Matches your search criteria"
        }));
    }

    // If no matches found, return top 5 merchants
    if (merchants.length === 0) {
      merchants = defaultMerchants.slice(0, 5).map((merchant, index) => ({
        ...merchant,
        rank: index + 1,
        relevance: "Top ESG performer in the area"
      }));
    }

    return new Response(
      JSON.stringify({ merchants }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})