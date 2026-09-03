import React, { useState } from 'react';
import { 
  Activity, 
  FileText, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Calendar, 
  Clock, 
  ArrowRight, 
  ShieldCheck, 
  Heart, 
  Droplet, 
  Sparkles, 
  Info,
  PlusCircle,
  Upload,
  Layers,
  FileCheck,
  RefreshCw,
  Trash2
} from 'lucide-react';
import { useHealthData } from '../../context/HealthDataContext';
import { AskSaahajDrawer } from '../common/AskSaahajDrawer';
import { HistoricalTrendsChart } from './components/HistoricalTrendsChart';

interface HealthOverviewViewProps {
  setCurrentView: (view: string) => void;
}

export const HealthOverviewView: React.FC<HealthOverviewViewProps> = ({ setCurrentView }) => {
  const { 
    userProfile, 
    documents, 
    timelineEvents, 
    loadDevFixture, 
    clearAllData,
    isDevFixtureLoaded 
  } = useHealthData();

  const [isAskSaahajOpen, setIsAskSaahajOpen] = useState(false);

  // If no user profile and no documents exist, show the Empty First-Run Experience
  const isEmptyState = !userProfile && documents.length === 0 && timelineEvents.length === 0;

  if (isEmptyState) {
    return (
      <div className="space-y-8 animate-in fade-in">
        
        {/* Welcome Empty State Banner */}
        <div className="p-8 sm:p-12 bg-[#FFFFFF] dark:bg-[#1A1916] border border-[#1A1A1A]/15 dark:border-[#EAE5DD]/12 space-y-6 text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-[#F5F2ED] dark:bg-[#201E1A] border border-[#1A1A1A]/20 dark:border-[#EAE5DD]/20 text-[#A38D7D] mb-2">
            <Activity className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-sans font-bold uppercase tracking-[0.25em] text-[#A38D7D] block">
              HEALTH INTELLIGENCE FOLIO
            </span>
            <h2 className="font-editorial text-4xl sm:text-5xl italic text-[#1A1A1A] dark:text-[#EAE5DD] tracking-tight">
              Your health story starts here.
            </h2>
            <p className="font-newsreader text-base sm:text-lg italic text-[#1A1A1A]/70 dark:text-[#EAE5DD]/70 max-w-xl mx-auto leading-relaxed">
              Add your health profile, upload a report, or enter a health measurement to begin organizing your complete clinical picture.
            </p>
          </div>

          {/* Action Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-left">
            
            {/* 1. Add Health Info */}
            <button
              onClick={() => setCurrentView('app-health-input')}
              className="p-5 bg-[#F5F2ED] dark:bg-[#201E1A] border border-[#1A1A1A]/15 dark:border-[#EAE5DD]/15 hover:border-[#1A1A1A]/40 dark:hover:border-[#EAE5DD]/40 transition-all group flex flex-col justify-between space-y-4 cursor-pointer"
            >
              <div className="space-y-2">
                <div className="w-8 h-8 bg-[#1A1A1A] dark:bg-[#EAE5DD] text-[#F5F2ED] dark:text-[#151412] flex items-center justify-center">
                  <PlusCircle className="w-4 h-4" />
                </div>
                <h3 className="font-editorial text-xl italic text-[#1A1A1A] dark:text-[#EAE5DD]">
                  Add Health Info
                </h3>
                <p className="text-xs font-newsreader italic text-[#1A1A1A]/60 dark:text-[#EAE5DD]/60">
                  Log blood pressure, heart rate, sleep hours, or diagnosed conditions.
                </p>
              </div>
              <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-[#A38D7D] group-hover:underline flex items-center gap-1">
                Enter Vitals <ArrowRight className="w-3 h-3" />
              </span>
            </button>

            {/* 2. Upload a Report */}
            <button
              onClick={() => setCurrentView('app-records')}
              className="p-5 bg-[#F5F2ED] dark:bg-[#201E1A] border border-[#1A1A1A]/15 dark:border-[#EAE5DD]/15 hover:border-[#1A1A1A]/40 dark:hover:border-[#EAE5DD]/40 transition-all group flex flex-col justify-between space-y-4 cursor-pointer"
            >
              <div className="space-y-2">
                <div className="w-8 h-8 bg-[#1A1A1A] dark:bg-[#EAE5DD] text-[#F5F2ED] dark:text-[#151412] flex items-center justify-center">
                  <Upload className="w-4 h-4" />
                </div>
                <h3 className="font-editorial text-xl italic text-[#1A1A1A] dark:text-[#EAE5DD]">
                  Upload a Report
                </h3>
                <p className="text-xs font-newsreader italic text-[#1A1A1A]/60 dark:text-[#EAE5DD]/60">
                  Ingest lab panels, metabolic tests, and imaging records with OCR extraction.
                </p>
              </div>
              <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-[#A38D7D] group-hover:underline flex items-center gap-1">
                Open Archive <ArrowRight className="w-3 h-3" />
              </span>
            </button>

            {/* 3. Explore How SAAHAJ Works */}
            <button
              onClick={() => setCurrentView('app-health-factors')}
              className="p-5 bg-[#F5F2ED] dark:bg-[#201E1A] border border-[#1A1A1A]/15 dark:border-[#EAE5DD]/15 hover:border-[#1A1A1A]/40 dark:hover:border-[#EAE5DD]/40 transition-all group flex flex-col justify-between space-y-4 cursor-pointer"
            >
              <div className="space-y-2">
                <div className="w-8 h-8 bg-[#1A1A1A] dark:bg-[#EAE5DD] text-[#F5F2ED] dark:text-[#151412] flex items-center justify-center">
                  <Layers className="w-4 h-4" />
                </div>
                <h3 className="font-editorial text-xl italic text-[#1A1A1A] dark:text-[#EAE5DD]">
                  Explore Factors
                </h3>
                <p className="text-xs font-newsreader italic text-[#1A1A1A]/60 dark:text-[#EAE5DD]/60">
                  Inspect the deterministic health graph and understand factor contributions.
                </p>
              </div>
              <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-[#A38D7D] group-hover:underline flex items-center gap-1">
                View Architecture <ArrowRight className="w-3 h-3" />
              </span>
            </button>

          </div>

          {/* Developer Quick-Start Tool */}
          <div className="pt-6 border-t border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#1A1A1A]/60 dark:text-[#EAE5DD]/60">
            <span className="font-newsreader italic">
              Testing or evaluating SAAHAJ? Load our curated longitudinal demonstration dataset:
            </span>
            <button
              onClick={loadDevFixture}
              className="px-4 py-2 bg-[#1A1A1A] dark:bg-[#EAE5DD] text-[#F5F2ED] dark:text-[#151412] font-sans font-bold text-[10px] uppercase tracking-wider flex items-center gap-2 cursor-pointer hover:opacity-90 transition-opacity"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Load Sample Demonstration Data</span>
            </button>
          </div>
        </div>

        {/* Informational Assurance Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-[#FFFFFF] dark:bg-[#1A1916] border border-[#1A1A1A]/15 dark:border-[#EAE5DD]/12 space-y-2">
            <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-[#A38D7D]">
              01 &bull; Explicit Provenance
            </span>
            <h4 className="font-editorial text-lg italic text-[#1A1A1A] dark:text-[#EAE5DD]">
              Zero Inferred Biometrics
            </h4>
            <p className="text-xs font-newsreader italic text-[#1A1A1A]/70 dark:text-[#EAE5DD]/70 leading-relaxed">
              SAAHAJ never assumes blood pressures or lab numbers. Every score states exactly which data points were provided and which are missing.
            </p>
          </div>

          <div className="p-6 bg-[#FFFFFF] dark:bg-[#1A1916] border border-[#1A1A1A]/15 dark:border-[#EAE5DD]/12 space-y-2">
            <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-[#A38D7D]">
              02 &bull; Explainable Models
            </span>
            <h4 className="font-editorial text-lg italic text-[#1A1A1A] dark:text-[#EAE5DD]">
              SHAP Attributions
            </h4>
            <p className="text-xs font-newsreader italic text-[#1A1A1A]/70 dark:text-[#EAE5DD]/70 leading-relaxed">
              Statistical models show mathematical feature contributions and counterfactual simulations so you see the exact biological rationale.
            </p>
          </div>

          <div className="p-6 bg-[#FFFFFF] dark:bg-[#1A1916] border border-[#1A1A1A]/15 dark:border-[#EAE5DD]/12 space-y-2">
            <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-[#A38D7D]">
              03 &bull; Clinical Bridge
            </span>
            <h4 className="font-editorial text-lg italic text-[#1A1A1A] dark:text-[#EAE5DD]">
              Physician Consultation Prep
            </h4>
            <p className="text-xs font-newsreader italic text-[#1A1A1A]/70 dark:text-[#EAE5DD]/70 leading-relaxed">
              Synthesize findings into high-yield, structured doctor discussion agendas without alarmist self-diagnosis.
            </p>
          </div>
        </div>

      </div>
    );
  }

  // Active State with Data
  const bmi = userProfile 
    ? (userProfile.personal.weightKg / Math.pow(userProfile.personal.heightCm / 100, 2)).toFixed(1)
    : '—';

  const abnormalCount = documents.reduce((acc, doc) => acc + (doc.abnormalCount || 0), 0);

  return (
    <div className="space-y-8 animate-in fade-in">
      
      {/* 1. Top Patient Vitals & Health Profile Card */}
      <div className="p-6 sm:p-8 bg-[#FFFFFF] dark:bg-[#1A1916] border border-[#1A1A1A]/15 dark:border-[#EAE5DD]/12 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 pb-5 border-b border-[#1A1A1A]/15 dark:border-[#EAE5DD]/12">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="font-editorial text-3xl italic text-[#1A1A1A] dark:text-[#EAE5DD]">
                {userProfile?.personal.fullName || 'Active Patient Folio'}
              </h2>
              <span className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] px-2.5 py-0.5 border border-[#1A1A1A]/20 dark:border-[#EAE5DD]/20 bg-[#F5F2ED] dark:bg-[#201E1A] text-[#1A1A1A] dark:text-[#EAE5DD]">
                {userProfile?.personal.age ? `${userProfile.personal.age} YRS` : 'ADULT'} &bull; {userProfile?.personal.sex?.toUpperCase() || 'UNSPECIFIED'}
              </span>
              {isDevFixtureLoaded && (
                <span className="text-[9px] font-sans font-bold uppercase tracking-wider px-2 py-0.5 bg-[#A38D7D]/15 text-[#A38D7D] border border-[#A38D7D]/30">
                  Sample Dataset Active
                </span>
              )}
            </div>
            <p className="text-xs font-newsreader italic text-[#1A1A1A]/60 dark:text-[#EAE5DD]/60 mt-1">
              Active Folio &bull; {documents.length} Clinical Documents &bull; {timelineEvents.length} Chronology Events Logged
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAskSaahajOpen(true)}
              className="text-xs font-sans font-bold uppercase tracking-wider px-3.5 py-1.5 bg-[#1A1A1A] dark:bg-[#EAE5DD] text-[#F5F2ED] dark:text-[#151412] flex items-center gap-1.5 cursor-pointer hover:opacity-90 transition-opacity"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ask SAAHAJ</span>
            </button>
            <button
              onClick={() => setCurrentView('app-profile')}
              className="text-xs font-sans font-bold uppercase tracking-[0.15em] text-[#1A1A1A] dark:text-[#EAE5DD] hover:underline underline-offset-4 flex items-center gap-1.5 cursor-pointer"
            >
              <span>Edit Dossier</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Vitals Snapshot */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-1">
          <div className="p-4 bg-[#F5F2ED] dark:bg-[#201E1A] border border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10">
            <span className="text-[9px] font-sans font-bold uppercase tracking-[0.2em] text-[#A38D7D] block mb-1.5">Blood Pressure</span>
            <div className="flex items-baseline gap-1.5">
              <span className="font-editorial text-2xl italic text-[#1A1A1A] dark:text-[#EAE5DD]">
                {userProfile?.personal.bpSystolic ? `${userProfile.personal.bpSystolic}/${userProfile.personal.bpDiastolic}` : '—'}
              </span>
              <span className="text-[10px] font-newsreader italic text-[#1A1A1A]/50 dark:text-[#EAE5DD]/50">mmHg</span>
            </div>
            <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-[#A38D7D] mt-1 block">
              {userProfile?.personal.bpSystolic && userProfile.personal.bpSystolic >= 130 ? 'Stage 1 Controlled' : 'Recorded'}
            </span>
          </div>

          <div className="p-4 bg-[#F5F2ED] dark:bg-[#201E1A] border border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10">
            <span className="text-[9px] font-sans font-bold uppercase tracking-[0.2em] text-[#A38D7D] block mb-1.5">Body Mass Index</span>
            <div className="flex items-baseline gap-1.5">
              <span className="font-editorial text-2xl italic text-[#1A1A1A] dark:text-[#EAE5DD]">{bmi}</span>
              <span className="text-[10px] font-newsreader italic text-[#1A1A1A]/50 dark:text-[#EAE5DD]/50">kg/m²</span>
            </div>
            <span className="text-[10px] font-sans text-[#1A1A1A]/70 dark:text-[#EAE5DD]/70 mt-1 block">
              Weight: {userProfile?.personal.weightKg || '—'} kg
            </span>
          </div>

          <div className="p-4 bg-[#F5F2ED] dark:bg-[#201E1A] border border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10">
            <span className="text-[9px] font-sans font-bold uppercase tracking-[0.2em] text-[#A38D7D] block mb-1.5">Ingested Reports</span>
            <div className="flex items-baseline gap-1.5">
              <span className="font-editorial text-2xl italic text-[#1A1A1A] dark:text-[#EAE5DD]">
                {documents.length}
              </span>
              <span className="text-[10px] font-newsreader italic text-[#1A1A1A]/50 dark:text-[#EAE5DD]/50">Panels</span>
            </div>
            <span className="text-[10px] font-sans text-[#1A1A1A]/70 dark:text-[#EAE5DD]/70 mt-1 block">
              {abnormalCount} Flagged Indices
            </span>
          </div>

          <div className="p-4 bg-[#F5F2ED] dark:bg-[#201E1A] border border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10">
            <span className="text-[9px] font-sans font-bold uppercase tracking-[0.2em] text-[#A38D7D] block mb-1.5">Next Consultation</span>
            <div className="flex items-baseline gap-1.5">
              <span className="font-editorial text-xl italic text-[#1A1A1A] dark:text-[#EAE5DD]">
                Sep 05, 2026
              </span>
            </div>
            <button
              onClick={() => setCurrentView('app-appointment-prep')}
              className="text-[10px] font-sans font-bold uppercase text-[#A38D7D] hover:underline mt-1 block cursor-pointer"
            >
              Prepare Agenda &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* 2. Historical Health Trends Line Chart (Recharts) */}
      <HistoricalTrendsChart
        userProfile={userProfile}
        documents={documents}
        timelineEvents={timelineEvents}
      />

      {/* 3. Attention Needed & Positive Trajectory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Observations */}
        <div className="p-6 bg-[#FFFFFF] dark:bg-[#1A1916] border border-[#1A1A1A]/15 dark:border-[#EAE5DD]/12 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10">
              <h3 className="font-editorial text-xl italic text-[#1A1A1A] dark:text-[#EAE5DD] flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-[#A38D7D]" />
                <span>Observations for Physician Review</span>
              </h3>
              <span className="text-[9px] font-sans font-bold uppercase tracking-[0.2em] px-2 py-0.5 border border-[#1A1A1A]/15 dark:border-[#EAE5DD]/15 bg-[#F5F2ED] dark:bg-[#201E1A] text-[#1A1A1A] dark:text-[#EAE5DD]">
                {abnormalCount > 0 ? `${abnormalCount} INDICES` : '0 INDICES'}
              </span>
            </div>

            <div className="space-y-3">
              {documents.length > 0 && (documents[0].extractedParameters || []).filter(p => p.status !== 'within_range').slice(0, 2).map((p, idx) => (
                <div key={idx} className="p-3.5 bg-[#F5F2ED] dark:bg-[#201E1A] border border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10 space-y-1">
                  <div className="flex items-center justify-between text-xs font-sans font-bold uppercase tracking-wider text-[#1A1A1A] dark:text-[#EAE5DD]">
                    <span>{p.name}</span>
                    <span className="font-mono-code text-[#A38D7D]">{p.value} {p.unit} ({p.referenceRangeText})</span>
                  </div>
                  <p className="text-xs font-newsreader italic text-[#1A1A1A]/75 dark:text-[#EAE5DD]/75 leading-relaxed">
                    {p.patientExplanation || 'Measured above standard reference threshold. Discuss with clinician during next evaluation.'}
                  </p>
                </div>
              ))}

              {abnormalCount === 0 && (
                <div className="p-4 bg-[#F5F2ED] dark:bg-[#201E1A] border border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10 text-xs font-newsreader italic text-[#1A1A1A]/70 dark:text-[#EAE5DD]/70">
                  No abnormal flags detected across current records.
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => setCurrentView('app-appointment-prep')}
            className="w-full py-3 text-xs font-sans font-bold uppercase tracking-[0.18em] text-[#1A1A1A] dark:text-[#EAE5DD] bg-transparent hover:bg-[#ECE8E1] dark:hover:bg-[#25231F] border border-[#1A1A1A]/20 dark:border-[#EAE5DD]/20 transition-colors flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            <span>Review Doctor Discussion Questions</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Longitudinal Trajectory */}
        <div className="p-6 bg-[#FFFFFF] dark:bg-[#1A1916] border border-[#1A1A1A]/15 dark:border-[#EAE5DD]/12 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10">
              <h3 className="font-editorial text-xl italic text-[#1A1A1A] dark:text-[#EAE5DD] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#A38D7D]" />
                <span>Multi-Point Longitudinal Trajectory</span>
              </h3>
              <span className="text-[9px] font-sans font-bold uppercase tracking-[0.2em] px-2 py-0.5 border border-[#1A1A1A]/15 dark:border-[#EAE5DD]/15 bg-[#F5F2ED] dark:bg-[#201E1A] text-[#1A1A1A] dark:text-[#EAE5DD]">
                {timelineEvents.length} EVENTS
              </span>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 bg-[#F5F2ED] dark:bg-[#201E1A] border border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10 space-y-1">
                <div className="flex items-center justify-between text-xs font-sans font-bold uppercase tracking-wider text-[#1A1A1A] dark:text-[#EAE5DD]">
                  <span>Fasting Glucose Trend</span>
                  <span className="text-[#A38D7D] font-mono-code font-bold">134 &rarr; 118 mg/dL</span>
                </div>
                <p className="text-xs font-newsreader italic text-[#1A1A1A]/75 dark:text-[#EAE5DD]/75 leading-relaxed">
                  Consistent downward trajectory observed over the past 6 months following aerobic interventions.
                </p>
              </div>

              <div className="p-3.5 bg-[#F5F2ED] dark:bg-[#201E1A] border border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10 space-y-1">
                <div className="flex items-center justify-between text-xs font-sans font-bold uppercase tracking-wider text-[#1A1A1A] dark:text-[#EAE5DD]">
                  <span>Sleep & Recovery</span>
                  <span className="font-mono-code text-[#A38D7D]">{userProfile?.lifestyle?.sleepHoursPerNight || 6.5} hrs/night</span>
                </div>
                <p className="text-xs font-newsreader italic text-[#1A1A1A]/75 dark:text-[#EAE5DD]/75 leading-relaxed">
                  Adequate nocturnal restorative rest reported in personal lifestyle dossier.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => setCurrentView('app-longitudinal-risk')}
            className="w-full py-3 text-xs font-sans font-bold uppercase tracking-[0.18em] text-[#1A1A1A] dark:text-[#EAE5DD] bg-transparent hover:bg-[#ECE8E1] dark:hover:bg-[#25231F] border border-[#1A1A1A]/20 dark:border-[#EAE5DD]/20 transition-colors flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            <span>Open Multi-Point Story Mode</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

      {/* 3. Action Strip & Data Reset */}
      <div className="p-4 bg-[#FFFFFF] dark:bg-[#1A1916] border border-[#1A1A1A]/15 dark:border-[#EAE5DD]/12 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentView('app-health-input')}
            className="px-4 py-2 bg-[#F5F2ED] dark:bg-[#201E1A] border border-[#1A1A1A]/15 dark:border-[#EAE5DD]/15 font-sans font-bold text-[10px] uppercase tracking-wider text-[#1A1A1A] dark:text-[#EAE5DD] hover:bg-[#ECE8E1] cursor-pointer flex items-center gap-1.5"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Enter New Measurement</span>
          </button>

          <button
            onClick={() => setCurrentView('app-records')}
            className="px-4 py-2 bg-[#F5F2ED] dark:bg-[#201E1A] border border-[#1A1A1A]/15 dark:border-[#EAE5DD]/15 font-sans font-bold text-[10px] uppercase tracking-wider text-[#1A1A1A] dark:text-[#EAE5DD] hover:bg-[#ECE8E1] cursor-pointer flex items-center gap-1.5"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload New Report</span>
          </button>
        </div>

        <button
          onClick={clearAllData}
          className="text-[10px] font-sans font-bold uppercase tracking-wider text-[#A38D7D] hover:text-[#1A1A1A] dark:hover:text-[#EAE5DD] flex items-center gap-1.5 cursor-pointer underline underline-offset-4"
        >
          <Trash2 className="w-3 h-3" />
          <span>Reset All Folio Data</span>
        </button>
      </div>

      {/* Contextual Ask SAAHAJ Drawer */}
      <AskSaahajDrawer
        isOpen={isAskSaahajOpen}
        onClose={() => setIsAskSaahajOpen(false)}
        contextType="Health Overview"
        currentContext={{
          userProfile,
          documentsCount: documents.length,
          abnormalBiomarkersCount: abnormalCount,
          timelineEventsCount: timelineEvents.length
        }}
        userRole="patient"
      />

    </div>
  );
};
