# ExerciseModule - Documentación

## Descripción

El `ExerciseModule` es un componente modular que maneja diferentes tipos de ejercicios de programación. Fue refactorizado desde `LessonScreen.jsx` para separar la lógica de ejercicios y permitir una integración más fácil con el backend.

## Tipos de Ejercicios Soportados

### 1. `fill_blanks` - Completar Espacios en Blanco

Permite al usuario completar código faltante escribiendo en un campo de texto.

**Estructura de datos:**
```javascript
{
  id: 'ex1', // ID único del ejercicio
  type: 'fill_blanks',
  fileName: 'appConfig.js', // Nombre del archivo (opcional)
  codeContextBefore: "// Código antes del espacio\n",
  codeContextAfter: "\n// Código después del espacio",
  expectedAnswer: "const API_URL = 'https://api.empresa.com';",
  placeholder: "declara la constante aquí...",
  successMessage: "¡Correcto!",
  errorMessage: "Respuesta incorrecta.",
  caseSensitive: false, // Comparación sensible a mayúsculas (opcional)
  acceptedAnswers: [ /* Array de respuestas válidas (opcional) */ ]
}
```

### 2. `test` - Opción Múltiple

Presenta una pregunta con múltiples opciones de respuesta.

**Estructura de datos:**
```javascript
{
  id: 'ex2',
  type: 'test',
  question: "¿Cuál es la forma correcta de...?",
  options: [
    { key: 'A', text: 'Opción A' },
    { key: 'B', text: 'Opción B' },
    { key: 'C', text: 'Opción C' },
    { key: 'D', text: 'Opción D' }
  ],
  correctAnswer: 'B', // La clave de la opción correcta
  successMessage: "¡Correcto!",
  errorMessage: "Incorrecto. Intenta de nuevo."
}
```

### 3. `what_if` - Escenarios de Debugging

Presenta un escenario de código y pide al usuario predecir el resultado.

**Estructura de datos:**
```javascript
{
  id: 'ex4',
  type: 'what_if',
  scenario: "Analiza el siguiente código y predice el resultado",
  code: "let count = 0;\nfor (let i = 0; i < 3; i++) {\n  count += i;\n}\nconsole.log(count);",
  question: "¿Qué valor se imprime en la consola?",
  expectedAnswer: "3",
  acceptedAnswers: ["3", "tres", "0+1+2=3"], // Múltiples respuestas válidas
  placeholder: "Escribe tu predicción...",
  successMessage: "¡Excelente análisis!",
  errorMessage: "Piensa en el flujo de ejecución."
}
```

### 4. `fill_code_row` - Escribir Línea de Código

El usuario debe escribir una línea completa de código funcional.

**Estructura de datos:**
```javascript
{
  id: 'ex3',
  type: 'fill_code_row',
  description: "Completa la función asíncrona para obtener datos",
  codeContextBefore: "async function fetchData() {\n  try {",
  codeContextAfter: "    return result.data;\n  }\n}",
  expectedAnswer: "const result = await getData(clienteId);",
  acceptedAnswers: [
    "const result = await getData(clienteId);",
    "const result=await getData(clienteId);" // Sin espacios
  ],
  placeholder: "escribe tu código aquí...",
  successMessage: "¡Perfecto!",
  errorMessage: "Revisa tu código.",
  caseSensitive: false
}
```

## Uso del Componente

### Importación

```javascript
import ExerciseModule from './components/ExerciseModule';
```

### Implementación

```javascript
const [currentExercise, setCurrentExercise] = useState(exerciseData);

const handleExerciseComplete = (result) => {
  console.log('Exercise completed:', result);
  // result contiene: { correct, answer, exerciseId }
  
  // Enviar resultado al backend
  // await sendResultToBackend(result);
};

const handleNextExercise = () => {
  // Cargar siguiente ejercicio
  // const nextEx = await fetchNextExercise();
  // setCurrentExercise(nextEx);
};

// En el JSX
<ExerciseModule
  exercise={currentExercise}
  onComplete={handleExerciseComplete}
  onNext={handleNextExercise}
/>
```

## Integración con Backend

### Endpoint para Obtener Ejercicios

**Ejemplo de endpoint:**
```
GET /api/lessons/{lessonId}/exercises
```

**Respuesta esperada:**
```json
{
  "lessonId": "lesson-123",
  "title": "Fundamentos de JavaScript",
  "theory": "## Variables\nEn JavaScript moderno...",
  "exercises": [
    {
      "id": "ex1",
      "type": "fill_blanks",
      "fileName": "app.js",
      "codeContextBefore": "function init() {\n",
      "codeContextAfter": "\n}",
      "expectedAnswer": "const x = 5;",
      "placeholder": "declara la variable...",
      "successMessage": "¡Correcto!",
      "errorMessage": "Intenta de nuevo."
    }
  ]
}
```

### Endpoint para Enviar Resultados

**Ejemplo de endpoint:**
```
POST /api/exercises/{exerciseId}/submit
```

**Body:**
```json
{
  "exerciseId": "ex1",
  "answer": "const x = 5;",
  "correct": true,
  "timeSpent": 45 // segundos (opcional)
}
```

### Ejemplo de Integración Completa

```javascript
import React, { useState, useEffect } from 'react';
import ExerciseModule from './components/ExerciseModule';

const LessonScreen = ({ lessonId }) => {
  const [exercises, setExercises] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Cargar ejercicios desde el backend
    const fetchExercises = async () => {
      try {
        const response = await fetch(`/api/lessons/${lessonId}/exercises`);
        const data = await response.json();
        setExercises(data.exercises);
        setLoading(false);
      } catch (error) {
        console.error('Error loading exercises:', error);
      }
    };

    fetchExercises();
  }, [lessonId]);

  const handleExerciseComplete = async (result) => {
    // Enviar resultado al backend
    try {
      await fetch(`/api/exercises/${result.exerciseId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result)
      });
    } catch (error) {
      console.error('Error submitting result:', error);
    }
  };

  const handleNextExercise = () => {
    if (currentIndex < exercises.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      // Completado todos los ejercicios
      alert('¡Has completado todos los ejercicios!');
    }
  };

  if (loading) return <div>Cargando...</div>;

  return (
    <div>
      <ExerciseModule
        exercise={exercises[currentIndex]}
        onComplete={handleExerciseComplete}
        onNext={handleNextExercise}
      />
    </div>
  );
};

export default LessonScreen;
```

## Validación de Respuestas

El componente incluye validación automática:

### Para ejercicios tipo "fill" (fill_blanks, fill_code_row):
- Normaliza espacios (múltiples espacios → un espacio)
- Elimina espacios al inicio y final
- Soporta comparación case-insensitive (opcional)
- Soporta múltiples respuestas válidas mediante `acceptedAnswers`

### Para ejercicios tipo "test":
- Comparación exacta de la clave seleccionada

### Para ejercicios tipo "what_if":
- Puede usar coincidencia exacta o búsqueda de palabras clave
- Soporta múltiples respuestas válidas

## Features Adicionales

- **Feedback visual**: Colores verde/rojo para respuestas correctas/incorrectas
- **Enter para enviar**: En ejercicios de texto, presionar Enter envía la respuesta
- **Navegación automática**: Botón "Siguiente" aparece automáticamente al completar correctamente
- **Diseño responsive**: Se adapta a diferentes tamaños de pantalla
- **Animaciones**: Transiciones suaves para mejor UX

## Personalización

El componente es altamente personalizable. Puedes modificar:

- Estilos mediante clases Tailwind
- Mensajes de feedback
- Lógica de validación
- Formato de visualización de código
- Comportamiento del botón "Siguiente"

## Notas

- Todos los ejercicios tipo "fill" solo requieren que el usuario escriba la respuesta en un campo de texto
- La validación se hace del lado del cliente, pero deberías validar también en el backend
- Los IDs de ejercicios deben ser únicos
- El componente maneja el estado interno, pero puedes controlarlo externamente si es necesario
