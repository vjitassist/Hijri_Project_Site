/**
 * CountdownTimer - Upcoming Islamic events with MAGHRIB-AWARE timing
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 * READS FROM: HijriContext (single source of truth)
 * ❌ NO INDEPENDENT CALCULATIONS ALLOWED
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * CRITICAL: Events are NIGHT-FIRST
 * - Countdowns lead to MAGHRIB when the Islamic event begins
 * - NOT to Gregorian midnight
 * - Example: "Eid night" begins at Maghrib, not midnight
 */

import { useHijri } from "@/contexts/HijriContext";
import { useEffect, useState } from "react";
import { Timer, ChevronRight, Sparkles, AlertCircle, Sunset } from "lucide-react";

interface CountdownState {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

interface CountdownProps {
  targetDate: Date;
  eventName: string;
  eventNameAr: string;
  description: string;
  index: number;
  isExpected: boolean;
}

function Countdown({ targetDate, eventName, eventNameAr, description, index, isExpected }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState<CountdownState>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const target = targetDate.getTime();
      const difference = target - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  const TimeUnit = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center">
      <div className="bg-primary/10 rounded-lg px-3 py-2 min-w-[52px] md:min-w-[60px]">
        <span className="countdown-digit text-xl md:text-2xl text-primary">
          {value.toString().padStart(2, "0")}
        </span>
      </div>
      <span className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wide">
        {label}
      </span>
    </div>
  );

  const isHighPriority = index === 0;

  return (
    <div 
      className={`glass-card rounded-xl p-5 text-center space-y-4 transition-all duration-300 hover:shadow-lg ${
        isHighPriority ? 'ring-2 ring-gold/30 bg-gold/5' : ''
      }`}
    >
      <div className="space-y-1">
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {isHighPriority && <Sparkles className="w-4 h-4 text-gold" />}
          <h3 className="font-display text-lg text-foreground">{eventName}</h3>
          {isExpected && (
            <span className="text-[10px] bg-gold/20 text-gold-dark px-1.5 py-0.5 rounded flex items-center gap-0.5">
              <AlertCircle className="w-2.5 h-2.5" />
              Expected
            </span>
          )}
        </div>
        <p className="text-sm font-display text-gold" dir="rtl">{eventNameAr}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
        <p className="text-[10px] text-amber-500 dark:text-amber-400 mt-1 italic">
          Expected date; may vary by ±1 day depending on moon sighting.
        </p>
      </div>
      
      <div className="flex justify-center gap-1.5 md:gap-2">
        <TimeUnit value={timeLeft.days} label="Days" />
        <span className="text-xl text-muted-foreground self-start pt-2">:</span>
        <TimeUnit value={timeLeft.hours} label="Hrs" />
        <span className="text-xl text-muted-foreground self-start pt-2">:</span>
        <TimeUnit value={timeLeft.minutes} label="Min" />
        <span className="text-xl text-muted-foreground self-start pt-2">:</span>
        <TimeUnit value={timeLeft.seconds} label="Sec" />
      </div>

      <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
        <Sunset className="w-3 h-3 text-gold" />
        <span>
          Begins at Maghrib • {targetDate.toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </span>
      </div>
    </div>
  );
}

export function CountdownTimer() {
  const { upcomingEvents, isExpected } = useHijri();

  if (upcomingEvents.length === 0) return null;

  return (
    <section className="animate-slide-up" style={{ animationDelay: "0.3s" }}>
      <div className="flex flex-col items-center mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Timer className="w-5 h-5 text-primary" />
          <h2 className="text-xl md:text-2xl font-display text-center text-foreground">
            Upcoming Events
          </h2>
        </div>
        <p className="text-xs text-muted-foreground text-center">
          🌙 Countdowns lead to Maghrib when the Islamic event begins (night-first)
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {upcomingEvents.map(({ event, gregorianDate }, index) => (
          <Countdown
            key={`${event.name}-${index}`}
            targetDate={gregorianDate}
            eventName={event.name}
            eventNameAr={event.nameAr}
            description={event.description}
            index={index}
            isExpected={isExpected}
          />
        ))}
      </div>
    </section>
  );
}
