import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Loader2, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Merchant {
  rank: number;
  name: string;
  location: string;
  score: number;
  category: string;
  relevance?: string;
}

interface AISearchResults {
  merchants: Merchant[];
  searchQuery: string;
}

interface AIMerchantSearchProps {
  onResults: (results: AISearchResults) => void;
  loading: boolean;
}

export const AIMerchantSearch = ({ onResults, loading }: AIMerchantSearchProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Please enter a search query",
        description: "Tell us what you're looking to buy!",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('ai-merchant-search', {
        body: { query: searchQuery.trim() }
      });

      if (error) {
        throw new Error(error.message || 'Failed to search merchants');
      }

      onResults({
        merchants: data?.merchants || [],
        searchQuery: searchQuery.trim()
      });

    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Search failed",
        description: "Unable to search merchants. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) {
      handleSearch();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-2 text-primary">
          <Sparkles className="h-4 w-4" />
          <span className="text-sm font-medium">AI-Powered Search</span>
        </div>
      </div>
      
      <div className="flex space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="What are you looking to buy? (e.g., organic food, solar panels, sustainable clothing...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            className="pl-10"
            disabled={loading}
          />
        </div>
        <Button 
          onClick={handleSearch}
          disabled={loading || !searchQuery.trim()}
          className="whitespace-nowrap"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Searching...
            </>
          ) : (
            <>
              <Search className="h-4 w-4 mr-2" />
              Search
            </>
          )}
        </Button>
      </div>
      
      <p className="text-xs text-muted-foreground">
        Our AI will find sustainable merchants matching your needs, ranked by their ESG performance.
      </p>
    </div>
  );
};