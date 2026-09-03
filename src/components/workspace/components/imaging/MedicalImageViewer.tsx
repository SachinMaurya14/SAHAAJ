import React, { useState, useRef } from 'react';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  SunMedium, 
  Sliders, 
  Eye, 
  Layers, 
  Columns, 
  Maximize2,
  MapPin,
  Sparkles,
  Info,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { ImagingStudyRecord, GradCamExplanation } from '../../../../../server/cv/types';

interface MedicalImageViewerProps {
  study: ImagingStudyRecord;
  userRole?: 'patient' | 'clinician';
  onAddAnnotation?: (coord: { x: number; y: number }, label: string) => void;
  annotations?: Array<{ annotationId: string; coordinates: { x: number; y: number }; label: string; notes?: string }>;
}

export const MedicalImageViewer: React.FC<MedicalImageViewerProps> = ({
  study,
  userRole = 'patient',
  onAddAnnotation,
  annotations = []
}) => {
  const [zoomLevel, setZoomLevel] = useState(100);
  const [contrastLevel, setContrastLevel] = useState(100);
  const [brightnessLevel, setBrightnessLevel] = useState(100);
  const [isInverted, setIsInverted] = useState(false);
  
  // Saliency Controls
  const [gradCamActive, setGradCamActive] = useState(true);
  const [heatmapOpacity, setHeatmapOpacity] = useState(65);
  const [viewMode, setViewMode] = useState<'overlay' | 'side_by_side' | 'split'>('overlay');
  const [splitPosition, setSplitPosition] = useState(50);
  const [selectedBlendMode, setSelectedBlendMode] = useState<'screen' | 'overlay' | 'color-dodge'>('screen');

  // Annotation Mode
  const [isAnnotating, setIsAnnotating] = useState(false);
  const [newAnnotationLabel, setNewAnnotationLabel] = useState('Suspected Opacity');

  const viewportRef = useRef<HTMLDivElement>(null);

  const resetViewport = () => {
    setZoomLevel(100);
    setContrastLevel(100);
    setBrightnessLevel(100);
    setIsInverted(false);
    setViewMode('overlay');
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isAnnotating || !onAddAnnotation || !viewportRef.current) return;
    const rect = viewportRef.current.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
    onAddAnnotation({ x, y }, newAnnotationLabel);
    setIsAnnotating(false);
  };

  const imageSrc = study.originalImageBase64;
  const heatmapSrc = study.gradCamHeatmapBase64;

  return (
    <div className="bg-[#151412] border border-[#1A1A1A]/20 dark:border-[#EAE5DD]/12 p-4 space-y-3">
      
      {/* Viewport Control Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-3.5 py-2.5 bg-[#1A1916] border border-[#EAE5DD]/10 text-xs font-mono-code text-[#EAE5DD]/80">
        <div className="flex items-center gap-2">
          <span className="text-[#A38D7D] font-bold">{study.modality}</span>
          <span className="text-[#EAE5DD]/30">|</span>
          <span>{study.bodyRegion}</span>
          <span className="text-[#EAE5DD]/30">|</span>
          <span className="text-[10px] text-[#EAE5DD]/60">SHA: {study.provenance?.imageSha256?.substring(0, 8)}...</span>
        </div>

        {/* Viewport Action Controls */}
        <div className="flex items-center gap-1.5 flex-wrap">
          
          {/* View Mode Switcher */}
          <div className="flex items-center bg-[#0A0A09] border border-[#EAE5DD]/15 p-0.5 mr-2">
            <button
              onClick={() => setViewMode('overlay')}
              className={`px-2 py-0.5 text-[10px] uppercase font-bold ${viewMode === 'overlay' ? 'bg-[#A38D7D] text-[#151412]' : 'text-[#EAE5DD]/70 hover:text-[#EAE5DD]'}`}
            >
              Overlay
            </button>
            <button
              onClick={() => setViewMode('side_by_side')}
              className={`px-2 py-0.5 text-[10px] uppercase font-bold ${viewMode === 'side_by_side' ? 'bg-[#A38D7D] text-[#151412]' : 'text-[#EAE5DD]/70 hover:text-[#EAE5DD]'}`}
            >
              Side-by-Side
            </button>
            <button
              onClick={() => setViewMode('split')}
              className={`px-2 py-0.5 text-[10px] uppercase font-bold ${viewMode === 'split' ? 'bg-[#A38D7D] text-[#151412]' : 'text-[#EAE5DD]/70 hover:text-[#EAE5DD]'}`}
            >
              Split
            </button>
          </div>

          <button
            onClick={() => setZoomLevel(prev => Math.min(prev + 20, 250))}
            className="p-1.5 hover:bg-[#282622] text-[#EAE5DD] cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoomLevel(prev => Math.max(prev - 20, 60))}
            className="p-1.5 hover:bg-[#282622] text-[#EAE5DD] cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsInverted(prev => !prev)}
            className={`p-1.5 hover:bg-[#282622] cursor-pointer ${isInverted ? 'text-[#A38D7D]' : 'text-[#EAE5DD]'}`}
            title="Invert Grayscale (B/W)"
          >
            <SunMedium className="w-4 h-4" />
          </button>
          <button
            onClick={resetViewport}
            className="p-1.5 hover:bg-[#282622] text-[#EAE5DD] cursor-pointer"
            title="Reset Viewport"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {userRole === 'clinician' && onAddAnnotation && (
            <button
              onClick={() => setIsAnnotating(prev => !prev)}
              className={`flex items-center gap-1 px-2 py-1 text-[10px] font-bold uppercase border ${
                isAnnotating 
                  ? 'bg-[#A38D7D] text-[#151412] border-[#A38D7D]' 
                  : 'bg-[#282622] text-[#EAE5DD] border-[#EAE5DD]/20 hover:border-[#A38D7D]'
              }`}
            >
              <MapPin className="w-3 h-3" />
              <span>{isAnnotating ? 'Click Canvas' : 'Annotate'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Viewport Stage */}
      <div 
        ref={viewportRef}
        onClick={handleCanvasClick}
        className={`relative aspect-[4/3] bg-[#0A0A09] overflow-hidden flex items-center justify-center border border-[#EAE5DD]/10 ${
          isAnnotating ? 'cursor-crosshair' : 'cursor-default'
        }`}
      >
        
        {/* Render Based on Active View Mode */}
        {viewMode === 'overlay' && (
          <div 
            className="relative w-full h-full flex items-center justify-center transition-transform duration-100"
            style={{ 
              transform: `scale(${zoomLevel / 100})`,
              filter: `${isInverted ? 'invert(1)' : 'none'} contrast(${contrastLevel}%) brightness(${brightnessLevel}%)`
            }}
          >
            {/* Base Radiograph */}
            <img
              src={imageSrc}
              alt={study.title}
              className="w-full h-full object-contain select-none pointer-events-none"
              referrerPolicy="no-referrer"
            />

            {/* Grad-CAM Saliency Overlay */}
            {gradCamActive && heatmapSrc && (
              <div 
                className="absolute inset-0 pointer-events-none transition-opacity duration-150"
                style={{ 
                  opacity: heatmapOpacity / 100,
                  mixBlendMode: selectedBlendMode
                }}
              >
                <img
                  src={heatmapSrc}
                  alt="Grad-CAM Saliency"
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
            )}

            {/* Annotations Marker Overlay */}
            {annotations.map((ann, idx) => (
              <div
                key={ann.annotationId || idx}
                className="absolute -translate-x-1/2 -translate-y-1/2 z-20 group"
                style={{ left: `${ann.coordinates.x}%`, top: `${ann.coordinates.y}%` }}
              >
                <div className="w-3.5 h-3.5 rounded-full bg-[#E63946] border-2 border-white shadow-lg animate-pulse" />
                <div className="absolute left-4 top-0 whitespace-nowrap px-2 py-0.5 bg-[#151412]/90 border border-white/20 text-[10px] text-white font-mono-code rounded shadow">
                  {ann.label}
                </div>
              </div>
            ))}
          </div>
        )}

        {viewMode === 'side_by_side' && (
          <div className="grid grid-cols-2 w-full h-full gap-1 p-1">
            <div className="relative w-full h-full bg-[#000000] flex items-center justify-center border border-[#EAE5DD]/10 overflow-hidden">
              <img src={imageSrc} alt="Original Radiograph" className="w-full h-full object-contain" />
              <span className="absolute bottom-2 left-2 text-[9px] font-mono-code bg-[#151412]/80 px-2 py-0.5 text-[#EAE5DD]/80">
                ORIGINAL RADIOGRAPH
              </span>
            </div>
            <div className="relative w-full h-full bg-[#000000] flex items-center justify-center border border-[#EAE5DD]/10 overflow-hidden">
              <img src={imageSrc} alt="Base" className="w-full h-full object-contain" />
              {heatmapSrc && (
                <div className="absolute inset-0 pointer-events-none" style={{ opacity: heatmapOpacity / 100, mixBlendMode: 'screen' }}>
                  <img src={heatmapSrc} alt="Grad-CAM" className="w-full h-full object-contain" />
                </div>
              )}
              <span className="absolute bottom-2 left-2 text-[9px] font-mono-code bg-[#151412]/80 px-2 py-0.5 text-[#A38D7D] font-bold">
                GRAD-CAM ATTENTION
              </span>
            </div>
          </div>
        )}

        {viewMode === 'split' && (
          <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
            <img src={imageSrc} alt="Base" className="w-full h-full object-contain" />
            <div 
              className="absolute inset-0 overflow-hidden"
              style={{ clipPath: `inset(0 0 0 ${splitPosition}%)` }}
            >
              <img src={imageSrc} alt="Base" className="w-full h-full object-contain" />
              {heatmapSrc && (
                <div className="absolute inset-0 pointer-events-none" style={{ opacity: heatmapOpacity / 100, mixBlendMode: 'screen' }}>
                  <img src={heatmapSrc} alt="Grad-CAM" className="w-full h-full object-contain" />
                </div>
              )}
            </div>
            
            {/* Split Divider Line */}
            <div 
              className="absolute top-0 bottom-0 w-0.5 bg-[#A38D7D] z-10 shadow-[0_0_8px_rgba(163,141,125,0.8)]"
              style={{ left: `${splitPosition}%` }}
            >
              <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-[#151412] border border-[#A38D7D] flex items-center justify-center text-[9px] text-[#A38D7D] font-bold cursor-ew-resize">
                &harr;
              </div>
            </div>
          </div>
        )}

        {/* HUD Overlay Stats */}
        <div className="absolute top-2 left-2 text-[10px] font-mono-code text-[#EAE5DD]/70 bg-[#151412]/85 px-2.5 py-1.5 border border-[#EAE5DD]/10 space-y-0.5 pointer-events-none">
          <div>STUDY: {study.studyId}</div>
          <div>ZOOM: {zoomLevel}%</div>
          <div>DIM: {study.imageDimensions?.width || 512}&times;{study.imageDimensions?.height || 512}</div>
        </div>

        <div className="absolute bottom-2 right-2 text-[10px] font-mono-code text-[#EAE5DD]/70 bg-[#151412]/85 px-2.5 py-1.5 border border-[#EAE5DD]/10 pointer-events-none">
          GRAD-CAM: {gradCamActive ? `ACTIVE (${heatmapOpacity}%)` : 'OFF'}
        </div>
      </div>

      {/* Saliency & Image Adjustment Controls Bar */}
      <div className="p-3 bg-[#1A1916] border border-[#EAE5DD]/10 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono-code text-[#EAE5DD]">
        
        {/* Left: Grad-CAM Opacity & Blend */}
        <div className="flex items-center justify-between gap-3">
          <label className="flex items-center gap-2 cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={gradCamActive}
              onChange={(e) => setGradCamActive(e.target.checked)}
              className="rounded border-[#EAE5DD]/30 text-[#A38D7D] focus:ring-0 cursor-pointer"
            />
            <span className="text-[11px] font-bold text-[#A38D7D]">Grad-CAM Saliency Layer</span>
          </label>

          <div className="flex items-center gap-2 w-full max-w-[200px]">
            <span className="text-[10px] text-[#EAE5DD]/60">Opacity:</span>
            <input
              type="range"
              min="0"
              max="100"
              value={heatmapOpacity}
              disabled={!gradCamActive}
              onChange={(e) => setHeatmapOpacity(Number(e.target.value))}
              className="w-full h-1 bg-[#282622] accent-[#A38D7D] cursor-pointer disabled:opacity-30"
            />
            <span className="text-[10px] w-7 text-right">{heatmapOpacity}%</span>
          </div>
        </div>

        {/* Right: Split Slider or Contrast/Brightness Adjust */}
        {viewMode === 'split' ? (
          <div className="flex items-center gap-2 justify-end">
            <span className="text-[10px] text-[#EAE5DD]/60">Split Position:</span>
            <input
              type="range"
              min="0"
              max="100"
              value={splitPosition}
              onChange={(e) => setSplitPosition(Number(e.target.value))}
              className="w-48 h-1 bg-[#282622] accent-[#A38D7D] cursor-pointer"
            />
            <span className="text-[10px] w-7 text-right">{splitPosition}%</span>
          </div>
        ) : (
          <div className="flex items-center gap-4 justify-end">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-[#EAE5DD]/60">Contrast:</span>
              <input
                type="range"
                min="50"
                max="180"
                value={contrastLevel}
                onChange={(e) => setContrastLevel(Number(e.target.value))}
                className="w-24 h-1 bg-[#282622] accent-[#A38D7D] cursor-pointer"
              />
              <span className="text-[10px] w-6">{contrastLevel}%</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] text-[#EAE5DD]/60">Brightness:</span>
              <input
                type="range"
                min="50"
                max="180"
                value={brightnessLevel}
                onChange={(e) => setBrightnessLevel(Number(e.target.value))}
                className="w-24 h-1 bg-[#282622] accent-[#A38D7D] cursor-pointer"
              />
              <span className="text-[10px] w-6">{brightnessLevel}%</span>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
