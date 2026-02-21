import React, { useState } from 'react';
import { createClient } from '../api/client';
import { useAssessment } from '../context/AssessmentContext';

const SUGGESTED_TAGS = [
    'Desarrollo Web',
    'Data Science',
    'Machine Learning',
    'Liderazgo',
    'Gestión Ágil'
];

const SearchScreen = ({ onNavigate }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const [isNavigating, setIsNavigating] = useState(false);
    const [error, setError] = useState('');
    const { setUserId, setGoalDescription } = useAssessment();

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleTagClick = (tag) => {
        setSearchQuery(tag);
    };

    const handleStartRoute = async () => {
        if (!searchQuery.trim() || isNavigating) return;
        setIsNavigating(true);
        setError('');
        try {
            const description = searchQuery.trim();
            setGoalDescription(description);
            const response = await createClient();
            if (!response?.id) {
                throw new Error('No se pudo crear el cliente.');
            }
            setUserId(response.id);
            if (onNavigate) onNavigate();
        } catch (err) {
            const message = err?.response?.data?.detail || err?.message || 'Error al conectar con el backend.';
            setError(message);
        } finally {
            setIsNavigating(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col items-center justify-center min-h-[80vh] w-full max-w-5xl mx-auto px-4 animate-in fade-in duration-1000">

            {/* Hero Section */}
            <div className="text-center w-full max-w-3xl space-y-8 mb-16">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00c8ff]/10 border border-[#00c8ff]/20 text-[#00c8ff] text-xs font-medium tracking-wide mb-2">
                    <span className="w-2 h-2 rounded-full bg-[#00c8ff] animate-pulse shadow-[0_0_10px_rgba(0,200,255,0.8)]"></span>
                    PLATAFORMA INTELIGENTE
                </div>

                <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-[#f8fbff] leading-[1.2] drop-shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                    Impulsa tu <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00c8ff] to-[#0066cc]">Potencial</span>
                </h1>
                <p className="text-lg md:text-xl text-[#9bb3d6] max-w-2xl mx-auto font-medium">
                    Descubre rutas de aprendizaje B2B diseñadas para transformar habilidades y escalar resultados.
                </p>
            </div>

            {/* Search Container */}
            <div className="w-full max-w-3xl space-y-10 relative z-20">

                {/* Search Input Wrapper */}
                <div className={`relative group transition-all duration-500 transform ${isFocused ? 'scale-[1.02]' : 'scale-100'}`}>
                    <div className="relative flex items-center w-full h-16 md:h-20 rounded-full bg-white/5 border border-[#00c8ff]/30 px-6 shadow-[0_15px_40px_rgba(0,0,0,0.5)] overflow-hidden focus-within:ring-2 focus-within:ring-[#00c8ff] transition-all duration-300">
                        {/* Search Icon */}
                        <svg className={`w-6 h-6 md:w-8 md:h-8 transition-colors duration-300 ${isFocused ? 'text-[#00c8ff]' : 'text-[#9bb3d6]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                        </svg>

                        {/* Input Field */}
                        <input
                            type="text"
                            className="peer w-full h-full bg-transparent text-[#f8fbff] text-lg md:text-xl px-4 md:px-6 outline-none placeholder-[#9bb3d6]/60 font-medium"
                            placeholder="¿Qué quieres aprender hoy?"
                            value={searchQuery}
                            onChange={handleSearchChange}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleStartRoute();
                            }}
                        />

                        {/* Search/Start Button */}
                        <button
                            onClick={handleStartRoute}
                            disabled={!searchQuery.trim() || isNavigating}
                            className={`ml-2 px-6 md:px-8 py-3 rounded-full font-bold tracking-wide text-sm transition-all duration-300 shrink-0 border ${searchQuery.trim()
                                ? 'text-[#020617] border-[rgba(144,224,255,0.8)] hover:-translate-y-1 hover:shadow-[0_4px_15px_rgba(0,200,255,0.5)]'
                                : 'bg-transparent text-gray-500 border-white/10 cursor-not-allowed hidden md:block'
                                }`}
                            style={searchQuery.trim() && !isNavigating ? {
                                background: 'linear-gradient(120deg, rgba(0, 200, 255, 0.9), rgba(0, 140, 255, 1), rgba(0, 230, 255, 0.9))',
                            } : {}}
                        >
                            {isNavigating ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded-full border-2 border-[#020617] border-t-transparent animate-spin" />
                                    <span>Cargando</span>
                                </div>
                            ) : (
                                'Comenzar Ruta'
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Start Button */}
                <button
                    onClick={handleStartRoute}
                    disabled={!searchQuery.trim() || isNavigating}
                    className={`w-full py-4 rounded-full font-bold tracking-wide text-sm transition-all duration-300 md:hidden border border-[rgba(144,224,255,0.8)] ${searchQuery.trim() ? 'opacity-100 text-[#020617]' : 'opacity-0 h-0 py-0 overflow-hidden'}`}
                    style={searchQuery.trim() && !isNavigating ? {
                        background: 'linear-gradient(120deg, rgba(0, 200, 255, 0.9), rgba(0, 140, 255, 1), rgba(0, 230, 255, 0.9))',
                    } : {}}
                >
                    Comenzar Ruta
                </button>

                {error && (
                    <div className="w-full flex flex-col items-center gap-3">
                        <p className="text-sm text-red-400 font-medium text-center">{error}</p>
                        <button
                            onClick={handleStartRoute}
                            className="px-5 py-2 rounded-full bg-white/5 border border-white/10 text-white text-sm font-medium hover:bg-white/10 transition-all border-[#00c8ff]/50"
                        >
                            Reintentar
                        </button>
                    </div>
                )}

                {/* Tags Section */}
                <div className="flex flex-wrap justify-center items-center gap-3">
                    <span className="text-sm text-[#9bb3d6] font-medium mr-2">Sugerencias:</span>
                    {SUGGESTED_TAGS.map((tag) => (
                        <button
                            key={tag}
                            onClick={() => handleTagClick(tag)}
                            className={`px-4 py-2 rounded-full text-sm font-medium border transition-all duration-300 ${searchQuery === tag
                                ? 'border-[#00c8ff] bg-[#00c8ff]/20 text-[#00c8ff] shadow-[0_0_15px_rgba(0,200,255,0.3)]'
                                : 'border-[#00c8ff]/20 bg-transparent text-[#9bb3d6] hover:bg-[#00c8ff]/10 hover:border-[#00c8ff]/50 hover:text-[#00c8ff] hover:shadow-[0_0_10px_rgba(0,200,255,0.2)]'
                                }`}
                        >
                            {tag}
                        </button>
                    ))}
                </div>

            </div>
        </div>
    );
};

export default SearchScreen;
