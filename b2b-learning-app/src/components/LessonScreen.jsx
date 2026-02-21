import React, { useState, useEffect, useRef } from 'react';

// --- Mock Data for Leitner Levels ---
const LEITNER_LEVELS = [
    {
        level: 1,
        theory: "## Fundamentos de Variables\nEn JavaScript moderno, preferimos `const` para constantes y `let` para variables mutables. Evitamos usar `var`. Declarar el estado inicial correctamente previene errores de mutación.",
        codeContextBefore: "function initializeApp() {\n  // Declara una constante para la URL de la API\n",
        codeContextAfter: "\n  console.log('Connecting to:', API_URL);\n}",
        expectedAnswer: "const API_URL = 'https://api.empresa.com';",
        placeholder: "declara la constante aquí...",
        successMessage: "Excelente. Uso correcto de const."
    },
    {
        level: 2,
        theory: "## Desestructuración de Objetos\nPara un código más limpio al recibir configuraciones complejas, la desestructuración extrae propiedades directamente en variables. Es esencial en React.",
        codeContextBefore: "const serverConfig = { port: 8080, env: 'production', host: 'localhost' };\n\nfunction startServer() {\n  // Extrae 'port' y 'host' de serverConfig en una sola línea\n",
        codeContextAfter: "\n  console.log(`Starting on ${host}:${port}`);\n}",
        expectedAnswer: "const { port, host } = serverConfig;",
        placeholder: "extrae las propiedades...",
        successMessage: "Perfecto. Código más profesional."
    },
    {
        level: 3,
        theory: "## Async / Await Avanzado\nCasi todo I/O en entornos backend requiere asincronía. El patrón async/await simplifica el manejo de Promesas, haciéndolo parecer síncrono y fácil de leer.",
        codeContextBefore: "async function fetchEnterpriseData(clienteId) {\n  try {\n    // Llama a getData(clienteId) y espera su resultado\n",
        codeContextAfter: "\n    return result.data;\n  } catch (err) {\n    handleError(err);\n  }\n}",
        expectedAnswer: "const result = await getData(clienteId);",
        placeholder: "usa await para obtener los datos...",
        successMessage: "Brillante. El manejo asíncrono es vital."
    }
];

// --- Subcomponents ---

const CodeEditorBlock = ({ exercise, userInput, setUserInput, onRun, isCorrect, showFeedback }) => {
    return (
        <div className="bg-white/[0.02] border border-white/10 rounded-3xl overflow-hidden font-mono shadow-2xl relative">
            {/* Editor Header */}
            <div className="bg-white/[0.03] px-4 py-3 flex items-center gap-2 border-b border-white/5">
                <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
                    <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
                    <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
                </div>
                <span className="text-gray-400 text-xs ml-4 flex-1 text-center font-sans tracking-wide">appConfig.js</span>
            </div>

            {/* Editor Content */}
            <div className="p-6 text-[15px] text-[#cccccc] overflow-x-auto leading-relaxed">
                {/* Context Before */}
                <pre className="text-gray-500">
                    <code dangerouslySetInnerHTML={{ __html: exercise.codeContextBefore.replace(/\/\/ (.*)\n/g, '<span class="text-[#6a9955] italic">//$1</span>\n').replace(/function|const|let|async|try|catch|return/g, '<span class="text-[#c586c0]">$&</span>') }}></code>
                </pre>

                {/* Input Row - Seamless Integration */}
                <div className="flex items-center group relative my-1">
                    <span className="w-8 text-right text-purple-400/50 mr-4 select-none pr-2">▶</span>
                    <input
                        type="text"
                        className={`flex-1 bg-transparent border-b ${showFeedback ? (isCorrect ? 'border-green-500 text-green-400' : 'border-red-500 text-red-500') : 'border-white/10 focus:border-purple-500 text-white'} outline-none px-1 py-1 transition-colors duration-300 placeholder-gray-600 font-mono`}
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        placeholder={exercise.placeholder}
                        spellCheck="false"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') onRun();
                        }}
                    />
                </div>

                {/* Context After */}
                <pre className="text-gray-500">
                    <code dangerouslySetInnerHTML={{ __html: exercise.codeContextAfter.replace(/console\.log/g, '<span class="text-[#dcdcaa]">console.log</span>') }}></code>
                </pre>
            </div>

            {/* Actions */}
            <div className="p-5 bg-white/[0.02] border-t border-white/5 flex justify-between items-center">
                <div>
                    {showFeedback && (
                        <span className={`text-sm font-medium animate-in slide-in-from-left-4 fade-in ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                            {isCorrect ? exercise.successMessage : "Resultado inesperado. Verifica el código."}
                        </span>
                    )}
                </div>
                <button
                    onClick={onRun}
                    className="px-6 py-2 bg-white/5 hover:bg-purple-600 hover:text-white border border-white/10 hover:border-purple-500 text-gray-300 font-medium rounded-full transition-all duration-300 text-sm active:scale-95"
                >
                    Ejecutar
                </button>
            </div>
        </div>
    );
};

const AITutorChat = () => {
    const [messages, setMessages] = useState([
        { id: 1, sender: 'bot', text: 'Hola. Estoy aquí para asistirte. ¿Tienes alguna pregunta sobre el ejercicio actual?' }
    ]);
    const [inputMessage, setInputMessage] = useState('');
    const chatEndRef = useRef(null);

    // Auto-scroll to bottom
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = () => {
        if (!inputMessage.trim()) return;

        // Add user msg
        const newMsgs = [...messages, { id: Date.now(), sender: 'user', text: inputMessage }];
        setMessages(newMsgs);
        setInputMessage('');

        // Simulate Bot response
        setTimeout(() => {
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                sender: 'bot',
                text: 'Esa es una buena pregunta. Recuerda que declarar variables correctamente mejora la prevensión de errores en código a gran escala. Intenta enfocarte en no permitir re-asignaciones.'
            }]);
        }, 1500);
    };

    return (
        <div className="h-full flex flex-col bg-white/[0.02] backdrop-blur-3xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl relative">
            <div className="p-4 border-b border-white/5 bg-white/[0.01] flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="w-8 h-8 rounded-full bg-white/5 border border-purple-500/30 flex items-center justify-center">
                            <span className="text-purple-400 font-semibold text-xs text-center leading-none tracking-tighter">AI</span>
                        </div>
                        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-[#09090b]"></div>
                    </div>
                    <h3 className="font-semibold text-white tracking-tight text-sm">Tutor Virtual B2B</h3>
                </div>
            </div>

            <div className="flex-1 p-5 overflow-y-auto space-y-4">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 fade-in`}>
                        <div className={`max-w-[85%] px-4 py-2.5 text-[15px] font-normal leading-relaxed shadow-sm ${msg.sender === 'user'
                                ? 'bg-white/10 text-white rounded-2xl rounded-tr-sm border border-white/10'
                                : 'bg-white/[0.03] text-gray-300 rounded-2xl rounded-tl-sm border border-purple-500/30'
                            }`}>
                            {msg.text}
                        </div>
                    </div>
                ))}
                <div ref={chatEndRef} />
            </div>

            <div className="p-4 bg-white/[0.01] border-t border-white/5">
                <div className="relative flex items-center">
                    <input
                        type="text"
                        className="w-full bg-white/5 border border-white/10 focus:border-purple-500/50 rounded-full px-5 py-3 text-sm text-white outline-none transition-colors duration-300 pr-12 placeholder-gray-500"
                        placeholder="Escribe tu mensaje..."
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleSendMessage(); }}
                    />
                    <button
                        onClick={handleSendMessage}
                        className="absolute right-2 p-2 text-gray-400 hover:text-purple-400 transition-colors bg-white/5 hover:bg-white/10 rounded-full"
                    >
                        <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};


// --- Main Screen ---

const LessonScreen = ({ onNavigate, onBack }) => {
    const [levelIndex, setLevelIndex] = useState(0);
    const [userInput, setUserInput] = useState('');
    const [showFeedback, setShowFeedback] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);

    const currentExercise = LEITNER_LEVELS[levelIndex];

    const handleVerify = () => {
        // Strip external spaces to be slightly forgiving
        const cleanInput = userInput.trim().replace(/\s+/g, ' ');
        const cleanExpected = currentExercise.expectedAnswer.trim().replace(/\s+/g, ' ');

        const correct = cleanInput === cleanExpected;
        setIsCorrect(correct);
        setShowFeedback(true);
    };

    const advanceLeitner = () => {
        if (levelIndex < LEITNER_LEVELS.length - 1) {
            setLevelIndex(prev => prev + 1);
            setUserInput('');
            setShowFeedback(false);
            setIsCorrect(false);
        } else {
            alert("¡Has completado todos los niveles de este módulo!");
            onNavigate('roadmap');
        }
    };

    return (
        <div className="flex-1 w-full flex flex-col items-center py-6 px-4 md:px-8 max-w-[1400px] mx-auto animate-in fade-in duration-700 h-full relative">
            {/* Optional back arrow inside lesson */}
            {onBack && (
                <button
                    onClick={onBack}
                    className="absolute top-6 left-6 p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
                    aria-label="Volver"
                >
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
            )}

            {/* Hidden Dev Demo Button - Leitner Simulation */}
            <button
                onClick={advanceLeitner}
                className="absolute top-2 right-8 opacity-20 hover:opacity-100 px-3 py-1 bg-white/5 hover:bg-white/10 rounded-full text-xs text-gray-400 hover:text-white transition-all border border-white/10 z-50 font-mono shadow-md"
                title="Botón Oculto de Demo"
            >
                [Avanzar Leitner: Nivel {levelIndex + 1}]
            </button>

            <div className="w-full h-full flex flex-col lg:flex-row gap-6 md:gap-8 mt-6">

                {/* LEFT/CENTER PANEL: Theory & Exercise (65%) */}
                <div className="w-full lg:flex-[6.5] flex flex-col gap-6">

                    {/* Theory Header / Card */}
                    <div className="bg-white/[0.02] border border-white/10 p-8 rounded-3xl backdrop-blur-lg shadow-xl relative overflow-hidden flex flex-col justify-center">
                        {/* Simple Markdown Parser Simulation */}
                        <div className="prose prose-invert prose-p:text-gray-300 prose-headings:text-white max-w-none">
                            <h2 className="text-2xl md:text-3xl font-bold mb-4 tracking-tight">{currentExercise.theory.split('\n')[0].replace('## ', '')}</h2>
                            <p className="font-light leading-relaxed text-[16px] md:text-[17px]">
                                {currentExercise.theory.split('\n')[1].split('`').map((part, i) =>
                                    i % 2 === 1 ? <code key={i} className="px-1.5 py-0.5 bg-black/40 rounded-md mx-1 text-purple-300 font-mono text-sm border border-white/10">{part}</code> : part
                                )}
                            </p>
                        </div>
                    </div>

                    {/* Code Exercise : Fill the Row */}
                    <div className="flex-1 min-h-[400px] flex flex-col">
                        <div className="flex items-center gap-2 mb-4 ml-2">
                            <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></div>
                            <h3 className="text-sm font-semibold tracking-wide text-gray-400 uppercase">Interactive Env</h3>
                        </div>
                        <CodeEditorBlock
                            exercise={currentExercise}
                            userInput={userInput}
                            setUserInput={(val) => {
                                setUserInput(val);
                                setShowFeedback(false);
                            }}
                            onRun={handleVerify}
                            isCorrect={isCorrect}
                            showFeedback={showFeedback}
                        />
                    </div>

                </div>

                {/* RIGHT PANEL: AI Tutor Chat (35%) */}
                <div className="w-full lg:flex-[3.5] min-h-[500px] lg:min-h-0">
                    <AITutorChat />
                </div>

            </div>

        </div>
    );
};

export default LessonScreen;
