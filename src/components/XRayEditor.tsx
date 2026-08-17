/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import Markdown from 'react-markdown';
import { DentalStudy, Annotation } from '../types';
import ImageCalibrator from './ImageCalibrator';
import GuideOverlay from './GuideOverlay';
import ResultadoComparativo from './ResultadoComparativo';
import { 
  Sun, 
  Contrast, 
  RefreshCw, 
  RotateCw, 
  Layers, 
  PenTool, 
  Maximize2, 
  Type, 
  Trash2, 
  RotateCcw, 
  Check, 
  Info,
  Sliders,
  Scale,
  Target,
  Upload,
  Compass,
  Camera,
  Grid,
  Zap,
  Hand,
  Undo,
  Redo,
  Sparkles,
  FileImage,
  Award,
  Download,
  Bot,
  Loader2,
  Printer,
  FileText,
  ZoomIn,
  ZoomOut,
  Eye,
  Activity,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Minimize2,
  GripVertical,
  Lock,
  Unlock,
  Folder,
  Plus,
  PanelRightClose,
  PanelRightOpen,
  ArrowRight,
  User,
  MapPin,
  Table,
  CreditCard,
  LayoutGrid,
  BarChart2,
  Stethoscope,
  Search,
  X
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface XRayEditorProps {
  study: DentalStudy;
  patientName?: string;
  onSave: (studyId: string, updates: Partial<DentalStudy>) => void;
  isDarkMode?: boolean;
}

// Default landmarks for Cephalometrics (Complete Steiner Landmark Set)
const DEFAULT_LANDMARKS: Record<string, { x: number; y: number; label: string }> = {
  S: { x: 280, y: 150, label: 'Silla (S)' },
  N: { x: 440, y: 120, label: 'Nasion (N)' },
  A: { x: 430, y: 240, label: 'Punto A (A)' },
  B: { x: 405, y: 310, label: 'Punto B (B)' },
  D: { x: 395, y: 360, label: 'Punto D (D)' },
  Po: { x: 190, y: 190, label: 'Porion (Po)' },
  Or: { x: 390, y: 180, label: 'Orbitale (Or)' },
  Go: { x: 210, y: 340, label: 'Gonion (Go)' },
  Me: { x: 380, y: 400, label: 'Menton (Me)' },
  Gn: { x: 395, y: 390, label: 'Gnathion (Gn)' },
  Pog: { x: 408, y: 370, label: 'Pogonion Óseo (Pog)' },
  ANS: { x: 420, y: 230, label: 'Espina Nasal Ant (ANS)' },
  PNS: { x: 310, y: 235, label: 'Espina Nasal Post (PNS)' },
  L: { x: 408, y: 126, label: 'Punto L (L)' },
  E: { x: 210, y: 163, label: 'Punto E (E)' },
  U1t: { x: 435, y: 270, label: '1 Sup Borde (U1t)' },
  U1r: { x: 410, y: 220, label: '1 Sup Ápice (U1r)' },
  L1t: { x: 420, y: 280, label: '1 Inf Borde (L1t)' },
  L1r: { x: 395, y: 335, label: '1 Inf Ápice (L1r)' },
  OcA: { x: 425, y: 285, label: 'Plano Oclusal Ant (OcA)' },
  OcP: { x: 270, y: 300, label: 'Plano Oclusal Post (OcP)' },
  Ns: { x: 450, y: 110, label: 'Nariz Blanda S (Ns)' },
  Ls: { x: 460, y: 275, label: 'Labio Sup (Ls)' },
  Li: { x: 450, y: 300, label: 'Labio Inf (Li)' },
  Pogs: { x: 420, y: 375, label: 'Pogonion Blando (Pogs)' }
};

// Anatomical guide definitions for NemoStudio interactive landmark placement guide
const LANDMARK_DESCRIPTIONS: Record<string, { name: string; anatomicalGuide: string; tip: string }> = {
  S: { name: 'Silla Turca (S)', anatomicalGuide: 'Centro geométrico de la cavidad de la silla turca en el hueso esfenoides.', tip: 'Localice la fosa hipofisaria en la base del cráneo y ubique el punto central exacto.' },
  N: { name: 'Nasion (N)', anatomicalGuide: 'Punto más anterior de la sutura frontonasal en el plano sagital medio.', tip: 'Punto de unión sutural entre el hueso frontal y los huesos propios de la nariz.' },
  A: { name: 'Punto A / Subspinale (A)', anatomicalGuide: 'Punto más profundo en la concavidad del perfil anterior del maxilar superior.', tip: 'Ubicado en el seno alveolar entre la espina nasal anterior (ENA) y el incisivo superior.' },
  B: { name: 'Punto B / Supramentale (B)', anatomicalGuide: 'Punto más profundo en el perfil anterior del contorno alveolar mandibular.', tip: 'Ubicado entre el borde alveolar mandibular y la eminencia mentoniana.' },
  D: { name: 'Punto D (D)', anatomicalGuide: 'Centro de la sínfisis mentoniana mandibular.', tip: 'Ubicado geométricamente en el centro del contorno cortical de la sínfisis.' },
  Po: { name: 'Porion (Po)', anatomicalGuide: 'Punto más superior del conducto auditivo externo óseo (o del cefalostato).', tip: 'En el margen superior del orificio del meato acústico externo.' },
  Or: { name: 'Orbitale (Or)', anatomicalGuide: 'Punto más inferior en el borde infraorbitario.', tip: 'En el margen inferior de la cavidad orbitaria ósea.' },
  Go: { name: 'Gonion (Go)', anatomicalGuide: 'Punto más posteroinferior en el ángulo del gonión mandibular.', tip: 'Intersección de la bisectriz del ángulo formado por las tangentes al cuerpo y rama.' },
  Me: { name: 'Menton (Me)', anatomicalGuide: 'Punto más inferior del contorno cortical de la sínfisis mentoniana.', tip: 'El punto más declive del borde inferior del mentón.' },
  Gn: { name: 'Gnathion (Gn)', anatomicalGuide: 'Punto más anteroinferior en el contorno del mentón.', tip: 'Punto medio entre Pogonion y Menton en la curvatura de la sínfisis.' },
  Pog: { name: 'Pogonion Óseo (Pog)', anatomicalGuide: 'Punto más anterior de la sínfisis mentoniana en el plano sagital.', tip: 'El punto más prominente hacia adelante en la barbilla ósea.' },
  ANS: { name: 'Espina Nasal Anterior (ANS)', anatomicalGuide: 'Extremo anterior del proceso palatino del maxilar.', tip: 'Vértice más anterior del plano palatino.' },
  PNS: { name: 'Espina Nasal Posterior (PNS)', anatomicalGuide: 'Extremo posterior del hueso palatino.', tip: 'Punto más posterior de la espina nasal posterior.' },
  L: { name: 'Punto L (L)', anatomicalGuide: 'Proyección perpendicular de Pogonion sobre la línea S-N.', tip: 'Sirve para medir la distancia SL en Steiner.' },
  E: { name: 'Punto E (E)', anatomicalGuide: 'Proyección perpendicular del cóndilo mandibular sobre la línea S-N.', tip: 'Sirve para medir la distancia SE en Steiner.' },
  U1t: { name: '1 Sup Borde Incisal (U1t)', anatomicalGuide: 'Borde incisal del incisivo central superior más prominente.', tip: 'En el extremo distal/incisal de la corona del incisivo superior.' },
  U1r: { name: '1 Sup Ápice Radicular (U1r)', anatomicalGuide: 'Ápice radicular del incisivo central superior.', tip: 'En la punta del ápice radicular en el hueso alveolar maxilar.' },
  L1t: { name: '1 Inf Borde Incisal (L1t)', anatomicalGuide: 'Borde incisal del incisivo central inferior más prominente.', tip: 'En la punta incisal de la corona del incisivo inferior.' },
  L1r: { name: '1 Inf Ápice Radicular (L1r)', anatomicalGuide: 'Ápice radicular del incisivo central inferior.', tip: 'En la punta de la raíz del incisivo central inferior.' },
  OcA: { name: 'Plano Oclusal Anterior (OcA)', anatomicalGuide: 'Punto medio del entrecruzamiento oclusal anterior.', tip: 'En el plano de contacto entre premolares/molares anteriores.' },
  OcP: { name: 'Plano Oclusal Posterior (OcP)', anatomicalGuide: 'Punto de oclusión cuspídea en los primeros molares permanentes.', tip: 'En la intercuspidación molar posterior.' },
  Ns: { name: 'Nasal Blando (Ns)', anatomicalGuide: 'Punto más prominente de la punta de la nariz en tejidos blandos.', tip: 'En el perfil blando de la punta nasal.' },
  Ls: { name: 'Labio Superior (Ls)', anatomicalGuide: 'Punto más anterior del labio superior en tejidos blandos.', tip: 'En el bermellón del labio superior.' },
  Li: { name: 'Labio Inferior (Li)', anatomicalGuide: 'Punto más anterior del labio inferior en tejidos blandos.', tip: 'En el bermellón del labio inferior.' },
  Pogs: { name: 'Pogonion Blando (Pogs)', anatomicalGuide: 'Punto más prominente del mentón en tejidos blandos.', tip: 'Punto más anterior del perfil blando del mentón.' }
};

const CEPHALOMETRIC_GUIDES: Record<string, { code: string; name: string; category: string; anatomicalGuide: string; tip: string }> = {
  S: { code: 'S', name: LANDMARK_DESCRIPTIONS.S.name, category: 'Base de Cráneo', anatomicalGuide: LANDMARK_DESCRIPTIONS.S.anatomicalGuide, tip: LANDMARK_DESCRIPTIONS.S.tip },
  N: { code: 'N', name: LANDMARK_DESCRIPTIONS.N.name, category: 'Base de Cráneo', anatomicalGuide: LANDMARK_DESCRIPTIONS.N.anatomicalGuide, tip: LANDMARK_DESCRIPTIONS.N.tip },
  A: { code: 'A', name: LANDMARK_DESCRIPTIONS.A.name, category: 'Esquelético Maxilar', anatomicalGuide: LANDMARK_DESCRIPTIONS.A.anatomicalGuide, tip: LANDMARK_DESCRIPTIONS.A.tip },
  B: { code: 'B', name: LANDMARK_DESCRIPTIONS.B.name, category: 'Esquelético Mandibular', anatomicalGuide: LANDMARK_DESCRIPTIONS.B.anatomicalGuide, tip: LANDMARK_DESCRIPTIONS.B.tip },
  D: { code: 'D', name: LANDMARK_DESCRIPTIONS.D.name, category: 'Esquelético Mandibular', anatomicalGuide: LANDMARK_DESCRIPTIONS.D.anatomicalGuide, tip: LANDMARK_DESCRIPTIONS.D.tip },
  Po: { code: 'Po', name: LANDMARK_DESCRIPTIONS.Po.name, category: 'Base de Cráneo', anatomicalGuide: LANDMARK_DESCRIPTIONS.Po.anatomicalGuide, tip: LANDMARK_DESCRIPTIONS.Po.tip },
  Or: { code: 'Or', name: LANDMARK_DESCRIPTIONS.Or.name, category: 'Base de Cráneo', anatomicalGuide: LANDMARK_DESCRIPTIONS.Or.anatomicalGuide, tip: LANDMARK_DESCRIPTIONS.Or.tip },
  Go: { code: 'Go', name: LANDMARK_DESCRIPTIONS.Go.name, category: 'Esquelético Mandibular', anatomicalGuide: LANDMARK_DESCRIPTIONS.Go.anatomicalGuide, tip: LANDMARK_DESCRIPTIONS.Go.tip },
  Me: { code: 'Me', name: LANDMARK_DESCRIPTIONS.Me.name, category: 'Esquelético Mandibular', anatomicalGuide: LANDMARK_DESCRIPTIONS.Me.anatomicalGuide, tip: LANDMARK_DESCRIPTIONS.Me.tip },
  Gn: { code: 'Gn', name: LANDMARK_DESCRIPTIONS.Gn.name, category: 'Esquelético Mandibular', anatomicalGuide: LANDMARK_DESCRIPTIONS.Gn.anatomicalGuide, tip: LANDMARK_DESCRIPTIONS.Gn.tip },
  Pog: { code: 'Pog', name: LANDMARK_DESCRIPTIONS.Pog.name, category: 'Esquelético Mandibular', anatomicalGuide: LANDMARK_DESCRIPTIONS.Pog.anatomicalGuide, tip: LANDMARK_DESCRIPTIONS.Pog.tip },
  ANS: { code: 'ANS', name: LANDMARK_DESCRIPTIONS.ANS.name, category: 'Esquelético Maxilar', anatomicalGuide: LANDMARK_DESCRIPTIONS.ANS.anatomicalGuide, tip: LANDMARK_DESCRIPTIONS.ANS.tip },
  PNS: { code: 'PNS', name: LANDMARK_DESCRIPTIONS.PNS.name, category: 'Esquelético Maxilar', anatomicalGuide: LANDMARK_DESCRIPTIONS.PNS.anatomicalGuide, tip: LANDMARK_DESCRIPTIONS.PNS.tip },
  L: { code: 'L', name: LANDMARK_DESCRIPTIONS.L.name, category: 'Esquelético Mandibular', anatomicalGuide: LANDMARK_DESCRIPTIONS.L.anatomicalGuide, tip: LANDMARK_DESCRIPTIONS.L.tip },
  E: { code: 'E', name: LANDMARK_DESCRIPTIONS.E.name, category: 'Esquelético Mandibular', anatomicalGuide: LANDMARK_DESCRIPTIONS.E.anatomicalGuide, tip: LANDMARK_DESCRIPTIONS.E.tip },
  U1t: { code: 'U1t', name: LANDMARK_DESCRIPTIONS.U1t.name, category: 'Dentoalveolar', anatomicalGuide: LANDMARK_DESCRIPTIONS.U1t.anatomicalGuide, tip: LANDMARK_DESCRIPTIONS.U1t.tip },
  U1r: { code: 'U1r', name: LANDMARK_DESCRIPTIONS.U1r.name, category: 'Dentoalveolar', anatomicalGuide: LANDMARK_DESCRIPTIONS.U1r.anatomicalGuide, tip: LANDMARK_DESCRIPTIONS.U1r.tip },
  L1t: { code: 'L1t', name: LANDMARK_DESCRIPTIONS.L1t.name, category: 'Dentoalveolar', anatomicalGuide: LANDMARK_DESCRIPTIONS.L1t.anatomicalGuide, tip: LANDMARK_DESCRIPTIONS.L1t.tip },
  L1r: { code: 'L1r', name: LANDMARK_DESCRIPTIONS.L1r.name, category: 'Dentoalveolar', anatomicalGuide: LANDMARK_DESCRIPTIONS.L1r.anatomicalGuide, tip: LANDMARK_DESCRIPTIONS.L1r.tip },
  OcA: { code: 'OcA', name: LANDMARK_DESCRIPTIONS.OcA.name, category: 'Dentoalveolar', anatomicalGuide: LANDMARK_DESCRIPTIONS.OcA.anatomicalGuide, tip: LANDMARK_DESCRIPTIONS.OcA.tip },
  OcP: { code: 'OcP', name: LANDMARK_DESCRIPTIONS.OcP.name, category: 'Dentoalveolar', anatomicalGuide: LANDMARK_DESCRIPTIONS.OcP.anatomicalGuide, tip: LANDMARK_DESCRIPTIONS.OcP.tip },
  Ns: { code: 'Ns', name: LANDMARK_DESCRIPTIONS.Ns.name, category: 'Tejidos Blandos', anatomicalGuide: LANDMARK_DESCRIPTIONS.Ns.anatomicalGuide, tip: LANDMARK_DESCRIPTIONS.Ns.tip },
  Ls: { code: 'Ls', name: LANDMARK_DESCRIPTIONS.Ls.name, category: 'Tejidos Blandos', anatomicalGuide: LANDMARK_DESCRIPTIONS.Ls.anatomicalGuide, tip: LANDMARK_DESCRIPTIONS.Ls.tip },
  Li: { code: 'Li', name: LANDMARK_DESCRIPTIONS.Li.name, category: 'Tejidos Blandos', anatomicalGuide: LANDMARK_DESCRIPTIONS.Li.anatomicalGuide, tip: LANDMARK_DESCRIPTIONS.Li.tip },
  Pogs: { code: 'Pogs', name: LANDMARK_DESCRIPTIONS.Pogs.name, category: 'Tejidos Blandos', anatomicalGuide: LANDMARK_DESCRIPTIONS.Pogs.anatomicalGuide, tip: LANDMARK_DESCRIPTIONS.Pogs.tip }
};

// Calculate age in years and months dynamically
const calculateAgeYearsMonths = (birthDateStr: string, analysisDateStr: string) => {
  if (!birthDateStr || !analysisDateStr) return { years: 0, months: 0, formatted: 'N/D' };
  const birth = new Date(birthDateStr);
  const analysis = new Date(analysisDateStr);
  if (isNaN(birth.getTime()) || isNaN(analysis.getTime())) return { years: 0, months: 0, formatted: 'N/D' };

  let years = analysis.getFullYear() - birth.getFullYear();
  let months = analysis.getMonth() - birth.getMonth();

  if (analysis.getDate() < birth.getDate()) {
    months--;
  }

  if (months < 0) {
    years--;
    months += 12;
  }

  const validYears = Math.max(0, years);
  const validMonths = Math.max(0, months);

  return {
    years: validYears,
    months: validMonths,
    formatted: `${validYears} años, ${validMonths} meses`
  };
};

const getMergedLandmarks = (savedPts?: Record<string, { x: number; y: number }>) => {
  const merged: Record<string, { x: number; y: number }> = {};
  Object.keys(DEFAULT_LANDMARKS).forEach((key) => {
    merged[key] = savedPts?.[key] ? { ...savedPts[key] } : { x: DEFAULT_LANDMARKS[key].x, y: DEFAULT_LANDMARKS[key].y };
  });
  return merged;
};

export default function XRayEditor({ study, patientName, onSave, isDarkMode = true }: XRayEditorProps) {
  const resolvedPatientName = patientName || study.patientName || 'Andrade Luna, Rubén';
  const resolvedStudyTitle = study.title || study.subtype;
  // Image properties
  const [brightness, setBrightness] = useState<number>(study.brightness ?? 100);
  const [contrast, setContrast] = useState<number>(study.contrast ?? 100);
  const [invert, setInvert] = useState<boolean>(study.invert ?? false);
  const [rotation, setRotation] = useState<number>(study.rotation ?? 0);
  const [annotations, setAnnotations] = useState<Annotation[]>(study.annotations ?? []);

  // Zoom & Pan station state
  const [zoomScale, setZoomScale] = useState<number>(1.0);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('Todos');
  const [expandedMeasCode, setExpandedMeasCode] = useState<string | null>(null);
  const [cephDisplayMode, setCephDisplayMode] = useState<'table' | 'cards' | 'chart'>('table');
  
  // Custom image URL (supports uploaded files)
  const [currentImageUrl, setCurrentImageUrl] = useState<string>(study.imageUrl);

  // Workspace sub-tab layers
  // 'filters' | 'measurements' | 'cephalometric' | 'smile' | 'upload' | 'report' | 'layers'
  const [activeAnalysisTab, setActiveAnalysisTab] = useState<'filters' | 'measurements' | 'cephalometric' | 'smile' | 'upload' | 'report' | 'layers'>('filters');

  // Layering State Engine
  const [radiographyLayer, setRadiographyLayer] = useState({
    visible: true,
    opacity: 1.0,
    x: 0,
    y: 0,
    rotation: 0,
    scale: 1.0,
    locked: true
  });

  const [photoLayer, setPhotoLayer] = useState({
    visible: true,
    opacity: 0.5,
    x: 0,
    y: 0,
    rotation: 0,
    scale: 1.0,
    imageUrl: '',
    locked: false
  });

  const [tracingsLayer, setTracingsLayer] = useState({
    visible: true,
    opacity: 1.0,
    x: 0,
    y: 0,
    rotation: 0,
    scale: 1.0,
    locked: false
  });

  const [layerOrder, setLayerOrder] = useState<string[]>(['tracings', 'photo', 'radiography']);
  const [draggedLayerIndex, setDraggedLayerIndex] = useState<number | null>(null);
  const [draggedOverLayerIndex, setDraggedOverLayerIndex] = useState<number | null>(null);

  const [activeLayerToManipulate, setActiveLayerToManipulate] = useState<'radiography' | 'photo' | 'tracings'>('tracings');
  const [isManipulatingLayer, setIsManipulatingLayer] = useState<'radiography' | 'photo' | 'tracings' | null>(null);
  const [layerDragStart, setLayerDragStart] = useState({ x: 0, y: 0, layerX: 0, layerY: 0 });

  // Undo/Redo History Stack
  const [historyStack, setHistoryStack] = useState<any[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [contrastPresetIndex, setContrastPresetIndex] = useState<number>(0);

  // Report & Signature State
  const [reportNotes, setReportNotes] = useState<string>(`# INFORME DIAGNÓSTICO CEFALOMÉTRICO Y CLÍNICO

**Paciente:** ${resolvedPatientName}  
**Estudio:** Análisis Cefalométrico de Steiner  
**Especialidad:** Ortodoncia y Radiología Maxilofacial  

---

### 1. Tipo de Crecimiento Facial (Patrón Vertical)
* **Plano Mandibular (SN-GoMe):** **30°** *(Valor de referencia: 32°)*.
* **Interpretación:** El ángulo del plano mandibular respecto a la base del cráneo anterior se encuentra dentro del rango de normalidad, con una ligera tendencia a la hipodivergencia.
* **Biotipo Facial:** **Mesofacial (Normodivergente)**. El paciente presenta un patrón de crecimiento armónico en el plano vertical, sin signos de hiperdivergencia (dolicofacial) ni hipertonicidad extrema (braquifacial).

---

### 2. Análisis Esquelético y Maxilomandibular (Patrón Sagital)
* **Ángulo SNA:** **75°** *(Norma: 82° ± 2°)*. Indica una **retrusión maxilar esquelética severa** (hipoplasia o retromaxilismo respecto a la base del cráneo).
* **Ángulo SNB:** **69°** *(Norma: 80° ± 2°)*. Muestra un **retrognatismo mandibular severo** (posiciones marcadamente posteriores de la mandíbula respecto a la base del cráneo).
* **Diferencia ANB:** **6°** *(Norma: 2° a 4°)*. Confirma una **Relación Esquelética Clase II**.
* **Síntesis Maxilomandibular:** El paciente presenta un patrón de **Clase II esquelética por bi-retrusión**, donde la discrepancia sagital intermaxilar está determinada fundamentalmente por un severo colapso/retrognatismo mandibular que sobrepasa el grado de retrusión maxilar existente.

---

### 3. Análisis Dentoalveolar y Estética Facial
* **Posición Incisiva y Plano Oclusal (1-NA, 1-NB, IMPA):** *Mediciones lineales/angulares específicas no adjuntas en la serie cefalométrica primaria. Se sugiere completar el trazado.*
* **Evaluación Estética y Sonrisa:**
  * **Línea Media Dental:** La línea media dental superior es **coincidente (0 mm)** con la línea media facial.
  * **Arco de la Sonrisa:** Presenta alteración en la curvatura de la sonrisa (ausencia de arco consonante o plano aplanado).
  * **Asimetría Facial/Clínica:** Se registra una **asimetría leve** a la evaluación clínica.

---

### 4. Diagnóstico Clínico Integral
1. **Patrón Esquelético:** Maloclusión Esquelética Clase II por bi-retrusión maxilomandibular, con mayor compromiso en el retrognatismo mandibular.
2. **Patrón Vertical:** Biotipo Mesofacial (Normodivergente).
3. **Estética/Tejidos Blandos:** Asimetría leve detectada clínicamente, línea media centrada con la cara y alteración del arco consonante de la sonrisa.

---

### 5. Sugerencias y Plan de Tratamiento Preliminar

#### A. En Pacientes en Crecimiento (Tratamiento Interceptivo / Ortopedia Funcional)
* **Ortopedia Funcional de los Maxilares:** Indicado el uso de aparatos de avance mandibular (ej. Twin Block, Herbst o Bionator) para estimular/reorientar el crecimiento mandibular y corregir la Clase II esquelética.
* **Control del Maxilar:** Monitoreo y eventual expansión/protrusión maxilar controlada para desbloquear la arcada y permitir el avance mandibular adecuado.

#### B. En Pacientes Adultos o Sin Crecimiento (Tratamiento Correctivo)
* **Evaluación Quirúrgica vs. Compensación Ortodóntica:** Dada la severidad del retrognatismo mandibular, se debe valorar la necesidad de **Cirugía Ortognática** (avance mandibular o descompresión bimaxilar) previa preparación ortodóntica.
* **Objetivos Ortodónticos:**
  * Rediseño y reconstrucción de la curva de la sonrisa para lograr consonancia con el labio inferior.
  * Corrección de la asimetría leve mediante mecánica de arcos o elásticos intermaxilares.

#### C. Exámenes Complementarios Recomendados
1. Trazado dentoalveolar completo de Steiner ($1\\text{--NA}$, $1\\text{--NB}$, $IMPA$).
2. Tomografía Computarizada de Haz Cónico (CBCT) si la asimetría clínica sugiere compromiso condilar o articular (ATM).`);
  const [professionalName, setProfessionalName] = useState<string>('Dr. Andrés Silva');
  const [professionalCmp, setProfessionalCmp] = useState<string>('CMP: 45902');
  const [signaturePaths, setSignaturePaths] = useState<{ x: number; y: number }[][]>([]);
  const [currentSignaturePath, setCurrentSignaturePath] = useState<{ x: number; y: number }[]>([]);
  const [isSigning, setIsSigning] = useState<boolean>(false);
  const signatureCanvasRef = useRef<SVGSVGElement>(null);

  // AI Diagnostic & Export State
  const [isAnalyzingAI, setIsAnalyzingAI] = useState<boolean>(false);
  const [aiDiagnosisResult, setAiDiagnosisResult] = useState<string | null>(null);
  const [showAIModal, setShowAIModal] = useState<boolean>(false);
  const [isExportingPDF, setIsExportingPDF] = useState<boolean>(false);
  const [isExportingImage, setIsExportingImage] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showExportMenu, setShowExportMenu] = useState<boolean>(false);
  const [reportViewMode, setReportViewMode] = useState<'preview' | 'edit'>('preview');
  const reportPdfRef = useRef<HTMLDivElement>(null);
  const editorViewportRef = useRef<HTMLDivElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  // Drawing Tools State
  const [activeTool, setActiveTool] = useState<'select' | 'pan' | 'pencil' | 'line' | 'text' | 'join_points' | 'range'>('select');
  const [activeColor, setActiveColor] = useState<string>('#00f0ff'); // Cyan default
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [currentLine, setCurrentLine] = useState<{ x1: number; y1: number; x2: number; y2: number } | null>(null);
  const [currentPencilPoints, setCurrentPencilPoints] = useState<{ x: number; y: number }[]>([]);
  const [editorMessage, setEditorMessage] = useState<string | null>(null);
  const [hoverCoords, setHoverCoords] = useState<{ x: number; y: number } | null>(null);

  // Advanced Ruler Selection, Point Joining, & Range Calibration States
  const [selectedAnnotationId, setSelectedAnnotationId] = useState<string | null>(null);
  const [draggingHandle, setDraggingHandle] = useState<'endpoint1' | 'endpoint2' | 'body' | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [pixelsPerMm, setPixelsPerMm] = useState<number>(10.0); // Default scale: 10px = 1mm
  const [snapTarget, setSnapTarget] = useState<{ x: number; y: number; label: string } | null>(null);

  // 'join_points' tool states
  const [joinPoint1, setJoinPoint1] = useState<string>('S');
  const [joinPoint2, setJoinPoint2] = useState<string>('N');
  const [joinSelectedPoints, setJoinSelectedPoints] = useState<{ x: number; y: number; label: string }[]>([]);

  // 'range' tool states
  const [rangeStart, setRangeStart] = useState<{ x: number; y: number } | null>(null);
  const [currentRangeBox, setCurrentRangeBox] = useState<{ x1: number; y1: number; x2: number; y2: number } | null>(null);
  const [selectedRangeBox, setSelectedRangeBox] = useState<{ x1: number; y1: number; x2: number; y2: number } | null>(null);

  // Scale Calibration Modal State
  const [showCalibrationModal, setShowCalibrationModal] = useState<boolean>(false);
  const [calibrationInputValue, setCalibrationInputValue] = useState<string>('10.0');
  const [measurementsVisible, setMeasurementsVisible] = useState<boolean>(true);
  const [hoveredLandmarkKey, setHoveredLandmarkKey] = useState<string | null>(null);

  // Magnetic Point Snapping Helper
  const findSnapTarget = (x: number, y: number, snapRadius = 18) => {
    // Check cephalometric landmarks
    for (const [key, pt] of Object.entries(landmarks)) {
      const dx = pt.x - x;
      const dy = pt.y - y;
      if (Math.hypot(dx, dy) <= snapRadius) {
        return { x: pt.x, y: pt.y, label: `Punto ${key}` };
      }
    }
    // Check existing annotation endpoints
    for (const ann of annotations) {
      if (ann.type === 'line' && ann.x1 !== undefined && ann.y1 !== undefined) {
        const dx1 = ann.x1 - x;
        const dy1 = ann.y1 - y;
        if (Math.hypot(dx1, dy1) <= snapRadius) {
          return { x: ann.x1, y: ann.y1, label: `Extremo Regla` };
        }
        if (ann.x2 !== undefined && ann.y2 !== undefined) {
          const dx2 = ann.x2 - x;
          const dy2 = ann.y2 - y;
          if (Math.hypot(dx2, dy2) <= snapRadius) {
            return { x: ann.x2, y: ann.y2, label: `Extremo Regla` };
          }
        }
      }
    }
    return null;
  };

  // Delete selected ruler/annotation
  const handleDeleteSelectedAnnotation = () => {
    if (!selectedAnnotationId) return;
    const nextAnns = annotations.filter((a) => a.id !== selectedAnnotationId);
    setAnnotations(nextAnns);
    setSelectedAnnotationId(null);
    saveToHistory(nextAnns, undefined, undefined, undefined);
    setEditorMessage('Regla / Medición eliminada correctamente.');
  };

  // Join 2 points directly
  const handleJoinPoints = (p1Key?: string, p2Key?: string) => {
    const k1 = p1Key || joinPoint1;
    const k2 = p2Key || joinPoint2;
    const pt1 = landmarks[k1];
    const pt2 = landmarks[k2];

    if (!pt1 || !pt2) {
      setEditorMessage('Atención: Seleccione dos puntos válidos para unir.');
      return;
    }

    const dx = pt2.x - pt1.x;
    const dy = pt2.y - pt1.y;
    const pixelDist = Math.hypot(dx, dy);
    const mmDist = Math.round((pixelDist / pixelsPerMm) * 10) / 10;

    const newAnn: Annotation = {
      id: `ann-join-${Date.now()}`,
      type: 'line',
      color: activeColor,
      x1: pt1.x,
      y1: pt1.y,
      x2: pt2.x,
      y2: pt2.y,
      lengthMm: mmDist,
      text: `${k1}-${k2}`
    };

    const nextAnns = [...annotations, newAnn];
    setAnnotations(nextAnns);
    setSelectedAnnotationId(newAnn.id);
    saveToHistory(nextAnns, undefined, undefined, undefined);
    setEditorMessage(`✅ Puntos ${k1} y ${k2} unidos. Distancia: ${mmDist} mm`);
  };

  // Calibrate Scale (Pixels per mm)
  const handleApplyScaleCalibration = (realMmValue?: number | React.MouseEvent) => {
    let targetMm = typeof realMmValue === 'number' ? realMmValue : undefined;
    if (!targetMm) {
      const parsedVal = parseFloat(calibrationInputValue);
      if (!isNaN(parsedVal) && parsedVal > 0) {
        targetMm = parsedVal;
      } else {
        const input = prompt('Ingrese la medida real conocida en milímetros (mm):', '10');
        if (!input) return;
        targetMm = parseFloat(input);
      }
    }
    if (!targetMm || isNaN(targetMm) || targetMm <= 0) return;

    let pxDistance = 0;
    if (selectedAnnotationId) {
      const ann = annotations.find((a) => a.id === selectedAnnotationId);
      if (ann && ann.type === 'line' && ann.x1 !== undefined && ann.x2 !== undefined) {
        const dx = ann.x2 - ann.x1;
        const dy = (ann.y2 ?? 0) - (ann.y1 ?? 0);
        pxDistance = Math.hypot(dx, dy);
      }
    } else if (selectedRangeBox) {
      const dx = selectedRangeBox.x2 - selectedRangeBox.x1;
      const dy = selectedRangeBox.y2 - selectedRangeBox.y1;
      pxDistance = Math.hypot(dx, dy);
    }

    if (pxDistance <= 0) {
      setEditorMessage('Atención: Seleccione una regla o trace un rango previo para la calibración.');
      return;
    }

    const newPxPerMm = pxDistance / targetMm;
    setPixelsPerMm(newPxPerMm);

    // Recalculate lengthMm for all line annotations
    const updatedAnns = annotations.map((ann) => {
      if (ann.type === 'line' && ann.x1 !== undefined && ann.x2 !== undefined) {
        const dx = ann.x2 - ann.x1;
        const dy = (ann.y2 ?? 0) - (ann.y1 ?? 0);
        const pxD = Math.hypot(dx, dy);
        return {
          ...ann,
          lengthMm: Math.round((pxD / newPxPerMm) * 10) / 10
        };
      }
      return ann;
    });

    setAnnotations(updatedAnns);
    saveToHistory(updatedAnns, undefined, undefined, undefined);
    setShowCalibrationModal(false);
    setIsCalibrated(true);
    setEditorMessage(`📐 ¡Imagen Calibrada con Éxito! Escala: 1 mm = ${Math.round(newPxPerMm * 10) / 10} px. Ahora puede continuar con el paso 2.`);
  };

  // Automatically place calibration ruler on the forehead support of the lateral x-ray
  const handleAlignForeheadRuler = () => {
    const rulerId = 'ann-forehead-ruler';
    const rulerAnn: Annotation = {
      id: rulerId,
      type: 'line',
      color: '#eab308', // Gold/Yellow
      x1: 412,
      y1: 15,
      x2: 412,
      y2: 115, // 100 pixels = 10mm (with 10px = 1mm default)
      lengthMm: 10.0,
      text: 'Calibración Frente'
    };

    // Filter out existing forehead-ruler to prevent duplicates
    const nextAnns = [...annotations.filter((a) => a.id !== rulerId), rulerAnn];
    setAnnotations(nextAnns);
    setSelectedAnnotationId(rulerId);
    setPixelsPerMm(10.0); // Reset to standard base line (10px = 1mm)

    saveToHistory(nextAnns, undefined, undefined, undefined);
    setEditorMessage('🎯 Regla posicionada exactamente sobre el calibrador físico de la frente (10 mm) según especificaciones clínicas.');
  };

  // Sidebar Collapse state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);

  // NemoStudio Guided Workflow States
  const [isCalibrated, setIsCalibrated] = useState<boolean>(false);
  const [nemoStep, setNemoStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Paso 2: Datos del Paciente
  const [patientGender, setPatientGender] = useState<'F' | 'M'>('F');
  const [patientBirthDate, setPatientBirthDate] = useState<string>('2011-04-12');
  const [analysisDate, setAnalysisDate] = useState<string>(new Date().toISOString().slice(0, 10));

  // Paso 3: Selección de Análisis Cefalométrico
  const [activeCephModel, setActiveCephModel] = useState<'Steiner' | 'Ricketts' | 'McNamara' | 'Tweed' | 'Downs' | 'UPCH'>('Steiner');

  // Paso 4: Trazados Pre-Tratamiento (Inicial) vs Post-Tratamiento (Final)
  const [treatmentStage, setTreatmentStage] = useState<'inicial' | 'final'>('inicial');
  const [landmarksInicial, setLandmarksInicial] = useState<Record<string, { x: number; y: number }>>(() => getMergedLandmarks(study.cephalometricPoints));
  const [landmarksFinal, setLandmarksFinal] = useState<Record<string, { x: number; y: number }>>(() => {
    const base = getMergedLandmarks(study.cephalometricPoints);
    const finalMap: Record<string, { x: number; y: number }> = {};
    Object.keys(base).forEach((k) => {
      // Simulate post-treatment orthodontic improvement or copy
      finalMap[k] = { 
        x: base[k].x + (k === 'B' || k === 'Pog' || k === 'Me' ? 6 : k === 'U1t' ? -3 : 0), 
        y: base[k].y 
      };
    });
    return finalMap;
  });

  // Floating Landmark Reference Guide Window (Mini Screen Guide)
  const [showPointGuideWindow, setShowPointGuideWindow] = useState<boolean>(true);
  const [activeGuideLandmarkKey, setActiveGuideLandmarkKey] = useState<string>('S');

  // Primary Cephalometric Sidebar View: Landmark Guide Table vs Measurements Results vs Steiner Treatment Plan
  const [cephSidebarView, setCephSidebarView] = useState<'guide_table' | 'measurements' | 'treatment_plan'>('guide_table');
  const [guideTableSearch, setGuideTableSearch] = useState<string>('');
  const [guideTableCategoryFilter, setGuideTableCategoryFilter] = useState<string>('Todos');

  // Custom Patient Inputs for Steiner Treatment Algorithm
  const [patientAgeInput, setPatientAgeInput] = useState<number>(14);
  const [growthPatternOverride, setGrowthPatternOverride] = useState<'auto' | 'hiper' | 'normo' | 'braqui'>('auto');

  // Paso 5: AI Comparativa Pre vs Post (Inicial vs Final)
  const [isComparingAI, setIsComparingAI] = useState<boolean>(false);
  const [aiComparisonReport, setAiComparisonReport] = useState<string | null>(null);
  const [showComparisonModal, setShowComparisonModal] = useState<boolean>(false);

  // Trigger AI comparative evaluation between Initial (Pre) and Final (Post) tracings
  const handleRunAIComparison = async () => {
    setIsComparingAI(true);
    setShowComparisonModal(true);
    try {
      const initMeasurements = getCephMeasurements(landmarksInicial);
      const finalMeasurements = getCephMeasurements(landmarksFinal);
      const ageInfo = calculateAgeYearsMonths(patientBirthDate, analysisDate);

      const resp = await fetch('/api/ai/cephalometric-comparison', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientData: {
            name: resolvedPatientName,
            gender: patientGender,
            birthDate: patientBirthDate,
            analysisDate: analysisDate,
            ageFormatted: ageInfo.formatted,
            initialDate: 'Pre-Tratamiento (Inicial)',
            finalDate: 'Post-Tratamiento (Final)'
          },
          analysisModel: activeCephModel,
          initialMeasurements: initMeasurements,
          finalMeasurements: finalMeasurements
        })
      });

      const data = await resp.json();
      if (data.comparisonReport) {
        setAiComparisonReport(data.comparisonReport);
        setEditorMessage('✨ Informe comparativo evolutivo generado con éxito por IA.');
      } else {
        setEditorMessage('⚠️ Error al generar comparación con IA: ' + (data.error || 'Respuesta vacía'));
      }
    } catch (err: any) {
      console.error('Comparison error:', err);
      setEditorMessage('⚠️ Error de conexión al servidor para comparación IA.');
    } finally {
      setIsComparingAI(false);
    }
  };

  // Active Cephalometric Landmarks State
  const [landmarks, setLandmarks] = useState<Record<string, { x: number; y: number }>>(() => {
    return getMergedLandmarks(study.cephalometricPoints);
  });
  const [draggingLandmark, setDraggingLandmark] = useState<string | null>(null);

  // AI Cephalometric Landmark Auto-Detection States
  const [isAIDetectingLandmarks, setIsAIDetectingLandmarks] = useState<boolean>(false);
  const [aiLandmarksResult, setAiLandmarksResult] = useState<{
    landmarks?: Record<string, { x: number; y: number; confidence?: number; label?: string; desc?: string }>;
    confidenceAverage?: number;
    summary?: string;
    isFallback?: boolean;
  } | null>(null);
  const [showAILandmarkProposal, setShowAILandmarkProposal] = useState<boolean>(false);
  const [showAILoadBanner, setShowAILoadBanner] = useState<boolean>(() => {
    // Show AI auto-location offer banner for lateral cephalometric studies
    const sub = (study.subtype || '').toLowerCase();
    const cat = (study.category || '').toLowerCase();
    return cat === 'cefalometrico' || sub.includes('cefalométrica') || sub.includes('lateral');
  });

  // Handler to run AI cephalometric landmark auto-detection
  const handleRunAILandmarkDetection = async (isManualCall = true) => {
    setIsAIDetectingLandmarks(true);
    setEditorMessage('✨ La IA está analizando la radiografía lateral y estimando la posición de los puntos cefalométricos...');
    setShowAILoadBanner(false);

    try {
      const res = await fetch('/api/ai/cephalometric-landmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: currentImageUrl,
          patientName: resolvedPatientName,
          studySubtype: study.subtype
        })
      });

      const data = await res.json();
      if (data && data.landmarks) {
        setAiLandmarksResult(data);
        setShowAILandmarkProposal(true);
        const confPercent = Math.round((data.confidenceAverage || 0.95) * 100);
        setEditorMessage(`✨ Propuesta IA generada con ${confPercent}% de confianza anatómica. Revisa y confirma los puntos.`);
      } else {
        setEditorMessage('No se pudo procesar la autodetección IA. Puedes ubicar los puntos manualmente.');
      }
    } catch (err) {
      console.error('Error in AI landmark auto-detection:', err);
      setEditorMessage('Atención: Error de conexión con el servicio de IA cefalométrica.');
    } finally {
      setIsAIDetectingLandmarks(false);
    }
  };

  // Handler to apply proposed AI landmarks to active study state
  const handleApplyAILandmarks = () => {
    if (!aiLandmarksResult || !aiLandmarksResult.landmarks) return;

    const newPts: Record<string, { x: number; y: number }> = {};
    Object.keys(aiLandmarksResult.landmarks).forEach((k) => {
      const p = aiLandmarksResult.landmarks![k];
      if (p && typeof p.x === 'number' && typeof p.y === 'number') {
        newPts[k] = { x: p.x, y: p.y };
      }
    });

    setLandmarks((prev) => ({
      ...prev,
      ...newPts
    }));

    setShowAILandmarkProposal(false);
    setEditorMessage('✅ ¡Éxito! 23 Puntos cefalométricos aplicados y ángulos ajustados automáticamente.');
  };

  // Handler to dismiss AI landmark proposal
  const handleDismissAILandmarks = () => {
    setShowAILandmarkProposal(false);
    setAiLandmarksResult(null);
    setEditorMessage('Propuesta de puntos IA descartada. Se mantuvieron los puntos actuales.');
  };

  const handleCephMeasurementChange = (code: string, newValue: number) => {
    if (isNaN(newValue)) return;
    setLandmarks((prev) => {
      const updated = { ...prev };
      const setAngleBetween = (center: {x: number, y: number}, p1: {x: number, y: number}, pTarget: {x: number, y: number}, targetAngleDeg: number) => {
        const theta1 = Math.atan2(p1.y - center.y, p1.x - center.x);
        const thetaTarget = Math.atan2(pTarget.y - center.y, pTarget.x - center.x);
        let diff = thetaTarget - theta1;
        while(diff <= -Math.PI) diff += 2 * Math.PI;
        while(diff > Math.PI) diff -= 2 * Math.PI;
        const sign = Math.sign(diff) || 1;
        const targetRad = targetAngleDeg * Math.PI / 180;
        const newTheta = theta1 + sign * targetRad;
        const dist = Math.hypot(pTarget.x - center.x, pTarget.y - center.y);
        return { x: Math.round(center.x + dist * Math.cos(newTheta)), y: Math.round(center.y + dist * Math.sin(newTheta)) };
      };

      const S = updated.S || DEFAULT_LANDMARKS.S;
      const N = updated.N || DEFAULT_LANDMARKS.N;
      const A = updated.A || DEFAULT_LANDMARKS.A;
      const B = updated.B || DEFAULT_LANDMARKS.B;

      if (code === 'SNA') {
        updated.A = setAngleBetween(N, S, A, newValue);
      } else if (code === 'SNB') {
        updated.B = setAngleBetween(N, S, B, newValue);
      } else if (code === 'ANB') {
        const currentSNA = calculateAngle(S, N, A);
        const targetSNB = currentSNA - newValue;
        updated.B = setAngleBetween(N, S, B, targetSNB);
      } else if (code === 'SND') {
        if (!updated.D) updated.D = { ...DEFAULT_LANDMARKS.D };
        updated.D = setAngleBetween(N, S, updated.D, newValue);
      } else if (code === 'SN-GoMe' || code === 'FMA') {
        const Go = updated.Go || DEFAULT_LANDMARKS.Go;
        const Me = updated.Me || DEFAULT_LANDMARKS.Me;
        const thetaSN = Math.atan2(N.y - S.y, N.x - S.x);
        const thetaGoMe = Math.atan2(Me.y - Go.y, Me.x - Go.x);
        let diff = thetaGoMe - thetaSN;
        while(diff <= -Math.PI) diff += 2 * Math.PI;
        while(diff > Math.PI) diff -= 2 * Math.PI;
        const sign = Math.sign(diff) || 1;
        const targetRad = newValue * Math.PI / 180;
        const newThetaGoMe = thetaSN + sign * targetRad;
        const dist = Math.hypot(Me.x - Go.x, Me.y - Go.y);
        updated.Me = { x: Math.round(Go.x + dist * Math.cos(newThetaGoMe)), y: Math.round(Go.y + dist * Math.sin(newThetaGoMe)) };
      }
      return updated;
    });
  };

  // Smile & Facial Aesthetics State
  const [showFacialGrid, setShowFacialGrid] = useState<boolean>(false);
  const [showGoldenRatio, setShowGoldenRatio] = useState<boolean>(false);
  const [showSmileCurve, setShowSmileCurve] = useState<boolean>(false);
  const [smileCurvature, setSmileCurvature] = useState<number>(270); // adjustable bezier controller
  const [midlineDeviation, setMidlineDeviation] = useState<number>(0); // lower midline shift in mm
  const [smileNotes, setSmileNotes] = useState<string[]>([
    'Línea media dental superior coincidente con la línea media facial.',
    'Borde incisal de caninos superiores sigue el contorno labial.'
  ]);
  const [newSmileNote, setNewSmileNote] = useState<string>('');

  const svgRef = useRef<SVGSVGElement>(null);

  // Sync state whenever active study changes
  useEffect(() => {
    setBrightness(study.brightness ?? 100);
    setContrast(study.contrast ?? 100);
    setInvert(study.invert ?? false);
    setRotation(study.rotation ?? 0);
    setAnnotations(study.annotations ?? []);
    setCurrentImageUrl(study.imageUrl);
    
    const initialLms = getMergedLandmarks(study.cephalometricPoints);
    setLandmarks(initialLms);

    // Auto-select corresponding overlay tab based on study category
    if (study.category === 'cefalometrico') {
      setActiveAnalysisTab('cephalometric');
    } else if (study.category === 'fotografia') {
      setActiveAnalysisTab('smile');
    } else if (study.category === 'tomografia') {
      setActiveAnalysisTab('filters');
    } else {
      setActiveAnalysisTab('filters');
    }

    setActiveTool('select');
    setCurrentLine(null);
    setCurrentPencilPoints([]);
    setEditorMessage(null);

    // Reset layers state
    setRadiographyLayer({
      visible: true,
      opacity: 1.0,
      x: 0,
      y: 0,
      rotation: 0,
      scale: 1.0,
      locked: true
    });
    setPhotoLayer({
      visible: true,
      opacity: 0.5,
      x: 0,
      y: 0,
      rotation: 0,
      scale: 1.0,
      imageUrl: '',
      locked: false
    });
    setTracingsLayer({
      visible: true,
      opacity: 1.0,
      x: 0,
      y: 0,
      rotation: 0,
      scale: 1.0,
      locked: false
    });
    setLayerOrder(['tracings', 'photo', 'radiography']);
    setActiveLayerToManipulate('tracings');

    // Initialize history stack with current loaded values
    const initialState = {
      annotations: study.annotations ?? [],
      landmarks: initialLms,
      radiographyLayer: {
        visible: true,
        opacity: 1.0,
        x: 0,
        y: 0,
        rotation: 0,
        scale: 1.0
      },
      photoLayer: {
        visible: true,
        opacity: 0.5,
        x: 0,
        y: 0,
        rotation: 0,
        scale: 1.0,
        imageUrl: ''
      },
      tracingsLayer: {
        visible: true,
        opacity: 1.0,
        x: 0,
        y: 0,
        rotation: 0,
        scale: 1.0
      },
      layerOrder: ['tracings', 'photo', 'radiography']
    };
    setHistoryStack([initialState]);
    setHistoryIndex(0);
  }, [study]);

  // Dynamic Layer Locking Helpers
  const toggleLayerLock = (layerId: 'radiography' | 'photo' | 'tracings') => {
    if (layerId === 'radiography') {
      setRadiographyLayer((prev) => {
        const next = !prev.locked;
        showTempMessage(`Capa Radiografía: ${next ? 'BLOQUEADA 🔒' : 'DESBLOQUEADA 🔓'}`);
        return { ...prev, locked: next };
      });
    } else if (layerId === 'photo') {
      setPhotoLayer((prev) => {
        const next = !prev.locked;
        showTempMessage(`Capa Imagen de Perfil: ${next ? 'BLOQUEADA 🔒' : 'DESBLOQUEADA 🔓'}`);
        return { ...prev, locked: next };
      });
    } else if (layerId === 'tracings') {
      setTracingsLayer((prev) => {
        const next = !prev.locked;
        showTempMessage(`Capa Trazos y Cefalometría: ${next ? 'BLOQUEADA 🔒' : 'DESBLOQUEADA 🔓'}`);
        return { ...prev, locked: next };
      });
    }
  };

  const toggleActiveLayerLock = () => {
    toggleLayerLock(activeLayerToManipulate);
  };

  // Sync the calibration input field with the selected annotation's current millimeter length
  useEffect(() => {
    if (selectedAnnotationId) {
      const selectedAnn = annotations.find((a) => a.id === selectedAnnotationId);
      if (selectedAnn && selectedAnn.type === 'line' && selectedAnn.lengthMm !== undefined) {
        setCalibrationInputValue(selectedAnn.lengthMm.toString());
      }
    }
  }, [selectedAnnotationId]);

  // Keyboard Shortcuts Listener Hook
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs/textareas
      const activeEl = document.activeElement;
      if (activeEl && (
        activeEl.tagName === 'INPUT' || 
        activeEl.tagName === 'TEXTAREA' || 
        activeEl.getAttribute('contenteditable') === 'true'
      )) {
        return;
      }

      const key = e.key.toLowerCase();

      // Undo: Ctrl+Z or Cmd+Z
      if ((e.ctrlKey || e.metaKey) && key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
        return;
      }

      // Redo: Ctrl+Y or Cmd+Y
      if ((e.ctrlKey || e.metaKey) && key === 'y') {
        e.preventDefault();
        handleRedo();
        return;
      }

      // 1. Change contrast preset with 'c'
      if (key === 'c') {
        e.preventDefault();
        const presets: ('normal' | 'bone' | 'soft' | 'invert')[] = ['normal', 'bone', 'soft', 'invert'];
        const nextIdx = (contrastPresetIndex + 1) % presets.length;
        setContrastPresetIndex(nextIdx);
        applyContrastPreset(presets[nextIdx]);
        return;
      }

      // 2. Zoom toggle with 'z'
      if (key === 'z') {
        e.preventDefault();
        setZoomScale((prev) => {
          const next = prev === 1.0 ? 2.0 : 1.0;
          showTempMessage(`Zoom: ${next}x`);
          return next;
        });
        return;
      }

      // 3. Layer visibility toggling (Keys 1, 2, 3 or Ctrl+1, Ctrl+2, Ctrl+3)
      if (key === '1') {
        e.preventDefault();
        setRadiographyLayer((prev) => {
          const next = !prev.visible;
          showTempMessage(`Capa Radiografía: ${next ? 'VISIBLE 👁️' : 'OCULTA 🚫'}`);
          return { ...prev, visible: next };
        });
        return;
      }
      if (key === '2') {
        e.preventDefault();
        setTracingsLayer((prev) => {
          const next = !prev.visible;
          showTempMessage(`Capa Trazos y Dibujos: ${next ? 'VISIBLE 👁️' : 'OCULTA 🚫'}`);
          return { ...prev, visible: next };
        });
        return;
      }
      if (key === '3') {
        e.preventDefault();
        setMeasurementsVisible((prev) => {
          const next = !prev;
          showTempMessage(`Capa de Mediciones: ${next ? 'VISIBLE 👁️' : 'OCULTA 🚫'}`);
          return next;
        });
        return;
      }

      // 4. Lock / Unlock Active Layer shortcut (Ctrl+L or L)
      if (key === 'l') {
        e.preventDefault();
        toggleActiveLayerLock();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    contrastPresetIndex,
    annotations,
    landmarks,
    radiographyLayer,
    photoLayer,
    tracingsLayer,
    historyIndex,
    historyStack,
    activeLayerToManipulate,
    measurementsVisible
  ]);

  // Convert client cursor coords to standard SVG coordinate box of 800x500, factoring in scale zoom, pan offset, and layer transforms
  const getCoordinates = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    
    const svg = svgRef.current;
    const zoomGroup = svg.querySelector('#zoom-pan-group') as SVGGraphicsElement | null;
    const targetEl = zoomGroup || svg;
    
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    
    const ctm = targetEl.getScreenCTM();
    if (!ctm) return { x: 0, y: 0 };
    
    const cursorPt = pt.matrixTransform(ctm.inverse());
    
    return { x: Math.round(cursorPt.x), y: Math.round(cursorPt.y) };
  };

  const getTracingsCoords = (input: React.MouseEvent<SVGSVGElement> | { x: number, y: number }) => {
    if (typeof input === 'object' && 'clientX' in input && svgRef.current) {
      const tracingsGroup = svgRef.current.querySelector('#layer-tracings') as SVGGraphicsElement | null;
      if (tracingsGroup) {
        const pt = svgRef.current.createSVGPoint();
        pt.x = (input as React.MouseEvent).clientX;
        pt.y = (input as React.MouseEvent).clientY;
        const ctm = tracingsGroup.getScreenCTM();
        if (ctm) {
          const cursorPt = pt.matrixTransform(ctm.inverse());
          return { x: Math.round(cursorPt.x), y: Math.round(cursorPt.y) };
        }
      }
    }
    const globalCoords = (typeof input === 'object' && 'x' in input) ? input : getCoordinates(input as React.MouseEvent<SVGSVGElement>);
    const rx = globalCoords.x - tracingsLayer.x;
    const ry = globalCoords.y - tracingsLayer.y;
    if (tracingsLayer.rotation === 0 && tracingsLayer.scale === 1) {
      return { x: Math.round(rx), y: Math.round(ry) };
    }
    const a = -tracingsLayer.rotation * (Math.PI / 180);
    const cosA = Math.cos(a);
    const sinA = Math.sin(a);
    const sx = 400 + (rx - 400) * cosA - (ry - 250) * sinA;
    const sy = 250 + (rx - 400) * sinA + (ry - 250) * cosA;
    return { x: Math.round(sx / tracingsLayer.scale), y: Math.round(sy / tracingsLayer.scale) };
  };

  // Signature Pad Handlers
  const getSignatureCoords = (e: React.MouseEvent<SVGSVGElement> | React.TouchEvent<SVGSVGElement>) => {
    if (!signatureCanvasRef.current) return { x: 0, y: 0 };
    const rect = signatureCanvasRef.current.getBoundingClientRect();
    
    let clientX = 0, clientY = 0;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }
    
    const x = ((clientX - rect.left) / rect.width) * 400;
    const y = ((clientY - rect.top) / rect.height) * 200;
    return { x: Math.round(x), y: Math.round(y) };
  };

  const handleSignatureStart = (e: React.MouseEvent<SVGSVGElement> | React.TouchEvent<SVGSVGElement>) => {
    e.preventDefault();
    setIsSigning(true);
    setCurrentSignaturePath([getSignatureCoords(e)]);
  };

  const handleSignatureMove = (e: React.MouseEvent<SVGSVGElement> | React.TouchEvent<SVGSVGElement>) => {
    if (!isSigning) return;
    e.preventDefault();
    setCurrentSignaturePath((prev) => [...prev, getSignatureCoords(e)]);
  };

  const handleSignatureEnd = () => {
    if (!isSigning) return;
    setIsSigning(false);
    if (currentSignaturePath.length > 0) {
      setSignaturePaths((prev) => [...prev, currentSignaturePath]);
      setCurrentSignaturePath([]);
    }
  };

  const clearSignature = () => {
    setSignaturePaths([]);
    setCurrentSignaturePath([]);
  };

  // AI Diagnostic Analysis Handler
  const handleGenerateAIDiagnosis = async () => {
    setIsAnalyzingAI(true);
    setShowAIModal(true);
    setAiDiagnosisResult(null);

    try {
      const response = await fetch('/api/ai/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientName: resolvedPatientName,
          studySubtype: study.subtype,
          analysisType: activeCephModel,
          cephalometricAngles: getCephMeasurements(),
          measurements: annotations.filter((a) => a.type === 'line' && a.lengthMm),
          smileAnalysis: { showSmileCurve, smileCurvature, midlineDeviation, notes: smileNotes },
          notes: reportNotes
        })
      });

      const data = await response.json();
      if (data.diagnosis) {
        setAiDiagnosisResult(data.diagnosis);
      } else {
        setAiDiagnosisResult('No se pudo procesar el análisis por IA. Por favor reintente.');
      }
    } catch (err) {
      console.error('Error in AI Diagnosis:', err);
      setAiDiagnosisResult('Error de conexión con el motor de IA.');
    } finally {
      setIsAnalyzingAI(false);
    }
  };

  const handleApplyAIDiagnosisToNotes = () => {
    if (aiDiagnosisResult) {
      setReportNotes((prev) => {
        if (!prev || prev.trim() === '' || prev.includes('Paciente presenta asimetría leve')) {
          return aiDiagnosisResult;
        }
        return `${prev}\n\n--- DIAGNÓSTICO ESTRUCTURADO CON IA ---\n${aiDiagnosisResult}`;
      });
      setShowAIModal(false);
      setActiveAnalysisTab('report');
      setEditorMessage('Diagnóstico por IA insertado en el informe clínico.');
      setTimeout(() => setEditorMessage(null), 3000);
    }
  };

  // PDF Export Handler
  const handleExportPDF = async () => {
    if (!reportPdfRef.current) return;
    setIsExportingPDF(true);
    setEditorMessage('Generando reporte en formato PDF...');

    try {
      const element = reportPdfRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      
      const fileName = `Informe_Dental_${resolvedPatientName.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`;
      pdf.save(fileName);

      setEditorMessage('¡Reporte PDF descargado exitosamente!');
    } catch (err) {
      console.error('Error exporting PDF:', err);
      setEditorMessage('Error al generar el archivo PDF.');
    } finally {
      setIsExportingPDF(false);
      setTimeout(() => setEditorMessage(null), 4000);
    }
  };

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Handle non-passive wheel events to prevent page scrolling while zooming on the radiography
  useEffect(() => {
    const container = imageContainerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.15 : 0.15;
      setZoomScale((prev) => Math.max(0.6, Math.min(3.5, Math.round((prev + delta) * 100) / 100)));
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, []);

  const toggleFullscreen = () => {
    const element = document.getElementById('unified-diagnostic-workstation');
    if (!element) return;
    if (!document.fullscreenElement) {
      element.requestFullscreen().catch((err) => {
        console.error('Error entering fullscreen:', err);
        showTempMessage('Error al activar pantalla completa');
      });
    } else {
      document.exitFullscreen().catch((err) => {
        console.error('Error exiting fullscreen:', err);
      });
    }
  };

  const handleExportImage = async (format: 'png' | 'jpeg') => {
    if (!editorViewportRef.current) return;
    setIsExportingImage(true);
    setShowExportMenu(false);
    setEditorMessage(`Generando imagen en formato ${format.toUpperCase()}...`);

    try {
      const element = editorViewportRef.current;
      const canvas = await html2canvas(element, {
        scale: 2.5, // High resolution for clinical consultations
        useCORS: true,
        logging: false,
        backgroundColor: '#020617' // Slate background
      });

      const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
      const fileExt = format === 'png' ? 'png' : 'jpg';
      const imgData = canvas.toDataURL(mimeType, 0.95);

      const link = document.createElement('a');
      link.href = imgData;
      link.download = `Trazado_Cefalometrico_${resolvedPatientName.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.${fileExt}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showTempMessage(`¡Imagen ${format.toUpperCase()} exportada exitosamente!`);
    } catch (err) {
      console.error('Error exporting image:', err);
      showTempMessage('Error al exportar la imagen radiográfica');
    } finally {
      setIsExportingImage(false);
      setTimeout(() => setEditorMessage(null), 3000);
    }
  };

  // Mouse interaction router
  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    e.preventDefault();
    
    if (activeTool === 'pan') {
      setIsPanning(true);
      setPanStart({ x: e.clientX, y: e.clientY });
      return;
    }

    const coords = getCoordinates(e);
    const tCoords = getTracingsCoords(coords);

    // Check handle or ruler selection in select / line tool modes
    if (activeTool === 'select' || activeTool === 'line') {
      // 1. Check if clicking on handle 1 or handle 2 of currently selected annotation
      if (selectedAnnotationId) {
        const selAnn = annotations.find((a) => a.id === selectedAnnotationId);
        if (selAnn && selAnn.type === 'line' && selAnn.x1 !== undefined && selAnn.x2 !== undefined) {
          const d1 = Math.hypot(selAnn.x1 - tCoords.x, (selAnn.y1 ?? 0) - tCoords.y);
          const d2 = Math.hypot(selAnn.x2 - tCoords.x, (selAnn.y2 ?? 0) - tCoords.y);
          if (d1 < 16) {
            setDraggingHandle('endpoint1');
            return;
          }
          if (d2 < 16) {
            setDraggingHandle('endpoint2');
            return;
          }
        }
      }

      // 2. Check if clicking on any ruler line body to select it
      const clickedLineAnn = annotations.find((ann) => {
        if (ann.type === 'line' && ann.x1 !== undefined && ann.x2 !== undefined) {
          const x1 = ann.x1, y1 = ann.y1 ?? 0, x2 = ann.x2, y2 = ann.y2 ?? 0;
          const A = tCoords.x - x1, B = tCoords.y - y1, C = x2 - x1, D = y2 - y1;
          const dot = A * C + B * D;
          const lenSq = C * C + D * D;
          let param = -1;
          if (lenSq !== 0) param = dot / lenSq;
          let xx, yy;
          if (param < 0) { xx = x1; yy = y1; }
          else if (param > 1) { xx = x2; yy = y2; }
          else { xx = x1 + param * C; yy = y1 + param * D; }
          const dist = Math.hypot(tCoords.x - xx, tCoords.y - yy);
          return dist < 12;
        }
        return false;
      });

      if (clickedLineAnn) {
        setSelectedAnnotationId(clickedLineAnn.id);
        setDraggingHandle('body');
        setDragOffset({ x: tCoords.x, y: tCoords.y });
        return;
      }
    }

    // Handle 'join_points' click tool
    if (activeTool === 'join_points') {
      const snap = findSnapTarget(tCoords.x, tCoords.y);
      const clickedPt = snap
        ? { x: snap.x, y: snap.y, label: snap.label }
        : { x: Math.round(tCoords.x), y: Math.round(tCoords.y), label: `Punto (${Math.round(tCoords.x)}, ${Math.round(tCoords.y)})` };

      if (joinSelectedPoints.length === 0) {
        setJoinSelectedPoints([clickedPt]);
        setEditorMessage(`Punto 1 fijado: ${clickedPt.label}. Haz clic en el segundo punto para unirlos.`);
      } else {
        const pt1 = joinSelectedPoints[0];
        const pt2 = clickedPt;
        const dx = pt2.x - pt1.x;
        const dy = pt2.y - pt1.y;
        const pixelDist = Math.hypot(dx, dy);
        const mmDist = Math.round((pixelDist / pixelsPerMm) * 10) / 10;

        const newAnn: Annotation = {
          id: `ann-join-${Date.now()}`,
          type: 'line',
          color: activeColor,
          x1: pt1.x,
          y1: pt1.y,
          x2: pt2.x,
          y2: pt2.y,
          lengthMm: mmDist,
          text: 'Unión'
        };

        const nextAnns = [...annotations, newAnn];
        setAnnotations(nextAnns);
        setSelectedAnnotationId(newAnn.id);
        setJoinSelectedPoints([]);
        saveToHistory(nextAnns, undefined, undefined, undefined);
        setEditorMessage(`✅ Puntos unidos con éxito: ${mmDist} mm`);
      }
      return;
    }

    // Handle 'range' selection tool
    if (activeTool === 'range') {
      const snap = findSnapTarget(tCoords.x, tCoords.y);
      const startX = snap ? snap.x : tCoords.x;
      const startY = snap ? snap.y : tCoords.y;
      setRangeStart({ x: startX, y: startY });
      setCurrentRangeBox({ x1: startX, y1: startY, x2: startX, y2: startY });
      setIsDrawing(true);
      return;
    }

    // If activeLayerToManipulate is radiography or photo, intercept and drag the layer
    if (activeLayerToManipulate === 'radiography') {
      if (radiographyLayer.locked) {
        showTempMessage('Capa Radiografía bloqueada (l para desbloquear)');
        return;
      }
      setIsManipulatingLayer('radiography');
      setLayerDragStart({ x: coords.x, y: coords.y, layerX: radiographyLayer.x, layerY: radiographyLayer.y });
      return;
    } else if (activeLayerToManipulate === 'photo') {
      if (photoLayer.locked) {
        showTempMessage('Capa Foto de Perfil bloqueada (l para desbloquear)');
        return;
      }
      setIsManipulatingLayer('photo');
      setLayerDragStart({ x: coords.x, y: coords.y, layerX: photoLayer.x, layerY: photoLayer.y });
      return;
    } else if (activeLayerToManipulate === 'tracings' && activeTool === 'select') {
      let clickedLandmark = false;
      if (activeAnalysisTab === 'cephalometric') {
        const clickTolerance = 15;
        clickedLandmark = Object.values(landmarks).some(pt => {
          const dx = pt.x - tCoords.x;
          const dy = pt.y - tCoords.y;
          return Math.sqrt(dx * dx + dy * dy) < clickTolerance;
        });
      }
      if (!clickedLandmark) {
        if (tracingsLayer.locked) {
          showTempMessage('Capa Trazos y Dibujos bloqueada (l para desbloquear)');
          return;
        }
        setIsManipulatingLayer('tracings');
        setLayerDragStart({ x: coords.x, y: coords.y, layerX: tracingsLayer.x, layerY: tracingsLayer.y });
        return;
      }
    }

    // 1. If in Cephalometric mode, check for clicking near a landmark first
    if (activeAnalysisTab === 'cephalometric') {
      let foundLandmark: string | null = null;
      const clickTolerance = 15;
      (Object.entries(landmarks) as [string, { x: number; y: number }][]).forEach(([key, pt]) => {
        const dx = pt.x - tCoords.x;
        const dy = pt.y - tCoords.y;
        if (Math.sqrt(dx * dx + dy * dy) < clickTolerance) {
          foundLandmark = key;
        }
      });

      if (foundLandmark) {
        setDraggingLandmark(foundLandmark);
        return; // intercept and do not trigger drawing
      }
    }

    // 2. Regular drawing tools
    if (activeTool === 'select') return;
    setIsDrawing(true);

    if (activeTool === 'line') {
      const snap = findSnapTarget(tCoords.x, tCoords.y);
      const startX = snap ? snap.x : tCoords.x;
      const startY = snap ? snap.y : tCoords.y;
      setCurrentLine({ x1: startX, y1: startY, x2: startX, y2: startY });
    } else if (activeTool === 'pencil') {
      setCurrentPencilPoints([tCoords]);
    } else if (activeTool === 'text') {
      const textVal = prompt('Ingrese la etiqueta diagnóstica:', 'Hallazgo Clínico');
      if (textVal) {
        const newAnn: Annotation = {
          id: `ann-${Date.now()}`,
          type: 'text',
          color: activeColor,
          x: tCoords.x,
          y: tCoords.y,
          text: textVal
        };
        const nextAnns = [...annotations, newAnn];
        setAnnotations(nextAnns);
        saveToHistory(nextAnns, undefined, undefined, undefined);
      }
      setIsDrawing(false);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (activeTool === 'pan' && isPanning && svgRef.current) {
      const dx = e.clientX - panStart.x;
      const dy = e.clientY - panStart.y;
      const rect = svgRef.current.getBoundingClientRect();
      const dxSvg = dx * (800 / rect.width);
      const dySvg = dy * (500 / rect.height);
      setPanOffset((prev) => ({
        x: prev.x + dxSvg,
        y: prev.y + dySvg
      }));
      setPanStart({ x: e.clientX, y: e.clientY });
      return;
    }

    const coords = getCoordinates(e);
    const tCoords = getTracingsCoords(coords);
    setHoverCoords(coords);

    // Calculate magnetic snap target for visual guidance
    const snap = findSnapTarget(tCoords.x, tCoords.y);
    setSnapTarget(snap);

    // If dragging selected annotation handle or body
    if (selectedAnnotationId && draggingHandle) {
      const finalX = snap ? snap.x : tCoords.x;
      const finalY = snap ? snap.y : tCoords.y;

      const updatedAnns = annotations.map((ann) => {
        if (ann.id === selectedAnnotationId && ann.type === 'line' && ann.x1 !== undefined && ann.x2 !== undefined) {
          let nx1 = ann.x1, ny1 = ann.y1 ?? 0, nx2 = ann.x2, ny2 = ann.y2 ?? 0;
          if (draggingHandle === 'endpoint1') {
            nx1 = finalX;
            ny1 = finalY;
          } else if (draggingHandle === 'endpoint2') {
            nx2 = finalX;
            ny2 = finalY;
          } else if (draggingHandle === 'body') {
            const dx = tCoords.x - dragOffset.x;
            const dy = tCoords.y - dragOffset.y;
            nx1 += dx; ny1 += dy; nx2 += dx; ny2 += dy;
            setDragOffset({ x: tCoords.x, y: tCoords.y });
          }
          const pixelDist = Math.hypot(nx2 - nx1, ny2 - ny1);
          const mmDist = Math.round((pixelDist / pixelsPerMm) * 10) / 10;
          return {
            ...ann,
            x1: nx1,
            y1: ny1,
            x2: nx2,
            y2: ny2,
            lengthMm: mmDist
          };
        }
        return ann;
      });

      setAnnotations(updatedAnns);
      return;
    }

    // If drawing range box
    if (activeTool === 'range' && isDrawing && rangeStart) {
      const finalX = snap ? snap.x : tCoords.x;
      const finalY = snap ? snap.y : tCoords.y;
      setCurrentRangeBox({ x1: rangeStart.x, y1: rangeStart.y, x2: finalX, y2: finalY });
      return;
    }

    // If dragging/manipulating layers
    if (isManipulatingLayer === 'radiography') {
      const dx = coords.x - layerDragStart.x;
      const dy = coords.y - layerDragStart.y;
      setRadiographyLayer((prev) => ({
        ...prev,
        x: Math.round(layerDragStart.layerX + dx),
        y: Math.round(layerDragStart.layerY + dy)
      }));
      return;
    } else if (isManipulatingLayer === 'photo') {
      const dx = coords.x - layerDragStart.x;
      const dy = coords.y - layerDragStart.y;
      setPhotoLayer((prev) => ({
        ...prev,
        x: Math.round(layerDragStart.layerX + dx),
        y: Math.round(layerDragStart.layerY + dy)
      }));
      return;
    } else if (isManipulatingLayer === 'tracings') {
      const dx = coords.x - layerDragStart.x;
      const dy = coords.y - layerDragStart.y;
      setTracingsLayer((prev) => ({
        ...prev,
        x: Math.round(layerDragStart.layerX + dx),
        y: Math.round(layerDragStart.layerY + dy)
      }));
      return;
    }

    // 1. If dragging cephalometric landmark
    if (activeAnalysisTab === 'cephalometric' && draggingLandmark) {
      setLandmarks((prev) => ({
        ...prev,
        [draggingLandmark]: {
          x: Math.round(Math.max(10, Math.min(790, tCoords.x))),
          y: Math.round(Math.max(10, Math.min(490, tCoords.y)))
        }
      }));
      return;
    }

    // 2. Standard drawing
    if (!isDrawing) return;
    if (activeTool === 'line' && currentLine) {
      const finalX = snap ? snap.x : tCoords.x;
      const finalY = snap ? snap.y : tCoords.y;
      setCurrentLine({ ...currentLine, x2: finalX, y2: finalY });
    } else if (activeTool === 'pencil') {
      setCurrentPencilPoints([...currentPencilPoints, tCoords]);
    }
  };

  const handleMouseLeave = () => {
    setHoverCoords(null);
    setSnapTarget(null);
    handleMouseUp();
  };

  const handleMouseUp = () => {
    if (activeTool === 'pan' && isPanning) {
      setIsPanning(false);
      return;
    }

    // If ending handle drag on selected annotation
    if (draggingHandle) {
      setDraggingHandle(null);
      saveToHistory(annotations, undefined, undefined, undefined);
      return;
    }

    // If ending range selection
    if (activeTool === 'range' && isDrawing && currentRangeBox) {
      setIsDrawing(false);
      setSelectedRangeBox(currentRangeBox);
      setCurrentRangeBox(null);
      setRangeStart(null);
      setEditorMessage('Rango fijado. Haz clic en "Calibrar Escala" en el panel lateral para ajustar mm.');
      return;
    }

    // If ending layer manipulation
    if (isManipulatingLayer) {
      setIsManipulatingLayer(null);
      saveToHistory(undefined, undefined, undefined, undefined);
      return;
    }

    // 1. End landmark drag
    if (draggingLandmark) {
      setDraggingLandmark(null);
      saveToHistory(undefined, landmarks, undefined, undefined);
      return;
    }

    // 2. End drawing
    if (!isDrawing) return;
    setIsDrawing(false);

    if (activeTool === 'line' && currentLine) {
      const dx = currentLine.x2 - currentLine.x1;
      const dy = currentLine.y2 - currentLine.y1;
      const pixelDist = Math.hypot(dx, dy);
      const mmDist = Math.round((pixelDist / pixelsPerMm) * 10) / 10;

      const newAnn: Annotation = {
        id: `ann-${Date.now()}`,
        type: 'line',
        color: activeColor,
        x1: currentLine.x1,
        y1: currentLine.y1,
        x2: currentLine.x2,
        y2: currentLine.y2,
        lengthMm: mmDist
      };
      const nextAnns = [...annotations, newAnn];
      setAnnotations(nextAnns);
      setSelectedAnnotationId(newAnn.id);
      setCurrentLine(null);
      saveToHistory(nextAnns, undefined, undefined, undefined);
      setEditorMessage(`Regla colocada: ${mmDist} mm`);
    } else if (activeTool === 'pencil' && currentPencilPoints.length > 1) {
      const newAnn: Annotation = {
        id: `ann-${Date.now()}`,
        type: 'pencil',
        color: activeColor,
        points: currentPencilPoints
      };
      const nextAnns = [...annotations, newAnn];
      setAnnotations(nextAnns);
      setCurrentPencilPoints([]);
      saveToHistory(nextAnns, undefined, undefined, undefined);
    }
  };

  // Image Upload / Attachment handler with client-side canvas compression to under 200KB
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // Max dimensions for local storage sanity
          const MAX_DIM = 900;
          if (width > MAX_DIM || height > MAX_DIM) {
            if (width > height) {
              height *= MAX_DIM / width;
              width = MAX_DIM;
            } else {
              width *= MAX_DIM / height;
              height = MAX_DIM;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.82);
          setCurrentImageUrl(compressedBase64);
          
          // Instantly save to parent context as well
          onSave(study.id, { imageUrl: compressedBase64 });
          showTempMessage('Imagen real adjuntada al estudio correctamente');
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCenterImage = () => {
    setZoomScale(1.0);
    setPanOffset({ x: 0, y: 0 });
    showTempMessage('Imagen centrada y zoom restablecido correctamente');
  };

  const handleResetFilters = () => {
    setBrightness(100);
    setContrast(100);
    setInvert(false);
    setRotation(0);
    setZoomScale(1.0);
    setPanOffset({ x: 0, y: 0 });
    showTempMessage('Filtros y zoom de imagen restablecidos');
  };

  // Zoom & Pan Helper functions
  const handleZoomIn = () => setZoomScale((prev) => Math.min(3.5, Math.round((prev + 0.25) * 100) / 100));
  const handleZoomOut = () => setZoomScale((prev) => Math.max(0.6, Math.round((prev - 0.25) * 100) / 100));
  const handleResetZoom = () => {
    setZoomScale(1.0);
    setPanOffset({ x: 0, y: 0 });
  };

  // handleWheelZoom logic moved to passive:false useEffect listener to prevent page scrolling

  const applyContrastPreset = (type: 'normal' | 'bone' | 'soft' | 'invert') => {
    if (type === 'normal') {
      setBrightness(100);
      setContrast(100);
      setInvert(false);
      showTempMessage('Ajuste Normal Radiográfico');
    } else if (type === 'bone') {
      setBrightness(115);
      setContrast(165);
      setInvert(false);
      showTempMessage('Modo Corticales Óseas (Alto Contraste)');
    } else if (type === 'soft') {
      setBrightness(130);
      setContrast(125);
      setInvert(false);
      showTempMessage('Modo Tejidos Blandos (Realce Labial)');
    } else if (type === 'invert') {
      setInvert(true);
      setBrightness(110);
      setContrast(145);
      showTempMessage('Modo Negativo Invertido (Inspección Radicular)');
    }
  };

  const handleClearAnnotations = () => {
    setAnnotations([]);
    showTempMessage('Anotaciones y mediciones borradas');
  };

  const handleRestoreTemplate = () => {
    if (confirm('¿Está seguro de restaurar el estudio a su plantilla predeterminada? Esto borrará la imagen cargada.')) {
      let fallback = 'periapical';
      if (study.category === 'extraoral') {
        fallback = study.subtype.toLowerCase().includes('panorámica') ? 'panorámica' : 'atm';
      } else if (study.category === 'cefalometrico') {
        fallback = 'cefalometria';
      } else if (study.category === 'fotografia') {
        fallback = 'fotografia';
      } else if (study.category === 'tomografia') {
        fallback = 'tomografia-bimaxilar';
      }
      setCurrentImageUrl(fallback);
      onSave(study.id, { imageUrl: fallback });
      showTempMessage('Plantilla clínica restaurada');
    }
  };

  const showTempMessage = (msg: string) => {
    setEditorMessage(msg);
    setTimeout(() => setEditorMessage(null), 3000);
  };

  const saveToHistory = (
    updatedAnnotations?: Annotation[],
    updatedLandmarks?: Record<string, { x: number; y: number }>,
    updatedRadioLayer?: typeof radiographyLayer,
    updatedPhotoL?: typeof photoLayer,
    updatedTracingsL?: typeof tracingsLayer,
    updatedLayerOrder?: string[]
  ) => {
    setHistoryStack((prevStack) => {
      const slicedStack = prevStack.slice(0, historyIndex + 1);
      
      const currentAnnotations = updatedAnnotations !== undefined ? updatedAnnotations : annotations;
      const currentLandmarks = updatedLandmarks !== undefined ? updatedLandmarks : landmarks;
      const currentRadioLayer = updatedRadioLayer !== undefined ? updatedRadioLayer : radiographyLayer;
      const currentPhotoLayer = updatedPhotoL !== undefined ? updatedPhotoL : photoLayer;
      const currentTracingsLayer = updatedTracingsL !== undefined ? updatedTracingsL : tracingsLayer;
      const currentLayerOrder = updatedLayerOrder !== undefined ? updatedLayerOrder : layerOrder;

      const nextState = {
        annotations: JSON.parse(JSON.stringify(currentAnnotations)),
        landmarks: JSON.parse(JSON.stringify(currentLandmarks)),
        radiographyLayer: { ...currentRadioLayer },
        photoLayer: { ...currentPhotoLayer },
        tracingsLayer: { ...currentTracingsLayer },
        layerOrder: [...currentLayerOrder]
      };

      const newStack = [...slicedStack, nextState];
      setHistoryIndex(newStack.length - 1);
      return newStack;
    });
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      const state = historyStack[prevIndex];
      setHistoryIndex(prevIndex);
      
      setAnnotations(state.annotations);
      setLandmarks(state.landmarks);
      setRadiographyLayer(state.radiographyLayer);
      setPhotoLayer(state.photoLayer);
      if (state.tracingsLayer) setTracingsLayer(state.tracingsLayer);
      if (state.layerOrder) setLayerOrder(state.layerOrder);
      
      showTempMessage('Deshacer acción exitoso');
    } else {
      showTempMessage('No hay acciones para deshacer');
    }
  };

  const handleRedo = () => {
    if (historyIndex < historyStack.length - 1) {
      const nextIndex = historyIndex + 1;
      const state = historyStack[nextIndex];
      setHistoryIndex(nextIndex);
      
      setAnnotations(state.annotations);
      setLandmarks(state.landmarks);
      setRadiographyLayer(state.radiographyLayer);
      setPhotoLayer(state.photoLayer);
      if (state.tracingsLayer) setTracingsLayer(state.tracingsLayer);
      if (state.layerOrder) setLayerOrder(state.layerOrder);
      
      showTempMessage('Rehacer acción exitoso');
    } else {
      showTempMessage('No hay acciones para rehacer');
    }
  };

  const moveLayer = (layer: 'radiography' | 'photo' | 'tracings', dx: number, dy: number) => {
    if (layer === 'radiography') {
      const next = { ...radiographyLayer, x: radiographyLayer.x + dx, y: radiographyLayer.y + dy };
      setRadiographyLayer(next);
      saveToHistory(undefined, undefined, next, undefined, undefined, undefined);
    } else if (layer === 'photo') {
      const next = { ...photoLayer, x: photoLayer.x + dx, y: photoLayer.y + dy };
      setPhotoLayer(next);
      saveToHistory(undefined, undefined, undefined, next, undefined, undefined);
    } else {
      const next = { ...tracingsLayer, x: tracingsLayer.x + dx, y: tracingsLayer.y + dy };
      setTracingsLayer(next);
      saveToHistory(undefined, undefined, undefined, undefined, next, undefined);
    }
  };

  const rotateLayer = (layer: 'radiography' | 'photo' | 'tracings', dAngle: number) => {
    if (layer === 'radiography') {
      const next = { ...radiographyLayer, rotation: (radiographyLayer.rotation + dAngle) % 360 };
      setRadiographyLayer(next);
      saveToHistory(undefined, undefined, next, undefined, undefined, undefined);
    } else if (layer === 'photo') {
      const next = { ...photoLayer, rotation: (photoLayer.rotation + dAngle) % 360 };
      setPhotoLayer(next);
      saveToHistory(undefined, undefined, undefined, next, undefined, undefined);
    } else {
      const next = { ...tracingsLayer, rotation: (tracingsLayer.rotation + dAngle) % 360 };
      setTracingsLayer(next);
      saveToHistory(undefined, undefined, undefined, undefined, next, undefined);
    }
  };

  const scaleLayer = (layer: 'radiography' | 'photo' | 'tracings', dScale: number) => {
    if (layer === 'radiography') {
      const next = { ...radiographyLayer, scale: Math.max(0.2, Math.min(3.0, radiographyLayer.scale + dScale)) };
      setRadiographyLayer(next);
      saveToHistory(undefined, undefined, next, undefined, undefined, undefined);
    } else if (layer === 'photo') {
      const next = { ...photoLayer, scale: Math.max(0.2, Math.min(3.0, photoLayer.scale + dScale)) };
      setPhotoLayer(next);
      saveToHistory(undefined, undefined, undefined, next, undefined, undefined);
    } else {
      const next = { ...tracingsLayer, scale: Math.max(0.2, Math.min(3.0, tracingsLayer.scale + dScale)) };
      setTracingsLayer(next);
      saveToHistory(undefined, undefined, undefined, undefined, next, undefined);
    }
  };

  const reorderLayer = (layerId: string, direction: 'up' | 'down') => {
    const currentIndex = layerOrder.indexOf(layerId);
    if (currentIndex === -1) return;
    
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= layerOrder.length) return;
    
    const newOrder = [...layerOrder];
    const temp = newOrder[currentIndex];
    newOrder[currentIndex] = newOrder[newIndex];
    newOrder[newIndex] = temp;
    
    setLayerOrder(newOrder);
    saveToHistory(undefined, undefined, undefined, undefined, undefined, newOrder);
    showTempMessage(`Orden de capa modificado: ${layerId === 'tracings' ? 'Trazos' : layerId === 'photo' ? 'Foto de Perfil' : 'Radiografía'}`);
  };

  const handleLayerDrop = (targetIndex: number) => {
    if (draggedLayerIndex === null) return;
    const sourceIndex = draggedLayerIndex;
    if (sourceIndex === targetIndex) {
      setDraggedLayerIndex(null);
      setDraggedOverLayerIndex(null);
      return;
    }
    
    const newOrder = [...layerOrder];
    const [draggedItem] = newOrder.splice(sourceIndex, 1);
    newOrder.splice(targetIndex, 0, draggedItem);
    
    setLayerOrder(newOrder);
    saveToHistory(undefined, undefined, undefined, undefined, undefined, newOrder);
    
    const layerName = draggedItem === 'tracings' ? 'Trazos' : draggedItem === 'photo' ? 'Foto de Perfil' : 'Radiografía';
    showTempMessage(`Orden de capa modificado: ${layerName}`);
    
    setDraggedLayerIndex(null);
    setDraggedOverLayerIndex(null);
  };

  const handlePhotoLayerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          const MAX_DIM = 900;
          if (width > MAX_DIM || height > MAX_DIM) {
            if (width > height) {
              height *= MAX_DIM / width;
              width = MAX_DIM;
            } else {
              width *= MAX_DIM / height;
              width = MAX_DIM;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.82);
          const nextLayer = { ...photoLayer, imageUrl: compressedBase64 };
          setPhotoLayer(nextLayer);
          saveToHistory(undefined, undefined, undefined, nextLayer);
          showTempMessage('Foto del paciente cargada en la capa intermedia');
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveChanges = () => {
    onSave(study.id, {
      brightness,
      contrast,
      invert,
      rotation,
      annotations,
      cephalometricPoints: landmarks,
      imageUrl: currentImageUrl
    });
    showTempMessage('Análisis y trazados guardados en la carpeta del paciente');
  };

  // Vector calculation formulas
  const calculateAngle = (p1: { x: number; y: number }, vertex: { x: number; y: number }, p2: { x: number; y: number }): number => {
    const v1 = { x: p1.x - vertex.x, y: p1.y - vertex.y };
    const v2 = { x: p2.x - vertex.x, y: p2.y - vertex.y };
    const dotProduct = v1.x * v2.x + v1.y * v2.y;
    const mag1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y);
    const mag2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y);
    if (mag1 === 0 || mag2 === 0) return 0;
    const cosAngle = dotProduct / (mag1 * mag2);
    const angleRad = Math.acos(Math.max(-1, Math.min(1, cosAngle)));
    return Math.round((angleRad * 180) / Math.PI);
  };

  const calculateLineAngle = (
    p1: { x: number; y: number },
    p2: { x: number; y: number },
    p3: { x: number; y: number },
    p4: { x: number; y: number }
  ): number => {
    const v1 = { x: p2.x - p1.x, y: p2.y - p1.y };
    const v2 = { x: p4.x - p3.x, y: p4.y - p3.y };
    const dot = v1.x * v2.x + v1.y * v2.y;
    const mag1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y);
    const mag2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y);
    if (!mag1 || !mag2) return 0;
    const cos = Math.max(-1, Math.min(1, dot / (mag1 * mag2)));
    return Math.round((Math.acos(cos) * 180) / Math.PI);
  };

  const perpendicularDist = (
    pt: { x: number; y: number },
    p1: { x: number; y: number },
    p2: { x: number; y: number }
  ): number => {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len === 0) return 0;
    const distPx = Math.abs(dy * pt.x - dx * pt.y + p2.x * p1.y - p2.y * p1.x) / len;
    return Math.round((distPx / 10) * 10) / 10;
  };

  const calculateDistance = (p1: { x: number; y: number }, p2: { x: number; y: number }): number => {
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    return Math.round((Math.sqrt(dx * dx + dy * dy) / 5) * 10) / 10;
  };

  // PRE-STEINER VERIFICATION ENGINE
  const getPreSteinerValidation = (overrideLandmarks?: Record<string, { x: number; y: number }>) => {
    const lm = overrideLandmarks || landmarks;
    const S = lm.S || DEFAULT_LANDMARKS.S;
    const N = lm.N || DEFAULT_LANDMARKS.N;
    const A = lm.A || DEFAULT_LANDMARKS.A;
    const Po = lm.Po || DEFAULT_LANDMARKS.Po;
    const Or = lm.Or || DEFAULT_LANDMARKS.Or;

    const angleSN_FH = calculateLineAngle(S, N, Po, Or);
    const lenSN = calculateDistance(S, N); // mm
    const lenSA = calculateDistance(S, A); // mm

    let snFhStatus: 'normal' | 'steep' | 'flat' = 'normal';
    let snFhMessage = '';
    if (angleSN_FH >= 5 && angleSN_FH <= 9) {
      snFhStatus = 'normal';
      snFhMessage = 'Inclinación de la base craneal SN respecto a Frankfort (Po-Or) dentro del rango fisiológico (7° ± 2°). Los valores SNA y SNB de Steiner representan la relación esquelética real con alta fidelidad.';
    } else if (angleSN_FH > 9) {
      snFhStatus = 'steep';
      snFhMessage = `Ángulo SN / Po-Or elevado (${angleSN_FH}° > 9°). Advertencia: La inclinación caudal de la base craneal anterior puede SUBESTIMAR falsamente los ángulos SNA y SNB de Steiner.`;
    } else {
      snFhStatus = 'flat';
      snFhMessage = `Ángulo SN / Po-Or aplanado (${angleSN_FH}° < 5°). Advertencia: La base craneal horizontalizada puede SOBREESTIMAR los ángulos SNA y SNB.`;
    }

    let snLenStatus: 'normal' | 'short' | 'long' = 'normal';
    let snLenMessage = '';
    if (lenSN >= 68 && lenSN <= 74) {
      snLenStatus = 'normal';
      snLenMessage = `Longitud de la base craneal anterior (S-N: ${lenSN} mm) en norma (71 ± 3 mm). Calibración estructural válida.`;
    } else if (lenSN < 68) {
      snLenStatus = 'short';
      snLenMessage = `Base craneal anterior corta (S-N: ${lenSN} mm < 68 mm). Requiere correlación para evitar sobreinterpretar la prominencia del Punto A.`;
    } else {
      snLenStatus = 'long';
      snLenMessage = `Base craneal anterior elongada (S-N: ${lenSN} mm > 74 mm). Proyección aumentada de la estructura craneal anterior.`;
    }

    return {
      angleSN_FH,
      snFhStatus,
      snFhMessage,
      lenSN,
      lenSA,
      snLenStatus,
      snLenMessage,
      ratioSA_SN: Math.round((lenSA / (lenSN || 1)) * 100) / 100
    };
  };

  // Cephalometric Measurements Engine with Full Individual Diagnostic Analyses
  const getProjectionOnLine = (
    p: { x: number; y: number },
    p1: { x: number; y: number },
    p2: { x: number; y: number }
  ) => {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const lenSq = dx * dx + dy * dy;
    if (lenSq === 0) return { x: p1.x, y: p1.y };
    const u = ((p.x - p1.x) * dx + (p.y - p1.y) * dy) / lenSq;
    return {
      x: Math.round(p1.x + u * dx),
      y: Math.round(p1.y + u * dy)
    };
  };

  const getCephMeasurements = (overrideLandmarks?: Record<string, { x: number; y: number }>) => {
    const lm = overrideLandmarks || landmarks;
    const S = lm.S || DEFAULT_LANDMARKS.S;
    const N = lm.N || DEFAULT_LANDMARKS.N;
    const A = lm.A || DEFAULT_LANDMARKS.A;
    const B = lm.B || DEFAULT_LANDMARKS.B;
    const D = lm.D || DEFAULT_LANDMARKS.D;
    const Go = lm.Go || DEFAULT_LANDMARKS.Go;
    const Me = lm.Me || DEFAULT_LANDMARKS.Me;
    const Gn = lm.Gn || DEFAULT_LANDMARKS.Gn || Me;
    const Pog = lm.Pog || DEFAULT_LANDMARKS.Pog;
    const Or = lm.Or || DEFAULT_LANDMARKS.Or;
    const Po = lm.Po || DEFAULT_LANDMARKS.Po;
    const ANS = lm.ANS || DEFAULT_LANDMARKS.ANS;
    const PNS = lm.PNS || DEFAULT_LANDMARKS.PNS;
    const L = lm.L || getProjectionOnLine(Pog, S, N);
    const E = lm.E || getProjectionOnLine(Go, S, N);
    const U1t = lm.U1t || DEFAULT_LANDMARKS.U1t;
    const U1r = lm.U1r || DEFAULT_LANDMARKS.U1r;
    const L1t = lm.L1t || DEFAULT_LANDMARKS.L1t;
    const L1r = lm.L1r || DEFAULT_LANDMARKS.L1r;
    const OcA = lm.OcA || DEFAULT_LANDMARKS.OcA;
    const OcP = lm.OcP || DEFAULT_LANDMARKS.OcP;
    const Ns = lm.Ns || DEFAULT_LANDMARKS.Ns;
    const Ls = lm.Ls || DEFAULT_LANDMARKS.Ls;
    const Li = lm.Li || DEFAULT_LANDMARKS.Li;
    const Pogs = lm.Pogs || DEFAULT_LANDMARKS.Pogs;

    const preSteiner = getPreSteinerValidation(overrideLandmarks);

    if (activeCephModel === 'Steiner') {
      // 1. Esquelético Sagital
      const sna = calculateAngle(S, N, A);
      const snb = calculateAngle(S, N, B);
      const anb = sna - snb;
      const snd = calculateAngle(S, N, D);

      const distSL = calculateDistance(S, L);
      const distSE = calculateDistance(S, E);

      // 2. Esquelético Vertical
      const snGoGn = calculateLineAngle(S, N, Go, Gn);
      const ocPSN = calculateLineAngle(S, N, OcP, OcA);

      // 3. Dentoalveolar
      const angle1NA = calculateLineAngle(U1r, U1t, N, A);
      const dist1NA = perpendicularDist(U1t, N, A);

      const angle1Palatino = calculateLineAngle(U1r, U1t, PNS, ANS);

      const dist1NB = perpendicularDist(L1t, N, B);
      const angle1NB = calculateLineAngle(L1r, L1t, N, B);

      const angleInterincisal = calculateLineAngle(U1r, U1t, L1r, L1t);
      const angle1SN = calculateLineAngle(U1r, U1t, S, N);
      const angle1Mandibular = calculateLineAngle(L1r, L1t, Go, Gn);

      // 4. Tejidos Blandos
      const distLsSLine = perpendicularDist(Ls, Pogs, Ns);

      return [
        // VERIFICACIÓN PRE-STEINER
        {
          code: 'SN-FH',
          name: 'Ángulo SN / Po-Or (Plano Craneal vs Frankfort)',
          norm: '7° ± 2°',
          val: preSteiner.angleSN_FH,
          unit: '°',
          dev: `${(preSteiner.angleSN_FH - 7).toFixed(1)}°`,
          statusTag: preSteiner.snFhStatus === 'normal' ? 'Base Craneal Válida' : 'Inclinación Craneal Alterada',
          severity: preSteiner.snFhStatus === 'normal' ? 'normal' : 'warning',
          category: 'Pre-Steiner',
          clinicalAnalysis: preSteiner.snFhMessage
        },
        {
          code: 'S-N-len',
          name: 'Longitud Base Craneal Anterior (S-N)',
          norm: '71.0 mm ± 3',
          val: preSteiner.lenSN,
          unit: ' mm',
          dev: `${(preSteiner.lenSN - 71).toFixed(1)} mm`,
          statusTag: preSteiner.snLenStatus === 'normal' ? 'Base Craneal Adecuada' : 'Base Craneal Fuera de Norma',
          severity: preSteiner.snLenStatus === 'normal' ? 'normal' : 'warning',
          category: 'Pre-Steiner',
          clinicalAnalysis: preSteiner.snLenMessage
        },

        // 1. SNA (Ángulo)
        {
          code: 'SNA',
          name: 'SNA (Ángulo)',
          norm: '82°',
          val: sna,
          unit: '°',
          dev: `${(sna - 82).toFixed(1)}°`,
          statusTag: sna > 84 ? 'Protrusión Maxilar' : sna < 80 ? 'Retrusión Maxilar' : 'Normoposición',
          severity: sna > 84 || sna < 80 ? 'critical' : 'normal',
          category: 'Esquelético Sagital',
          clinicalAnalysis: sna > 84
            ? `Ángulo SNA aumentado (${sna}° vs norma 82°). Protrusión o avance del maxilar superior respecto a la base del cráneo.`
            : sna < 80
            ? `Ángulo SNA disminuido (${sna}° vs norma 82°). Retrusión o hipoplasia maxilar esquelética.`
            : `Ángulo SNA en norma (${sna}° vs norma 82°). Posición maxilar anteroposterior fisiológica.`
        },

        // 2. SNB (Ángulo)
        {
          code: 'SNB',
          name: 'SNB (Ángulo)',
          norm: '80°',
          val: snb,
          unit: '°',
          dev: `${(snb - 80).toFixed(1)}°`,
          statusTag: snb > 82 ? 'Prognatismo Mandibular' : snb < 78 ? 'Retrognatismo Mandibular' : 'Normoposición',
          severity: snb > 82 || snb < 78 ? 'critical' : 'normal',
          category: 'Esquelético Sagital',
          clinicalAnalysis: snb > 82
            ? `Ángulo SNB elevado (${snb}° vs norma 80°). Prognatismo mandibular esquelético.`
            : snb < 78
            ? `Ángulo SNB disminuido (${snb}° vs norma 80°). Retrognatismo o micrognatismo mandibular severo.`
            : `Ángulo SNB normal (${snb}° vs norma 80°). Posición mandibular equilibrada.`
        },

        // 3. ANB (Ángulo)
        {
          code: 'ANB',
          name: 'ANB (Ángulo)',
          norm: '2°',
          val: anb,
          unit: '°',
          dev: `${(anb - 2).toFixed(1)}°`,
          statusTag: anb > 4 ? 'Clase II Esquelética' : anb < 0 ? 'Clase III Esquelética' : 'Clase I Esquelética',
          severity: anb > 4 || anb < 0 ? 'critical' : 'normal',
          category: 'Esquelético Sagital',
          clinicalAnalysis: anb > 4
            ? `Diferencia ANB aumentada (${anb}° vs norma 2°). Discrepancia esquelética de Clase II.`
            : anb < 0
            ? `Diferencia ANB negativa (${anb}° vs norma 2°). Discrepancia esquelética de Clase III.`
            : `ANB dentro de norma (${anb}° vs norma 2°). Relación esquelética intermaxilar Clase I.`
        },

        // 4. SND (Ángulo)
        {
          code: 'SND',
          name: 'SND (Ángulo)',
          norm: '76°',
          val: snd,
          unit: '°',
          dev: `${(snd - 76).toFixed(1)}°`,
          statusTag: snd > 78 ? 'Sínfisis Avanzada' : snd < 74 ? 'Sínfisis Retrusiva' : 'Sínfisis Normal',
          severity: snd > 78 || snd < 74 ? 'warning' : 'normal',
          category: 'Esquelético Sagital',
          clinicalAnalysis: snd > 78
            ? `Ángulo SND elevado (${snd}° vs 76°). Centro de sínfisis mentoniana adelantado.`
            : snd < 74
            ? `Ángulo SND reducido (${snd}° vs 76°). Ubicación retruida de la sínfisis mandibular.`
            : `Ángulo SND en norma (${snd}° vs 76°).`
        },

        // 5. SL
        {
          code: 'SL',
          name: 'SL',
          norm: '51.0 mm',
          val: distSL,
          unit: ' mm',
          dev: `${(distSL - 51.0).toFixed(1)} mm`,
          statusTag: distSL > 53 ? 'Posición Sínfisis Avanzada' : distSL < 49 ? 'Posición Sínfisis Retruida' : 'Normoposición SL',
          severity: Math.abs(distSL - 51) > 3 ? 'warning' : 'normal',
          category: 'Esquelético Sagital',
          clinicalAnalysis: `Distancia S-L: ${distSL} mm (Norma: 51.0 mm). Posición anteroposterior del mentón respecto a Silla.`
        },

        // 6. SE
        {
          code: 'SE',
          name: 'SE',
          norm: '22.0 mm',
          val: distSE,
          unit: ' mm',
          dev: `${(distSE - 22.0).toFixed(1)} mm`,
          statusTag: distSE > 24 ? 'Cóndilo Posterior' : distSE < 20 ? 'Cóndilo Anterior' : 'Normoposición SE',
          severity: Math.abs(distSE - 22) > 3 ? 'warning' : 'normal',
          category: 'Esquelético Sagital',
          clinicalAnalysis: `Distancia S-E: ${distSE} mm (Norma: 22.0 mm). Ubicación posterior de cóndilo/rama respecto a Silla.`
        },

        // 7. GO-GN-SN (Ángulo)
        {
          code: 'GO-GN-SN',
          name: 'GO-GN-SN (Ángulo)',
          norm: '32°',
          val: snGoGn,
          unit: '°',
          dev: `${(snGoGn - 32).toFixed(1)}°`,
          statusTag: snGoGn > 35 ? 'Hiperdivergente / Dolicofacial' : snGoGn < 29 ? 'Hipodivergente / Braquifacial' : 'Mesofacial / Normodivergente',
          severity: snGoGn > 35 || snGoGn < 29 ? 'warning' : 'normal',
          category: 'Esquelético Vertical',
          clinicalAnalysis: snGoGn > 35
            ? `Ángulo GoGn-SN aumentado (${snGoGn}° vs norma 32°). Crecimiento vertical, patrón dolicofacial.`
            : snGoGn < 29
            ? `Ángulo GoGn-SN disminuido (${snGoGn}° vs norma 32°). Crecimiento horizontal, patrón braquifacial.`
            : `Plano mandibular en norma (${snGoGn}° vs 32°). Biotipo mesofacial.`
        },

        // 8. SN- Plano Oclusal
        {
          code: 'SN-Oclusal',
          name: 'SN- Plano Oclusal',
          norm: '14°',
          val: ocPSN,
          unit: '°',
          dev: `${(ocPSN - 14).toFixed(1)}°`,
          statusTag: ocPSN > 17 ? 'Plano Oclusal Inclinado' : ocPSN < 11 ? 'Plano Oclusal Aplanado' : 'Inclinación Normal',
          severity: ocPSN > 17 || ocPSN < 11 ? 'warning' : 'normal',
          category: 'Esquelético Vertical',
          clinicalAnalysis: `Inclinación del plano oclusal respecto a SN: ${ocPSN}° (Norma: 14°).`
        },

        // 9. Inc. Superior - NA
        {
          code: '1-NA-deg',
          name: 'Inc. Superior - NA',
          norm: '22°',
          val: angle1NA,
          unit: '°',
          dev: `${(angle1NA - 22).toFixed(1)}°`,
          statusTag: angle1NA > 24 ? 'Proclinación Incisivo Sup.' : angle1NA < 20 ? 'Retroclinación Incisivo Sup.' : 'Inclinación Normal',
          severity: angle1NA > 24 || angle1NA < 20 ? 'warning' : 'normal',
          category: 'Dentoalveolar',
          clinicalAnalysis: `Inclinación del incisivo superior a N-A: ${angle1NA}° (Norma: 22°).`
        },

        // 10. Inc. Superior - NA Seg.
        {
          code: '1-NA-mm',
          name: 'Inc. Superior - NA Seg.',
          norm: '4.0 mm',
          val: dist1NA,
          unit: ' mm',
          dev: `${(dist1NA - 4.0).toFixed(1)} mm`,
          statusTag: dist1NA > 4.5 ? 'Protrusión Incisivo Sup.' : dist1NA < 3.5 ? 'Retrusión Incisivo Sup.' : 'Posición Normal',
          severity: dist1NA > 4.5 || dist1NA < 3.5 ? 'warning' : 'normal',
          category: 'Dentoalveolar',
          clinicalAnalysis: `Posición del borde incisal superior a N-A: ${dist1NA} mm (Norma: 4.0 mm).`
        },

        // 11. Inc. Superior Plano Palatino
        {
          code: '1-Palatino',
          name: 'Inc. Superior Plano Palatino',
          norm: '70°',
          val: angle1Palatino,
          unit: '°',
          dev: `${(angle1Palatino - 70).toFixed(1)}°`,
          statusTag: angle1Palatino > 73 ? 'Inclinación Aumentada' : angle1Palatino < 67 ? 'Inclinación Disminuida' : 'Inclinación Normal',
          severity: Math.abs(angle1Palatino - 70) > 3 ? 'warning' : 'normal',
          category: 'Dentoalveolar',
          clinicalAnalysis: `Ángulo del incisivo superior al plano palatino (ANS-PNS): ${angle1Palatino}° (Norma: 70°).`
        },

        // 12. Inc. Inferior - NB
        {
          code: '1-NB-mm',
          name: 'Inc. Inferior - NB',
          norm: '4.0 mm',
          val: dist1NB,
          unit: ' mm',
          dev: `${(dist1NB - 4.0).toFixed(1)} mm`,
          statusTag: dist1NB > 4.5 ? 'Protrusión Incisivo Inf.' : dist1NB < 3.5 ? 'Retrusión Incisivo Inf.' : 'Posición Normal',
          severity: dist1NB > 4.5 || dist1NB < 3.5 ? 'warning' : 'normal',
          category: 'Dentoalveolar',
          clinicalAnalysis: `Posición del incisivo inferior a N-B: ${dist1NB} mm (Norma: 4.0 mm).`
        },

        // 13. Inc. Inferior - NB Seg.
        {
          code: '1-NB-deg',
          name: 'Inc. Inferior - NB Seg.',
          norm: '25°',
          val: angle1NB,
          unit: '°',
          dev: `${(angle1NB - 25).toFixed(1)}°`,
          statusTag: angle1NB > 27 ? 'Proclinación Incisivo Inf.' : angle1NB < 23 ? 'Retroclinación Incisivo Inf.' : 'Inclinación Normal',
          severity: angle1NB > 27 || angle1NB < 23 ? 'warning' : 'normal',
          category: 'Dentoalveolar',
          clinicalAnalysis: `Inclinación angular del incisivo inferior a N-B: ${angle1NB}° (Norma: 25°).`
        },

        // 14. Interincisal
        {
          code: 'Interincisal',
          name: 'Interincisal',
          norm: '131°',
          val: angleInterincisal,
          unit: '°',
          dev: `${(angleInterincisal - 131).toFixed(1)}°`,
          statusTag: angleInterincisal < 126 ? 'Biproclinación Incisiva' : angleInterincisal > 136 ? 'Biretroclinación Incisiva' : 'Ángulo Normal',
          severity: angleInterincisal < 126 || angleInterincisal > 136 ? 'warning' : 'normal',
          category: 'Dentoalveolar',
          clinicalAnalysis: `Ángulo interincisivo (1 sup a 1 inf): ${angleInterincisal}° (Norma: 131°).`
        },

        // 15. Inc. Superior Plano S-N
        {
          code: '1-SN',
          name: 'Inc. Superior Plano S-N',
          norm: '103°',
          val: angle1SN,
          unit: '°',
          dev: `${(angle1SN - 103).toFixed(1)}°`,
          statusTag: angle1SN > 106 ? 'Proclinación Sup/SN' : angle1SN < 100 ? 'Retroclinación Sup/SN' : 'Normoposición Sup/SN',
          severity: Math.abs(angle1SN - 103) > 3 ? 'warning' : 'normal',
          category: 'Dentoalveolar',
          clinicalAnalysis: `Inclinación del incisivo superior respecto a S-N: ${angle1SN}° (Norma: 103°).`
        },

        // 16. Inc. Inferior Plano Mandibular
        {
          code: '1-Mandibular',
          name: 'Inc. Inferior Plano Mandibular',
          norm: '90°',
          val: angle1Mandibular,
          unit: '°',
          dev: `${(angle1Mandibular - 90).toFixed(1)}°`,
          statusTag: angle1Mandibular > 93 ? 'Proclinación Inf/IMPA' : angle1Mandibular < 87 ? 'Retroclinación Inf/IMPA' : 'Normoposición Inf/IMPA',
          severity: Math.abs(angle1Mandibular - 90) > 3 ? 'warning' : 'normal',
          category: 'Dentoalveolar',
          clinicalAnalysis: `Inclinación del incisivo inferior respecto al plano mandibular (IMPA): ${angle1Mandibular}° (Norma: 90°).`
        },

        // 17. Línea S
        {
          code: 'Línea S',
          name: 'Línea S',
          norm: '0.0 mm',
          val: distLsSLine,
          unit: ' mm',
          dev: `${distLsSLine > 0 ? '+' : ''}${distLsSLine.toFixed(1)} mm`,
          statusTag: distLsSLine > 2 ? 'Protrusión Labial' : distLsSLine < -2 ? 'Retrusión Labial' : 'Perfil Labial Armónico',
          severity: Math.abs(distLsSLine) > 2 ? 'warning' : 'normal',
          category: 'Tejidos Blandos',
          clinicalAnalysis: `Distancia labial a la Línea S de Steiner: ${distLsSLine} mm (Norma: 0.0 mm).`
        }
      ];
    } else if (activeCephModel === 'McNamara') {
      const nPerpA = calculateDistance(N, A) - 34;
      const nPerpPog = calculateDistance(N, Pog) - 36;
      const maxMandDiff = calculateDistance(S, Me) - calculateDistance(S, A);

      return [
        { code: 'N-Perp-A', name: 'Pto A a Perp. Nasion', norm: '0.0 mm', val: Math.round(nPerpA), unit: ' mm', dev: `${nPerpA.toFixed(1)} mm`, statusTag: nPerpA > 2 ? 'Protrusión Maxilar' : nPerpA < -2 ? 'Retrusión Maxilar' : 'Alineación Ideal', severity: Math.abs(nPerpA) > 2 ? 'warning' : 'normal', category: 'Esquelético Sagital', clinicalAnalysis: nPerpA > 2 ? 'Punto A por delante de la perpendicular de Nasion.' : nPerpA < -2 ? 'Punto A retruido.' : 'Alineación maxilar ideal según McNamara.' },
        { code: 'N-Perp-Pog', name: 'Pogonion a Perp. Nasion', norm: '-4.0 a 0.0 mm', val: Math.round(nPerpPog), unit: ' mm', dev: `${nPerpPog.toFixed(1)} mm`, statusTag: nPerpPog > 2 ? 'Prognatismo Mandibular' : nPerpPog < -6 ? 'Retrusión Mandibular' : 'Alineación Óptima', severity: nPerpPog > 2 || nPerpPog < -6 ? 'critical' : 'normal', category: 'Esquelético Sagital', clinicalAnalysis: nPerpPog < -6 ? 'Pogonion marcadamente por detrás de la línea Nasion perpendicular.' : 'Posición del mentón adecuada.' },
        { code: 'Mx-Md Diff', name: 'Dif. Maxilomandibular', norm: '25.0 - 30.0 mm', val: Math.round(maxMandDiff), unit: ' mm', dev: `${maxMandDiff.toFixed(1)} mm`, statusTag: maxMandDiff > 32 ? 'Discrepancia Severa' : 'Alineación Ósea Armónica', severity: maxMandDiff > 32 ? 'critical' : 'normal', category: 'Esquelético Sagital', clinicalAnalysis: maxMandDiff > 32 ? 'Diferencia de longitud efectiva entre maxilar y mandíbula alterada.' : 'Longitud efectiva maxilomandibular armónica.' }
      ];
    } else {
      const sna = calculateAngle(S, N, A);
      const snb = calculateAngle(S, N, B);
      const anb = sna - snb;
      const goniaco = calculateAngle(Me, Go, S);

      return [
        { code: 'SNA-UPCH', name: 'SNA (Norma UPCH)', norm: '82°', val: sna, unit: '°', dev: `${(sna - 82).toFixed(1)}°`, statusTag: sna > 84 ? 'Protrusión' : sna < 80 ? 'Retrusión' : 'Normoposición', severity: sna > 84 || sna < 80 ? 'warning' : 'normal', category: 'Esquelético Sagital', clinicalAnalysis: 'Evaluación según patrón cefalométrico de la población peruana UPCH.' },
        { code: 'SNB-UPCH', name: 'SNB (Norma UPCH)', norm: '80°', val: snb, unit: '°', dev: `${(snb - 80).toFixed(1)}°`, statusTag: snb > 82 ? 'Prognatismo' : snb < 78 ? 'Retrognatismo' : 'Normoposición', severity: snb > 82 || snb < 78 ? 'critical' : 'normal', category: 'Esquelético Sagital', clinicalAnalysis: 'Evaluación posicional de la mandíbula según tabla UPCH.' },
        { code: 'ANB-UPCH', name: 'ANB Esquelético (UPCH)', norm: '2°', val: anb, unit: '°', dev: `${(anb - 2).toFixed(1)}°`, statusTag: anb > 3 ? 'Desvío Clase II' : anb < 1 ? 'Desvío Clase III' : 'Relación Clase I', severity: anb > 3 || anb < 1 ? 'critical' : 'normal', category: 'Esquelético Sagital', clinicalAnalysis: 'Relación sagital intermaxilar referenciada localmente.' },
        { code: 'Goniaco', name: 'Ángulo Goníaco (Me-Go-S)', norm: '120° ± 5°', val: goniaco, unit: '°', dev: `${(goniaco - 120).toFixed(1)}°`, statusTag: goniaco > 125 ? 'Crecimiento Vertical Abierto' : goniaco < 115 ? 'Crecimiento Horizontal Cerrado' : 'Estructura Equilibrada', severity: goniaco > 125 || goniaco < 115 ? 'warning' : 'normal', category: 'Esquelético Vertical', clinicalAnalysis: 'Ángulo del gonion que refleja la dirección del crecimiento mandibular.' }
      ];
    }
  };

  const getPatientAgeYears = (birthStr: string): number => {
    if (!birthStr) return 14;
    const b = new Date(birthStr);
    if (isNaN(b.getTime())) return 14;
    const now = new Date();
    let age = now.getFullYear() - b.getFullYear();
    const m = now.getMonth() - b.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < b.getDate())) {
      age--;
    }
    return age > 0 ? age : 14;
  };

  // STEINER TREATMENT PLAN GENERATOR BASED ON SEX, AGE & DIVERGENCE (GROWTH PATTERN)
  const getSteinerTreatmentPlan = () => {
    const measurements = getCephMeasurements();
    const findVal = (code: string, defaultVal: number) => {
      const item = measurements.find((m) => m.code === code);
      if (!item) return defaultVal;
      return typeof item.val === 'number' ? item.val : parseFloat(item.val as string) || defaultVal;
    };

    const sna = Math.round(findVal('SNA', 82));
    const snb = Math.round(findVal('SNB', 80));
    const anb = Math.round(findVal('ANB', 2));
    const snGoGn = Math.round(findVal('GO-GN-SN', 32));
    const u1NaMm = findVal('1-NA-mm', 4.0);
    const l1NbMm = findVal('1-NB-mm', 4.0);
    const u1NaDeg = Math.round(findVal('1-NA-deg', 22));
    const l1NbDeg = Math.round(findVal('1-NB-deg', 25));
    const lineS = findVal('Línea S', 0.0);

    const currentAge = patientAgeInput > 0 ? patientAgeInput : getPatientAgeYears(patientBirthDate);
    const gender = patientGender;

    // Divergence Pattern
    let growthPatternType: 'Hiperdivergente' | 'Normodivergente' | 'Braquidivergente' = 'Normodivergente';
    if (growthPatternOverride === 'hiper' || (growthPatternOverride === 'auto' && snGoGn > 35)) {
      growthPatternType = 'Hiperdivergente';
    } else if (growthPatternOverride === 'braqui' || (growthPatternOverride === 'auto' && snGoGn < 29)) {
      growthPatternType = 'Braquidivergente';
    } else if (growthPatternOverride === 'normo') {
      growthPatternType = 'Normodivergente';
    }

    // Skeletal Class
    let skeletalClassTag = 'Clase I Esquelética (ANB = ' + anb + '°)';
    if (anb > 4) {
      if (sna > 84 && snb < 78) skeletalClassTag = 'Clase II Esquelética Combinada (Protrusión Maxilar + Retrusión Mandibular)';
      else if (sna > 84) skeletalClassTag = 'Clase II Esquelética por Protrusión Maxilar (SNA = ' + sna + '°)';
      else if (snb < 78) skeletalClassTag = 'Clase II Esquelética por Retrusión Mandibular (SNB = ' + snb + '°)';
      else skeletalClassTag = 'Clase II Esquelética (ANB = ' + anb + '°)';
    } else if (anb < 0) {
      if (sna < 80 && snb > 82) skeletalClassTag = 'Clase III Esquelética Combinada (Hipoplasia Maxilar + Prognatismo Mandibular)';
      else if (sna < 80) skeletalClassTag = 'Clase III Esquelética por Hipoplasia Maxilar (SNA = ' + sna + '°)';
      else if (snb > 82) skeletalClassTag = 'Clase III Esquelética por Prognatismo Mandibular (SNB = ' + snb + '°)';
      else skeletalClassTag = 'Clase III Esquelética (ANB = ' + anb + '°)';
    }

    // Growth Maturity Stage
    const isPrepubertal = currentAge < (gender === 'F' ? 11 : 12);
    const isGrowthActive = currentAge < (gender === 'F' ? 15 : 17);
    const isAdult = currentAge >= (gender === 'F' ? 17 : 18);

    const growthStageLabel = isPrepubertal
      ? 'Fase Pre-Púber (Excelente Respuesta a Ortopedia Dentofacial)'
      : isGrowthActive
      ? 'Pico Puberal / Crecimiento Residual (Ortopedia + Ortodoncia)'
      : 'Adulto Sin Crecimiento Restante (Camuflaje Ortodóncico vs Cirugía Ortognática)';

    // Treatment Directives
    const divergenceDirectives: string[] = [];
    const recommendedApparel: string[] = [];
    const contraindications: string[] = [];
    const biologicalConsiderations: string[] = [];

    // Divergence Biomechanics
    if (growthPatternType === 'Hiperdivergente') {
      divergenceDirectives.push('🚨 CONTROL VERTICAL ESTRICTO: Prohibido extruir molares posteriores para no abrir el ángulo mandibular ni empeorar el perfil facial.');
      divergenceDirectives.push('❌ Prohibido el uso de elásticos intermaxilares de Clase II o III sin anclaje vertical directo.');
      divergenceDirectives.push('🎯 Favorecer el cierre de espacios por mesialización de molares (efecto de "cuña de sandía") para inducir la autorrotación antihoraria de la mandíbula.');

      if (isGrowthActive) {
        recommendedApparel.push('High-Pull Headgear (Tracción Extraoral Alta) para retener el descenso maxilar posterior.');
        recommendedApparel.push('Mentonera de Tiro Vertical o Bloques de Mordida Posteriores.');
        recommendedApparel.push('Disyuntor Palatino tipo McNamara con cobertura oclusal en acrílico (evita la extrusión posterior).');
      } else {
        recommendedApparel.push('Anclaje Esquelético con Minitornillos (TADs) en cresta infracigomática y zona retromolar para intrusión posterior.');
        recommendedApparel.push('Extracción estratégica de primeros premolares si hay apiñamiento para colapsar la dimensión vertical posterior.');
        if (snGoGn > 42) {
          recommendedApparel.push('Consideración Quirúrgica: Impactación Maxilar Superior + Osteotomía Sagital Mandibular (BSSO) con rotación antihoraria.');
        }
      }
      contraindications.push('¡No usar tracción extraoral cervical (Cervical Headgear) ni planos de mordida posteriores extruyentes!');
    } else if (growthPatternType === 'Braquidivergente') {
      divergenceDirectives.push('✅ EXTRUSIÓN POSTERIOR LIBRE Y BENEFICIOSA: Excelente tolerancia para la apertura de la dimensión vertical.');
      divergenceDirectives.push('🎯 La extrusión de molares y premolares ayuda a levantar la mordida profunda anterior y mejorar el perfil facial corto.');
      divergenceDirectives.push('💪 Musculatura maseterina hipertónica y potente: Se requiere anclaje fuerte y arcos de alambre continuos pesados.');

      if (isGrowthActive) {
        recommendedApparel.push('Tracción Cervical Extraoral (Cervical Headgear) para extruir molares y aumentar la altura facial inferior.');
        recommendedApparel.push('Aparato Funcional de Avance Mandibular (Twin Block / Bionator) con desgastes oclusales posteriores.');
        recommendedApparel.push('Placa con Levantamiento de Mordida Anterior (Bite Ramp / Plano de Mordida Anterior).');
      } else {
        recommendedApparel.push('Turbos / Bite Ramps de resina en incisivos superiores para destrabar la oclusión profunda anterior.');
        recommendedApparel.push('Arcos de Acero pesados con Curva de Spee Acentuada (superior) e Invertida (inferior).');
        recommendedApparel.push('Enfoque CONSERVADOR SIN EXTRACCIONES priorizado para no profundizar más el perfil facial.');
      }
      contraindications.push('Evitar extracciones de premolares a menos que el apiñamiento sea severo, para prevenir el colapso del perfil facial.');
    } else {
      // Normodivergente
      divergenceDirectives.push('⚖️ PATRÓN MESOFACIAL EQUILIBRADO: Crecimiento y desarrollo facial armónicos.');
      divergenceDirectives.push('🎯 Biomecánica ortodóncica estándar con arcos progresivos de NiTi y Acero.');
      recommendedApparel.push('Aparatología Fija Multibrackets / Alineadores invisibles con secuencia de arcos convencional.');
    }

    // Sagittal Directives (ANB)
    if (anb > 4) { // Class II
      if (isGrowthActive) {
        if (snb < 78) recommendedApparel.push('Aparato de Avance Mandibular (Twin Block / Herbst / MARA) para estimular/guiar el crecimiento de la mandíbula.');
        if (sna > 84) recommendedApparel.push('Tracción Extraoral (Headgear) o Arco Lingual / Botón de Nance para restricción maxilar.');
      } else {
        recommendedApparel.push('Camuflaje Ortodóncico de Clase II: Retracción incisiva previa extracción de premolares superiores o distalización con Minitornillos TADs.');
        if (anb > 7) recommendedApparel.push('Cirugía Ortognática de Avance Mandibular (BSSO).');
      }
    } else if (anb < 0) { // Class III
      if (isPrepubertal && sna < 80) {
        recommendedApparel.push('Máscara Facial de Petit con Disyuntor Palatino RME (Protracción Maxilar Rápida). Ideal antes de los 10 años.');
      } else if (isGrowthActive) {
        recommendedApparel.push('Aparato de Clase III (Frankel III / Mentonera occipital) e inclinación compensatoria de incisivos.');
      } else {
        recommendedApparel.push('Camuflaje Ortodóncico con elásticos de Clase III / Minitornillos inferiores vs Cirugía Bimaxilar.');
      }
    }

    // Dentoalveolar Steiner (Incisors)
    const incisorNotes: string[] = [];
    if (u1NaMm > 5 || u1NaDeg > 25) incisorNotes.push(`Incisivo Superior Proinclinado/Protrusivo (${u1NaMm}mm / ${u1NaDeg}° vs norma 4mm/22°): Retracción indicada.`);
    else if (u1NaMm < 2 || u1NaDeg < 18) incisorNotes.push(`Incisivo Superior Retroclinado (${u1NaMm}mm / ${u1NaDeg}°): Proinclinar y dar torque positivo.`);

    if (l1NbMm > 5 || l1NbDeg > 28) incisorNotes.push(`Incisivo Inferior Proinclinado/Protrusivo (${l1NbMm}mm / ${l1NbDeg}° vs norma 4mm/25°): Precaución con la tabla ósea vestibular.`);
    else if (l1NbMm < 2 || l1NbDeg < 20) incisorNotes.push(`Incisivo Inferior Retroclinado (${l1NbMm}mm / ${l1NbDeg}°): Margen favorable para proinclinación de descompensación.`);

    // Gender/Age considerations
    if (gender === 'F') {
      if (currentAge < 11) {
        biologicalConsiderations.push('Femenino (' + currentAge + ' años): Ventana ortopédica puberal activa. Máxima tasa de respuesta a expansión maxilar y aparatos funcionales.');
      } else if (currentAge < 16) {
        biologicalConsiderations.push('Femenino (' + currentAge + ' años): Pico de crecimiento completándose. Sensibilidad en la estética de perfil de tejidos blandos (Línea S: ' + lineS + 'mm).');
      } else {
        biologicalConsiderations.push('Femenino Adulto (' + currentAge + ' años): Crecimiento finalizado. Remodelado óseo más lento y sínfisis delgada; vigilar salud periodontal en retro/proinclinaciones.');
      }
    } else {
      if (currentAge < 12) {
        biologicalConsiderations.push('Masculino (' + currentAge + ' años): Fase previa al pico estatural. Ventana ortopédica prolongada con alta previsibilidad.');
      } else if (currentAge < 17) {
        biologicalConsiderations.push('Masculino (' + currentAge + ' años): En pleno pico estatural y mandibular puberal. Excelente respuesta a aparatos de avance mandibular (Twin Block / Herbst).');
      } else {
        biologicalConsiderations.push('Masculino Adulto (' + currentAge + ' años): Hueso alveolar de alta densidad y musculatura maseterina hipertrófica; se requiere anclaje rígido.');
      }
    }

    return {
      currentAge,
      gender,
      genderLabel: gender === 'F' ? 'Femenino ♀' : 'Masculino ♂',
      snGoGn,
      anb,
      sna,
      snb,
      u1NaMm,
      l1NbMm,
      growthPatternType,
      skeletalClassTag,
      growthStageLabel,
      divergenceDirectives,
      recommendedApparel,
      contraindications,
      incisorNotes,
      biologicalConsiderations
    };
  };

  const handleAddSmileNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSmileNote.trim()) {
      setSmileNotes([...smileNotes, newSmileNote.trim()]);
      setNewSmileNote('');
    }
  };

  const handleRemoveSmileNote = (idx: number) => {
    setSmileNotes(smileNotes.filter((_, i) => i !== idx));
  };

  // Render clean background or uploaded radiography image
  const renderXRayBaseTemplate = () => {
    // If a custom image or URL is loaded, render it directly
    if (currentImageUrl.startsWith('data:image/') || currentImageUrl.startsWith('http') || currentImageUrl.startsWith('blob:')) {
      return (
        <image 
          href={currentImageUrl} 
          x="0" 
          y="0" 
          width="800" 
          height="500" 
          preserveAspectRatio="xMidYMid meet" 
        />
      );
    }

    // Clean dark canvas without placeholder vector template models or overlays
    return (
      <g id="clean-diagnostic-canvas">
        <rect width="800" height="500" fill="#07080b" />
        <radialGradient id="grad-clean-canvas" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor="#111522" />
          <stop offset="100%" stopColor="#050608" />
        </radialGradient>
        <rect width="800" height="500" fill="url(#grad-clean-canvas)" />

        {/* Subtle professional grid lines */}
        <g stroke="#1e293b" strokeWidth="0.5" opacity="0.25">
          {Array.from({ length: 16 }).map((_, i) => (
            <line key={`v-${i}`} x1={i * 50} y1={0} x2={i * 50} y2={500} />
          ))}
          {Array.from({ length: 10 }).map((_, i) => (
            <line key={`h-${i}`} x1={0} y1={i * 50} x2={800} y2={i * 50} />
          ))}
        </g>
      </g>
    );
  };

  return (
    <div 
      className={`flex flex-col xl:flex-row gap-2.5 text-slate-800 ${
        isFullscreen ? 'fixed inset-0 z-50 bg-slate-100 p-3 overflow-hidden' : 'h-full overflow-hidden'
      }`} 
      id="unified-diagnostic-workstation"
    >
      
      {/* 1. MAIN DIAGNOSTIC DISPLAY VIEWPORT (LEFT SIDE) */}
      <div className="flex-1 h-0 min-h-0 flex flex-col bg-slate-50 border border-slate-200 rounded-xl overflow-hidden shadow-2xs relative h-full">
        
        {/* Viewport Header */}
        <div className="px-4 py-3 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="p-1.5 bg-blue-50 text-blue-600 rounded-lg border border-blue-100">
              <Layers size={18} />
            </span>
            <div>
              <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                Estación Digital de Diagnóstico Unificada
                <span className="px-2 py-0.5 text-[10px] bg-blue-50 text-blue-600 border border-blue-100 rounded-full font-mono uppercase font-bold">
                  {study.category}
                </span>
              </h3>
              <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                {study.subtype} | ID: {study.id}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            {/* AI Landmarks Quick Auto-Detect Button */}
            <button
              onClick={() => handleRunAILandmarkDetection(true)}
              disabled={isAIDetectingLandmarks}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-lg text-xs font-bold cursor-pointer transition-all shadow-sm disabled:opacity-50"
              title="Autodetectar 23 puntos cefalométricos con Inteligencia Artificial"
            >
              {isAIDetectingLandmarks ? (
                <Loader2 size={13} className="animate-spin text-white" />
              ) : (
                <Sparkles size={13} className="text-cyan-200 animate-pulse" />
              )}
              <span>Puntos IA</span>
            </button>

            {/* Real patient Image Upload label button */}
            <label className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-xs font-bold cursor-pointer transition-all shadow-2xs">
              <Upload size={13} className="text-blue-500" />
              <span>Adjuntar Imagen Real</span>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageUpload} 
                className="hidden" 
              />
            </label>

            {/* Export Image Dropdown */}
            <div className="relative" onMouseLeave={() => setShowExportMenu(false)}>
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                disabled={isExportingImage}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-xs font-bold cursor-pointer transition-all shadow-2xs disabled:opacity-50"
                title="Exportar imagen con trazos"
              >
                {isExportingImage ? (
                  <Loader2 size={13} className="animate-spin text-blue-500" />
                ) : (
                  <FileImage size={13} className="text-blue-500" />
                )}
                <span>Exportar Imagen</span>
                <ChevronDown size={11} className="text-slate-400" />
              </button>

              {showExportMenu && (
                <div className="absolute right-0 mt-1 w-40 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-40 animate-fade-in">
                  <button
                    onClick={() => handleExportImage('png')}
                    className="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-2 cursor-pointer"
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    Guardar como PNG
                  </button>
                  <button
                    onClick={() => handleExportImage('jpeg')}
                    className="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-2 cursor-pointer"
                  >
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    Guardar como JPEG
                  </button>
                </div>
              )}
            </div>

            {/* Fullscreen Button */}
            <button
              onClick={toggleFullscreen}
              className="flex items-center justify-center p-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-all shadow-2xs cursor-pointer"
              title={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
            >
              {isFullscreen ? <Minimize2 size={14} className="text-blue-600" /> : <Maximize2 size={14} className="text-slate-500" />}
            </button>

            <button
              onClick={handleSaveChanges}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-650 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-sm transition-all cursor-pointer"
            >
              <Check size={14} />
              Guardar Cambios
            </button>
          </div>
        </div>

        {/* NEMOSTUDIO GUIDED WORKFLOW STEPPER BAR */}
        <div className="bg-slate-900 border-y border-slate-800 px-4 py-2 flex items-center justify-between text-white overflow-x-auto gap-3 shrink-0">
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-2.5 py-1 rounded-lg text-xs font-bold shadow-sm">
              <Sparkles size={13} className="text-cyan-300 animate-pulse" />
              <span>NemoStudio</span>
            </div>
            {!isCalibrated && (
              <span className="text-[10px] text-amber-400 font-bold bg-amber-950/80 border border-amber-500/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Lock size={10} />
                Calibración Requerida
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-xs shrink-0">
            {/* Paso 1: Calibración */}
            <button
              onClick={() => setNemoStep(1)}
              className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                nemoStep === 1
                  ? 'bg-amber-500 text-slate-950 shadow-md ring-2 ring-amber-400/60'
                  : isCalibrated
                  ? 'bg-slate-800 text-emerald-400 hover:bg-slate-750'
                  : 'bg-amber-950/60 text-amber-300 hover:bg-amber-900/60 border border-amber-500/30'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-slate-950/40 flex items-center justify-center text-[10px] font-mono">1</span>
              <span>1. Calibración (mm)</span>
              {isCalibrated ? <CheckCircle2 size={12} className="text-emerald-400" /> : <Lock size={11} className="text-amber-400" />}
            </button>

            {/* Paso 2: Datos Paciente */}
            <button
              onClick={() => {
                if (!isCalibrated) {
                  setEditorMessage('⚠️ Paso 1 Requerido: Primero debe calibrar la imagen con la regla (mm) antes de proceder.');
                  return;
                }
                setNemoStep(2);
              }}
              className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                nemoStep === 2
                  ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-400/50'
                  : !isCalibrated
                  ? 'bg-slate-800/40 text-slate-500 cursor-not-allowed opacity-60'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-slate-900/40 flex items-center justify-center text-[10px] font-mono">2</span>
              <span>2. Paciente & Fechas</span>
              {!isCalibrated && <Lock size={11} className="text-slate-500" />}
            </button>

            {/* Paso 3: Tipo de Análisis */}
            <button
              onClick={() => {
                if (!isCalibrated) {
                  setEditorMessage('⚠️ Paso 1 Requerido: Primero debe calibrar la imagen con la regla (mm) antes de proceder.');
                  return;
                }
                setNemoStep(3);
              }}
              className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                nemoStep === 3
                  ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-400/50'
                  : !isCalibrated
                  ? 'bg-slate-800/40 text-slate-500 cursor-not-allowed opacity-60'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-slate-900/40 flex items-center justify-center text-[10px] font-mono">3</span>
              <span>3. Análisis</span>
              {!isCalibrated && <Lock size={11} className="text-slate-500" />}
            </button>

            {/* Paso 4: Trazado & Puntos */}
            <button
              onClick={() => {
                if (!isCalibrated) {
                  setEditorMessage('⚠️ Paso 1 Requerido: Primero debe calibrar la imagen con la regla (mm) antes de proceder.');
                  return;
                }
                setActiveAnalysisTab('cephalometric');
                setNemoStep(4);
              }}
              className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                nemoStep === 4
                  ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-400/50'
                  : !isCalibrated
                  ? 'bg-slate-800/40 text-slate-500 cursor-not-allowed opacity-60'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-slate-900/40 flex items-center justify-center text-[10px] font-mono">4</span>
              <span>4. Trazado & Puntos</span>
              {!isCalibrated && <Lock size={11} className="text-slate-500" />}
            </button>

            {/* Paso 5: Resultados & Comparativa IA */}
            <button
              onClick={() => {
                if (!isCalibrated) {
                  setEditorMessage('⚠️ Paso 1 Requerido: Primero debe calibrar la imagen con la regla (mm) antes de proceder.');
                  return;
                }
                setNemoStep(5);
              }}
              className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                nemoStep === 5
                  ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-400/50'
                  : !isCalibrated
                  ? 'bg-slate-800/40 text-slate-500 cursor-not-allowed opacity-60'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-slate-900/40 flex items-center justify-center text-[10px] font-mono">5</span>
              <span>5. Resultados & Comparativa IA</span>
              {!isCalibrated && <Lock size={11} className="text-slate-500" />}
            </button>
          </div>
        </div>

        {/* NEMOSTUDIO STEP ACTIVE CONTROLS SUB-HEADER */}
        {nemoStep === 1 && (
          <div className="bg-amber-950/90 text-amber-100 border-b border-amber-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-amber-500/20 text-amber-300 rounded-xl border border-amber-500/40">
                <Scale size={16} />
              </div>
              <div>
                <h4 className="font-bold text-amber-200 text-xs">
                  Paso 1: Calibración de Imagen con Regla en Milímetros (mm)
                </h4>
                <p className="text-amber-300/80 text-[11px]">
                  Sin calibración previa de la escala real (mm), no podrá proceder con las siguientes funciones de trazado.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={handleAlignForeheadRuler}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <Scale size={13} />
                <span>Alinear Regla en Apoyafrente</span>
              </button>

              <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-amber-500/30">
                <input
                  type="number"
                  value={calibrationInputValue}
                  onChange={(e) => setCalibrationInputValue(e.target.value)}
                  className="w-14 px-2 py-0.5 bg-slate-950 text-white font-mono text-center text-xs rounded-lg border border-slate-700 focus:outline-none"
                  placeholder="10"
                />
                <span className="text-slate-400 font-bold text-[10px] pr-1">mm</span>
                <button
                  onClick={handleApplyScaleCalibration}
                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition-all cursor-pointer"
                >
                  Confirmar (mm)
                </button>
              </div>

              {isCalibrated && (
                <button
                  onClick={() => setNemoStep(2)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all shadow-sm flex items-center gap-1 cursor-pointer"
                >
                  <span>Ir al Paso 2</span>
                  <ArrowRight size={13} />
                </button>
              )}
            </div>
          </div>
        )}

        {nemoStep === 2 && (
          <div className="bg-slate-900/95 text-white border-b border-slate-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-500/20 text-blue-400 rounded-xl border border-blue-500/40">
                <User size={16} />
              </div>
              <div>
                <h4 className="font-bold text-white text-xs">Paso 2: Datos del Paciente para Trazados</h4>
                <p className="text-slate-400 text-[11px]">Configure género, fecha de nacimiento, fecha de análisis y edad calculada.</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700">
                <span className="text-[10px] text-slate-400 font-bold px-1 uppercase">Género:</span>
                <button
                  onClick={() => setPatientGender('F')}
                  className={`px-2 py-0.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                    patientGender === 'F' ? 'bg-pink-600 text-white shadow-xs' : 'text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  Femenino
                </button>
                <button
                  onClick={() => setPatientGender('M')}
                  className={`px-2 py-0.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                    patientGender === 'M' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  Masculino
                </button>
              </div>

              <div className="flex items-center gap-1 bg-slate-800 px-2 py-1 rounded-xl border border-slate-700">
                <span className="text-[10px] text-slate-400 font-bold">Nacimiento:</span>
                <input
                  type="date"
                  value={patientBirthDate}
                  onChange={(e) => setPatientBirthDate(e.target.value)}
                  className="bg-slate-950 text-white font-mono text-xs px-1.5 py-0.5 rounded-lg border border-slate-700 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-1 bg-slate-800 px-2 py-1 rounded-xl border border-slate-700">
                <span className="text-[10px] text-slate-400 font-bold">Análisis:</span>
                <input
                  type="date"
                  value={analysisDate}
                  onChange={(e) => setAnalysisDate(e.target.value)}
                  className="bg-slate-950 text-white font-mono text-xs px-1.5 py-0.5 rounded-lg border border-slate-700 focus:outline-none"
                />
              </div>

              <div className="bg-blue-950/80 border border-blue-500/40 px-2.5 py-1 rounded-xl text-center">
                <span className="text-[9px] text-blue-300 font-bold block uppercase">Edad:</span>
                <span className="font-mono font-bold text-emerald-400 text-xs">
                  {calculateAgeYearsMonths(patientBirthDate, analysisDate).formatted}
                </span>
              </div>

              <button
                onClick={() => setNemoStep(3)}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-sm flex items-center gap-1 cursor-pointer"
              >
                <span>Paso 3</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        )}

        {nemoStep === 3 && (
          <div className="bg-slate-900/95 text-white border-b border-slate-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-indigo-500/20 text-indigo-400 rounded-xl border border-indigo-500/40">
                <Compass size={16} />
              </div>
              <div>
                <h4 className="font-bold text-white text-xs">Paso 3: Seleccionar Análisis Cefalométrico</h4>
                <p className="text-slate-400 text-[11px]">Modelos disponibles: Steiner, Ricketts, McNamara, Tweed, Downs, UPCH.</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              {(['Steiner', 'Ricketts', 'McNamara', 'Tweed', 'Downs', 'UPCH'] as const).map((model) => (
                <button
                  key={model}
                  onClick={() => setActiveCephModel(model)}
                  className={`px-2.5 py-1 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                    activeCephModel === model
                      ? 'bg-indigo-600 text-white shadow-md ring-2 ring-indigo-400/50'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
                  }`}
                >
                  {model === 'Steiner' ? 'Análisis Steiner' : model}
                </button>
              ))}

              <button
                onClick={() => {
                  setActiveAnalysisTab('cephalometric');
                  setNemoStep(4);
                }}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-sm flex items-center gap-1 cursor-pointer ml-2"
              >
                <span>Paso 4 (Trazado)</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        )}

        {nemoStep === 4 && (
          <div className="bg-slate-900/95 text-white border-b border-slate-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 font-bold px-2 uppercase">Etapa Pre-Tratamiento:</span>
                <button
                  onClick={() => {
                    if (treatmentStage === 'final') {
                      setLandmarksFinal(landmarks);
                      setLandmarks(landmarksInicial);
                      setTreatmentStage('inicial');
                      setEditorMessage('📍 Trazado cambiado a: Inicial (Pre-Tratamiento)');
                    }
                  }}
                  className={`px-3 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                    treatmentStage === 'inicial'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  1. Inicial (Pre-Tratamiento)
                </button>
                <button
                  onClick={() => {
                    if (treatmentStage === 'inicial') {
                      setLandmarksInicial(landmarks);
                      setLandmarks(landmarksFinal);
                      setTreatmentStage('final');
                      setEditorMessage('📍 Trazado cambiado a: Final (Post-Tratamiento)');
                    }
                  }}
                  className={`px-3 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                    treatmentStage === 'final'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  2. Final (Post-Tratamiento)
                </button>
              </div>

              <button
                onClick={() => setShowPointGuideWindow(!showPointGuideWindow)}
                className={`px-2.5 py-1 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer border ${
                  showPointGuideWindow ? 'bg-cyan-950 text-cyan-300 border-cyan-500/50' : 'bg-slate-800 text-slate-300 border-slate-700'
                }`}
              >
                <Eye size={12} />
                <span>{showPointGuideWindow ? 'Guía Flotante Activa' : 'Mostrar Guía Flotante de Puntos'}</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleRunAILandmarkDetection(true)}
                disabled={isAIDetectingLandmarks}
                className="px-3 py-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-xl text-xs shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                {isAIDetectingLandmarks ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                <span>Colocar Puntos con IA</span>
              </button>

              <button
                onClick={() => setNemoStep(5)}
                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-all shadow-sm flex items-center gap-1 cursor-pointer ml-2"
              >
                <span>Ver Resultados (Paso 5)</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        )}

        {nemoStep === 5 && (
          <div className="bg-slate-900/95 text-white border-b border-slate-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/40">
                <Award size={16} />
              </div>
              <div>
                <h4 className="font-bold text-white text-xs">Paso 5: Resultados {activeCephModel} & Comparativa IA</h4>
                <p className="text-slate-400 text-[11px]">Evaluación comparativa entre Trazado Inicial (Pre-Tratamiento) y Final (Post-Tratamiento).</p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={handleRunAIComparison}
                disabled={isComparingAI}
                className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isComparingAI ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} className="text-amber-300 animate-pulse" />}
                <span>Generar Comparación Evolutiva IA</span>
              </button>
            </div>
          </div>
        )}

        {/* The Core Image Box containing custom image & svg overlay math */}
        <div 
          ref={imageContainerRef}
          className="flex-1 min-h-[550px] lg:min-h-[720px] h-[550px] lg:h-[720px] bg-slate-950 flex items-center justify-center p-4 overflow-hidden relative"
        >
          {/* Floating AI Auto-Location Offer Banner */}
          {showAILoadBanner && (
            <div className="absolute top-4 left-4 z-30 bg-slate-900/90 backdrop-blur-md text-white border border-cyan-500/50 rounded-2xl p-3 shadow-2xl flex items-center gap-3 max-w-md w-[88%] animate-fade-in">
              <div className="p-2 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-xl text-white shrink-0 shadow-sm animate-pulse">
                <Sparkles size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                  Asistente Cefalométrico IA
                  <span className="text-[9px] bg-cyan-500/20 text-cyan-200 border border-cyan-400/30 px-1.5 py-0.5 rounded font-mono font-bold">
                    Visión Inteligente
                  </span>
                </p>
                <p className="text-[11px] text-slate-300 truncate">
                  ¿Ubicación automática de puntos Silla, Nasion, Puntos A/B y perfil blando?
                </p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => handleRunAILandmarkDetection(false)}
                  disabled={isAIDetectingLandmarks}
                  className="px-3 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  {isAIDetectingLandmarks ? <Loader2 size={13} className="animate-spin" /> : <Zap size={13} />}
                  <span>Autodetectar</span>
                </button>
                <button
                  onClick={() => setShowAILoadBanner(false)}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg cursor-pointer"
                  title="Cerrar sugerencia"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          {/* Floating AI Proposal Review Card */}
          {showAILandmarkProposal && aiLandmarksResult && (
            <div className="absolute bottom-4 left-4 z-30 bg-slate-900/95 backdrop-blur-md border-2 border-cyan-500/70 rounded-2xl p-3.5 text-white shadow-2xl max-w-sm w-[90%] space-y-2.5 animate-fade-in">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-cyan-500/20 text-cyan-400 rounded-lg border border-cyan-500/40">
                    <Bot size={16} />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs uppercase tracking-wider text-cyan-300">
                      Puntos Detectados por IA
                    </h4>
                    <p className="text-[10px] text-slate-300">
                      {aiLandmarksResult.summary || '23 puntos cefalométricos localizados.'}
                    </p>
                  </div>
                </div>
                <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 font-mono text-[10px] font-bold rounded-full flex items-center gap-1">
                  <CheckCircle2 size={11} className="text-cyan-400" />
                  {Math.round((aiLandmarksResult.confidenceAverage || 0.95) * 100)}%
                </span>
              </div>

              {/* Quick preview grid of key points */}
              <div className="grid grid-cols-2 gap-1 text-[10px] max-h-28 overflow-y-auto pr-1 bg-slate-950/80 p-1.5 rounded-xl border border-slate-800">
                {Object.entries(aiLandmarksResult.landmarks || {}).slice(0, 10).map(([key, item]: any) => (
                  <div key={key} className="flex justify-between items-center bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/50">
                    <span className="font-bold text-cyan-200">{key}:</span>
                    <span className="text-slate-400 font-mono text-[9px]">{item.x}, {item.y}</span>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={handleApplyAILandmarks}
                  className="flex-1 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Check size={14} />
                  <span>Aplicar Trazado IA</span>
                </button>
                <button
                  onClick={handleDismissAILandmarks}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Descartar
                </button>
              </div>
            </div>
          )}

          {/* Floating Controls Overlay on the radiography box */}
          <div className="absolute top-4 right-4 z-20 flex flex-col gap-2 bg-slate-900/95 backdrop-blur-md border border-slate-850 p-2 rounded-xl shadow-xl">
            <button
              onClick={() => setZoomScale(prev => Math.min(3.5, prev + 0.15))}
              className="p-2 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg transition-all cursor-pointer"
              title="Acercar (Zoom In)"
            >
              <ZoomIn size={15} />
            </button>
            <button
              onClick={() => setZoomScale(prev => Math.max(0.6, prev - 0.15))}
              className="p-2 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg transition-all cursor-pointer"
              title="Alejar (Zoom Out)"
            >
              <ZoomOut size={15} />
            </button>
            <button
              onClick={() => setActiveTool(activeTool === 'pan' ? 'select' : 'pan')}
              className={`p-2 rounded-lg transition-all cursor-pointer ${
                activeTool === 'pan' 
                  ? 'bg-blue-600 text-white shadow-sm' 
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
              title="Herramienta de Arrastre / Mano (Mover)"
            >
              <Hand size={15} />
            </button>
            {activeAnalysisTab === 'cephalometric' && (
              <button
                onClick={() => setShowPointGuideWindow((prev) => !prev)}
                className={`p-2 rounded-lg transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                  showPointGuideWindow
                    ? 'bg-cyan-600 text-white shadow-sm font-bold'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
                title="Abrir / Ocultar Ventana Flotante de Guía de Puntos"
              >
                <Compass size={15} />
                <span className="text-[8px] font-bold">Guía Puntos</span>
              </button>
            )}
            <div className="w-full h-px bg-slate-800 my-1" />
            <button
              onClick={handleCenterImage}
              className="p-2 hover:bg-slate-850 text-amber-400 hover:text-amber-300 rounded-lg transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5"
              title="Centrar Vista y Restablecer Zoom"
            >
              <RotateCcw size={14} />
              <span className="text-[9px] font-bold tracking-tight">Centrar</span>
            </button>
          </div>

          {/* Dynamic Image Filters & Zoom Container */}
          <div
            ref={editorViewportRef}
            style={{
              filter: `brightness(${brightness}%) contrast(${contrast}%) ${invert ? 'invert(100%)' : ''}`,
              transform: `rotate(${rotation}deg)`,
              transformOrigin: 'center center',
              transition: isDrawing || draggingLandmark ? 'none' : 'filter 0.2s ease, transform 0.2s ease-out',
              width: '100%',
              aspectRatio: '8/5'
            }}
            className="relative select-none rounded-xl overflow-hidden border border-slate-900 shadow-2xl bg-slate-900"
          >
            <svg
              ref={svgRef}
              viewBox="0 0 800 500"
              className={`w-full h-full relative ${activeTool === 'pan' ? (isPanning ? 'cursor-grabbing' : 'cursor-grab') : (activeTool === 'select' ? 'cursor-crosshair' : 'cursor-none')}`}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseLeave}
            >
              {/* Group wrapping all scalable content (radiography + drawings + measures + crosshair) so the card frame itself remains static */}
              <g id="zoom-pan-group" transform={`translate(${panOffset.x}, ${panOffset.y}) translate(400, 250) scale(${zoomScale}) translate(-400, -250)`}>
              {/* Render Layers dynamically in correct Z-index order based on layerOrder state (Photoshop style) */}
              {layerOrder.slice().reverse().map((layerId) => {
                if (layerId === 'radiography') {
                  return (
                    <g
                      key="layer-radiography"
                      id="layer-radiography"
                      opacity={radiographyLayer.opacity}
                      display={radiographyLayer.visible ? 'inline' : 'none'}
                      transform={`translate(${radiographyLayer.x}, ${radiographyLayer.y}) rotate(${radiographyLayer.rotation}, 400, 250) scale(${radiographyLayer.scale})`}
                    >
                      {renderXRayBaseTemplate()}
                    </g>
                  );
                }

                if (layerId === 'photo') {
                  return (
                    <g
                      key="layer-photo"
                      id="layer-photo"
                      opacity={photoLayer.opacity}
                      display={photoLayer.visible ? 'inline' : 'none'}
                      transform={`translate(${photoLayer.x}, ${photoLayer.y}) rotate(${photoLayer.rotation}, 400, 250) scale(${photoLayer.scale})`}
                    >
                      {photoLayer.imageUrl ? (
                        <image 
                          href={photoLayer.imageUrl} 
                          x="0" 
                          y="0" 
                          width="800" 
                          height="500" 
                          preserveAspectRatio="xMidYMid meet" 
                        />
                      ) : null}
                    </g>
                  );
                }

                if (layerId === 'tracings') {
                  return (
                    <g
                      key="layer-tracings"
                      id="layer-tracings"
                      opacity={tracingsLayer.opacity}
                      display={tracingsLayer.visible ? 'inline' : 'none'}
                      transform={`translate(${tracingsLayer.x}, ${tracingsLayer.y}) rotate(${tracingsLayer.rotation}, 400, 250) scale(${tracingsLayer.scale})`}
                    >
                      {/* OVERLAY MODE A: CEPHALOMETRICS */}
                              {activeAnalysisTab === 'cephalometric' && (
                        <g id="cephalometric-overlay-layer">
                          {/* Tracing lines linking key anatomical points and planes for Steiner Analysis */}
                          {/* Sella - Nasion (SN - Base Craneal) */}
                          {landmarks.S && landmarks.N && <line x1={landmarks.S.x} y1={landmarks.S.y} x2={landmarks.N.x} y2={landmarks.N.y} stroke="#3b82f6" strokeWidth="2.5" opacity="0.85" />}
                          
                          {/* Plano Palatino (PNS - ANS) */}
                          {landmarks.PNS && landmarks.ANS && <line x1={landmarks.PNS.x} y1={landmarks.PNS.y} x2={landmarks.ANS.x} y2={landmarks.ANS.y} stroke="#06b6d4" strokeWidth="2" strokeDasharray="5,3" opacity="0.85" />}

                          {/* Nasion - Punto A (N-A) */}
                          {landmarks.N && landmarks.A && <line x1={landmarks.N.x} y1={landmarks.N.y} x2={landmarks.A.x} y2={landmarks.A.y} stroke="#10b981" strokeWidth="2.5" opacity="0.85" />}
                          {/* Nasion - Punto B (N-B) */}
                          {landmarks.N && landmarks.B && <line x1={landmarks.N.x} y1={landmarks.N.y} x2={landmarks.B.x} y2={landmarks.B.y} stroke="#fbbf24" strokeWidth="2.5" opacity="0.85" />}
                          {/* Nasion - Punto D (N-D) */}
                          {landmarks.N && landmarks.D && <line x1={landmarks.N.x} y1={landmarks.N.y} x2={landmarks.D.x} y2={landmarks.D.y} stroke="#14b8a6" strokeWidth="2" strokeDasharray="3,3" opacity="0.8" />}
                          
                          {/* Sella - Punto L (S-L) */}
                          {landmarks.S && landmarks.L && <line x1={landmarks.S.x} y1={landmarks.S.y} x2={landmarks.L.x} y2={landmarks.L.y} stroke="#8b5cf6" strokeWidth="2" strokeDasharray="4,2" opacity="0.8" />}
                          {/* Sella - Punto E (S-E) */}
                          {landmarks.S && landmarks.E && <line x1={landmarks.S.x} y1={landmarks.S.y} x2={landmarks.E.x} y2={landmarks.E.y} stroke="#64748b" strokeWidth="2" strokeDasharray="4,2" opacity="0.8" />}

                          {/* Frankfort Plane (Po-Or) */}
                          {landmarks.Po && landmarks.Or && <line x1={landmarks.Po.x} y1={landmarks.Po.y} x2={landmarks.Or.x} y2={landmarks.Or.y} stroke="#ec4899" strokeWidth="2" opacity="0.75" />}
                          {/* Mandibular Plane (Go-Gn / Go-Me) */}
                          {landmarks.Go && (landmarks.Gn || landmarks.Me) && <line x1={landmarks.Go.x} y1={landmarks.Go.y} x2={(landmarks.Gn || landmarks.Me).x} y2={(landmarks.Gn || landmarks.Me).y} stroke="#a855f7" strokeWidth="2.5" opacity="0.85" />}
                          {/* Plano Oclusal (OcP-OcA) */}
                          {landmarks.OcP && landmarks.OcA && <line x1={landmarks.OcP.x} y1={landmarks.OcP.y} x2={landmarks.OcA.x} y2={landmarks.OcA.y} stroke="#6366f1" strokeWidth="2" strokeDasharray="4,2" opacity="0.8" />}
                          
                          {/* Upper Incisor Axis (U1r-U1t) */}
                          {landmarks.U1r && landmarks.U1t && <line x1={landmarks.U1r.x} y1={landmarks.U1r.y} x2={landmarks.U1t.x} y2={landmarks.U1t.y} stroke="#f43f5e" strokeWidth="2.5" opacity="0.9" />}
                          {/* Lower Incisor Axis (L1r-L1t) */}
                          {landmarks.L1r && landmarks.L1t && <line x1={landmarks.L1r.x} y1={landmarks.L1r.y} x2={landmarks.L1t.x} y2={landmarks.L1t.y} stroke="#f97316" strokeWidth="2.5" opacity="0.9" />}
                          
                          {/* Steiner S-Line (Pogs - Ns) */}
                          {landmarks.Pogs && landmarks.Ns && <line x1={landmarks.Pogs.x} y1={landmarks.Pogs.y} x2={landmarks.Ns.x} y2={landmarks.Ns.y} stroke="#d946ef" strokeWidth="2" strokeDasharray="4,4" opacity="0.85" />}

                          {/* AI LANDMARK AUTO-DETECTION SCANNING OVERLAY */}
                          {isAIDetectingLandmarks && (
                            <g id="ai-laser-scanner" style={{ pointerEvents: 'none' }}>
                              <rect x="0" y="0" width="800" height="500" fill="rgba(6, 182, 212, 0.12)" />
                              <line x1="0" y1="250" x2="800" y2="250" stroke="#00f0ff" strokeWidth="2.5" strokeDasharray="8,4" opacity="0.9" className="animate-pulse" />
                              <circle cx="400" cy="250" r="180" fill="none" stroke="#00f0ff" strokeWidth="1.5" strokeDasharray="6,6" opacity="0.5" />
                              <text x="400" y="240" fill="#00f0ff" fontSize="13" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle" className="animate-pulse">
                                ✨ ESCANEO CEREBRAL DE ESTRUCTURAS ANATÓMICAS...
                              </text>
                              <text x="400" y="260" fill="#a5f3fc" fontSize="10" fontFamily="monospace" textAnchor="middle">
                                Evaluando Silla, Nasion, Puntos A/B, Mentón e Incisivos
                              </text>
                            </g>
                          )}

                          {/* AI PROPOSED LANDMARKS OVERLAY PREVIEW */}
                          {showAILandmarkProposal && aiLandmarksResult?.landmarks && (
                            <g id="ai-proposed-landmarks-layer" style={{ pointerEvents: 'none' }}>
                              {Object.entries(aiLandmarksResult.landmarks).map(([k, item]: any) => (
                                <g key={`ai-prop-${k}`} transform={`translate(${item.x}, ${item.y})`}>
                                  <circle cx="0" cy="0" r="16" fill="#06b6d4" fillOpacity="0.2" stroke="#22d3ee" strokeWidth="2" className="animate-ping" />
                                  <circle cx="0" cy="0" r="10" fill="#0f172a" fillOpacity="0.9" stroke="#38bdf8" strokeWidth="2" />
                                  <circle cx="0" cy="0" r="3" fill="#38bdf8" />
                                  <g transform="translate(12, -14)">
                                    <rect x="0" y="-12" width={Math.max(54, k.length * 8 + 32)} height="16" rx="4" fill="#082f49" stroke="#0284c7" strokeWidth="1" />
                                    <text x="4" y="-1" fill="#7dd3fc" fontSize="9" fontWeight="bold" fontFamily="monospace">
                                      ✨{k} ({Math.round((item.confidence || 0.95) * 100)}%)
                                    </text>
                                  </g>
                                </g>
                              ))}
                            </g>
                          )}

                          {/* Render Draggable Precision Crosshair (+) Landmark Points */}
                          {(Object.entries(landmarks) as [string, { x: number; y: number }][]).map(([key, pt]) => {
                            const isDragging = draggingLandmark === key;
                            const isSelectedOrHovered = hoveredLandmarkKey === key || activeGuideLandmarkKey === key;

                            return (
                              <g 
                                key={key} 
                                transform={`translate(${pt.x}, ${pt.y})`}
                                className="cursor-crosshair group"
                                onMouseEnter={() => setHoveredLandmarkKey(key)}
                                onMouseLeave={() => setHoveredLandmarkKey(null)}
                                onClick={() => setActiveGuideLandmarkKey(key)}
                              >
                                {/* High visibility target indicator when active or hovered */}
                                {isSelectedOrHovered && (
                                  <g>
                                    <circle cx="0" cy="0" r="14" fill="rgba(0, 240, 255, 0.15)" stroke="#00f0ff" strokeWidth="1.5" className="animate-pulse" />
                                    <circle cx="0" cy="0" r="20" fill="none" stroke="#38bdf8" strokeWidth="1" strokeDasharray="3,3" />
                                    <g transform="translate(12, -12)">
                                      <rect x="0" y="-12" width={key.length * 8 + 22} height="15" rx="4" fill="#090d16" stroke="#00f0ff" strokeWidth="1" opacity="0.95" />
                                      <text x="4" y="-1" fill="#00f0ff" fontSize="10" fontWeight="bold" fontFamily="monospace">
                                        🎯 {key}
                                      </text>
                                    </g>
                                  </g>
                                )}

                                {/* Compact Precision Crosshair (+) with 1.5px hollow center for unobstructed anatomical view */}
                                {/* Dark Shadow/Contrast Lines */}
                                <line x1="0" y1={isDragging ? "-10" : "-6.5"} x2="0" y2="-1.5" stroke="#000000" strokeWidth="2.2" opacity="0.9" />
                                <line x1="0" y1="1.5" x2="0" y2={isDragging ? "10" : "6.5"} stroke="#000000" strokeWidth="2.2" opacity="0.9" />
                                <line x1={isDragging ? "-10" : "-6.5"} y1="0" x2="-1.5" y2="0" stroke="#000000" strokeWidth="2.2" opacity="0.9" />
                                <line x1="1.5" y1="0" x2={isDragging ? "10" : "6.5"} y2="0" stroke="#000000" strokeWidth="2.2" opacity="0.9" />

                                {/* High-Visibility Sharp Inner Crosshair Lines */}
                                <line x1="0" y1={isDragging ? "-10" : "-6.5"} x2="0" y2="-1.5" stroke={isDragging ? "#f43f5e" : isSelectedOrHovered ? "#fbbf24" : "#00f0ff"} strokeWidth="1.2" />
                                <line x1="0" y1="1.5" x2="0" y2={isDragging ? "10" : "6.5"} stroke={isDragging ? "#f43f5e" : isSelectedOrHovered ? "#fbbf24" : "#00f0ff"} strokeWidth="1.2" />
                                <line x1={isDragging ? "-10" : "-6.5"} y1="0" x2="-1.5" y2="0" stroke={isDragging ? "#f43f5e" : isSelectedOrHovered ? "#fbbf24" : "#00f0ff"} strokeWidth="1.2" />
                                <line x1="1.5" y1="0" x2={isDragging ? "10" : "6.5"} y2="0" stroke={isDragging ? "#f43f5e" : isSelectedOrHovered ? "#fbbf24" : "#00f0ff"} strokeWidth="1.2" />
                              </g>
                            );
                          })}
                        </g>
                      )}

                      {/* OVERLAY MODE B: SMILE & FACIAL AESTHETICS */}
                      {activeAnalysisTab === 'smile' && (
                        <g id="smile-aesthetics-layer">
                          {/* Facial Symmetry Midline */}
                          {showFacialGrid && (
                            <g stroke="#22d3ee" strokeWidth="1" opacity="0.5" strokeDasharray="3,3">
                              {/* Vertical facial center */}
                              <line x1="400" y1="0" x2="400" y2="500" strokeWidth="2.5" stroke="#f43f5e" />
                              {/* Interpupillary horizontal line */}
                              <line x1="0" y1="180" x2="800" y2="180" strokeWidth="1.5" />
                              {/* Subnasal base line */}
                              <line x1="0" y1="250" x2="800" y2="250" />
                              {/* Oral closure line */}
                              <line x1="0" y1="310" x2="800" y2="310" />
                              {/* Vertical limits */}
                              <line x1="220" y1="0" x2="220" y2="500" />
                              <line x1="580" y1="0" x2="580" y2="500" />
                            </g>
                          )}

                          {/* Golden Proportions concentric boxes */}
                          {showGoldenRatio && (
                            <g stroke="#eab308" strokeWidth="1.5" opacity="0.6" fill="none">
                              <rect x="340" y="220" width="120" height="150" rx="4" strokeWidth="2" />
                              <rect x="365" y="245" width="70" height="100" rx="2" />
                              <circle cx="400" cy="295" r="75" strokeDasharray="4,4" />
                              <text x="400" y="210" fill="#eab308" fontSize="11" fontWeight="bold" textAnchor="middle">Φ GOLDEN PROPORTIONS (1.618)</text>
                            </g>
                          )}

                          {/* Adjustable Bezier Smile Curve */}
                          {showSmileCurve && (
                            <g>
                              {/* Path drawn through Q quadratic curve */}
                              <path 
                                d={`M 260,280 Q 400,${smileCurvature} 540,280`} 
                                fill="none" 
                                stroke="#f43f5e" 
                                strokeWidth="4" 
                                strokeLinecap="round"
                                opacity="0.9" 
                              />
                              {/* Control handles */}
                              <circle cx="260" cy="280" r="5" fill="#f43f5e" />
                              <circle cx="540" cy="280" r="5" fill="#f43f5e" />
                              <circle cx="400" cy={(280 + smileCurvature) / 2} r="6" fill="#f43f5e" stroke="#ffffff" strokeWidth="1.5" />
                            </g>
                          )}

                          {/* Midline dental offset deviation lines representation */}
                          {midlineDeviation !== 0 && (
                            <g opacity="0.9">
                              {/* Lower shifted midline */}
                              <line 
                                x1={400 + midlineDeviation * 12} 
                                y1="285" 
                                x2={400 + midlineDeviation * 12} 
                                y2="335" 
                                stroke="#fb923c" 
                                strokeWidth="3" 
                              />
                              <text 
                                x={400 + midlineDeviation * 12} 
                                y="350" 
                                fill="#fb923c" 
                                fontSize="10" 
                                fontWeight="bold" 
                                fontFamily="monospace" 
                                textAnchor="middle"
                              >
                                LÍNEA INF ({midlineDeviation > 0 ? '+' : ''}{midlineDeviation}mm)
                              </text>
                            </g>
                          )}
                        </g>
                      )}

                      {/* SAVED DRAWING ANNOTATIONS (RULERS, FREEHAND, LABELS) */}
                      {measurementsVisible && annotations.map((ann) => {
                        const isSelected = ann.id === selectedAnnotationId;

                        if (ann.type === 'line' && ann.x1 !== undefined && ann.y1 !== undefined && ann.x2 !== undefined && ann.y2 !== undefined) {
                          const cx = (ann.x1 + ann.x2) / 2;
                          const cy = (ann.y1 + ann.y2) / 2;

                          return (
                            <g 
                              key={ann.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedAnnotationId(ann.id);
                              }}
                              className="cursor-pointer group"
                            >
                              {/* Selection Glow line when selected */}
                              {isSelected && (
                                <line
                                  x1={ann.x1}
                                  y1={ann.y1}
                                  x2={ann.x2}
                                  y2={ann.y2}
                                  stroke="#00f0ff"
                                  strokeWidth="10"
                                  opacity="0.4"
                                  className="animate-pulse"
                                />
                              )}

                              {/* Main Ruler Line */}
                              <line
                                x1={ann.x1}
                                y1={ann.y1}
                                x2={ann.x2}
                                y2={ann.y2}
                                stroke={isSelected ? '#00f0ff' : ann.color}
                                strokeWidth={isSelected ? '4' : '3.5'}
                                strokeLinecap="round"
                                opacity="0.9"
                              />

                              {/* Endpoint Precision Crosshairs (replacing simple circles for better visualization/alignment) */}
                              <g transform={`translate(${ann.x1}, ${ann.y1})`}>
                                <line x1="-8" y1="0" x2="8" y2="0" stroke={isSelected ? '#00f0ff' : ann.color} strokeWidth="1.5" />
                                <line x1="0" y1="-8" x2="0" y2="8" stroke={isSelected ? '#00f0ff' : ann.color} strokeWidth="1.5" />
                                <circle cx="0" cy="0" r="4.5" fill="none" stroke={isSelected ? '#00f0ff' : ann.color} strokeWidth="1" />
                                <circle cx="0" cy="0" r="1" fill={isSelected ? '#00f0ff' : ann.color} />
                              </g>
                              <g transform={`translate(${ann.x2}, ${ann.y2})`}>
                                <line x1="-8" y1="0" x2="8" y2="0" stroke={isSelected ? '#00f0ff' : ann.color} strokeWidth="1.5" />
                                <line x1="0" y1="-8" x2="0" y2="8" stroke={isSelected ? '#00f0ff' : ann.color} strokeWidth="1.5" />
                                <circle cx="0" cy="0" r="4.5" fill="none" stroke={isSelected ? '#00f0ff' : ann.color} strokeWidth="1" />
                                <circle cx="0" cy="0" r="1" fill={isSelected ? '#00f0ff' : ann.color} />
                              </g>

                              {/* Interactive Draggable Handle 1 (if selected) - Enhanced with Precision Crosshair */}
                              {isSelected && (
                                <g transform={`translate(${ann.x1}, ${ann.y1})`}>
                                  <circle cx="0" cy="0" r="16" fill="none" stroke="#00f0ff" strokeWidth="1.5" className="animate-ping" />
                                  <circle cx="0" cy="0" r="10" fill="none" stroke="#00f0ff" strokeWidth="1.5" />
                                  <line x1="-15" y1="0" x2="15" y2="0" stroke="#00f0ff" strokeWidth="2" />
                                  <line x1="0" y1="-15" x2="0" y2="15" stroke="#00f0ff" strokeWidth="2" />
                                  <circle cx="0" cy="0" r="2.5" fill="#0f172a" stroke="#00f0ff" strokeWidth="1.5" />
                                </g>
                              )}

                              {/* Interactive Draggable Handle 2 (if selected) - Enhanced with Precision Crosshair */}
                              {isSelected && (
                                <g transform={`translate(${ann.x2}, ${ann.y2})`}>
                                  <circle cx="0" cy="0" r="16" fill="none" stroke="#00f0ff" strokeWidth="1.5" className="animate-ping" />
                                  <circle cx="0" cy="0" r="10" fill="none" stroke="#00f0ff" strokeWidth="1.5" />
                                  <line x1="-15" y1="0" x2="15" y2="0" stroke="#00f0ff" strokeWidth="2" />
                                  <line x1="0" y1="-15" x2="0" y2="15" stroke="#00f0ff" strokeWidth="2" />
                                  <circle cx="0" cy="0" r="2.5" fill="#0f172a" stroke="#00f0ff" strokeWidth="1.5" />
                                </g>
                              )}

                              {/* mm Indicator bubble */}
                              <g transform={`translate(${cx}, ${cy - 14})`}>
                                <rect
                                  x="-40"
                                  y="-11"
                                  width="80"
                                  height="20"
                                  rx="5"
                                  fill="#0f172a"
                                  stroke={isSelected ? '#00f0ff' : ann.color}
                                  strokeWidth={isSelected ? '2' : '1.2'}
                                />
                                <text
                                  fill="#ffffff"
                                  fontSize="10"
                                  fontWeight="bold"
                                  fontFamily="monospace"
                                  textAnchor="middle"
                                  y="3"
                                >
                                  {ann.text ? `${ann.text}: ` : ''}{ann.lengthMm} mm
                                </text>
                              </g>
                            </g>
                          );
                        }

                        if (ann.type === 'pencil' && ann.points && ann.points.length > 0) {
                          const pathD = ann.points.reduce(
                            (acc, p, index) => (index === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`),
                            ''
                          );
                          return (
                            <path
                              key={ann.id}
                              d={pathD}
                              fill="none"
                              stroke={ann.color}
                              strokeWidth="3.2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              opacity="0.85"
                            />
                          );
                        }

                        if (ann.type === 'text' && ann.x !== undefined && ann.y !== undefined) {
                          return (
                            <g key={ann.id} transform={`translate(${ann.x}, ${ann.y})`}>
                              <circle cx="0" cy="0" r="4.5" fill={ann.color} />
                              <rect
                                x="8"
                                y="-12"
                                width={Math.max(70, (ann.text?.length ?? 8) * 7.5)}
                                height="20"
                                rx="4"
                                fill="#0f172a"
                                stroke={ann.color}
                                strokeWidth="1"
                              />
                              <text
                                x="13"
                                y="2"
                                fill="#ffffff"
                                fontSize="10"
                                fontWeight="semibold"
                                fontFamily="sans-serif"
                              >
                                {ann.text}
                              </text>
                            </g>
                          );
                        }

                        return null;
                      })}

                      {/* LIVE DRAWING RANGE OVERLAY */}
                      {(currentRangeBox || selectedRangeBox) && (
                        <g id="range-selection-overlay">
                          {(() => {
                            const r = currentRangeBox || selectedRangeBox;
                            if (!r) return null;
                            const x = Math.min(r.x1, r.x2);
                            const y = Math.min(r.y1, r.y2);
                            const w = Math.abs(r.x2 - r.x1);
                            const h = Math.abs(r.y2 - r.y1);
                            const diagPx = Math.hypot(w, h);
                            const diagMm = Math.round((diagPx / pixelsPerMm) * 10) / 10;

                            return (
                              <g>
                                <rect
                                  x={x}
                                  y={y}
                                  width={Math.max(10, w)}
                                  height={Math.max(10, h)}
                                  fill="rgba(6, 182, 212, 0.12)"
                                  stroke="#00f0ff"
                                  strokeWidth="1.8"
                                  strokeDasharray="6,4"
                                  rx="4"
                                />
                                <line x1={r.x1} y1={r.y1} x2={r.x2} y2={r.y2} stroke="#38bdf8" strokeWidth="2.5" />
                                <g transform={`translate(${r.x1}, ${r.y1})`}>
                                  <line x1="-7" y1="0" x2="7" y2="0" stroke="#38bdf8" strokeWidth="1.5" />
                                  <line x1="0" y1="-7" x2="0" y2="7" stroke="#38bdf8" strokeWidth="1.5" />
                                  <circle cx="0" cy="0" r="3.5" fill="none" stroke="#38bdf8" strokeWidth="1" />
                                </g>
                                <g transform={`translate(${r.x2}, ${r.y2})`}>
                                  <line x1="-7" y1="0" x2="7" y2="0" stroke="#38bdf8" strokeWidth="1.5" />
                                  <line x1="0" y1="-7" x2="0" y2="7" stroke="#38bdf8" strokeWidth="1.5" />
                                  <circle cx="0" cy="0" r="3.5" fill="none" stroke="#38bdf8" strokeWidth="1" />
                                </g>
                                <g transform={`translate(${(r.x1 + r.x2) / 2}, ${Math.min(r.y1, r.y2) - 12})`}>
                                  <rect x="-50" y="-10" width="100" height="18" rx="4" fill="#082f49" stroke="#0284c7" strokeWidth="1" />
                                  <text x="0" y="2" fill="#7dd3fc" fontSize="10" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                                    Rango: {diagMm} mm
                                  </text>
                                </g>
                              </g>
                            );
                          })()}
                        </g>
                      )}

                      {/* MAGNETIC SNAP RING OVERLAY */}
                      {snapTarget && (
                        <g transform={`translate(${snapTarget.x}, ${snapTarget.y})`} style={{ pointerEvents: 'none' }}>
                          <circle cx="0" cy="0" r="16" fill="none" stroke="#00f0ff" strokeWidth="2" className="animate-ping" />
                          <circle cx="0" cy="0" r="6" fill="#00f0ff" stroke="#0f172a" strokeWidth="1.5" />
                          <g transform="translate(10, -12)">
                            <rect x="0" y="-12" width={snapTarget.label.length * 7.5 + 16} height="16" rx="4" fill="#0f172a" stroke="#00f0ff" strokeWidth="1" />
                            <text x="5" y="-1" fill="#00f0ff" fontSize="9" fontWeight="bold" fontFamily="sans-serif">
                              🎯 {snapTarget.label}
                            </text>
                          </g>
                        </g>
                      )}

                      {/* LIVE DRAWING FEEDBACK SHAPES */}
                      {activeTool === 'line' && currentLine && (
                        <g>
                          <line
                            x1={currentLine.x1}
                            y1={currentLine.y1}
                            x2={currentLine.x2}
                            y2={currentLine.y2}
                            stroke={activeColor}
                            strokeWidth="2.5"
                            strokeDasharray="4,4"
                          />
                          <g transform={`translate(${currentLine.x1}, ${currentLine.y1})`}>
                            <line x1="-7" y1="0" x2="7" y2="0" stroke={activeColor} strokeWidth="1.5" />
                            <line x1="0" y1="-7" x2="0" y2="7" stroke={activeColor} strokeWidth="1.5" />
                            <circle cx="0" cy="0" r="3.5" fill="none" stroke={activeColor} strokeWidth="1" />
                          </g>
                          <g transform={`translate(${currentLine.x2}, ${currentLine.y2})`}>
                            <line x1="-7" y1="0" x2="7" y2="0" stroke={activeColor} strokeWidth="1.5" />
                            <line x1="0" y1="-7" x2="0" y2="7" stroke={activeColor} strokeWidth="1.5" />
                            <circle cx="0" cy="0" r="3.5" fill="none" stroke={activeColor} strokeWidth="1" />
                          </g>
                        </g>
                      )}

                      {activeTool === 'pencil' && currentPencilPoints.length > 1 && (
                        <path
                          d={currentPencilPoints.reduce(
                            (acc, p, idx) => (idx === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`),
                            ''
                          )}
                          fill="none"
                          stroke={activeColor}
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      )}
                    </g>
                  );
                }

                return null;
              })}

              {/* PRECISION CROSSHAIR & REAL-TIME COORDINATES */}
              {activeTool !== 'select' && activeTool !== 'pan' && hoverCoords && (
                <g style={{ pointerEvents: 'none' }}>
                  {/* Localized crosshair lines centered at cursor */}
                  <line
                    x1={hoverCoords.x - 20}
                    y1={hoverCoords.y}
                    x2={hoverCoords.x + 20}
                    y2={hoverCoords.y}
                    stroke={activeColor}
                    strokeWidth="1.5"
                    strokeDasharray="2,2"
                    opacity="0.9"
                  />
                  <line
                    x1={hoverCoords.x}
                    y1={hoverCoords.y - 20}
                    x2={hoverCoords.x}
                    y2={hoverCoords.y + 20}
                    stroke={activeColor}
                    strokeWidth="1.5"
                    strokeDasharray="2,2"
                    opacity="0.9"
                  />
                  {/* Outer ring */}
                  <circle
                    cx={hoverCoords.x}
                    cy={hoverCoords.y}
                    r="6"
                    fill="none"
                    stroke={activeColor}
                    strokeWidth="1.5"
                    opacity="0.9"
                  />
                  {/* Center dot */}
                  <circle
                    cx={hoverCoords.x}
                    cy={hoverCoords.y}
                    r="1.5"
                    fill={activeColor}
                  />
                  {/* Real-time coordinates bubble with dynamic edge boundary adjustments */}
                  <g transform={`translate(${hoverCoords.x + 14 + 76 > 800 ? hoverCoords.x - 90 : hoverCoords.x + 14}, ${hoverCoords.y - 14 < 15 ? hoverCoords.y + 20 : hoverCoords.y - 14})`}>
                    {/* Background label bubble with elegant dark tone */}
                    <rect
                      x="0"
                      y="-12"
                      width="76"
                      height="18"
                      rx="4"
                      fill="#0f172a"
                      fillOpacity="0.85"
                      stroke={activeColor}
                      strokeWidth="1"
                    />
                    <text
                      x="38"
                      y="1"
                      fill="#ffffff"
                      fontSize="9.5"
                      fontWeight="bold"
                      fontFamily="monospace"
                      textAnchor="middle"
                    >
                      X:{hoverCoords.x} Y:{hoverCoords.y}
                    </text>
                  </g>
                </g>
              )}
              </g>
            </svg>
          </div>

          {/* NEMOSTUDIO FLOATING LANDMARK PLACEMENT GUIDE OVERLAY (GuideOverlay) */}
          {nemoStep === 4 && showPointGuideWindow && (
            <div className="absolute bottom-4 right-4 z-40 animate-fade-in">
              <GuideOverlay
                activeLandmarkKey={activeGuideLandmarkKey}
                landmarks={landmarks}
                activeAnalysisModel={activeCephModel}
                onSelectLandmarkKey={(key) => setActiveGuideLandmarkKey(key)}
                onUpdateCoordinates={(key, newX, newY) => {
                  setLandmarks((prev) => ({
                    ...prev,
                    [key]: { x: newX, y: newY }
                  }));
                }}
                onClose={() => setShowPointGuideWindow(false)}
              />
            </div>
          )}
        </div>

        {/* Viewport Footer telemetry */}
        <div className="px-4 py-2.5 bg-white border-t border-slate-200 flex flex-wrap justify-between text-xs text-slate-500 font-mono">
          <div className="flex items-center gap-4">
            <span>Modo Activo: <b className="text-blue-600 uppercase font-bold">{activeAnalysisTab === 'cephalometric' ? 'Cefalometría' : activeAnalysisTab === 'smile' ? 'Análisis Sonrisa' : 'Filtros & Dibujo'}</b></span>
            <span>Anotaciones: <b>{annotations.length}</b></span>
          </div>
          <div className="flex items-center gap-4">
            <span>Filtros: Brillo {brightness}% | Contr. {contrast}%</span>
            <span>Invertido: <b>{invert ? 'SÍ' : 'NO'}</b></span>
            {currentImageUrl.startsWith('data:image/') ? (
              <span className="text-blue-600 font-bold">● ARCHIVO CARGADO</span>
            ) : (
              <span className="text-slate-400">● MODO PLANTILLA</span>
            )}
          </div>
        </div>
      </div>

      {/* 2. DYNAMIC WORKSPACE TOOLBARS (RIGHT SIDE - COLLAPSIBLE SIDEBAR PANEL) */}
      {isSidebarCollapsed ? (
        /* COLLAPSED DOCK BAR */
        <div className="w-14 flex flex-col items-center gap-3 shrink-0 bg-white border border-slate-200 rounded-2xl p-2 shadow-sm transition-all duration-300">
          <button
            onClick={() => setIsSidebarCollapsed(false)}
            className="w-10 h-10 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 flex items-center justify-center transition-all cursor-pointer shadow-xs"
            title="Expandir Panel Lateral"
          >
            <PanelRightOpen size={18} />
          </button>

          <div className="w-full h-px bg-slate-200 my-1" />

          <button
            onClick={() => { setActiveAnalysisTab('filters'); setIsSidebarCollapsed(false); }}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
              activeAnalysisTab === 'filters' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
            }`}
            title="Ajustes y Filtros"
          >
            <Sliders size={18} />
          </button>

          <button
            onClick={() => { setActiveAnalysisTab('measurements'); setIsSidebarCollapsed(false); }}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
              activeAnalysisTab === 'measurements' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
            }`}
            title="Trazos y Anotaciones"
          >
            <PenTool size={18} />
          </button>

          <button
            onClick={() => { setActiveAnalysisTab('cephalometric'); setIsSidebarCollapsed(false); }}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
              activeAnalysisTab === 'cephalometric' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
            }`}
            title="Cefalometría de Steiner"
          >
            <Compass size={18} />
          </button>

          <button
            onClick={() => { setActiveAnalysisTab('smile'); setIsSidebarCollapsed(false); }}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
              activeAnalysisTab === 'smile' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
            }`}
            title="Análisis de Sonrisa"
          >
            <Camera size={18} />
          </button>

          <button
            onClick={() => { setActiveAnalysisTab('layers'); setIsSidebarCollapsed(false); }}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
              activeAnalysisTab === 'layers' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
            }`}
            title="Gestión de Capas (Drag & Drop)"
          >
            <Layers size={18} />
          </button>

          <button
            onClick={() => { setActiveAnalysisTab('report'); setIsSidebarCollapsed(false); }}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
              activeAnalysisTab === 'report' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
            }`}
            title="Reporte e Informe"
          >
            <Award size={18} />
          </button>
        </div>
      ) : (
        /* EXPANDED SIDEBAR PANEL */
        <div className="w-full xl:w-[320px] 2xl:w-[360px] h-full flex flex-col gap-2 shrink-0 overflow-hidden bg-slate-50/50 p-0.5 rounded-xl">
          
          {/* Header with Collapse Button */}
          <div className="bg-white border border-slate-200 rounded-xl p-2 shadow-2xs flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <span className="p-1 bg-blue-50 text-blue-600 rounded-md">
                <Compass size={15} />
              </span>
              <span className="text-xs font-bold text-slate-800">Panel de Herramientas</span>
            </div>
            <button
              onClick={() => setIsSidebarCollapsed(true)}
              className="p-1 hover:bg-slate-100 rounded-md text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              title="Colapsar Panel Lateral"
            >
              <PanelRightClose size={16} />
            </button>
          </div>

          {/* Layer Selection Tab bar */}
          <div className="bg-white border border-slate-200 rounded-xl p-1 shadow-2xs flex flex-wrap gap-1 shrink-0">
            <button
              onClick={() => setActiveAnalysisTab('filters')}
              className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold flex flex-col items-center gap-0.5 transition-all cursor-pointer min-w-[55px] ${
                activeAnalysisTab === 'filters'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Sliders size={14} />
              <span>Ajustes</span>
            </button>
            
            <button
              onClick={() => setActiveAnalysisTab('measurements')}
              className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold flex flex-col items-center gap-0.5 transition-all cursor-pointer min-w-[55px] ${
                activeAnalysisTab === 'measurements'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <PenTool size={14} />
              <span>Trazos</span>
            </button>

            <button
              onClick={() => setActiveAnalysisTab('cephalometric')}
              className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold flex flex-col items-center gap-0.5 transition-all cursor-pointer min-w-[55px] ${
                activeAnalysisTab === 'cephalometric'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Compass size={14} />
              <span>Cefalometría</span>
            </button>

            <button
              onClick={() => setActiveAnalysisTab('smile')}
              className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold flex flex-col items-center gap-0.5 transition-all cursor-pointer min-w-[55px] ${
                activeAnalysisTab === 'smile'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Camera size={14} />
              <span>Sonrisa</span>
            </button>

            <button
              onClick={() => setActiveAnalysisTab('layers')}
              className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold flex flex-col items-center gap-0.5 transition-all cursor-pointer min-w-[55px] ${
                activeAnalysisTab === 'layers'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Layers size={14} />
              <span>Capas</span>
            </button>

            <button
              onClick={() => setActiveAnalysisTab('report')}
              className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold flex flex-col items-center gap-0.5 transition-all cursor-pointer min-w-[55px] ${
                activeAnalysisTab === 'report'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Award size={14} />
              <span>Reporte</span>
            </button>
          </div>

          {/* INTERNAL SCROLLABLE SUB-PANELS CONTAINER */}
          <div className="flex-1 h-0 overflow-y-auto space-y-3 pr-0.5">

        {/* FEEDBACK BANNER */}
        {editorMessage && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-2xl text-xs font-medium animate-fade-in flex items-center gap-2">
            <Zap size={14} className="text-emerald-500 animate-pulse" />
            <span>{editorMessage}</span>
          </div>
        )}

        {/* SUB-PANEL: PHOTOSHOP-STYLE LAYERS CONTROL PANEL */}
        {activeAnalysisTab === 'layers' && (() => {
          const activeOpacity = activeLayerToManipulate === 'tracings' 
            ? tracingsLayer.opacity 
            : activeLayerToManipulate === 'photo' 
              ? photoLayer.opacity 
              : radiographyLayer.opacity;

          const handleActiveOpacityChange = (val: number) => {
            if (activeLayerToManipulate === 'tracings') {
              setTracingsLayer(prev => ({ ...prev, opacity: val }));
            } else if (activeLayerToManipulate === 'photo') {
              setPhotoLayer(prev => ({ ...prev, opacity: val }));
            } else if (activeLayerToManipulate === 'radiography') {
              setRadiographyLayer(prev => ({ ...prev, opacity: val }));
            }
          };

          return (
            <div className="bg-[#2d2d2d] border border-[#1a1a1a] rounded-xl overflow-hidden shadow-2xl font-sans text-slate-200 select-none">
              {/* Layer Panel Header */}
              <div className="bg-[#202020] px-3 py-2 border-b border-[#181818] flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 font-bold text-slate-100">
                  <Layers size={15} className="text-blue-400" />
                  <span>Gestión de Capas (Drag & Drop)</span>
                </div>
                <span className="text-[10px] font-mono bg-[#141414] px-2 py-0.5 rounded text-slate-400 border border-[#383838]">
                  {layerOrder.length} Capas
                </span>
              </div>

              {/* Active Layer Opacity Slider */}
              <div className="bg-[#242424] p-3 border-b border-[#181818] space-y-1.5 text-xs">
                <div className="flex justify-between items-center text-[11px] font-medium text-slate-300">
                  <span>Opacidad de Capa Activa:</span>
                  <span className="font-bold font-mono text-blue-400">{Math.round(activeOpacity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.02"
                  value={activeOpacity}
                  onChange={(e) => handleActiveOpacityChange(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-[#141414] rounded appearance-none cursor-pointer accent-blue-500"
                />
              </div>

              {/* Main Drag & Drop Layer Stack List */}
              <div className="bg-[#1c1c1c] divide-y divide-[#282828] max-h-[380px] overflow-y-auto">
                {layerOrder.map((layerId, idx) => {
                  const isSelected = activeLayerToManipulate === layerId;
                  
                  let title = '';
                  let subtitle = '';
                  let isVisible = true;
                  let toggleVisibility = () => {};
                  let opacityVal = 1;
                  let thumbnail = null;
                  let isLocked = false;
                  if (layerId === 'tracings') {
                    isLocked = tracingsLayer.locked;
                  } else if (layerId === 'photo') {
                    isLocked = photoLayer.locked;
                  } else if (layerId === 'radiography') {
                    isLocked = radiographyLayer.locked;
                  }

                  if (layerId === 'tracings') {
                    title = 'Capa 3 - Trazos y Cefalometría';
                    subtitle = 'Vectores y Medidas';
                    opacityVal = tracingsLayer.opacity;
                    isVisible = tracingsLayer.visible;
                    toggleVisibility = () => {
                      const next = { ...tracingsLayer, visible: !tracingsLayer.visible };
                      setTracingsLayer(next);
                      saveToHistory(undefined, undefined, undefined, undefined, next, undefined);
                    };
                    thumbnail = (
                      <div className="w-8 h-7 bg-[#121212] border border-[#3a3a3a] rounded-xs flex items-center justify-center shrink-0 relative overflow-hidden">
                        <svg viewBox="0 0 40 30" className="w-full h-full p-0.5">
                          <line x1="5" y1="20" x2="20" y2="8" stroke="#00f0ff" strokeWidth="2" />
                          <line x1="20" y1="8" x2="35" y2="22" stroke="#3b82f6" strokeWidth="2" />
                          <circle cx="20" cy="8" r="2.5" fill="#f59e0b" />
                        </svg>
                      </div>
                    );
                  } else if (layerId === 'photo') {
                    title = 'Capa 2 - Foto de Perfil Paciente';
                    subtitle = photoLayer.imageUrl ? 'Imagen adjunta' : 'Silueta predeterminada';
                    opacityVal = photoLayer.opacity;
                    isVisible = photoLayer.visible;
                    toggleVisibility = () => {
                      const next = { ...photoLayer, visible: !photoLayer.visible };
                      setPhotoLayer(next);
                      saveToHistory(undefined, undefined, undefined, next, undefined, undefined);
                    };
                    thumbnail = (
                      <div className="w-8 h-7 bg-[#121212] border border-[#3a3a3a] rounded-xs flex items-center justify-center shrink-0 overflow-hidden relative">
                        {photoLayer.imageUrl ? (
                          <img src={photoLayer.imageUrl} alt="Perfil" className="w-full h-full object-cover" />
                        ) : (
                          <Camera size={13} className="text-amber-400" />
                        )}
                      </div>
                    );
                  } else if (layerId === 'radiography') {
                    title = 'Fondo - Radiografía Base';
                    subtitle = 'Imagen médica principal';
                    opacityVal = radiographyLayer.opacity;
                    isVisible = radiographyLayer.visible;
                    toggleVisibility = () => {
                      const next = { ...radiographyLayer, visible: !radiographyLayer.visible };
                      setRadiographyLayer(next);
                      saveToHistory(undefined, undefined, next, undefined, undefined, undefined);
                    };
                    thumbnail = (
                      <div className="w-8 h-7 bg-[#0a0a0c] border border-[#3a3a3a] rounded-xs flex items-center justify-center shrink-0 overflow-hidden">
                        {study.imageUrl ? (
                          <img src={study.imageUrl} alt="Radiografía" className="w-full h-full object-cover opacity-85" />
                        ) : (
                          <FileImage size={13} className="text-slate-400" />
                        )}
                      </div>
                    );
                  }

                  return (
                    <div
                      key={layerId}
                      onClick={() => setActiveLayerToManipulate(layerId as any)}
                      draggable={true}
                      onDragStart={(e) => {
                        setDraggedLayerIndex(idx);
                        e.dataTransfer.effectAllowed = "move";
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        if (draggedOverLayerIndex !== idx) setDraggedOverLayerIndex(idx);
                      }}
                      onDragLeave={() => {
                        if (draggedOverLayerIndex === idx) setDraggedOverLayerIndex(null);
                      }}
                      onDragEnd={() => {
                        setDraggedLayerIndex(null);
                        setDraggedOverLayerIndex(null);
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        handleLayerDrop(idx);
                      }}
                      className={`flex items-center justify-between px-3 py-2.5 transition-all cursor-grab active:cursor-grabbing select-none relative ${
                        draggedOverLayerIndex === idx
                          ? 'bg-blue-900/40 border-2 border-dashed border-blue-400' 
                          : isSelected 
                          ? 'bg-[#383838] border-l-4 border-blue-500 text-white font-medium shadow-inner' 
                          : 'bg-[#1e1e1e] hover:bg-[#282828] text-slate-300'
                      }`}
                    >
                      {/* Left: Drag Handle + Eye + Thumbnail + Title */}
                      <div className="flex items-center gap-2 min-w-0">
                        <span title="Arrastrar para reordenar"><GripVertical size={16} className="text-slate-500 hover:text-white shrink-0 cursor-grab" /></span>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleVisibility();
                          }}
                          className={`p-1 rounded hover:bg-[#444] transition-colors cursor-pointer shrink-0 ${isVisible ? 'text-slate-100' : 'text-slate-600'}`}
                          title={isVisible ? "Ocultar Capa" : "Mostrar Capa"}
                        >
                          <Eye size={13} className={isVisible ? "opacity-100 text-blue-400" : "opacity-30"} />
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleLayerLock(layerId as any);
                          }}
                          className={`p-1 rounded hover:bg-[#444] transition-colors cursor-pointer shrink-0 ${isLocked ? 'text-amber-400' : 'text-slate-600'}`}
                          title={isLocked ? "Desbloquear Capa" : "Bloquear Capa"}
                        >
                          {isLocked ? <Lock size={12} className="text-amber-400 animate-pulse-subtle" /> : <Unlock size={12} className="opacity-35 hover:opacity-100 text-slate-400" />}
                        </button>

                        {thumbnail}

                        <div className="flex flex-col min-w-0">
                          <span className={`text-[11px] truncate leading-snug ${isSelected ? 'text-white font-semibold' : 'text-slate-200'}`}>
                            {title}
                          </span>
                          <span className="text-[9px] text-slate-400 font-mono">
                            Opacidad {Math.round(opacityVal * 100)}%
                          </span>
                        </div>
                      </div>

                      {/* Right: Reorder Controls */}
                      <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                        <div className="flex flex-col gap-0.5">
                          <button
                            onClick={() => reorderLayer(layerId, 'up')}
                            disabled={idx === 0}
                            className="text-slate-400 hover:text-white disabled:opacity-20 p-0.5 cursor-pointer"
                            title="Subir Capa"
                          >
                            <ChevronUp size={11} />
                          </button>
                          <button
                            onClick={() => reorderLayer(layerId, 'down')}
                            disabled={idx === layerOrder.length - 1}
                            className="text-slate-400 hover:text-white disabled:opacity-20 p-0.5 cursor-pointer"
                            title="Bajar Capa"
                          >
                            <ChevronDown size={11} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Photo Upload helper bar when photo layer selected */}
              {activeLayerToManipulate === 'photo' && (
                <div className="bg-[#242424] px-3 py-2 border-t border-[#1a1a1a] flex items-center justify-between text-[11px]">
                  <span className="text-amber-400 font-semibold flex items-center gap-1.5">
                    <Camera size={12} /> Cargar Foto del Paciente
                  </span>
                  {photoLayer.imageUrl ? (
                    <button
                      onClick={() => {
                        setPhotoLayer(prev => ({ ...prev, imageUrl: '' }));
                        saveToHistory(undefined, undefined, undefined, { ...photoLayer, imageUrl: '' }, undefined, undefined);
                      }}
                      className="text-red-400 hover:text-red-300 font-bold underline cursor-pointer"
                    >
                      Remover foto
                    </button>
                  ) : (
                    <label className="text-blue-400 hover:text-blue-300 font-bold underline cursor-pointer flex items-center gap-1">
                      <Upload size={11} /> Seleccionar Archivo
                      <input type="file" accept="image/*" onChange={handlePhotoLayerUpload} className="hidden" />
                    </label>
                  )}
                </div>
              )}

              {/* 6. Photoshop Toolbar Footer Bar */}
              <div className="bg-[#1a1a1a] px-3 py-2 border-t border-[#121212] flex items-center justify-between text-slate-400 text-xs">
                <div className="flex items-center gap-3">
                  <button className="hover:text-slate-100 transition-colors cursor-pointer" title="Enlazar Capas">
                    <span className="font-mono text-[11px]">🔗</span>
                  </button>
                  <button className="hover:text-slate-100 transition-colors font-serif text-[11px] font-bold cursor-pointer" title="Efectos de Capa (fx)">
                    fx
                  </button>
                  <button className="hover:text-slate-100 transition-colors cursor-pointer" title="Añadir Máscara de Capa">
                    <span className="text-[11px]">📷</span>
                  </button>
                  <button className="hover:text-slate-100 transition-colors cursor-pointer" title="Crear Capa de Ajuste">
                    <Sliders size={12} />
                  </button>
                  <button className="hover:text-slate-100 transition-colors cursor-pointer" title="Crear Grupo Nuevo">
                    <Folder size={12} />
                  </button>
                  <button 
                    onClick={() => {
                      setEditorMessage("Capa Duplicada / Activa");
                      setTimeout(() => setEditorMessage(null), 2500);
                    }}
                    className="hover:text-slate-100 transition-colors cursor-pointer" 
                    title="Crear Nueva Capa"
                  >
                    <Plus size={13} />
                  </button>
                </div>

                <button
                  onClick={handleClearAnnotations}
                  disabled={annotations.length === 0}
                  className="hover:text-red-400 text-slate-400 disabled:opacity-20 transition-colors cursor-pointer"
                  title="Limpiar trazados de la capa seleccionada"
                >
                  <Trash2 size={13} />
                </button>
              </div>

              {/* History / Undo Bar in Photoshop Footer */}
              <div className="bg-[#141414] px-3 py-1.5 border-t border-[#0d0d0d] flex items-center justify-between text-[10px] text-slate-400 font-mono">
                <span>Historial: {historyIndex + 1}/{historyStack.length}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleUndo}
                    disabled={historyIndex <= 0}
                    className="hover:text-slate-100 disabled:opacity-30 flex items-center gap-1 cursor-pointer"
                  >
                    <Undo size={10} /> Deshacer
                  </button>
                  <button
                    onClick={handleRedo}
                    disabled={historyIndex >= historyStack.length - 1}
                    className="hover:text-slate-100 disabled:opacity-30 flex items-center gap-1 cursor-pointer"
                  >
                    <Redo size={10} /> Rehacer
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

        {/* SUB-PANEL A: RADIOGRAPHIC ADJUSTMENTS & FILTERS */}
        {activeAnalysisTab === 'filters' && (
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-4">
            <h4 className="text-slate-800 font-bold text-xs uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
              <Sliders size={14} className="text-blue-500" />
              Ajustes de Imagen Radiológica
            </h4>

            <div className="space-y-4">
              {/* Brightness */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-600">Brillo</span>
                  <span className="text-blue-600 font-mono">{brightness}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="190"
                  value={brightness}
                  onChange={(e) => setBrightness(Number(e.target.value))}
                  className="w-full accent-blue-600 h-1.5 bg-slate-100 rounded-lg cursor-pointer"
                />
              </div>

              {/* Contrast */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-600">Contraste</span>
                  <span className="text-blue-600 font-mono">{contrast}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="190"
                  value={contrast}
                  onChange={(e) => setContrast(Number(e.target.value))}
                  className="w-full accent-blue-600 h-1.5 bg-slate-100 rounded-lg cursor-pointer"
                />
              </div>

              {/* Rotation & Color Inversion */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => setInvert(!invert)}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                    invert 
                      ? 'bg-blue-50 border-blue-300 text-blue-700 font-bold' 
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                  title="Invertir negativos (ideal para fisuras radiculares)"
                >
                  <RefreshCw size={13} />
                  Negativo
                </button>

                <button
                  onClick={() => setRotation((prev) => (prev + 90) % 360)}
                  className="py-2 px-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                >
                  <RotateCw size={13} />
                  Rotar 90°
                </button>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleResetFilters}
                  className="flex-1 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-500 hover:text-slate-750 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                >
                  <RotateCcw size={13} />
                  Restablecer
                </button>
                <button
                  onClick={handleRestoreTemplate}
                  className="flex-1 py-2 bg-white hover:bg-red-50 border border-red-200 text-red-500 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                  title="Borra la imagen adjunta y vuelve al dibujo clínico predeterminado"
                >
                  <Trash2 size={13} />
                  Restaurar Vector
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SUB-PANEL B: DRAWING & MEASUREMENTS */}
        {activeAnalysisTab === 'measurements' && (
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-4">
            <h4 className="text-slate-800 font-bold text-xs uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
              <PenTool size={14} className="text-blue-500" />
              Herramientas de Trazado y Medición
            </h4>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setActiveTool('select')}
                  className={`py-2 px-2 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${
                    activeTool === 'select'
                      ? 'bg-blue-50 text-blue-600 border-blue-300 font-bold'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <Maximize2 size={15} />
                  <span>Navegar / Seleccionar</span>
                </button>

                <button
                  onClick={() => setActiveTool('pan')}
                  className={`py-2 px-2 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${
                    activeTool === 'pan'
                      ? 'bg-blue-50 text-blue-600 border-blue-300 font-bold'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                  title="Permite mover la imagen arrastrándola"
                >
                  <Hand size={15} className="text-blue-500" />
                  <span>Mano (Mover)</span>
                </button>

                <button
                  onClick={() => setActiveTool('line')}
                  className={`py-2 px-2 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${
                    activeTool === 'line'
                      ? 'bg-blue-50 text-blue-600 border-blue-300 font-bold'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                  title="Dibuja una regla en la radiografía para medir la distancia real en mm"
                >
                  <Scale size={15} />
                  <span>Colocar Regla</span>
                </button>

                <button
                  onClick={() => setActiveTool('join_points')}
                  className={`py-2 px-2 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${
                    activeTool === 'join_points'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300 font-bold'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                  title="Haz clic en 2 puntos cefalométricos o marcas para unirlos con una regla acotada"
                >
                  <Target size={15} className="text-emerald-600" />
                  <span>Unir Puntos</span>
                </button>

                <button
                  onClick={() => setActiveTool('range')}
                  className={`py-2 px-2 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${
                    activeTool === 'range'
                      ? 'bg-cyan-50 text-cyan-700 border-cyan-300 font-bold'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                  title="Arrastra para seleccionar una caja de rango y calibrar la escala milimétrica"
                >
                  <Sparkles size={15} className="text-cyan-600" />
                  <span>Seleccionar Rango</span>
                </button>

                <button
                  onClick={() => setActiveTool('pencil')}
                  className={`py-2 px-2 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${
                    activeTool === 'pencil'
                      ? 'bg-blue-50 text-blue-600 border-blue-300 font-bold'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <PenTool size={15} />
                  <span>Lápiz Libre</span>
                </button>

                <button
                  onClick={() => setActiveTool('text')}
                  className={`py-2 px-2 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${
                    activeTool === 'text'
                      ? 'bg-blue-50 text-blue-600 border-blue-300 font-bold'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <Type size={15} />
                  <span>Etiqueta</span>
                </button>

                <button
                  onClick={handleCenterImage}
                  className="py-2 px-2 rounded-xl border border-slate-200 hover:border-amber-300 hover:bg-amber-50 text-slate-600 hover:text-amber-700 text-xs font-semibold flex flex-col items-center justify-center gap-1 cursor-pointer transition-all"
                  title="Centra la radiografía y restablece el zoom"
                >
                  <RotateCcw size={15} className="text-amber-500" />
                  <span>Centrar Vista</span>
                </button>
              </div>

              {/* CALIBRATION & RULER ACTION CARD */}
              <div className="p-3 bg-slate-900 text-slate-100 rounded-xl border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1">
                    <Scale size={12} /> Calibración de Escala
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    1 mm = {pixelsPerMm.toFixed(1)} px
                  </span>
                </div>

                <p className="text-[11px] text-slate-300 leading-snug">
                  Ajusta la conversión milimétrica seleccionando una regla o un rango en pantalla.
                </p>

                {/* Manual millimeter input field */}
                <div className="space-y-1 bg-slate-800/40 p-2 rounded-lg border border-slate-800/60">
                  <label className="text-[10px] font-semibold text-slate-400 block">
                    Medida real conocida (mm):
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      placeholder="Ej: 10.0"
                      value={calibrationInputValue}
                      onChange={(e) => setCalibrationInputValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleApplyScaleCalibration();
                        }
                      }}
                      className="w-full px-2 py-1 bg-slate-950 border border-slate-700 rounded-lg text-xs font-bold text-cyan-400 focus:outline-none focus:border-cyan-500"
                    />
                    <span className="text-[10px] font-bold text-slate-500">mm</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <button
                      onClick={handleApplyScaleCalibration}
                      className="flex-1 py-1.5 px-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1 cursor-pointer"
                      title="Aplica la calibración usando la medida real ingresada"
                    >
                      <CheckCircle2 size={13} />
                      Calibrar Escala (mm)
                    </button>
                    
                    {selectedAnnotationId && (
                      <button
                        onClick={handleDeleteSelectedAnnotation}
                        className="py-1.5 px-2 bg-rose-900/60 hover:bg-rose-800 text-rose-200 border border-rose-700/60 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                        title="Eliminar regla seleccionada"
                      >
                        <Trash2 size={13} />
                        Eliminar
                      </button>
                    )}
                  </div>

                  <button
                    onClick={handleAlignForeheadRuler}
                    className="w-full py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 hover:border-cyan-500 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    title="Posiciona automáticamente la regla en el calibrador físico de la frente"
                  >
                    <Target size={13} className="text-cyan-400" />
                    Calibrar con Regla de la Frente (10 mm)
                  </button>
                </div>
              </div>

              {/* Plot Colors */}
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-slate-500">Color del Trazo:</span>
                <div className="flex gap-2">
                  {['#00f0ff', '#ef4444', '#eab308', '#22c55e', '#ec4899'].map((col) => (
                    <button
                      key={col}
                      onClick={() => setActiveColor(col)}
                      className={`w-7 h-7 rounded-full border-2 cursor-pointer transition-all flex items-center justify-center ${
                        activeColor === col ? 'scale-110 border-slate-600' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: col }}
                    >
                      {activeColor === col && <span className="w-1.5 h-1.5 bg-slate-950 rounded-full" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex gap-2">
                <button
                  onClick={handleClearAnnotations}
                  disabled={annotations.length === 0}
                  className="flex-1 py-2 bg-slate-50 hover:bg-red-50 text-slate-500 hover:text-red-600 border border-slate-200 hover:border-red-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 disabled:opacity-50 transition-all cursor-pointer"
                >
                  <Trash2 size={13} />
                  Limpiar Capa
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SUB-PANEL C: CEPHALOMETRICS */}
                {activeAnalysisTab === 'cephalometric' && (
          <div className="flex flex-col gap-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-4">
              <h4 className="text-slate-800 font-bold text-xs uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
                <PenTool size={14} className="text-blue-500" />
                Herramientas de Trazado Libre
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setActiveTool('select')}
                  className={`py-2 px-2 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${
                    activeTool === 'select'
                      ? 'bg-blue-50 text-blue-600 border-blue-300 font-bold'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <Maximize2 size={15} />
                  <span>Navegar</span>
                </button>
                <button
                  onClick={() => setActiveTool('pan')}
                  className={`py-2 px-2 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${
                    activeTool === 'pan'
                      ? 'bg-blue-50 text-blue-600 border-blue-300 font-bold'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <Hand size={15} className="text-blue-500" />
                  <span>Mover</span>
                </button>
                <button
                  onClick={() => setActiveTool('line')}
                  className={`py-2 px-2 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${
                    activeTool === 'line'
                      ? 'bg-blue-50 text-blue-600 border-blue-300 font-bold'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <Scale size={15} />
                  <span>Regla</span>
                </button>
                <button
                  onClick={() => setActiveTool('pencil')}
                  className={`py-2 px-2 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${
                    activeTool === 'pencil'
                      ? 'bg-blue-50 text-blue-600 border-blue-300 font-bold'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <PenTool size={15} />
                  <span>Lápiz</span>
                </button>
              </div>
              
              <div className="space-y-1.5 mt-2">
                <span className="text-xs font-semibold text-slate-500">Color del Trazo Libre:</span>
                <div className="flex gap-2">
                  {['#00f0ff', '#ef4444', '#eab308', '#22c55e', '#ec4899'].map((col) => (
                    <button
                      key={col}
                      onClick={() => setActiveColor(col)}
                      className={`w-7 h-7 rounded-full border-2 cursor-pointer transition-all flex items-center justify-center ${
                        activeColor === col ? 'scale-110 border-slate-600' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: col }}
                    >
                      {activeColor === col && <span className="w-1.5 h-1.5 bg-slate-950 rounded-full" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-4">
            {/* AI AUTO-DETECTION PROMPTER PANEL */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-cyan-500/40 rounded-xl p-3 text-white space-y-2 shadow-sm">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1.5 text-cyan-300 font-bold text-xs uppercase tracking-wider">
                  <Sparkles size={14} className="text-cyan-400 animate-pulse" />
                  Ubicación Automática IA (23 Puntos)
                </div>
                <span className="text-[9px] bg-cyan-500/20 text-cyan-200 border border-cyan-400/30 px-1.5 py-0.5 rounded font-mono font-bold">
                  Gemini Vision
                </span>
              </div>
              <p className="text-[11px] text-slate-300 leading-tight">
                Detecta y posiciona automáticamente los puntos anatómicos de Steiner, McNamara y UPCH en la radiografía lateral.
              </p>
              <button
                onClick={() => handleRunAILandmarkDetection(true)}
                disabled={isAIDetectingLandmarks}
                className="w-full py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isAIDetectingLandmarks ? (
                  <>
                    <Loader2 size={14} className="animate-spin text-white" />
                    <span>Analizando Estructuras Óseas...</span>
                  </>
                ) : (
                  <>
                    <Zap size={14} />
                    <span>Autodetectar Puntos Cefalométricos</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <h4 className="text-slate-800 font-bold text-xs uppercase tracking-wider flex items-center gap-2">
                <Compass size={14} className="text-blue-500" />
                Análisis Cefalométrico Integral
              </h4>
              <select
                value={activeCephModel}
                onChange={(e) => setActiveCephModel(e.target.value as any)}
                className="bg-slate-100 border border-slate-200 text-[11px] font-bold text-slate-700 rounded-lg px-2 py-1 focus:outline-none"
              >
                <option value="Steiner">Análisis Steiner</option>
                <option value="McNamara">McNamara</option>
                <option value="UPCH">Norma UPCH</option>
              </select>
            </div>

            {/* PRE-STEINER BASELINE VALIDATION BOX */}
            {activeCephModel === 'Steiner' && (() => {
              const pre = getPreSteinerValidation();
              return (
                <div className="p-3 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-xl space-y-2 shadow-md border border-slate-700 text-xs">
                  <div className="flex justify-between items-center border-b border-slate-700 pb-1.5">
                    <span className="font-bold flex items-center gap-1.5 text-blue-400 text-[11px] uppercase tracking-wide">
                      <Activity size={13} />
                      1. Verificación Previa a Steiner
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase font-mono ${
                      pre.snFhStatus === 'normal' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    }`}>
                      {pre.snFhStatus === 'normal' ? 'Base Fisiológica' : 'Verificar Inclinación'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="bg-slate-800/80 p-2 rounded-lg border border-slate-700/60">
                      <span className="text-slate-400 block text-[10px]">Inclinación SN / Po-Or:</span>
                      <span className="font-mono font-bold text-white text-sm">{pre.angleSN_FH}°</span>
                      <span className="text-slate-400 text-[9px] block">Norma: 7° ± 2°</span>
                    </div>

                    <div className="bg-slate-800/80 p-2 rounded-lg border border-slate-700/60">
                      <span className="text-slate-400 block text-[10px]">Longitud S-N (Base):</span>
                      <span className="font-mono font-bold text-white text-sm">{pre.lenSN} mm</span>
                      <span className="text-slate-400 text-[9px] block">S-A / S-N: {pre.ratioSA_SN}</span>
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-300 leading-relaxed italic bg-slate-950/60 p-2 rounded-lg border border-slate-800">
                    {pre.snFhMessage}
                  </p>
                </div>
              );
            })()}

            {/* PRIMARY SIDEBAR TAB SWITCHER: GUÍA DE PUNTOS vs MEDIDAS Y RESULTADOS vs PLAN DE TRATAMIENTO */}
            <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 gap-1 text-[11px] font-bold shadow-inner">
              <button
                onClick={() => setCephSidebarView('guide_table')}
                className={`flex-1 py-1.5 px-2 rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
                  cephSidebarView === 'guide_table'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md font-extrabold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <MapPin size={13} /> 📍 Guía Puntos
              </button>
              <button
                onClick={() => setCephSidebarView('measurements')}
                className={`flex-1 py-1.5 px-2 rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
                  cephSidebarView === 'measurements'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md font-extrabold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <BarChart2 size={13} /> 📊 Medidas vs Norma
              </button>
              <button
                onClick={() => setCephSidebarView('treatment_plan')}
                className={`flex-1 py-1.5 px-2 rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
                  cephSidebarView === 'treatment_plan'
                    ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md font-extrabold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Stethoscope size={13} /> 🩺 Plan Steiner
              </button>
            </div>

            {/* TAB 1: LANDMARK GUIDE TABLE FOR RADIOGRAPH PLACEMENT */}
            {cephSidebarView === 'guide_table' && (
              <div className="space-y-3">
                {/* Search & Category Filter Bar */}
                <div className="bg-slate-900 p-3 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1">
                      <Compass size={14} /> Guía de Ubicación Anatómica en Radiografía
                    </span>
                    <span className="text-[10px] bg-cyan-950 text-cyan-400 border border-cyan-800/60 px-2 py-0.5 rounded-full font-mono font-bold">
                      {Object.keys(CEPHALOMETRIC_GUIDES).length} Puntos Disp.
                    </span>
                  </div>

                  <div className="relative">
                    <Search size={13} className="absolute left-2.5 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Buscar por código (ej: S, N, A, Go) o nombre..."
                      value={guideTableSearch}
                      onChange={(e) => setGuideTableSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 bg-slate-950 text-white rounded-xl border border-slate-700 text-xs focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div className="flex flex-wrap gap-1 pt-1">
                    {['Todos', 'Base de Cráneo', 'Esquelético Maxilar', 'Esquelético Mandibular', 'Dentoalveolar', 'Tejidos Blandos'].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setGuideTableCategoryFilter(cat)}
                        className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                          guideTableCategoryFilter === cat
                            ? 'bg-cyan-600 text-white shadow-xs'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Active Landmark Active Focus Banner */}
                {(() => {
                  const activeGuide = CEPHALOMETRIC_GUIDES[activeGuideLandmarkKey] || {
                    code: activeGuideLandmarkKey,
                    name: `Punto ${activeGuideLandmarkKey}`,
                    category: 'Esquelético',
                    anatomicalGuide: 'Ubicación anatómica en radiografía.',
                    tip: 'Ajuste la posición directamente en la imagen.'
                  };
                  const coords = landmarks[activeGuideLandmarkKey] || { x: 0, y: 0 };

                  return (
                    <div className="bg-gradient-to-r from-slate-900 via-cyan-950/40 to-slate-900 border-2 border-cyan-500/50 rounded-2xl p-3 text-white space-y-2 shadow-lg">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="bg-cyan-500 text-slate-950 px-2 py-0.5 rounded-lg font-mono font-black text-xs">
                            🎯 {activeGuide.code}
                          </span>
                          <span className="font-bold text-xs text-cyan-200">{activeGuide.name}</span>
                        </div>
                        <span className="text-[9px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-bold">
                          {activeGuide.category}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-200 leading-snug">
                        <b>Ubicación:</b> {activeGuide.anatomicalGuide}
                      </p>

                      <div className="text-[10px] text-amber-200/90 italic bg-amber-950/40 border border-amber-500/20 p-2 rounded-xl">
                        💡 <b>Tip de Referencia:</b> {activeGuide.tip}
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-slate-800">
                        <span className="text-[10px] text-slate-400">Coordenadas en Imagen:</span>
                        <span className="font-mono font-bold text-cyan-400 text-xs">
                          X: {Math.round(coords.x)} px | Y: {Math.round(coords.y)} px
                        </span>
                      </div>
                    </div>
                  );
                })()}

                {/* Interactive Guide Table */}
                <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs bg-white">
                  <div className="max-h-[360px] overflow-y-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead className="sticky top-0 bg-slate-900 text-cyan-300 uppercase text-[10px] font-bold z-10">
                        <tr>
                          <th className="py-2.5 px-3">Punto</th>
                          <th className="py-2.5 px-2">Referencia Anatómica en Radiografía</th>
                          <th className="py-2.5 px-2 text-center">Coord (X,Y)</th>
                          <th className="py-2.5 px-2.5 text-center">Acción</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 font-sans text-[11px]">
                        {Object.keys(CEPHALOMETRIC_GUIDES)
                          .filter((k) => {
                            const item = CEPHALOMETRIC_GUIDES[k];
                            const matchesSearch = k.toLowerCase().includes(guideTableSearch.toLowerCase()) ||
                              item.name.toLowerCase().includes(guideTableSearch.toLowerCase());
                            const matchesCat = guideTableCategoryFilter === 'Todos' || item.category === guideTableCategoryFilter;
                            return matchesSearch && matchesCat;
                          })
                          .map((key) => {
                            const item = CEPHALOMETRIC_GUIDES[key];
                            const coords = landmarks[key] || { x: 0, y: 0 };
                            const isActive = activeGuideLandmarkKey === key;

                            return (
                              <tr
                                key={key}
                                onClick={() => {
                                  setActiveGuideLandmarkKey(key);
                                }}
                                onMouseEnter={() => setHoveredLandmarkKey(key)}
                                onMouseLeave={() => setHoveredLandmarkKey(null)}
                                className={`transition-colors cursor-pointer ${
                                  isActive
                                    ? 'bg-cyan-50 border-l-4 border-cyan-500 font-bold'
                                    : 'hover:bg-slate-50'
                                }`}
                              >
                                <td className="py-2.5 px-3 whitespace-nowrap">
                                  <div className="flex items-center gap-1.5">
                                    <span className={`px-2 py-0.5 rounded font-mono font-extrabold text-[11px] ${
                                      isActive
                                        ? 'bg-cyan-600 text-white shadow-xs'
                                        : 'bg-slate-100 text-slate-800 border border-slate-300'
                                    }`}>
                                      {key}
                                    </span>
                                  </div>
                                </td>
                                <td className="py-2.5 px-2">
                                  <div className="font-bold text-slate-900 text-[11px]">{item.name}</div>
                                  <div className="text-[10px] text-slate-600 leading-snug">{item.anatomicalGuide}</div>
                                  <div className="text-[9px] text-amber-700 italic mt-0.5">💡 {item.tip}</div>
                                </td>
                                <td className="py-2.5 px-2 text-center font-mono font-bold text-slate-700 whitespace-nowrap">
                                  {Math.round(coords.x)}, {Math.round(coords.y)}
                                </td>
                                <td className="py-2.5 px-2.5 text-center whitespace-nowrap">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveGuideLandmarkKey(key);
                                    }}
                                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                                      isActive
                                        ? 'bg-cyan-600 text-white shadow-xs'
                                        : 'bg-slate-100 text-slate-700 hover:bg-cyan-100 hover:text-cyan-900'
                                    }`}
                                  >
                                    {isActive ? '🎯 Activo' : 'Ver Puntos'}
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: MEASUREMENTS NORMA VS PACIENTES & COMPARATIVE CHARTS */}
            {cephSidebarView === 'measurements' && (
              <div className="space-y-3">
                {/* STEINER TREATMENT PLAN QUICK LINK BANNER */}
                {(() => {
                  const plan = getSteinerTreatmentPlan();
                  return (
                    <div className="bg-gradient-to-r from-slate-900 to-amber-950 border border-amber-500/30 p-2.5 rounded-xl text-white flex items-center justify-between gap-2 shadow-xs">
                      <div className="flex items-center gap-2">
                        <Stethoscope size={16} className="text-amber-400 shrink-0 animate-pulse" />
                        <div>
                          <p className="text-[10px] font-bold text-amber-300 uppercase tracking-wide">
                            Sugerencia de Tratamiento Steiner ({plan.growthPatternType}):
                          </p>
                          <p className="text-[11px] font-extrabold text-white truncate max-w-[280px]">
                            {plan.skeletalClassTag} • {plan.genderLabel} ({plan.currentAge}a)
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setCephSidebarView('treatment_plan')}
                        className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-[10px] px-2.5 py-1.5 rounded-lg shrink-0 transition-all cursor-pointer shadow-xs"
                      >
                        Ver Plan →
                      </button>
                    </div>
                  );
                })()}

                {/* DISPLAY MODE SWITCHER */}
                <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 gap-1 text-[11px] font-bold">
                  <button
                    onClick={() => setCephDisplayMode('table')}
                    className={`flex-1 py-1.5 px-2 rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
                      cephDisplayMode === 'table' ? 'bg-blue-600 text-white shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                    }`}
                  >
                    <Table size={13} /> Tabla Norma vs Paciente
                  </button>
                  <button
                    onClick={() => setCephDisplayMode('cards')}
                    className={`flex-1 py-1.5 px-2 rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
                      cephDisplayMode === 'cards' ? 'bg-blue-600 text-white shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                    }`}
                  >
                    <LayoutGrid size={13} /> Tarjetas
                  </button>
                  <button
                    onClick={() => setCephDisplayMode('chart')}
                    className={`flex-1 py-1.5 px-2 rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
                      cephDisplayMode === 'chart' ? 'bg-blue-600 text-white shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                    }`}
                  >
                    <BarChart2 size={13} /> Gráfico Comparativo
                  </button>
                </div>

                {/* CATEGORY FILTER PILLS */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">
                    Filtrar por Categoría:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {['Todos', 'Esquelético Sagital', 'Esquelético Vertical', 'Dentoalveolar', 'Tejidos Blandos'].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategoryFilter(cat)}
                        className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                          selectedCategoryFilter === cat
                            ? 'bg-slate-800 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

            {/* MODE 1: COMPARATIVE TABLE NORMA VS PACIENTE */}
            {cephDisplayMode === 'table' && (
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs max-h-[400px] overflow-y-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="sticky top-0 bg-slate-900 text-white text-[10px] uppercase font-bold tracking-wider z-10">
                    <tr>
                      <th className="py-2.5 px-2.5">Medida Cefalométrica</th>
                      <th className="py-2.5 px-2 text-center bg-blue-900/80">Norma</th>
                      <th className="py-2.5 px-2 text-center bg-emerald-900/80">Paciente</th>
                      <th className="py-2.5 px-2 text-center">Dif. (Δ)</th>
                      <th className="py-2.5 px-2 text-center min-w-[90px]">Rango Visual</th>
                      <th className="py-2.5 px-2.5">Estado / Diagnóstico</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-sans text-[11px] bg-white">
                    {getCephMeasurements()
                      .filter((m) => selectedCategoryFilter === 'Todos' || m.category === selectedCategoryFilter)
                      .map((m) => {
                        const normNum = parseFloat(m.norm.replace(/[^0-9.-]/g, '')) || 0;
                        const valNum = typeof m.val === 'number' ? m.val : parseFloat(m.val as string) || 0;
                        const deltaNum = valNum - normNum;
                        const clampDiff = Math.max(-10, Math.min(10, deltaNum));
                        const pct = 50 + (clampDiff / 10) * 40; // 10% to 90%

                        return (
                          <tr key={m.code} className="hover:bg-blue-50/40 transition-colors">
                            <td className="py-2 px-2.5 font-bold text-slate-900">
                              <div className="flex flex-col">
                                <span className="text-[11px] font-bold text-slate-900">{m.name}</span>
                                <span className="font-mono text-[9px] text-slate-400 font-normal">{m.code} ({m.category})</span>
                              </div>
                            </td>
                            <td className="py-2 px-2 text-center font-mono font-bold text-blue-800 bg-blue-50/50">
                              {m.norm}
                            </td>
                            <td className="py-2 px-2 text-center bg-emerald-50/50">
                              <div className="flex items-center justify-center gap-1">
                                <input
                                  type="number"
                                  value={m.val}
                                  onChange={(e) => handleCephMeasurementChange(m.code, parseFloat(e.target.value))}
                                  className="w-14 bg-white border border-slate-300 rounded px-1 py-0.5 text-right font-mono text-xs font-bold text-emerald-800 focus:ring-2 focus:ring-emerald-500 outline-none shadow-2xs"
                                  title="Haz clic para editar el valor del paciente"
                                />
                                <span className="font-mono text-[10px] text-slate-500">{m.unit}</span>
                              </div>
                            </td>
                            <td className={`py-2 px-2 text-center font-mono font-bold ${
                              Math.abs(deltaNum) < 1 ? 'text-emerald-600' : deltaNum > 0 ? 'text-amber-600' : 'text-blue-600'
                            }`}>
                              {m.dev}
                            </td>
                            <td className="py-2 px-2">
                              <div className="w-full bg-slate-100 h-3 rounded-full relative overflow-hidden border border-slate-200" title={`Norma: ${m.norm} vs Paciente: ${m.val}${m.unit}`}>
                                <div className="absolute left-[35%] right-[35%] top-0 bottom-0 bg-emerald-200/80" />
                                <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-slate-400 z-10" />
                                <div
                                  className={`absolute top-0 bottom-0 w-2.5 -ml-1.25 rounded-full z-20 transition-all shadow-xs ${
                                    m.severity === 'critical'
                                      ? 'bg-rose-600 border border-white'
                                      : m.severity === 'warning'
                                      ? 'bg-amber-500 border border-white'
                                      : 'bg-emerald-600 border border-white'
                                  }`}
                                  style={{ left: `${pct}%` }}
                                />
                              </div>
                            </td>
                            <td className="py-2 px-2.5">
                              <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                m.severity === 'critical'
                                  ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                  : m.severity === 'warning'
                                  ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                  : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              }`}>
                                {m.severity === 'critical' ? <AlertTriangle size={10} /> : <CheckCircle2 size={10} />}
                                {m.statusTag}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            )}

            {/* MODE 2: DETAILED CARDS WITH COMPARISON BOXES */}
            {cephDisplayMode === 'cards' && (
              <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                {getCephMeasurements()
                  .filter((m) => selectedCategoryFilter === 'Todos' || m.category === selectedCategoryFilter)
                  .map((meas) => {
                    const isExpanded = expandedMeasCode === meas.code;
                    return (
                      <div 
                        key={meas.code} 
                        className={`p-3 rounded-xl border transition-all text-xs space-y-2.5 ${
                          meas.severity === 'critical'
                            ? 'bg-rose-50/60 border-rose-200'
                            : meas.severity === 'warning'
                            ? 'bg-amber-50/60 border-amber-200'
                            : 'bg-slate-50 border-slate-200 hover:border-blue-200'
                        }`}
                      >
                        <div className="flex justify-between items-center gap-2">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-slate-900 text-xs">{meas.name}</span>
                            <span className="font-mono text-[9px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-bold">
                              {meas.code}
                            </span>
                          </div>
                          <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            meas.severity === 'critical'
                              ? 'bg-rose-600 text-white'
                              : meas.severity === 'warning'
                              ? 'bg-amber-600 text-white'
                              : 'bg-emerald-600 text-white'
                          }`}>
                            {meas.statusTag}
                          </span>
                        </div>

                        {/* Comparative Box: NORMA vs PACIENTE vs DESVIACIÓN */}
                        <div className="grid grid-cols-3 gap-2 bg-white p-2 rounded-xl border border-slate-200/80 shadow-2xs text-center">
                          <div className="bg-blue-50/80 p-1.5 rounded-lg border border-blue-100">
                            <span className="text-[9px] font-bold text-blue-700 uppercase block">NORMA</span>
                            <span className="font-mono font-bold text-blue-900 text-xs">{meas.norm}</span>
                          </div>
                          <div className="bg-emerald-50/80 p-1.5 rounded-lg border border-emerald-100 flex flex-col items-center justify-center">
                            <span className="text-[9px] font-bold text-emerald-700 uppercase block">PACIENTE</span>
                            <div className="flex items-center gap-0.5">
                              <input
                                type="number"
                                value={meas.val}
                                onChange={(e) => handleCephMeasurementChange(meas.code, parseFloat(e.target.value))}
                                className="w-12 bg-white border border-slate-300 rounded px-1 py-0 text-center font-mono text-xs font-bold text-emerald-900 outline-none"
                              />
                              <span className="font-mono text-[9px] text-slate-500">{meas.unit}</span>
                            </div>
                          </div>
                          <div className="bg-amber-50/80 p-1.5 rounded-lg border border-amber-100">
                            <span className="text-[9px] font-bold text-amber-700 uppercase block">DIFERENCIA (Δ)</span>
                            <span className="font-mono font-bold text-amber-900 text-xs">{meas.dev}</span>
                          </div>
                        </div>

                        {/* Diagnostic Text Explanation */}
                        <div className="p-2 bg-white/90 rounded-lg border border-slate-200/80 text-[11px] text-slate-700 leading-relaxed">
                          <p className="font-medium text-slate-800">
                            <b className="text-blue-800">Diagnóstico: </b>
                            {meas.clinicalAnalysis}
                          </p>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}

            {/* MODE 3: COMPARATIVE CHART NORMA VS PACIENTE */}
            {cephDisplayMode === 'chart' && (() => {
              const measurementsData = getCephMeasurements()
                .filter((m) => selectedCategoryFilter === 'Todos' || m.category === selectedCategoryFilter)
                .map((m) => {
                  const normNum = parseFloat(m.norm.replace(/[^0-9.-]/g, '')) || 0;
                  const valNum = typeof m.val === 'number' ? m.val : parseFloat(m.val as string) || 0;
                  return {
                    code: m.code,
                    name: m.name,
                    Norma: normNum,
                    Paciente: valNum,
                    unit: m.unit
                  };
                });

              return (
                <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl space-y-2">
                  <div className="text-[11px] font-bold text-slate-700 flex justify-between items-center">
                    <span>Gráfico de Barras: Norma Estándar vs Valor Paciente</span>
                    <span className="text-[10px] text-slate-400 font-normal">Sombra azul = Norma, Verde = Paciente</span>
                  </div>
                  <div className="h-64 w-full pt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={measurementsData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="code" tick={{ fontSize: 9, fontWeight: 'bold' }} interval={0} angle={-30} textAnchor="end" />
                        <YAxis tick={{ fontSize: 9 }} />
                        <RechartsTooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const d = payload[0].payload;
                              return (
                                <div className="bg-slate-900 text-white p-2.5 rounded-lg text-xs space-y-1 font-sans border border-slate-700 shadow-xl">
                                  <p className="font-bold text-cyan-300">{d.name} ({d.code})</p>
                                  <p className="text-blue-300">Norma: <b>{d.Norma}{d.unit}</b></p>
                                  <p className="text-emerald-300">Paciente: <b>{d.Paciente}{d.unit}</b></p>
                                  <p className="text-amber-300 font-mono text-[10px]">Diferencia: {(d.Paciente - d.Norma).toFixed(1)}{d.unit}</p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Legend wrapperStyle={{ fontSize: 11 }} />
                        <Bar dataKey="Norma" name="Norma Estándar" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="Paciente" name="Valor Paciente" fill="#10b981" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* TAB 3: STEINER TREATMENT PLAN RECOMMENDATIONS BASED ON SEX, AGE & DIVERGENCE */}
        {cephSidebarView === 'treatment_plan' && (() => {
          const plan = getSteinerTreatmentPlan();

          return (
            <div className="space-y-3 font-sans text-xs">
              {/* PATIENT DEMOGRAPHICS & DIAGNOSTIC PARAMETERS EDIT BAR */}
              <div className="bg-slate-900 border border-slate-800 p-3 rounded-2xl text-white space-y-3 shadow-md">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-cyan-300 font-extrabold text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <Stethoscope size={15} className="text-cyan-400" />
                    Parámetros de Diagnóstico Steiner
                  </span>
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full font-mono font-bold">
                    Algoritmo Clínico Activo
                  </span>
                </div>

                {/* Inputs for Gender, Age, and Divergence Override */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                  {/* Sex Selection */}
                  <div className="bg-slate-950 p-2 rounded-xl border border-slate-800 space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold block">1. Sexo Paciente:</label>
                    <div className="flex bg-slate-900 p-0.5 rounded-lg border border-slate-800">
                      <button
                        type="button"
                        onClick={() => setPatientGender('F')}
                        className={`flex-1 py-1 rounded text-center font-bold text-[10px] transition-all cursor-pointer ${
                          patientGender === 'F' ? 'bg-pink-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        ♀ Femenino
                      </button>
                      <button
                        type="button"
                        onClick={() => setPatientGender('M')}
                        className={`flex-1 py-1 rounded text-center font-bold text-[10px] transition-all cursor-pointer ${
                          patientGender === 'M' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        ♂ Masculino
                      </button>
                    </div>
                  </div>

                  {/* Age Selection */}
                  <div className="bg-slate-950 p-2 rounded-xl border border-slate-800 space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold block">2. Edad (Años):</label>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="3"
                        max="80"
                        value={patientAgeInput}
                        onChange={(e) => setPatientAgeInput(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 font-mono font-bold text-cyan-300 text-center outline-none focus:border-cyan-400"
                      />
                      <span className="text-[10px] text-slate-400 font-bold">Años</span>
                    </div>
                  </div>

                  {/* Divergence Override Selection */}
                  <div className="bg-slate-950 p-2 rounded-xl border border-slate-800 space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold block">3. Tipo Crecimiento:</label>
                    <select
                      value={growthPatternOverride}
                      onChange={(e) => setGrowthPatternOverride(e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-[11px] font-bold text-cyan-300 outline-none focus:border-cyan-400 cursor-pointer"
                    >
                      <option value="auto">⚡ Auto (GoGn-SN: {plan.snGoGn}°)</option>
                      <option value="hiper">↗️ Hiperdivergente (&gt; 35°)</option>
                      <option value="normo">⚖️ Normodivergente (29-35°)</option>
                      <option value="braqui">↘️ Braquidivergente (&lt; 29°)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* THREE CORE DIAGNOSTIC SUMMARY CARDS */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {/* Card 1: Patrón de Crecimiento / Divergencia */}
                <div className={`p-3 rounded-2xl border shadow-xs space-y-1 ${
                  plan.growthPatternType === 'Hiperdivergente'
                    ? 'bg-rose-50/80 border-rose-300 text-rose-900'
                    : plan.growthPatternType === 'Braquidivergente'
                    ? 'bg-amber-50/80 border-amber-300 text-amber-900'
                    : 'bg-emerald-50/80 border-emerald-300 text-emerald-900'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-black tracking-wider opacity-80">CRECIMIENTO</span>
                    <span className="font-mono text-[10px] font-bold">GoGn-SN: {plan.snGoGn}°</span>
                  </div>
                  <div className="font-extrabold text-xs flex items-center gap-1">
                    {plan.growthPatternType === 'Hiperdivergente' ? '📈 Hiperdivergente' : plan.growthPatternType === 'Braquidivergente' ? '📉 Braquidivergente' : '⚖️ Normodivergente'}
                  </div>
                  <p className="text-[10px] leading-tight opacity-90 font-medium">
                    {plan.growthPatternType === 'Hiperdivergente'
                      ? 'Crecimiento vertical (dolicofacial). Tendencia a mordida abierta posterior.'
                      : plan.growthPatternType === 'Braquidivergente'
                      ? 'Crecimiento horizontal (braquifacial). Tendencia a cara corta y mordida profunda.'
                      : 'Crecimiento equilibrado y neutro (mesofacial).'}
                  </p>
                </div>

                {/* Card 2: Clase Esquelética Sagital */}
                <div className="p-3 rounded-2xl border border-blue-200 bg-blue-50/80 text-blue-950 shadow-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-black tracking-wider opacity-80">CLASE ESQUELÉTICA</span>
                    <span className="font-mono text-[10px] font-bold">ANB: {plan.anb}°</span>
                  </div>
                  <div className="font-extrabold text-xs leading-snug text-blue-900">
                    {plan.skeletalClassTag}
                  </div>
                  <p className="text-[10px] leading-tight opacity-90 font-medium">
                    SNA: {plan.sna}° | SNB: {plan.snb}°
                  </p>
                </div>

                {/* Card 3: Maduración Biológica (Edad + Sexo) */}
                <div className="p-3 rounded-2xl border border-purple-200 bg-purple-50/80 text-purple-950 shadow-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-black tracking-wider opacity-80">MADURACIÓN</span>
                    <span className="font-mono text-[10px] font-bold">{plan.genderLabel} ({plan.currentAge}a)</span>
                  </div>
                  <div className="font-bold text-xs leading-tight text-purple-900">
                    {plan.growthStageLabel}
                  </div>
                </div>
              </div>

              {/* SECTION 1: BIOMECÁNICA Y DIRECCIÓN DE CUALQUIER MOVIMIENTO */}
              <div className="bg-white border border-slate-200 rounded-2xl p-3.5 space-y-2 shadow-xs">
                <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
                  <Target size={14} className="text-cyan-600" />
                  1. Estrategia Biomecánica según Tipo de Crecimiento ({plan.growthPatternType})
                </h4>
                <div className="space-y-1.5">
                  {plan.divergenceDirectives.map((dir, idx) => (
                    <div key={idx} className="p-2 bg-slate-50 rounded-xl border border-slate-200 text-slate-800 text-[11px] leading-relaxed font-medium flex items-start gap-2">
                      <span className="shrink-0 text-cyan-600 font-bold">•</span>
                      <span>{dir}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION 2: APARATOLOGÍA Y DISPOSITIVOS RECOMENDADOS */}
              <div className="bg-white border border-slate-200 rounded-2xl p-3.5 space-y-2 shadow-xs">
                <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
                  <Zap size={14} className="text-amber-500" />
                  2. Aparatología Específica Recomendada
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {plan.recommendedApparel.map((app, idx) => (
                    <div key={idx} className="p-2 bg-amber-50/60 border border-amber-200 rounded-xl text-amber-950 text-[11px] font-bold flex items-center gap-2">
                      <CheckCircle2 size={13} className="text-amber-600 shrink-0" />
                      <span>{app}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION 3: CONTRAINDICACIONES Y ALERTAS CLÍNICAS */}
              {plan.contraindications.length > 0 && (
                <div className="bg-rose-900 text-white border border-rose-800 rounded-2xl p-3.5 space-y-2 shadow-md">
                  <h4 className="font-extrabold text-xs text-rose-200 uppercase tracking-wider flex items-center gap-2 border-b border-rose-800 pb-2">
                    <AlertTriangle size={14} className="text-rose-400" />
                    3. Precauciones y Contraindicaciones de Mecánica
                  </h4>
                  <div className="space-y-1.5">
                    {plan.contraindications.map((c, idx) => (
                      <p key={idx} className="text-[11px] text-rose-100 leading-normal font-medium flex items-start gap-2">
                        <span className="text-rose-400 font-black">⚠️</span>
                        <span>{c}</span>
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* SECTION 4: INCISIVOS Y COMPROMISO DENTOALVEOLAR */}
              {plan.incisorNotes.length > 0 && (
                <div className="bg-white border border-slate-200 rounded-2xl p-3.5 space-y-2 shadow-xs">
                  <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
                    <Scale size={14} className="text-blue-600" />
                    4. Posición de Incisivos de Steiner (1-NA / 1-NB)
                  </h4>
                  <div className="space-y-1.5">
                    {plan.incisorNotes.map((note, idx) => (
                      <div key={idx} className="p-2 bg-blue-50/60 border border-blue-200 rounded-xl text-blue-950 text-[11px] font-medium flex items-center gap-2">
                        <span className="text-blue-600 font-bold">🦷</span>
                        <span>{note}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SECTION 5: CONSIDERACIONES DE SEXO Y EDAD */}
              <div className="bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 border border-purple-500/40 rounded-2xl p-3.5 text-white space-y-2 shadow-md">
                <h4 className="font-extrabold text-xs text-purple-300 uppercase tracking-wider flex items-center gap-2 border-b border-purple-800/80 pb-2">
                  <Sparkles size={14} className="text-purple-400" />
                  5. Factor Biológico (Sexo {plan.genderLabel} - Edad {plan.currentAge} Años)
                </h4>
                {plan.biologicalConsiderations.map((b, idx) => (
                  <p key={idx} className="text-[11px] text-purple-100 leading-relaxed">
                    {b}
                  </p>
                ))}
              </div>
            </div>
          );
        })()}

            {/* AI Analysis Trigger Button */}
            <button
              onClick={handleGenerateAIDiagnosis}
              disabled={isAnalyzingAI}
              className="w-full py-2.5 px-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              {isAnalyzingAI ? <Loader2 size={14} className="animate-spin" /> : <Bot size={14} />}
              <span>Generar Informe Cefalométrico AI Completo</span>
            </button>

            {/* Guidelines */}
            <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl space-y-1.5 text-[11px] text-slate-600">
              <p className="font-semibold flex items-center gap-1 text-blue-800">
                <Info size={13} />
                Instrucción de Posicionamiento
              </p>
              <p className="leading-relaxed">
                Usa el mouse para arrastrar los cursores en forma de cruz (<b>+</b>) sobre los puntos anatómicos. Los cálculos y el análisis de diagnóstico individual se actualizan instantáneamente.
              </p>
            </div>
          </div>
          </div>
        )}

        {/* SUB-PANEL D: SMILE & FACIAL AESTHETICS */}
        {activeAnalysisTab === 'smile' && (
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-4">
            <h4 className="text-slate-800 font-bold text-xs uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
              <Camera size={14} className="text-blue-500" />
              Estudio Estético de Sonrisa
            </h4>

            <div className="space-y-4">
              {/* Toggles */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setShowFacialGrid(!showFacialGrid)}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                    showFacialGrid
                      ? 'bg-blue-50 border-blue-300 text-blue-700 font-bold'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <Grid size={14} />
                  Rejilla Facial
                </button>

                <button
                  onClick={() => setShowGoldenRatio(!showGoldenRatio)}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                    showGoldenRatio
                      ? 'bg-blue-50 border-blue-300 text-blue-700 font-bold'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <Sparkles size={14} />
                  Prop. Áurea
                </button>
              </div>

              {/* Smile Curve Switch & Slider */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-150 space-y-2.5">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showSmileCurve}
                    onChange={(e) => setShowSmileCurve(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                  />
                  <span>Activar Arco de Sonrisa</span>
                </label>
                
                {showSmileCurve && (
                  <div className="space-y-1 pt-1.5 border-t border-slate-200">
                    <div className="flex justify-between text-[11px] font-semibold text-slate-500">
                      <span>Curvatura del arco:</span>
                      <span className="font-mono text-blue-600">{smileCurvature - 280} pts</span>
                    </div>
                    <input
                      type="range"
                      min="220"
                      max="380"
                      value={smileCurvature}
                      onChange={(e) => setSmileCurvature(Number(e.target.value))}
                      className="w-full accent-blue-600 h-1 bg-slate-200 rounded cursor-pointer"
                    />
                  </div>
                )}
              </div>

              {/* Lower dental midline shift slider */}
              <div className="space-y-1.5 p-3 bg-slate-50 rounded-xl border border-slate-150">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>Desvío de Línea Media Inferior:</span>
                  <span className="font-mono text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded border border-orange-100">
                    {midlineDeviation === 0 ? 'COINCIDENTE' : `${midlineDeviation > 0 ? '+' : ''}${midlineDeviation} mm`}
                  </span>
                </div>
                <input
                  type="range"
                  min="-4"
                  max="4"
                  value={midlineDeviation}
                  onChange={(e) => setMidlineDeviation(Number(e.target.value))}
                  className="w-full accent-orange-500 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                />
              </div>

              {/* Findings checklist */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Observaciones de Estética:</span>
                <div className="space-y-1.5 max-h-[110px] overflow-y-auto">
                  {smileNotes.map((note, idx) => (
                    <div key={idx} className="flex items-start justify-between bg-slate-50 p-2 rounded-xl border border-slate-200 text-[11px]">
                      <span className="text-slate-700 pr-1 leading-normal">{note}</span>
                      <button 
                        onClick={() => handleRemoveSmileNote(idx)}
                        className="text-slate-400 hover:text-red-500 text-[10px] font-bold cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleAddSmileNote} className="flex gap-1.5">
                  <input
                    type="text"
                    required
                    placeholder="Nueva observación..."
                    value={newSmileNote}
                    onChange={(e) => setNewSmileNote(e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white"
                  />
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-2.5 py-1 text-xs font-semibold cursor-pointer"
                  >
                    +
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* SUB-PANEL E: ANALYTICAL REPORT & SIGNATURE */}
        {activeAnalysisTab === 'report' && (
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-4">
            <h4 className="text-slate-800 font-bold text-xs uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
              <Award size={14} className="text-blue-500" />
              Informe Analítico y Firma Digital
            </h4>
            
            <div className="space-y-4">
              {/* AI Diagnostic Trigger */}
              <button
                onClick={handleGenerateAIDiagnosis}
                disabled={isAnalyzingAI}
                className="w-full py-2.5 px-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
              >
                {isAnalyzingAI ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                <span>Generar Diagnóstico de Medidas con IA</span>
              </button>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[11px] font-bold text-slate-500">Notas / Diagnóstico Clínico</label>
                  <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-[10px]">
                    <button
                      type="button"
                      onClick={() => setReportViewMode('preview')}
                      className={`px-2 py-0.5 rounded font-semibold transition-all cursor-pointer ${
                        reportViewMode === 'preview' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      Vista Formateada
                    </button>
                    <button
                      type="button"
                      onClick={() => setReportViewMode('edit')}
                      className={`px-2 py-0.5 rounded font-semibold transition-all cursor-pointer ${
                        reportViewMode === 'edit' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      Editar Texto
                    </button>
                  </div>
                </div>

                {reportViewMode === 'edit' ? (
                  <textarea
                    rows={12}
                    value={reportNotes}
                    onChange={(e) => setReportNotes(e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 transition-colors resize-none leading-relaxed font-mono"
                    placeholder="Redacte su informe radiológico en formato Markdown o genere un diagnóstico automatizado con IA..."
                  />
                ) : (
                  <div className="w-full text-xs p-3.5 border border-slate-200 rounded-xl bg-slate-50/70 max-h-[320px] overflow-y-auto space-y-2 text-slate-800 font-sans leading-relaxed">
                    <Markdown>{reportNotes}</Markdown>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500">Profesional</label>
                  <input
                    type="text"
                    value={professionalName}
                    onChange={(e) => setProfessionalName(e.target.value)}
                    className="w-full text-xs p-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="Nombre..."
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500">Colegiatura</label>
                  <input
                    type="text"
                    value={professionalCmp}
                    onChange={(e) => setProfessionalCmp(e.target.value)}
                    className="w-full text-xs p-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="CMP / COP..."
                  />
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex justify-between items-center">
                  <label className="text-[11px] font-bold text-slate-500">Firma del Especialista</label>
                  <button onClick={clearSignature} className="text-[10px] font-bold text-blue-600 hover:text-blue-700 underline cursor-pointer">
                    Limpiar
                  </button>
                </div>
                <div className="border border-slate-200 rounded-xl bg-slate-50 h-28 relative overflow-hidden touch-none">
                  <svg
                    ref={signatureCanvasRef}
                    className="w-full h-full cursor-crosshair touch-none"
                    onMouseDown={handleSignatureStart}
                    onMouseMove={handleSignatureMove}
                    onMouseUp={handleSignatureEnd}
                    onMouseLeave={handleSignatureEnd}
                    onTouchStart={handleSignatureStart}
                    onTouchMove={handleSignatureMove}
                    onTouchEnd={handleSignatureEnd}
                    onTouchCancel={handleSignatureEnd}
                  >
                    {signaturePaths.map((path, i) => (
                      <polyline
                        key={i}
                        points={path.map((p) => `${p.x},${p.y}`).join(' ')}
                        fill="none"
                        stroke="#0f172a"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    ))}
                    {currentSignaturePath.length > 0 && (
                      <polyline
                        points={currentSignaturePath.map((p) => `${p.x},${p.y}`).join(' ')}
                        fill="none"
                        stroke="#0f172a"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    )}
                  </svg>
                  {signaturePaths.length === 0 && currentSignaturePath.length === 0 && (
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-30">
                      <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Dibuje su firma aquí</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2 pt-1">
                <button
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer transition-all flex justify-center items-center gap-2 disabled:opacity-50"
                  onClick={handleExportPDF}
                  disabled={isExportingPDF}
                >
                  {isExportingPDF ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                  Exportar Reporte Analítico a PDF
                </button>
              </div>
            </div>
          </div>
        )}

        {/* COMPREHENSIVE STUDY META DATA */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <h4 className="text-slate-800 font-bold text-xs uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
            <Info size={14} className="text-blue-500" />
            Soporte de Entrada DICOM / JPG / PNG
          </h4>
          <p className="text-[11px] text-slate-500 leading-relaxed mt-2">
            La Estación Unificada es totalmente compatible con radiografías panorámicas, periapicales digitales, fotografías de perfil de sonrisa, y tomografías Cone Beam en rodajas (slices). Adjunta la imagen real para realizar mediciones milimétricas, trazado de líneas y ángulos cefalométricos.
          </p>
        </div>

          </div> {/* Close INTERNAL SCROLLABLE SUB-PANELS CONTAINER */}

      </div>
      )}

      {/* AI DIAGNOSIS MODAL OVERLAY */}
      {showAIModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white p-4 flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-500/20 rounded-xl border border-indigo-400/30">
                  <Bot size={20} className="text-indigo-300" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Diagnóstico Radiológico por IA (Gemini Ortho)</h3>
                  <p className="text-[11px] text-indigo-200">Análisis inteligente de patrón de crecimiento y relación esquelética</p>
                </div>
              </div>
              <button
                onClick={() => setShowAIModal(false)}
                className="text-slate-400 hover:text-white text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4 flex-1">
              {isAnalyzingAI ? (
                <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
                  <Loader2 size={36} className="animate-spin text-indigo-600" />
                  <p className="text-xs font-bold text-slate-700">Procesando mediciones cefalométricas y estéticas...</p>
                  <p className="text-[11px] text-slate-400 max-w-xs">Evaluando SNA, SNB, ANB, FMA y proporciones faciales con el modelo de IA Gemini.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-indigo-50/60 border border-indigo-100 rounded-xl p-3 flex items-start gap-2.5 text-xs text-indigo-900">
                    <Sparkles size={16} className="text-indigo-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block">Análisis Generado para: {resolvedPatientName}</span>
                      <span className="text-[11px] text-indigo-700">Modelo Cefalométrico: {activeCephModel}</span>
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-xs text-slate-800 leading-relaxed max-h-[420px] overflow-y-auto space-y-3 font-sans">
                    <Markdown>{aiDiagnosisResult}</Markdown>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            {!isAnalyzingAI && (
              <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-2">
                <button
                  onClick={() => setShowAIModal(false)}
                  className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Cerrar
                </button>
                <button
                  onClick={handleApplyAIDiagnosisToNotes}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow cursor-pointer flex items-center gap-1.5"
                >
                  <Check size={14} />
                  Insertar Diagnóstico en el Reporte
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* HIDDEN PRINTABLE A4 CONTAINER FOR HIGH-RES PDF EXPORT */}
      <div className="fixed -top-[9999px] -left-[9999px] pointer-events-none" aria-hidden="true">
        <div
          ref={reportPdfRef}
          className="w-[800px] min-h-[1130px] bg-white text-slate-900 p-8 font-sans space-y-6 text-xs leading-relaxed"
        >
          {/* PDF HEADER */}
          <div className="flex justify-between items-center border-b-2 border-slate-900 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow">
                Rx
              </div>
              <div>
                <h1 className="text-base font-extrabold text-slate-900 uppercase tracking-wide">
                  Centro Radiológico y Cefalométrico Dental
                </h1>
                <p className="text-[10px] text-slate-500 font-medium">
                  Radiología Maxilofacial Digital • Trazado Cefalométrico e IA
                </p>
              </div>
            </div>
            <div className="text-right text-[10px] text-slate-500">
              <div className="font-mono font-bold text-slate-800">REF: RX-{study.id.slice(0, 8).toUpperCase()}</div>
              <div>Fecha Emisión: {new Date().toLocaleDateString('es-ES')}</div>
            </div>
          </div>

          {/* PATIENT METADATA GRID */}
          <div className="grid grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-[11px]">
            <div>
              <span className="text-[9px] font-bold text-slate-400 uppercase block">Paciente</span>
              <span className="font-bold text-slate-800">{resolvedPatientName}</span>
            </div>
            <div>
              <span className="text-[9px] font-bold text-slate-400 uppercase block">DNI / Historia</span>
              <span className="font-semibold text-slate-700">{study.patientId || 'DNI: 74143248'}</span>
            </div>
            <div>
              <span className="text-[9px] font-bold text-slate-400 uppercase block">Estudio Radiográfico</span>
              <span className="font-semibold text-slate-700">{resolvedStudyTitle} ({study.subtype})</span>
            </div>
            <div>
              <span className="text-[9px] font-bold text-slate-400 uppercase block">Análisis Cefalométrico</span>
              <span className="font-semibold text-blue-600">{activeCephModel}</span>
            </div>
          </div>

          {/* RADIOGRAPH CANVAS SNAPSHOT */}
          <div className="space-y-1.5">
            <h3 className="text-[11px] font-bold text-slate-800 uppercase tracking-wider border-b border-slate-200 pb-1">
              1. Imagen Radiográfica y Trazado Anatómicofuncional
            </h3>
            <div className="flex justify-center bg-slate-950 p-2 rounded-xl border border-slate-300 max-h-[300px] overflow-hidden">
              <img
                src={currentImageUrl}
                alt="Radiografía"
                className="max-h-[280px] object-contain rounded"
              />
            </div>
          </div>

          {/* CEPHALOMETRIC MEASUREMENTS TABLE */}
          <div className="space-y-1.5">
            <h3 className="text-[11px] font-bold text-slate-800 uppercase tracking-wider border-b border-slate-200 pb-1">
              2. Tabla de Parámetros y Ángulos Cefalométricos ({activeCephModel})
            </h3>
            <table className="w-full text-left text-[10px] border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-300 text-slate-700">
                  <th className="p-2 font-bold uppercase">Parámetro / Ángulo</th>
                  <th className="p-2 font-bold uppercase text-center">Valor Medido</th>
                  <th className="p-2 font-bold uppercase text-center">Norma Clínica</th>
                  <th className="p-2 font-bold uppercase">Interpretación Diagnóstica</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {getCephMeasurements().map((m) => (
                  <tr key={m.code} className="hover:bg-slate-50">
                    <td className="p-2 font-bold text-slate-800">{m.name} ({m.code})</td>
                    <td className="p-2 text-center font-mono font-bold text-blue-700">{m.val}{m.unit}</td>
                    <td className="p-2 text-center text-slate-500">{m.norm}</td>
                    <td className="p-2 italic text-slate-600">{m.clinicalAnalysis}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* CLINICAL REPORT & AI DIAGNOSIS */}
          <div className="space-y-1.5">
            <h3 className="text-[11px] font-bold text-slate-800 uppercase tracking-wider border-b border-slate-200 pb-1">
              3. Conclusiones e Informe Diagnóstico Clínico
            </h3>
            <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200 text-[11px] leading-relaxed text-slate-900 font-sans space-y-2">
              <Markdown>{reportNotes || 'Sin observaciones registradas.'}</Markdown>
            </div>
          </div>

          {/* SIGNATURE & FOOTER */}
          <div className="pt-6 border-t-2 border-slate-200 flex justify-between items-end">
            <div>
              <p className="text-[9px] text-slate-400 uppercase font-bold">Documento Firmado Digitalmente</p>
              <p className="text-[10px] text-slate-500">Validez técnica y legal según norma médica radiológica.</p>
            </div>

            <div className="text-center space-y-1">
              {/* Render signature SVG paths */}
              <div className="w-48 h-16 border-b border-slate-800 flex items-end justify-center pb-1">
                <svg className="w-full h-full" viewBox="0 0 400 200">
                  {signaturePaths.map((path, i) => (
                    <polyline
                      key={i}
                      points={path.map((p) => `${p.x},${p.y}`).join(' ')}
                      fill="none"
                      stroke="#0f172a"
                      strokeWidth="3"
                    />
                  ))}
                </svg>
              </div>
              <div className="text-[11px] font-bold text-slate-900">{professionalName}</div>
              <div className="text-[10px] font-semibold text-slate-500">{professionalCmp}</div>
            </div>
          </div>
        </div>
      </div>

      {/* IMAGE CALIBRATOR OVERLAY MODAL */}
      {showCalibrationModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <ImageCalibrator
            isCalibrated={isCalibrated}
            pixelsPerMm={pixelsPerMm}
            onApplyCalibration={(targetMm, pxDistance) => {
              const dist = pxDistance || 25;
              const newPxPerMm = dist / (targetMm || 10);
              setPixelsPerMm(newPxPerMm);
              setIsCalibrated(true);
              setShowCalibrationModal(false);
              setEditorMessage(`📐 ¡Imagen Calibrada con Éxito! Escala: 1 mm = ${newPxPerMm.toFixed(2)} px`);
            }}
            onResetCalibration={() => {
              setIsCalibrated(false);
              setPixelsPerMm(10.0);
              setEditorMessage('🔄 Calibración reiniciada.');
            }}
            onAutoAlignRuler={handleAlignForeheadRuler}
            onCloseModal={() => setShowCalibrationModal(false)}
          />
        </div>
      )}

      {/* RESULTADO COMPARATIVO VIEW / MODAL (INICIAL PRE VS FINAL POST) */}
      {(showComparisonModal || nemoStep === 5) && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <ResultadoComparativo
            patientName={resolvedPatientName}
            patientGender={patientGender}
            patientAgeFormatted={calculateAgeYearsMonths(patientBirthDate, analysisDate).formatted}
            analysisModel={activeCephModel}
            initialMeasurements={getCephMeasurements(landmarksInicial)}
            finalMeasurements={getCephMeasurements(landmarksFinal)}
            aiReportText={aiComparisonReport}
            isGeneratingAI={isComparingAI}
            onRunAIComparison={handleRunAIComparison}
            onClose={() => {
              setShowComparisonModal(false);
              if (nemoStep === 5) setNemoStep(4);
            }}
          />
        </div>
      )}
    </div>
  );
}
