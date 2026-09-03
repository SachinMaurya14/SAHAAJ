import React, { useState } from 'react';
import { 
  Clock, 
  Filter, 
  FileText, 
  Eye, 
  Activity, 
  Pill, 
  Calendar, 
  ChevronRight, 
  Sparkles,
  Stethoscope,
  ArrowRight,
  PlusCircle,
  Upload,
  RefreshCw
} from 'lucide-react';
import { HealthEvent } from '../../types';
import { useHealthData } from '../../context/HealthDataContext';
import { AskSaahajDrawer } from '../common/AskSaahajDrawer';

interface HealthTimelineViewProps {
  setCurrentView: (view: string) => void;
}

export const HealthTimelineView: React.FC<HealthTimelineViewProps> = ({ setCurrentView }) => {
  const { timelineEvents, loadDevFixture, isDevFixtureLoaded } = useHealthData();
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [isAskSaahajOpen, setIsAskSaahajOpen] = useState(false);

  const filteredItems = timelineEvents.filter(item => 
    filterCategory === 'all' || item.category === filterCategory
  );

  const getCategoryIcon拼 = (category?: string) => {
    switch (category) {
      case 'Lab Panel':
        return <FileText className="w-4 h-4 text-[#A38D7D]" />;
      case 'Imaging':
        return <Eye className="w-4 h-4 text-[#A38D7D]" />;
      case 'Risk Evaluation':
        return <Activity className="w-4 h-4 text-[#A38D7D]" />;
      case 'Prescription':
        return <Pill className="w-4 h-4 text-[#A38D7D]" />;
      case 'Vitals Change':
        return <Activity className="w-4 h-4 text-[#A38D7D]" />;
      default:
        return <Calendar className="w-4 h-4 text-[#A38D7D]" />;
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Top Banner */}
      <div className="p-6 sm:p-8 bg-[#FFFFFF] dark:bg-[#1A1916] border border-[#1A1A1A]/15 dark:border-[#EAE5DD]/12 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-sans font-bold uppercase tracking-[0.25em] text-[#A38D7D]">
                CHRONOLOGY & TRAJECTORY
              </span>
              <span className="text-xs font-newsreader italic text-[#1A1A1A]/60 dark:text-[#EAE5DD]/60">
                &bull; Longitudinal Event Archive ({timelineEvents.length} Events)
              </span>
            </div>
            <h2 className="font-editorial text-3xl italic text-[#1A1A1A] dark:text-[#EAE5DD] mt-1">
              Longitudinal Health Journal
            </h2>
            <p className="text-xs font-newsreader italic text-[#1A1A1A]/60 dark:text-[#EAE5DD]/60">
              Chronological synthesis of lab panels, imaging scans, tabular risk models, and clinical interventions.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAskSaahajOpen(true)}
              className="text-xs font-sans font-bold uppercase tracking-wider px-3.5 py-2 bg-[#1A1A1A] dark:bg-[#EAE5DD] text-[#F5F2ED] dark:text-[#151412] flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ask About Timeline</span>
            </button>

            {/* Category Filter */}
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 bg-[#F5F2ED] dark:bg-[#151412] border border-[#1A1A1A]/20 dark:border-[#EAE5DD]/20 text-xs font-sans text-[#1A1A1A] dark:text-[#EAE5DD] focus:outline-none"
            >
              <option value="all">All Events</option>
              <option value="Lab Panel">Lab Panels</option>
              <option value="Imaging">Imaging Scans</option>
              <option value="Risk Evaluation">Risk Evaluations</option>
              <option value="Vitals Change">Vitals Changes</option>
              <option value="Prescription">Prescriptions</option>
            </select>
          </div>
        </div>
      </div>

      {/* Empty State vs Timeline Stream */}
      {timelineEvents.length === 0 ? (
        <div className="p-12 bg-[#FFFFFF] dark:bg-[#1A1916] border border-[#1A1A1A]/15 dark:border-[#EAE5DD]/12 text-center space-y-4 max-w-2xl mx-auto">
          <Clock className="w-10 h-10 text-[#A38D7D] mx-auto opacity-70" />
          <div className="space-y-1">
            <h3 className="font-editorial text-2xl italic text-[#1A1A1A] dark:text-[#EAE5DD]">
              Your health timeline is empty.
            </h3>
            <p className="text-xs font-newsreader italic text-[#1A1A1A]/60 dark:text-[#EAE5DD]/60">
              Add health information, record vitals, or upload medical reports to begin constructing your longitudinal health history.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setCurrentView('app-health-input')}
              className="px-5 py-2.5 bg-[#1A1A1A] dark:bg-[#EAE5DD] text-[#F5F2ED] dark:text-[#151412] text-xs font-sans font-bold uppercase tracking-wider cursor-pointer"
            >
              Record First Vitals
            </button>
            <button
              onClick={() => setCurrentView('app-records')}
              className="px-4 py-2.5 bg-[#F5F2ED] dark:bg-[#201E1A] border border-[#1A1A1A]/15 dark:border-[#EAE5DD]/15 text-xs font-sans font-bold uppercase tracking-wider text-[#1A1A1A] dark:text-[#EAE5DD] cursor-pointer"
            >
              Upload a Report
            </button>
            <button
              onClick={loadDevFixture}
              className="px-4 py-2.5 bg-[#F5F2ED] dark:bg-[#201E1A] border border-[#1A1A1A]/15 dark:border-[#EAE5DD]/15 text-xs font-sans font-bold uppercase tracking-wider text-[#1A1A1A] dark:text-[#EAE5DD] cursor-pointer flex items-center gap-1.5"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Load Sample Timeline</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-3 before:top-3 before:bottom-3 before:w-[1px] before:bg-[#1A1A1A]/20 dark:before:bg-[#EAE5DD]/20">
          {filteredItems.map((item) => (
            <div key={item.event_id} className="relative group">
              
              {/* Editorial Node Square / Dot */}
              <div className="absolute -left-[27px] sm:-left-[35px] top-1.5 w-5 h-5 bg-[#F5F2ED] dark:bg-[#1A1916] border border-[#1A1A1A]/40 dark:border-[#EAE5DD]/40 flex items-center justify-center">
                <span className="w-1.5 h-1.5 bg-[#A38D7D]" />
              </div>

              {/* Timeline Card */}
              <div className="p-6 bg-[#FFFFFF] dark:bg-[#1A1916] border border-[#1A1A1A]/15 dark:border-[#EAE5DD]/12 hover:border-[#1A1A1A]/40 transition-all space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#F5F2ED] dark:bg-[#201E1A] border border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10">
                      {getCategoryIcon拼(item.category)}
                    </div>
                    <div>
                      <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-[#A38D7D] block">
                        {item.timestamp}
                      </span>
                      <h3 className="font-editorial text-2xl italic text-[#1A1A1A] dark:text-[#EAE5DD]">
                        {item.title}
                      </h3>
                    </div>
                  </div>

                  <span className="self-start sm:self-center px-2.5 py-0.5 border border-[#1A1A1A]/20 dark:border-[#EAE5DD]/20 bg-[#F5F2ED] dark:bg-[#201E1A] text-[9px] font-sans font-bold uppercase tracking-wider text-[#1A1A1A] dark:text-[#EAE5DD]">
                    {item.category || item.event_type}
                  </span>
                </div>

                <p className="font-newsreader text-sm italic text-[#1A1A1A]/80 dark:text-[#EAE5DD]/80 leading-relaxed">
                  {item.description}
                </p>

                {/* Metrics (if available) */}
                {item.metrics && item.metrics.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {item.metrics.map((m, idx) => (
                      <div key={idx} className="px-3 py-1.5 bg-[#F5F2ED] dark:bg-[#201E1A] border border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10 text-xs font-mono-code flex items-center gap-2">
                        <span className="text-[#1A1A1A]/60 dark:text-[#EAE5DD]/60 text-[10px]">{m.label}:</span>
                        <strong className="text-[#1A1A1A] dark:text-[#EAE5DD]">{m.value}</strong>
                      </div>
                    ))}
                  </div>
                )}

                {/* Origin attribution */}
                {item.source && (
                  <div className="pt-3 flex items-center justify-between text-xs text-[#1A1A1A]/60 dark:text-[#EAE5DD]/60 border-t border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10">
                    <div className="flex items-center gap-2 font-newsreader italic">
                      <Stethoscope className="w-3.5 h-3.5 text-[#A38D7D]" />
                      <span>Origin: {item.source}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Contextual Ask SAAHAJ Drawer */}
      <AskSaahajDrawer
        isOpen={isAskSaahajOpen}
        onClose={() => setIsAskSaahajOpen(false)}
        contextType="Health Timeline"
        currentContext={{
          totalEvents: timelineEvents.length,
          events: timelineEvents.slice(0, 5)
        }}
        userRole="patient"
      />

    </div>
  );
};
