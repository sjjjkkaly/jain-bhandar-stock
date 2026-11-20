'use client';

import React, { useState } from 'react';
import { Lock, ShieldCheck, KeyRound, AlertCircle, ArrowRight } from 'lucide-react';
import { verifyPin, setAuthenticated } from '@/lib/storage';

interface GatekeeperModalProps {
  onUnlock: () => void;
}

export const GatekeeperModal: React.FC<GatekeeperModalProps> = ({ onUnlock }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (verifyPin(pin)) {
      setAuthenticated(true);
      setError(false);
      onUnlock();
    } else {
      setError(true);
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setPin('');
    }
  };

  const handleKeypadPress = (digit: string) => {
    if (pin.length < 6) {
      const nextPin = pin + digit;
      setPin(nextPin);
      setError(false);
      if (nextPin === '1326') {
        setTimeout(() => {
          setAuthenticated(true);
          onUnlock();
        }, 150);
      }
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
    setError(false);
  };

  const handleClear = () => {
    setPin('');
    setError(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
      <div
        className={`w-full max-w-md bg-white rounded-2xl shadow-2xl border border-amber-200 overflow-hidden transition-transform ${
          shake ? 'animate-bounce' : ''
        }`}
      >
        {/* Top Decorative Mandi Header */}
        <div className="bg-gradient-to-r from-amber-700 via-amber-600 to-amber-800 p-6 text-white text-center relative">
          <div className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-3 border border-white/20 shadow-inner">
            <Lock className="w-7 h-7 text-amber-200" />
          </div>
          <h2 className="text-2xl font-black tracking-wide uppercase">Jain Bhandar</h2>
          <p className="text-amber-100 text-xs font-medium tracking-wider uppercase mt-0.5">
            Wholesale Stock Management
          </p>
          <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-amber-900/40 rounded-full text-xs text-amber-200 border border-amber-500/30">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Authorized Access Only</span>
          </div>
        </div>

        {/* PIN Entry Area */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="text-center">
              <label htmlFor="pin-input" className="block text-sm font-semibold text-slate-700 mb-1">
                Enter Security PIN / Password
              </label>
              <p className="text-xs text-slate-500 mb-3">
                Please enter your 4-digit code to access stock data
              </p>

              {/* PIN Display Dots / Input */}
              <div className="relative max-w-[220px] mx-auto">
                <input
                  id="pin-input"
                  type="password"
                  value={pin}
                  onChange={(e) => {
                    setPin(e.target.value);
                    setError(false);
                  }}
                  maxLength={6}
                  autoFocus
                  placeholder="••••"
                  className={`w-full text-center tracking-[0.5em] text-2xl font-bold py-3 px-4 rounded-xl border-2 transition-all outline-none ${
                    error
                      ? 'border-red-500 bg-red-50 text-red-700 focus:ring-2 focus:ring-red-200'
                      : 'border-slate-300 focus:border-amber-500 focus:ring-4 focus:ring-amber-100 text-slate-800'
                  }`}
                />
              </div>

              {error && (
                <div className="mt-2 flex items-center justify-center gap-1.5 text-xs font-semibold text-red-600">
                  <AlertCircle className="w-4 h-4" />
                  <span>Incorrect code. Hint: 1326</span>
                </div>
              )}
            </div>

            {/* Quick Touch Keypad for Mobile & Tablets */}
            <div className="grid grid-cols-3 gap-2 max-w-[260px] mx-auto pt-2">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => handleKeypadPress(num)}
                  className="h-12 rounded-xl bg-slate-100 hover:bg-amber-100 hover:text-amber-900 active:scale-95 font-bold text-lg text-slate-700 transition flex items-center justify-center border border-slate-200 shadow-sm"
                >
                  {num}
                </button>
              ))}
              <button
                type="button"
                onClick={handleClear}
                className="h-12 rounded-xl bg-slate-100 hover:bg-red-100 hover:text-red-700 font-semibold text-xs text-slate-600 transition flex items-center justify-center border border-slate-200"
              >
                CLEAR
              </button>
              <button
                type="button"
                onClick={() => handleKeypadPress('0')}
                className="h-12 rounded-xl bg-slate-100 hover:bg-amber-100 hover:text-amber-900 active:scale-95 font-bold text-lg text-slate-700 transition flex items-center justify-center border border-slate-200 shadow-sm"
              >
                0
              </button>
              <button
                type="button"
                onClick={handleBackspace}
                className="h-12 rounded-xl bg-slate-100 hover:bg-amber-100 font-semibold text-xs text-slate-600 transition flex items-center justify-center border border-slate-200"
              >
                ⌫ DEL
              </button>
            </div>

            {/* Unlock Button */}
            <div className="pt-3">
              <button
                type="submit"
                className="w-full py-3 px-4 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold rounded-xl shadow-lg shadow-amber-600/30 flex items-center justify-center gap-2 active:scale-[0.99] transition"
              >
                <KeyRound className="w-5 h-5 text-amber-200" />
                <span>Unlock Stock Portal</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          </form>

          <div className="mt-4 text-center">
            <span className="text-[11px] text-slate-400">
              stock.jainbhandar.com • Master Gatekeeper Protection
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
