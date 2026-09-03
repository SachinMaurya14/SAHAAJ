# SAAHAJ Clinical Audit Trail Specification (V8)

## 1. Audit Log Schema
Every clinician action, synthesis generation, review decision, and patient handoff is logged immutably in the storage audit trail:

```typescript
interface AuditLog {
  id: string;
  timestamp: string; // ISO 8601 UTC
  userId: string;
  action: string;
  details: {
    patientId?: string;
    synthesisId?: string;
    sectionKey?: string;
    version?: number;
    visibility?: string;
    notes?: string;
  };
}
```

## 2. Tracked Event Types
- `CLINICAL_SNAPSHOT_ACCESSED`
- `CLINICAL_BRIEFING_GENERATED`
- `CLINICAL_SYNTHESIS_GENERATED`
- `SECTION_ACCEPT`
- `SECTION_EDIT`
- `SECTION_REJECT`
- `CLINICAL_SYNTHESIS_FINALIZED`
- `PATIENT_EXPLANATION_PREPARED`
- `PATIENT_EXPLANATION_SHARED`
- `CLINICIAN_NOTE_SAVED`
