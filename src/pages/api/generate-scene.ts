import type { NextApiRequest, NextApiResponse } from 'next';


const MOCK_AI = process.env.MOCK_AI_RESPONSES === 'true';


const HUGGING_FACE_API_ENDPOINT = "https://router.huggingface.co/together/v1/images/generations"; 
const HF_IMAGE_MODEL = "black-forest-labs/FLUX.1-dev"; 
const HF_API_TOKEN = process.env.HF_API_TOKEN;


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { scriptDescription } = req.body;

  console.log('API Route (Hugging Face Scene): Request received for description:', scriptDescription);

  if (!scriptDescription || scriptDescription.trim() === '') {
    return res.status(400).json({ message: 'Script description is required to generate a scene.' });
  }


  if (MOCK_AI) {
    console.log('API Route (Hugging Face Scene): MOCK_AI_RESPONSES is true. Returning dummy image URL.');
    const dummyImageUrl = 'https://via.placeholder.com/600x400/0000FF/FFFFFF?text=Mock+Scene+from+HF';
    await new Promise(resolve => setTimeout(resolve, 2000));
    return res.status(200).json({ imageUrl: dummyImageUrl });
  }


  if (!HF_API_TOKEN) {
    console.error('API Route (Hugging Face Scene): HF_API_TOKEN is not set in environment variables.');
    return res.status(500).json({ message: 'Server configuration error: Hugging Face API token missing.' });
  }

  try {
    console.log(`API Route (Hugging Face Scene): Calling HF Together API for model: ${HF_IMAGE_MODEL}`);
    
    const response = await fetch(HUGGING_FACE_API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${HF_API_TOKEN}`
      },
      body: JSON.stringify({
        prompt: scriptDescription,
        response_format: "base64", 
        model: HF_IMAGE_MODEL,
      })
    });

    console.log(`API Route (Hugging Face Scene): HF Image API Response Status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Route (Hugging Face Scene): HF Image API Raw Error Response:', errorText);
      let errorMessage = `HF Image API responded with status ${response.status} ${response.statusText}`;
      try {
        const errorJson = JSON.parse(errorText); 
        errorMessage = errorJson.error || errorJson.message || errorJson.detail || errorMessage; 
      } catch (parseError) {
        // Not a JSON error, use the raw text
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log('API Route (Hugging Face Scene): Raw JSON response data from HF:', data); 


    const imageBase64 = data.generations?.[0]?.image; 

    if (!imageBase64) {
      console.error('API Route (Hugging Face Scene): HF returned no base64 image data in expected path.');
      console.error('API Route (Hugging Face Scene): Full response data was:', JSON.stringify(data, null, 2));
      throw new Error("Could not generate image from Hugging Face: Missing b64_json in response.");
    }

    const imageUrl = `data:image/jpeg;base64,${imageBase64}`; 
    console.log('API Route (Hugging Face Scene): Image generated and converted to Data URL.');

    res.status(200).json({ imageUrl: imageUrl });

  } catch (error: any) {
    console.error('API Route (Hugging Face Scene): Hugging Face API Error:', error.message);
    res.status(500).json({ message: `Failed to generate scene: ${error.message || 'Unknown error'}` });
  }
}