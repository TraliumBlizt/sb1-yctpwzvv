import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface CountryBank {
  id: string;
  country: string;
  bank_name: string;
  account_name: string;
  account_number: string;
  bank_type: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useCountryBanks = (country?: string) => {
  const [banks, setBanks] = useState<CountryBank[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch initial banks data
    const fetchBanks = async () => {
      try {
        setIsLoading(true);
        setError(null);

        let query = supabase
          .from('country_banks')
          .select('*')
          .eq('is_active', true)
          .order('bank_name', { ascending: true });

        if (country) {
          query = query.eq('country', country);
        }

        const { data, error } = await query;

        if (error) throw error;
        setBanks(data || []);
      } catch (err) {
        console.error('Error fetching country banks:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch banks');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBanks();

    // Set up real-time subscription
    const subscription = supabase
      .channel('country-banks-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'country_banks',
          filter: country ? `country=eq.${country}` : undefined
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newBank = payload.new as CountryBank;
            if (newBank.is_active && (!country || newBank.country === country)) {
              setBanks(prev => [...prev, newBank].sort((a, b) => a.bank_name.localeCompare(b.bank_name)));
            }
          } else if (payload.eventType === 'UPDATE') {
            const updatedBank = payload.new as CountryBank;
            setBanks(prev => {
              const filtered = prev.filter(bank => bank.id !== updatedBank.id);
              if (updatedBank.is_active && (!country || updatedBank.country === country)) {
                return [...filtered, updatedBank].sort((a, b) => a.bank_name.localeCompare(b.bank_name));
              }
              return filtered;
            });
          } else if (payload.eventType === 'DELETE') {
            setBanks(prev => prev.filter(bank => bank.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [country]);

  const getCountries = () => {
    const countries = [...new Set(banks.map(bank => bank.country))];
    return countries.sort();
  };

  const getBanksByCountry = (selectedCountry: string) => {
    return banks.filter(bank => bank.country === selectedCountry && bank.is_active);
  };

  return {
    banks,
    isLoading,
    error,
    getCountries,
    getBanksByCountry
  };
};