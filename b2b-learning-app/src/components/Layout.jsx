import React from 'react';

const Layout = ({ children, onLogoClick, canGoBack }) => {
    return (
        <div className="min-h-screen bg-[#09090b] text-white flex flex-col font-sans selection:bg-purple-500/30">

            {/* Floating Header */}
            <header className="fixed top-6 left-1/2 -translate-x-1/2 w-[90%] max-w-4xl z-50">
                <nav className="bg-white/[0.03] backdrop-blur-xl border border-white/10 px-6 py-3 rounded-full flex justify-between items-center shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
                    {/* Back arrow (shown when there is history) */}
                    {canGoBack && (
                        <button
                            onClick={onLogoClick}
                            className="p-2 rounded-full hover:bg-white/10 transition-colors mr-4"
                            aria-label="Go back"
                        >
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                    )}

                    {/* Logo */}
                    <div
                        onClick={onLogoClick}
                        className="flex items-center gap-3 cursor-pointer"
                    >
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-purple-400 flex items-center justify-center shadow-lg shadow-purple-500/20">
                            <span className="text-white font-bold text-sm tracking-tighter">L</span>
                        </div>
                        <span className="font-semibold text-lg tracking-tight text-white hidden sm:block">
                            Lumina<span className="text-purple-400 font-medium">B2B</span>
                        </span>
                    </div>

                    {/* Nav Links */}
                    <div className="flex items-center gap-6">
                        <button className="text-sm font-medium text-gray-400 hover:text-white transition-colors">
                            Dashboard
                        </button>
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/5 hover:bg-white/20 transition-colors cursor-pointer">
                            <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                        </div>
                    </div>
                </nav>
            </header>

            {/* Main Content Area - Added padding top to account for floating header */}
            <main className="flex-1 flex flex-col pt-32 pb-12 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                {children}
            </main>
        </div>
    );
};

export default Layout;
