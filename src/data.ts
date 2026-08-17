/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Patient, DentalStudy } from './types';

export const INITIAL_PATIENTS: Patient[] = [
  {
    id: 'pat-1',
    name: 'Andrade Luna, Rubén',
    birthDate: '1984-10-22',
    gender: 'M',
    dni: '74143248',
    phone: '+51 987 654 321',
    email: 'ruben.andrade@gmail.com',
    notes: 'Paciente requiere evaluación para colocación de implantes múltiples en zona postero-inferior. Se solicita Tomografía Cone Beam Bimaxilar y Rx. Panorámica.'
  },
  {
    id: 'pat-2',
    name: 'Quevedo López, María',
    birthDate: '1992-05-14',
    gender: 'F',
    dni: '70335736',
    phone: '+51 955 123 456',
    email: 'maria.quevedo@outlook.com',
    notes: 'Dolor persistente en zona del tercer molar inferior izquierdo. Evaluación de endodoncia en pieza 4.6. Se solicita Periapical y Panorámica.'
  },
  {
    id: 'pat-3',
    name: 'Cáceres Huamán, Magdalena',
    birthDate: '1978-03-12',
    gender: 'F',
    dni: '10469501',
    phone: '+51 944 888 777',
    email: 'magdalena.c@gmail.com',
    notes: 'Paciente para tratamiento ortodóntico complejo y cirugía ortognática. Presenta sintomatología de ATM (chasquido y dolor a la apertura). Requiere Cefalometría y Tomografía ATM.'
  },
  {
    id: 'pat-4',
    name: 'Carpio Vargas, Jorge',
    birthDate: '1989-11-05',
    gender: 'M',
    dni: '44776666',
    phone: '+51 966 333 222',
    email: 'jorge.carpio@live.com',
    notes: 'Evaluación de ATM bilateral en boca abierta y boca cerrada. Sospecha de luxación discal anterior con reducción.'
  }
];

export const INITIAL_STUDIES: DentalStudy[] = [
  {
    id: 'std-1-1',
    patientId: 'pat-1',
    category: 'tomografia',
    subtype: 'FOV 13x15 Campo Bimaxilar',
    date: '2026-06-25',
    notes: 'Visualización tridimensional de maxilar superior e inferior. Densidad ósea tipo D2 en zona de premolares inferiores. Altura ósea remanente de 13.2mm a nivel de pieza 4.6.',
    imageUrl: 'tomografia-bimaxilar'
  },
  {
    id: 'std-1-2',
    patientId: 'pat-1',
    category: 'extraoral',
    subtype: 'Rx. Panorámica',
    date: '2026-06-25',
    notes: 'Reabsorción alveolar moderada generalizada. Piezas 1.8, 2.8, 3.8 y 4.8 ausentes. Tratamiento de conducto visible en pieza 3.6.',
    imageUrl: 'panorámica'
  },
  {
    id: 'std-2-1',
    patientId: 'pat-2',
    category: 'intraoral',
    subtype: 'Radiografía Periapical',
    date: '2026-07-02',
    notes: 'Zona radiolúcida periapical compatible con lesión osteolítica periapical en raíz distal de pieza 4.6. Conducto radicular calcificado a nivel del tercio medio.',
    imageUrl: 'periapical'
  },
  {
    id: 'std-2-2',
    patientId: 'pat-2',
    category: 'intraoral',
    subtype: 'Radiografía Oclusal',
    date: '2026-07-02',
    notes: 'Vista oclusal de maxilar inferior. No se aprecian expansiones de corticales ni restos radiculares retenidos en el sector anterior.',
    imageUrl: 'oclusal'
  },
  {
    id: 'std-3-1',
    patientId: 'pat-3',
    category: 'cefalometrico',
    subtype: 'Análisis Steiner',
    date: '2026-06-18',
    notes: 'Cefalometría lateral de cráneo. Relación esquelética de Clase II con retrognatismo mandibular (ANB = 6°). Incisivos superiores protruidos e inclinados vestibularmente.',
    imageUrl: 'cefalometria'
  },
  {
    id: 'std-3-2',
    patientId: 'pat-3',
    category: 'tomografia',
    subtype: 'FOV 13x15 ATM Boca Cerrada + FOV 8x15 Boca Abierta',
    date: '2026-06-18',
    notes: 'Estudio comparativo de ATM derecha e izquierda. En boca cerrada se observa disminución de espacio articular postero-superior bilateral. En boca abierta, la excursión condilar izquierda está limitada.',
    imageUrl: 'tomografia-atm'
  },
  {
    id: 'std-4-1',
    patientId: 'pat-4',
    category: 'extraoral',
    subtype: 'Radiografía ATM',
    date: '2026-07-01',
    notes: 'Estudio de articulación temporomandibular en proyecciones lateral estricta bilateral. Aplanamiento de la vertiente anterior del cóndilo mandibular derecho.',
    imageUrl: 'atm'
  },
  {
    id: 'std-4-2',
    patientId: 'pat-4',
    category: 'fotografia',
    subtype: 'Fotografía Clínica Extraoral (Frente y Perfil)',
    date: '2026-07-01',
    notes: 'Estudio fotográfico clínico facial. Se aprecia asimetría mandibular leve con desviación de la línea media dental inferior hacia la derecha en 2mm. Perfil convexo.',
    imageUrl: 'fotografia-extraoral'
  }
];

export const CBCT_PRESETS: Record<string, { title: string; desc: string; fov: string; slices: string[] }> = {
  'FOV 5x5 Campo Endodóntico': {
    title: 'Campo Endodóntico (Reducido) FOV 5x5',
    desc: 'Alta resolución espacial enfocada en un grupo de 2-3 dientes. Ideal para diagnóstico de conductos accesorios, fracturas radiculares y reabsorción interna.',
    fov: 'FOV 5x5 cm',
    slices: ['Pieza 3.6 - Reabsorción radicular externa visible.', 'Pieza 4.6 - Conductos radiculares con anatomía en forma de C.', 'Pieza 1.1 - Fractura horizontal en tercio medio radicular.']
  },
  'FOV 8x15 Campo Maxilar Superior': {
    title: 'Campo Maxilar Superior FOV 8x15',
    desc: 'Cubre todo el maxilar superior e incluye los senos maxilares bilaterales. Excelente para planear elevaciones de seno maxilar, implantes y diagnóstico de patologías sinusales.',
    fov: 'FOV 8x15 cm',
    slices: ['Pared sinusal basal conservada.', 'Pieza 1.6 con neumatización de seno maxilar.', 'Espesor de cresta alveolar promedio de 6.4mm en zona posterior.']
  },
  'FOV 8x15 Campo Maxilar Inferior': {
    title: 'Campo Maxilar Inferior FOV 8x15',
    desc: 'Cubre toda la mandíbula y el recorrido completo del nervio dentario inferior. Crucial para cirugías de terceros molares retenidos e implantes mandibulares.',
    fov: 'FOV 8x15 cm',
    slices: ['Trayecto del nervio alveolar inferior a 2.3mm del ápice del molar.', 'Corticales lingual y vestibular íntegras.', 'Densidad ósea excelente en zona de sínfisis.']
  },
  'FOV 13x15 Campo Bimaxilar': {
    title: 'Campo Bimaxilar FOV 13x15',
    desc: 'Estudio completo que abarca el complejo maxilomandibular en una sola adquisición. Ideal para ortodoncia, cirugía ortognática y rehabilitación total sobre implantes.',
    fov: 'FOV 13x15 cm',
    slices: ['Relación oclusal sagital.', 'Vía aérea faríngea permeable con área transversal mínima de 120 mm².', 'Cóndilos mandibulares centrados en cavidades glenoideas.']
  },
  'FOV 13x15 ATM Boca Cerrada + FOV 8x15 Boca Abierta': {
    title: 'Estudio Dinámico de ATM FOV 13x15 + 8x15',
    desc: 'Evaluación tridimensional comparativa de ambas articulaciones temporomandibulares en estado estático (boca cerrada) y dinámico (boca abierta). Evalúa erosión condilar, osteófitos y rango de movilidad.',
    fov: 'FOV 13x15 (Cerrada) + FOV 8x15 (Abierta)',
    slices: ['Cóndilo derecho con aplanamiento cortical anterior.', 'Excursión condilar izquierda reducida en máxima apertura.', 'Espacio articular superior disminuido bilateralmente.']
  }
};
