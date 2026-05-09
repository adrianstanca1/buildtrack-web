'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FilterOption {
  value: string;
  label: string;
}

interface FilterDropdownProps {
  label: string;
  options: FilterOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function FilterDropdown({
  label,
  options,
  value,
  onChange,
  className,
}: FilterDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedLabel = options.find((o) => o.value === value)?.label || label;

  return (
    <div ref={ref} className={`relative ${className || ''}`}>
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          'flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm transition-colors',
          value
            ? 'border-blue-300 bg-blue-50 text-blue-700'
            : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
        )}
      >
        <span>{selectedLabel}</span>
        <ChevronDown
          className={cn('h-4 w-4 transition-transform', open && 'rotate-180')}
        />
      </button>

      {open && (
        <div className="absolute z-20 mt-1 w-full min-w-[160px] rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
          <button
            onClick={() => {
              onChange('');
              setOpen(false);
            }}
            className={cn(
              'flex w-full items-center justify-between px-3 py-2 text-sm hover:bg-gray-50',
              !value && 'text-blue-600 font-medium'
            )}
          >
            All
            {!value && <Check className="h-4 w-4" />}
          </button>
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
              className={cn(
                'flex w-full items-center justify-between px-3 py-2 text-sm hover:bg-gray-50',
                value === option.value && 'text-blue-600 font-medium'
              )}
            >
              {option.label}
              {value === option.value && <Check className="h-4 w-4" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
