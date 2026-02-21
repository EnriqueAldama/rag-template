import React, { useState } from 'react';
import Layout from './components/Layout';
import SearchScreen from './components/SearchScreen';
import AssessmentScreen from './components/AssessmentScreen';
import { AssessmentProvider } from './context/AssessmentContext';

import RoadmapScreen from './components/RoadmapScreen';
import LessonScreen from './components/LessonScreen';
import { UserProvider } from './context/UserContext';
import { ProjectProvider } from './context/ProjectContext';

function AppContent() {
  // maintain a history stack so we can go backwards between screens
  const [history, setHistory] = useState(['search']);

  const currentScreen = history[history.length - 1];
  const canGoBack = history.length > 1;

  const navigateTo = (screen) => {
    console.log('Navigating to:', screen);
    setHistory((prev) => [...prev, screen]);
  };

  const goBack = () => {
    setHistory((prev) => {
      if (prev.length <= 1) return ['search'];
      const next = prev.slice(0, -1);
      return next.length ? next : ['search'];
    });
  };

  const goHome = () => {
    setHistory(['search']);
  };

  return (
    <Layout onLogoClick={goHome} onBackClick={goBack} canGoBack={canGoBack}>
      {currentScreen === 'search' && (
        <SearchScreen onNavigate={() => navigateTo('assessment')} onBack={goBack} />
      )}
      {currentScreen === 'assessment' && (
        <AssessmentScreen onNavigate={() => navigateTo('roadmap')} onBack={goBack} />
      )}
      {currentScreen === 'roadmap' && (
        <RoadmapScreen onNavigate={() => navigateTo('search')} onLessonOpen={() => navigateTo('lesson')} onBack={goBack} />
      )}
      {currentScreen === 'lesson' && (
        <LessonScreen onNavigate={(route) => navigateTo(route || 'roadmap')} onBack={goBack} />
      )}
    </Layout>
  );
}

function App() {
  return (
    <UserProvider>
      <ProjectProvider>
        <AssessmentProvider>
          <AppContent />
        </AssessmentProvider>
      </ProjectProvider>
    </UserProvider>
  );
}

export default App;
