
import { GoogleGenAI, Type } from "@google/genai";
import { Service, JobListing, Bid, BidAnalysisResponse, Profile } from '../types';

// Helper to get API key safely
const getApiKey = () => {
    const env = (import.meta as any).env || {};
    return env.VITE_GOOGLE_API_KEY || '';
};

export const getServiceSuggestion = async (projectDescription: string, services: Service[]): Promise<Service | null> => {
    try {
        const apiKey = getApiKey();
        if (!apiKey) throw new Error("Gemini API key not found.");
        
        const ai = new GoogleGenAI({ apiKey });
        const serviceList = services.map(s => `- ${s.name}: ${s.description}`).join('\n');
        const prompt = `
            Kullanıcının proje açıklamasına dayanarak aşağıdaki listeden en uygun geoteknik hizmeti seç. 
            Cevap olarak SADECE ve SADECE listedeki hizmetin tam adını döndür. Başka hiçbir ek metin veya açıklama ekleme. Örnek cevap: 'Forekazık'

            Proje Açıklaması: "${projectDescription}"

            Hizmet Listesi:
            ${serviceList}

            En Uygun Hizmetin Adı:
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        const suggestedServiceName = response.text.trim();
        
        const foundService = services.find(s => s.name.toLowerCase() === suggestedServiceName.toLowerCase());
        
        return foundService || null;

    } catch (error) {
        console.error("Error getting service suggestion from Gemini:", error);
        return null;
    }
};

export const getCostEstimation = async (projectDescription: string): Promise<string | null> => {
    try {
        const apiKey = getApiKey();
        if (!apiKey) throw new Error("Gemini API key not found.");

        const ai = new GoogleGenAI({ apiKey });
        const prompt = `
            Sen Türkiye'deki geoteknik mühendisliği projeleri için uzman bir AI maliyet tahmincisisin.
            Kullanıcının proje açıklamasına göre ön bir maliyet tahmini sağla.
            Cevabın Türkçe olmalı.

            ÖNEMLİ:
            - Bunun bağlayıcı bir teklif değil, kaba bir tahmin olduğunu açıkça belirt.
            - Olası bir maliyet aralığı ver (örn: 150.000 TL - 200.000 TL).
            - Ana maliyet kalemlerini (örn: mobilizasyon, malzemeler, işçilik, raporlama) ayırarak açıkla.
            - Maliyeti etkileyen faktörleri (örn: zemin koşulları, proje ölçeği, konum, gerekli makine parkı) açıkla.
            - Cevabı uzman olmayan birinin anlayabileceği şekilde kısa ve öz tut.

            Proje Açıklaması: "${projectDescription}"

            Tahminin:
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        return response.text;

    } catch (error) {
        console.error("Error getting cost estimation from Gemini:", error);
        return "Maliyet tahmini alınırken bir hata oluştu. Lütfen daha sonra tekrar deneyin.";
    }
};

export const getBidAnalysis = async (job: JobListing, bids: Bid[]): Promise<BidAnalysisResponse | null> => {
    try {
        const apiKey = getApiKey();
        if (!apiKey) throw new Error("Gemini API key not found.");

        const ai = new GoogleGenAI({ apiKey });
        const jobDetails = `İlan Başlığı: ${job.title}\nProje Detayları: ${job.details}`;
        const bidsDetails = bids.map(bid => `- Firma: ${bid.provider_name}, Teklif Tutarı: ${bid.amount} TL, Notlar: ${bid.notes || 'Yok'}`).join('\n');

        const prompt = `
            Bir müşteri için geoteknik mühendisliği projesi tekliflerini analiz eden bir uzmansın.
            Aşağıdaki iş detayı ve gelen teklifleri inceleyerek bir analiz ve tavsiye raporu oluştur.
            
            İş Detayları:
            ${jobDetails}

            Gelen Teklifler:
            ${bidsDetails}

            Lütfen aşağıdaki JSON formatında bir çıktı ver. Her teklif için artı eksi yönleri belirle. 'best_for' alanında o teklifin hangi açıdan en iyi olduğunu belirt (örn: "En düşük fiyat", "En detaylı açıklama", "Fiyat/Performans dengesi"). Genel bir tavsiyede bulun.
        `;

        const responseSchema = {
            type: Type.OBJECT,
            properties: {
                recommendation: {
                    type: Type.STRING,
                    description: "Tüm teklifleri değerlendiren genel bir özet ve tavsiye."
                },
                analysis: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            provider_name: { type: Type.STRING },
                            amount: { type: Type.NUMBER },
                            pros: { type: Type.ARRAY, items: { type: Type.STRING } },
                            cons: { type: Type.ARRAY, items: { type: Type.STRING } },
                            best_for: { type: Type.STRING }
                        },
                    },
                },
            },
        };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
            }
        });

        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as BidAnalysisResponse;
    } catch (error) {
        console.error("Error getting bid analysis from Gemini:", error);
        return null;
    }
};


export const continueChatToPost = async (messages: {role: 'user' | 'model', parts: {text: string}[]}[]) => {
     try {
        const apiKey = getApiKey();
        if (!apiKey) throw new Error("Gemini API key not found.");

        const ai = new GoogleGenAI({ apiKey });
        const responseSchema = {
             type: Type.OBJECT,
             properties: {
                 isComplete: { type: Type.BOOLEAN },
                 nextQuestion: { type: Type.STRING },
                 extractedData: {
                     type: Type.OBJECT,
                     properties: {
                         title: { type: Type.STRING },
                         details: { type: Type.STRING },
                         location: { type: Type.STRING },
                         budget: { type: Type.STRING },
                         quantity: { type: Type.STRING },
                         diameter: { type: Type.STRING },
                         depth: { type: Type.STRING },
                     }
                 }
             }
        };

        const systemInstruction = `Sen, kullanıcıların sohbet ederek iş ilanı oluşturmasına yardımcı olan bir asistansın. Amacın, bir geoteknik iş ilanı için gerekli olan şu bilgileri toplamaktır: title, details, location, budget, quantity, diameter, depth.
        Her seferinde sadece TEK BİR soru sor. Kullanıcının cevabına göre bir sonraki soruyu belirle. Tüm bilgiler toplandığında, 'isComplete' flag'ini true yap ve 'nextQuestion' olarak bir özet ve onay sorusu sor (örn: 'Harika, tüm bilgileri topladım. İlan başlığı: "...", Konum: "...". Bu bilgilerle ilan oluşturmaya devam edelim mi?').
        Eğer bilgi eksikse 'isComplete' false olmalı ve 'nextQuestion' bir sonraki sorun olmalı.
        Cevabını HER ZAMAN belirtilen JSON formatında ver.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [
                ...messages
            ],
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema: responseSchema,
            }
        });

        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Error in chat-to-post with Gemini:", error);
        return { isComplete: false, nextQuestion: 'Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin.', extractedData: {} };
    }
};

export const generateBidNotes = async (job: JobListing, profile: Profile): Promise<string> => {
     try {
        const apiKey = getApiKey();
        if (!apiKey) throw new Error("Gemini API key not found.");

        const ai = new GoogleGenAI({ apiKey });
        const prompt = `
            Sen, geoteknik firmaları için profesyonel ve ikna edici teklif notları yazan bir AI asistanısın.
            Aşağıdaki firma profili ve iş ilanı detaylarını kullanarak, müşteriyi etkileyecek, ilana özel bir teklif notu oluştur.
            Notun profesyonel, samimi ve güven verici olmalı. Firmanın güçlü yanlarını vurgula.
            
            FİRMA PROFİLİ:
            - Firma Adı: ${profile.company_name}
            - Uzmanlık Alanları: ${(profile.services_offered || []).join(', ')}
            - Tecrübe: ${profile.description || 'Sektörde deneyimli.'}

            İŞ İLANI:
            - Başlık: ${job.title}
            - Detaylar: ${job.details}

            Oluşturulacak Teklif Notu:
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        return response.text.trim();

    } catch (error) {
        console.error("Error generating bid notes from Gemini:", error);
        return "Teklifinizle ilgili detayları buraya ekleyebilirsiniz.";
    }
};
