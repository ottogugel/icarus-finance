import { useState, useEffect, createContext, useContext } from 'react';

export type CurrencyCode = 'BRL' | 'USD' | 'EUR';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  name: string;
  locale: string;
}

export const currencies: Record<CurrencyCode, CurrencyConfig> = {
  BRL: {
    code: 'BRL',
    symbol: 'R$',
    name: 'Real Brasileiro',
    locale: 'pt-BR',
  },
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'Dólar Americano',
    locale: 'en-US',
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    locale: 'de-DE',
  },
};

const CURRENCY_STORAGE_KEY = 'finance-app-currency';

export function useCurrency() {
  const [currency, setCurrencyState] = useState<CurrencyCode>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(CURRENCY_STORAGE_KEY);
      if (stored && (stored === 'BRL' || stored === 'USD' || stored === 'EUR')) {
        return stored as CurrencyCode;
      }
    }
    return 'BRL';
  });

  useEffect(() => {
    localStorage.setItem(CURRENCY_STORAGE_KEY, currency);
    // Dispatch event for other components to react
    window.dispatchEvent(new CustomEvent('currency-change', { detail: currency }));
  }, [currency]);

  const setCurrency = (code: CurrencyCode) => {
    setCurrencyState(code);
  };

  const formatCurrency = (value: number): string => {
    const config = currencies[currency];
    return new Intl.NumberFormat(config.locale, {
      style: 'currency',
      currency: config.code,
    }).format(value);
  };

  return {
    currency,
    setCurrency,
    formatCurrency,
    config: currencies[currency],
  };
}

// Global format function that reads from localStorage
export function formatCurrencyGlobal(value: number): string {
  let currencyCode: CurrencyCode = 'BRL';
  
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(CURRENCY_STORAGE_KEY);
    if (stored && (stored === 'BRL' || stored === 'USD' || stored === 'EUR')) {
      currencyCode = stored as CurrencyCode;
    }
  }
  
  const config = currencies[currencyCode];
  return new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: config.code,
  }).format(value);
}
