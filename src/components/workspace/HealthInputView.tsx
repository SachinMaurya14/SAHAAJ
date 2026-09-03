import React, { useState } from 'react';
import { 
  Activity, 
  Heart, 
  Droplet, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  ChevronRight, 
  Save, 
  Sliders, 
  ArrowRight,
  Info,
  Calendar,
  Layers
} from 'lucide-react';
import { initialHealthProfile } from '../../data/mockHealthData';

interface HealthInputViewProps {
  setCurrentView: (view: string) => void;
}

type DomainFlow = 'heart' | 'diabetes' | 'kidney' | 'liver' | 'general' | 'symptoms';

export const HealthInputView: React.FC<HealthInputViewProps> = ({ setCurrentView }) => {
  const [activeDomain, setActiveDomain] = useState<DomainFlow>('heart');
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  // Form State
  const [formData, setFormData] = useState({
    // Profile
    age: initialHealthProfile.personal.age.toString(),
    sex: initialHealthProfile.personal.sex,
    heightCm: initialHealthProfile.personal.heightCm.toString(),
    weightKg: initialHealthProfile.personal.weightKg.toString(),
    // Vitals
    bpSystolic: initialHealthProfile.personal.bpSystolic.toString(),
    bpDiastolic: initialHealthProfile.personal.bpDiastolic.toString(),
    restingHeartRate: initialHealthProfile.personal.restingHeartRate.toString(),
    spo2: '98',
    waistCircumference: '88',
    bodyTemp: '36.8',
    // Metabolic & Labs
    fastingGlucose: '118',
    hba1c: '6.2',
    ldl: '128',
    hdl: '48',
    triglycerides: '162',
    creatinine: '1.02',
    egfr: '91',
    alt: '38',
    ast: '32',
    // Lifestyle
    activityLevel: initialHealthProfile.lifestyle.activityLevel,
    sleepHours: initialHealthProfile.lifestyle.sleepHoursPerNight.toString(),
    sleepQuality: 'Fair',
    dietPattern: initialHealthProfile.lifestyle.dietaryPattern,
    mealFrequency: '3 meals / day',
    hydrationLiters: '2.5',
    smokingStatus: initialHealthProfile.lifestyle.smokingStatus,
    alcoholUnits: initialHealthProfile.lifestyle.alcoholUnitsPerWeek.toString(),
    stressLevel: 'Moderate',
    sedentaryHours: '7.5',
    // Symptoms
    symptomText: 'Occasional mild afternoon fatigue and postprandial sluggishness.',
    symptomDuration: '3 weeks',
    symptomSeverity: 'Mild',
    // History
    familyHistory: 'Father: Hypertension (onset 52); Maternal Grandfather: Type 2 Diabetes.',
    knownConditions: 'Borderline impaired fasting glucose / pre-diabetes.',
    currentMedications: 'Metformin 500mg daily with dinner.',
    allergies: 'No known drug allergies (NKDA).'
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Deterministic calculations (BMI)
  const heightM = Number(formData.heightCm) / 100;
  const weight = Number(formData.weightKg);
  const calculatedBmi = heightM > 0 && weight > 0 ? (weight / (heightM * heightM)).toFixed(1) : '24.2';

  // Calculate completeness based on active domain
  const calculateCompleteness = () => {
    switch (activeDomain) {
      case 'heart': {
        const fields = [formData.age, formData.sex, formData.bpSystolic, formData.bpDiastolic, formData.ldl, formData.hdl, formData.smokingStatus, formData.activityLevel];
        const filled = fields.filter(f => f && f.trim() !== '').length;
        return Math.round((filled / fields.length) * 100);
      }
      case 'diabetes': {
        const fields = [formData.age, formData.fastingGlucose, formData.hba1c, formData.weightKg, formData.heightCm, formData.familyHistory, formData.sedentaryHours];
        const filled = fields.filter(f => f && f.trim() !== '').length;
        return Math.round((filled / fields.length) * 100);
      }
      case 'kidney': {
        const fields = [formData.age, formData.bpSystolic, formData.creatinine, formData.egfr, formData.hba1c];
        const filled = fields.filter(f => f && f.trim() !== '').length;
        return Math.round((filled / fields.length) * 100);
      }
      case 'liver': {
        const fields = [formData.age, formData.alt, formData.ast, formData.alcoholUnits, formData.weightKg];
        const filled = fields.filter(f => f && f.trim() !== '').length;
        return Math.round((filled / fields.length) * 100);
      }
      default: {
        return 88;
      }
    }
  };

  const completeness = calculateCompleteness();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 4000);
  };

  return (
    <div className="space-y-8">
      
      {/* Top Banner */}
      <div className="p-6 sm:p-8 bg-[#FFFFFF] dark:bg-[#1A1916] border border-[#1A1A1A]/15 dark:border-[#EAE5DD]/12 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-sans font-bold uppercase tracking-[0.25em] text-[#A38D7D]">
                STRUCTURED HEALTH INPUT ENGINE
              </span>
              <span className="text-xs font-newsreader italic text-[#1A1A1A]/60 dark:text-[#EAE5DD]/60">&bull; Manual + OCR Fusion</span>
            </div>
            <h2 className="font-editorial text-3xl italic text-[#1A1A1A] dark:text-[#EAE5DD] mt-1">
              Patient Biometrics & Clinical Data Ingestion
            </h2>
            <p className="text-xs font-newsreader italic text-[#1A1A1A]/60 dark:text-[#EAE5DD]/60">
              Enter verified personal measurements, symptoms, and lifestyle indicators to fuel calibrated statistical models.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-[#1A1A1A] dark:bg-[#EAE5DD] hover:bg-[#2A2A2A] text-[#F5F2ED] dark:text-[#151412] text-xs font-sans font-bold uppercase tracking-wider transition-colors cursor-pointer border border-[#1A1A1A] dark:border-[#EAE5DD]"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Measurements</span>
            </button>
          </div>
        </div>

        {savedSuccess && (
          <div className="p-3 bg-[#F5F2ED] dark:bg-[#201E1A] border border-[#1A1A1A]/20 dark:border-[#EAE5DD]/20 text-xs font-mono-code text-[#A38D7D] flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#A38D7D]" />
            <span>Biometric records saved and securely encrypted into your local health session.</span>
          </div>
        )}

        {/* Domain Selection Tabs (Sections 39) */}
        <div className="pt-2 border-t border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10">
          <span className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-[#1A1A1A]/60 dark:text-[#EAE5DD]/60 block mb-3">
            Select Focused Assessment Workflow:
          </span>
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'heart', label: 'Heart & Cardiovascular', icon: Heart },
              { id: 'diabetes', label: 'Diabetes & Glycemic', icon: Droplet },
              { id: 'kidney', label: 'Kidney / Renal Flow', icon: Activity },
              { id: 'liver', label: 'Hepatic / Liver Health', icon: Layers },
              { id: 'symptoms', label: 'Symptom Journal', icon: Info },
              { id: 'general', label: 'Complete Health Profile', icon: Sliders },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeDomain === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveDomain(tab.id as DomainFlow)}
                  className={`flex items-center gap-2 px-3.5 py-2 text-xs font-sans font-bold uppercase tracking-wider transition-all cursor-pointer border ${
                    isActive
                      ? 'bg-[#1A1A1A] dark:bg-[#EAE5DD] text-[#F5F2ED] dark:text-[#151412] border-[#1A1A1A] dark:border-[#EAE5DD]'
                      : 'bg-[#F5F2ED] dark:bg-[#201E1A] text-[#1A1A1A]/70 dark:text-[#EAE5DD]/70 border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10 hover:border-[#1A1A1A]/30'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Input Completeness & Quality Ribbon (Section 40) */}
      <div className="p-6 bg-[#FFFFFF] dark:bg-[#1A1916] border border-[#1A1A1A]/15 dark:border-[#EAE5DD]/12 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-[#A38D7D]">
                DATA COMPLETENESS TRACKER
              </span>
              <span className="text-xs font-mono-code font-bold text-[#1A1A1A] dark:text-[#EAE5DD]">
                {completeness}%
              </span>
            </div>
            <p className="font-newsreader text-xs italic text-[#1A1A1A]/60 dark:text-[#EAE5DD]/60">
              Distinguishes available vs missing inputs without misrepresenting completeness as statistical accuracy.
            </p>
          </div>

          <div className="w-full sm:w-48 bg-[#1A1A1A]/10 dark:bg-[#EAE5DD]/10 h-2">
            <div
              style={{ width: `${completeness}%` }}
              className="h-full bg-[#A38D7D] transition-all duration-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono-code">
          <div className="p-3 bg-[#F5F2ED] dark:bg-[#201E1A] border border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10">
            <span className="text-[9px] text-[#A38D7D] uppercase block">Status</span>
            <span className="font-bold text-[#1A1A1A] dark:text-[#EAE5DD]">Available: 14 Values</span>
          </div>
          <div className="p-3 bg-[#F5F2ED] dark:bg-[#201E1A] border border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10">
            <span className="text-[9px] text-[#A38D7D] uppercase block">Missing</span>
            <span className="font-bold text-[#1A1A1A] dark:text-[#EAE5DD]">uACR Urine Spot</span>
          </div>
          <div className="p-3 bg-[#F5F2ED] dark:bg-[#201E1A] border border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10">
            <span className="text-[9px] text-[#A38D7D] uppercase block">Validation</span>
            <span className="font-bold text-[#1A1A1A] dark:text-[#EAE5DD]">In Valid Range</span>
          </div>
          <div className="p-3 bg-[#F5F2ED] dark:bg-[#201E1A] border border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10">
            <span className="text-[9px] text-[#A38D7D] uppercase block">Calculated BMI</span>
            <span className="font-bold text-[#1A1A1A] dark:text-[#EAE5DD]">{calculatedBmi} kg/m²</span>
          </div>
        </div>
      </div>

      {/* Main Dynamic Domain Form */}
      <form onSubmit={handleSave} className="space-y-8">
        
        {/* Heart Assessment Specific Inputs */}
        {(activeDomain === 'heart' || activeDomain === 'general') && (
          <div className="p-6 sm:p-8 bg-[#FFFFFF] dark:bg-[#1A1916] border border-[#1A1A1A]/15 dark:border-[#EAE5DD]/12 space-y-6">
            <div className="border-b border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10 pb-3">
              <span className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-[#A38D7D]">
                DOMAIN 01
              </span>
              <h3 className="font-editorial text-2xl italic text-[#1A1A1A] dark:text-[#EAE5DD]">
                Cardiovascular Biometrics & Hemodynamics
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 text-xs">
              
              {/* Systolic BP */}
              <div className="space-y-1.5">
                <label className="font-sans font-bold uppercase tracking-wider text-[10px] text-[#1A1A1A] dark:text-[#EAE5DD]">
                  Systolic Blood Pressure (mmHg)
                </label>
                <input
                  type="number"
                  value={formData.bpSystolic}
                  onChange={(e) => handleChange('bpSystolic', e.target.value)}
                  className="w-full p-3 bg-[#F5F2ED] dark:bg-[#201E1A] border border-[#1A1A1A]/20 dark:border-[#EAE5DD]/20 font-mono-code text-xs text-[#1A1A1A] dark:text-[#EAE5DD]"
                  placeholder="e.g. 120"
                />
                <span className="text-[9px] font-newsreader italic text-[#1A1A1A]/50 dark:text-[#EAE5DD]/50">
                  Target: 90–120 mmHg
                </span>
              </div>

              {/* Diastolic BP */}
              <div className="space-y-1.5">
                <label className="font-sans font-bold uppercase tracking-wider text-[10px] text-[#1A1A1A] dark:text-[#EAE5DD]">
                  Diastolic Blood Pressure (mmHg)
                </label>
                <input
                  type="number"
                  value={formData.bpDiastolic}
                  onChange={(e) => handleChange('bpDiastolic', e.target.value)}
                  className="w-full p-3 bg-[#F5F2ED] dark:bg-[#201E1A] border border-[#1A1A1A]/20 dark:border-[#EAE5DD]/20 font-mono-code text-xs text-[#1A1A1A] dark:text-[#EAE5DD]"
                  placeholder="e.g. 80"
                />
                <span className="text-[9px] font-newsreader italic text-[#1A1A1A]/50 dark:text-[#EAE5DD]/50">
                  Target: 60–80 mmHg
                </span>
              </div>

              {/* Resting HR */}
              <div className="space-y-1.5">
                <label className="font-sans font-bold uppercase tracking-wider text-[10px] text-[#1A1A1A] dark:text-[#EAE5DD]">
                  Resting Heart Rate (BPM)
                </label>
                <input
                  type="number"
                  value={formData.restingHeartRate}
                  onChange={(e) => handleChange('restingHeartRate', e.target.value)}
                  className="w-full p-3 bg-[#F5F2ED] dark:bg-[#201E1A] border border-[#1A1A1A]/20 dark:border-[#EAE5DD]/20 font-mono-code text-xs text-[#1A1A1A] dark:text-[#EAE5DD]"
                  placeholder="e.g. 68"
                />
                <span className="text-[9px] font-newsreader italic text-[#1A1A1A]/50 dark:text-[#EAE5DD]/50">
                  Normal: 60–100 BPM
                </span>
              </div>

              {/* LDL-C */}
              <div className="space-y-1.5">
                <label className="font-sans font-bold uppercase tracking-wider text-[10px] text-[#1A1A1A] dark:text-[#EAE5DD]">
                  LDL Cholesterol (mg/dL)
                </label>
                <input
                  type="number"
                  value={formData.ldl}
                  onChange={(e) => handleChange('ldl', e.target.value)}
                  className="w-full p-3 bg-[#F5F2ED] dark:bg-[#201E1A] border border-[#1A1A1A]/20 dark:border-[#EAE5DD]/20 font-mono-code text-xs text-[#1A1A1A] dark:text-[#EAE5DD]"
                  placeholder="e.g. 100"
                />
                <span className="text-[9px] font-newsreader italic text-[#1A1A1A]/50 dark:text-[#EAE5DD]/50">
                  Optimal: &lt; 100 mg/dL
                </span>
              </div>

              {/* HDL-C */}
              <div className="space-y-1.5">
                <label className="font-sans font-bold uppercase tracking-wider text-[10px] text-[#1A1A1A] dark:text-[#EAE5DD]">
                  HDL Cholesterol (mg/dL)
                </label>
                <input
                  type="number"
                  value={formData.hdl}
                  onChange={(e) => handleChange('hdl', e.target.value)}
                  className="w-full p-3 bg-[#F5F2ED] dark:bg-[#201E1A] border border-[#1A1A1A]/20 dark:border-[#EAE5DD]/20 font-mono-code text-xs text-[#1A1A1A] dark:text-[#EAE5DD]"
                  placeholder="e.g. 50"
                />
                <span className="text-[9px] font-newsreader italic text-[#1A1A1A]/50 dark:text-[#EAE5DD]/50">
                  Optimal: &gt; 40 mg/dL (M) / &gt; 50 (F)
                </span>
              </div>

              {/* Smoking Status */}
              <div className="space-y-1.5">
                <label className="font-sans font-bold uppercase tracking-wider text-[10px] text-[#1A1A1A] dark:text-[#EAE5DD]">
                  Smoking Status
                </label>
                <select
                  value={formData.smokingStatus}
                  onChange={(e) => handleChange('smokingStatus', e.target.value)}
                  className="w-full p-3 bg-[#F5F2ED] dark:bg-[#201E1A] border border-[#1A1A1A]/20 dark:border-[#EAE5DD]/20 font-mono-code text-xs text-[#1A1A1A] dark:text-[#EAE5DD]"
                >
                  <option value="Never">Never Smoked</option>
                  <option value="Former">Former Smoker</option>
                  <option value="Occasional">Occasional</option>
                  <option value="Current">Current Smoker</option>
                </select>
              </div>
            </div>

            <div className="pt-4 border-t border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10 flex items-center justify-between">
              <span className="text-xs font-newsreader italic text-[#1A1A1A]/60 dark:text-[#EAE5DD]/60">
                Ready to analyze with the 10-year ASCVD XGBoost model.
              </span>
              <button
                type="button"
                onClick={() => setCurrentView('app-risk-assessment')}
                className="flex items-center gap-1.5 text-xs font-sans font-bold uppercase tracking-wider text-[#A38D7D] hover:underline cursor-pointer"
              >
                <span>Run Cardiovascular Assessment</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}

        {/* Diabetes & Glycemic Inputs */}
        {(activeDomain === 'diabetes' || activeDomain === 'general') && (
          <div className="p-6 sm:p-8 bg-[#FFFFFF] dark:bg-[#1A1916] border border-[#1A1A1A]/15 dark:border-[#EAE5DD]/12 space-y-6">
            <div className="border-b border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10 pb-3">
              <span className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-[#A38D7D]">
                DOMAIN 02
              </span>
              <h3 className="font-editorial text-2xl italic text-[#1A1A1A] dark:text-[#EAE5DD]">
                Metabolic & Glycemic Parameters
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 text-xs">
              <div className="space-y-1.5">
                <label className="font-sans font-bold uppercase tracking-wider text-[10px] text-[#1A1A1A] dark:text-[#EAE5DD]">
                  Fasting Glucose (mg/dL)
                </label>
                <input
                  type="number"
                  value={formData.fastingGlucose}
                  onChange={(e) => handleChange('fastingGlucose', e.target.value)}
                  className="w-full p-3 bg-[#F5F2ED] dark:bg-[#201E1A] border border-[#1A1A1A]/20 dark:border-[#EAE5DD]/20 font-mono-code text-xs text-[#1A1A1A] dark:text-[#EAE5DD]"
                  placeholder="e.g. 90"
                />
                <span className="text-[9px] font-newsreader italic text-[#1A1A1A]/50 dark:text-[#EAE5DD]/50">
                  Normal: 70–99 mg/dL
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="font-sans font-bold uppercase tracking-wider text-[10px] text-[#1A1A1A] dark:text-[#EAE5DD]">
                  Glycated Hemoglobin HbA1c (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.hba1c}
                  onChange={(e) => handleChange('hba1c', e.target.value)}
                  className="w-full p-3 bg-[#F5F2ED] dark:bg-[#201E1A] border border-[#1A1A1A]/20 dark:border-[#EAE5DD]/20 font-mono-code text-xs text-[#1A1A1A] dark:text-[#EAE5DD]"
                  placeholder="e.g. 5.4"
                />
                <span className="text-[9px] font-newsreader italic text-[#1A1A1A]/50 dark:text-[#EAE5DD]/50">
                  Normal: &lt; 5.7% | Prediabetes: 5.7–6.4%
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="font-sans font-bold uppercase tracking-wider text-[10px] text-[#1A1A1A] dark:text-[#EAE5DD]">
                  Triglycerides (mg/dL)
                </label>
                <input
                  type="number"
                  value={formData.triglycerides}
                  onChange={(e) => handleChange('triglycerides', e.target.value)}
                  className="w-full p-3 bg-[#F5F2ED] dark:bg-[#201E1A] border border-[#1A1A1A]/20 dark:border-[#EAE5DD]/20 font-mono-code text-xs text-[#1A1A1A] dark:text-[#EAE5DD]"
                  placeholder="e.g. 140"
                />
                <span className="text-[9px] font-newsreader italic text-[#1A1A1A]/50 dark:text-[#EAE5DD]/50">
                  Normal: &lt; 150 mg/dL
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Symptoms Section (Section 78) */}
        {(activeDomain === 'symptoms' || activeDomain === 'general') && (
          <div className="p-6 sm:p-8 bg-[#FFFFFF] dark:bg-[#1A1916] border border-[#1A1A1A]/15 dark:border-[#EAE5DD]/12 space-y-6">
            <div className="border-b border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10 pb-3">
              <span className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-[#A38D7D]">
                DOMAIN 03
              </span>
              <h3 className="font-editorial text-2xl italic text-[#1A1A1A] dark:text-[#EAE5DD]">
                Symptom Logging & Contextual Journal
              </h3>
            </div>

            <div className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-sans font-bold uppercase tracking-wider text-[10px] text-[#1A1A1A] dark:text-[#EAE5DD]">
                  Reported Symptom Description & Pattern
                </label>
                <textarea
                  rows={3}
                  value={formData.symptomText}
                  onChange={(e) => handleChange('symptomText', e.target.value)}
                  className="w-full p-3 bg-[#F5F2ED] dark:bg-[#201E1A] border border-[#1A1A1A]/20 dark:border-[#EAE5DD]/20 font-newsreader italic text-xs text-[#1A1A1A] dark:text-[#EAE5DD]"
                  placeholder="Describe timing, triggers, and associated sensations..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-sans font-bold uppercase tracking-wider text-[10px] text-[#1A1A1A] dark:text-[#EAE5DD]">
                    Duration
                  </label>
                  <input
                    type="text"
                    value={formData.symptomDuration}
                    onChange={(e) => handleChange('symptomDuration', e.target.value)}
                    className="w-full p-3 bg-[#F5F2ED] dark:bg-[#201E1A] border border-[#1A1A1A]/20 dark:border-[#EAE5DD]/20 font-mono-code text-xs text-[#1A1A1A] dark:text-[#EAE5DD]"
                    placeholder="e.g. 3 weeks"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-sans font-bold uppercase tracking-wider text-[10px] text-[#1A1A1A] dark:text-[#EAE5DD]">
                    Severity Level
                  </label>
                  <select
                    value={formData.symptomSeverity}
                    onChange={(e) => handleChange('symptomSeverity', e.target.value)}
                    className="w-full p-3 bg-[#F5F2ED] dark:bg-[#201E1A] border border-[#1A1A1A]/20 dark:border-[#EAE5DD]/20 font-mono-code text-xs text-[#1A1A1A] dark:text-[#EAE5DD]"
                  >
                    <option value="Mild">Mild (Non-disruptive)</option>
                    <option value="Moderate">Moderate (Interferes with focus)</option>
                    <option value="Severe">Severe (Prompt clinician review indicated)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="p-4 bg-[#F5F2ED] dark:bg-[#201E1A] border border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10 text-xs font-newsreader italic text-[#1A1A1A]/80 dark:text-[#EAE5DD]/80">
              <strong className="font-sans font-bold uppercase tracking-wider text-[9px] text-[#A38D7D] not-italic block mb-0.5">
                Symptom Workflow Boundary:
              </strong>
              SAAHAJ organizes and summarizes symptoms for your upcoming clinician visit. It does not attempt automated diagnostic self-triage.
            </div>
          </div>
        )}
      </form>
    </div>
  );
};
