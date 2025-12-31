import axios from 'axios';
import { axiosInstance } from './axios';

/**
 * Calculate final ranking via backend API
 * If sampleText is provided, it will query /chat/respond to get real ranking scores
 * @param {Object} scores { core, synonym_support, domain_support, application_support }
 * @param {Object} weights optional override weights
 * @param {string} sampleText optional text to search and calculate real ranking
 */
export async function calculateFinalRanking(scores, weights = {}, sampleText = '') {
  const client = axiosInstance || axios;

  // If sampleText is provided, query chat API to get real ranking from database
  if (sampleText && sampleText.trim()) {
    try {
      const chatResp = await client.post('/chat/respond', { message: sampleText.trim() });
      const chatData = chatResp.data;
      
      // Extract ranking from the best alternative if available
      if (chatData?.alternatives && chatData.alternatives.length > 0) {
        const best = chatData.alternatives[0];
        const fr = best.finalRanking || {};
        
        // Prefer backend-calculated weighted breakdown when available
        if (fr && fr.breakdown && typeof fr.breakdown === 'object') {
          const breakdown = {
            core: Number(fr.breakdown.core ?? 0),
            synonym_support: Number(fr.breakdown.synonym_support ?? 0),
            domain_support: Number(fr.breakdown.domain_support ?? 0),
            application_support: Number(fr.breakdown.application_support ?? 0),
          };
          const total = Object.values(breakdown).reduce((acc, v) => acc + v, 0);

          // Use weights returned by chat if present, otherwise fall back to provided/defaults
          const w = fr.weights ?? {
            core: Number(weights.core ?? 1.0),
            synonym_support: Number(weights.synonym_support ?? 0.95),
            domain_support: Number(weights.domain_support ?? 0.90),
            application_support: Number(weights.application_support ?? 0.20),
          };

          const chatScoreNum = Number(fr.score);
          const scoreStr = Number.isFinite(chatScoreNum) ? chatScoreNum.toFixed(3) : total.toFixed(3);

          return {
            total,
            breakdown,
            weights: w,
            textFactor: 1.0,
            notes: [`ค้นพบ: "${best.title || best.QuestionTitle || 'N/A'}"`, `Score จาก chat: ${scoreStr}`],
            matchedQuestion: best.title || best.QuestionTitle,
            chatAlternatives: chatData.alternatives.slice(0, 3),
          };
        }

        // If no breakdown present, fall back to manual calculation below
      } else {
        // No results found
        return {
          total: 0,
          breakdown: { core: 0, synonym_support: 0, domain_support: 0, application_support: 0 },
          weights,
          textFactor: 0,
          notes: ['ไม่พบคำตอบที่ตรงกับข้อความทดสอบ'],
        };
      }
    } catch (err) {
      console.error('Chat query failed:', err);
      // Fall through to manual calculation
    }
  }

  // Fallback: manual calculation with provided scores/weights
  const payload = { scores, weights, sampleText };
  const { data } = await client.post('/ranking/calculate', payload);
  let result = data?.result || null;

  if (result) {
    result = { ...result, textFactor: result.textFactor ?? 1.0, notes: result.notes || [] };
  }

  return result;
}

export async function getRankingWeights() {
  const client = axiosInstance || axios;
  const { data } = await client.get('/ranking/weights');
  return data?.weights;
}

export async function setRankingWeights(weights) {
  const client = axiosInstance || axios;
  // Debug: log outgoing request target to help diagnose 404/403 issues in dev
  if (import.meta && import.meta.env && import.meta.env.DEV) {
    const base = client?.defaults?.baseURL || '(no baseURL)';
    console.debug('[apiRanking] POST /ranking/weights', { baseURL: base, weights });
  }
  const { data } = await client.post('/ranking/weights', weights);
  return data;
}

export const apiRanking = {
  getRanking: async () => {
    const client = axiosInstance || axios;
    try {
      const { data } = await client.get('/categories');
      return { data };
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },
  getChatbotResponse: async (payload) => {
    const client = axiosInstance || axios;
    try {
      const { data } = await client.post('/chat/respond', payload);
      return data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },
};
