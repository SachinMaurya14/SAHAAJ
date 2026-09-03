import React, { useState } from 'react';
import { 
  Activity, 
  Heart, 
  Droplet, 
  BookOpen, 
  Search, 
  ExternalLink, 
  ShieldCheck, 
  Sparkles, 
  Layers, 
  GitBranch, 
  ChevronRight,
  Info
} from 'lucide-react';
import { biologicalFactSheetsData, BiologicalFactSheet } from '../../services/aiModelServices';

interface HealthFactorMapViewProps {
  setCurrentView?: (view: string) => void;
}

export const HealthFactorMapView: React.FC<HealthFactorMapViewProps> = ({ setCurrentView }) => {
  const [selectedFactSheet, setSelectedFactSheet] = useState<BiologicalFactSheet>(biologicalFactSheetsData[0]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSystem, setSelectedSystem] = useState<string>('All');

  const filteredFactSheets = biologicalFactSheetsData.filter((item) => {
    const matchesSearch = item.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.shortDefinition.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSystem = selectedSystem === 'All' || item.category === selectedSystem;
    return matchesSearch && matchesSystem;
  });

  return (
    <div className="space-y-8">
      
      {/* Top Banner */}
      <div className="p-6 sm:p-8 bg-[#FFFFFF] dark:bg-[#1A1916] border border-[#1A1A1A]/15 dark:border-[#EAE5DD]/12 space-y-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-sans font-bold uppercase tracking-[0.25em] text-[#A38D7D]">
              BIOLOGICAL KNOWLEDGE GRAPH & FACT SHEETS
            </span>
            <span className="text-xs font-newsreader italic text-[#1A1A1A]/60 dark:text-[#EAE5DD]/60">&bull; Evidence Grounded</span>
          </div>
          <h2 className="font-editorial text-3xl italic text-[#1A1A1A] dark:text-[#EAE5DD] mt-1">
            Interactive Health Factor Map & Physiology Explorer
          </h2>
          <p className="text-xs font-newsreader italic text-[#1A1A1A]/60 dark:text-[#EAE5DD]/60">
            Explore how lifestyle behaviors, circulating biomarkers, and mathematical models interconnect through verified physiology.
          </p>
        </div>

        {/* Conceptual Relationship Pipeline (Section 55 & 104) */}
        <div className="p-4 bg-[#F5F2ED] dark:bg-[#201E1A] border border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10 space-y-3">
          <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-[#A38D7D] block">
            SAAHAJ Multi-Tier Signal Pipeline:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs font-mono-code">
            <div className="p-2.5 bg-[#FFFFFF] dark:bg-[#151412] border border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10">
              <span className="text-[9px] text-[#A38D7D] block">Tier 1</span>
              <span className="font-bold text-[#1A1A1A] dark:text-[#EAE5DD]">Lifestyle Input</span>
            </div>
            <div className="p-2.5 bg-[#FFFFFF] dark:bg-[#151412] border border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10">
              <span className="text-[9px] text-[#A38D7D] block">Tier 2</span>
              <span className="font-bold text-[#1A1A1A] dark:text-[#EAE5DD]">Biomarkers</span>
            </div>
            <div className="p-2.5 bg-[#FFFFFF] dark:bg-[#151412] border border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10">
              <span className="text-[9px] text-[#A38D7D] block">Tier 3</span>
              <span className="font-bold text-[#1A1A1A] dark:text-[#EAE5DD]">Model Inference</span>
            </div>
            <div className="p-2.5 bg-[#FFFFFF] dark:bg-[#151412] border border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10">
              <span className="text-[9px] text-[#A38D7D] block">Tier 4</span>
              <span className="font-bold text-[#1A1A1A] dark:text-[#EAE5DD]">SHAP & Evidence</span>
            </div>
            <div className="p-2.5 bg-[#FFFFFF] dark:bg-[#151412] border border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10">
              <span className="text-[9px] text-[#A38D7D] block">Tier 5</span>
              <span className="font-bold text-[#1A1A1A] dark:text-[#EAE5DD]">Clinician Brief</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Fact Sheet Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left 5 cols: Search & Factor Catalog */}
        <div className="lg:col-span-5 bg-[#FFFFFF] dark:bg-[#1A1916] border border-[#1A1A1A]/15 dark:border-[#EAE5DD]/12 p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10">
            <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-[#A38D7D]">
              BIOLOGICAL CATALOG
            </span>
            <span className="text-[10px] font-mono-code text-[#1A1A1A]/50 dark:text-[#EAE5DD]/50">
              {filteredFactSheets.length} Fact Sheets
            </span>
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-[#1A1A1A]/40 dark:text-[#EAE5DD]/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search biomarkers, enzymes, lipids..."
              className="w-full pl-9 pr-3 py-2 bg-[#F5F2ED] dark:bg-[#201E1A] border border-[#1A1A1A]/20 dark:border-[#EAE5DD]/20 text-xs font-mono-code text-[#1A1A1A] dark:text-[#EAE5DD] focus:outline-none"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {['All', 'Cardiovascular', 'Metabolic', 'Renal', 'Hepatic'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedSystem(cat)}
                className={`px-2.5 py-1 text-[10px] font-sans font-bold uppercase tracking-wider transition-colors cursor-pointer border ${
                  selectedSystem === cat
                    ? 'bg-[#1A1A1A] dark:bg-[#EAE5DD] text-[#F5F2ED] dark:text-[#151412] border-[#1A1A1A] dark:border-[#EAE5DD]'
                    : 'bg-[#F5F2ED] dark:bg-[#201E1A] text-[#1A1A1A]/60 dark:text-[#EAE5DD]/60 border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* List of Factors */}
          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {filteredFactSheets.map((fact) => {
              const isSelected = selectedFactSheet.id === fact.id;
              return (
                <button
                  key={fact.id}
                  onClick={() => setSelectedFactSheet(fact)}
                  className={`w-full text-left p-3.5 transition-all border cursor-pointer ${
                    isSelected
                      ? 'bg-[#ECE8E1] dark:bg-[#262420] border-[#1A1A1A] dark:border-[#EAE5DD]'
                      : 'bg-[#F5F2ED] dark:bg-[#201E1A] border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10 hover:border-[#1A1A1A]/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-[#A38D7D]">
                      {fact.category}
                    </span>
                    <span className="text-[10px] font-mono-code text-[#1A1A1A]/50 dark:text-[#EAE5DD]/50">
                      {fact.measurementUnits}
                    </span>
                  </div>
                  <h4 className="font-editorial text-lg italic text-[#1A1A1A] dark:text-[#EAE5DD] mt-0.5">
                    {fact.term}
                  </h4>
                  <p className="font-newsreader text-xs italic text-[#1A1A1A]/70 dark:text-[#EAE5DD]/70 line-clamp-1 mt-1">
                    {fact.shortDefinition}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right 7 cols: Detailed Biological Fact Sheet */}
        <div className="lg:col-span-7 bg-[#FFFFFF] dark:bg-[#1A1916] border border-[#1A1A1A]/15 dark:border-[#EAE5DD]/12 p-6 sm:p-8 space-y-6">
          
          <div className="border-b border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10 pb-4">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-sans font-bold uppercase tracking-[0.25em] text-[#A38D7D]">
                FACT SHEET #{selectedFactSheet.id.toUpperCase()}
              </span>
              <span className="text-[10px] font-mono-code text-[#1A1A1A]/50 dark:text-[#EAE5DD]/50">
                • {selectedFactSheet.category}
              </span>
            </div>
            <h3 className="font-editorial text-3xl italic text-[#1A1A1A] dark:text-[#EAE5DD] mt-1">
              {selectedFactSheet.term}
            </h3>
            <p className="font-newsreader text-sm italic text-[#1A1A1A]/80 dark:text-[#EAE5DD]/80 mt-1">
              {selectedFactSheet.shortDefinition}
            </p>
          </div>

          {/* Reference & Units */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono-code">
            <div className="p-3.5 bg-[#F5F2ED] dark:bg-[#201E1A] border border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10">
              <span className="text-[9px] text-[#A38D7D] uppercase block">Standard Reference Range</span>
              <span className="font-bold text-[#1A1A1A] dark:text-[#EAE5DD]">{selectedFactSheet.standardReferenceRange}</span>
            </div>
            <div className="p-3.5 bg-[#F5F2ED] dark:bg-[#201E1A] border border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10">
              <span className="text-[9px] text-[#A38D7D] uppercase block">Units of Measurement</span>
              <span className="font-bold text-[#1A1A1A] dark:text-[#EAE5DD]">{selectedFactSheet.measurementUnits}</span>
            </div>
          </div>

          {/* Detailed Physiology */}
          <div className="p-4 bg-[#F5F2ED] dark:bg-[#201E1A] border border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10 space-y-2">
            <span className="font-sans font-bold uppercase tracking-wider text-[10px] text-[#A38D7D] block">
              1. Underlying Biological Mechanism & Physiology
            </span>
            <p className="font-newsreader text-sm italic text-[#1A1A1A]/90 dark:text-[#EAE5DD]/90 leading-relaxed">
              {selectedFactSheet.detailedPhysiology}
            </p>
          </div>

          {/* Clinical Significance */}
          <div className="p-4 bg-[#F5F2ED] dark:bg-[#201E1A] border border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10 space-y-2">
            <span className="font-sans font-bold uppercase tracking-wider text-[10px] text-[#A38D7D] block">
              2. Clinical Interpretation & Risk Context
            </span>
            <p className="font-newsreader text-sm italic text-[#1A1A1A]/90 dark:text-[#EAE5DD]/90 leading-relaxed">
              {selectedFactSheet.clinicalSignificance}
            </p>
          </div>

          {/* Influencing Lifestyle Factors */}
          <div className="p-4 bg-[#F5F2ED] dark:bg-[#201E1A] border border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10 space-y-2">
            <span className="font-sans font-bold uppercase tracking-wider text-[10px] text-[#A38D7D] block">
              3. Influencing Behaviors & Modulation Factors
            </span>
            <div className="flex flex-wrap gap-2 pt-1">
              {selectedFactSheet.influencingFactors.map((factor) => (
                <span
                  key={factor}
                  className="px-2.5 py-1 bg-[#FFFFFF] dark:bg-[#151412] border border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10 text-xs font-newsreader italic text-[#1A1A1A] dark:text-[#EAE5DD]"
                >
                  &bull; {factor}
                </span>
              ))}
            </div>
          </div>

          {/* Associated Validated Models */}
          <div className="p-4 bg-[#F5F2ED] dark:bg-[#201E1A] border border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10 space-y-2">
            <span className="font-sans font-bold uppercase tracking-wider text-[10px] text-[#A38D7D] block">
              4. Associated Statistical Risk Models
            </span>
            <div className="flex flex-wrap gap-2">
              {selectedFactSheet.associatedModels.map((model) => (
                <span
                  key={model}
                  className="px-2.5 py-1 bg-[#1A1A1A] dark:bg-[#EAE5DD] text-[#F5F2ED] dark:text-[#151412] text-[10px] font-sans font-bold uppercase tracking-wider"
                >
                  {model}
                </span>
              ))}
            </div>
          </div>

          {/* Evidence Citations */}
          <div className="border-t border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10 pt-4 space-y-2">
            <span className="font-sans font-bold uppercase tracking-wider text-[10px] text-[#A38D7D] block">
              Peer-Reviewed Evidence & Guidelines:
            </span>
            {selectedFactSheet.evidenceCitations.map((ev) => (
              <div key={ev.title} className="text-xs font-mono-code text-[#1A1A1A]/70 dark:text-[#EAE5DD]/70 flex items-center justify-between">
                <span>{ev.title} ({ev.source}, {ev.year})</span>
                <span className="text-[10px] text-[#A38D7D] font-bold">[{ev.evidenceTier}]</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
