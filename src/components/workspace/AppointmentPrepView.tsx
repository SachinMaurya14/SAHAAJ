import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  CheckCircle2, 
  HelpCircle, 
  AlertTriangle, 
  Pill, 
  Download, 
  Printer, 
  Plus, 
  Trash2,
  Sparkles,
  Stethoscope,
  Clock,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { sampleAppointmentPrep } from '../../data/mockHealthData';
import { AppointmentPrep } from '../../types';
import { useHealthData } from '../../context/HealthDataContext';
import { GeminiService } from '../../services/geminiService';
import { AskSaahajDrawer } from '../common/AskSaahajDrawer';

export const AppointmentPrepView: React.FC = () => {
  const { userProfile, documents, timelineEvents } = useHealthData();
  const [prep, setPrep] = useState<AppointmentPrep>(sampleAppointmentPrep);
  const [newSymptom, setNewSymptom] = useState({ symptom: '', duration: '', severity: 'Mild' as const, notes: '' });
  const [newCustomQuestion, setNewCustomQuestion] = useState({ category: 'Personal Question', question: '', rationale: 'Patient added' });
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [isAskSaahajOpen, setIsAskSaahajOpen] = useState(false);

  const handleGenerateAiQuestions = async () => {
    setIsGeneratingQuestions(true);
    try {
      const response = await GeminiService.prepareAppointmentQuestions({
        doctorSpecialty: prep.specialty,
        symptoms: prep.userReportedSymptoms,
        recentBiomarkers: documents[0]?.extractedParameters || [],
        userProfile: userProfile ? {
          age: userProfile.personal.age,
          bpSystolic: userProfile.personal.bpSystolic,
          medications: userProfile.medicalHistory.medications
        } : undefined
      });

      if (response && response.questions && response.questions.length > 0) {
        setPrep(prev => ({
          ...prev,
          tailoredQuestionsForDoctor: response.questions.map((q, idx) => ({
            category: q.category || 'Clinical Inquiry',
            question: q.question,
            rationale: q.rationale
          }))
        }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  const addSymptom = () => {
    if (newSymptom.symptom.trim()) {
      setPrep({
        ...prep,
        userReportedSymptoms: [...prep.userReportedSymptoms, { ...newSymptom }]
      });
      setNewSymptom({ symptom: '', duration: '', severity: 'Mild', notes: '' });
    }
  };

  const removeSymptom = (index: number) => {
    const updated = [...prep.userReportedSymptoms];
    updated.splice(index, 1);
    setPrep({ ...prep, userReportedSymptoms: updated });
  };

  const addQuestion = () => {
    if (newCustomQuestion.question.trim()) {
      setPrep({
        ...prep,
        tailoredQuestionsForDoctor: [...prep.tailoredQuestionsForDoctor, { ...newCustomQuestion }]
      });
      setNewCustomQuestion({ category: 'Personal Question', question: '', rationale: 'Patient added' });
    }
  };

  const removeQuestion = (index: number) => {
    const updated = [...prep.tailoredQuestionsForDoctor];
    updated.splice(index, 1);
    setPrep({ ...prep, tailoredQuestionsForDoctor: updated });
  };

  const handlePrint = () => {
    window.print();
  };

  const userMeds = userProfile?.medicalHistory.medications || [];

  return (
    <div className="space-y-8">
      
      {/* Top Banner */}
      <div className="p-6 sm:p-8 bg-[#FFFFFF] dark:bg-[#1A1916] border border-[#1A1A1A]/15 dark:border-[#EAE5DD]/12 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-sans font-bold uppercase tracking-[0.25em] text-[#A38D7D]">
                CONSULTATION COMPANION
              </span>
              <span className="text-xs font-newsreader italic text-[#1A1A1A]/60 dark:text-[#EAE5DD]/60">&bull; Appointment Dossier</span>
            </div>
            <h2 className="font-editorial text-3xl italic text-[#1A1A1A] dark:text-[#EAE5DD] mt-1">
              Prepare for Clinical Consultation
            </h2>
            <p className="text-xs font-newsreader italic text-[#1A1A1A]/60 dark:text-[#EAE5DD]/60">
              Upcoming Visit: {prep.targetDate} with {prep.doctorName} ({prep.specialty})
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAskSaahajOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-[#1A1A1A] dark:bg-[#EAE5DD] text-[#F5F2ED] dark:text-[#151412] text-xs font-sans font-bold uppercase tracking-wider cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ask SAAHAJ</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#F5F2ED] dark:bg-[#201E1A] border border-[#1A1A1A]/15 dark:border-[#EAE5DD]/15 text-[#1A1A1A] dark:text-[#EAE5DD] text-xs font-sans font-bold uppercase tracking-wider transition-colors cursor-pointer hover:bg-[#ECE8E1]"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Brief</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid: Pillars of Appointment Readiness */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* 1. Key Changes Since Last Visit */}
        <div className="p-6 bg-[#FFFFFF] dark:bg-[#1A1916] border border-[#1A1A1A]/15 dark:border-[#EAE5DD]/12 space-y-4">
          <h3 className="font-editorial text-xl italic text-[#1A1A1A] dark:text-[#EAE5DD] flex items-center justify-between border-b border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10 pb-3">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#A38D7D]" />
              <span>Key Changes Since Last Visit</span>
            </span>
            <span className="text-[9px] font-sans font-bold uppercase tracking-wider text-[#A38D7D]">Automated</span>
          </h3>

          <div className="space-y-2.5">
            {prep.keyChangesSinceLastVisit.map((change, idx) => (
              <div key={idx} className="p-3 bg-[#F5F2ED] dark:bg-[#201E1A] border border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10 text-xs font-newsreader italic text-[#1A1A1A]/80 dark:text-[#EAE5DD]/80 leading-relaxed">
                &bull; {change}
              </div>
            ))}
          </div>
        </div>

        {/* 2. Active Medications & Adherence */}
        <div className="p-6 bg-[#FFFFFF] dark:bg-[#1A1916] border border-[#1A1A1A]/15 dark:border-[#EAE5DD]/12 space-y-4">
          <h3 className="font-editorial text-xl italic text-[#1A1A1A] dark:text-[#EAE5DD] flex items-center justify-between border-b border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10 pb-3">
            <span className="flex items-center gap-2">
              <Pill className="w-4 h-4 text-[#A38D7D]" />
              <span>Active Pharmacotherapy</span>
            </span>
            <span className="text-[9px] font-sans font-bold uppercase tracking-wider text-[#A38D7D]">Adherence Tracking</span>
          </h3>

          <div className="space-y-2.5">
            {userMeds.length > 0 ? (
              userMeds.map((med, idx) => (
                <div key={idx} className="p-3 bg-[#F5F2ED] dark:bg-[#201E1A] border border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10 text-xs flex items-center justify-between">
                  <div>
                    <span className="font-editorial text-base italic text-[#1A1A1A] dark:text-[#EAE5DD]">{med.name} ({med.dosage})</span>
                    <span className="text-[10px] font-newsreader italic text-[#1A1A1A]/60 dark:text-[#EAE5DD]/60 block">{med.frequency}</span>
                  </div>
                  <span className="text-[9px] font-sans font-bold uppercase tracking-wider px-2 py-0.5 border border-[#1A1A1A]/15 dark:border-[#EAE5DD]/15 bg-[#FFFFFF] dark:bg-[#151412] text-[#1A1A1A] dark:text-[#EAE5DD]">
                    {med.adherenceRate}% taken
                  </span>
                </div>
              ))
            ) : (
              <div className="p-4 bg-[#F5F2ED] dark:bg-[#201E1A] text-xs font-newsreader italic text-[#1A1A1A]/60 dark:text-[#EAE5DD]/60">
                No active prescription medications recorded.
              </div>
            )}
          </div>
        </div>

      </div>

      {/* 3. Patient Logged Symptoms */}
      <div className="p-6 bg-[#FFFFFF] dark:bg-[#1A1916] border border-[#1A1A1A]/15 dark:border-[#EAE5DD]/12 space-y-5">
        <h3 className="font-editorial text-2xl italic text-[#1A1A1A] dark:text-[#EAE5DD] flex items-center justify-between border-b border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10 pb-3">
          <span className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#A38D7D]" />
            <span>Patient Symptoms & Subjective Observations</span>
          </span>
          <span className="text-[9px] font-sans font-bold uppercase tracking-wider text-[#A38D7D]">Patient Journal</span>
        </h3>

        {/* Add Symptom Form */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 pt-1">
          <div className="sm:col-span-5">
            <input
              type="text"
              value={newSymptom.symptom}
              onChange={(e) => setNewSymptom({ ...newSymptom, symptom: e.target.value })}
              placeholder="Describe symptom (e.g. afternoon fatigue)..."
              className="w-full px-3 py-2 bg-[#F5F2ED] dark:bg-[#151412] border border-[#1A1A1A]/20 dark:border-[#EAE5DD]/20 text-xs font-newsreader italic text-[#1A1A1A] dark:text-[#EAE5DD] placeholder-[#1A1A1A]/40 dark:placeholder-[#EAE5DD]/40 focus:outline-none"
            />
          </div>
          <div className="sm:col-span-3">
            <input
              type="text"
              value={newSymptom.duration}
              onChange={(e) => setNewSymptom({ ...newSymptom, duration: e.target.value })}
              placeholder="Duration (e.g. past 2 weeks)..."
              className="w-full px-3 py-2 bg-[#F5F2ED] dark:bg-[#151412] border border-[#1A1A1A]/20 dark:border-[#EAE5DD]/20 text-xs font-newsreader italic text-[#1A1A1A] dark:text-[#EAE5DD] placeholder-[#1A1A1A]/40 dark:placeholder-[#EAE5DD]/40 focus:outline-none"
            />
          </div>
          <div className="sm:col-span-2">
            <select
              value={newSymptom.severity}
              onChange={(e) => setNewSymptom({ ...newSymptom, severity: e.target.value as any })}
              className="w-full px-3 py-2 bg-[#F5F2ED] dark:bg-[#151412] border border-[#1A1A1A]/20 dark:border-[#EAE5DD]/20 text-xs font-sans text-[#1A1A1A] dark:text-[#EAE5DD] focus:outline-none"
            >
              <option value="Mild">Mild</option>
              <option value="Moderate">Moderate</option>
              <option value="Severe">Severe</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <button
              type="button"
              onClick={addSymptom}
              className="w-full py-2 bg-[#1A1A1A] dark:bg-[#EAE5DD] hover:bg-[#2A2A2A] text-[#F5F2ED] dark:text-[#151412] text-xs font-sans font-bold uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer border border-[#1A1A1A] dark:border-[#EAE5DD]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Record</span>
            </button>
          </div>
        </div>

        {/* Symptoms List */}
        <div className="space-y-2.5 pt-1">
          {prep.userReportedSymptoms.map((sym, idx) => (
            <div key={idx} className="p-3.5 bg-[#F5F2ED] dark:bg-[#201E1A] border border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10 text-xs flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-editorial text-base italic text-[#1A1A1A] dark:text-[#EAE5DD]">{sym.symptom}</span>
                  <span className="text-[9px] font-sans font-bold uppercase tracking-wider px-1.5 py-0.5 border border-[#A38D7D]/30 text-[#A38D7D]">
                    {sym.severity}
                  </span>
                </div>
                <p className="font-newsreader text-xs italic text-[#1A1A1A]/60 dark:text-[#EAE5DD]/60">{sym.duration} &bull; {sym.notes}</p>
              </div>
              <button onClick={() => removeSymptom(idx)} className="text-[#1A1A1A]/40 dark:text-[#EAE5DD]/40 hover:text-red-600 p-1 cursor-pointer">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Tailored Questions Generated for Your Doctor */}
      <div className="p-6 sm:p-8 bg-[#FFFFFF] dark:bg-[#1A1916] border border-[#1A1A1A]/15 dark:border-[#EAE5DD]/12 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10 pb-3">
          <div>
            <h3 className="font-editorial text-2xl italic text-[#1A1A1A] dark:text-[#EAE5DD] flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-[#A38D7D]" />
              <span>Questions for Your Physician</span>
            </h3>
            <p className="text-xs font-newsreader italic text-[#1A1A1A]/60 dark:text-[#EAE5DD]/60 mt-0.5">
              Personalized questions structured around biomarker shifts and clinical risk screening results.
            </p>
          </div>

          <button
            onClick={handleGenerateAiQuestions}
            disabled={isGeneratingQuestions}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#1A1A1A] dark:bg-[#EAE5DD] text-[#F5F2ED] dark:text-[#151412] text-xs font-sans font-bold uppercase tracking-wider cursor-pointer border border-[#1A1A1A] dark:border-[#EAE5DD] disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isGeneratingQuestions ? 'Synthesizing with Gemini...' : 'Regenerate Questions with Gemini'}</span>
          </button>
        </div>

        <div className="space-y-3.5 pt-1">
          {prep.tailoredQuestionsForDoctor.map((q, idx) => (
            <div key={idx} className="p-4 bg-[#F5F2ED] dark:bg-[#201E1A] border border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-sans font-bold uppercase tracking-[0.2em] text-[#A38D7D]">
                  {q.category}
                </span>
                <button onClick={() => removeQuestion(idx)} className="text-[#1A1A1A]/40 dark:text-[#EAE5DD]/40 hover:text-red-600 p-0.5 cursor-pointer">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="font-editorial text-lg italic text-[#1A1A1A] dark:text-[#EAE5DD]">
                "{q.question}"
              </p>
              <p className="font-newsreader text-xs italic text-[#1A1A1A]/60 dark:text-[#EAE5DD]/60">
                Rationale: {q.rationale}
              </p>
            </div>
          ))}
        </div>

        {/* Add Custom Question Form */}
        <div className="flex gap-2.5 pt-2">
          <input
            type="text"
            value={newCustomQuestion.question}
            onChange={(e) => setNewCustomQuestion({ ...newCustomQuestion, question: e.target.value })}
            placeholder="Add your own custom inquiry for your doctor..."
            className="flex-1 px-3 py-2.5 bg-[#F5F2ED] dark:bg-[#151412] border border-[#1A1A1A]/20 dark:border-[#EAE5DD]/20 text-xs font-newsreader italic text-[#1A1A1A] dark:text-[#EAE5DD] placeholder-[#1A1A1A]/40 dark:placeholder-[#EAE5DD]/40 focus:outline-none"
          />
          <button
            type="button"
            onClick={addQuestion}
            className="px-5 py-2.5 bg-[#1A1A1A] dark:bg-[#EAE5DD] hover:bg-[#2A2A2A] text-[#F5F2ED] dark:text-[#151412] text-xs font-sans font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer border border-[#1A1A1A] dark:border-[#EAE5DD]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Question</span>
          </button>
        </div>
      </div>

      {/* Contextual Ask SAAHAJ Drawer */}
      <AskSaahajDrawer
        isOpen={isAskSaahajOpen}
        onClose={() => setIsAskSaahajOpen(false)}
        contextType="Appointment Preparation"
        currentContext={{
          doctorName: prep.doctorName,
          specialty: prep.specialty,
          date: prep.targetDate,
          symptoms: prep.userReportedSymptoms,
          questions: prep.tailoredQuestionsForDoctor
        }}
        userRole="patient"
        initialPrompt={`Help me prepare for my consultation with ${prep.doctorName} (${prep.specialty}). What else should I ask about my symptoms?`}
      />

    </div>
  );
};
