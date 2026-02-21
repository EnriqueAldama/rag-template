import React, { useState, useEffect, useRef } from 'react';
import ExerciseModule from './ExerciseModule';

// --- Mock Data for Leitner Levels ---
// This data can be replaced with data from backend
const LEITNER_LEVELS = [
    {
        level: 1,
        theory: "## Fundamentos de Variables\nEn JavaScript moderno, preferimos `const` para constantes y `let` para variables mutables. Evitamos usar `var`. Declarar el estado inicial correctamente previene errores de mutación.",
        exercise: {
            id: 'ex1',
            type: 'fill_blanks',
            fileName: 'appConfig.js',
            codeContextBefore: "function initializeApp() {\n  // Declara una constante para la URL de la API\n",
            codeContextAfter: "\n  console.log('Connecting to:', API_URL);\n}",
            expectedAnswer: "const API_URL = 'https://api.empresa.com';",
            placeholder: "declara la constante aquí...",
            successMessage: "Excelente. Uso correcto de const.",
            errorMessage: "Recuerda usar const y la sintaxis correcta."
        }
    },
    {
        level: 2,
        theory: "## Desestructuración de Objetos\nPara un código más limpio al recibir configuraciones complejas, la desestructuración extrae propiedades directamente en variables. Es esencial en React.",
        exercise: {
            id: 'ex2',
            type: 'test',
            question: "¿Cuál es la forma correcta de desestructurar 'port' y 'host' del objeto serverConfig?",
            options: [
                { key: 'A', text: 'const port, host = serverConfig;' },
                { key: 'B', text: 'const { port, host } = serverConfig;' },
                { key: 'C', text: 'const [port, host] = serverConfig;' },
                { key: 'D', text: 'serverConfig.extract(port, host);' }
            ],
            correctAnswer: 'B',
            successMessage: "¡Correcto! La desestructuración de objetos usa llaves { }.",
            errorMessage: "Incorrecto. Revisa la sintaxis de desestructuración de objetos."
        }
    },
    {
        level: 3,
        theory: "## Async / Await Avanzado\nCasi todo I/O en entornos backend requiere asincronía. El patrón async/await simplifica el manejo de Promesas, haciéndolo parecer síncrono y fácil de leer.",
        exercise: {
            id: 'ex3',
            type: 'fill_code_row',
            description: "Completa la función asíncrona para obtener datos del cliente usando await",
            codeContextBefore: "async function fetchEnterpriseData(clienteId) {\n  try {",
            codeContextAfter: "    return result.data;\n  } catch (err) {\n    handleError(err);\n  }\n}",
            expectedAnswer: "const result = await getData(clienteId);",
            acceptedAnswers: [
                "const result = await getData(clienteId);",
                "const result=await getData(clienteId);"
            ],
            placeholder: "usa await para obtener los datos...",
            successMessage: "Brillante. El manejo asíncrono es vital.",
            errorMessage: "Recuerda usar await antes de la llamada a getData."
        }
    },
    {
        level: 4,
        theory: "## Debugging y Análisis de Código\nEs fundamental poder predecir el comportamiento del código antes de ejecutarlo. Esto mejora tus habilidades de debugging y comprensión del flujo de ejecución.",
        exercise: {
            id: 'ex4',
            type: 'what_if',
            scenario: "Analiza el siguiente código y predice el resultado",
            code: "let count = 0;\nfor (let i = 0; i < 3; i++) {\n  count += i;\n}\nconsole.log(count);",
            question: "¿Qué valor se imprime en la consola?",
            expectedAnswer: "3",
            acceptedAnswers: ["3", "tres", "0+1+2=3", "el resultado es 3"],
            placeholder: "Escribe el valor que se imprimirá...",
            successMessage: "¡Excelente! Comprendes el flujo del bucle.",
            errorMessage: "Piensa en cómo se acumula el valor en cada iteración."
        }
    }
];


// --- Subcomponents ---

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

    const currentLevel = LEITNER_LEVELS[levelIndex];

    const handleExerciseComplete = (result) => {
        console.log('Exercise completed:', result);
        // Here you can send the result to backend or update progress
    };

    const advanceLeitner = () => {
        if (levelIndex < LEITNER_LEVELS.length - 1) {
            setLevelIndex(prev => prev + 1);
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
                        {/* Level Indicator */}
                        <div className="mb-4">
                            <span className="text-xs font-bold tracking-widest text-purple-400 uppercase bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
                                Nivel {currentLevel.level} - {currentLevel.exercise.type.replace('_', ' ').toUpperCase()}
                            </span>
                        </div>
                        
                        {/* Simple Markdown Parser Simulation */}
                        <div className="prose prose-invert prose-p:text-gray-300 prose-headings:text-white max-w-none">
                            <h2 className="text-2xl md:text-3xl font-bold mb-4 tracking-tight">
                                {currentLevel.theory.split('\n')[0].replace('## ', '')}
                            </h2>
                            <p className="font-light leading-relaxed text-[16px] md:text-[17px]">
                                {currentLevel.theory.split('\n')[1].split('`').map((part, i) =>
                                    i % 2 === 1 ? 
                                        <code key={i} className="px-1.5 py-0.5 bg-black/40 rounded-md mx-1 text-purple-300 font-mono text-sm border border-white/10">
                                            {part}
                                        </code> 
                                        : part
                                )}
                            </p>
                        </div>
                    </div>

                    {/* Exercise Module - Supports multiple exercise types */}
                    <div className="flex-1 min-h-[400px] flex flex-col">
                        <ExerciseModule
                            exercise={currentLevel.exercise}
                            onComplete={handleExerciseComplete}
                            onNext={advanceLeitner}
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
