import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  Cpu, 
  Info,
  X,
  ShieldAlert
} from 'lucide-react';
import { ImagingApiService } from '../../../../services/imagingApiService';
import { VisionModelArtifact, ImageQualityMetrics } from '../../../../../server/cv/types';

interface MedicalImageUploaderProps {
  onStudyCreated: (study: any) => void;
  onCancel?: () => void;
  availableModels: VisionModelArtifact[];
  userRole?: 'patient' | 'clinician';
}

export const MedicalImageUploader: React.FC<MedicalImageUploaderProps> = ({
  onStudyCreated,
  onCancel,
  availableModels,
  userRole = 'patient'
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [modality, setModality] = useState<'X-Ray' | 'CT' | 'MRI'>('X-Ray');
  const [bodyRegion, setBodyRegion] = useState<'Chest' | 'Brain' | 'Musculoskeletal' | 'Abdomen'>('Chest');
  const [studyTitle, setStudyTitle] = useState('');
  const [indication, setIndication] = useState('');
  const [reportText, setReportText] = useState('');
  const [selectedModelId, setSelectedModelId] = useState(availableModels[0]?.modelId || 'cxr-densenet121-chexpert-v1.0');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [preflightQuality, setPreflightQuality] = useState<ImageQualityMetrics | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (file: File) => {
    setUploadError(null);
    setSelectedFile(file);

    // Auto title
    if (!studyTitle) {
      setStudyTitle(`${modality} ${bodyRegion} (${file.name.replace(/\.[^/.]+$/, '')})`);
    }

    // Local preview
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    // Pre-flight quality verification
    setIsValidating(true);
    try {
      const quality = await ImagingApiService.validateRawImage(file);
      setPreflightQuality(quality);
    } catch {
      setPreflightQuality(null);
    } finally {
      setIsValidating(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setUploadError('Please select a radiological image file to analyze.');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const result = await ImagingApiService.uploadAndAnalyze(selectedFile, {
        studyTitle: studyTitle || selectedFile.name,
        modality,
        bodyRegion,
        indication,
        modelId: selectedModelId,
        reportText: reportText.trim().length > 0 ? reportText : undefined
      });

      onStudyCreated(result.study);
    } catch (err: any) {
      setUploadError(err.message || 'Failed to analyze imaging study.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-[#FFFFFF] dark:bg-[#1A1916] border border-[#1A1A1A]/15 dark:border-[#EAE5DD]/12 p-6 sm:p-8 space-y-6">
      <div className="flex items-center justify-between border-b border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10 pb-4">
        <div>
          <span className="text-[10px] font-sans font-bold uppercase tracking-[0.25em] text-[#A38D7D]">
            DIAGNOSTIC INGESTION PIPELINE
          </span>
          <h3 className="font-editorial text-2xl italic text-[#1A1A1A] dark:text-[#EAE5DD]">
            Upload Medical Imaging Study
          </h3>
        </div>
        {onCancel && (
          <button 
            onClick={onCancel}
            className="p-2 hover:bg-[#F5F2ED] dark:hover:bg-[#282622] text-[#1A1A1A]/60 dark:text-[#EAE5DD]/60"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Drop Zone */}
        <div
          onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed p-8 text-center cursor-pointer transition-colors duration-150 ${
            dragActive 
              ? 'border-[#A38D7D] bg-[#A38D7D]/5' 
              : selectedFile 
                ? 'border-[#2D5A27] bg-[#2D5A27]/5 dark:bg-[#2D5A27]/10' 
                : 'border-[#1A1A1A]/20 dark:border-[#EAE5DD]/20 hover:border-[#A38D7D]'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg"
            onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
            className="hidden"
          />

          {selectedFile ? (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              {previewUrl && (
                <div className="w-24 h-24 bg-[#0A0A09] border border-[#1A1A1A]/20 dark:border-[#EAE5DD]/20 overflow-hidden flex items-center justify-center shrink-0">
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
              <div className="text-left space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-[#1A1A1A] dark:text-[#EAE5DD]">
                  <CheckCircle2 className="w-4 h-4 text-[#2D5A27]" />
                  <span>{selectedFile.name}</span>
                </div>
                <div className="text-xs font-mono-code text-[#1A1A1A]/60 dark:text-[#EAE5DD]/60">
                  {(selectedFile.size / 1024).toFixed(1)} KB &bull; {selectedFile.type || 'image'}
                </div>
                <p className="text-[11px] text-[#A38D7D] font-sans">
                  Click or drop another file to replace
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="w-12 h-12 mx-auto bg-[#F5F2ED] dark:bg-[#201E1A] flex items-center justify-center text-[#A38D7D]">
                <UploadCloud className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-sans font-bold text-[#1A1A1A] dark:text-[#EAE5DD]">
                  Drop standard chest radiograph or diagnostic image here
                </p>
                <p className="text-xs font-newsreader italic text-[#1A1A1A]/60 dark:text-[#EAE5DD]/60">
                  Supports PNG, JPG, JPEG (Grayscale 16-bit / 8-bit & DICOM export raster)
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Pre-flight Quality Feedback if File Selected */}
        {preflightQuality && (
          <div className={`p-4 border text-xs font-mono-code space-y-2 ${
            preflightQuality.isAbstained
              ? 'bg-[#8B0000]/10 border-[#8B0000]/30 text-[#8B0000] dark:text-[#FF8888]'
              : preflightQuality.status === 'DEGRADED'
                ? 'bg-[#A38D7D]/15 border-[#A38D7D]/40 text-[#1A1A1A] dark:text-[#EAE5DD]'
                : 'bg-[#2D5A27]/10 border-[#2D5A27]/30 text-[#2D5A27] dark:text-[#88FF88]'
          }`}>
            <div className="flex items-center justify-between">
              <span className="font-bold uppercase tracking-wider text-[10px]">
                PRE-FLIGHT QUALITY STATUS: {preflightQuality.status}
              </span>
              <span>Blur Var: {preflightQuality.blurVariance} &bull; Contrast: {preflightQuality.contrastRatio}</span>
            </div>
            {preflightQuality.warnings.length > 0 && (
              <div className="text-[11px] font-newsreader italic">
                {preflightQuality.warnings.map((w, i) => (
                  <div key={i}>&bull; {w}</div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Study Metadata Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-sans font-bold uppercase tracking-wider text-[#A38D7D]">
              Modality
            </label>
            <select
              value={modality}
              onChange={(e) => setModality(e.target.value as any)}
              className="w-full p-2.5 bg-[#F5F2ED] dark:bg-[#151412] border border-[#1A1A1A]/20 dark:border-[#EAE5DD]/20 text-xs font-sans text-[#1A1A1A] dark:text-[#EAE5DD] focus:outline-none"
            >
              <option value="X-Ray">X-Ray (Standard Radiograph)</option>
              <option value="CT">CT (Computed Tomography)</option>
              <option value="MRI">MRI (Magnetic Resonance)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-sans font-bold uppercase tracking-wider text-[#A38D7D]">
              Anatomical Region
            </label>
            <select
              value={bodyRegion}
              onChange={(e) => setBodyRegion(e.target.value as any)}
              className="w-full p-2.5 bg-[#F5F2ED] dark:bg-[#151412] border border-[#1A1A1A]/20 dark:border-[#EAE5DD]/20 text-xs font-sans text-[#1A1A1A] dark:text-[#EAE5DD] focus:outline-none"
            >
              <option value="Chest">Chest (Thoracic Cavity)</option>
              <option value="Brain">Brain / Neuro</option>
              <option value="Musculoskeletal">Musculoskeletal / Joint</option>
              <option value="Abdomen">Abdomen / Pelvis</option>
            </select>
          </div>
        </div>

        {/* Title & Indication */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-sans font-bold uppercase tracking-wider text-[#A38D7D]">
              Study Title / Label
            </label>
            <input
              type="text"
              value={studyTitle}
              onChange={(e) => setStudyTitle(e.target.value)}
              placeholder="e.g. Chest Radiograph PA"
              className="w-full p-2.5 bg-[#F5F2ED] dark:bg-[#151412] border border-[#1A1A1A]/20 dark:border-[#EAE5DD]/20 text-xs font-sans text-[#1A1A1A] dark:text-[#EAE5DD] focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-sans font-bold uppercase tracking-wider text-[#A38D7D]">
              Clinical Indication (Optional)
            </label>
            <input
              type="text"
              value={indication}
              onChange={(e) => setIndication(e.target.value)}
              placeholder="e.g. Persistent cough, dyspnea, fever"
              className="w-full p-2.5 bg-[#F5F2ED] dark:bg-[#151412] border border-[#1A1A1A]/20 dark:border-[#EAE5DD]/20 text-xs font-sans text-[#1A1A1A] dark:text-[#EAE5DD] focus:outline-none"
            />
          </div>
        </div>

        {/* Vision Architecture Selection */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-sans font-bold uppercase tracking-wider text-[#A38D7D] flex items-center justify-between">
            <span>Vision Screening Model</span>
            <span className="font-normal font-mono-code text-[#1A1A1A]/50 dark:text-[#EAE5DD]/50">CheXpert & MIMIC-CXR Verified</span>
          </label>
          <select
            value={selectedModelId}
            onChange={(e) => setSelectedModelId(e.target.value)}
            className="w-full p-2.5 bg-[#F5F2ED] dark:bg-[#151412] border border-[#1A1A1A]/20 dark:border-[#EAE5DD]/20 text-xs font-sans text-[#1A1A1A] dark:text-[#EAE5DD] focus:outline-none"
          >
            {availableModels.map(m => (
              <option key={m.modelId} value={m.modelId}>
                {m.modelName} &bull; {m.architecture} ({m.version})
              </option>
            ))}
          </select>
        </div>

        {/* Optional Multimodal Report Text */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-sans font-bold uppercase tracking-wider text-[#A38D7D] flex items-center justify-between">
            <span>Accompanying Radiology Report Text (Optional for Multimodal Discrepancy Check)</span>
          </label>
          <textarea
            rows={3}
            value={reportText}
            onChange={(e) => setReportText(e.target.value)}
            placeholder="Paste radiologist findings narrative to enable AI-vs-Report concordance verification..."
            className="w-full p-3 bg-[#F5F2ED] dark:bg-[#151412] border border-[#1A1A1A]/20 dark:border-[#EAE5DD]/20 text-xs font-mono-code text-[#1A1A1A] dark:text-[#EAE5DD] focus:outline-none leading-relaxed"
          />
        </div>

        {/* Error Display */}
        {uploadError && (
          <div className="p-4 bg-[#8B0000]/10 border border-[#8B0000]/30 text-[#8B0000] dark:text-[#FF8888] text-xs font-sans flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{uploadError}</span>
          </div>
        )}

        {/* Action Button */}
        <div className="flex items-center justify-end gap-3 pt-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2.5 bg-[#F5F2ED] dark:bg-[#201E1A] border border-[#1A1A1A]/20 dark:border-[#EAE5DD]/20 text-xs font-sans font-bold uppercase tracking-wider text-[#1A1A1A] dark:text-[#EAE5DD]"
            >
              Cancel
            </button>
          )}

          <button
            type="submit"
            disabled={!selectedFile || isUploading}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#1A1A1A] dark:bg-[#EAE5DD] text-[#F5F2ED] dark:text-[#151412] text-xs font-sans font-bold uppercase tracking-wider hover:opacity-90 disabled:opacity-40 cursor-pointer"
          >
            {isUploading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent animate-spin rounded-full" />
                <span>Running Neural Saliency Pipeline...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Execute Deep Learning Screening</span>
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
};
