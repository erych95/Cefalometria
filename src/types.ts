/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Patient {
  id: string;
  name: string;
  birthDate: string;
  gender: 'M' | 'F';
  dni: string;
  phone: string;
  email: string;
  notes: string;
}

export type StudyCategory = 'intraoral' | 'extraoral' | 'cefalometrico' | 'fotografia' | 'tomografia';

export interface DentalStudy {
  id: string;
  patientId: string;
  patientName?: string;
  category: StudyCategory;
  subtype: string;
  title?: string;
  date: string;
  notes: string;
  imageUrl: string;
  editedImageUrl?: string;
  annotations?: Annotation[];
  brightness?: number; // default 100
  contrast?: number;   // default 100
  invert?: boolean;    // default false
  rotation?: number;   // default 0 (0, 90, 180, 270)
  cephalometricPoints?: Record<string, { x: number; y: number }>;
}

export interface Annotation {
  id: string;
  type: 'pencil' | 'line' | 'text' | 'marker';
  color: string;
  points?: { x: number; y: number }[]; // For pencil
  x1?: number; // For line
  y1?: number;
  x2?: number;
  y2?: number;
  text?: string; // For text annotation
  x?: number; // For text/marker location
  y?: number;
  lengthMm?: number; // For distance line
}

export interface CephalometricModel {
  name: string;
  description: string;
  points: string[];
  measurements: {
    name: string;
    description: string;
    norm: string;
    formula: (points: Record<string, { x: number; y: number }>) => { value: number; interpretation: string };
  }[];
}

export interface CbctConfig {
  fov: string;
  title: string;
  description: string;
  useCases: string[];
  dimensions: string;
}
