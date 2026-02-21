import React, { useState } from 'react';
import Layout from './components/Layout';
import SearchScreen from './components/SearchScreen';
import AssessmentScreen from './components/AssessmentScreen';
import { AssessmentProvider, useAssessment } from './context/AssessmentContext';

import RoadmapScreen from './components/RoadmapScreen';
import LessonScreen from './components/LessonScreen';

function AppContent() {
  const [currentScreen, setCurrentScreen] = useState('search');

  const navigateTo = (screen) => {
    setCurrentScreen(screen);
  };

  return (
    <Layout>
      {currentScreen === 'search' && <SearchScreen onNavigate={() => navigateTo('assessment')} />}
      {currentScreen === 'assessment' && <AssessmentScreen onNavigate={() => navigateTo('roadmap')} />}
      {currentScreen === 'roadmap' && <RoadmapScreen onNavigate={() => navigateTo('search')} onLessonOpen={() => navigateTo('lesson')} />}
      {currentScreen === 'lesson' && <LessonScreen onNavigate={(route) => navigateTo(route || 'roadmap')} />}
    </Layout>
  );
}

function App() {
  return (
    <AssessmentProvider>
      <AppContent />
    </AssessmentProvider>
  );
}

export default App;
