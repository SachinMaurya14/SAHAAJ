import React, { useState } from 'react';
import { Sliders, RefreshCw, AlertTriangle, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { MLModelRegistry } from '../../../services/aiModelServices';

interface CounterfactualSimulatorProps {
  initialBpSystolic?: number;
  initialLdl?: number;
  initialSmoking?: string;
  initialActivity?: string;
}

export const CounterfactualSimulator: React.FC<CounterfactualSimulatorProps> = ({
  initialBpSystolic = 138,
  initialLdl = 128,
  initialSmoking = 'Never',
  initialActivity = 'Moderately Active',
}) => {
  const [bpSystolic, setBpSystolic] = useState<number>(initialBpSystolic);
  const [ldl, setLdl] = useState<number>(initialLdl);
  const [smoking, setSmoking] = useState<string>(initialSmoking);
  const [activity, setActivity] = useState<string>(initialActivity);

  // Baseline evaluation
  const baselineEval = MLModelRegistry.evaluateCardiovascularRisk({
    bpSystolic: initialBpSystolic,
    ldl: initialLdl,
    smokingStatus: initialSmoking,
    activityLevel: initialActivity,
    age: 44,
  });

  // Simulated evaluation
  const simulatedEval = MLModelRegistry.evaluateCardiovascularRisk({
    bpSystolic,
    ldl,
    smokingStatus: smoking,
    activityLevel: activity,
    age: 44,
  });

  const deltaScore = simulatedEval.prediction_score - baselineEval.prediction_score;

  const handleReset = () => {
    setBpSystolic(initialBpSystolic);
    setLdl(initialLdl);
    setSmoking(initialSmoking);
    setActivity(initialActivity);
  };

  return (
    <div className="p-6 sm:p-8 bg-[#FFFFFF] dark:bg-[#1A1916] border border-[#1A1A1A]/15 dark:border-[#EAE5DD]/12 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-sans font-bold uppercase tracking-[0.25em] text-[#A38D7D]">
              MODEL SIMULATION & SENSITIVITY
            </span>
            <span className="text-xs font-mono-code text-[#1A1A1A]/50 dark:text-[#EAE5DD]/50">
              • What-If Analysis
            </span>
          </div>
          <h3 className="font-editorial text-2xl italic text-[#1A1A1A] dark:text-[#EAE5DD] mt-0.5">
            Explore What Changes the Estimate
          </h3>
        </div>

        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F5F2ED] dark:bg-[#201E1A] border border-[#1A1A1A]/15 dark:border-[#EAE5DD]/15 text-xs font-sans font-bold uppercase tracking-wider text-[#1A1A1A] dark:text-[#EAE5DD] hover:bg-[#ECE8E1] cursor-pointer"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Reset to Current Baseline</span>
        </button>
      </div>

      {/* Model Simulation Notice */}
      <div className="p-4 bg-[#F5F2ED] dark:bg-[#201E1A] border border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10 flex items-start gap-3">
        <AlertTriangle className="w-4 h-4 text-[#A38D7D] shrink-0 mt-0.5" />
        <p className="font-newsreader text-xs italic text-[#1A1A1A]/80 dark:text-[#EAE5DD]/80 leading-relaxed">
          <strong className="font-sans font-bold uppercase tracking-wider text-[9px] text-[#A38D7D] not-italic block mb-0.5">
            Model Simulation Only:
          </strong>
          This interactive module explores mathematical model sensitivity across simulated parameter inputs. It does NOT guarantee individual clinical outcomes or substitute for professional medical guidance.
        </p>
      </div>

      {/* Interactive Controls & Output Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left 7 cols: Sliders */}
        <div className="lg:col-span-7 space-y-5">
          
          {/* BP Slider */}
          <div className="p-4 bg-[#F5F2ED] dark:bg-[#201E1A] border border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-sans font-bold uppercase tracking-wider text-[11px] text-[#1A1A1A] dark:text-[#EAE5DD]">
                Systolic Blood Pressure
              </span>
              <span className="font-mono-code text-xs font-bold text-[#A38D7D]">
                {bpSystolic} mmHg (Baseline: {initialBpSystolic})
              </span>
            </div>
            <input
              type="range"
              min={90}
              max={180}
              step={1}
              value={bpSystolic}
              onChange={(e) => setBpSystolic(Number(e.target.value))}
              className="w-full accent-[#A38D7D] cursor-pointer"
            />
            <div className="flex justify-between text-[9px] font-mono-code text-[#1A1A1A]/50 dark:text-[#EAE5DD]/50">
              <span>90 mmHg (Optimal)</span>
              <span>120 mmHg (Ref)</span>
              <span>180 mmHg (Stage 2)</span>
            </div>
          </div>

          {/* LDL Slider */}
          <div className="p-4 bg-[#F5F2ED] dark:bg-[#201E1A] border border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-sans font-bold uppercase tracking-wider text-[11px] text-[#1A1A1A] dark:text-[#EAE5DD]">
                LDL Cholesterol
              </span>
              <span className="font-mono-code text-xs font-bold text-[#A38D7D]">
                {ldl} mg/dL (Baseline: {initialLdl})
              </span>
            </div>
            <input
              type="range"
              min={60}
              max={200}
              step={1}
              value={ldl}
              onChange={(e) => setLdl(Number(e.target.value))}
              className="w-full accent-[#A38D7D] cursor-pointer"
            />
            <div className="flex justify-between text-[9px] font-mono-code text-[#1A1A1A]/50 dark:text-[#EAE5DD]/50">
              <span>60 mg/dL (Target)</span>
              <span>100 mg/dL (Ref)</span>
              <span>200 mg/dL (High)</span>
            </div>
          </div>

          {/* Lifestyle Choices */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-[#F5F2ED] dark:bg-[#201E1A] border border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10 space-y-2">
              <span className="font-sans font-bold uppercase tracking-wider text-[10px] text-[#1A1A1A] dark:text-[#EAE5DD] block">
                Smoking Exposure
              </span>
              <select
                value={smoking}
                onChange={(e) => setSmoking(e.target.value)}
                className="w-full p-2 bg-[#FFFFFF] dark:bg-[#151412] border border-[#1A1A1A]/20 dark:border-[#EAE5DD]/20 text-xs font-mono-code text-[#1A1A1A] dark:text-[#EAE5DD]"
              >
                <option value="Never">Never Smoked</option>
                <option value="Former">Former Smoker</option>
                <option value="Current">Current Smoker</option>
              </select>
            </div>

            <div className="p-4 bg-[#F5F2ED] dark:bg-[#201E1A] border border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10 space-y-2">
              <span className="font-sans font-bold uppercase tracking-wider text-[10px] text-[#1A1A1A] dark:text-[#EAE5DD] block">
                Physical Activity
              </span>
              <select
                value={activity}
                onChange={(e) => setActivity(e.target.value)}
                className="w-full p-2 bg-[#FFFFFF] dark:bg-[#151412] border border-[#1A1A1A]/20 dark:border-[#EAE5DD]/20 text-xs font-mono-code text-[#1A1A1A] dark:text-[#EAE5DD]"
              >
                <option value="Sedentary">Sedentary (&lt; 30m/wk)</option>
                <option value="Lightly Active">Light (60m/wk)</option>
                <option value="Moderately Active">Moderate (150m/wk)</option>
                <option value="Very Active">Very Active (300m+/wk)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Right 5 cols: Comparison Score Board */}
        <div className="lg:col-span-5 p-6 bg-[#F5F2ED] dark:bg-[#201E1A] border border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10 space-y-5">
          <div>
            <span className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-[#A38D7D]">
              SIMULATION DELTA
            </span>
            <h4 className="font-editorial text-xl italic text-[#1A1A1A] dark:text-[#EAE5DD] mt-1">
              Estimated 10-Year ASCVD Risk
            </h4>
          </div>

          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="p-4 bg-[#FFFFFF] dark:bg-[#151412] border border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10">
              <span className="text-[9px] font-sans font-bold uppercase tracking-wider text-[#1A1A1A]/50 dark:text-[#EAE5DD]/50 block">
                Current Baseline
              </span>
              <span className="font-editorial text-3xl italic text-[#1A1A1A] dark:text-[#EAE5DD] block my-1">
                {baselineEval.prediction_score}%
              </span>
              <span className="text-[10px] font-mono-code text-[#A38D7D] font-bold">
                {baselineEval.prediction_label}
              </span>
            </div>

            <div className="p-4 bg-[#FFFFFF] dark:bg-[#151412] border border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10">
              <span className="text-[9px] font-sans font-bold uppercase tracking-wider text-[#1A1A1A]/50 dark:text-[#EAE5DD]/50 block">
                Simulated Output
              </span>
              <span className="font-editorial text-3xl italic text-[#1A1A1A] dark:text-[#EAE5DD] block my-1">
                {simulatedEval.prediction_score}%
              </span>
              <span className={`text-[10px] font-mono-code font-bold ${deltaScore < 0 ? 'text-[#1A1A1A] dark:text-[#EAE5DD]' : deltaScore > 0 ? 'text-[#A38D7D]' : 'text-[#1A1A1A]/50'}`}>
                {deltaScore > 0 ? `+${deltaScore}%` : deltaScore < 0 ? `${deltaScore}%` : 'No Change'}
              </span>
            </div>
          </div>

          <div className="p-4 bg-[#FFFFFF] dark:bg-[#151412] border border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10 text-xs space-y-2">
            <span className="font-sans font-bold uppercase tracking-wider text-[10px] text-[#A38D7D] block">
              Simulation Synthesis:
            </span>
            <p className="font-newsreader italic text-[#1A1A1A]/80 dark:text-[#EAE5DD]/80 leading-relaxed">
              Under this hypothetical scenario, modifying systolic pressure from {initialBpSystolic} to {bpSystolic} mmHg and LDL from {initialLdl} to {ldl} mg/dL changes the model's statistical estimate from {baselineEval.prediction_score}% to {simulatedEval.prediction_score}%.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
