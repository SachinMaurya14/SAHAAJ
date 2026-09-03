import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  HealthProfile, 
  MedicalDocument, 
  MedicalImageStudy, 
  HealthEvent, 
  AuditLog, 
  AppointmentPrep, 
  TimelineItem 
} from '../types';
import { 
  initialHealthProfile as fixtureProfile, 
  sampleMedicalDocuments as fixtureDocs, 
  sampleTimelineItems as fixtureTimeline, 
  sampleImageStudies as fixtureImaging 
} from '../data/mockHealthData';

interface HealthDataContextType {
  userProfile: HealthProfile | null;
  documents: MedicalDocument[];
  timelineEvents: HealthEvent[];
  imagingStudies: MedicalImageStudy[];
  imageStudies: MedicalImageStudy[];
  patients: { id: string; name: string; age: number; sex: string; lastSeen: string; status: string }[];
  isDevFixtureLoaded: boolean;
  auditLogs: AuditLog[];
  // Actions
  updateProfile: (profile: HealthProfile) => void;
  addVital: (vitals: { bpSystolic?: number; bpDiastolic?: number; restingHeartRate?: number; glucose?: number; hba1c?: number; weightKg?: number }) => void;
  addDocument: (doc: MedicalDocument) => void;
  deleteDocument: (id: string) => void;
  addImagingStudy: (study: MedicalImageStudy) => void;
  addTimelineEvent: (event: Omit<HealthEvent, 'event_id' | 'timestamp'>) => void;
  addAppointmentPrep: (prep: AppointmentPrep) => void;
  loadDevFixture: () => void;
  clearAllData: () => void;
  logAudit: (operation: string, inputCategory: string, status: 'success' | 'failure', latencyMs?: number) => void;
}

const HealthDataContext = createContext<HealthDataContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PROFILE: 'saahaj_user_profile_v2',
  DOCUMENTS: 'saahaj_documents_v2',
  EVENTS: 'saahaj_events_v2',
  IMAGING: 'saahaj_imaging_v2',
  AUDIT: 'saahaj_audit_logs_v2',
  FIXTURE_FLAG: 'saahaj_fixture_loaded_v2'
};

export const HealthDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Initial State starts completely EMPTY as mandated by V1 Corrections
  const [userProfile, setUserProfile] = useState<HealthProfile | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PROFILE);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [documents, setDocuments] = useState<MedicalDocument[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.DOCUMENTS);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [timelineEvents, setTimelineEvents] = useState<HealthEvent[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.EVENTS);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [imagingStudies, setImagingStudies] = useState<MedicalImageStudy[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.IMAGING);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.AUDIT);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [isDevFixtureLoaded, setIsDevFixtureLoaded] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.FIXTURE_FLAG) === 'true';
    } catch {
      return false;
    }
  });

  const [patients, setPatients] = useState<{ id: string; name: string; age: number; sex: string; lastSeen: string; status: string }[]>(() => {
    return isDevFixtureLoaded 
      ? [{ id: 'p-01', name: 'Aarav Sharma', age: 44, sex: 'Male', lastSeen: '14-Aug-2026', status: 'Review Needed' }]
      : [];
  });

  // Sync to LocalStorage
  useEffect(() => {
    try {
      if (userProfile) {
        localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(userProfile));
      } else {
        localStorage.removeItem(STORAGE_KEYS.PROFILE);
      }
    } catch (e) {
      console.warn('Storage sync failed', e);
    }
  }, [userProfile]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(documents));
    } catch (e) {
      console.warn('Storage sync failed', e);
    }
  }, [documents]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(timelineEvents));
    } catch (e) {
      console.warn('Storage sync failed', e);
    }
  }, [timelineEvents]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.IMAGING, JSON.stringify(imagingStudies));
    } catch (e) {
      console.warn('Storage sync failed', e);
    }
  }, [imagingStudies]);

  const logAudit = (operation: string, inputCategory: string, status: 'success' | 'failure', latencyMs?: number) => {
    const log: AuditLog = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      operation,
      inputCategory,
      status,
      latencyMs,
      modelIdentifier: 'gemini-3.7-flash'
    };
    setAuditLogs(prev => [log, ...prev.slice(0, 49)]);
  };

  const addTimelineEvent = (event: Omit<HealthEvent, 'event_id' | 'timestamp'>) => {
    const newEvent: HealthEvent = {
      ...event,
      event_id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
    };
    setTimelineEvents(prev => [newEvent, ...prev]);
  };

  const updateProfile = (profile: HealthProfile) => {
    setUserProfile(profile);
    addTimelineEvent({
      event_type: 'PROFILE_UPDATED',
      source: 'User Health Dossier',
      title: 'Health Profile Updated',
      description: `Updated biometrics for ${profile.personal.fullName || 'User'} (Age: ${profile.personal.age || '—'}, BP: ${profile.personal.bpSystolic}/${profile.personal.bpDiastolic} mmHg, Sleep: ${profile.lifestyle.sleepHoursPerNight}h).`,
      category: 'Vitals Change',
      metrics: [
        { label: 'Blood Pressure', value: `${profile.personal.bpSystolic}/${profile.personal.bpDiastolic} mmHg` },
        { label: 'Weight', value: `${profile.personal.weightKg} kg` },
        { label: 'Heart Rate', value: `${profile.personal.restingHeartRate} bpm` }
      ]
    });
  };

  const addVital = (vitals: { bpSystolic?: number; bpDiastolic?: number; restingHeartRate?: number; glucose?: number; hba1c?: number; weightKg?: number }) => {
    if (userProfile) {
      const updated: HealthProfile = {
        ...userProfile,
        personal: {
          ...userProfile.personal,
          bpSystolic: vitals.bpSystolic ?? userProfile.personal.bpSystolic,
          bpDiastolic: vitals.bpDiastolic ?? userProfile.personal.bpDiastolic,
          restingHeartRate: vitals.restingHeartRate ?? userProfile.personal.restingHeartRate,
          weightKg: vitals.weightKg ?? userProfile.personal.weightKg
        }
      };
      setUserProfile(updated);
    }
    const metrics: { label: string; value: string }[] = [];
    if (vitals.bpSystolic && vitals.bpDiastolic) metrics.push({ label: 'Blood Pressure', value: `${vitals.bpSystolic}/${vitals.bpDiastolic} mmHg` });
    if (vitals.glucose) metrics.push({ label: 'Fasting Glucose', value: `${vitals.glucose} mg/dL` });
    if (vitals.hba1c) metrics.push({ label: 'HbA1c', value: `${vitals.hba1c}%` });
    if (vitals.restingHeartRate) metrics.push({ label: 'Heart Rate', value: `${vitals.restingHeartRate} bpm` });

    addTimelineEvent({
      event_type: 'VITAL_ENTERED',
      source: 'Health Input Measurement',
      title: 'Vitals Measurement Recorded',
      description: `Logged measurements: ${metrics.map(m => `${m.label}: ${m.value}`).join(', ')}.`,
      category: 'Vitals Change',
      metrics
    });
  };

  const addDocument = (doc: MedicalDocument) => {
    setDocuments(prev => [doc, ...prev]);
    addTimelineEvent({
      event_type: 'REPORT_UPLOADED',
      source: doc.facility || 'User Upload',
      related_record_id: doc.id,
      title: doc.title,
      description: `Uploaded and structured ${doc.parametersCount} laboratory biomarkers (${doc.abnormalCount} flagged).`,
      category: 'Lab Panel',
      metrics: doc.extractedParameters.slice(0, 3).map(p => ({
        label: p.name,
        value: `${p.value} ${p.unit}`,
        status: p.status
      }))
    });
  };

  const deleteDocument = (id: string) => {
    setDocuments(prev => prev.filter(d => d.id !== id));
  };

  const addImagingStudy = (study: MedicalImageStudy) => {
    setImagingStudies(prev => [study, ...prev]);
    addTimelineEvent({
      event_type: 'IMAGING_ANALYSIS_RUN',
      source: 'Computational Radiology Viewport',
      related_record_id: study.id,
      title: `${study.title} (${study.modality})`,
      description: `Diagnostic ${study.modality} of ${study.bodyRegion} scanned. Feature saliency overlays and findings generated.`,
      category: 'Imaging'
    });
  };

  const addAppointmentPrep = (prep: AppointmentPrep) => {
    addTimelineEvent({
      event_type: 'APPOINTMENT_PREPARED',
      source: 'Clinician Consultation Bridge',
      title: `Consultation Briefing: ${prep.doctorName}`,
      description: `Synthesized appointment agenda for ${prep.specialty} (${prep.targetDate}) with ${prep.tailoredQuestionsForDoctor.length} discussion questions.`,
      category: 'Clinical Encounter'
    });
  };

  const loadDevFixture = () => {
    setUserProfile(fixtureProfile);
    setDocuments(fixtureDocs);
    setImagingStudies(fixtureImaging);
    
    // Map fixture timeline items to HealthEvent structure
    const mappedEvents: HealthEvent[] = fixtureTimeline.map((item, idx) => ({
      event_id: `evt-fixture-${idx}`,
      event_type: item.type === 'report' ? 'REPORT_ANALYZED' : item.type === 'imaging' ? 'IMAGING_ANALYSIS_RUN' : 'PROFILE_UPDATED',
      timestamp: item.date,
      source: item.physician ? `Dr. ${item.physician}` : 'Clinical Record',
      title: item.title,
      description: item.summary,
      category: item.category,
      metrics: item.metrics
    }));
    
    setTimelineEvents(mappedEvents);
    setIsDevFixtureLoaded(true);
    setPatients([{ id: 'p-01', name: fixtureProfile.personal.fullName, age: fixtureProfile.personal.age, sex: fixtureProfile.personal.sex, lastSeen: '14-Aug-2026', status: 'Review Needed' }]);
    try {
      localStorage.setItem(STORAGE_KEYS.FIXTURE_FLAG, 'true');
    } catch {}
  };

  const clearAllData = () => {
    setUserProfile(null);
    setDocuments([]);
    setTimelineEvents([]);
    setImagingStudies([]);
    setPatients([]);
    setIsDevFixtureLoaded(false);
    try {
      localStorage.removeItem(STORAGE_KEYS.PROFILE);
      localStorage.removeItem(STORAGE_KEYS.DOCUMENTS);
      localStorage.removeItem(STORAGE_KEYS.EVENTS);
      localStorage.removeItem(STORAGE_KEYS.IMAGING);
      localStorage.removeItem(STORAGE_KEYS.FIXTURE_FLAG);
    } catch {}
  };

  return (
    <HealthDataContext.Provider value={{
      userProfile,
      documents,
      timelineEvents,
      imagingStudies,
      imageStudies: imagingStudies,
      patients,
      isDevFixtureLoaded,
      auditLogs,
      updateProfile,
      addVital,
      addDocument,
      deleteDocument,
      addImagingStudy,
      addTimelineEvent,
      addAppointmentPrep,
      loadDevFixture,
      clearAllData,
      logAudit
    }}>
      {children}
    </HealthDataContext.Provider>
  );
};

export const useHealthData = () => {
  const context = useContext(HealthDataContext);
  if (!context) {
    throw new Error('useHealthData must be used within a HealthDataProvider');
  }
  return context;
};
