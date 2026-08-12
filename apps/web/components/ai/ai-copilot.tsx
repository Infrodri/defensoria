'use client';

import React, { useState, useRef, useEffect } from 'react';
import { fetchApi } from '@/lib/api';
import { Bot, Copy, RefreshCw, AlertTriangle, X, FileText, Send } from 'lucide-react';
import { toast } from 'sonner';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export function AiCopilot({
  caseId,
  context,
  isLegalRole,
}: {
  caseId?: string;
  context?: string;
  isLegalRole?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init-1',
      sender: 'assistant',
      text: '¡Hola! Soy el Copiloto de IA de este expediente. Puedes hacerme preguntas sobre los hechos del caso, informes, evidencias o consultar la normativa legal aplicable.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputText('');
    setLoading(true);

    try {
      let responseText = '';

      if (caseId) {
        // Chat contextualizado al expediente real
        const res = await fetchApi('/ai/chat-case', {
          method: 'POST',
          body: JSON.stringify({ message: query, caseId }),
        });
        responseText = res.response;
      } else {
        // Fallback a chat general si no hay caseId
        const res = await fetchApi('/ai/chat-general', {
          method: 'POST',
          body: JSON.stringify({ message: query }),
        });
        responseText = res.response;
      }

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (error: any) {
      toast.error('Error en consulta al Copiloto', { description: error.message });
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: `Error al procesar consulta: ${error.message || 'Error de conexión con el backend.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copiado al portapapeles');
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          backgroundColor: 'var(--bosque-profundo)',
          color: 'var(--papel)',
          border: 'none',
          borderRadius: '50%',
          width: '3.5rem',
          height: '3.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
          zIndex: 50,
        }}
        title="Copiloto de Expediente (IA Local)"
      >
        <Bot size={26} />
      </button>
    );
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '2rem',
        right: '2rem',
        width: '420px',
        height: '620px',
        backgroundColor: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        boxShadow: '0 12px 36px rgba(0,0,0,0.25)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 50,
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '0.875rem 1rem',
          backgroundColor: 'var(--bosque-profundo)',
          color: 'var(--papel)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.95rem' }}>
          <Bot size={22} />
          <div>
            <div>Copiloto del Expediente</div>
            <div style={{ fontSize: '0.7rem', opacity: 0.8, fontWeight: 400 }}>RAG Aislado (IA Local)</div>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          style={{ background: 'none', border: 'none', color: 'var(--papel)', cursor: 'pointer' }}
        >
          <X size={20} />
        </button>
      </div>

      {/* Quick Action Shortcuts */}
      <div style={{ padding: '0.5rem 0.75rem', backgroundColor: 'var(--muted)', display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border)' }}>
        {isLegalRole && (
          <button
            onClick={() => handleSend('Redactar un borrador de escrito o memorial legal para este expediente')}
            disabled={loading}
            style={{
              flex: 1, padding: '0.35rem 0.5rem', backgroundColor: 'var(--salvia)', color: 'white',
              border: 'none', borderRadius: '6px', cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', fontSize: '0.75rem', fontWeight: 600
            }}
          >
            <FileText size={14} /> Redactar Memorial
          </button>
        )}
        <button
          onClick={() => handleSend('Analizar los indicadores de riesgo presentes en la narrativa y evidencias de este expediente')}
          disabled={loading}
          style={{
            flex: 1, padding: '0.35rem 0.5rem', backgroundColor: 'var(--tierra-calida)', color: 'white',
            border: 'none', borderRadius: '6px', cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', fontSize: '0.75rem', fontWeight: 600
          }}
        >
          <AlertTriangle size={14} /> Evaluar Riesgo
        </button>
      </div>

      {/* Chat Messages */}
      <div style={{ flex: 1, padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.875rem', backgroundColor: 'var(--papel)' }}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start',
            }}
          >
            <div
              style={{
                maxWidth: '85%',
                padding: '0.75rem 0.875rem',
                borderRadius: msg.sender === 'user' ? '12px 12px 0 12px' : '12px 12px 12px 0',
                backgroundColor: msg.sender === 'user' ? 'var(--bosque-profundo)' : 'var(--card)',
                color: msg.sender === 'user' ? 'white' : 'var(--grafito)',
                border: msg.sender === 'assistant' ? '1px solid var(--border)' : 'none',
                fontSize: '0.85rem',
                lineHeight: 1.45,
                whiteSpace: 'pre-wrap',
                position: 'relative',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              }}
            >
              {msg.text}
              {msg.sender === 'assistant' && (
                <button
                  onClick={() => copyToClipboard(msg.text)}
                  style={{
                    position: 'absolute', top: '0.4rem', right: '0.4rem', background: 'none',
                    border: 'none', cursor: 'pointer', color: 'var(--bosque-profundo)', opacity: 0.6
                  }}
                  title="Copiar respuesta"
                >
                  <Copy size={14} />
                </button>
              )}
            </div>
            <span style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: '0.2rem', padding: '0 0.2rem' }}>
              {msg.timestamp}
            </span>
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--bosque-profundo)', fontSize: '0.8rem', padding: '0.5rem' }}>
            <RefreshCw size={16} className="animate-spin" />
            <span>Consultando RAG del expediente con Ollama...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <form
        onSubmit={(e) => { e.preventDefault(); handleSend(); }}
        style={{
          padding: '0.75rem',
          backgroundColor: 'var(--card)',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          gap: '0.5rem',
          alignItems: 'center',
        }}
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Escriba su consulta sobre el caso..."
          disabled={loading}
          style={{
            flex: 1,
            padding: '0.6rem 0.75rem',
            borderRadius: '6px',
            border: '1px solid var(--border)',
            fontSize: '0.85rem',
            outline: 'none',
          }}
        />
        <button
          type="submit"
          disabled={loading || !inputText.trim()}
          style={{
            padding: '0.6rem 0.75rem',
            backgroundColor: 'var(--bosque-profundo)',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: loading || !inputText.trim() ? 'not-allowed' : 'pointer',
            opacity: loading || !inputText.trim() ? 0.6 : 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}
