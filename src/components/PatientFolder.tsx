/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Patient, DentalStudy, StudyCategory } from '../types';
import { INITIAL_PATIENTS, INITIAL_STUDIES } from '../data';
import XRayEditor from './XRayEditor';
import CephalometricAnalysis from './CephalometricAnalysis';
import ConeBeamViewer from './ConeBeamViewer';
import ClinicalPhotography from './ClinicalPhotography';

import { 
  Folder, 
  FileText, 
  User, 
  Activity, 
  Plus, 
  Calendar, 
  Search, 
  Trash2, 
  Check, 
  Eye, 
  Sliders, 
  Compass, 
  Camera, 
  Box, 
  Award,
  Clock,
  Printer,
  X,
  FileSpreadsheet,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';

interface PatientFolderProps {
  isDarkMode?: boolean;
  onToggleTheme?: () => void;
}

export default function PatientFolder({ isDarkMode = true, onToggleTheme }: PatientFolderProps) {
  const [patients, setPatients] = useState<Patient[]>(() => {
    const saved = localStorage.getItem('dental_patients');
    return saved ? JSON.parse(saved) : INITIAL_PATIENTS;
  });

  const [studies, setStudies] = useState<DentalStudy[]>(() => {
    const saved = localStorage.getItem('dental_studies');
    return saved ? JSON.parse(saved) : INITIAL_STUDIES;
  });

  const [selectedPatientId, setSelectedPatientId] = useState<string>(() => {
    const saved = localStorage.getItem('dental_patients');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.length > 0) return parsed[0].id;
    }
    return 'pat-1';
  });

  // Navigation states
  const [activeTab, setActiveTab] = useState<'studies' | 'editor' | 'cephalometric' | 'cbct' | 'photos'>('studies');
  const [activeStudyId, setActiveStudyId] = useState<string | null>(null);

  // Search filter
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(true);

  // Form states for adding new patient
  const [showAddPatientModal, setShowAddPatientModal] = useState<boolean>(false);
  const [newPatient, setNewPatient] = useState<Partial<Patient>>({
    name: '',
    dni: '',
    birthDate: '',
    gender: 'M',
    phone: '',
    email: '',
    notes: ''
  });

  // Form states for adding new study
  const [showAddStudyModal, setShowAddStudyModal] = useState<boolean>(false);
  const [newStudy, setNewStudy] = useState<Partial<DentalStudy>>({
    category: 'intraoral',
    subtype: 'Radiografía Periapical',
    notes: '',
  });

  // Printable Report state
  const [showReportModal, setShowReportModal] = useState<boolean>(false);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('dental_patients', JSON.stringify(patients));
  }, [patients]);

  useEffect(() => {
    localStorage.setItem('dental_studies', JSON.stringify(studies));
  }, [studies]);

  const activePatient = patients.find(p => p.id === selectedPatientId) || patients[0];
  const activePatientStudies = studies.filter(s => s.patientId === selectedPatientId);
  const currentStudy = studies.find(s => s.id === activeStudyId);

  // Filter patients by search query
  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.dni.includes(searchQuery)
  );

  const handleCreatePatient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPatient.name || !newPatient.dni) return;

    const id = `pat-${Date.now()}`;
    const patientToAdd: Patient = {
      id,
      name: newPatient.name,
      dni: newPatient.dni,
      birthDate: newPatient.birthDate || '1990-01-01',
      gender: newPatient.gender as 'M' | 'F',
      phone: newPatient.phone || '',
      email: newPatient.email || '',
      notes: newPatient.notes || ''
    };

    setPatients([patientToAdd, ...patients]);
    setSelectedPatientId(id);
    setShowAddPatientModal(false);
    setNewPatient({
      name: '',
      dni: '',
      birthDate: '',
      gender: 'M',
      phone: '',
      email: '',
      notes: ''
    });
  };

  const handleDeletePatient = (patientId: string) => {
    if (confirm('¿Está seguro de eliminar este paciente y todos sus estudios asociados?')) {
      setPatients(patients.filter(p => p.id !== patientId));
      setStudies(studies.filter(s => s.patientId !== patientId));
      if (selectedPatientId === patientId) {
        const remaining = patients.filter(p => p.id !== patientId);
        if (remaining.length > 0) {
          setSelectedPatientId(remaining[0].id);
        }
      }
    }
  };

  const handleCreateStudy = (e: React.FormEvent) => {
    e.preventDefault();
    const id = `std-${Date.now()}`;
    
    // Choose template image reference based on chosen subtype
    let imageUrl = 'periapical';
    if (newStudy.category === 'extraoral') {
      imageUrl = newStudy.subtype?.toLowerCase().includes('panorámica') ? 'panorámica' : 'atm';
    } else if (newStudy.category === 'cefalometrico') {
      imageUrl = 'cefalometria';
    } else if (newStudy.category === 'fotografia') {
      imageUrl = 'fotografia';
    } else if (newStudy.category === 'tomografia') {
      imageUrl = 'tomografia-bimaxilar';
    }

    const studyToAdd: DentalStudy = {
      id,
      patientId: selectedPatientId,
      category: newStudy.category as StudyCategory,
      subtype: newStudy.subtype || 'Estudio Personalizado',
      date: new Date().toISOString().split('T')[0],
      notes: newStudy.notes || 'Ninguna observación cargada.',
      imageUrl
    };

    setStudies([studyToAdd, ...studies]);
    setShowAddStudyModal(false);
    setNewStudy({
      category: 'intraoral',
      subtype: 'Radiografía Periapical',
      notes: ''
    });
  };

  // Callback to update study modifications (filters, annotations, etc.)
  const handleUpdateStudy = (studyId: string, updates: Partial<DentalStudy>) => {
    setStudies(studies.map(s => {
      if (s.id === studyId) {
        return { ...s, ...updates };
      }
      return s;
    }));
  };

  const getCategoryIcon = (category: StudyCategory) => {
    switch (category) {
      case 'intraoral':
        return <Sliders className="text-blue-400" size={16} />;
      case 'extraoral':
        return <Award className="text-emerald-400" size={16} />;
      case 'cefalometrico':
        return <Compass className="text-purple-400" size={16} />;
      case 'fotografia':
        return <Camera className="text-rose-400" size={16} />;
      case 'tomografia':
        return <Box className="text-cyan-400" size={16} />;
    }
  };

  const getSubtypesForCategory = (cat: StudyCategory): string[] => {
    switch (cat) {
      case 'intraoral':
        return ['Radiografía Periapical', 'Radiografía Bitewing', 'Radiografía Oclusal', 'Serie Radiográfica'];
      case 'extraoral':
        return ['Rx. Panorámica', 'Lateral Estricta', 'Radiografía Towne', 'Radiografía Frontal', 'Radiografía Carpal', 'Radiografía ATM'];
      case 'cefalometrico':
        return ['Análisis Steiner', 'Análisis McNamara', 'Análisis USP', 'Análisis UPCH'];
      case 'fotografia':
        return ['Fotografía Clínica Facial (Frente)', 'Fotografía Clínica Facial (Perfil)', 'Fotografía Intraoral (Frente)', 'Fotografía Intraoral (Oclusal)'];
      case 'tomografia':
        return [
          'FOV 5x5 Campo Endodóntico',
          'FOV 8x15 Campo Maxilar Superior',
          'FOV 8x15 Campo Maxilar Inferior',
          'FOV 13x15 Campo Bimaxilar',
          'FOV 13x15 ATM Boca Cerrada + FOV 8x15 Boca Abierta'
        ];
    }
  };

  const openStudyWorkspace = (study: DentalStudy) => {
    setActiveStudyId(study.id);
    setActiveTab('editor');
  };

  return (
    <div className="flex flex-col lg:flex-row gap-2.5 h-full overflow-hidden" id="patient-folder-manager">
      
      {/* LEFT COLUMN: PATIENTS SEARCH & INDEX (30%) */}
      <div className={`shrink-0 flex flex-col border rounded-xl overflow-hidden shadow-2xs h-full transition-all duration-300 ${
        isDarkMode ? 'bg-[#1f1f1f] border-[#2b2b2b] text-slate-200' : 'bg-white border-slate-200 text-slate-800'
      } ${isSidebarCollapsed ? 'w-full lg:w-16' : 'w-full lg:w-72'}`}>
        
        {/* Patient listing search and header */}
        <div className={`p-2.5 border-b flex flex-col gap-2 shrink-0 ${
          isDarkMode ? 'bg-[#262626] border-[#333333]' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center flex-col gap-2' : 'justify-between'}`}>
            {!isSidebarCollapsed && (
              <h3 className={`font-bold text-xs flex items-center gap-1.5 ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>
                <User size={15} className="text-blue-500" />
                Pacientes
              </h3>
            )}
            <div className={`flex items-center gap-1.5 ${isSidebarCollapsed ? 'flex-col' : ''}`}>
              {!isSidebarCollapsed && (
                <button
                  onClick={() => setShowAddPatientModal(true)}
                  className="p-1 bg-blue-600 hover:bg-blue-750 text-white rounded-md transition-all cursor-pointer shadow-2xs flex items-center justify-center"
                  title="Añadir nuevo paciente"
                >
                  <Plus size={14} />
                </button>
              )}
              <button
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className={`p-1 border rounded-md transition-all cursor-pointer shadow-2xs flex items-center justify-center ${
                  isDarkMode ? 'bg-[#333333] border-[#444444] text-slate-300 hover:bg-[#3d3d3d]' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
                title={isSidebarCollapsed ? "Expandir lista de pacientes" : "Comprimir lista"}
              >
                {isSidebarCollapsed ? <PanelLeftOpen size={14} /> : <PanelLeftClose size={14} />}
              </button>
            </div>
          </div>

          {!isSidebarCollapsed && (
            <div className="relative">
              <Search className="absolute left-2 top-2 text-slate-400" size={13} />
              <input
                type="text"
                placeholder="Buscar paciente..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full rounded-md pl-7 pr-2.5 py-1.5 text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all border ${
                  isDarkMode 
                    ? 'bg-[#171717] border-[#383838] text-slate-100 placeholder-slate-500' 
                    : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400'
                }`}
              />
            </div>
          )}
        </div>

        {/* Scrollable Patient Cards */}
        <div className={`flex-1 h-0 overflow-y-auto divide-y ${
          isDarkMode ? 'bg-[#1f1f1f] divide-[#2b2b2b]' : 'bg-white divide-slate-100'
        } ${isSidebarCollapsed ? 'hide-scrollbar' : ''}`}>
          {filteredPatients.length === 0 ? (
            <div className={`p-6 text-center text-xs text-slate-500 ${isSidebarCollapsed ? 'hidden' : ''}`}>
              No se encontraron pacientes.
            </div>
          ) : (
            filteredPatients.map((p) => {
              const isSelected = p.id === selectedPatientId;
              const studyCount = studies.filter(s => s.patientId === p.id).length;
              
              if (isSidebarCollapsed) {
                return (
                  <div
                    key={p.id}
                    onClick={() => {
                      setSelectedPatientId(p.id);
                      setActiveTab('studies');
                      setActiveStudyId(null);
                    }}
                    title={`${p.name} - ${studyCount} estudios`}
                    className={`p-3 cursor-pointer transition-all flex justify-center items-center ${
                      isSelected 
                        ? (isDarkMode ? 'bg-[#2b2b2b] border-l-4 border-blue-500' : 'bg-blue-50/70 border-l-4 border-blue-500') 
                        : (isDarkMode ? 'hover:bg-[#262626] border-l-4 border-transparent' : 'hover:bg-slate-50/80 border-l-4 border-transparent')
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      isSelected 
                        ? 'bg-blue-500 text-white shadow-sm' 
                        : (isDarkMode ? 'bg-[#2a2a2a] text-slate-300 border border-[#383838]' : 'bg-slate-100 text-slate-500 border border-slate-200')
                    }`}>
                      {p.name.charAt(0).toUpperCase()}
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={p.id}
                  onClick={() => {
                    setSelectedPatientId(p.id);
                    setActiveTab('studies');
                    setActiveStudyId(null);
                  }}
                  className={`p-3 text-left cursor-pointer transition-all flex justify-between items-center ${
                    isSelected 
                      ? (isDarkMode ? 'bg-[#2d2d2d] border-l-4 border-blue-500 text-white' : 'bg-blue-50/70 border-l-4 border-blue-500 text-slate-900') 
                      : (isDarkMode ? 'hover:bg-[#262626] border-l-4 border-transparent text-slate-300' : 'hover:bg-slate-50/80 border-l-4 border-transparent text-slate-700')
                  }`}
                >
                  <div className="space-y-0.5 pr-2">
                    <h4 className={`text-xs font-bold ${isSelected ? (isDarkMode ? 'text-blue-400' : 'text-blue-600') : (isDarkMode ? 'text-slate-200' : 'text-slate-700')}`}>
                      {p.name}
                    </h4>
                    <p className="text-[10px] text-slate-400 font-mono">DNI: {p.dni}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[9px] border px-1.5 py-0.5 rounded-full font-mono ${
                      isDarkMode ? 'bg-[#181818] text-slate-400 border-[#333333]' : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}>
                      {studyCount} rx
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePatient(p.id);
                      }}
                      className="p-1 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded transition-all cursor-pointer"
                      title="Eliminar registro"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Selected Quick Patient profile summary */}
        {!isSidebarCollapsed && activePatient && (
          <div className={`p-3 border-t space-y-2 text-xs ${
            isDarkMode ? 'bg-[#262626] border-[#333333] text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
          }`}>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Ficha Rápida:</span>
            <div className="space-y-1 text-xs">
              <p className="flex justify-between">
                <span className="text-slate-400">Edad:</span> 
                <span className={`font-semibold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                  {new Date().getFullYear() - new Date(activePatient.birthDate).getFullYear()} años 
                  ({activePatient.gender === 'M' ? 'M' : 'F'})
                </span>
              </p>
              <p className="flex justify-between">
                <span className="text-slate-400">Celular:</span> <span className={`font-semibold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{activePatient.phone || '-'}</span>
              </p>
            </div>
            <div className="pt-1.5 border-t border-slate-700/40">
              <p className={`text-[10px] italic p-2 rounded border shadow-2xs ${
                isDarkMode ? 'bg-[#1a1a1a] border-[#383838] text-slate-300' : 'bg-white border-slate-200 text-slate-600'
              }`}>
                {activePatient.notes || 'Sin anotaciones médicas complementarias.'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* RIGHT COLUMN: MAIN WORKSPACE SWITCHER (70%) */}
      <div className={`flex-1 h-0 min-h-0 flex flex-col border rounded-xl overflow-hidden shadow-2xs h-full ${
        isDarkMode ? 'bg-[#1f1f1f] border-[#2b2b2b]' : 'bg-white border-slate-200'
      }`}>
        
        {/* Navigation Tabs bar */}
        <div className={`px-3 py-1.5 border-b flex flex-wrap gap-1.5 items-center shrink-0 ${
          isDarkMode ? 'bg-[#262626] border-[#333333]' : 'bg-slate-50 border-slate-200'
        }`}>
          <button
            onClick={() => setActiveTab('studies')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'studies' 
                ? (isDarkMode ? 'bg-[#333333] text-white shadow-xs border border-[#444444]' : 'bg-white text-slate-850 shadow-xs border border-slate-200') 
                : (isDarkMode ? 'text-slate-400 hover:text-slate-200 hover:bg-[#333333]/50' : 'text-slate-550 hover:text-slate-800 hover:bg-slate-100/50')
            }`}
          >
            <Folder size={14} className="text-blue-500" />
            Estudios de {activePatient ? activePatient.name.split(',')[1] || activePatient.name : ''}
          </button>
          
          {currentStudy && (
            <>
              <div className="self-center text-slate-500">/</div>
              <button
                onClick={() => setActiveTab('editor')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'editor' 
                    ? 'bg-blue-600 text-white shadow-xs font-bold' 
                    : (isDarkMode ? 'text-slate-400 hover:text-slate-200 hover:bg-[#333333]/50' : 'text-slate-550 hover:text-slate-800 hover:bg-slate-100/50')
                }`}
              >
                <Sliders size={14} className="text-blue-400" />
                Estación Digital Photopea Studio
              </button>
            </>
          )}
        </div>

        {/* WORKSPACE VIEWS PORT */}
        <div className={`flex-1 h-0 overflow-hidden flex flex-col ${isDarkMode ? 'bg-[#141414]' : 'bg-white'}`}>
          
          {/* Tab 1: STUDIES GRID VIEW */}
          {activeTab === 'studies' && (
            <div className={`h-full overflow-y-auto p-4 space-y-4 animate-fade-in ${isDarkMode ? 'bg-[#171717] text-slate-200' : 'bg-white text-slate-800'}`} id="studies-timeline-grid">
              
              {/* Study Panel header */}
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h3 className={`font-bold text-base ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Historial de Radiografías y Estudios</h3>
                  <p className="text-xs text-slate-400 mt-0.5 font-mono">Seleccione un estudio para cargarlo en las estaciones de diagnóstico.</p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setShowReportModal(true)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border shadow-2xs cursor-pointer transition-all ${
                      isDarkMode ? 'bg-[#2b2b2b] hover:bg-[#383838] text-slate-200 border-[#3d3d3d]' : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    <Printer size={14} />
                    Imprimir Informe
                  </button>
                  <button
                    onClick={() => setShowAddStudyModal(true)}
                    className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-750 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-sm cursor-pointer transition-all"
                  >
                    <Plus size={14} />
                    Nuevo Estudio (Rx)
                  </button>
                </div>
              </div>

              {/* Patient folder list grid cards */}
              {activePatientStudies.length === 0 ? (
                <div className={`p-12 border-2 border-dashed rounded-2xl text-center space-y-2 ${
                  isDarkMode ? 'border-[#333333] bg-[#1a1a1a]/50 text-slate-400' : 'border-slate-200 bg-slate-50/50 text-slate-400'
                }`}>
                  <Clock size={32} className="mx-auto text-slate-400" />
                  <p className={`text-xs font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>No hay estudios radiográficos cargados.</p>
                  <p className="text-[10px] text-slate-400">Utiliza el botón superior para añadir una nueva panorámica, periapical o tomografía Cone Beam.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 min-[1800px]:grid-cols-5 gap-4">
                  {activePatientStudies.map((study) => (
                    <div
                      key={study.id}
                      onClick={() => openStudyWorkspace(study)}
                      className={`border rounded-xl overflow-hidden shadow-sm hover:shadow transition-all cursor-pointer group flex flex-col justify-between ${
                        isDarkMode ? 'bg-[#222222] border-[#333333] hover:border-blue-500' : 'bg-white border-slate-200 hover:border-blue-400'
                      }`}
                    >
                      {/* Diagnostic Visual Card Thumbnail representation */}
                      <div className={`p-2.5 border-b flex justify-between items-center ${
                        isDarkMode ? 'bg-[#2a2a2a] border-[#333333]' : 'bg-slate-50 border-slate-200'
                      }`}>
                        <div className="flex items-center gap-2">
                          <span className={`p-1 rounded border ${
                            isDarkMode ? 'bg-[#181818] border-[#383838] text-blue-400' : 'bg-white border-slate-200 text-blue-500'
                          }`}>
                            {getCategoryIcon(study.category)}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                            {study.category}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                          <Calendar size={11} /> {study.date}
                        </span>
                      </div>

                      <div className="p-3.5 space-y-2 flex-1">
                        <h4 className={`text-xs font-bold group-hover:text-blue-400 transition-colors ${
                          isDarkMode ? 'text-slate-100' : 'text-slate-800'
                        }`}>
                          {study.subtype}
                        </h4>
                        <p className={`text-[11px] line-clamp-2 leading-relaxed p-2 rounded-lg border ${
                          isDarkMode ? 'bg-[#1a1a1a] border-[#333333] text-slate-400' : 'bg-slate-50 border-slate-100 text-slate-500'
                        }`}>
                          {study.notes}
                        </p>
                      </div>

                      {/* Launch workstation action */}
                      <div className={`px-3.5 py-2 border-t flex justify-between items-center text-[10px] font-mono font-semibold text-slate-400 transition-all ${
                        isDarkMode ? 'bg-[#2a2a2a] border-[#333333] group-hover:bg-[#333333]' : 'bg-slate-50 border-slate-100 group-hover:bg-slate-100/60'
                      }`}>
                        <span>Análisis Disponible</span>
                        <span className="text-blue-400 flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
                          Ver Estudio →
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>
          )}

          {/* Tab 2: WORKSPACE LOADERS */}
          {activeTab === 'editor' && currentStudy && (
            <div className="animate-fade-in h-full overflow-hidden">
              <XRayEditor study={currentStudy} patientName={activePatient.name} onSave={handleUpdateStudy} isDarkMode={isDarkMode} />
            </div>
          )}

        </div>

      </div>

      {/* MODAL 1: ADD NEW PATIENT */}
      {showAddPatientModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-md w-full shadow-xl relative space-y-4">
            <button
              onClick={() => setShowAddPatientModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 cursor-pointer p-1 rounded-full hover:bg-slate-100"
            >
              <X size={18} />
            </button>

            <div>
              <h3 className="text-sm font-bold text-slate-850 flex items-center gap-2">
                <User size={16} className="text-blue-500" />
                Registrar Nuevo Paciente
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Complete la información de filiación del paciente.</p>
            </div>

            <form onSubmit={handleCreatePatient} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1 col-span-2">
                  <label className="text-slate-600 font-medium">Nombre Completo:</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Perez Prado, Juan"
                    value={newPatient.name}
                    onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-600 font-medium">DNI o Documento:</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. 10469501"
                    value={newPatient.dni}
                    onChange={(e) => setNewPatient({ ...newPatient, dni: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-600 font-medium">Género:</label>
                  <select
                    value={newPatient.gender}
                    onChange={(e) => setNewPatient({ ...newPatient, gender: e.target.value as 'M' | 'F' })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                  >
                    <option value="M">Masculino</option>
                    <option value="F">Femenino</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-600 font-medium">Fecha de Nacimiento:</label>
                  <input
                    type="date"
                    value={newPatient.birthDate}
                    onChange={(e) => setNewPatient({ ...newPatient, birthDate: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-850 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-600 font-medium">Teléfono Celular:</label>
                  <input
                    type="text"
                    placeholder="+51 900 000"
                    value={newPatient.phone}
                    onChange={(e) => setNewPatient({ ...newPatient, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                  />
                </div>

                <div className="space-y-1 col-span-2">
                  <label className="text-slate-600 font-medium">Correo Electrónico:</label>
                  <input
                    type="email"
                    placeholder="ejemplo@correo.com"
                    value={newPatient.email}
                    onChange={(e) => setNewPatient({ ...newPatient, email: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                  />
                </div>

                <div className="space-y-1 col-span-2">
                  <label className="text-slate-600 font-medium">Observaciones Clínicas:</label>
                  <textarea
                    rows={2}
                    placeholder="Ej. Presenta dolor, sospecha de fisura dental..."
                    value={newPatient.notes}
                    onChange={(e) => setNewPatient({ ...newPatient, notes: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddPatientModal(false)}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-semibold cursor-pointer transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-750 text-white rounded-lg text-xs font-semibold cursor-pointer transition-all"
                >
                  Registrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD NEW STUDY */}
      {showAddStudyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-md w-full shadow-xl relative space-y-4">
            <button
              onClick={() => setShowAddStudyModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 cursor-pointer p-1 rounded-full hover:bg-slate-100"
            >
              <X size={18} />
            </button>

            <div>
              <h3 className="text-sm font-bold text-slate-850 flex items-center gap-2">
                <Plus size={16} className="text-blue-500" />
                Registrar Nuevo Estudio Radiográfico
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Asocie una nueva placa o simulación a {activePatient?.name}.</p>
            </div>

            <form onSubmit={handleCreateStudy} className="space-y-4 text-xs">
              
              {/* Category selector */}
              <div className="space-y-1">
                <label className="text-slate-600 font-medium">Categoría del Estudio:</label>
                <select
                  value={newStudy.category}
                  onChange={(e) => {
                    const cat = e.target.value as StudyCategory;
                    const defaultSub = getSubtypesForCategory(cat)[0];
                    setNewStudy({ ...newStudy, category: cat, subtype: defaultSub });
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:border-blue-500"
                >
                  <option value="intraoral">Radiografías Intraorales</option>
                  <option value="extraoral">Radiografías Extraorales</option>
                  <option value="cefalometrico">Análisis Cefalométrico</option>
                  <option value="fotografia">Fotografía Clínica</option>
                  <option value="tomografia">Tomografía Cone Beam</option>
                </select>
              </div>

              {/* Subtype selector */}
              <div className="space-y-1">
                <label className="text-slate-600 font-medium">Tipo Específico:</label>
                <select
                  value={newStudy.subtype}
                  onChange={(e) => setNewStudy({ ...newStudy, subtype: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:border-blue-500"
                >
                  {getSubtypesForCategory((newStudy.category as StudyCategory) || 'intraoral').map((sub) => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </select>
              </div>

              {/* Study Clinician notes */}
              <div className="space-y-1">
                <label className="text-slate-600 font-medium">Observación Diagnóstica Inicial:</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Ej. Pieza 4.6 presenta sombra compatible con caries. Alveolo con pérdida ósea..."
                  value={newStudy.notes}
                  onChange={(e) => setNewStudy({ ...newStudy, notes: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddStudyModal(false)}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-semibold cursor-pointer transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-750 text-white rounded-lg text-xs font-semibold cursor-pointer transition-all"
                >
                  Registrar Placa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: MEDICAL CLINICAL REPORT FOR PRINTING */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in overflow-y-auto">
          <div className="bg-white text-slate-900 rounded-2xl p-6 max-w-2xl w-full shadow-2xl relative space-y-6 my-8">
            
            <button
              onClick={() => setShowReportModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 cursor-pointer p-1 rounded-full hover:bg-slate-100 hidden-print"
            >
              <X size={20} />
            </button>

            {/* Print trigger button inside modal */}
            <div className="flex justify-end hidden-print">
              <button
                onClick={() => window.print()}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-750 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md transition-all"
              >
                <Printer size={15} />
                Confirmar Impresión / PDF
              </button>
            </div>

            {/* Print boundaries */}
            <div className="space-y-6 print-content">
              {/* Report Header Logo */}
              <div className="flex justify-between items-start border-b-2 border-slate-200 pb-4">
                <div>
                  <h1 className="text-xl font-extrabold text-blue-900 tracking-tight uppercase">DentoScan Pro</h1>
                  <p className="text-[10px] text-slate-500 font-mono">LABORATORIO & CONSULTORIO RADIOLÓGICO ESPECIALIZADO</p>
                  <p className="text-xs text-slate-600 mt-1">Av. Central 456, San Isidro | Tel: (01) 445-8890</p>
                </div>
                <div className="text-right font-mono text-[10px] text-slate-500 space-y-0.5">
                  <p><b>INFORME Nº:</b> INF-{activePatient.dni}</p>
                  <p><b>FECHA:</b> {new Date().toLocaleDateString()}</p>
                  <p><b>EMISIÓN:</b> AUTOMÁTICA</p>
                </div>
              </div>

              {/* Filiación Paciente */}
              <div className="space-y-2">
                <h3 className="text-xs font-extrabold text-blue-950 uppercase tracking-wider bg-slate-100 p-1.5 rounded-lg">Filiación del Paciente</h3>
                <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs">
                  <p><b>Paciente:</b> {activePatient.name}</p>
                  <p><b>Documento (DNI):</b> {activePatient.dni}</p>
                  <p><b>Fecha de Nacimiento:</b> {activePatient.birthDate}</p>
                  <p><b>Sexo:</b> {activePatient.gender === 'M' ? 'Masculino' : 'Femenino'}</p>
                  <p><b>Celular:</b> {activePatient.phone || '-'}</p>
                  <p><b>Email:</b> {activePatient.email || '-'}</p>
                </div>
              </div>

              {/* Diagnósticos del Historial */}
              <div className="space-y-3">
                <h3 className="text-xs font-extrabold text-blue-950 uppercase tracking-wider bg-slate-100 p-1.5 rounded-lg">Análisis de Placas y Hallazgos Registrados</h3>
                
                {activePatientStudies.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">No hay observaciones cargadas para este paciente.</p>
                ) : (
                  <div className="space-y-3.5">
                    {activePatientStudies.map((s, idx) => (
                      <div key={s.id} className="text-xs border-b border-slate-100 pb-2.5 last:border-0">
                        <div className="flex justify-between font-bold text-slate-800">
                          <span>{idx + 1}. {s.subtype} <span className="font-normal font-mono text-[10px] text-slate-500">({s.category})</span></span>
                          <span className="font-mono text-slate-500 text-[10px]">{s.date}</span>
                        </div>
                        <p className="text-slate-600 mt-1 pl-3.5 leading-relaxed italic border-l-2 border-slate-300">
                          {s.notes}
                        </p>
                        {/* Display annotations if any */}
                        {s.annotations && s.annotations.length > 0 && (
                          <div className="mt-1.5 pl-3.5 text-[11px] text-slate-500">
                            <b>Mediciones y Anotaciones de la Estación:</b>
                            <ul className="list-disc pl-4 mt-0.5 space-y-0.5">
                              {s.annotations.map((ann) => (
                                <li key={ann.id}>
                                  {ann.type === 'line' && `Medición lineal realizada: ${ann.lengthMm} mm.`}
                                  {ann.type === 'text' && `Marcador de diagnóstico: "${ann.text}".`}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Signatures footer area */}
              <div className="pt-12 flex justify-between gap-12 text-center text-xs">
                <div className="flex-1 space-y-1">
                  <div className="border-t border-slate-300 mx-auto w-40 pt-1.5" />
                  <p className="font-bold text-slate-850">Radiólogo de Turno</p>
                  <p className="text-[10px] text-slate-500">COLEGIO ODONTOLÓGICO DEL PERÚ</p>
                </div>
                <div className="flex-1 space-y-1">
                  <div className="border-t border-slate-300 mx-auto w-40 pt-1.5" />
                  <p className="font-bold text-slate-850">Odontólogo Especialista</p>
                  <p className="text-[10px] text-slate-500">Firma Autorizada</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
