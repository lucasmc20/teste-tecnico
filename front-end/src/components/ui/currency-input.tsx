'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface CurrencyInputProps {
  id?: string;
  name?: string;
  value: number;
  onChange: (value: number) => void;
  onBlur?: () => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

const formatDisplay = (value: number): string => {
  if (!Number.isFinite(value) || value <= 0) return '';
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

/**
 * Input de moeda BRL com máscara automática (ex: 1.234,56).
 * Armazena e emite valores numéricos; exibe string formatada.
 */
export const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ id, name, value, onChange, onBlur, placeholder = '0,00', className, disabled }, ref) => {
    const [display, setDisplay] = React.useState(() => formatDisplay(value));
    // flag para distinguir mudança do usuário vs reset externo do formulário
    const fromUserRef = React.useRef(false);

    React.useEffect(() => {
      if (fromUserRef.current) {
        fromUserRef.current = false;
        return;
      }
      setDisplay(formatDisplay(value));
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const digits = e.target.value.replace(/\D/g, '');
      const cents = parseInt(digits || '0', 10);
      const numValue = cents / 100;
      fromUserRef.current = true;
      onChange(numValue);
      setDisplay(digits ? formatDisplay(numValue) : '');
    };

    return (
      <input
        ref={ref}
        id={id}
        name={name}
        type="text"
        inputMode="numeric"
        placeholder={placeholder}
        value={display}
        onChange={handleChange}
        onBlur={onBlur}
        disabled={disabled}
        className={cn(
          'flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm ring-offset-background placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          className,
        )}
      />
    );
  },
);

CurrencyInput.displayName = 'CurrencyInput';
