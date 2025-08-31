import type { NextApiRequest, NextApiResponse } from 'next';


const MOCK_AI = process.env.MOCK_AI_RESPONSES === 'true';


const HUGGING_FACE_API_ENDPOINT = "https://router.huggingface.co/v1/chat/completions"; 
const HF_TEXT_MODEL = "mistralai/Mistral-7B-Instruct-v0.2:featherless-ai"; 
const HF_API_TOKEN = process.env.HF_API_TOKEN;


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { imageDescriptionText, style } = req.body; 

  console.log('API Route (Hugging Face Caption): Request received. Style:', style, 'Description:', imageDescriptionText);

  if (!imageDescriptionText || imageDescriptionText.trim() === '') {
    console.error('API Route (Hugging Face Caption): Image description text is required.');
    return res.status(400).json({ message: 'A text description of the image is required.' });
  }


  if (MOCK_AI) {
    console.log('API Route (Hugging Face Caption): MOCK_AI_RESPONSES is true. Returning dummy captions.');
    const dummyCaptions = [
      `Mock Caption 1 (HF): The scene depicts a digital dream. (${style})`,
      'Mock Caption 2 (HF): Pixels and passion.',
      'Mock Caption 3 (HF): Where AI meets creativity.',
      'Mock Caption 4 (HF): Crafting the future, one byte at a time.',
      'Mock Caption 5 (HF): Your vision, powered by open source.'
    ];
    await new Promise(resolve => setTimeout(resolve, 1500));
    return res.status(200).json({ captions: dummyCaptions });
  }


  if (!HF_API_TOKEN) {
    console.error('API Route (Hugging Face Caption): HF_API_TOKEN is not set in environment variables.');
    return res.status(500).json({ message: 'Server configuration error: Hugging Face API token missing.' });
  }

  try {
    console.log(`API Route (Hugging Face Caption): Calling HF Chat Completions API for model: ${HF_TEXT_MODEL}`);
    let prompt = `Generate 5 unique and engaging social media captions based on the following image description: "${imageDescriptionText}".
    Focus on visual detail, mood, and potential viral appeal.
    `;

    switch (style) {
      case 'funny': prompt += " Make them funny, witty, and relatable. Use emojis appropriate for humor."; break;
      case 'deep': prompt += " Make them thoughtful, inspiring, or reflective. Use emojis that convey depth."; break;
      case 'savage': prompt += " Make them bold, confident, and a bit edgy. Use emojis that convey attitude."; break;
      case 'creative': prompt += " Make them imaginative, unique, and artistic. Use creative and expressive emojis."; break;
      default: prompt += " Make them engaging and suitable for a general audience. Include relevant emojis and hashtags. Vary the length.";
    }
    prompt += "\n\nFormat the output as a numbered list (1-5) of captions.";


    const response = await fetch(HUGGING_FACE_API_ENDPOINT, { 
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${HF_API_TOKEN}`
      },
      body: JSON.stringify({

        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        model: HF_TEXT_MODEL, 
        max_tokens: 300, 
        temperature: 0.7,
        stream: false,
      })
    });

    console.log(`API Route (Hugging Face Caption): HF API Response Status: ${response.status} ${response.statusText}`);
    const responseText = await response.text();
    console.log('API Route (Hugging Face Caption): HF API Raw Response Body:', responseText);

    if (!response.ok) {
      let errorMessage = `HF API responded with status ${response.status} ${response.statusText}`;
      try {
        const errorJson = JSON.parse(responseText);
        errorMessage = errorJson.error?.message || errorJson.detail || errorMessage;
      } catch (parseError) { }
      throw new Error(errorMessage);
    }

    const data = JSON.parse(responseText);
    const rawCaptions = data.choices?.[0]?.message?.content; 

    if (!rawCaptions) {
      console.error('API Route (Hugging Face Caption): HF returned no generated text from chat completions.');
      throw new Error("Could not generate captions from Hugging Face.");
    }


    const cleanRawCaptions = rawCaptions.split('[/INST]')?.[1]?.trim() || rawCaptions;

    console.log('API Route (Hugging Face Caption): Cleaned captions received:', cleanRawCaptions);

    const captions = cleanRawCaptions.split('\n').filter(line => line.match(/^\d+\./)).map(line => line.replace(/^\d+\.\s*/, '').trim());
    res.status(200).json({ captions });

  } catch (error: any) {
    console.error('API Route (Hugging Face Caption): Hugging Face API Error in catch block:', error.message);
    res.status(500).json({ message: `Failed to generate captions: ${error.message || 'Unknown error'}` });
  }
}