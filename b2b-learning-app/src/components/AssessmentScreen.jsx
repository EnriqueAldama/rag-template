import React, { useState } from 'react';
import { useAssessment } from '../context/AssessmentContext';

const MOCK_SKILLS = [
    {
        id: 'react',
        title: 'React & Ecosystem',
        description: 'Componentes, Hooks, Context, State Management (Redux/Zustand), y Next.js.'
    },
    {
        id: 'nodejs',
        title: 'Node.js & Backend',
        description: 'APIs RESTful, Express/NestJS, Arquitectura de microservicios, Auth.'
    },
    {
        id: 'sql',
        title: 'Databases & SQL',
        description: 'Diseño de esquemas, optimización de queries, PostgreSQL.'
    }
];

const getLevelText = (value) => {
    if (value === 0) return 'Sin experiencia';
    if (value <= 25) return 'Principiante';
    if (value <= 50) return 'Competente';
    if (value <= 75) return 'Avanzado';
    return 'Experto B2B';
};

const SkillCard = ({ id, title, description, value, onChange }) => {
    return (
        <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 md:p-8 transition-all duration-300 hover:bg-white/[0.03]">
            <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6 mb-10">

                {/* Info Text */}
                <div className="flex-1">
                    <h3 className="text-xl md:text-2xl font-bold text-white mb-2 tracking-wide">{title}</h3>
                    <p className="text-sm md:text-base text-gray-400 font-medium leading-relaxed max-w-xl">{description}</p>
                </div>

                {/* Value Display */}
                <div className="text-left md:text-right shrink-0">
                    <span
                        className="text-5xl md:text-6xl font-extrabold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-purple-600 transition-all duration-300"
                    >
                        {value}%
                    </span>
                    <p
                        className="text-sm font-bold uppercase tracking-widest mt-2 text-purple-400/80 transition-colors duration-300"
                    >
                        {getLevelText(value)}
                    </p>
                </div>
            </div>

            {/* Custom Slider */}
            <div className="relative h-12 bg-white/10 rounded-full flex items-center shadow-inner">
                {/* Active Track */}
                <div
                    className="absolute left-0 top-0 bottom-0 rounded-full transition-all duration-300 ease-out bg-purple-600"
                    style={{ width: `${value}%` }}
                />

                <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={value}
                    onChange={(e) => onChange(id, parseInt(e.target.value))}
                    className="w-full h-full opacity-0 cursor-pointer absolute inset-0 z-20"
                />

                {/* Thumb pseudo-element */}
                <div
                    className="h-12 w-12 rounded-full bg-white shadow-lg pointer-events-none transition-all duration-300 ease-out z-10 absolute scale-[1.15]"
                    style={{ left: `calc(${value}% - ${(value / 100) * 48}px)` }}
                >
                </div>
            </div>

            {/* Markers */}
            <div className="flex justify-between px-2 mt-5 opacity-40">
                <span className="text-xs font-semibold tracking-wide text-gray-500">0%</span>
                <span className="text-xs font-semibold tracking-wide text-gray-500">50%</span>
                <span className="text-xs font-semibold tracking-wide text-gray-500">100%</span>
            </div>
        </div>
    );
};

const AssessmentScreen = ({ onNavigate }) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const { assessmentData, updateSkill } = useAssessment();

    const handleGenerate = () => {
        setIsGenerating(true);
        setTimeout(() => {
            setIsGenerating(false);
            if (onNavigate) onNavigate();
        }, 1500);
    };

    const isReady = Object.values(assessmentData).some(val => val > 0);

    return (
        <div className="flex-1 flex flex-col items-center justify-start w-full max-w-4xl mx-auto px-4 py-12 animate-in fade-in duration-700">

            {/* Header */}
            <div className="text-center space-y-4 mb-16">
                <span className="text-xs font-bold tracking-widest text-purple-400 uppercase bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">Paso 2 / 3</span>
                <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mt-6">¿Cuál es tu nivel actual?</h2>
                <p className="text-lg text-gray-400 max-w-2xl mx-auto font-medium mt-4">
                    Ajusta los selectores según tu experiencia real. Nuestra IA adaptará el currículo omitiendo lo que ya sabes y profundizando en lo que necesitas.
                </p>
            </div>

            {/* Assessment Cards */}
            <div className="w-full space-y-8 mb-16">
                {MOCK_SKILLS.map(skill => (
                    <SkillCard
                        key={skill.id}
                        id={skill.id}
                        title={skill.title}
                        description={skill.description}
                        value={assessmentData[skill.id]}
                        onChange={updateSkill}
                    />
                ))}
            </div>

            {/* Action Button */}
            <div className="w-full flex justify-center pb-20 mt-8">
                <button
                    onClick={handleGenerate}
                    disabled={!isReady || isGenerating}
                    className={`px-12 py-5 rounded-full font-bold text-lg tracking-wide transition-all duration-500 flex items-center gap-3 ${isReady
                        ? 'bg-white text-black hover:bg-gray-200 hover:scale-105 active:scale-95 shadow-xl'
                        : 'bg-white/5 text-gray-500 cursor-not-allowed hidden md:flex'
                        }`}
                >
                    {isGenerating ? (
                        <>
                            <div className="w-5 h-5 rounded-full border-2 border-black border-r-transparent animate-spin" />
                            Procesando Perfil...
                        </>
                    ) : (
                        'Generar mi Mapa'
                    )}
                </button>
            </div>

        </div>
    );
};

export default AssessmentScreen;
