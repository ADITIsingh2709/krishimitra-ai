import { SupportedLanguage } from '@/types';
import { findNearbyKvkCenters } from '@/lib/kvk';
import { getWeatherData } from '@/lib/weather';
import { getScans } from '@/lib/db';

export interface ChatToolCall {
  name: string;
  args: any;
  result: any;
}

export interface ChatResponse {
  message: string;
  toolCalls?: ChatToolCall[];
}

// Agri-Advisory RAG Knowledge Base
const AGRI_RAG_KNOWLEDGE = `
[ICAR / KVK Advisory Knowledge Base]:
1. Wheat Cultivation (Rabi):
   - Sowing time: Nov 1 to Nov 25. Seed rate: 40-45 kg/acre.
   - Recommended high-yielding varieties: DBW 187 (Karan Vandana), DBW 222, DBW 303, HD 3086, PBW 725.
   - Critical irrigation stages: Crown Root Initiation (CRI) at 21 days after sowing, Tillering (40-45 DAS), Jointing (60-65 DAS), Flowering (80-85 DAS), and Milk stage (100-105 DAS).
   - Yellow Stripe Rust: Spray Propiconazole 25% EC @ 200 ml in 200L water/acre at first appearance.

2. Rice (Kharif):
   - Varieties: PR 126 (short duration 123 days), Pusa Basmati 1509, Pusa Basmati 1718.
   - Blast control: Tricyclazole 75% WP @ 120 g/acre.
   - Brown Plant Hopper (BPH): Triflumezopyrim 10% SC @ 94 ml/acre. Avoid excessive urea.

3. Cotton:
   - Pink Bollworm management: Pheromone traps @ 8/acre. Spray Chlorantraniliprole 18.5% SC @ 60 ml/acre or Emamectin Benzoate 5% SG @ 100g/acre.

4. Organic / Bio Solutions:
   - Jeevamrut preparation: 10 kg cow dung + 10L cow urine + 2kg jaggery + 2kg pulse flour + handful fertile bund soil in 200L water. Ferment 48h.
   - Neem oil spray: 1500 ppm @ 3 ml per Litre of water with mild soap emulsifier.

5. Government Schemes:
   - PM-KISAN: Rs. 6,000 per year in 3 equal installments of Rs. 2,000 directly into Aadhaar-linked bank accounts.
   - Pradhan Mantri Fasal Bima Yojana (PMFBY): Premium 2% for Kharif, 1.5% for Rabi, 5% for horticultural crops.
   - Soil Health Card Scheme: Free 12-parameter soil testing at local KVK/sub-divisional labs.
`;

// Tool implementations
export async function executeTool(name: string, args: any, farmerId?: string): Promise<any> {
  switch (name) {
    case 'get_nearby_kvk': {
      const location = args.location || 'Ludhiana';
      const centers = await findNearbyKvkCenters({ district: location, limit: 3 });
      return {
        queryLocation: location,
        centersFound: centers.map(c => ({
          name: c.name,
          type: c.type,
          district: c.district,
          phone: c.phone,
          address: c.address,
          services: c.services.slice(0, 3),
        })),
      };
    }

    case 'get_weather': {
      const location = args.location || 'Ludhiana';
      const weather = await getWeatherData(location);
      return {
        location: weather.city,
        tempC: weather.tempC,
        condition: weather.condition,
        humidity: weather.humidity,
        rainfallProbability: weather.rainfallProbability,
        alert: weather.alerts?.[0]?.description || 'No severe alerts active',
        farmingAdvice: weather.forecast[0]?.agriAdvice,
      };
    }

    case 'get_crop_recommendation': {
      const { soil_type, season, location } = args;
      const normalizedSoil = (soil_type || 'alluvial').toLowerCase();
      let recommendedCrops: string[] = [];
      let reason = '';

      if (normalizedSoil.includes('black')) {
        recommendedCrops = ['Cotton (Bt)', 'Soybean', 'Wheat', 'Gram / Chickpea', 'Sunflower'];
        reason = 'Black cotton soil has exceptional moisture retention, ideal for deep-rooted cotton, pulses and rabi wheat.';
      } else if (normalizedSoil.includes('red')) {
        recommendedCrops = ['Groundnut', 'Millets (Ragi/Bajra)', 'Maize', 'Red Gram (Pigeonpea)'];
        reason = 'Red soil is porous with good drainage; excellent for oilseeds and millets.';
      } else {
        recommendedCrops = ['Wheat (DBW 187/303)', 'Basmati Rice', 'Mustard (Pusa Bold)', 'Maize'];
        reason = 'Alluvial Indo-Gangetic loam is richly fertile with balanced nutrient dynamics suited for cereal-oilseed rotations.';
      }

      return {
        season: season || 'Current Rabi / Summer',
        soilType: soil_type || 'Alluvial',
        recommendedCrops,
        agronomicReason: reason,
        sowingAdvisory: 'Use certified seed with fungicide treatment (Trichoderma @ 5g/kg or Carbendazim @ 2g/kg seed).',
      };
    }

    case 'get_scan_history': {
      const scans = await getScans(farmerId || 'user_farmer_01');
      return {
        recentScans: scans.slice(0, 3).map(s => ({
          crop: s.crop,
          disease: s.diseaseDetected,
          confidence: s.confidence,
          date: new Date(s.createdAt).toLocaleDateString('en-IN'),
          status: s.status,
        })),
      };
    }

    default:
      return { error: `Tool ${name} not recognized.` };
  }
}

// Anthropic Chat completion with function calling & fallback
export async function generateChatResponse(params: {
  messages: { role: string; content: string }[];
  language: SupportedLanguage;
  farmerId?: string;
  farmerName?: string;
  farmerLocation?: string;
}): Promise<ChatResponse> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const userQuery = params.messages[params.messages.length - 1]?.content || '';
  const executedTools: ChatToolCall[] = [];

  // Determine needed tools through semantic keywords
  const queryLower = userQuery.toLowerCase();

  if (queryLower.includes('kvk') || queryLower.includes('केंद्र') || queryLower.includes('center') || queryLower.includes('phone') || queryLower.includes('नंबर') || queryLower.includes('contact')) {
    const toolRes = await executeTool('get_nearby_kvk', { location: params.farmerLocation || 'Ludhiana' });
    executedTools.push({ name: 'get_nearby_kvk', args: { location: params.farmerLocation || 'Ludhiana' }, result: toolRes });
  }

  if (queryLower.includes('weather') || queryLower.includes('मौसम') || queryLower.includes('rain') || queryLower.includes('बारिश') || queryLower.includes('तापमान') || queryLower.includes('हवा')) {
    const toolRes = await executeTool('get_weather', { location: params.farmerLocation || 'Ludhiana' });
    executedTools.push({ name: 'get_weather', args: { location: params.farmerLocation || 'Ludhiana' }, result: toolRes });
  }

  if (queryLower.includes('what to plant') || queryLower.includes('कौन सी फसल') || queryLower.includes('crop') || queryLower.includes('किस्म') || queryLower.includes('recommend') || queryLower.includes('बोएं') || queryLower.includes('variety')) {
    const toolRes = await executeTool('get_crop_recommendation', { soil_type: 'Alluvial', season: 'Rabi/Summer', location: params.farmerLocation || 'Ludhiana' });
    executedTools.push({ name: 'get_crop_recommendation', args: { soil_type: 'Alluvial', season: 'Rabi/Summer', location: params.farmerLocation || 'Ludhiana' }, result: toolRes });
  }

  if (queryLower.includes('history') || queryLower.includes('पिछली') || queryLower.includes('scan') || queryLower.includes('जांच')) {
    const toolRes = await executeTool('get_scan_history', {}, params.farmerId);
    executedTools.push({ name: 'get_scan_history', args: {}, result: toolRes });
  }

  // If Anthropic API key is provided and valid, call Claude 3.5 Sonnet
  if (apiKey && apiKey.startsWith('sk-ant-')) {
    try {
      const systemPrompt = `You are KrishiMitra AI, an empathetic, highly knowledgeable agricultural decision-support expert for Indian farmers.
You are grounded in ICAR (Indian Council of Agricultural Research), State Agricultural Universities (SAUs), and Krishi Vigyan Kendra (KVK) guidelines.
Always respond primarily in the farmer's selected language (${params.language}).
Advisory standards:
1. Always prioritize farmer safety and environmental health. Never recommend banned chemicals or unsafe pesticide overdoses.
2. Provide exact chemical dosages (e.g., '2.5 grams per Litre water' or '500g per 200L water per acre') along with the optimal spray time (early morning or late afternoon).
3. Always offer an organic / bio-control alternative (such as Trichoderma, Pseudomonas, Neem oil, or Jeevamrut).
4. Cite government schemes (PM-KISAN, PMFBY, KVK soil testing) when applicable.

RAG Knowledge Base Context:
${AGRI_RAG_KNOWLEDGE}

Tool Execution Context:
${JSON.stringify(executedTools, null, 2)}
`;

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 1024,
          system: systemPrompt,
          messages: params.messages.map(m => ({ role: m.role, content: m.content })),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const text = data.content?.[0]?.text;
        if (text) {
          return { message: text, toolCalls: executedTools };
        }
      }
    } catch (err) {
      console.warn('Anthropic API call failed, falling back to autonomous agro advisor:', err);
    }
  }

  // Autonomous ICAR-grounded Agronomist Fallback Engine (Runs instantaneously offline/demo)
  const lang = params.language;
  let reply = '';

  if (executedTools.some(t => t.name === 'get_nearby_kvk')) {
    const kvkTool = executedTools.find(t => t.name === 'get_nearby_kvk')?.result;
    const center = kvkTool?.centersFound?.[0];
    if (lang === 'hi') {
      reply = `नमस्ते किसान भाई! आपके निकटतम केंद्र की जानकारी:\n\n🏛️ **${center?.name || 'आईसीएआर कृषि विज्ञान केंद्र'}**\n📍 पता: ${center?.address || 'जिला मुख्यालय परिसर'}\n📞 संपर्क नंबर: **${center?.phone || '+91 161 2401960'}** (सीधे बात करने के लिए टैप करें)\n🌾 प्रमुख सेवाएं: मृदा परीक्षण (Soil Health Card), प्रमाणित बीज बिक्री, कीट निदान और आधुनिक कृषि यंत्र किराया।\n\nआप किसी भी कार्यदिवस में सुबह 9 बजे से शाम 5 बजे के बीच वहां जा सकते हैं।`;
    } else if (lang === 'pa') {
      reply = `ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ ਕਿਸਾਨ ਵੀਰ ਜੀ! ਤੁਹਾਡੇ ਨੇੜਲੇ ਕੇਂਦਰ ਦਾ ਵੇਰਵਾ:\n\n🏛️ **${center?.name || 'ਆਈਸੀਏਆਰ ਕ੍ਰਿਸ਼ੀ ਵਿਗਿਆਨ ਕੇਂਦਰ'}**\n📍 ਪਤਾ: ${center?.address || 'ਪੀਏਯੂ ਕੈਂਪਸ'}\n📞 ਫੋਨ ਨੰਬਰ: **${center?.phone || '+91 161 2401960'}**\n🌾 ਸੇਵਾਵਾਂ: ਮਿੱਟੀ ਪਰਖ, ਪ੍ਰਮਾਣਿਤ ਬੀਜ ਅਤੇ ਖੇਤੀ ਮਾਹਿਰਾਂ ਦੀ ਮੁਫ਼ਤ ਸਲਾਹ।`;
    } else if (lang === 'mr') {
      reply = `नमस्कार शेतकरी बंधूंनो! आपल्या जवळच्या कृषी विज्ञान केंद्राची माहिती:\n\n🏛️ **${center?.name}**\n📍 पत्ता: ${center?.address}\n📞 संपर्क क्रमांक: **${center?.phone}**\n🌾 सुविधा: माती व पाणी परीक्षण, प्रमाणित बियाणे, वनस्पती रोग चिकित्सालय।`;
    } else if (lang === 'ta') {
      reply = `வணக்கம் விவசாய தோழரே! உங்கள் அருகிலுள்ள வேளாண் மையத்தின் விவரம்:\n\n🏛️ **${center?.name}**\n📍 முகவரி: ${center?.address}\n📞 தொடர்பு எண்: **${center?.phone}**\n🌾 சேவைகள்: மண் பரிசோதனை, சான்று விதைகள் மற்றும் பயிர் பாதுகாப்பு ஆலோசனை.`;
    } else if (lang === 'te') {
      reply = `నమస్కారం రైతు సోదరా! మీ సమీప కృషి విజ్ఞాన కేంద్రం వివరాలు:\n\n🏛️ **${center?.name}**\n📍 చిరునామా: ${center?.address}\n📞 ఫోన్ నంబర్: **${center?.phone}**\n🌾 సేవలు: నేల పరీక్షలు, నాణ్యమైన విత్తనాలు మరియు శాస్త్రవేత్తల ఉచిత సలహాలు.`;
    } else {
      reply = `Hello Farmer! Here is your nearest research advisory center:\n\n🏛️ **${center?.name}**\n📍 Address: ${center?.address}\n📞 Direct Helpline: **${center?.phone}**\n🌾 Services: Soil & Water Testing, Certified Seeds, Plant Clinic, and Custom Equipment Hiring.`;
    }
    return { message: reply, toolCalls: executedTools };
  }

  if (executedTools.some(t => t.name === 'get_weather')) {
    const weather = executedTools.find(t => t.name === 'get_weather')?.result;
    if (lang === 'hi') {
      reply = `🌤️ **आपके क्षेत्र का मौसम एवं कृषि बुलेटिन:**\n- वर्तमान तापमान: **${weather.tempC}°C** (${weather.condition})\n- आर्द्रता: **${weather.humidity}%**, वर्षा की संभावना: **${weather.rainfallProbability}%**\n\n🌾 **कृषि सलाह:** ${weather.farmingAdvice}\n⚠️ **सावधानी:** तेज हवा या बारिश की संभावना होने पर किसी भी प्रकार का कीटनाशक छिड़काव टालें।`;
    } else if (lang === 'pa') {
      reply = `🌤️ **ਮੌਸਮ ਅਤੇ ਫਸਲੀ ਸਲਾਹ:**\n- ਤਾਪਮਾਨ: **${weather.tempC}°C** (${weather.condition})\n- ਨਮੀ: **${weather.humidity}%**, ਮੀਂਹ ਦਾ ਖਦਸ਼ਾ: **${weather.rainfallProbability}%**\n\n🌾 **ਸਲਾਹ:** ${weather.farmingAdvice}`;
    } else {
      reply = `🌤️ **Agro-Weather Advisory for ${weather.location}:**\n- Current Temperature: **${weather.tempC}°C** (${weather.condition})\n- Humidity: **${weather.humidity}%**, Rain Probability: **${weather.rainfallProbability}%**\n\n🌾 **Agronomic Recommendation:** ${weather.farmingAdvice}\n⚠️ **Precaution:** Avoid chemical spraying if rain is forecasted within 4 hours.`;
    }
    return { message: reply, toolCalls: executedTools };
  }

  if (executedTools.some(t => t.name === 'get_crop_recommendation')) {
    const cropTool = executedTools.find(t => t.name === 'get_crop_recommendation')?.result;
    if (lang === 'hi') {
      reply = `🌱 **आपकी मिट्टी और मौसम के अनुसार सर्वोत्तम फसल सिफारिश:**\n\n1. **अनुशंसित फसलें:** ${cropTool.recommendedCrops.join(', ')}\n2. **वैज्ञानिक कारण:** ${cropTool.agronomicReason}\n3. **बीज शोधन (Seed Treatment):** बुवाई से पहले बीजों को ट्राइकोडर्मा विरिडी (5 ग्राम/किग्रा) या कार्बेन्डाजिम (2 ग्राम/किग्रा) से अवश्य उपचारित करें ताकि जड़ सड़न और उकठा रोग से शत-प्रतिशत सुरक्षा मिल सके।`;
    } else {
      reply = `🌱 **Crop Recommendations for your Agro-Zone:**\n\n1. **Top Recommended Crops:** ${cropTool.recommendedCrops.join(', ')}\n2. **Scientific Rationale:** ${cropTool.agronomicReason}\n3. **Seed Treatment:** Treat seeds with Trichoderma viride @ 5g/kg seed before sowing to prevent soil-borne damping-off and root rot.`;
    }
    return { message: reply, toolCalls: executedTools };
  }

  // General grounded advisory response
  if (lang === 'hi') {
    reply = `राम-राम किसान भाई! मैंने आपका प्रश्न ध्यानपूर्वक पढ़ा है।\n\nकृषिमित्र सलाहकार मार्गदर्शन:\n1. **फसल स्वास्थ्य व पोषण:** पौधों की समुचित बढ़वार के लिए संतुलित नत्रजन, फास्फोरस व पोटाश (NPK) का प्रयोग मृदा स्वास्थ्य कार्ड की जांच रिपोर्ट अनुसार ही करें।\n2. **कीट-रोग प्रबंधन:** किसी भी रासायनिक कीटनाशक के छिड़काव में प्रति एकड़ कम से कम 150-200 लीटर स्वच्छ पानी का प्रयोग करें। तेज धूप में छिड़काव न करें; सुबह 7 से 10 बजे का समय सर्वोत्तम है।\n3. **जैविक विकल्प:** रोग प्रतिरोधक क्षमता बढ़ाने हेतु 15 दिनों के अंतराल पर जीवामृत (200 लीटर/एकड़) या 5% नीम अर्क का छिड़काव अत्यधिक लाभकारी सिद्ध होता है।\n\nआप अपनी फसल की पत्ती की फोटो भी स्कैन टैब में अपलोड कर सकते हैं, जिससे मैं तुरंत सटीक दवा और सही मात्रा बता सकूं!`;
  } else if (lang === 'pa') {
    reply = `ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ ਕਿਸਾਨ ਵੀਰ ਜੀ! ਖੇਤੀਬਾੜੀ ਸਲਾਹਕਾਰ ਸੁਝਾਅ:\n1. **ਖੁਰਾਕੀ ਤੱਤ:** ਖਾਦਾਂ ਦੀ ਵਰਤੋਂ ਹਮੇਸ਼ਾ ਮਿੱਟੀ ਪਰਖ ਰਿਪੋਰਟ ਦੇ ਆਧਾਰ 'ਤੇ ਹੀ ਕਰੋ। ਬੇਲੋੜਾ ਯੂਰੀਆ ਪਾਉਣ ਤੋਂ ਗੁਰੇਜ਼ ਕਰੋ ਤਾਂ ਜੋ ਬਿਮਾਰੀਆਂ ਤੋਂ ਬਚਾਅ ਰਹੇ।\n2. **ਸਪਰੇਅ ਦਾ ਤਰੀਕਾ:** ਸਪਰੇਅ ਹਮੇਸ਼ਾ ਸ਼ਾਂਤ ਮੌਸਮ ਵਿੱਚ ਸਵੇਰੇ ਵੇਲੇ ਕਰੋ। ਇੱਕ ਏਕੜ ਲਈ ਘੱਟੋ-ਘੱਟ 150-200 ਲੀਟਰ ਪਾਣੀ ਜ਼ਰੂਰੀ ਹੈ।\n3. **ਜੈਵਿਕ ਹੱਲ:** ਨਿੰਮ ਦਾ ਤੇਲ (3 ਮਿ.ਲੀ. ਪ੍ਰਤੀ ਲੀਟਰ ਪਾਣੀ) ਸ਼ੁਰੂਆਤੀ ਕੀੜਿਆਂ ਦੀ ਰੋਕਥਾਮ ਲਈ ਬਹੁਤ ਲਾਹੇਵੰਦ ਹੈ।\n\nਤੁਸੀਂ ਫਸਲ ਦੀ ਫੋਟੋ ਵੀ ਅਪਲੋਡ ਕਰਕੇ ਜਾਂਚ ਕਰਵਾ ਸਕਦੇ ਹੋ!`;
  } else if (lang === 'mr') {
    reply = `नमस्कार शेतकरी मित्रा! कृषिमित्र सल्लागार मार्गदर्शन:\n१. **संतुलित खत व्यवस्थापन:** माती परीक्षणानुसार रासायनिक खतांचा योग्य वापर करा. नत्राचा अतिवापर टाळा.\n२. **फवारणीची योग्य वेळ:** कीटकनाशकांची फवारणी नेहमी सकाळी किंवा संध्याकाळी ४ नंतर करावी. एका एकरासाठी किमान १५० ते २०० लिटर पाणी वापरावे.\n३. **सेंद्रिय उपाय:** ट्रायकोडर्मा किंवा निंबोळी अर्क ५% चा वापर केल्यास जमिनीतून पसरणाऱ्या बुरशीजन्य रोगांना चांगला आळा बसतो.`;
  } else if (lang === 'ta') {
    reply = `வணக்கம் விவசாய தோழரே! கிருஷிமித்ரா வேளாண் ஆலோசனை:\n1. **சரியான உர மேலாண்மை:** மண் பரிசோதனை அறிக்கையின்படி மட்டுமே NPK உரங்களை இடவும்.\n2. **மருந்து தெளிப்பு:** ஒரு ஏக்கருக்கு குறைந்தது 150-200 லிட்டர் தண்ணீர் பயன்படுத்த வேண்டும். காலையில் மருந்து தெளிப்பது சிறந்தது.\n3. **இயற்கை முறை:** வேப்ப எண்ணெய் (3 மிலி/லிட்டர்) பூச்சி தாக்குதலை ஆரம்பத்திலேயே கட்டுப்படுத்தும்.`;
  } else if (lang === 'te') {
    reply = `నమస్కారం రైతు మిత్రమా! కృషిమిత్ర వ్యవసాయ సూచనలు:\n1. **సమతుల్య ఎరువుల వాడకం:** నేల పరీక్ష ఆధారంగా మాత్రమే రసాయన ఎరువులను వాడండి.\n2. **పిచికారీ సమయం:** తెగుళ్ల మందులను ఎల్లప్పుడూ ఉదయం లేదా సాయంత్రం వేళల్లో మాత్రమే పిచికారీ చేయండి.\n3. **సేంద్రీయ పద్ధతులు:** వేప నూనె (3 మి.లీ. లీటరు నీటికి) పిచికారీ చేయడం వల్ల రసం పీల్చే పురుగుల నుంచి రక్షణ లభిస్తుంది.`;
  } else {
    reply = `Hello Farmer! Here is your ICAR-grounded agricultural advisory:\n\n1. **Nutrient Management:** Always apply fertilizers based on Soil Health Card recommendations. Avoid excessive nitrogen which promotes succulent vegetative growth prone to fungal attacks.\n2. **Spraying Best Practice:** Use at least 150-200 Litres of clean water per acre with a hollow cone or flood-jet nozzle. Spray during cool morning hours (7:00 AM - 10:00 AM).\n3. **Bio-Control Alternative:** Spray Trichoderma viride @ 5g/L or 5% Neem Seed Kernel Extract (NSKE) as an effective preventive measure.\n\nFeel free to snap a leaf photo in the 'Crop Scan' tab for immediate computerized disease diagnosis!`;
  }

  return { message: reply, toolCalls: executedTools };
}
