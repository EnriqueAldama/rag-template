import React, { useState } from 'react';
import { useAssessment } from '../context/AssessmentContext';

const MOCK_CURRICULUM = [
    { id: 1, titulo: 'Fundamentos y Sintaxis Básica' },
    { id: 2, titulo: 'Estructuras de Control y Funciones' },
    { id: 3, titulo: 'Programación Orientada a Objetos' },
    { id: 4, titulo: 'Estructuras de Datos Avanzadas' },
    { id: 5, titulo: 'Manejo de Errores y Excepciones' },
    { id: 6, titulo: 'Asincronía y Concurrencia' },
    { id: 7, titulo: 'Bases de Datos y ORMs' },
    { id: 8, titulo: 'Arquitectura y APIs REST' },
];

const AssessmentScreen = ({ onNavigate }) => {
    const { setCurriculum } = useAssessment();
    const [isSaving, setIsSaving] = useState(false);
    const [knownIndex, setKnownIndex] = useState(-1);

    const topics = MOCK_CURRICULUM;

    const handleSelectLevel = (index) => {
        setKnownIndex(index);
    };

    const handleContinue = () => {
        if (isSaving) return;
        setIsSaving(true);
        setTimeout(() => {
            const updatedCurriculum = topics.map((mod, index) => ({
                ...mod,
                completed: index <= knownIndex
            }));
            setCurriculum(updatedCurriculum);
            setIsSaving(false);
            if (onNavigate) onNavigate();
        }, 800);
    };


    return (
        <div className="flex-1 flex flex-col items-center justify-start w-full max-w-5xl mx-auto px-4 py-8 md:py-12 animate-in fade-in duration-700 relative z-10">

            {/* Header */}
            <div className="text-center space-y-4 mb-12">
                <span className="text-xs font-bold tracking-widest text-[#00c8ff] uppercase bg-[#00c8ff]/10 px-4 py-1.5 rounded-full border border-[#00c8ff]/30 shadow-[0_0_15px_rgba(0,200,255,0.2)]">
                    Paso 2 / 3
                </span>
                <h2 className="text-3xl md:text-5xl font-extrabold text-[#f8fbff] tracking-tight mt-6 drop-shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                    ¿Hasta dónde dominas ya?
                </h2>
                <p className="text-lg text-[#9bb3d6] max-w-2xl mx-auto font-medium mt-4 leading-relaxed">
                    Selecciona el último tema que consideres que dominas. Omitiremos esa teoría y empezaremos tu ruta a partir del siguiente módulo.
                </p>
            </div>

            {/* Custom Interactive Timeline */}
            <div
                className="w-full relative py-12 px-4 md:px-12 rounded-[2rem] mb-12 overflow-hidden shadow-[0_22px_60px_rgba(0,0,0,0.6)] group/container"
                style={{
                    background: `
                        radial-gradient(circle at 10% -20%, rgba(0, 210, 255, 0.08), transparent 55%),
                        radial-gradient(circle at 110% 120%, rgba(0, 132, 255, 0.05), transparent 55%),
                        linear-gradient(145deg, rgba(5,11,28,0.7) 0%, rgba(2,6,19,0.8) 60%, rgba(1,1,11,0.9) 100%)
                    `,
                    border: '1px solid rgba(120, 210, 255, 0.2)',
                    backdropFilter: 'blur(12px)'
                }}
            >
                {/* Inner Glow */}
                <div className="absolute inset-px rounded-[inherit] border border-white/5 pointer-events-none z-0"></div>

                {/* Hover Sweep Effect matching lambda style */}
                <div className="absolute top-0 -left-[120%] w-[120%] h-full bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 transition-all duration-1000 ease-out group-hover/container:left-[120%] group-hover/container:opacity-100 mix-blend-overlay pointer-events-none z-0"></div>

                {/* Guide Line Background */}
                <div className="absolute left-8 md:left-24 top-16 bottom-16 w-1 bg-[#09152b] rounded-full z-0 border-x border-[#00c8ff]/10"></div>

                {/* Active Progress Line */}
                <div
                    className="absolute left-8 md:left-24 top-16 w-1 rounded-full z-0 transition-all duration-700 ease-out"
                    style={{
                        height: knownIndex === -1 ? '0%' : `calc(${((knownIndex + 1) / topics.length) * 100}% - 2rem)`,
                        background: 'linear-gradient(180deg, rgba(0, 140, 255, 0.8) 0%, #00d2ff 100%)',
                        boxShadow: '0 0 20px rgba(0, 210, 255, 0.6)'
                    }}
                ></div>

                <div className="relative z-10 space-y-0">
                    {topics.map((topic, index) => {
                        const isKnown = index <= knownIndex;
                        const isNext = index === knownIndex + 1;
                        const isFirstAndUnknown = index === 0 && knownIndex === -1;

                        let dotColor = "bg-[#050b1c] border-white/20";
                        if (isKnown) dotColor = "bg-[#00c8ff] border-[#00c8ff] shadow-[0_0_15px_rgba(0,200,255,0.6)]";
                        if (isNext || isFirstAndUnknown) dotColor = "bg-white border-[#00c8ff] shadow-[0_0_20px_rgba(255,255,255,0.5)] animate-pulse";

                        return (
                            <div
                                key={topic.id}
                                className={`flex items-center group cursor-pointer py-4 md:py-6 transition-all duration-300 ${isKnown ? 'opacity-50' : 'opacity-100'}`}
                                onClick={() => handleSelectLevel(index)}
                            >
                                {/* Level Number */}
                                <div className="w-12 md:w-20 hidden md:flex justify-end pr-8 shrink-0">
                                    <span className={`text-sm font-bold tracking-wider ${isKnown ? 'text-[#00c8ff]' : 'text-gray-500'}`}>
                                        LVL {index + 1}
                                    </span>
                                </div>

                                {/* Timeline Node / Dot */}
                                <div className="relative flex items-center justify-center shrink-0 w-8 h-8 md:-ml-4 group-hover:scale-110 transition-transform">
                                    <div className={`w-4 h-4 rounded-full border-2 transition-all duration-500 z-10 ${dotColor}`}></div>
                                    <div className={`absolute w-12 h-12 rounded-full border transition-all duration-300 ${isKnown ? 'border-[#00c8ff]/20' : 'border-transparent group-hover:border-[#00c8ff]/30 group-hover:bg-[#00c8ff]/5 scale-75 group-hover:scale-100'}`}></div>
                                </div>

                                {/* Content Card */}
                                <div className="ml-6 md:ml-8 flex-1">
                                    <div className={`p-4 md:p-5 rounded-2xl border transition-all duration-300 ${isKnown
                                        ? 'bg-[#00c8ff]/5 border-[#00c8ff]/20 text-gray-400'
                                        : isNext || isFirstAndUnknown
                                            ? 'bg-white/5 border-white/20 shadow-[0_10px_30px_rgba(0,0,0,0.5)] scale-[1.02] hover:border-[#00c8ff]/50'
                                            : 'bg-transparent border-transparent hover:bg-white/[0.02] hover:border-white/10'
                                        }`}
                                    >
                                        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2 md:gap-4">
                                            <h3 className={`text-lg md:text-xl font-bold tracking-tight ${isKnown ? 'line-through decoration-[#00c8ff]/50 text-gray-500' : 'text-[#f8fbff]'}`}>
                                                {topic.titulo}
                                            </h3>

                                            {isKnown && (
                                                <span className="self-start md:self-auto px-2 py-1 bg-[#00c8ff]/10 text-[#00c8ff] text-xs font-semibold rounded uppercase tracking-wider border border-[#00c8ff]/20">
                                                    Superado ✅
                                                </span>
                                            )}
                                            {(isNext || isFirstAndUnknown) && (
                                                <span className="self-start md:self-auto px-3 py-1 bg-white/10 text-white text-xs font-bold rounded uppercase tracking-wider border border-white/20 shadow-[0_0_10px_rgba(255,255,255,0.1)]">
                                                    No superado
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Clear Selection Button */}
                {knownIndex !== -1 && (
                    <div className="absolute top-6 right-8 z-20 animate-in fade-in">
                        <button
                            className="text-xs text-[#00c8ff]/70 hover:text-[#00c8ff] underline decoration-dashed underline-offset-4 transition-colors p-2"
                            onClick={(e) => { e.stopPropagation(); setKnownIndex(-1); }}
                        >
                            Resetear nivel a 0
                        </button>
                    </div>
                )}
            </div>

            {/* Action Button */}
            <div className="w-full flex justify-center pb-20 relative z-10">
                <button
                    onClick={handleContinue}
                    disabled={isSaving}
                    className={`px-14 py-5 rounded-full font-bold text-lg tracking-wide transition-all duration-500 flex items-center gap-3 relative overflow-hidden ${isSaving ? 'opacity-80 scale-95 pointer-events-none' : 'text-[#020617] border border-[rgba(144,224,255,0.8)] hover:-translate-y-1'}`}
                    style={!isSaving ? {
                        background: 'linear-gradient(120deg, rgba(0, 200, 255, 0.9), rgba(0, 140, 255, 1), rgba(0, 230, 255, 0.9))',
                        boxShadow: '0 0 20px rgba(0, 200, 255, 0.4), 0 8px 25px rgba(0, 0, 0, 0.7)'
                    } : {
                        background: 'rgba(255,255,255,0.1)',
                        color: 'white',
                        border: '1px solid rgba(255,255,255,0.2)'
                    }}
                >
                    {!isSaving && <div className="absolute inset-0 bg-white/20 hover:bg-transparent transition-colors duration-300 pointer-events-none"></div>}
                    {isSaving ? (
                        <>
                            <div className="w-5 h-5 rounded-full border-2 border-white border-r-transparent animate-spin" />
                            <span className="text-white">Generando ruta...</span>
                        </>
                    ) : (
                        knownIndex === -1 ? 'Empezar desde cero' : 'Continuar ruta adaptada'
                    )}
                </button>
            </div>

        </div>
    );
};

export default AssessmentScreen;
