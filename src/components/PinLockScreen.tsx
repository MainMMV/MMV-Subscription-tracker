import { useState, useRef, useEffect, FormEvent, KeyboardEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, ShieldCheck, ArrowRight, AlertCircle, KeyRound } from 'lucide-react';
import { verifyObfuscatedPin, saveSessionUnlocked } from '../lib/security';

interface PinLockScreenProps {
  onUnlock: () => void;
}

export default function PinLockScreen({ onUnlock }: PinLockScreenProps) {
  const [pinDigits, setPinDigits] = useState<string[]>(['', '', '', '']);
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Focus first input box automatically
    inputRefs.current[0]?.focus();
  }, []);

  const handleDigitChange = async (index: number, val: string) => {
    // Only digits
    const cleaned = val.replace(/\D/g, '');
    if (!cleaned) {
      const next = [...pinDigits];
      next[index] = '';
      setPinDigits(next);
      return;
    }

    // If pasted multi-digit pin
    if (cleaned.length > 1) {
      const chars = cleaned.slice(0, 4).split('');
      const next = ['', '', '', ''];
      chars.forEach((c, i) => {
        next[i] = c;
      });
      setPinDigits(next);
      if (chars.length === 4) {
        await attemptVerify(next.join(''));
      } else {
        inputRefs.current[Math.min(chars.length, 3)]?.focus();
      }
      return;
    }

    const lastChar = cleaned.slice(-1);
    const next = [...pinDigits];
    next[index] = lastChar;
    setPinDigits(next);
    setError(null);

    // Auto-advance
    if (index < 3) {
      inputRefs.current[index + 1]?.focus();
    } else {
      // 4th digit entered
      const fullPin = next.join('');
      if (fullPin.length === 4) {
        await attemptVerify(fullPin);
      }
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !pinDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const attemptVerify = async (enteredPin: string) => {
    setIsVerifying(true);
    setError(null);

    const valid = await verifyObfuscatedPin(enteredPin);
    setIsVerifying(false);

    if (valid) {
      saveSessionUnlocked();
      onUnlock();
    } else {
      setError('Incorrect PIN. Please try again.');
      setPinDigits(['', '', '', '']);
      inputRefs.current[0]?.focus();
    }
  };

  const handleManualSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const fullPin = pinDigits.join('');
    if (fullPin.length !== 4) {
      setError('Please enter a 4-digit PIN');
      return;
    }
    await attemptVerify(fullPin);
  };

  return (
    <div className="min-h-screen bg-[#F6F8F6] flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Soft Ambient Blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] max-w-[500px] max-h-[500px] bg-[#EAF5EC] rounded-full blur-3xl opacity-60" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] max-w-[500px] max-h-[500px] bg-[#EFEAFE] rounded-full blur-3xl opacity-60" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 14, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="w-full max-w-sm bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-gray-200/50 border border-gray-100 flex flex-col items-center text-center"
      >
        {/* Lock Icon Emblem */}
        <div className="w-14 h-14 rounded-2xl bg-purple-50 border border-purple-100/80 flex items-center justify-center text-purple-600 mb-4 shadow-xs">
          <KeyRound size={26} strokeWidth={2.2} />
        </div>

        <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight mb-1">
          MMV Salary
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mb-6 font-medium">
          Enter 4-digit security code to access data
        </p>

        <form onSubmit={handleManualSubmit} className="w-full flex flex-col items-center">
          {/* 4 Digit Boxes */}
          <div className="flex items-center justify-center gap-2.5 sm:gap-3 mb-5">
            {pinDigits.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => (inputRefs.current[idx] = el)}
                id={`pin-input-${idx}`}
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={digit}
                disabled={isVerifying}
                onChange={(e) => handleDigitChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                className="w-12 h-14 sm:w-13 sm:h-15 text-center text-xl sm:text-2xl font-bold font-mono bg-gray-50 border border-gray-200/90 rounded-xl outline-none transition-all focus:border-purple-500 focus:bg-white focus:ring-3 focus:ring-purple-500/15 disabled:opacity-50 text-gray-900"
              />
            ))}
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-1.5 text-xs text-red-600 font-semibold mb-4 bg-red-50 px-3 py-1.5 rounded-lg border border-red-100"
              >
                <AlertCircle size={14} className="shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            id="pin-unlock-btn"
            type="submit"
            disabled={isVerifying || pinDigits.join('').length !== 4}
            className="w-full py-3 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 text-white text-sm font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
          >
            {isVerifying ? (
              <span className="text-xs">Verifying...</span>
            ) : (
              <>
                <span>Unlock MMV Salary</span>
                <ArrowRight size={15} />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 flex items-center gap-1.5 text-[11px] text-gray-400 font-medium">
          <ShieldCheck size={13} className="text-emerald-500" />
          <span>Real-time Cloud Sync Active</span>
        </div>
      </motion.div>
    </div>
  );
}
