/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * SAAHAJ Modular Document Parser
 * Parses PDF, DOCX, TXT, and Images into structured PageRecord items with section detection.
 */

import * as pdfParseModule from 'pdf-parse';
const pdfParse: any = (pdfParseModule as any).default || pdfParseModule;
import mammoth from 'mammoth';
import { PageRecord, SupportedFileType } from '../types';
import { OCRService } from './ocrService';
import { GoogleGenAI } from '@google/genai';

export interface ParseResult {
  pages: PageRecord[];
  pageCount: number;
  detectedTitle: string;
  detectedFacility?: string;
  detectedDate?: string;
  detectedPhysician?: string;
  ocrConfidence?: number;
  extractionMethod: 'NATIVE_TEXT' | 'OCR';
}

const COMMON_SECTIONS = [
  'Patient Information',
  'Clinical History',
  'Findings',
  'Impression',
  'Laboratory Results',
  'Reference Range',
  'Medications',
  'Observations',
  'Conclusion',
  'Recommendations',
  'Specimen Details',
  'Lipid Profile',
  'Metabolic Panel',
  'Complete Blood Count',
  'Renal Function Panel',
  'Liver Function Panel',
  'Thyroid Profile'
];

export class ParserService {
  /**
   * Main parsing dispatcher
   */
  public static async parseDocument(
    fileBuffer: Buffer,
    fileType: SupportedFileType,
    documentId: string,
    userId: string,
    filename: string,
    aiClient: GoogleGenAI | null
  ): Promise<ParseResult> {
    switch (fileType) {
      case 'pdf':
        return await this.parsePdf(fileBuffer, documentId, userId, filename);
      case 'docx':
        return await this.parseDocx(fileBuffer, documentId, userId, filename);
      case 'txt':
        return this.parseTxt(fileBuffer, documentId, userId, filename);
      case 'png':
      case 'jpg':
      case 'jpeg':
        return await this.parseImage(fileBuffer, fileType, documentId, userId, filename, aiClient);
      default:
        return this.parseTxt(fileBuffer, documentId, userId, filename);
    }
  }

  /**
   * Parses PDF file buffer
   */
  private static async parsePdf(
    buffer: Buffer,
    documentId: string,
    userId: string,
    filename: string
  ): Promise<ParseResult> {
    try {
      const data = await pdfParse(buffer, {
        // Custom pager renderer if needed
      });

      const fullText = data.text || '';
      // Approximate pages by form-feed or newline chunks if single page object returned
      const pageTexts = fullText.split(/\f|\n{4,}/).filter(t => t.trim().length > 0);
      const rawPages = pageTexts.length > 0 ? pageTexts : [fullText];

      const pages: PageRecord[] = rawPages.map((text, idx) => {
        const detectedSections = this.detectSections(text);
        const hasTables = this.detectTableStructure(text);
        return {
          page_id: `page-${documentId}-${idx + 1}`,
          document_id: documentId,
          user_id: userId,
          page_number: idx + 1,
          text: text.trim(),
          detected_sections: detectedSections,
          has_tables: hasTables,
          extraction_method: 'NATIVE_TEXT'
        };
      });

      const metadata = this.extractHeaderMetadata(fullText, filename);

      return {
        pages: pages.length > 0 ? pages : [{
          page_id: `page-${documentId}-1`,
          document_id: documentId,
          user_id: userId,
          page_number: 1,
          text: fullText.trim() || 'Empty Document Content',
          detected_sections: ['General Document'],
          has_tables: false,
          extraction_method: 'NATIVE_TEXT'
        }],
        pageCount: pages.length || 1,
        detectedTitle: metadata.title,
        detectedFacility: metadata.facility,
        detectedDate: metadata.date,
        detectedPhysician: metadata.physician,
        extractionMethod: 'NATIVE_TEXT'
      };
    } catch (err: any) {
      console.warn('PDF parsing fallback:', err.message);
      // Fallback: extract text directly from buffer
      const text = buffer.toString('utf-8').replace(/[^\x20-\x7E\n\r\t]/g, ' ').trim();
      return {
        pages: [{
          page_id: `page-${documentId}-1`,
          document_id: documentId,
          user_id: userId,
          page_number: 1,
          text: text || 'PDF Content extracted via text stream.',
          detected_sections: ['Extracted Document'],
          has_tables: false,
          extraction_method: 'NATIVE_TEXT'
        }],
        pageCount: 1,
        detectedTitle: filename.replace(/\.[^/.]+$/, ''),
        extractionMethod: 'NATIVE_TEXT'
      };
    }
  }

  /**
   * Parses DOCX file buffer
   */
  private static async parseDocx(
    buffer: Buffer,
    documentId: string,
    userId: string,
    filename: string
  ): Promise<ParseResult> {
    try {
      const result = await mammoth.extractRawText({ buffer });
      const fullText = result.value || '';
      const paragraphs = fullText.split(/\n\s*\n/).filter(p => p.trim().length > 0);

      // Group paragraphs into pages of ~1800 chars
      const pageTexts: string[] = [];
      let currentAcc = '';
      for (const p of paragraphs) {
        if (currentAcc.length + p.length > 1800) {
          pageTexts.push(currentAcc);
          currentAcc = p;
        } else {
          currentAcc += (currentAcc ? '\n\n' : '') + p;
        }
      }
      if (currentAcc) pageTexts.push(currentAcc);

      const pages: PageRecord[] = pageTexts.map((text, idx) => ({
        page_id: `page-${documentId}-${idx + 1}`,
        document_id: documentId,
        user_id: userId,
        page_number: idx + 1,
        text: text.trim(),
        detected_sections: this.detectSections(text),
        has_tables: this.detectTableStructure(text),
        extraction_method: 'NATIVE_TEXT'
      }));

      const metadata = this.extractHeaderMetadata(fullText, filename);

      return {
        pages: pages.length > 0 ? pages : [{
          page_id: `page-${documentId}-1`,
          document_id: documentId,
          user_id: userId,
          page_number: 1,
          text: fullText,
          detected_sections: ['General Document'],
          has_tables: false,
          extraction_method: 'NATIVE_TEXT'
        }],
        pageCount: pages.length || 1,
        detectedTitle: metadata.title,
        detectedFacility: metadata.facility,
        detectedDate: metadata.date,
        detectedPhysician: metadata.physician,
        extractionMethod: 'NATIVE_TEXT'
      };
    } catch (err: any) {
      console.warn('DOCX parsing error:', err.message);
      return {
        pages: [{
          page_id: `page-${documentId}-1`,
          document_id: documentId,
          user_id: userId,
          page_number: 1,
          text: buffer.toString('utf-8'),
          detected_sections: ['Extracted Document'],
          has_tables: false,
          extraction_method: 'NATIVE_TEXT'
        }],
        pageCount: 1,
        detectedTitle: filename.replace(/\.[^/.]+$/, ''),
        extractionMethod: 'NATIVE_TEXT'
      };
    }
  }

  /**
   * Parses TXT file buffer
   */
  private static parseTxt(
    buffer: Buffer,
    documentId: string,
    userId: string,
    filename: string
  ): ParseResult {
    const fullText = buffer.toString('utf-8');
    const sections = fullText.split(/\n\s*---+\s*\n|\n\s*===+\s*\n/);
    const rawPages = sections.length > 1 ? sections : [fullText];

    const pages: PageRecord[] = rawPages.map((text, idx) => ({
      page_id: `page-${documentId}-${idx + 1}`,
      document_id: documentId,
      user_id: userId,
      page_number: idx + 1,
      text: text.trim(),
      detected_sections: this.detectSections(text),
      has_tables: this.detectTableStructure(text),
      extraction_method: 'NATIVE_TEXT'
    }));

    const metadata = this.extractHeaderMetadata(fullText, filename);

    return {
      pages,
      pageCount: pages.length,
      detectedTitle: metadata.title,
      detectedFacility: metadata.facility,
      detectedDate: metadata.date,
      detectedPhysician: metadata.physician,
      extractionMethod: 'NATIVE_TEXT'
    };
  }

  /**
   * Parses Image via OCR Service
   */
  private static async parseImage(
    buffer: Buffer,
    fileType: SupportedFileType,
    documentId: string,
    userId: string,
    filename: string,
    aiClient: GoogleGenAI | null
  ): Promise<ParseResult> {
    const mimeType = fileType === 'png' ? 'image/png' : 'image/jpeg';
    const ocrResult = await OCRService.processImage(buffer, mimeType, 1, aiClient);

    const pages: PageRecord[] = [{
      page_id: `page-${documentId}-1`,
      document_id: documentId,
      user_id: userId,
      page_number: 1,
      text: ocrResult.text,
      detected_sections: this.detectSections(ocrResult.text),
      has_tables: this.detectTableStructure(ocrResult.text),
      extraction_method: 'OCR',
      ocr_confidence: ocrResult.confidence
    }];

    const metadata = this.extractHeaderMetadata(ocrResult.text, filename);

    return {
      pages,
      pageCount: 1,
      detectedTitle: metadata.title,
      detectedFacility: metadata.facility,
      detectedDate: metadata.date,
      detectedPhysician: metadata.physician,
      ocrConfidence: ocrResult.confidence,
      extractionMethod: 'OCR'
    };
  }

  /**
   * Detects known medical sections from text
   */
  private static detectSections(text: string): string[] {
    const matched: string[] = [];
    const lower = text.toLowerCase();
    for (const sec of COMMON_SECTIONS) {
      if (lower.includes(sec.toLowerCase())) {
        matched.push(sec);
      }
    }
    return matched.length > 0 ? matched : ['General Medical Observations'];
  }

  /**
   * Detects tabular patterns (col separators, tabs, or multiple spaces between words & numbers)
   */
  private static detectTableStructure(text: string): boolean {
    const lines = text.split('\n');
    let tableLikeLines = 0;
    for (const line of lines) {
      if (line.includes('|') || line.includes('\t') || /\b[A-Za-z\s-]+\s{3,}\d+(\.\d+)?\s{2,}[A-Za-z/%]+/.test(line)) {
        tableLikeLines++;
      }
    }
    return tableLikeLines >= 2;
  }

  /**
   * Extracts metadata such as title, facility, date, physician
   */
  private static extractHeaderMetadata(text: string, defaultFilename: string): {
    title: string;
    facility?: string;
    date?: string;
    physician?: string;
  } {
    let title = defaultFilename.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
    let facility: string | undefined;
    let date: string | undefined;
    let physician: string | undefined;

    // Detect Facility
    const facilityMatch = text.match(/(?:Hospital|Laboratory|Diagnostics|Clinic|Health Center|Medical Labs?|Diagnostic Centre):?\s*([A-Za-z0-9\s,&.-]{4,40})/i);
    if (facilityMatch) {
      facility = facilityMatch[1].trim();
    }

    // Detect Date (DD-MMM-YYYY, YYYY-MM-DD, DD/MM/YYYY)
    const dateMatch = text.match(/\b(\d{1,2}[-/](?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*[-/]\d{2,4}|\d{4}[-/]\d{1,2}[-/]\d{1,2}|\d{1,2}[-/]\d{1,2}[-/]\d{2,4})\b/i);
    if (dateMatch) {
      date = dateMatch[1];
    } else {
      date = new Date().toISOString().split('T')[0];
    }

    // Detect Doctor / Physician
    const docMatch = text.match(/(?:Dr\.|Doctor|Physician|Consultant):?\s*([A-Za-z\s,.-]{4,30})/i);
    if (docMatch) {
      physician = `Dr. ${docMatch[1].replace(/Dr\.?\s*/i, '').trim()}`;
    }

    // Title refinement
    if (/lipid|cholesterol/i.test(text)) title = 'Lipid Profile Panel';
    else if (/metabolic|glucose|creatinine|cmp|bmp/i.test(text)) title = 'Comprehensive Metabolic Panel';
    else if (/hemogram|cbc|blood count/i.test(text)) title = 'Complete Blood Count (CBC)';
    else if (/liver|hepatic|alt|ast/i.test(text)) title = 'Liver Function Test (LFT)';
    else if (/thyroid|tsh|t3|t4/i.test(text)) title = 'Thyroid Function Profile';
    else if (/x-ray|radiology|chest/i.test(text)) title = 'Diagnostic Radiology Report';

    return { title, facility, date, physician };
  }
}
