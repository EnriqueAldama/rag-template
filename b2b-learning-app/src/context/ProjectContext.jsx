import React, { createContext, useState, useContext } from 'react';

const ProjectContext = createContext();

export const ProjectProvider = ({ children }) => {
    // 1. Inicializamos leyendo de localStorage
    const [project, setProjectState] = useState(() => {
        if (typeof window !== 'undefined') {
            const savedProject = localStorage.getItem('hackathon_current_project');
            return savedProject ? JSON.parse(savedProject) : null;
        }
        return null;
    });

    // 2. Función para guardar el proyecto completo
    const setProject = (projectData) => {
        setProjectState(projectData);
        if (projectData) {
            localStorage.setItem('hackathon_current_project', JSON.stringify(projectData));
        } else {
            localStorage.removeItem('hackathon_current_project');
        }
    };

    // 3. ✨ BONUS: Función para actualizar la UI instantáneamente
    // Esto te permitirá pintar el nodo de verde en el roadmap sin tener que volver a hacer un GET al backend
    const markModuleAsCompleted = (moduleIdToComplete) => {
        setProjectState(prevProject => {
            if (!prevProject) return null;
            
            // Creamos una copia del proyecto con el módulo actualizado
            const updatedProject = {
                ...prevProject,
                curriculum: prevProject.curriculum.map(mod => 
                    mod.moduleId.toString() === moduleIdToComplete.toString()
                        ? { ...mod, was_completed: true }
                        : mod
                )
            };
            
            // Guardamos la copia actualizada en localStorage
            localStorage.setItem('hackathon_current_project', JSON.stringify(updatedProject));
            return updatedProject;
        });
    };

    return (
        <ProjectContext.Provider value={{ project, setProject, markModuleAsCompleted }}>
            {children}
        </ProjectContext.Provider>
    );
};

export const useProject = () => {
    const context = useContext(ProjectContext);
    if (!context) {
        throw new Error("useProject debe usarse dentro de un ProjectProvider");
    }
    return context;
};