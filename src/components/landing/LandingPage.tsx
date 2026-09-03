import React, { useState } from 'react';
import { 
  Activity, 
  ArrowRight, 
  ShieldCheck, 
  FileText, 
  TrendingUp, 
  Eye, 
  Cpu, 
  Layers, 
  Stethoscope, 
  User, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Lock, 
  HelpCircle,
  Database,
  LineChart,
  Search,
  BookOpen
} from 'lucide-react';
import { HealthIntelligence3D } from '../canvas/HealthIntelligence3D';
import { ThemeMode, UserRole } from '../../types';

interface LandingPageProps {
  setCurrentView: (view: string) => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  theme: ThemeMode;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  setCurrentView,
  userRole,
  setUserRole,
  theme
}) => {
  const [activePipelineStep, setActivePipelineStep] = useState(1);
  const isDark = theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  const sampleSearchQueries = [
    { num: "01", text: "My blood report", action: "app-report-viewer", desc: "Split-view structured parameter extraction with bounding citations" },
    { num: "02", text: "Compare two reports", action: "app-compare", desc: "Longitudinal January vs August biomarker delta tracking" },
    { num: "03", text: "Understand Chest X-Ray", action: "app-imaging", desc: "Grad-CAM saliency heatmap and deep learning radiological findings" },
    { num: "04", text: "Check heart-risk factors", action: "app-risk-assessment", desc: "Calibrated tabular ML screening (ASCVD, FIB-4, Diabetes)" },
    { num: "05", text: "Questions for doctor", action: "app-appointment-prep", desc: "Clinically structured consultation briefcase & symptom journal" }
  ];

  const pipelineStages = [
    {
      id: 1,
      num: "01",
      title: "Raw Clinical Ingestion",
      icon: FileText,
      subtitle: "Unstructured Reports & Scans",
      description: "Laboratory PDFs, DICOM radiographs, and patient-recorded logs enter a secure, client-encrypted zero-trust ingestion layer.",
      badge: "Multimodal Ingestion",
    },
    {
      id: 2,
      num: "02",
      title: "Structured Extraction",
      icon: Database,
      subtitle: "Deterministic Entity Normalization",
      description: "DeepDoc OCR and clinical BioNLP identify biomarkers, reference intervals, units, and page coordinates with complete provenance.",
      badge: "99.2% Extraction Precision",
    },
    {
      id: 3,
      num: "03",
      title: "Specialized ML Ensembles",
      icon: Cpu,
      subtitle: "Calibrated Statistical Inference",
      description: "Tabular gradient boosters (XGBoost/Random Forest) screen risk signals, while deep neural nets (DenseNet/Grad-CAM) analyze imaging patterns.",
      badge: "Brier-Calibrated ML",
    },
    {
      id: 4,
      num: "04",
      title: "Evidence Grounding (RAG)",
      icon: BookOpen,
      subtitle: "Clinical Knowledge Association",
      description: "Every finding is retrieved and linked against peer-reviewed clinical guidelines and standard physiological bounds without hallucinations.",
      badge: "Verified Citations",
    },
    {
      id: 5,
      num: "05",
      title: "Clarity & Synthesis",
      icon: Sparkles,
      subtitle: "Clear Patient & Clinician Folios",
      description: "Raw diagnostic parameters become clear, uncertainty-aware explanations for patients and structured SOAP briefings for physicians.",
      badge: "Physician-in-the-Loop",
    }
  ];

  return (
    <div className="space-y-24 sm:space-y-32 pb-24">
      
      {/* 1. HERO SECTION - EDITORIAL BROADSHEET */}
      <section className="relative pt-8 sm:pt-16 px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 w-full max-w-[1600px] mx-auto">
        
        {/* Top Masthead Eyebrow */}
        <div className="border-b border-[var(--border-primary)] pb-4 mb-8 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
          <span className="text-[10px] tracking-[0.3em] font-sans font-bold uppercase text-[var(--accent-secondary)]">
            CLINICAL HEALTH INTELLIGENCE
          </span>
          <span className="text-[10px] font-mono-code text-[var(--text-muted)] uppercase tracking-widest">
            DETERMINISTIC OCR &bull; CALIBRATED ML &bull; ZERO HALLUCINATION
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 xl:gap-16 items-center">
          
          {/* Left Hero Narrative */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8 text-left">
            
            <div className="space-y-4">
              <h1 className="font-editorial text-5xl sm:text-6xl lg:text-7xl font-light tracking-tight text-[var(--text-primary)] leading-[1.02]">
                Understand your health. <br />
                <span className="italic font-normal text-[var(--text-primary)]">
                  Navigate it with serene confidence.
                </span>
              </h1>
              <p className="font-newsreader text-lg sm:text-xl text-[var(--text-secondary)] max-w-2xl leading-relaxed">
                Transform medical reports, longitudinal biomarkers, and complex radiological findings into clear, evidence-grounded insights — crafted for both patient clarity and physician synthesis.
              </p>
            </div>

            {/* Editorial CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              <button
                id="hero-primary-cta"
                onClick={() => setCurrentView('app-overview')}
                className="flex items-center justify-center gap-3 px-8 py-3.5 text-xs font-sans font-bold uppercase tracking-[0.2em] text-[var(--bg-primary)] bg-[var(--text-primary)] hover:opacity-90 border border-[var(--border-primary)] transition-all group cursor-pointer shadow-xs"
              >
                <span>Open Health Folio</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                id="hero-secondary-cta"
                onClick={() => {
                  const el = document.getElementById('how-it-works-section');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="flex items-center justify-center gap-2 px-6 py-3.5 text-xs font-sans font-bold uppercase tracking-[0.18em] text-[var(--text-primary)] bg-[var(--surface-primary)] hover:bg-[var(--surface-secondary)] border border-[var(--border-primary)] transition-all cursor-pointer shadow-2xs"
              >
                <span>Read The Architecture</span>
              </button>
            </div>

            {/* Quick Metrics Editorial Rules */}
            <div className="pt-6 border-t border-[var(--border-secondary)] grid grid-cols-3 gap-6 text-xs">
              <div className="border-l-2 border-[var(--border-primary)] pl-3">
                <span className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-[var(--accent-secondary)] block mb-1">01 / MODES</span>
                <span className="font-editorial text-lg italic text-[var(--text-primary)]">Patient & Clinician</span>
              </div>
              <div className="border-l-2 border-[var(--border-primary)] pl-3">
                <span className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-[var(--accent-secondary)] block mb-1">02 / GROUNDING</span>
                <span className="font-editorial text-lg italic text-[var(--text-primary)]">Exact OCR Bounding</span>
              </div>
              <div className="border-l-2 border-[var(--border-primary)] pl-3">
                <span className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-[var(--accent-secondary)] block mb-1">03 / INFERENCE</span>
                <span className="font-editorial text-lg italic text-[var(--text-primary)]">Calibrated Ensembles</span>
              </div>
            </div>

          </div>

          {/* Right Hero 3D Health Core Scene */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            <div className="w-full max-w-lg aspect-square lg:aspect-auto lg:h-[460px] xl:h-[500px] relative bg-[var(--surface-secondary)] border border-[var(--border-primary)] p-2 shadow-sm">
              <HealthIntelligence3D isDark={isDark} />
              
              {/* Floating Context Label */}
              <div className="absolute bottom-4 left-4 right-4 bg-[var(--surface-primary)] p-3 border border-[var(--border-primary)] flex items-center justify-between text-[10px] font-mono-code uppercase tracking-wider shadow-xs">
                <span className="flex items-center gap-2 text-[var(--text-primary)]">
                  <span className="w-2 h-2 bg-[var(--accent-secondary)]" />
                  <span>Multimodal Diagnostic Core</span>
                </span>
                <span className="text-[var(--text-muted)]">Active Stream</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 2. HERO HEALTH SEARCH / INTENT DIRECTORY */}
      <section className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        <div className="p-8 sm:p-10 bg-[var(--surface-primary)] border border-[var(--border-primary)] shadow-sm">
          
          <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-4 pb-6 mb-8 border-b border-[var(--border-secondary)]">
            <div>
              <span className="text-[10px] font-sans font-bold uppercase tracking-[0.25em] text-[var(--accent-secondary)] block mb-1">
                DIRECTORY / CLINICAL OBJECTIVES
              </span>
              <h3 className="font-editorial text-2xl sm:text-3xl italic text-[var(--text-primary)]">
                What would you like to investigate today?
              </h3>
            </div>
            <span className="text-[11px] font-newsreader italic text-[var(--text-muted)]">
              Direct pathways into specialized diagnostic workflows
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {sampleSearchQueries.map((item, index) => (
              <button
                key={index}
                id={`hero-query-btn-${index}`}
                onClick={() => setCurrentView(item.action)}
                className="group flex flex-col justify-between p-5 bg-[var(--surface-secondary)] hover:bg-[var(--surface-primary)] border border-[var(--border-secondary)] hover:border-[var(--border-primary)] text-left transition-all cursor-pointer shadow-2xs"
              >
                <div>
                  <span className="text-[10px] font-mono-code font-bold text-[var(--accent-secondary)] block mb-2">
                    {item.num} / PATH
                  </span>
                  <p className="font-editorial text-lg italic text-[var(--text-primary)] group-hover:underline underline-offset-4 decoration-[#A38D7D] mb-2">
                    "{item.text}"
                  </p>
                  <p className="text-[11px] text-[var(--text-secondary)] font-sans leading-relaxed">
                    {item.desc}
                  </p>
                </div>
                <div className="pt-4 mt-4 border-t border-[var(--border-secondary)] flex items-center justify-between text-[10px] font-sans font-bold uppercase tracking-widest text-[var(--text-muted)] group-hover:text-[var(--text-primary)]">
                  <span>Enter</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 3. FOUR TRUST PILLARS SECTION */}
      <section className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        <div className="border-b border-[var(--border-secondary)] pb-6 mb-12 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-[10px] font-sans font-bold uppercase tracking-[0.3em] text-[var(--accent-secondary)] block mb-1">
              FOUNDATIONS & REASONING
            </span>
            <h2 className="font-editorial text-3xl sm:text-4xl font-light italic text-[var(--text-primary)]">
              Four Pillars of Purpose-Built Health Intelligence
            </h2>
          </div>
          <p className="text-xs sm:text-sm font-newsreader italic text-[var(--text-secondary)] max-w-md">
            Rejecting black-box generic chatbots in favor of deterministic extraction, transparent statistical intervals, and clear provenance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Pillar 1: Specialized Models */}
          <div className="p-6 bg-[var(--surface-primary)] border border-[var(--border-primary)] space-y-4 shadow-2xs">
            <span className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-[var(--accent-secondary)]">
              01 / MODELS
            </span>
            <h3 className="font-editorial text-2xl italic text-[var(--text-primary)]">
              Specialized Ensembles
            </h3>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-sans leading-relaxed">
              Dedicated tabular gradient boosters for cardiovascular and metabolic risk, paired with convolutional deep neural networks for radiological analysis.
            </p>
          </div>

          {/* Pillar 2: Medical Documents */}
          <div className="p-6 bg-[var(--surface-primary)] border border-[var(--border-primary)] space-y-4 shadow-2xs">
            <span className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-[var(--accent-secondary)]">
              02 / EXTRACTION
            </span>
            <h3 className="font-editorial text-2xl italic text-[var(--text-primary)]">
              Document Grounding
            </h3>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-sans leading-relaxed">
              Side-by-side report viewer that extracts exact parameters, reference intervals, and page coordinates without conflating extracted fact and interpretation.
            </p>
          </div>

          {/* Pillar 3: Evidence & Sources */}
          <div className="p-6 bg-[var(--surface-primary)] border border-[var(--border-primary)] space-y-4 shadow-2xs">
            <span className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-[var(--accent-secondary)]">
              03 / EVIDENCE
            </span>
            <h3 className="font-editorial text-2xl italic text-[var(--text-primary)]">
              Clinical Citations
            </h3>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-sans leading-relaxed">
              Every explanation links directly to indexed medical literature and established physiological reference bounds. Uncertainty bounds are explicit.
            </p>
          </div>

          {/* Pillar 4: Human-in-the-loop */}
          <div className="p-6 bg-[var(--surface-primary)] border border-[var(--border-primary)] space-y-4 shadow-2xs">
            <span className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-[var(--accent-secondary)]">
              04 / CONTEXT
            </span>
            <h3 className="font-editorial text-2xl italic text-[var(--text-primary)]">
              Physician Partnership
            </h3>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-sans leading-relaxed">
              Built to assist, never replace, the physician. SAAHAJ prepares consultations, calculates biomarker trajectories, and preserves physician decision-making.
            </p>
          </div>

        </div>
      </section>

      {/* 4. HEALTH INTELLIGENCE TRANSFORMATION FLOW */}
      <section id="how-it-works-section" className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        <div className="p-8 sm:p-12 bg-[var(--surface-secondary)] border border-[var(--border-primary)] shadow-sm">
          
          <div className="border-b border-[var(--border-secondary)] pb-6 mb-8 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
            <div>
              <span className="text-[10px] font-sans font-bold uppercase tracking-[0.3em] text-[var(--accent-secondary)] block mb-1">
                SYSTEM ARCHITECTURE / PIPELINE
              </span>
              <h2 className="font-editorial text-3xl sm:text-4xl font-light italic text-[var(--text-primary)]">
                How Medical Data Becomes Understanding
              </h2>
            </div>
            <span className="text-xs font-mono-code text-[var(--text-muted)]">
              5-STAGE PIPELINE
            </span>
          </div>

          {/* Interactive Step Switcher Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
            {pipelineStages.map((stage) => {
              const isActive = activePipelineStep === stage.id;
              return (
                <button
                  key={stage.id}
                  onClick={() => setActivePipelineStep(stage.id)}
                  className={`p-4 text-left border transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[var(--surface-primary)] border-[var(--text-primary)] shadow-xs'
                      : 'bg-[var(--bg-primary)] border-[var(--border-secondary)] hover:border-[var(--border-primary)]'
                  }`}
                >
                  <span className="text-[10px] font-mono-code font-bold text-[var(--accent-secondary)] block mb-1">
                    {stage.num} / LAYER
                  </span>
                  <p className="font-editorial text-base italic text-[var(--text-primary)] truncate">
                    {stage.title}
                  </p>
                  <p className="text-[10px] font-sans uppercase tracking-wider text-[var(--text-muted)] truncate mt-1">
                    {stage.subtitle}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Selected Stage Detail Card */}
          {(() => {
            const currentStage = pipelineStages.find(s => s.id === activePipelineStep) || pipelineStages[0];
            return (
              <div className="p-8 bg-[var(--surface-primary)] border border-[var(--border-primary)] grid grid-cols-1 md:grid-cols-12 gap-8 items-center shadow-xs">
                <div className="md:col-span-7 space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-mono-code font-bold uppercase tracking-wider px-2 py-0.5 border border-[var(--border-secondary)] bg-[var(--surface-secondary)] text-[var(--text-primary)]">
                      {currentStage.badge}
                    </span>
                    <span className="text-xs font-mono-code text-[var(--text-muted)]">
                      STAGE {currentStage.num} OF 05
                    </span>
                  </div>
                  <h3 className="font-editorial text-3xl italic text-[var(--text-primary)]">
                    {currentStage.title}: {currentStage.subtitle}
                  </h3>
                  <p className="font-newsreader text-base sm:text-lg text-[var(--text-secondary)] leading-relaxed">
                    {currentStage.description}
                  </p>
                  <div className="pt-2">
                    <button
                      onClick={() => setCurrentView('app-overview')}
                      className="inline-flex items-center gap-2 text-xs font-sans font-bold uppercase tracking-widest text-[var(--text-primary)] hover:underline underline-offset-4 decoration-[#A38D7D] cursor-pointer"
                    >
                      <span>Explore this in the folio</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <div className="md:col-span-5 p-6 bg-[var(--surface-secondary)] border border-[var(--border-secondary)] font-mono-code text-xs space-y-3">
                  <div className="flex items-center justify-between text-[var(--text-muted)] pb-2 border-b border-[var(--border-secondary)]">
                    <span>LAYER OUTPUT SCHEMA</span>
                    <span className="text-[var(--accent-secondary)] font-bold">VERIFIED</span>
                  </div>
                  <p className="text-[var(--text-primary)]">
                    <strong>Input:</strong> Multi-format diagnostic records & DICOM
                  </p>
                  <p className="text-[var(--text-primary)]">
                    <strong>Execution:</strong> Sandboxed deterministic pipeline
                  </p>
                  <p className="text-[var(--text-primary)]">
                    <strong>Audit:</strong> Model provenance attached to every record
                  </p>
                </div>
              </div>
            );
          })()}

        </div>
      </section>

      {/* 5. PATIENT vs CLINICIAN DUAL EXPERIENCE */}
      <section className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        <div className="border-b border-[var(--border-secondary)] pb-6 mb-12 flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
          <div>
            <span className="text-[10px] font-sans font-bold uppercase tracking-[0.3em] text-[var(--accent-secondary)] block mb-1">
              DUAL AUDIENCE ARCHITECTURE
            </span>
            <h2 className="font-editorial text-3xl sm:text-4xl font-light italic text-[var(--text-primary)]">
              Tailored for Both Sides of Clinical Consultation
            </h2>
          </div>
          <p className="text-xs sm:text-sm font-newsreader italic text-[var(--text-secondary)] max-w-md">
            Bridging the communication gap between patient uncertainty and clinical consultation.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Patient Card */}
          <div className="p-8 sm:p-10 bg-[var(--surface-primary)] border border-[var(--border-primary)] space-y-6 flex flex-col justify-between shadow-2xs">
            <div className="space-y-4">
              <span className="text-[10px] font-sans font-bold uppercase tracking-[0.25em] text-[var(--accent-secondary)]">
                01 / PATIENT EXPERIENCE
              </span>
              <h3 className="font-editorial text-3xl italic text-[var(--text-primary)]">
                "What is going on with my health numbers?"
              </h3>
              <p className="text-sm text-[var(--text-secondary)] font-newsreader text-base leading-relaxed">
                Deconstruct clinical jargon, track how your biomarkers fluctuate between visits, and walk into your next consultation prepared with clear questions.
              </p>
              
              <ul className="space-y-3 text-xs sm:text-sm text-[var(--text-secondary)] pt-2 font-sans">
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 bg-[var(--accent-secondary)] mt-1.5 shrink-0" />
                  <span>Split-view laboratory report viewer with plain-language explanations</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 bg-[var(--accent-secondary)] mt-1.5 shrink-0" />
                  <span>"Compare My Reports" longitudinal delta tracking (Jan vs Aug)</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 bg-[var(--accent-secondary)] mt-1.5 shrink-0" />
                  <span>"Doctor Briefcase" structured consultation question generator</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => { setUserRole('patient'); setCurrentView('app-overview'); }}
              className="w-full py-3.5 text-center text-xs font-sans font-bold uppercase tracking-[0.2em] text-[var(--bg-primary)] bg-[var(--text-primary)] hover:opacity-90 border border-[var(--border-primary)] flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
            >
              <span>Explore Patient Folio</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Clinician Card */}
          <div className="p-8 sm:p-10 bg-[var(--surface-primary)] border border-[var(--border-primary)] space-y-6 flex flex-col justify-between shadow-2xs">
            <div className="space-y-4">
              <span className="text-[10px] font-sans font-bold uppercase tracking-[0.25em] text-[var(--accent-secondary)]">
                02 / CLINICIAN SUITE
              </span>
              <h3 className="font-editorial text-3xl italic text-[var(--text-primary)]">
                "Instant structured synthesis & longitudinal triage."
              </h3>
              <p className="text-sm text-[var(--text-secondary)] font-newsreader text-base leading-relaxed">
                Surface abnormal biomarker flags in seconds, inspect tabular risk models with SHAP factor weights, and generate EHR-ready SOAP consultation drafts.
              </p>
              
              <ul className="space-y-3 text-xs sm:text-sm text-[var(--text-secondary)] pt-2 font-sans">
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 bg-[var(--accent-secondary)] mt-1.5 shrink-0" />
                  <span>Instant abnormal biomarker triage & missing data alerts</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 bg-[var(--accent-secondary)] mt-1.5 shrink-0" />
                  <span>Explainable Grad-CAM heatmaps for chest radiographs</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 bg-[var(--accent-secondary)] mt-1.5 shrink-0" />
                  <span>Automated clinical SOAP synthesis & physician scratchpad</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => { setUserRole('clinician'); setCurrentView('app-clinician'); }}
              className="w-full py-3.5 text-center text-xs font-sans font-bold uppercase tracking-[0.2em] text-[var(--text-primary)] bg-[var(--surface-primary)] hover:bg-[var(--surface-secondary)] border border-[var(--border-primary)] flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-2xs"
            >
              <span>Explore Clinician Suite</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </section>

      {/* 6. CALL TO ACTION SECTION */}
      <section className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        <div className="p-10 sm:p-16 bg-[var(--surface-primary)] border border-[var(--border-primary)] shadow-md">
          <div className="max-w-3xl space-y-6">
            <span className="text-[10px] font-sans font-bold uppercase tracking-[0.3em] text-[var(--accent-secondary)]">
              HEALTH INTELLIGENCE PLATFORM
            </span>
            <h2 className="font-editorial text-4xl sm:text-5xl font-light italic tracking-tight text-[var(--text-primary)]">
              Ready to explore purpose-built health intelligence?
            </h2>
            <p className="font-newsreader text-lg text-[var(--text-secondary)] leading-relaxed max-w-2xl">
              Inspect preloaded clinical laboratory panels, radiological studies with Grad-CAM overlays, and calibrated multi-system risk screening models.
            </p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-4">
              <button
                onClick={() => setCurrentView('app-overview')}
                className="px-8 py-3.5 text-xs font-sans font-bold uppercase tracking-[0.2em] text-[var(--bg-primary)] bg-[var(--text-primary)] hover:opacity-90 border border-[var(--border-primary)] transition-all cursor-pointer text-center shadow-xs"
              >
                Launch SAAHAJ Workspace
              </button>
              <button
                onClick={() => setCurrentView('app-compare')}
                className="px-8 py-3.5 text-xs font-sans font-bold uppercase tracking-[0.18em] text-[var(--text-primary)] bg-[var(--surface-primary)] hover:bg-[var(--surface-secondary)] border border-[var(--border-primary)] transition-all cursor-pointer text-center shadow-2xs"
              >
                View Biomarker Delta Demo
              </button>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
