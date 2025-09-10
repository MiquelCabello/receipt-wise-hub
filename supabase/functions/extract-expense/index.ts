import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ExpenseExtraction {
  vendor: string;
  expense_date: string;
  amount_gross: number;
  tax_vat: number;
  amount_net: number;
  currency: string;
  category_suggestion: string;
  payment_method_guess: string;
  project_code_guess: string | null;
  notes: string | null;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      console.error('GEMINI_API_KEY is not set');
      return new Response(JSON.stringify({ error: 'AI service not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get the authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error('Authentication error:', userError);
      return new Response(JSON.stringify({ error: 'Authentication failed' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return new Response(JSON.stringify({ error: 'No file provided' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Validate file type and size
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      return new Response(JSON.stringify({ error: 'Invalid file type. Only JPG, PNG, and PDF are allowed.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return new Response(JSON.stringify({ error: 'File too large. Maximum size is 10MB.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Convert file to base64
    const arrayBuffer = await file.arrayBuffer();
    const base64Data = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

    console.log('Processing file:', file.name, 'Type:', file.type, 'Size:', file.size);

    // Prepare Gemini API request
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${geminiApiKey}`;
    
    const systemInstruction = `Eres un sistema experto financiero. Extrae campos de un ticket de gasto empresarial. 
Devuelve estrictamente JSON con el esquema solicitado; no añadas texto fuera del JSON. 
Usa formato decimal con punto (no comas). 
Categoriza en: Viajes, Dietas, Material, Software, Transporte, Alojamiento u Otros. 
Prioriza fecha del ticket; si hay varias, usa la de compra.
Si no puedes encontrar un campo, usa valores por defecto razonables.
Para el método de pago, intenta determinar si fue tarjeta, efectivo, transferencia u otro basándote en el contexto del ticket.`;

    const responseSchema = {
      type: "object",
      properties: {
        vendor: { type: "string" },
        expense_date: { type: "string", pattern: "^\\d{4}-\\d{2}-\\d{2}$" },
        amount_gross: { type: "number" },
        tax_vat: { type: "number" },
        amount_net: { type: "number" },
        currency: { type: "string" },
        category_suggestion: { 
          type: "string",
          enum: ["Viajes", "Dietas", "Material", "Software", "Transporte", "Alojamiento", "Otros"]
        },
        payment_method_guess: { 
          type: "string",
          enum: ["CARD", "CASH", "TRANSFER", "OTHER"]
        },
        project_code_guess: { type: "string" },
        notes: { type: "string" }
      },
      required: ["vendor", "expense_date", "amount_gross", "tax_vat", "amount_net", "currency", "category_suggestion", "payment_method_guess"]
    };

    const geminiPayload = {
      contents: [{
        parts: [
          { text: systemInstruction },
          {
            inlineData: {
              mimeType: file.type,
              data: base64Data
            }
          }
        ]
      }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema
      }
    };

    console.log('Calling Gemini API...');
    
    const geminiResponse = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(geminiPayload)
    });

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error('Gemini API error:', geminiResponse.status, errorText);
      return new Response(JSON.stringify({ 
        error: 'AI analysis failed', 
        details: `API returned ${geminiResponse.status}` 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const geminiResult = await geminiResponse.json();
    console.log('Gemini API response:', JSON.stringify(geminiResult, null, 2));

    if (!geminiResult.candidates || geminiResult.candidates.length === 0) {
      console.error('No candidates in Gemini response');
      return new Response(JSON.stringify({ error: 'AI analysis produced no results' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const candidate = geminiResult.candidates[0];
    if (!candidate.content || !candidate.content.parts || candidate.content.parts.length === 0) {
      console.error('No content in Gemini candidate');
      return new Response(JSON.stringify({ error: 'AI analysis produced invalid results' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    let extractedData: ExpenseExtraction;
    try {
      const textContent = candidate.content.parts[0].text;
      extractedData = JSON.parse(textContent);
    } catch (parseError) {
      console.error('Failed to parse Gemini response as JSON:', parseError);
      return new Response(JSON.stringify({ error: 'AI analysis produced invalid JSON' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Validate and clean the extracted data
    const cleanedData: ExpenseExtraction = {
      vendor: (extractedData.vendor || 'Comercio desconocido').trim(),
      expense_date: extractedData.expense_date || new Date().toISOString().split('T')[0],
      amount_gross: Number(extractedData.amount_gross) || 0,
      tax_vat: Number(extractedData.tax_vat) || 0,
      amount_net: Number(extractedData.amount_net) || 0,
      currency: extractedData.currency || 'EUR',
      category_suggestion: extractedData.category_suggestion || 'Otros',
      payment_method_guess: extractedData.payment_method_guess || 'OTHER',
      project_code_guess: extractedData.project_code_guess || null,
      notes: extractedData.notes || null
    };

    // Financial coherence check
    const calculatedGross = cleanedData.amount_net + cleanedData.tax_vat;
    const difference = Math.abs(calculatedGross - cleanedData.amount_gross);
    
    if (difference > 0.01) {
      console.warn(`Financial incoherence detected: net (${cleanedData.amount_net}) + vat (${cleanedData.tax_vat}) = ${calculatedGross}, but gross is ${cleanedData.amount_gross}`);
      // Adjust amount_net to make it coherent
      cleanedData.amount_net = cleanedData.amount_gross - cleanedData.tax_vat;
    }

    // Round to 2 decimal places
    cleanedData.amount_gross = Math.round(cleanedData.amount_gross * 100) / 100;
    cleanedData.tax_vat = Math.round(cleanedData.tax_vat * 100) / 100;
    cleanedData.amount_net = Math.round(cleanedData.amount_net * 100) / 100;

    console.log('Cleaned extracted data:', cleanedData);

    return new Response(JSON.stringify({
      success: true,
      data: cleanedData
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in extract-expense function:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});