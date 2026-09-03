import React, { useState } from 'react';
import { 
  TrendingUp, 
  Clock, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle, 
  Sparkles, 
  Calendar, 
  ShieldAlert,
  ChevronRight,
  Layers
} from 'lucide-react';

interface LongitudinalRiskAnalysisViewProps {
  setCurrentView: (view: string) => void;
}

export const LongitudinalRiskAnalysisView: React.FC<LongitudinalRiskAnalysisViewProps> = ({ setCurrentView }) => {
  const [activeStoryStep, setActiveStoryStep] = useState<number>(0);

  const timelineMilestones = [
    {
      period: 'January 2026',
      title: 'Baseline Assessment',
      riskScore: 11,
      riskLabel: 'Moderate Signal',
      bp: '120/78 mmHg',
      ldl: '104 mg/dL',
      glucose: '104 mg/dL',
      hba1c: '5.8%',
      summary: 'Baseline lipid & metabolic panel. All values within normal to borderline distribution.'
    },
    {
      period: 'April 2026',
      title: 'Intermediate Check',
      riskScore: 14,
      riskLabel: 'Moderate Signal',
      bp: '128/82 mmHg',
      ldl: '116 mg/dL',
      glucose: '110 mg/dL',
      hba1c: '6.0%',
      summary: 'Modest upward shift in systolic blood pressure (+8 mmHg) and LDL (+12 mg/dL).'
    },
    {
      period: 'August 2026',
      title: 'Current Comprehensive Panel',
      riskScore: 18,
      riskLabel: 'Elevated Signal',
      bp: '138/88 mmHg',
      ldl: '128 mg/dL',
      glucose: '118 mg/dL',
      hba1c: '6.2%',
      summary: 'Continued gradual elevation in vascular pressure and atherogenic lipoprotein concentration.'
    }
  ];

  const factorDeltas = [
    {
      marker: 'Systolic Blood Pressure',
      baseline: '120 mmHg (Jan)',
      current: '138 mmHg (Aug)',
      delta: '+18 mmHg (+15.0%)',
      impact: 'elevating',
      modelAttributionDelta: '+28% relative contribution',
      mechanism: 'Increased arterial afterload and sheer wall stress'
    },
    {
      marker: 'LDL-C Lipoprotein',
      baseline: '104 mg/dL (Jan)',
      current: '128 mg/dL (Aug)',
      delta: '+24 mg/dL (+23.1%)',
      impact: 'elevating',
      modelAttributionDelta: '+22% relative contribution',
      mechanism: 'Higher atherogenic particle concentration'
    },
    {
      marker: 'Fasting Glucose & HbA1c',
      baseline: '104 mg/dL / 5.8% (Jan)',
      current: '118 mg/dL / 6.2% (Aug)',
      delta: '+14 mg/dL / +0.4%',
      impact: 'elevating',
      modelAttributionDelta: '+14% relative contribution',
      mechanism: 'Gradual glycemic insulin resistance trend'
    },
    {
      marker: 'Physical Activity & Exercise',
      baseline: 'Moderately Active',
      current: 'Moderately Active',
      delta: 'Stable (150 min/wk)',
      impact: 'protective',
      modelAttributionDelta: '−12% protective dampening',
      mechanism: 'Maintains endothelial nitric oxide bioavailability'
    }
  ];

  const storySteps = [
    {
      num: '01',
      title: 'Patient Health Profile',
      desc: '44-year-old male with active physical routine and family history of late-onset hypertension.'
    },
    {
      num: '02',
      title: 'Laboratory Ingest & OCR',
      desc: '3 structured lab panels extracted with 98.4% mean character confidence across 8 months.'
    },
    {
      num: '03',
      title: 'Biomarker Trajectory',
      desc: 'Consistent parallel rise in systolic pressure (+18 mmHg) and LDL (+24 mg/dL).'
    },
    {
      num: '04',
      title: 'Model Inference & SHAP',
      desc: 'Cardiovascular 10-Year ASCVD risk shifted from 11% to 18% over the period.'
    },
    {
      num: '05',
      title: 'Clinician Consultation Agenda',
      desc: 'Pre-appointment brief synthesized with 4 specific questions regarding dietary sodium and repeat testing.'
    }
  ];

  return (
    <div className="space-y-8">
      
      {/* Top Banner */}
      <div className="p-6 sm:p-8 bg-[#FFFFFF] dark:bg-[#1A1916] border border-[#1A1A1A]/15 dark:border-[#EAE5DD]/12 space-y-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-sans font-bold uppercase tracking-[0.25em] text-[#A38D7D]">
              LONGITUDINAL RISK ENGINE & CHRONOLOGY
            </span>
            <span className="text-xs font-newsreader italic text-[#1A1A1A]/60 dark:text-[#EAE5DD]/60">&bull; 8-Month Multi-Wave Trajectory</span>
          </div>
          <h2 className="font-editorial text-3xl italic text-[#1A1A1A] dark:text-[#EAE5DD] mt-1">
            Why Did My Risk Change Over Time?
          </h2>
          <p className="text-xs font-newsreader italic text-[#1A1A1A]/60 dark:text-[#EAE5DD]/60">
            Decomposing how shifts in personal biometrics between January and August altered statistical model estimates.
          </p>
        </div>

        {/* 3-Point Trajectory Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono-code pt-2">
          {timelineMilestones.map((m, idx) => (
            <div
              key={m.period}
              className={`p-5 border transition-all space-y-3 ${
                idx === 2
                  ? 'bg-[#ECE8E1] dark:bg-[#262420] border-[#1A1A1A] dark:border-[#EAE5DD]'
                  : 'bg-[#F5F2ED] dark:bg-[#201E1A] border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-[#A38D7D]">
                  {m.period}
                </span>
                <span className="text-[10px] font-sans font-bold uppercase tracking-wider px-2 py-0.5 bg-[#FFFFFF] dark:bg-[#151412] border border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10">
                  {m.riskLabel}
                </span>
              </div>

              <div>
                <span className="font-editorial text-3xl italic text-[#1A1A1A] dark:text-[#EAE5DD] block">
                  {m.riskScore}%
                </span>
                <span className="text-[10px] text-[#1A1A1A]/60 dark:text-[#EAE5DD]/60">Estimated ASCVD Risk</span>
              </div>

              <div className="space-y-1 text-[11px] pt-2 border-t border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10">
                <div>BP: <strong className="text-[#1A1A1A] dark:text-[#EAE5DD]">{m.bp}</strong></div>
                <div>LDL: <strong className="text-[#1A1A1A] dark:text-[#EAE5DD]">{m.ldl}</strong></div>
                <div>HbA1c: <strong className="text-[#1A1A1A] dark:text-[#EAE5DD]">{m.hba1c}</strong></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Why Did My Risk Change Breakdown (Section 58) */}
      <div className="p-6 sm:p-8 bg-[#FFFFFF] dark:bg-[#1A1916] border border-[#1A1A1A]/15 dark:border-[#EAE5DD]/12 space-y-6">
        <div className="border-b border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10 pb-4">
          <span className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-[#A38D7D]">
            FACTOR DECOMPOSITION
          </span>
          <h3 className="font-editorial text-2xl italic text-[#1A1A1A] dark:text-[#EAE5DD] mt-1">
            Biomarker Deltas Contributing to the +7% Risk Shift
          </h3>
          <p className="font-newsreader text-xs italic text-[#1A1A1A]/60 dark:text-[#EAE5DD]/60">
            Comparing the exact parameter shifts from January (11% risk) to August (18% risk).
          </p>
        </div>

        <div className="space-y-3">
          {factorDeltas.map((item) => (
            <div
              key={item.marker}
              className="p-4 bg-[#F5F2ED] dark:bg-[#201E1A] border border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10 space-y-2"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div>
                  <span className="font-sans font-bold uppercase tracking-wider text-[11px] text-[#1A1A1A] dark:text-[#EAE5DD]">
                    {item.marker}
                  </span>
                  <div className="flex items-center gap-3 text-[11px] font-mono-code text-[#1A1A1A]/60 dark:text-[#EAE5DD]/60 mt-0.5">
                    <span>{item.baseline}</span>
                    <span>&rarr;</span>
                    <span className="font-bold text-[#A38D7D]">{item.current}</span>
                    <span className="text-[10px]">({item.delta})</span>
                  </div>
                </div>

                <div className="text-right font-mono-code text-xs">
                  <span className={`font-bold ${item.impact === 'elevating' ? 'text-[#A38D7D]' : 'text-[#1A1A1A] dark:text-[#EAE5DD]'}`}>
                    {item.modelAttributionDelta}
                  </span>
                </div>
              </div>

              <p className="font-newsreader text-xs italic text-[#1A1A1A]/70 dark:text-[#EAE5DD]/70 pt-1 border-t border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10">
                <strong className="font-sans font-bold uppercase tracking-wider text-[9px] text-[#A38D7D] not-italic mr-1.5">
                  Physiological Significance:
                </strong>
                {item.mechanism}.
              </p>
            </div>
          ))}
        </div>

        <div className="p-4 bg-[#F5F2ED] dark:bg-[#201E1A] border border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10 text-xs font-newsreader italic text-[#1A1A1A]/80 dark:text-[#EAE5DD]/80">
          <strong className="font-sans font-bold uppercase tracking-wider text-[9px] text-[#A38D7D] not-italic block mb-0.5">
            Non-Causal Explanation Statement:
          </strong>
          These deltas explain mathematical adjustments in the model's statistical feature space. They do not claim that one specific factor caused clinical illness.
        </div>
      </div>

      {/* Health Story Mode (Section 81) */}
      <div className="p-6 sm:p-8 bg-[#FFFFFF] dark:bg-[#1A1916] border border-[#1A1A1A]/15 dark:border-[#EAE5DD]/12 space-y-6">
        <div className="border-b border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10 pb-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-[#A38D7D]">
              IMMERSIVE STORYTELLING
            </span>
            <h3 className="font-editorial text-2xl italic text-[#1A1A1A] dark:text-[#EAE5DD] mt-1">
              Your Longitudinal Health Story
            </h3>
          </div>
          <span className="text-xs font-mono-code text-[#A38D7D]">
            Step {activeStoryStep + 1} of {storySteps.length}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-center text-xs font-mono-code">
          {storySteps.map((step, idx) => (
            <button
              key={step.num}
              onClick={() => setActiveStoryStep(idx)}
              className={`p-3 border transition-all text-left cursor-pointer ${
                activeStoryStep === idx
                  ? 'bg-[#1A1A1A] dark:bg-[#EAE5DD] text-[#F5F2ED] dark:text-[#151412] border-[#1A1A1A] dark:border-[#EAE5DD]'
                  : 'bg-[#F5F2ED] dark:bg-[#201E1A] text-[#1A1A1A]/70 dark:text-[#EAE5DD]/70 border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10'
              }`}
            >
              <span className="text-[9px] font-bold block mb-1 opacity-70">STAGE {step.num}</span>
              <span className="font-sans font-bold uppercase tracking-wider text-[11px] block">{step.title}</span>
            </button>
          ))}
        </div>

        <div className="p-6 bg-[#F5F2ED] dark:bg-[#201E1A] border border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10 space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-[#A38D7D]">
              NARRATIVE STAGE {storySteps[activeStoryStep].num}
            </span>
            <h4 className="font-editorial text-2xl italic text-[#1A1A1A] dark:text-[#EAE5DD]">
              {storySteps[activeStoryStep].title}
            </h4>
          </div>
          <p className="font-newsreader text-base italic text-[#1A1A1A]/90 dark:text-[#EAE5DD]/90 leading-relaxed">
            {storySteps[activeStoryStep].desc}
          </p>
          <div className="pt-2 flex justify-between items-center text-xs font-sans font-bold uppercase tracking-wider">
            <button
              disabled={activeStoryStep === 0}
              onClick={() => setActiveStoryStep(prev => Math.max(prev - 1, 0))}
              className="px-3 py-1.5 bg-[#FFFFFF] dark:bg-[#151412] border border-[#1A1A1A]/15 dark:border-[#EAE5DD]/15 disabled:opacity-30 cursor-pointer"
            >
              &larr; Previous Stage
            </button>
            <button
              disabled={activeStoryStep === storySteps.length - 1}
              onClick={() => setActiveStoryStep(prev => Math.min(prev + 1, storySteps.length - 1))}
              className="px-3 py-1.5 bg-[#1A1A1A] dark:bg-[#EAE5DD] text-[#F5F2ED] dark:text-[#151412] disabled:opacity-30 cursor-pointer"
            >
              Next Stage &rarr;
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};
