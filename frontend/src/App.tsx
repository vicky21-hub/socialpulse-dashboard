import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { FilterProvider } from './context/FilterContext';
import { Layout } from './components/Layout';
import { DashboardPage } from './pages/DashboardPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { PostsPage } from './pages/PostsPage';
import { RecommendationsPage } from './pages/RecommendationsPage';
import { UploadPage } from './pages/UploadPage';

export function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  return (
    <ThemeProvider>
      <FilterProvider>
        <Layout
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          showFilters={activeTab !== 'upload'}
        >
          {activeTab === 'dashboard' && <DashboardPage onNavigate={setActiveTab} />}
          {activeTab === 'analytics' && <AnalyticsPage />}
          {activeTab === 'posts' && <PostsPage />}
          {activeTab === 'recommendations' && <RecommendationsPage />}
          {activeTab === 'upload' && <UploadPage onNavigate={setActiveTab} />}
        </Layout>
      </FilterProvider>
    </ThemeProvider>
  );
}

export default App;
