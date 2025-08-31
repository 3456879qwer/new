import type { NextApiRequest, NextApiResponse } from 'next';


const MOCK_AI = process.env.MOCK_AI_RESPONSES === 'true';


const HUGGING_FACE_API_ENDPOINT = "https://router.huggingface.co/v1/chat/completions"; // Correct endpoint
const HF_TEXT_MODEL = "mistralai/Mistral-7B-Instruct-v0.2:featherless-ai"; // Correct model ID with deployment suffix
const HF_API_TOKEN = process.env.HF_API_TOKEN;


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { topic } = req.body;

  console.log('API Route (Hugging Face Hashtags): Request received for topic:', topic);

  if (!topic || topic.trim() === '') {
    return res.status(400).json({ message: 'Topic is required to generate hashtags.' });
  }


  if (MOCK_AI) {
    console.log('API Route (Hugging Face Hashtags): MOCK_AI_RESPONSES is true. Returning dummy hashtags.');
    const dummyHashtags = [
      `#HuggingFaceViral_${topic.replace(/\s/g, '_').substring(0, 10)}`,
      '#JayverseHF',
      '#OpenSourceAI',
      '#FreeTierMagic',
      '#ContentStrategy',
      '#DigitalMarketing',
      '#MemeTrends',
      '#GrowthHacking'
    ];
    for (let i = 0; i < 5; i++) {
        dummyHashtags.push(`#HFGen${Math.floor(Math.random() * 100)}`);
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
    return res.status(200).json({ hashtags: dummyHashtags });
  }


  if (!HF_API_TOKEN) {
    console.error('API Route (Hugging Face Hashtags): HF_API_TOKEN is not set in environment variables.');
    return res.status(500).json({ message: 'Server configuration error: Hugging Face API token missing.' });
  }

  try {
    console.log(`API Route (Hugging Face Hashtags): Calling HF Chat Completions API for model: ${HF_TEXT_MODEL}`);
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
            content: `Generate 10-15 highly relevant and viral TikTok hashtags for the topic: "${topic}".
            Include a mix of broad, niche, and trending hashtags.
            Format the output as a comma-separated list of hashtags, each starting with '#'. Do not include any explanations or extra text.`,
          },
        ],
        model: HF_TEXT_MODEL, 
        max_tokens: 150, 
        temperature: 0.7,
        stream: false,
      })
    });

    console.log(`API Route (Hugging Face Hashtags): HF API Response Status: ${response.status} ${response.statusText}`);
    

    const responseText = await response.text();
    console.log('API Route (Hugging Face Hashtags): HF API Raw Response Body:', responseText);

    if (!response.ok) { 
      let errorMessage = `HF API responded with status ${response.status} ${response.statusText}`;
      try {
        const errorJson = JSON.parse(responseText); 
        errorMessage = errorJson.error?.message || errorJson.detail || errorMessage; 
      } catch (parseError) {

      }
      throw new Error(errorMessage);
    }

    const data = JSON.parse(responseText); 
    const rawHashtags = data.choices?.[0]?.message?.content; 

    if (!rawHashtags) {
      console.error('API Route (Hugging Face Hashtags): HF returned no generated text from chat completions.');
      throw new Error("Could not generate hashtags from Hugging Face.");
    }



    const cleanRawHashtags = rawHashtags.split('[/INST]')?.[1]?.trim() || rawHashtags;


    console.log('API Route (Hugging Face Hashtags): Cleaned hashtags:', cleanRawHashtags);

    const hashtags = cleanRawHashtags
      .split(/[\s,]+/) 
      .map(tag => tag.trim())
      .filter(tag => tag !== '' && tag.startsWith('#'))
      .map(tag => tag.toLowerCase()); 

    const uniqueHashtags = Array.from(new Set(hashtags));
    console.log('API Route (Hugging Face Hashtags): Processed unique hashtags:', uniqueHashtags);

    res.status(200).json({ hashtags: uniqueHashtags });

  } catch (error: any) {
    console.error('API Route (Hugging Face Hashtags): Hugging Face API Error in catch block:', error.message);
    res.status(500).json({ message: `Failed to generate hashtags: ${error.message || 'Unknown error'}` });
  }
}