/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * SAAHAJ Health Records Archive & Ingestion Hub
 * Supports real document uploads (PDF, DOCX, TXT, Images), SHA-256 deduplication,
 * real-time multi-stage pipeline status, and direct launch into Split-Screen Grounded Viewer.
 */

import React, { useState } from 'react';
import { DocumentIngestionDashboard } from './DocumentIngestionDashboard';
import { DocumentSourceViewer } from './DocumentSourceViewer';
import { V3Document } from '../../types';

interface HealthRecordsViewProps {
  setCurrentView: (view: string) => void;
  onSelectDocument?: (doc: any) => void;
}

export const HealthRecordsView: React.FC<HealthRecordsViewProps> = ({ 
  setCurrentView,
  onSelectDocument 
}) => {
  const [activeViewingDoc, setActiveViewingDoc] = useState<V3Document | null>(null);

  if (activeViewingDoc) {
    return (
      <DocumentSourceViewer
        document={activeViewingDoc}
        onBack={() => setActiveViewingDoc(null)}
      />
    );
  }

  return (
    <DocumentIngestionDashboard
      onSelectDocument={(doc) => setActiveViewingDoc(doc)}
    />
  );
};
