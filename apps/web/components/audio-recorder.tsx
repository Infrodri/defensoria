'use client';

import { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Trash2 } from 'lucide-react';

interface AudioRecorderProps {
  onRecordingComplete: (blob: Blob, duration: number) => void;
}

export function AudioRecorder({ onRecordingComplete }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Try different MIME types for better compatibility
      let mimeType = 'audio/webm;codecs=opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'audio/webm';
      }
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'audio/mp4';
      }
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = '';
      }

      const mediaRecorder = new MediaRecorder(stream, mimeType ? { mimeType } : {});

      chunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mediaRecorder.mimeType });
        setRecordedBlob(blob);
        onRecordingComplete(blob, duration);

        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
      setDuration(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setDuration((d) => d + 1);
      }, 1000);
    } catch (err: any) {
      setError(
        err.name === 'NotAllowedError'
          ? 'Permiso de micrófono denegado. Habilita el acceso a micrófono en la configuración del navegador.'
          : 'No se pudo acceder al micrófono. Verifica permisos y que tu navegador sea compatible.'
      );
      console.error('Microphone error:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const playRecording = () => {
    if (recordedBlob) {
      const url = URL.createObjectURL(recordedBlob);
      const audio = new Audio(url);
      audio.play();
    }
  };

  const discardRecording = () => {
    setRecordedBlob(null);
    setDuration(0);
  };

  return (
    <div className="space-y-3 p-4 border rounded-lg bg-gray-50">
      {error && (
        <div
          style={{
            padding: '0.75rem',
            backgroundColor: 'oklch(0.95 0.05 28)',
            color: 'var(--riesgo-alto)',
            borderRadius: 'var(--radius)',
            fontSize: '0.875rem',
          }}
        >
          ⚠️ {error}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isRecording && (
            <div className="animate-pulse">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            </div>
          )}
          <span className="font-mono text-sm">{formatTime(duration)}</span>
        </div>

        <div className="flex gap-2">
          {!isRecording ? (
            <button
              onClick={startRecording}
              className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
              style={{ fontWeight: 600, border: 'none', cursor: 'pointer' }}
            >
              <Mic size={16} /> Grabar
            </button>
          ) : (
            <button
              onClick={stopRecording}
              className="flex items-center gap-2 px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
              style={{ fontWeight: 600, border: 'none', cursor: 'pointer' }}
            >
              <Square size={16} /> Detener
            </button>
          )}
        </div>
      </div>

      {recordedBlob && (
        <div className="space-y-2 pt-2 border-t">
          <div className="text-sm text-gray-600">
            ✅ Grabación: {(recordedBlob.size / 1024).toFixed(2)} KB · {formatTime(duration)}
          </div>
          <div className="flex gap-2">
            <button
              onClick={playRecording}
              className="flex items-center gap-1 text-sm px-2 py-1 border rounded hover:bg-gray-100"
              style={{ fontWeight: 600, cursor: 'pointer', backgroundColor: 'white' }}
            >
              <Play size={14} /> Reproducir
            </button>
            <button
              onClick={discardRecording}
              className="flex items-center gap-1 text-sm px-2 py-1 text-red-600 border border-red-200 rounded hover:bg-red-50"
              style={{ fontWeight: 600, cursor: 'pointer', backgroundColor: 'white' }}
            >
              <Trash2 size={14} /> Descartar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
