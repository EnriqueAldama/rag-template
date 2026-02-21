import React, { useState } from 'react';

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

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleTagClick = (tag) => {
        setSearchQuery(tag);
    };

    const handleStartRoute = () => {
        if (!searchQuery.trim()) return;
        setIsNavigating(true);
        // Simulate navigation
        setTimeout(() => {
            setIsNavigating(false);
            if (onNavigate) onNavigate();
        }, 800);
    };

    return (
        <div className="flex-1 flex flex-col items-center justify-center min-h-[80vh] w-full max-w-5xl mx-auto px-4 animate-in fade-in duration-1000">

            {/* Hero Section */}
            <div className="text-center w-full max-w-3xl space-y-8 mb-16">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-medium tracking-wide mb-2">
                    <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span>
                    PLATAFORMA INTELIGENTE
                </div>

                <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-[1.2]">
                    Impulsa tu <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-600">Potencial</span>
                </h1>
                <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto font-medium">
                    Descubre rutas de aprendizaje B2B diseñadas para transformar habilidades y escalar resultados.
                </p>
            </div>

            {/* Search Container */}
            <div className="w-full max-w-3xl space-y-10 relative z-20">

                {/* Search Input Wrapper */}
                <div className={`relative group transition-all duration-500 transform ${isFocused ? 'scale-[1.02]' : 'scale-100'}`}>
                    <div className="relative flex items-center w-full h-16 md:h-20 rounded-full bg-white/5 border border-white/10 px-6 shadow-2xl overflow-hidden focus-within:ring-2 focus-within:ring-purple-500 transition-all duration-300">
                        {/* Search Icon */}
                        <svg className={`w-6 h-6 md:w-8 md:h-8 transition-colors duration-300 ${isFocused ? 'text-purple-400' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                        </svg>

                        {/* Input Field */}
                        <input
                            type="text"
                            className="peer w-full h-full bg-transparent text-white text-lg md:text-xl px-4 md:px-6 outline-none placeholder-gray-500 font-medium"
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
                            className={`ml-2 px-6 md:px-8 py-3 rounded-full font-bold tracking-wide text-sm transition-all duration-300 shrink-0 ${searchQuery.trim()
                                ? 'bg-white text-black hover:bg-gray-200 hover:scale-105 active:scale-95'
                                : 'bg-white/5 text-gray-500 cursor-not-allowed hidden md:block'
                                }`}
                        >
                            {isNavigating ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded-full border-2 border-black border-t-transparent animate-spin" />
                                    <span>Cargando</span>
                                </div>
                            ) : (
                                'Comenzar Ruta'
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Start Button (Visible only on small screens when typing) */}
                <button
                    onClick={handleStartRoute}
                    disabled={!searchQuery.trim() || isNavigating}
                    className={`w-full py-4 rounded-full font-bold tracking-wide text-sm transition-all duration-300 md:hidden ${searchQuery.trim() ? 'opacity-100 bg-white text-black hover:bg-gray-200' : 'opacity-0 h-0 py-0 overflow-hidden'}`}
                >
                    Comenzar Ruta
                </button>

                {/* Tags Section */}
                <div className="flex flex-wrap justify-center items-center gap-3">
                    <span className="text-sm text-gray-500 font-medium mr-2">Sugerencias:</span>
                    {SUGGESTED_TAGS.map((tag) => (
                        <button
                            key={tag}
                            onClick={() => handleTagClick(tag)}
                            className={`px-4 py-2 rounded-full text-sm font-medium border transition-all duration-300 ${searchQuery === tag
                                ? 'border-purple-500 bg-purple-600 text-white shadow-lg shadow-purple-500/20'
                                : 'border-white/10 bg-transparent text-gray-400 hover:bg-purple-600 hover:border-purple-500 hover:text-white hover:shadow-lg hover:shadow-purple-500/20'
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
