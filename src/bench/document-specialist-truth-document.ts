import type { DocumentSpecialistTruthItem } from './document-specialist-truth-item';

export interface DocumentSpecialistTruthDocument {
  readonly role: 'document-specialist';
  readonly answers: readonly DocumentSpecialistTruthItem[];
}
