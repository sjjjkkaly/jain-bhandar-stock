'use client';

import React, { useState } from 'react';
import { Lock, ArrowRight } from 'lucide-react';
import { MASTER_PIN, setAuth } from '@/lib/storage';

interface GatekeeperModalProps {
  onUnlock: () => void;
}

export const GatekeeperModal: React.FC<GatekeeperModalProps> = ({ onUnlock }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (pin.trim() === MASTER_PIN) {
      setAuth(true);
      setError(false);
      onUnlock();
    } else {
      setError(true);
      setPin('');
    }
  };

  const handleKey = (digit: string) => {
    if (pin.length < 6) {
      const nextPin = pin + digit;
      setPin(nextPin);
      setError(false);
      if (nextPin === MASTER_PIN) {
        setTimeout(() => {
          setAuth(true);
          onUnlock();
        }, 100);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden text-center p-6">
        <div className="w-12 h-12 bg-green-50 text-green-700 rounded-full flex items-center justify-center mx-auto mb-3">
          <Lock className="w-6 h-6" />
        </div>

        <h2 className="text-xl font-bold text-gray-900">Jain Bhandar</h2>
        <p className="text-xs text-gray-500 mt-1 mb-5">
          Enter password to access stock
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="password"
            autoFocus
            maxLength={6}
            placeholder="••••"
            value={pin}
            onChange={(e) => {
              setPin(e.target.value);
              setError(false);
            }}
            className={`w-44 mx-auto text-center tracking-[0.5em] text-2xl font-bold py-2.5 px-4 rounded-xl border-2 outline-none transition ${
              error
                ? 'border-red-500 bg-red-50 text-red-600'
                : 'border-gray-300 focus:border-green-600 text-gray-900'
            }`}
          />

          {error && (
            <p className="text-xs text-red-600 font-semibold mt-2">
              Incorrect password
            </p>
          )}

          {/* Keypad */}
          <div className="grid grid-cols-3 gap-2 max-w-[220px] mx-auto mt-5">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => handleKey(n)}
                className="h-11 rounded-lg bg-gray-50 hover:bg-green-50 text-gray-800 hover:text-green-800 font-bold text-lg border border-gray-200 transition active:scale-95"
              >
                {n}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setPin('')}
              className="h-11 rounded-lg bg-gray-50 text-gray-500 text-xs font-semibold border border-gray-200"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => handleKey('0')}
              className="h-11 rounded-lg bg-gray-50 hover:bg-green-50 text-gray-800 font-bold text-lg border border-gray-200 active:scale-95"
            >
              0
            </button>
            <button
              type="button"
              onClick={() => setPin((p) => p.slice(0, -1))}
              className="h-11 rounded-lg bg-gray-50 text-gray-500 text-xs font-semibold border border-gray-200"
            >
              DEL
            </button>
          </div>

          <button
            type="submit"
            className="w-full mt-5 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold text-sm rounded-xl transition flex items-center justify-center gap-1.5"
          >
            <span>Enter</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
