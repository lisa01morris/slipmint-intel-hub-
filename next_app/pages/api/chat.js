export default async function handler(req, res) {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message } = req.body;

    // Validate message input
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Validate API key
    if (!process.env.GEMINI_API_KEY) {
      console.error('Missing GEMINI_API_KEY environment variable');
      return res.status(500).json({ error: 'API configuration error' });
    }

    // System instruction for Nigerian market expertise
    const systemInstruction = "You are an expert real estate and business analyst specializing in the Nigerian market. Answer this query professionally: ";
    
    // Prepare the payload for Gemini API
    const payload = {
      contents: [
        {
          parts: [
            {
              text: systemInstruction + message
            }
          ]
        }
      ]
    };

    // Make request to Google Gemini API
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      }
    );

    if (!geminiResponse.ok) {
      const errorData = await geminiResponse.json();
      console.error('Gemini API error:', errorData);
      return res.status(geminiResponse.status).json({ 
        error: errorData.error?.message || 'Failed to get response from Gemini' 
      });
    }

    const data = await geminiResponse.json();

    // Extract text response safely
    const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!textContent) {
      return res.status(500).json({ error: 'No response generated' });
    }

    return res.status(200).json({ response: textContent });

  } catch (error) {
    console.error('Chat API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
