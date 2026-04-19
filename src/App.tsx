import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Wind, 
  Droplets, 
  Gauge, 
  ChevronRight, 
  Maximize2, 
  Target, 
  Zap, 
  Settings,
  Rocket,
  Info
} from 'lucide-react';
import { cn } from './lib/utils';
import { simulateRocket, RocketParams, SimulationResult } from './lib/physics';
import { RocketPlot } from './components/RocketPlot';

// --- CONFIGURATION ---
const DEFAULT_PARAMS: RocketParams = {
  waterVolumeMl: 660,
  pressurePsi: 65,
  angleDeg: 45,
  bottleVolumeL: 2.0,
  nozzleDiameterMm: 21.5,
  bottleDiameterMm: 100,
  dryMassKg: 0.15,
  dragCoeff: 0.3,
};

// --- COMPONENTS ---

const Card = ({ children, className, title, icon: Icon }: { children: React.ReactNode; className?: string; title?: string; icon?: any }) => (
  <div className={cn("bg-panel border border-border-tool rounded-sm p-5 relative overflow-hidden shadow-xl", className)}>
    {title && (
      <div className="flex items-center justify-between mb-4 border-b border-border-tool pb-2">
        <h3 className="text-[10px] uppercase tracking-[0.2em] text-accent-green font-mono font-bold flex items-center gap-2">
          {Icon && <Icon size={12} />}
          {title}
        </h3>
        <div className="w-1.5 h-1.5 bg-accent-green rounded-full shadow-[0_0_8px_rgba(0,255,102,0.6)] animate-pulse" />
      </div>
    )}
    {children}
  </div>
);

const Metric = ({ label, value, unit, icon: Icon, color = "text-accent-green" }: { label: string; value: string | number; unit: string; icon: any; color?: string }) => (
  <div className="flex-1 min-w-[140px] p-4 bg-white/[0.02] border-l-2 border-accent-green">
    <div className="text-[9px] uppercase tracking-widest text-text-tool-muted font-mono font-bold mb-1">{label}</div>
    <div className="flex items-baseline gap-1">
      <span className={cn("text-2xl font-mono font-bold tracking-tighter", color)}>{value}</span>
      <span className="text-[10px] text-text-tool-muted font-mono uppercase">{unit}</span>
    </div>
  </div>
);

const SliderControl = ({ label, value, min, max, step, onChange, icon: Icon, unit }: { 
  label: string; 
  value: number; 
  min: number; 
  max: number; 
  step: number; 
  onChange: (v: number) => void; 
  icon: any;
  unit: string;
}) => (
  <div className="space-y-2 mb-5">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-text-tool-muted">
        <span className="text-[10px] uppercase tracking-widest font-mono font-bold">{label}</span>
      </div>
      <div className="text-accent-green font-mono text-[11px] tabular-nums">
        {value} <span className="text-[9px] opacity-40 uppercase">{unit}</span>
      </div>
    </div>
    <div className="relative h-4 flex items-center">
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="specialist-slider w-full h-[3px] bg-border-tool rounded-none appearance-none cursor-pointer accent-accent-green hover:accent-accent-green transition-all"
      />
    </div>
  </div>
);

export default function App() {
  const [params, setParams] = useState<RocketParams>(DEFAULT_PARAMS);
  const [showSettings, setShowSettings] = useState(false);

  const result: SimulationResult = useMemo(() => simulateRocket(params), [params]);

  const updateParam = (key: keyof RocketParams, val: number) => {
    setParams(prev => ({ ...prev, [key]: val }));
  };

  return (
    <div className="min-h-screen bg-bg-dark text-text-tool-main selection:bg-accent-green/30 font-sans flex flex-col">
      {/* Header */}
      <header className="h-14 bg-panel border-b border-border-tool px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <div className="text-accent-green font-mono font-black italic tracking-[0.2em] text-sm uppercase flex items-center gap-2">
            <Rocket size={18} />
            AEROPET PRO <span className="text-white">EXTREME</span>
          </div>
          <div className="h-4 w-px bg-border-tool mx-2" />
          <div className="text-[10px] text-text-tool-muted uppercase tracking-[0.2em] font-mono hidden sm:block">
            SOLVER: RK-4 INTEGRATOR
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-[10px] text-text-tool-muted uppercase tracking-widest bg-white/[0.03] px-3 py-1 border border-border-tool rounded-sm">
            <div className="w-1.5 h-1.5 bg-accent-green rounded-full" />
            Simulação Estável
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Controls */}
        <aside className="w-72 bg-panel border-r border-border-tool p-5 flex flex-col gap-5 overflow-y-auto shrink-0">
          <div className="space-y-6">
            <div className="space-y-1">
              <h4 className="text-[9px] font-mono font-bold text-text-tool-muted uppercase tracking-[0.2em] mb-3">Parâmetros de Lançamento</h4>
              <SliderControl 
                label="Água" 
                value={params.waterVolumeMl} 
                min={0} 
                max={1500} 
                step={10} 
                icon={Droplets}
                unit="ml"
                onChange={(v) => updateParam('waterVolumeMl', v)} 
              />
              <SliderControl 
                label="Pressão" 
                value={params.pressurePsi} 
                min={0} 
                max={120} 
                step={1} 
                icon={Gauge}
                unit="psi"
                onChange={(v) => updateParam('pressurePsi', v)} 
              />
              <SliderControl 
                label="Ângulo" 
                value={params.angleDeg} 
                min={0} 
                max={90} 
                step={1} 
                icon={ChevronRight}
                unit="°"
                onChange={(v) => updateParam('angleDeg', v)} 
              />
            </div>

            <button 
              onClick={() => setShowSettings(!showSettings)}
              className="w-full flex items-center justify-between p-3 bg-white/[0.03] hover:bg-white/[0.06] border border-border-tool rounded-sm text-[9px] uppercase tracking-widest font-mono font-bold transition-colors text-text-tool-muted hover:text-accent-green"
            >
              <div className="flex items-center gap-2">
                <Settings size={12} className={cn("transition-transform duration-500", showSettings && "rotate-90")} />
                Ajuste de Geometria
              </div>
              <ChevronRight size={12} className={cn("transition-transform", showSettings && "rotate-90")} />
            </button>

            <AnimatePresence>
              {showSettings && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden space-y-4"
                >
                  <SliderControl 
                    label="Garrafa" 
                    value={params.bottleVolumeL} 
                    min={0.5} 
                    max={3.0} 
                    step={0.1} 
                    icon={Droplets}
                    unit="L"
                    onChange={(v) => updateParam('bottleVolumeL', v)} 
                  />
                  <SliderControl 
                    label="Bico" 
                    value={params.nozzleDiameterMm} 
                    min={5} 
                    max={30} 
                    step={0.5} 
                    icon={ChevronRight}
                    unit="mm"
                    onChange={(v) => updateParam('nozzleDiameterMm', v)} 
                  />
                  <SliderControl 
                    label="Cd" 
                    value={params.dragCoeff} 
                    min={0.1} 
                    max={0.8} 
                    step={0.01} 
                    icon={Wind}
                    unit="coef"
                    onChange={(v) => updateParam('dragCoeff', v)} 
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="mt-auto border-t border-border-tool pt-5">
            <div className="text-[9px] text-accent-green font-mono font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
              <Zap size={10} />
              Diagnóstico Físico
            </div>
            <p className="text-[10px] leading-relaxed text-text-tool-muted font-mono italic">
              Integrador RK-4 ativo. Transição pneumática otimizada para CD={params.dragCoeff}.
            </p>
          </div>
        </aside>

        {/* Main Analytics Area */}
        <main className="flex-1 flex flex-col overflow-hidden">
          <section className="flex-1 p-6 flex flex-col gap-6 overflow-hidden">
            {/* Legend/Status Header for Plot */}
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] uppercase tracking-[0.2em] text-text-tool-muted font-mono font-bold flex items-center gap-2">
                <div className="w-1 h-3 bg-accent-green rounded-full" />
                Análise de Trajetória Operacional
              </h3>
              <div className="flex gap-4 text-[9px] font-mono text-text-tool-muted uppercase tracking-widest">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-accent-green" /> Simulado
                </div>
                <div className="flex items-center gap-1.5 opacity-50">
                  <div className="w-2 h-0.5 bg-text-tool-muted dashed border-t border-spacing-1" /> Shadow
                </div>
              </div>
            </div>

            <div className="flex-1 bg-panel border border-border-tool relative hardware-grid rounded-sm overflow-hidden group">
              <div className="absolute inset-0 pointer-events-none border border-white/[0.03] z-10" />
              <RocketPlot 
                data={result.trajectory} 
                maxDistance={result.maxDistance}
                maxHeight={result.maxHeight}
              />
            </div>
          </section>

          {/* Footer Stats Bar */}
          <footer className="h-32 bg-[#111418] border-t border-border-tool p-6 flex items-center gap-6 shrink-0">
            <Metric 
              label="Alcance Total" 
              value={result.maxDistance.toFixed(2)} 
              unit="m" 
              icon={Target} 
            />
            <Metric 
              label="Altitude Apogeu" 
              value={result.maxHeight.toFixed(2)} 
              unit="m" 
              icon={Maximize2} 
              color="text-text-tool-main"
            />
            <Metric 
              label="V-Terminal" 
              value={(result.maxVelocity * 3.6).toFixed(1)} 
              unit="km/h" 
              icon={Zap} 
              color="text-text-tool-main"
            />
            
            <div className="h-full w-px bg-border-tool mx-2" />
            
            <div className="flex-1 min-w-[200px]">
              <div className="text-[9px] uppercase tracking-widest text-text-tool-muted font-mono font-bold mb-3">Sequenciamento de Voo</div>
              <div className="flex gap-1.5">
                {result.phases.map((phase, idx) => (
                  <div key={idx} className="flex-1 h-8 bg-white/[0.02] border border-border-tool rounded-sm p-1.5 flex flex-col justify-center">
                    <div className="flex justify-between items-center text-[8px] font-mono uppercase tracking-tighter">
                      <span className="text-accent-green/60">{phase.label.slice(0, 3)}</span>
                      <span className="text-text-tool-muted">{(phase.endTime - phase.startTime).toFixed(2)}s</span>
                    </div>
                    <div className="mt-1 h-0.5 w-full bg-accent-green/20 rounded-full" />
                  </div>
                ))}
              </div>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
