import React, { useState, useEffect } from 'react';
import { 
  Eye, 
  Layers, 
  UploadCloud, 
  ShieldCheck, 
  Cpu, 
  Sparkles, 
  RotateCcw, 
  FolderOpen, 
  Plus, 
  FileText, 
  Info, 
  Trash2,
  AlertCircle
} from 'lucide-react';
import { ImagingApiService } from '../../services/imagingApiService';
import { ImagingStudyRecord, VisionModelArtifact, ImagingFinding } from '../../../server/cv/types';
import { MedicalImageViewer } from './components/imaging/MedicalImageViewer';
import { ImageQualityPanel } from './components/imaging/ImageQualityPanel';
import { PredictionPanel } from './components/imaging/PredictionPanel';
import { ExplainabilityPanel } from './components/imaging/ExplainabilityPanel';
import { MultimodalComparisonPanel } from './components/imaging/MultimodalComparisonPanel';
import { VisionModelCardModal } from './components/imaging/VisionModelCardModal';
import { SliceViewerScaffold } from './components/imaging/SliceViewerScaffold';
import { MedicalImageUploader } from './components/imaging/MedicalImageUploader';
import { AskSaahajDrawer } from '../common/AskSaahajDrawer';

interface MedicalImagingViewProps {
  setCurrentView: (view: string) => void;
  userRole?: 'patient' | 'clinician';
}

export const MedicalImagingView: React.FC<MedicalImagingViewProps> = ({ 
  setCurrentView,
  userRole = 'patient'
}) => {
  const [studies, setStudies] = useState<ImagingStudyRecord[]>([]);
  const [selectedStudyId, setSelectedStudyId] = useState<string | null>(null);
  const [models, setModels] = useState<VisionModelArtifact[]>([]);
  const [selectedFinding, setSelectedFinding] = useState<ImagingFinding | null>(null);
  
  // Modals & Drawers
  const [isUploaderOpen, setIsUploaderOpen] = useState(false);
  const [isModelCardOpen, setIsModelCardOpen] = useState(false);
  const [isAskSaahajOpen, setIsAskSaahajOpen] = useState(false);
  const [showVolumetricScaffold, setShowVolumetricScaffold] = useState(false);
  const [annotations, setAnnotations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load studies from API
  const fetchStudies = async () => {
    setIsLoading(true);
    try {
      const [studyList, modelList] = await Promise.all([
        ImagingApiService.listStudies(),
        ImagingApiService.listModels()
      ]);
      setStudies(studyList);
      setModels(modelList);
      if (studyList.length > 0 && !selectedStudyId) {
        setSelectedStudyId(studyList[0].studyId);
      }
    } catch {
      // Ignore
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudies();
  }, []);

  const activeStudy = studies.find(s => s.studyId === selectedStudyId) || studies[0] || null;

  // Load annotations when active study changes
  useEffect(() => {
    if (activeStudy) {
      ImagingApiService.listAnnotations(activeStudy.studyId).then(setAnnotations);
      if (activeStudy.findings && activeStudy.findings.length > 0) {
        const topFinding = activeStudy.findings.find(f => f.status === 'ELEVATED_SIGNAL') || activeStudy.findings[0];
        setSelectedFinding(topFinding);
      }
    }
  }, [activeStudy?.studyId]);

  const handleStudyCreated = (newStudy: ImagingStudyRecord) => {
    setStudies(prev => [newStudy, ...prev]);
    setSelectedStudyId(newStudy.studyId);
    setIsUploaderOpen(false);
  };

  const handleDeleteStudy = async (studyId: string) => {
    const ok = await ImagingApiService.deleteStudy(studyId);
    if (ok) {
      setStudies(prev => prev.filter(s => s.studyId !== studyId));
      if (selectedStudyId === studyId) {
        const remaining = studies.filter(s => s.studyId !== studyId);
        setSelectedStudyId(remaining.length > 0 ? remaining[0].studyId : null);
      }
    }
  };

  const handleAddAnnotation = async (coord: { x: number; y: number }, label: string) => {
    if (!activeStudy) return;
    const ann = await ImagingApiService.saveAnnotation(activeStudy.studyId, {
      type: 'point',
      coordinates: coord,
      label,
      notes: 'Clinician ROI marker',
      authorRole: userRole
    });
    if (ann) {
      setAnnotations(prev => [...prev, ann]);
    }
  };

  const activeModel = models.find(m => m.modelId === activeStudy?.activeModelId) || models[0];

  return (
    <div className="space-y-8">
      
      {/* Top Banner */}
      <div className="p-6 sm:p-8 bg-[#FFFFFF] dark:bg-[#1A1916] border border-[#1A1A1A]/15 dark:border-[#EAE5DD]/12 space-y-6">
        <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-sans font-bold uppercase tracking-[0.25em] text-[#A38D7D]">
                COMPUTATIONAL RADIOLOGY & SENSING
              </span>
              <span className="text-xs font-newsreader italic text-[#1A1A1A]/60 dark:text-[#EAE5DD]/60">
                &bull; DenseNet-121 Multi-Label Screener
              </span>
            </div>
            <h2 className="font-editorial text-3xl italic text-[#1A1A1A] dark:text-[#EAE5DD] mt-1">
              Diagnostic Imaging & Saliency
            </h2>
            <p className="text-xs font-newsreader italic text-[#1A1A1A]/60 dark:text-[#EAE5DD]/60">
              Interactive radiological viewport with feature saliency heatmap overlays, quality pre-flight checks, and multimodal report concordance.
            </p>
          </div>

          {/* Banner Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setIsAskSaahajOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[#1A1A1A] dark:bg-[#EAE5DD] text-[#F5F2ED] dark:text-[#151412] text-xs font-sans font-bold uppercase tracking-wider hover:opacity-90 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ask About Imaging</span>
            </button>

            {activeModel && (
              <button
                onClick={() => setIsModelCardOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-[#F5F2ED] dark:bg-[#201E1A] border border-[#1A1A1A]/20 dark:border-[#EAE5DD]/20 text-xs font-sans font-bold uppercase tracking-wider text-[#1A1A1A] dark:text-[#EAE5DD] hover:border-[#A38D7D]"
              >
                <Cpu className="w-3.5 h-3.5 text-[#A38D7D]" />
                <span>Model Card</span>
              </button>
            )}

            <button
              onClick={() => setIsUploaderOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[#A38D7D] text-[#151412] text-xs font-sans font-bold uppercase tracking-wider hover:opacity-90 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Upload Radiograph</span>
            </button>
          </div>
        </div>

        {/* Study Selector and Metadata Bar if studies exist */}
        {studies.length > 0 && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-mono-code font-bold uppercase text-[#A38D7D]">Active Study:</span>
              <select
                value={selectedStudyId || ''}
                onChange={(e) => setSelectedStudyId(e.target.value)}
                className="px-3 py-1.5 bg-[#F5F2ED] dark:bg-[#151412] border border-[#1A1A1A]/20 dark:border-[#EAE5DD]/20 text-xs font-sans text-[#1A1A1A] dark:text-[#EAE5DD] focus:outline-none"
              >
                {studies.map(s => (
                  <option key={s.studyId} value={s.studyId}>
                    {s.title} ({s.modality} &bull; {s.studyDate})
                  </option>
                ))}
              </select>
            </div>

            {activeStudy && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDeleteStudy(activeStudy.studyId)}
                  className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-mono-code text-[#8B0000] dark:text-[#FF8888] hover:bg-[#8B0000]/10"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Study</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Uploader View when toggled */}
      {isUploaderOpen && (
        <MedicalImageUploader
          availableModels={models}
          onStudyCreated={handleStudyCreated}
          onCancel={() => setIsUploaderOpen(false)}
          userRole={userRole}
        />
      )}

      {/* Empty State when no imaging studies uploaded */}
      {!isLoading && studies.length === 0 && !isUploaderOpen && (
        <div className="p-12 text-center bg-[#FFFFFF] dark:bg-[#1A1916] border border-[#1A1A1A]/15 dark:border-[#EAE5DD]/12 space-y-4">
          <div className="w-16 h-16 mx-auto bg-[#F5F2ED] dark:bg-[#201E1A] flex items-center justify-center text-[#A38D7D]">
            <FolderOpen className="w-8 h-8" />
          </div>
          <div className="space-y-1.5 max-w-md mx-auto">
            <h3 className="font-editorial text-2xl italic text-[#1A1A1A] dark:text-[#EAE5DD]">
              No imaging studies yet.
            </h3>
            <p className="font-newsreader text-sm italic text-[#1A1A1A]/70 dark:text-[#EAE5DD]/70 leading-relaxed">
              Upload a diagnostic chest X-ray (PNG, JPG, JPEG) to run AI-assisted screening, image quality verification, and model attention explainability.
            </p>
          </div>
          <button
            onClick={() => setIsUploaderOpen(true)}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#1A1A1A] dark:bg-[#EAE5DD] text-[#F5F2ED] dark:text-[#151412] text-xs font-sans font-bold uppercase tracking-wider hover:opacity-90"
          >
            <Plus className="w-4 h-4" />
            <span>Upload First Radiograph</span>
          </button>
        </div>
      )}

      {/* Active Study Content Grid */}
      {activeStudy && !isUploaderOpen && (
        <div className="space-y-8">
          
          {/* Main 12-col Grid: Viewport on left, Findings & Quality on right */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left 7 Columns: Interactive Viewport & Saliency Layer */}
            <div className="lg:col-span-7 space-y-6">
              <MedicalImageViewer
                study={activeStudy}
                userRole={userRole}
                onAddAnnotation={handleAddAnnotation}
                annotations={annotations}
              />

              {/* Explainability / Attention Deep Dive */}
              <ExplainabilityPanel
                explanation={activeStudy.primaryExplanation}
                userRole={userRole}
              />

              {/* Volumetric CT/MRI Scaffold Toggle */}
              <div className="pt-2">
                <button
                  onClick={() => setShowVolumetricScaffold(prev => !prev)}
                  className="flex items-center gap-2 text-xs font-mono-code text-[#A38D7D] hover:underline"
                >
                  <Layers className="w-4 h-4" />
                  <span>{showVolumetricScaffold ? 'Hide Volumetric Series Scaffold' : 'View Volumetric 3D Slice Scaffold (CT/MRI)'}</span>
                </button>
              </div>

              {showVolumetricScaffold && (
                <SliceViewerScaffold
                  totalSlices={48}
                  modality={activeStudy.modality === 'CT' ? 'CT' : 'MRI'}
                />
              )}
            </div>

            {/* Right 5 Columns: Quality Pre-Flight, Findings & Multimodal Concordance */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Technical Quality Panel */}
              <ImageQualityPanel quality={activeStudy.qualityMetrics} />

              {/* Neural Network Predictions */}
              <PredictionPanel
                findings={activeStudy.findings}
                studyId={activeStudy.studyId}
                userRole={userRole}
                onSelectFindingForGradCam={(f) => setSelectedFinding(f)}
                selectedFindingLabel={selectedFinding?.label}
              />

              {/* Multimodal Report Discrepancy Analysis */}
              <MultimodalComparisonPanel
                comparison={activeStudy.multimodalComparison}
                onLinkReportClick={() => setIsUploaderOpen(true)}
              />

            </div>

          </div>

        </div>
      )}

      {/* Model Card Modal */}
      {activeModel && (
        <VisionModelCardModal
          model={activeModel}
          isOpen={isModelCardOpen}
          onClose={() => setIsModelCardOpen(false)}
        />
      )}

      {/* Ask SAAHAJ Drawer */}
      {activeStudy && (
        <AskSaahajDrawer
          isOpen={isAskSaahajOpen}
          onClose={() => setIsAskSaahajOpen(false)}
          contextType="Diagnostic Imaging"
          currentContext={{
            studyTitle: activeStudy.title,
            modality: activeStudy.modality,
            bodyRegion: activeStudy.bodyRegion,
            findings: activeStudy.findings,
            quality: activeStudy.qualityMetrics?.status,
            multimodalComparison: activeStudy.multimodalComparison?.summary
          }}
          userRole={userRole}
          initialPrompt={`Explain the findings and Grad-CAM saliency highlights identified in my ${activeStudy.title}.`}
        />
      )}

    </div>
  );
};
