/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * SAAHAJ Evidence Panel Component
 * Displays retrieved source passages, pages, sections, relevance scores,
 * and origin distinctions (User Records vs General Health Knowledge).
 */

import React from 'react';
import { V3Citation, V3EvidenceItem } from '../../types';
import { BookOpen, FileText, CheckCircle2, ShieldAlert, Sparkles, ExternalLink } from 'lucide-react';

interface EvidencePanelProps {
  citations?: V3Citation[];
  evidence?: V3EvidenceItem[];
  activeCitationId?: string | null;
  onSelectCitation?: (citation: V3Citation) => void;
  onSelectEvidence?: (evidence: V3EvidenceItem) => void;
}

export const EvidencePanel: React.FC<EvidencePanelProps> = ({
  citations = [],
  evidence = [],
  activeCitationId,
  onSelectCitation,
  onSelectEvidence
}) => {
  if (citations.length === 0 && evidence.length === 0) {
    return (
      <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/50 text-center text-xs text-stone-500">
        No cited evidence chunks attached to this response.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          Retrieved Grounding Evidence ({citations.length || evidence.length})
        </h4>
        <span className="text-[11px] text-stone-500 font-mono">Verified Grounding</span>
      </div>

      <div className="space-y-2">
        {citations.map((cit, idx) => {
          const isActive = activeCitationId === cit.citation_id || activeCitationId === cit.chunk_id;
          return (
            <div
              key={cit.citation_id || idx}
              onClick={() => onSelectCitation && onSelectCitation(cit)}
              className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                isActive
                  ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/40 ring-1 ring-emerald-500'
                  : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 hover:border-stone-300 dark:hover:border-stone-700'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/80 text-emerald-800 dark:text-emerald-300 font-mono text-[10px] font-bold flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <span className="text-xs font-medium text-stone-900 dark:text-stone-100 truncate max-w-[200px]">
                    {cit.document_name}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 font-mono">
                    p. {cit.page_number}
                  </span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                  {cit.source_origin === 'FROM_YOUR_RECORDS' ? 'User Record' : 'Guideline'}
                </span>
              </div>

              <div className="text-xs text-stone-600 dark:text-stone-300 italic line-clamp-3 bg-stone-50 dark:bg-stone-950/60 p-2 rounded border border-stone-100 dark:border-stone-800/80 font-serif">
                "{cit.quoted_source_span}"
              </div>

              <div className="mt-1.5 flex items-center justify-between text-[11px] text-stone-500">
                <span className="truncate">Section: {cit.section}</span>
                <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">
                  {Math.round(cit.relevance_score * 100)}% match
                </span>
              </div>
            </div>
          );
        })}

        {citations.length === 0 && evidence.map((ev, idx) => (
          <div
            key={ev.chunk_id || idx}
            onClick={() => onSelectEvidence && onSelectEvidence(ev)}
            className="p-3 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-left text-xs"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-medium text-stone-900 dark:text-stone-100">{ev.document_name} (Page {ev.page_number})</span>
              <span className="text-[10px] font-mono text-emerald-600">{Math.round(ev.relevance_score * 100)}%</span>
            </div>
            <p className="text-stone-600 dark:text-stone-300 font-serif italic text-xs">{ev.text.slice(0, 160)}...</p>
          </div>
        ))}
      </div>
    </div>
  );
};
