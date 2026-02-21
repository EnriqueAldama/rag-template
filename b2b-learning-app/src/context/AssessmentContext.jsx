import React, { createContext, useState, useContext } from 'react';

const AssessmentContext = createContext(null);

export const AssessmentProvider = ({ children }) => {
    const [assessmentData, setAssessmentData] = useState({
        react: 0,
        nodejs: 0,
        sql: 0
    });

    const updateSkill = (skill, value) => {
        setAssessmentData(prev => ({ ...prev, [skill]: value }));
    };

    return (
        <AssessmentContext.Provider value={{ assessmentData, updateSkill }}>
            {children}
        </AssessmentContext.Provider>
    );
};

export const useAssessment = () => {
    const context = useContext(AssessmentContext);
    if (!context) {
        throw new Error('useAssessment must be used within an AssessmentProvider');
    }
    return context;
};
