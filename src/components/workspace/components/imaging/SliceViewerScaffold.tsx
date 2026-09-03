import React, { useState } from 'react';
import { 
  Layers, 
  Sliders, 
  ChevronLeft, 
  ChevronRight, 
  Maximize2, 
  SunMedium, 
  Info,
  Cpu
} from 'lucide-react';
import { DicomService } from '../../../../../server/cv/dicomService';

interface SliceViewerScaffoldProps {
  totalSlices?: number;
  modality?: 'CT' | 'MRI';
}

export const SliceViewerScaffold: React.FC<SliceViewerScaffoldProps> = ({
  totalSlices = 48,
  modality = 'CT'
}) => {
  const [currentSlice, setCurrentSlice] = useState(24);
  const [activePreset, setActivePreset] = useState<'lung' | 'mediastinum' | 'bone' | 'brain'>('lung');
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="bg-[#FFFFFF] dark:bg-[#1A1916] border border-[#1A1A1A]/15 dark:border-[#EAE5DD]/12 p-6 space-y-4">
      <div className="flex items-center justify-between border-b border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10 pb-3">
        <div>
          <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-[#A38D7D]">
            VOLUMETRIC AXIAL SERIES VIEWER (RESEARCH SCAFFOLD)
          </span>
          <h4 className="font-editorial text-xl italic text-[#1A1A1A] dark:text-[#EAE5DD]">
            3D Slice Navigation & Window Presets
          </h4>
        </div>
        <span className="text-xs font-mono-code text-[#1A1A1A]/60 dark:text-[#EAE5DD]/60">
          Slice {currentSlice} of {totalSlices}
        </span>
      </div>

      {/* Scaffold Viewport */}
      <div className="relative aspect-[4/3] bg-[#0A0A09] border border-[#EAE5DD]/10 flex flex-col items-center justify-center text-center p-6 text-[#EAE5DD]">
        <div className="space-y-2 max-w-md">
          <Layers className="w-8 h-8 text-[#A38D7D] mx-auto animate-pulse" />
          <div className="font-editorial text-2xl italic text-[#EAE5DD]">
            Axial Slice #{currentSlice} ({modality})
          </div>
          <p className="font-newsreader text-xs italic text-[#EAE5DD]/70">
            Window preset active: <span className="font-mono-code uppercase font-bold text-[#A38D7D]">{activePreset}</span>.
            Hounsfield unit linear attenuation transformed to 8-bit dynamic range.
          </p>
        </div>

        <div className="absolute top-2 left-2 text-[10px] font-mono-code text-[#EAE5DD]/60 bg-[#151412]/80 px-2 py-1 border border-[#EAE5DD]/10">
          <span>THICKNESS: 1.25 mm &bull; MATRIX: 512&times;512</span>
        </div>
      </div>

      {/* Slice Slider & Controls */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setCurrentSlice(prev => Math.max(1, prev - 1))}
            className="p-1.5 bg-[#F5F2ED] dark:bg-[#201E1A] border border-[#1A1A1A]/15 dark:border-[#EAE5DD]/15 text-[#1A1A1A] dark:text-[#EAE5DD]"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <input
            type="range"
            min="1"
            max={totalSlices}
            value={currentSlice}
            onChange={(e) => setCurrentSlice(Number(e.target.value))}
            className="w-full h-1.5 bg-[#1A1A1A]/20 dark:bg-[#EAE5DD]/20 accent-[#A38D7D] cursor-pointer"
          />

          <button
            onClick={() => setCurrentSlice(prev => Math.min(totalSlices, prev + 1))}
            className="p-1.5 bg-[#F5F2ED] dark:bg-[#201E1A] border border-[#1A1A1A]/15 dark:border-[#EAE5DD]/15 text-[#1A1A1A] dark:text-[#EAE5DD]"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Window Presets Buttons */}
        <div className="flex items-center justify-between gap-2 flex-wrap text-xs font-mono-code">
          <span className="text-[10px] text-[#A38D7D] font-bold uppercase">Hounsfield Window Presets:</span>
          <div className="flex items-center gap-1.5">
            {(['lung', 'mediastinum', 'bone', 'brain'] as const).map(p => (
              <button
                key={p}
                onClick={() => setActivePreset(p)}
                className={`px-2.5 py-1 text-[10px] uppercase font-bold border ${
                  activePreset === p
                    ? 'bg-[#A38D7D] text-[#151412] border-[#A38D7D]'
                    : 'bg-[#F5F2ED] dark:bg-[#201E1A] text-[#1A1A1A] dark:text-[#EAE5DD] border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
};
