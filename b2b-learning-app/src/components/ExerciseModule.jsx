import React, { useState } from 'react';

/**
 * ExerciseModule - Modular component for handling different exercise types
 * 
 * Exercise Types:
 * - fill_blanks: Complete syntax by filling in blanks
 * - test: Multiple choice questions
 * - what_if: Debugging scenarios and predicting results
 * - fill_code_row: Write a complete functional line of code
 */

// --- Subcomponents for Each Exercise Type ---

/**
 * FillBlanksExercise - User fills in the blanks in code
 */
const FillBlanksExercise = ({ exercise, userAnswer, setUserAnswer, onSubmit, showFeedback, isCorrect }) => {
    return (
        <div className="bg-black border border-white/10 rounded-3xl overflow-hidden font-mono shadow-2xl relative">
            {/* Editor Header */}
            <div className="bg-black/60 px-4 py-3 flex items-center gap-2 border-b border-white/10">
                <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
                    <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
                    <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
                </div>
                <span className="text-gray-400 text-xs ml-4 flex-1 text-center font-sans tracking-wide">
                    {exercise.fileName || 'code.js'}
                </span>
            </div>

            {/* Editor Content */}
            <div className="p-6 text-[15px] text-[#cccccc] overflow-x-auto leading-relaxed">
                {/* Context Before */}
                {exercise.codeContextBefore && (
                    <pre className="text-gray-500 whitespace-pre-wrap">{exercise.codeContextBefore}</pre>
                )}

                {/* Input Row - Seamless Integration */}
                <div className="flex items-center group relative my-1">
                    <span className="w-8 text-right text-purple-400/50 mr-4 select-none pr-2">▶</span>
                    <input
                        type="text"
                        className={`flex-1 bg-transparent border-b ${showFeedback ? (isCorrect ? 'border-green-500 text-green-400' : 'border-red-500 text-red-500') : 'border-white/10 focus:border-purple-500 text-white'} outline-none px-1 py-1 transition-colors duration-300 placeholder-gray-600 font-mono`}
                        value={userAnswer}
                        onChange={(e) => setUserAnswer(e.target.value)}
                        placeholder={exercise.placeholder || "completa el código..."}
                        spellCheck="false"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') onSubmit();
                        }}
                    />
                </div>

                {/* Context After */}
                {exercise.codeContextAfter && (
                    <pre className="text-gray-500 whitespace-pre-wrap">{exercise.codeContextAfter}</pre>
                )}
            </div>

            {/* Actions */}
            <div className="p-5 bg-black/60 border-t border-white/10 flex justify-between items-center">
                <div>
                    {showFeedback && (
                        <span className={`text-sm font-medium animate-in slide-in-from-left-4 fade-in ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                            {isCorrect
                                ? (exercise.successMessage || "¡Correcto!")
                                : (exercise.errorMessage || "Respuesta incorrecta. Intenta de nuevo.")}
                        </span>
                    )}
                </div>
                <button
                    onClick={onSubmit}
                    className="px-6 py-2 bg-white/5 hover:bg-purple-600 hover:text-white border border-white/10 hover:border-purple-500 text-gray-300 font-medium rounded-full transition-all duration-300 text-sm active:scale-95"
                >
                    Verificar
                </button>
            </div>
        </div>
    );
};

/**
 * FillCodeRowExercise - User writes a complete line of code
 */
const FillCodeRowExercise = ({ exercise, userAnswer, setUserAnswer, onSubmit, showFeedback, isCorrect }) => {
    return (
        <div className="bg-black border border-white/10 rounded-3xl overflow-hidden shadow-2xl relative">
            {/* Header */}
            <div className="bg-black/60 px-6 py-4 border-b border-white/10">
                <h3 className="text-white font-semibold text-lg">Escribe la línea de código</h3>
                <p className="text-gray-400 text-sm mt-1">{exercise.description}</p>
            </div>

            {/* Code Context */}
            <div className="p-6 font-mono text-[15px] text-[#cccccc] overflow-x-auto leading-relaxed">
                {exercise.codeContextBefore && (
                    <pre className="text-gray-500 mb-2">
                        <code>{exercise.codeContextBefore}</code>
                    </pre>
                )}

                {/* Input Field */}
                <div className="flex items-center group relative my-2">
                    <span className="w-8 text-right text-purple-400/50 mr-4 select-none pr-2">▶</span>
                    <input
                        type="text"
                        className={`flex-1 bg-black border ${showFeedback ? (isCorrect ? 'border-green-500 text-green-400' : 'border-red-500 text-red-500') : 'border-white/20 focus:border-[#00c8ff] text-white'} rounded px-3 py-2 outline-none transition-colors duration-300 placeholder-gray-500 font-mono`}
                        value={userAnswer}
                        onChange={(e) => setUserAnswer(e.target.value)}
                        placeholder={exercise.placeholder || "escribe tu código aquí..."}
                        spellCheck="false"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') onSubmit();
                        }}
                    />
                </div>

                {exercise.codeContextAfter && (
                    <pre className="text-gray-500 mt-2">
                        <code>{exercise.codeContextAfter}</code>
                    </pre>
                )}
            </div>

            {/* Feedback & Actions */}
            <div className="p-5 bg-black/60 border-t border-white/10 flex justify-between items-center">
                <div>
                    {showFeedback && (
                        <span className={`text-sm font-medium animate-in slide-in-from-left-4 fade-in ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                            {isCorrect
                                ? (exercise.successMessage || "¡Perfecto! Código funcional.")
                                : (exercise.errorMessage || "Revisa tu código.")}
                        </span>
                    )}
                </div>
                <button
                    onClick={onSubmit}
                    className="px-6 py-2 bg-white/5 hover:bg-purple-600 hover:text-white border border-white/10 hover:border-purple-500 text-gray-300 font-medium rounded-full transition-all duration-300 text-sm active:scale-95"
                >
                    Verificar
                </button>
            </div>
        </div>
    );
};

/**
 * TestExercise - Multiple choice question
 */
const TestExercise = ({ exercise, selectedOption, setSelectedOption, onSubmit, showFeedback, isCorrect }) => {
    const options = exercise.options || [];

    return (
        <div className="bg-black border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="bg-black/60 px-6 py-4 border-b border-white/10">
                <h3 className="text-white font-semibold text-lg">{exercise.question}</h3>
            </div>

            {/* Options */}
            <div className="p-6 space-y-3">
                {options.map((option, index) => {
                    const optionKey = option.key || String.fromCharCode(65 + index); // A, B, C, D
                    const isSelected = selectedOption === optionKey;
                    const isCorrectOption = showFeedback && optionKey === exercise.correctAnswer;
                    const isWrongSelection = showFeedback && isSelected && !isCorrect;
                    const isDisabled = showFeedback && isCorrect; // Only disable if already correct

                    return (
                        <button
                            key={optionKey}
                            onClick={() => setSelectedOption(optionKey)}
                            disabled={isDisabled}
                            className={`w-full text-left p-4 rounded-xl border transition-all duration-300 ${isCorrectOption
                                    ? 'border-green-500 bg-green-500/10 text-green-400'
                                    : isWrongSelection
                                        ? 'border-red-500 bg-red-500/10 text-red-400'
                                        : isSelected
                                            ? 'border-purple-500 bg-purple-500/10 text-white'
                                            : 'border-white/10 bg-white/5 text-gray-300 hover:border-purple-500/50 hover:bg-white/10'
                                } ${isDisabled ? 'cursor-default' : 'cursor-pointer'}`}
                        >
                            <div className="flex items-center gap-3">
                                <span className={`w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full font-semibold text-sm ${isCorrectOption
                                        ? 'bg-green-500/20 text-green-400 border-2 border-green-500'
                                        : isWrongSelection
                                            ? 'bg-red-500/20 text-red-400 border-2 border-red-500'
                                            : isSelected
                                                ? 'bg-purple-500/20 text-purple-400 border-2 border-purple-500'
                                                : 'bg-white/5 text-gray-400 border-2 border-white/10'
                                    }`}>
                                    {optionKey}
                                </span>
                                <span className="flex-1">{option.text}</span>
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Feedback & Actions */}
            <div className="p-5 bg-black/60 border-t border-white/10 flex justify-between items-center">
                <div className="flex-1">
                    {showFeedback && (
                        <span className={`text-sm font-medium animate-in slide-in-from-left-4 fade-in ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                            {isCorrect
                                ? (exercise.successMessage || "¡Correcto!")
                                : (exercise.errorMessage || "Respuesta incorrecta. Intenta de nuevo.")}
                        </span>
                    )}
                </div>
                <button
                    onClick={onSubmit}
                    disabled={!selectedOption || (showFeedback && isCorrect)}
                    className="px-6 py-2 bg-white/5 hover:bg-purple-600 hover:text-white border border-white/10 hover:border-purple-500 text-gray-300 font-medium rounded-full transition-all duration-300 text-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white/5 disabled:hover:text-gray-300"
                >
                    Verificar
                </button>
            </div>
        </div>
    );
};

/**
 * WhatIfExercise - Debugging scenarios and predicting results
 */
const WhatIfExercise = ({ exercise, userAnswer, setUserAnswer, onSubmit, showFeedback, isCorrect }) => {
    return (
        <div className="bg-black border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="bg-black/60 px-6 py-4 border-b border-white/10">
                <h3 className="text-white font-semibold text-lg">¿Qué sucede si...?</h3>
                <p className="text-gray-400 text-sm mt-1">{exercise.scenario}</p>
            </div>

            {/* Code Display */}
            {exercise.code && (
                <div className="p-6 font-mono text-[15px] bg-black border-b border-white/10">
                    <pre className="text-[#cccccc] overflow-x-auto">
                        <code>{exercise.code}</code>
                    </pre>
                </div>
            )}

            {/* Question */}
            <div className="p-6">
                <p className="text-white mb-4">{exercise.question}</p>

                {/* Answer Input */}
                <textarea
                    className={`w-full bg-black border ${showFeedback ? (isCorrect ? 'border-green-500 text-green-400' : 'border-red-500 text-red-500') : 'border-white/20 focus:border-[#00c8ff] text-white'} rounded-xl px-4 py-3 outline-none transition-colors duration-300 placeholder-gray-500 font-sans resize-none`}
                    rows="4"
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder={exercise.placeholder || "Escribe tu predicción aquí..."}
                    spellCheck="false"
                />
            </div>

            {/* Feedback & Actions */}
            <div className="p-5 bg-black/60 border-t border-white/10 flex justify-between items-center">
                <div>
                    {showFeedback && (
                        <span className={`text-sm font-medium animate-in slide-in-from-left-4 fade-in ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                            {isCorrect
                                ? (exercise.successMessage || "¡Excelente análisis!")
                                : (exercise.errorMessage || "No es correcto. Piensa en el flujo de ejecución.")}
                        </span>
                    )}
                </div>
                <button
                    onClick={onSubmit}
                    className="px-6 py-2 bg-white/5 hover:bg-purple-600 hover:text-white border border-white/10 hover:border-purple-500 text-gray-300 font-medium rounded-full transition-all duration-300 text-sm active:scale-95"
                >
                    Verificar
                </button>
            </div>
        </div>
    );
};

// --- Main ExerciseModule Component ---

const ExerciseModule = ({
    exercise,
    onComplete,
    onNext
}) => {
    const [userAnswer, setUserAnswer] = useState('');
    const [showFeedback, setShowFeedback] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);

    if (!exercise) {
        return (
            <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-8 text-center">
                <p className="text-gray-400">No hay ejercicio disponible</p>
            </div>
        );
    }

    const handleSubmit = () => {
        let correct = false;

        // Normalize answers for comparison
        const normalizeAnswer = (answer) => {
            return answer.trim().replace(/\s+/g, ' ').toLowerCase();
        };

        switch (exercise.type) {
            case 'fill_blanks':
            case 'fill_code_row':
                // For fill exercises, compare exact or normalized answers
                const cleanInput = exercise.caseSensitive
                    ? userAnswer.trim().replace(/\s+/g, ' ')
                    : normalizeAnswer(userAnswer);
                const cleanExpected = exercise.caseSensitive
                    ? exercise.expectedAnswer.trim().replace(/\s+/g, ' ')
                    : normalizeAnswer(exercise.expectedAnswer);

                // Support multiple correct answers
                if (exercise.acceptedAnswers && Array.isArray(exercise.acceptedAnswers)) {
                    correct = exercise.acceptedAnswers.some(ans =>
                        exercise.caseSensitive
                            ? cleanInput === ans.trim().replace(/\s+/g, ' ')
                            : cleanInput === normalizeAnswer(ans)
                    );
                } else {
                    correct = cleanInput === cleanExpected;
                }
                break;

            case 'test':
                console.log('Test validation - userAnswer:', userAnswer, 'correctAnswer:', exercise.correctAnswer);
                correct = userAnswer === exercise.correctAnswer;
                console.log('Test result:', correct);
                break;

            case 'what_if':
                // For what_if, can be exact match or keyword-based validation
                if (exercise.acceptedAnswers && Array.isArray(exercise.acceptedAnswers)) {
                    correct = exercise.acceptedAnswers.some(ans =>
                        normalizeAnswer(userAnswer).includes(normalizeAnswer(ans))
                    );
                } else {
                    correct = normalizeAnswer(userAnswer) === normalizeAnswer(exercise.expectedAnswer);
                }
                break;

            default:
                correct = false;
        }

        setIsCorrect(correct);
        setShowFeedback(true);

        // Call onComplete callback with result
        if (onComplete) {
            onComplete({ correct, answer: userAnswer, exerciseId: exercise.id });
        }
    };

    const handleReset = () => {
        setUserAnswer('');
        setShowFeedback(false);
        setIsCorrect(false);
    };

    const handleNextExercise = () => {
        handleReset();
        if (onNext) {
            onNext();
        }
    };

    // Render appropriate exercise component based on type
    const renderExercise = () => {
        const commonProps = {
            exercise,
            userAnswer,
            setUserAnswer: (value) => {
                setUserAnswer(value);
                setShowFeedback(false); // Reset feedback when user changes answer
            },
            onSubmit: handleSubmit,
            showFeedback,
            isCorrect
        };

        switch (exercise.type) {
            case 'fill_blanks':
                return <FillBlanksExercise {...commonProps} />;

            case 'fill_code_row':
                return <FillCodeRowExercise {...commonProps} />;

            case 'test':
                return <TestExercise
                    {...commonProps}
                    selectedOption={userAnswer}
                    setSelectedOption={commonProps.setUserAnswer}
                />;

            case 'what_if':
                return <WhatIfExercise {...commonProps} />;

            default:
                return (
                    <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-8 text-center">
                        <p className="text-red-400">Tipo de ejercicio no soportado: {exercise.type}</p>
                    </div>
                );
        }
    };

    return (
        <div className="w-full">
            {/* Exercise Type Badge */}
            <div className="flex items-center gap-2 mb-4 ml-2">
                <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></div>
                <h3 className="text-sm font-semibold tracking-wide text-gray-400 uppercase">
                    {exercise.type === 'fill_blanks' && 'Completar Espacios'}
                    {exercise.type === 'fill_code_row' && 'Escribir Código'}
                    {exercise.type === 'test' && 'Test de Opción Múltiple'}
                    {exercise.type === 'what_if' && 'Análisis: ¿Qué sucede si...?'}
                </h3>
            </div>

            {/* Exercise Component */}
            {renderExercise()}

            {/* Navigation Buttons */}
            {showFeedback && isCorrect && onNext && (
                <div className="mt-6 flex justify-end">
                    <button
                        onClick={handleNextExercise}
                        className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-full transition-all duration-300 text-sm active:scale-95 shadow-lg"
                    >
                        Siguiente Ejercicio →
                    </button>
                </div>
            )}
        </div>
    );
};

export default ExerciseModule;
