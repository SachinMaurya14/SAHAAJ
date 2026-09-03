/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * SAAHAJ Medical Report Split-Viewer View
 * Seamlessly integrates the Split-Screen Document Source Viewer with RAG groundings.
 */

import React, { useState, useEffect } from 'react';
import { V3Document } from '../../types';
import { RAGApiService } from '../../services/ragApiService';
import { DocumentSourceViewer } from './DocumentSourceViewer';
import { FolderOpen, Upload, RefreshCw, FileText } from 'lucide-react';

interface MedicalReportViewerViewProps {
  setCurrentView: (view: string) => void;
}

export const MedicalReportViewerView: React.FC<MedicalReportViewerViewProps> = ({ setCurrentView }) => {
  const [documents, setDocuments] = useState<V3Document[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<V3Document | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDocs();
  }, []);

  const loadDocs = async () => {
    setIsLoading(true);
    const docs = await RAGApiService.listDocuments();
    setDocuments(docs);
    if (docs.length > 0) {
      setSelectedDoc(docs[0]);
    }
    setIsLoading(false);
  };

  const handleSeedSampleDocument = async () => {
    setIsLoading(true);
    // Create a comprehensive sample medical lab report
    const sampleText = `METROPOLITAN CLINICAL DIAGNOSTICS LABORATORY
Accredited ISO-15189 | Reference Clinical Testing Centre
Patient: Aarav Sharma | Age: 44 Y | Sex: Male
Ordering Physician: Dr. Sunita Rao, MD (Internal Medicine)
Date of Specimen Collection: 14-Aug-2026

=== COMPREHENSIVE METABOLIC & LIPID PANEL ===

Test Description              Result      Unit       Reference Interval   Flag
-------------------------------------------------------------------------------
Fasting Blood Glucose         114         mg/dL      70 - 99              HIGH
Hemoglobin A1c (HbA1c)        6.8         %          4.0 - 5.6            HIGH
Total Cholesterol             224         mg/dL      125 - 200            HIGH
LDL Cholesterol (Calculated)  148         mg/dL      50 - 100             HIGH
HDL Cholesterol               38          mg/dL      40 - 60              LOW
Triglycerides                 190         mg/dL      50 - 150             HIGH
Serum Creatinine              1.10        mg/dL      0.70 - 1.30          NORMAL
eGFR (CKD-EPI)                88          mL/min     > 60                 NORMAL
Alanine Aminotransferase(ALT) 52          U/L        7 - 45               HIGH
Aspartate Aminotransferase    38          U/L        8 - 40               NORMAL
Hemoglobin                    15.2        g/dL       13.0 - 17.0          NORMAL
Platelet Count                240         10^3/mcL   150 - 450            NORMAL
White Blood Cell (WBC)        7.2         10^3/mcL   4.5 - 11.0           NORMAL

Clinical Notes:
Glycemic parameters (HbA1c 6.8%, Fasting Glucose 114 mg/dL) meet diagnostic criteria for Type 2 Diabetes Mellitus.
Mixed dyslipidemia identified with elevated LDL-C and low HDL-C.
Transaminase elevation (ALT 52 U/L) indicates mild hepatocellular stress, consistent with metabolic fatty liver.
Renal filtration remains preserved (eGFR 88 mL/min).

Recommendations:
1. Schedule follow-up with attending physician for comprehensive metabolic review.
2. Lifestyle optimization: Mediterranean-style diet, 150 min aerobic exercise weekly.
3. Repeat glycemic and lipid panel in 90 days.`;

    const blob = new Blob([sampleText], { type: 'text/plain' });
    const file = new File([blob], 'Comprehensive_Metabolic_Panel_Aug2026.txt', { type: 'text/plain' });

    try {
      const result = await RAGApiService.uploadDocument(file);
      await loadDocs();
      if (result.document) {
        setSelectedDoc(result.document);
      }
    } catch (e) {
      console.error('Failed to seed document:', e);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-16 text-center text-stone-500 text-xs flex flex-col items-center justify-center space-y-3">
        <RefreshCw className="w-6 h-6 animate-spin text-emerald-600" />
        <span>Loading indexed document records...</span>
      </div>
    );
  }

  if (!selectedDoc || documents.length === 0) {
    return (
      <div className="max-w-2xl mx-auto p-12 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl text-center space-y-4 my-8">
        <FolderOpen className="w-10 h-10 text-emerald-600 mx-auto opacity-80" />
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100 font-serif">
            No Indexed Medical Reports
          </h3>
          <p className="text-xs text-stone-500">
            Upload your laboratory panels, imaging studies, or doctor notes to activate the split-view citation viewer.
          </p>
        </div>
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={() => setCurrentView('app-records')}
            className="px-4 py-2 bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 text-xs font-semibold rounded-xl"
          >
            Go to Document Ingestion
          </button>
          <button
            onClick={handleSeedSampleDocument}
            className="px-4 py-2 bg-emerald-50 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold rounded-xl flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Seed Sample Panel
          </button>
        </div>
      </div>
    );
  }

  return (
    <DocumentSourceViewer
      document={selectedDoc}
      onBack={() => setCurrentView('app-records')}
    />
  );
};
