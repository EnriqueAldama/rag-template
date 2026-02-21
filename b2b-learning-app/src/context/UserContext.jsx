import React, { createContext, useState, useContext } from 'react';

// 1. Creamos el contexto
const UserContext = createContext();

// 2. Creamos el Provider que envolverá la app
export const UserProvider = ({ children }) => {
    // Inicializamos el estado leyendo de localStorage (si existe)
    const [userId, setUserIdState] = useState(() => {
        // Comprobamos typeof window para evitar errores si usas Next.js (SSR)
        if (typeof window !== 'undefined') {
            return localStorage.getItem('hackathon_user_id') || null;
        }
        return null;
    });

    // 3. Función envoltorio para actualizar React y localStorage a la vez
    const setUserId = (id) => {
        setUserIdState(id); // Actualiza el estado global de React
        
        if (id) {
            localStorage.setItem('hackathon_user_id', id); // Guarda persistentemente
        } else {
            localStorage.removeItem('hackathon_user_id'); // Útil si quieres hacer un "logout" o reset
        }
    };

    return (
        <UserContext.Provider value={{ userId, setUserId }}>
            {children}
        </UserContext.Provider>
    );
};

// 4. Hook personalizado para facilitar la importación en los componentes
export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error("useUser debe ser usado dentro de un UserProvider");
    }
    return context;
};