import React, { useState } from 'react';
import { 
  BookOpen, 
  Heart, 
  Coffee, 
  Moon, 
  Activity, 
  Pill, 
  Info, 
  ShieldCheck,
  Search,
  ChevronDown
} from 'lucide-react';

export const HealthEducationView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const glossaryItems = [
    { term: "Glycated Hemoglobin (HbA1c)", meaning: "Reflects average blood sugar levels over the past 2 to 3 months by measuring sugar attached to hemoglobin proteins in red blood cells. Standard normal threshold is < 5.7%." },
    { term: "Estimated Glomerular Filtration Rate (eGFR)", meaning: "A calculated estimate of how efficiently your kidneys filter metabolic waste from the bloodstream. A value > 60 mL/min/1.73m² indicates normal baseline function." },
    { term: "Alanine Aminotransferase (ALT)", meaning: "An enzyme found predominantly inside liver cells. When liver cells experience stress or lipid accumulation, ALT can leak into blood circulation." },
    { term: "Low-Density Lipoprotein (LDL-C)", meaning: "Particles carrying cholesterol through blood vessels. Often monitored alongside cardiovascular risk factors to assess plaque risk." },
    { term: "Serum Creatinine", meaning: "A natural byproduct of muscle breakdown filtered out exclusively by the kidneys. Steady levels indicate steady filtration rate." }
  ];

  const filteredGlossary = glossaryItems.filter(item => 
    item.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.meaning.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      
      {/* Top Banner */}
      <div className="p-6 sm:p-8 bg-[#FFFFFF] dark:bg-[#1A1916] border border-[#1A1A1A]/15 dark:border-[#EAE5DD]/12 space-y-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-sans font-bold uppercase tracking-[0.25em] text-[#A38D7D]">
              KNOWLEDGE REPOSITORY
            </span>
            <span className="text-xs font-newsreader italic text-[#1A1A1A]/60 dark:text-[#EAE5DD]/60">&bull; Evidence-Based Curations</span>
          </div>
          <h2 className="font-editorial text-3xl italic text-[#1A1A1A] dark:text-[#EAE5DD] mt-1">
            Health Education & Recovery Considerations
          </h2>
          <p className="text-xs font-newsreader italic text-[#1A1A1A]/60 dark:text-[#EAE5DD]/60">
            Evidence-based general educational resources. Your physician's customized care plan always takes precedence.
          </p>
        </div>

        <div className="p-4 bg-[#F5F2ED] dark:bg-[#201E1A] border border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10 text-xs text-[#1A1A1A] dark:text-[#EAE5DD] flex items-start gap-3">
          <ShieldCheck className="w-4 h-4 text-[#A38D7D] shrink-0 mt-0.5" />
          <p className="font-newsreader text-xs italic text-[#1A1A1A]/80 dark:text-[#EAE5DD]/80 leading-relaxed">
            <strong className="font-sans font-bold uppercase tracking-wider text-[9px] text-[#A38D7D] not-italic block mb-0.5">Clinical Disclaimer:</strong>
            Educational guidance is non-prescriptive and intended to support informed patient-doctor dialogue rather than self-diagnosis.
          </p>
        </div>
      </div>

      {/* 4 Core Educational Modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Nutrition */}
        <div className="p-6 sm:p-8 bg-[#FFFFFF] dark:bg-[#1A1916] border border-[#1A1A1A]/15 dark:border-[#EAE5DD]/12 space-y-4">
          <div className="flex items-center gap-2 text-[#A38D7D]">
            <Heart className="w-4 h-4" />
            <span className="text-[10px] font-sans font-bold uppercase tracking-[0.2em]">METABOLIC DIETARY</span>
          </div>
          <h3 className="font-editorial text-2xl italic text-[#1A1A1A] dark:text-[#EAE5DD]">
            Dietary Patterns & Glycemic Balance
          </h3>
          <p className="font-newsreader text-sm italic text-[#1A1A1A]/75 dark:text-[#EAE5DD]/75 leading-relaxed">
            Prioritizing whole fiber-rich vegetables, legumes, and lean proteins helps stabilize post-meal glucose spikes. Reducing ultra-processed carbohydrates supports steady HbA1c moderation.
          </p>
          <div className="text-xs font-mono-code text-[#1A1A1A]/60 dark:text-[#EAE5DD]/60 bg-[#F5F2ED] dark:bg-[#201E1A] p-3 border border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10">
            Tip: Discuss individualized glycemic meal planning with your clinician or registered dietitian.
          </div>
        </div>

        {/* Physical Activity */}
        <div className="p-6 sm:p-8 bg-[#FFFFFF] dark:bg-[#1A1916] border border-[#1A1A1A]/15 dark:border-[#EAE5DD]/12 space-y-4">
          <div className="flex items-center gap-2 text-[#A38D7D]">
            <Activity className="w-4 h-4" />
            <span className="text-[10px] font-sans font-bold uppercase tracking-[0.2em]">PHYSIOLOGY</span>
          </div>
          <h3 className="font-editorial text-2xl italic text-[#1A1A1A] dark:text-[#EAE5DD]">
            Physical Activity & Insulin Sensitivity
          </h3>
          <p className="font-newsreader text-sm italic text-[#1A1A1A]/75 dark:text-[#EAE5DD]/75 leading-relaxed">
            150 minutes of moderate aerobic activity per week (like brisk walking) enhances muscular glucose uptake independently of insulin, contributing to favorable metabolic trajectory.
          </p>
          <div className="text-xs font-mono-code text-[#1A1A1A]/60 dark:text-[#EAE5DD]/60 bg-[#F5F2ED] dark:bg-[#201E1A] p-3 border border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10">
            Evidence: ADA Standards of Care (2026) Physical Activity Guidance.
          </div>
        </div>

        {/* Sleep & Stress */}
        <div className="p-6 sm:p-8 bg-[#FFFFFF] dark:bg-[#1A1916] border border-[#1A1A1A]/15 dark:border-[#EAE5DD]/12 space-y-4">
          <div className="flex items-center gap-2 text-[#A38D7D]">
            <Moon className="w-4 h-4" />
            <span className="text-[10px] font-sans font-bold uppercase tracking-[0.2em]">CIRCADIAN HEALTH</span>
          </div>
          <h3 className="font-editorial text-2xl italic text-[#1A1A1A] dark:text-[#EAE5DD]">
            Sleep Quality & Vascular Recovery
          </h3>
          <p className="font-newsreader text-sm italic text-[#1A1A1A]/75 dark:text-[#EAE5DD]/75 leading-relaxed">
            Consistent 7–8 hours of restorative sleep allows nocturnal blood pressure dipping, reducing vascular strain and supporting hormonal equilibrium.
          </p>
          <div className="text-xs font-mono-code text-[#1A1A1A]/60 dark:text-[#EAE5DD]/60 bg-[#F5F2ED] dark:bg-[#201E1A] p-3 border border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10">
            Context: Sleep fragmentation can elevate daytime cortisol and morning fasting blood glucose.
          </div>
        </div>

        {/* Medication Adherence */}
        <div className="p-6 sm:p-8 bg-[#FFFFFF] dark:bg-[#1A1916] border border-[#1A1A1A]/15 dark:border-[#EAE5DD]/12 space-y-4">
          <div className="flex items-center gap-2 text-[#A38D7D]">
            <Pill className="w-4 h-4" />
            <span className="text-[10px] font-sans font-bold uppercase tracking-[0.2em]">PHARMACOLOGY</span>
          </div>
          <h3 className="font-editorial text-2xl italic text-[#1A1A1A] dark:text-[#EAE5DD]">
            Medication Timing & Adherence
          </h3>
          <p className="font-newsreader text-sm italic text-[#1A1A1A]/75 dark:text-[#EAE5DD]/75 leading-relaxed">
            Taking prescribed therapies (such as Metformin with dinner or Telmisartan in the morning) consistently maintains steady therapeutic blood levels and prevents rebound surges.
          </p>
          <div className="text-xs font-mono-code text-[#1A1A1A]/60 dark:text-[#EAE5DD]/60 bg-[#F5F2ED] dark:bg-[#201E1A] p-3 border border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10">
            Note: Never discontinue or adjust prescription dosage without direct physician consultation.
          </div>
        </div>

      </div>

      {/* Lab Terminology Dictionary */}
      <div className="p-6 sm:p-8 bg-[#FFFFFF] dark:bg-[#1A1916] border border-[#1A1A1A]/15 dark:border-[#EAE5DD]/12 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
          <div>
            <h3 className="font-editorial text-2xl italic text-[#1A1A1A] dark:text-[#EAE5DD] flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#A38D7D]" />
              <span>Medical Report Terminology Glossary</span>
            </h3>
            <p className="text-xs font-newsreader italic text-[#1A1A1A]/60 dark:text-[#EAE5DD]/60">
              Clear definitions of standard parameters found on metabolic and hematology panels.
            </p>
          </div>

          <div className="w-full sm:w-72">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter glossary (HbA1c, eGFR)..."
              className="w-full px-3 py-2 bg-[#F5F2ED] dark:bg-[#151412] border border-[#1A1A1A]/20 dark:border-[#EAE5DD]/20 text-xs font-newsreader italic text-[#1A1A1A] dark:text-[#EAE5DD] focus:outline-none"
            />
          </div>
        </div>

        <div className="space-y-3 pt-2">
          {filteredGlossary.map((item, idx) => (
            <div key={idx} className="p-4 bg-[#F5F2ED] dark:bg-[#201E1A] border border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10 space-y-1.5">
              <h4 className="text-xs font-sans font-bold uppercase tracking-wider text-[#A38D7D]">
                {item.term}
              </h4>
              <p className="font-newsreader text-sm italic text-[#1A1A1A]/80 dark:text-[#EAE5DD]/80 leading-relaxed">
                {item.meaning}
              </p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
