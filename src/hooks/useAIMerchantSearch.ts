import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Merchant {
  rank: number;
  name: string;
  location: string;
  score: number;
  category: string;
  relevance?: string;
}

interface SearchResults {
  merchants: Merchant[];
  searchQuery: string;
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

export const useAIMerchantSearch = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResults | null>(null);

  const searchMerchants = async (query: string): Promise<SearchResults> => {
    setLoading(true);
    try {
      // Call Supabase Edge Function for AI-powered search
      const { data, error } = await supabase.functions.invoke('ai-merchant-search', {
        body: { query }
      });

      if (error) {
        console.error('Edge function error:', error);
        // Fallback to keyword-based filtering
        return performFallbackSearch(query);
      }

      const searchResults = {
        merchants: data.merchants || [],
        searchQuery: query
      };

      setResults(searchResults);
      return searchResults;

    } catch (error) {
      console.error('Search error:', error);
      // Fallback to keyword-based filtering
      return performFallbackSearch(query);
    } finally {
      setLoading(false);
    }
  };

  const performFallbackSearch = (query: string): SearchResults => {
    const queryLower = query.toLowerCase();
    const keywords = queryLower.split(' ');
    
    // Score merchants based on keyword relevance
    const scoredMerchants = defaultMerchants.map(merchant => {
      let relevanceScore = 0;
      const searchableText = `${merchant.name} ${merchant.category} ${merchant.location}`.toLowerCase();
      
      keywords.forEach(keyword => {
        if (searchableText.includes(keyword)) {
          relevanceScore += 1;
        }
      });

      // Add category-specific scoring
      if (queryLower.includes('food') && merchant.category.toLowerCase().includes('food')) relevanceScore += 2;
      if (queryLower.includes('energy') && merchant.category.toLowerCase().includes('energy')) relevanceScore += 2;
      if (queryLower.includes('solar') && merchant.category.toLowerCase().includes('solar')) relevanceScore += 2;
      if (queryLower.includes('organic') && merchant.category.toLowerCase().includes('organic')) relevanceScore += 2;
      if (queryLower.includes('eco') && merchant.name.toLowerCase().includes('eco')) relevanceScore += 2;
      if (queryLower.includes('green') && merchant.name.toLowerCase().includes('green')) relevanceScore += 2;
      if (queryLower.includes('sustainable') && merchant.category.toLowerCase().includes('sustainable')) relevanceScore += 2;
      if (queryLower.includes('craft') && merchant.category.toLowerCase().includes('craft')) relevanceScore += 2;
      if (queryLower.includes('transport') && merchant.category.toLowerCase().includes('transport')) relevanceScore += 2;
      if (queryLower.includes('recycle') && merchant.name.toLowerCase().includes('recycle')) relevanceScore += 2;

      return {
        ...merchant,
        relevanceScore,
        relevance: relevanceScore > 0 ? getRelevanceReason(queryLower, merchant) : undefined
      };
    });

    // Filter merchants with relevance > 0, then sort by ESG score
    const filteredMerchants = scoredMerchants
      .filter(m => m.relevanceScore > 0)
      .sort((a, b) => {
        // First sort by relevance, then by ESG score
        if (a.relevanceScore !== b.relevanceScore) {
          return b.relevanceScore - a.relevanceScore;
        }
        return b.score - a.score;
      })
      .map((merchant, index) => ({
        rank: index + 1,
        name: merchant.name,
        location: merchant.location,
        score: merchant.score,
        category: merchant.category,
        relevance: merchant.relevance
      }));

    const searchResults = {
      merchants: filteredMerchants.length > 0 ? filteredMerchants : defaultMerchants.slice(0, 5),
      searchQuery: query
    };

    setResults(searchResults);
    return searchResults;
  };

  const getRelevanceReason = (query: string, merchant: Merchant): string => {
    if (query.includes('food') && merchant.category.toLowerCase().includes('food')) {
      return "Specializes in sustainable food products";
    }
    if (query.includes('energy') && merchant.category.toLowerCase().includes('energy')) {
      return "Provides clean energy solutions";
    }
    if (query.includes('solar') && merchant.category.toLowerCase().includes('solar')) {
      return "Offers solar energy systems";
    }
    if (query.includes('organic') && merchant.category.toLowerCase().includes('organic')) {
      return "Certified organic products";
    }
    if (query.includes('eco') && merchant.name.toLowerCase().includes('eco')) {
      return "Eco-friendly business practices";
    }
    if (query.includes('green') && merchant.name.toLowerCase().includes('green')) {
      return "Green technology solutions";
    }
    if (query.includes('sustainable') && merchant.category.toLowerCase().includes('sustainable')) {
      return "Sustainable business model";
    }
    return "Matches your search criteria";
  };

  const clearResults = () => {
    setResults(null);
  };

  return {
    searchMerchants,
    clearResults,
    loading,
    results
  };
};