import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
    ArrowLeft, School, Users, BookOpen, Calendar,
    UserCheck, MapPin, Hash, Loader2, AlertCircle, GraduationCap,
    Phone, ChevronRight, BarChart3
} from 'lucide-react';
import api from '../../lib/api';

type Tab = 'overview' | 'students' | 'teachers' | 'timetable';

export default function ClassDetailPage() {
    const { classId } = useParams<{ classId: string }>();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<Tab>('overview');

    const { data, isLoading, error } = useQuery({
        queryKey: ['class-detail', classId],
        queryFn: async () => {
            const res = await api.get(`/classes/${classId}`);
            return res.data;
        },
        enabled: !!classId,
    });

    const handleBack = () => {
        navigate('/settings/classes');
    };

    // ── Loading ──────────────────────────────────────────────────
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                <p className="text-sm text-neutral-500 font-medium">Chargement de la classe…</p>
            </div>
        );
    }

    // ── Error ────────────────────────────────────────────────────
    if (error || !data?.class) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
                    <AlertCircle size={32} className="text-error" />
                </div>
                <h2 className="text-xl font-bold text-neutral-900">Classe introuvable</h2>
                <p className="text-sm text-neutral-500">La classe que vous recherchez n'existe pas.</p>
                <button
                    onClick={handleBack}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors w-full sm:w-auto"
                >
                    <ArrowLeft size={14} /> Retour
                </button>
            </div>
        );
    }

    const cls = data.class;
    const students = data.students || [];
    const assignments = cls.teacherAssignments || [];
    const section = cls.section;
    const titulaire = cls.titulaire;
    const totalSubjects = data.totalSubjects ?? 0;
    const currentStudents = data.currentStudents ?? 0;
    const subjectsAssigned = data.subjectsAssigned ?? 0;
    const pct = cls.maxStudents > 0 ? Math.round((currentStudents / cls.maxStudents) * 100) : 0;

    const maleCount = students.filter((s: any) => s.sexe === 'M').length;
    const femaleCount = students.filter((s: any) => s.sexe === 'F').length;

    const tabs: { id: Tab; label: string; icon: any; count?: number }[] = [
        { id: 'overview', label: 'Aperçu', icon: BarChart3 },
        { id: 'students', label: 'Élèves', icon: Users, count: currentStudents },
        { id: 'teachers', label: 'Enseignants', icon: BookOpen, count: subjectsAssigned },
        { id: 'timetable', label: 'Emploi du temps', icon: Calendar },
    ];

    return (
        <div className="space-y-4 sm:space-y-6 pb-12 w-full overflow-hidden">
            {/* ── Top Bar ──────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 w-full">
                <button
                    onClick={handleBack}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors w-full sm:w-auto"
                >
                    <ArrowLeft size={16} />
                    Retour aux classes
                </button>
                <button
                    onClick={() => navigate(`/students?class=${classId}`)}
                    className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors shadow-sm w-full sm:w-auto"
                >
                    <Users size={16} />
                    Voir tous les élèves
                </button>
            </div>

            {/* ── Class Header Card ───────────────────────────────── */}
            <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden w-full">
                <div className="bg-gradient-to-r from-primary/5 to-primary/10 p-4 sm:p-8">
                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-5">
                        {/* Icon */}
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary text-white rounded-xl sm:rounded-2xl flex items-center justify-center shadow-md shrink-0">
                                <School size={24} />
                            </div>
                            <div className="sm:hidden flex-1 min-w-0">
                                <h1 className="text-xl font-bold text-neutral-900 truncate leading-tight">{cls.name}</h1>
                                <p className="text-xs text-neutral-600 truncate mt-0.5">
                                    {section?.year === 1 ? '1ère' : `${section?.year}ème`} année — {section?.name}
                                </p>
                            </div>
                        </div>

                        {/* Info for desktop (hidden on mobile header part, moved above) */}
                        <div className="hidden sm:block flex-1 min-w-0">
                            <h1 className="text-3xl font-bold text-neutral-900 truncate">{cls.name}</h1>
                            <p className="text-sm text-neutral-600 mt-1 truncate">
                                {section?.year === 1 ? '1ère' : `${section?.year}ème`} année — {section?.name}
                            </p>
                        </div>
                        
                        {/* Badges */}
                        <div className="flex flex-wrap items-center gap-2 sm:mt-3">
                            {cls.room && (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/80 border border-neutral-200 rounded-lg text-xs font-semibold text-neutral-700">
                                    <MapPin size={12} /> Salle {cls.room}
                                </span>
                            )}
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/80 border border-neutral-200 rounded-lg text-xs font-semibold text-neutral-700">
                                <Hash size={12} /> {section?.code}
                            </span>
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${
                                pct >= 80 ? 'bg-green-50 text-green-700 border-green-200'
                                : pct >= 50 ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                                : 'bg-red-50 text-red-700 border-red-200'
                            }`}>
                                <Users size={12} /> {currentStudents}/{cls.maxStudents} ({pct}%)
                            </span>
                        </div>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 border-t border-neutral-200">
                    <div className="p-3 sm:p-5 text-center border-r border-b sm:border-b-0 border-neutral-100">
                        <p className="text-xl sm:text-2xl font-bold text-primary">{currentStudents}</p>
                        <p className="text-[10px] sm:text-xs text-neutral-500 mt-0.5 truncate">Élèves inscrits</p>
                    </div>
                    <div className="p-3 sm:p-5 text-center border-b sm:border-b-0 border-neutral-100 sm:border-r">
                        <p className="text-xl sm:text-2xl font-bold text-info whitespace-nowrap">{subjectsAssigned}/{totalSubjects}</p>
                        <p className="text-[10px] sm:text-xs text-neutral-500 mt-0.5 truncate">Matières</p>
                    </div>
                    <div className="p-3 sm:p-5 text-center border-r border-neutral-100">
                        <p className="text-xl sm:text-2xl font-bold text-accent whitespace-nowrap">{maleCount}G / {femaleCount}F</p>
                        <p className="text-[10px] sm:text-xs text-neutral-500 mt-0.5 truncate">Répartition G/F</p>
                    </div>
                    <div className="p-3 sm:p-5 text-center">
                        <p className="text-sm sm:text-2xl font-bold text-neutral-700 truncate line-clamp-1 mt-1 sm:mt-0">
                            {titulaire ? `${titulaire.nom}` : '—'}
                        </p>
                        <p className="text-[10px] sm:text-xs text-neutral-500 mt-0.5 truncate">Titulaire</p>
                    </div>
                </div>
            </div>

            {/* ── Tabs Navigation ─────────────────────────────────── */}
            <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-sm w-full">
                <div className="border-b border-neutral-200 w-full overflow-x-auto scrollbar-hide">
                    <div className="flex w-max min-w-full">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-4 py-3 sm:px-5 sm:py-3.5 text-xs sm:text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                                        activeTab === tab.id
                                            ? 'border-primary text-primary'
                                            : 'border-transparent text-neutral-600 hover:text-neutral-900'
                                    }`}
                                >
                                    <Icon size={16} />
                                    {tab.label}
                                    {tab.count !== undefined && (
                                        <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                                            activeTab === tab.id
                                                ? 'bg-primary/10 text-primary'
                                                : 'bg-neutral-100 text-neutral-500'
                                        }`}>
                                            {tab.count}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* ── Tab Content ─────────────────────────────────── */}
                <div className="p-4 sm:p-6">

                    {/* ═══ OVERVIEW TAB ═══ */}
                    {activeTab === 'overview' && (
                        <div className="space-y-6">
                            {/* Titulaire Card */}
                            <div>
                                <h3 className="text-sm font-bold text-neutral-500 uppercase tracking-wider mb-3">
                                    👨‍🏫 Titulaire de classe
                                </h3>
                                {titulaire ? (
                                    <div className="flex items-center gap-4 p-4 bg-primary/5 rounded-xl border border-primary/10">
                                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-lg">
                                            {titulaire.nom.charAt(0)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-neutral-900">
                                                {titulaire.nom} {titulaire.postNom} {titulaire.prenom || ''}
                                            </p>
                                            {titulaire.telephone && (
                                                <p className="text-sm text-neutral-500 flex items-center gap-1 mt-0.5">
                                                    <Phone size={12} /> {titulaire.telephone}
                                                </p>
                                            )}
                                        </div>
                                        <UserCheck size={20} className="text-primary shrink-0" />
                                    </div>
                                ) : (
                                    <div className="p-4 bg-orange-50 rounded-xl border border-orange-100 text-sm text-orange-700 font-medium">
                                        Aucun titulaire assigné à cette classe.
                                    </div>
                                )}
                            </div>

                            {/* Info Grid */}
                            <div>
                                <h3 className="text-sm font-bold text-neutral-500 uppercase tracking-wider mb-3">
                                    📋 Informations générales
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {[
                                        { label: 'Nom de la classe', value: cls.name },
                                        { label: 'Section', value: `${section?.name} (${section?.code})` },
                                        { label: 'Année', value: section?.year === 1 ? '1ère année' : `${section?.year}ème année` },
                                        { label: 'Salle', value: cls.room || 'Non définie' },
                                        { label: 'Effectif max', value: `${cls.maxStudents} élèves` },
                                        { label: 'Effectif actuel', value: `${currentStudents} élèves (${pct}%)` },
                                        { label: 'Matières configurées', value: `${subjectsAssigned} / ${totalSubjects} attribuées` },
                                        { label: 'Statut', value: cls.isActive ? '✅ Active' : '❌ Inactive' },
                                    ].map((item, i) => (
                                        <div key={i} className="bg-neutral-50 rounded-lg p-3 border border-neutral-100">
                                            <p className="text-xs text-neutral-500 font-medium">{item.label}</p>
                                            <p className="text-sm font-semibold text-neutral-900 mt-0.5">{item.value}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div>
                                <h3 className="text-sm font-bold text-neutral-500 uppercase tracking-wider mb-3">
                                    ⚡ Actions rapides
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <button
                                        onClick={() => setActiveTab('students')}
                                        className="flex items-center justify-between p-4 bg-white rounded-xl border border-neutral-200 hover:border-primary/30 hover:shadow-sm group transition-all"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Users size={18} className="text-primary" />
                                            <span className="text-sm font-semibold text-neutral-800">Voir les élèves</span>
                                        </div>
                                        <ChevronRight size={16} className="text-neutral-400 group-hover:text-primary transition-colors" />
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('teachers')}
                                        className="flex items-center justify-between p-4 bg-white rounded-xl border border-neutral-200 hover:border-primary/30 hover:shadow-sm group transition-all"
                                    >
                                        <div className="flex items-center gap-3">
                                            <BookOpen size={18} className="text-info" />
                                            <span className="text-sm font-semibold text-neutral-800">Attributions</span>
                                        </div>
                                        <ChevronRight size={16} className="text-neutral-400 group-hover:text-primary transition-colors" />
                                    </button>
                                    <button
                                        onClick={() => navigate(`/students?class=${classId}`)}
                                        className="flex items-center justify-between p-4 bg-white rounded-xl border border-neutral-200 hover:border-primary/30 hover:shadow-sm group transition-all"
                                    >
                                        <div className="flex items-center gap-3">
                                            <GraduationCap size={18} className="text-accent" />
                                            <span className="text-sm font-semibold text-neutral-800">Gestion complète</span>
                                        </div>
                                        <ChevronRight size={16} className="text-neutral-400 group-hover:text-primary transition-colors" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ═══ STUDENTS TAB ═══ */}
                    {activeTab === 'students' && (
                        <div>
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                                <h3 className="text-lg font-bold text-neutral-900">
                                    Liste des élèves ({students.length})
                                </h3>
                                <div className="flex items-center gap-3 text-xs font-semibold">
                                    <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-100">
                                        {maleCount} Garçons
                                    </span>
                                    <span className="px-2.5 py-1 bg-pink-50 text-pink-700 rounded-full border border-pink-100">
                                        {femaleCount} Filles
                                    </span>
                                </div>
                            </div>

                            {students.length === 0 ? (
                                <div className="text-center py-12">
                                    <Users size={40} className="mx-auto text-neutral-300 mb-3" />
                                    <p className="text-sm font-medium text-neutral-600">Aucun élève inscrit dans cette classe.</p>
                                    <p className="text-xs text-neutral-400 mt-1">Les élèves apparaîtront ici après leur inscription.</p>
                                </div>
                            ) : (
                                <>
                                    {/* Table for Desktop */}
                                    <div className="hidden md:block overflow-x-auto">
                                        <table className="w-full min-w-[500px]">
                                            <thead>
                                                <tr className="bg-neutral-50/50 border-b border-neutral-200">
                                                    <th className="text-left text-xs font-bold text-neutral-500 uppercase tracking-wider px-4 py-3">N°</th>
                                                    <th className="text-left text-xs font-bold text-neutral-500 uppercase tracking-wider px-4 py-3">Élève</th>
                                                    <th className="text-left text-xs font-bold text-neutral-500 uppercase tracking-wider px-4 py-3 hidden sm:table-cell">Matricule</th>
                                                    <th className="text-center text-xs font-bold text-neutral-500 uppercase tracking-wider px-4 py-3">Sexe</th>
                                                    <th className="text-right text-xs font-bold text-neutral-500 uppercase tracking-wider px-4 py-3">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-neutral-100">
                                                {students.map((s: any, index: number) => (
                                                    <tr
                                                        key={s.id}
                                                        className="hover:bg-primary/5 transition-colors cursor-pointer"
                                                        onClick={() => navigate(`/students/${s.id}`)}
                                                    >
                                                        <td className="px-4 py-3 text-sm text-neutral-500 font-mono">{index + 1}</td>
                                                        <td className="px-4 py-3">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary text-xs font-bold shrink-0">
                                                                    {s.nom?.charAt(0)}{s.postNom?.charAt(0)}
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <p className="text-sm font-semibold text-neutral-900 truncate">
                                                                        {s.nom} {s.postNom} {s.prenom || ''}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3 text-sm text-neutral-600 font-mono hidden sm:table-cell">{s.matricule}</td>
                                                        <td className="px-4 py-3 text-center">
                                                            <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                                                                s.sexe === 'M' ? 'bg-blue-50 text-blue-700' : 'bg-pink-50 text-pink-700'
                                                            }`}>
                                                                {s.sexe}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 text-right">
                                                            <ChevronRight size={16} className="text-neutral-400 inline" />
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Cards for Mobile */}
                                    <div className="md:hidden space-y-3 mt-2">
                                        {students.map((s: any, index: number) => (
                                            <div 
                                                key={s.id} 
                                                onClick={() => navigate(`/students/${s.id}`)} 
                                                className="bg-white p-4 rounded-xl border border-neutral-200 shadow-sm flex flex-col gap-3 active:scale-[0.98] transition-all"
                                            >
                                                <div className="flex justify-between items-start gap-2">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold shrink-0 text-lg">
                                                            {s.nom?.charAt(0)}{s.postNom?.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-neutral-900 leading-tight">
                                                                {s.nom} {s.postNom} {s.prenom || ''}
                                                            </p>
                                                            <p className="text-xs text-neutral-500 font-mono mt-0.5">{s.matricule}</p>
                                                        </div>
                                                    </div>
                                                    <span className={`text-xs font-bold px-2 py-1 rounded shrink-0 ${s.sexe === 'M' ? 'bg-blue-50 text-blue-700' : 'bg-pink-50 text-pink-700'}`}>
                                                        {s.sexe}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between mt-1 text-xs text-neutral-400">
                                                    <span>N° {index + 1}</span>
                                                    <span className="flex items-center gap-1 text-primary">Voir profil <ChevronRight size={14} /></span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {/* ═══ TEACHERS TAB ═══ */}
                    {activeTab === 'teachers' && (
                        <div>
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                                <h3 className="text-lg font-bold text-neutral-900">
                                    Attribution des enseignants ({assignments.length}/{totalSubjects})
                                </h3>
                            </div>

                            {assignments.length === 0 ? (
                                <div className="text-center py-12">
                                    <BookOpen size={40} className="mx-auto text-neutral-300 mb-3" />
                                    <p className="text-sm font-medium text-neutral-600">Aucune attribution encore.</p>
                                    <p className="text-xs text-neutral-400 mt-1">
                                        Allez dans Gestion des classes → Attribution enseignants pour configurer.
                                    </p>
                                </div>
                            ) : (
                                <>
                                    {/* Table for Desktop */}
                                    <div className="hidden md:block overflow-x-auto">
                                        <table className="w-full min-w-[400px]">
                                            <thead>
                                                <tr className="bg-neutral-50/50 border-b border-neutral-200">
                                                    <th className="text-left text-xs font-bold text-neutral-500 uppercase tracking-wider px-4 py-3">Matière</th>
                                                    <th className="text-left text-xs font-bold text-neutral-500 uppercase tracking-wider px-4 py-3">Enseignant</th>
                                                    <th className="text-left text-xs font-bold text-neutral-500 uppercase tracking-wider px-4 py-3 hidden sm:table-cell">Contact</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-neutral-100">
                                                {assignments.map((a: any) => (
                                                    <tr key={a.id} className="hover:bg-primary/5 transition-colors">
                                                        <td className="px-4 py-3">
                                                            <div>
                                                                <p className="text-sm font-semibold text-neutral-900">{a.subject?.name}</p>
                                                                <p className="text-[10px] text-neutral-400 font-mono">{a.subject?.abbreviation} • /{a.subject?.maxScore}</p>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-7 h-7 bg-info/10 rounded-full flex items-center justify-center text-info text-[10px] font-bold shrink-0">
                                                                    {a.teacher?.nom?.charAt(0)}
                                                                </div>
                                                                <p className="text-sm font-medium text-neutral-800">
                                                                    {a.teacher?.nom} {a.teacher?.prenom || ''}
                                                                </p>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3 text-sm text-neutral-500 hidden sm:table-cell">
                                                            {a.teacher?.telephone || '—'}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    
                                    {/* Cards for Mobile */}
                                    <div className="md:hidden space-y-3 mt-2">
                                        {assignments.map((a: any) => (
                                            <div key={a.id} className="bg-white p-4 rounded-xl border border-neutral-200 shadow-sm flex flex-col gap-3">
                                                <div className="flex items-start gap-3">
                                                    <div className="w-10 h-10 bg-info/10 rounded-full flex items-center justify-center text-info font-bold shrink-0 text-lg">
                                                        {a.teacher?.nom?.charAt(0)}
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="font-bold text-neutral-900 leading-tight">
                                                            {a.teacher?.nom} {a.teacher?.prenom || ''}
                                                        </p>
                                                        <div className="bg-neutral-50 p-2 rounded-lg mt-2 border border-neutral-100">
                                                            <p className="text-sm font-semibold text-primary">{a.subject?.name}</p>
                                                            <p className="text-[10px] text-neutral-500 font-mono">{a.subject?.abbreviation} • Maxi: {a.subject?.maxScore} pts</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                {a.teacher?.telephone && (
                                                    <div className="text-xs font-semibold text-neutral-600 bg-neutral-100/50 px-3 py-1.5 rounded-lg flex items-center gap-2">
                                                        <Phone size={12} className="text-neutral-400" /> {a.teacher.telephone}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}

                            {/* Unassigned subjects hint */}
                            {subjectsAssigned < totalSubjects && (
                                <div className="mt-4 p-3 bg-orange-50 border border-orange-100 rounded-lg text-sm text-orange-700">
                                    <strong>⚠ {totalSubjects - subjectsAssigned} matière(s)</strong> de la section ne sont pas encore attribuées à un enseignant.
                                </div>
                            )}
                        </div>
                    )}

                    {/* ═══ TIMETABLE TAB ═══ */}
                    {activeTab === 'timetable' && (
                        <div className="text-center py-12">
                            <Calendar size={48} className="mx-auto text-neutral-300 mb-4" />
                            <p className="text-lg font-bold text-neutral-700">Emploi du temps</p>
                            <p className="text-sm text-neutral-500 mt-2 max-w-md mx-auto">
                                L'emploi du temps de cette classe est disponible dans la rubrique <strong>"Emploi du temps"</strong> du menu principal.
                            </p>
                            <button
                                onClick={() => navigate('/timetable')}
                                className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary-hover transition-colors w-full sm:w-auto"
                            >
                                <Calendar size={16} /> Aller à l'emploi du temps
                            </button>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
