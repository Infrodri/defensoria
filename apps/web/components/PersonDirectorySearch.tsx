'use client';

import React, { useState, useEffect, useRef } from 'react';
import { fetchApi } from '@/lib/api';
import { Search, Loader2, User, FileText } from 'lucide-react';

export interface PersonDirectorySearchProps {
  onSelect?: (person: any) => void;
  onSelectPerson?: (person: any) => void;
  placeholder?: string;
  label?: string;
}

export function PersonDirectorySearch({
  onSelect,
  onSelectPerson,
  placeholder = 'Buscar persona por CI, nombres o apellidos...',
  label,
}: PersonDirectorySearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        let data: any[] = [];
        try {
          data = await fetchApi(`/persons/search?q=${encodeURIComponent(query.trim())}`);
        } catch {
          const res = await fetch(`/api/persons/search?q=${encodeURIComponent(query.trim())}`);
          if (res.ok) {
            data = await res.json();
          }
        }
        setResults(Array.isArray(data) ? data : []);
        setIsOpen(true);
      } catch (err) {
        console.error('Error fetching persons search:', err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (person: any) => {
    if (onSelect) onSelect(person);
    if (onSelectPerson) onSelectPerson(person);
    setQuery('');
    setResults([]);
    setIsOpen(false);
  };

  return (
    <div style={{ position: 'relative', width: '100%' }} ref={dropdownRef}>
      {label && (
        <label
          style={{
            display: 'block',
            fontSize: '0.75rem',
            fontWeight: 600,
            color: 'var(--grafito)',
            marginBottom: '0.375rem',
          }}
        >
          {label}
        </label>
      )}
      <div style={{ position: 'relative' }}>
        <Search
          size={16}
          style={{
            position: 'absolute',
            left: '0.75rem',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--salvia)',
            pointerEvents: 'none',
          }}
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true);
          }}
          style={{
            width: '100%',
            paddingLeft: '2.375rem',
            paddingRight: '2.375rem',
            paddingTop: '0.5rem',
            paddingBottom: '0.5rem',
            fontSize: '0.875rem',
            backgroundColor: 'var(--card)',
            color: 'var(--grafito)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            outline: 'none',
            boxSizing: 'border-box',
            transition: 'border-color 0.15s ease',
          }}
        />
        {loading && (
          <Loader2
            size={16}
            className="animate-spin"
            style={{
              position: 'absolute',
              right: '0.75rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--salvia)',
            }}
          />
        )}
      </div>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            zIndex: 50,
            marginTop: '0.25rem',
            width: '100%',
            backgroundColor: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.05)',
            maxHeight: '15rem',
            overflowY: 'auto',
          }}
        >
          {results.length === 0 ? (
            <div
              style={{
                padding: '0.75rem 1rem',
                fontSize: '0.8125rem',
                color: 'var(--grafito)',
                opacity: 0.7,
                textAlign: 'center',
              }}
            >
              No se encontraron coincidencias en el registro municipal
            </div>
          ) : (
            <ul style={{ listStyle: 'none', margin: 0, padding: '0.25rem 0' }}>
              {results.map((person, idx) => (
                <li
                  key={person.id || person.documentNumber || idx}
                  onClick={() => handleSelect(person)}
                  style={{
                    padding: '0.625rem 1rem',
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom: idx < results.length - 1 ? '1px solid oklch(0.95 0.01 90)' : 'none',
                    transition: 'background-color 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--papel)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <User size={16} color="var(--bosque-profundo)" />
                    <span style={{ fontWeight: 600, color: 'var(--bosque-profundo)' }}>
                      {person.firstName} {person.lastName}
                    </span>
                  </div>
                  {person.documentNumber && (
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: 'var(--bosque-profundo)',
                        backgroundColor: 'oklch(0.93 0.03 175)',
                        padding: '0.15rem 0.5rem',
                        borderRadius: '12px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                      }}
                    >
                      <FileText size={12} /> CI: {person.documentNumber}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default PersonDirectorySearch;
