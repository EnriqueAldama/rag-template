import React, { useState, useMemo } from 'react';
import { useAssessment } from '../context/AssessmentContext';

// --- Icons ---
const CheckIcon = () => (
    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
    </svg>
);

const LockIcon = () => (
    <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
);

const PlayIcon = () => (
    <svg className="w-6 h-6 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M8 5v14l11-7z" />
    </svg>
);

const ROADMAP_MODULES = [
    { id: 1, title: 'Conceptos Básicos de Desarrollo', status: 'completed' },
    { id: 2, title: 'Fundamentos de React', status: 'completed' },
    { id: 3, title: 'State Management & Hooks', status: 'completed' },
    { id: 4, title: 'Arquitectura de APIs en Node.js', status: 'current' },
    { id: 5, title: 'Bases de Datos con SQL', status: 'locked' },
    { id: 6, title: 'Seguridad y Rendimiento', status: 'locked' },
    { id: 7, title: 'Despliegue y DevOps B2B', status: 'locked' }
];

const RoadmapNode = ({ module, index, onLessonOpen }) => {
    // Determine positioning for winding path (-1 = left, 0 = center, 1 = right)
    const pattern = [0, -1, -1, 0, 1, 1];
    const horizontalOffset = pattern[index % pattern.length];

    let offsetClass = 'translate-x-0';
    if (horizontalOffset === -1) offsetClass = '-translate-x-12 md:-translate-x-24';
    if (horizontalOffset === 1) offsetClass = 'translate-x-12 md:translate-x-24';

    // Style configuration based on status
    const getStyles = () => {
        switch (module.status) {
            case 'completed':
                return {
                    container: 'bg-purple-600 shadow-md shadow-purple-600/20 border-white/10',
                    icon: <CheckIcon />,
                    ring: 'border-transparent' // Remove dotted outer ring for clean look
                };
            case 'current':
                return {
                    container: 'bg-black/50 backdrop-blur-md shadow-xl border-purple-500 hover:scale-105 active:scale-95 animate-pulse-slow border-2',
                    icon: <PlayIcon />,
                    ring: 'border-purple-500/50 scale-110 shadow-[0_0_15px_rgba(168,85,247,0.4)]'
                };
            case 'locked':
            default:
                return {
                    container: 'bg-transparent border-white/10 border-2',
                    icon: <LockIcon />,
                    ring: 'border-transparent' // Remove dotted outer ring for clean look
                };
        }
    };

    const { container, icon, ring } = getStyles();

    return (
        <div className={`relative flex flex-col items-center justify-center my-8 z-10 ${offsetClass} transition-all duration-700 group`}>
            {/* Outer Decorative Ring */}
            <div className={`absolute w-16 h-16 md:w-20 md:h-20 rounded-full border border-dashed ${ring} transition-all duration-500`}></div>

            {/* Main Interactive Node */}
            <button
                onClick={() => { if (module.status === 'current') onLessonOpen(module); }}
                disabled={module.status === 'locked'}
                className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center border transition-all duration-300 relative z-20 ${container}`}
            >
                {icon}
            </button>

            {/* Label Base */}
            <div className="absolute top-16 md:top-20 bg-white/5 backdrop-blur-lg px-4 py-1.5 rounded-full border border-white/10 shadow-lg whitespace-nowrap transition-all duration-300 opacity-90 group-hover:opacity-100 group-hover:bg-white/10">
                <span className={`text-sm font-medium tracking-wide ${module.status === 'current' ? 'text-white' : module.status === 'completed' ? 'text-gray-300' : 'text-gray-500'}`}>
                    {module.title}
                </span>
            </div>
        </div>
    );
};


// --- Main Screen ---
const RoadmapScreen = ({ onNavigate, onLessonOpen, onBack }) => {
    const [openingLesson, setOpeningLesson] = useState(null);
    const { curriculum, setSelectedModuleId } = useAssessment();

    const modules = useMemo(() => {
        if (Array.isArray(curriculum) && curriculum.length) {
            return curriculum.map((item, index) => ({
                id: item.id,
                title: item.titulo || `MÃ³dulo ${item.id}`,
                status: index === 0 ? 'current' : 'locked'
            }));
        }
        return ROADMAP_MODULES;
    }, [curriculum]);

    const handleLessonOpen = (module) => {
        setOpeningLesson(module);
        setSelectedModuleId(module.id);
        setTimeout(() => {
            setOpeningLesson(null);
            if (onLessonOpen) onLessonOpen(module);
        }, 1200);
    };

    return (
        <div className="flex-1 flex flex-col items-center justify-start w-full max-w-4xl mx-auto px-4 py-12 animate-in fade-in duration-1000">

            {/* Header */}
            <div className="text-center space-y-4 mb-16 z-20 relative">
                <span className="text-xs font-bold tracking-widest text-purple-400 uppercase bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">Tu Mapa B2B</span>
                <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mt-6">Ruta de Arquitectura</h2>
            </div>

            {/* Path Container */}
            <div className="relative w-full flex flex-col items-center py-10 pb-32">

                {/* Vertical Central Line (The Path) */}
                <div className="absolute top-0 bottom-32 w-1.5 rounded-full z-0 bg-white/5">
                    {/* Active Path Gradient */}
                    <div className="absolute top-0 w-full h-1/2 bg-gradient-to-b from-green-500/80 via-purple-500/50 to-transparent"></div>
                </div>

                {/* Render Nodes */}
                {modules.map((mod, index) => (
                    <RoadmapNode
                        key={mod.id}
                        module={mod}
                        index={index}
                        onLessonOpen={handleLessonOpen}
                    />
                ))}

                {/* Back Button */}
                <div className="absolute bottom-0 z-20">
                    <button
                        onClick={onBack || onNavigate}
                        className="px-8 py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-full font-medium transition-all duration-300"
                    >
                        Volver al Inicio
                    </button>
                </div>
            </div>

            {/* Simulated Loading Overlay */}
            {openingLesson && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#09090b]/80 backdrop-blur-xl animate-in fade-in duration-300">
                    <div className="flex flex-col items-center gap-6 p-8 rounded-3xl bg-white/[0.02] border border-white/10 shadow-2xl">
                        <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
                        <div className="text-center">
                            <h3 className="text-xl font-bold tracking-tight text-white mb-2">Iniciando Lección...</h3>
                            <p className="text-purple-400 font-medium">{openingLesson.title}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RoadmapScreen;
