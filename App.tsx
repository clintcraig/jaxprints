import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './components/HomePage';
import PhotoRestorationPage from './components/PhotoRestorationPage';
import ServicesPage from './components/ServicesPage';
import GalleryPage from './components/GalleryPage';
import QuotePage from './components/QuotePage';
import TarpGeneratorPage from './components/TarpGeneratorPage'; // Import the new page

const App: React.FC = () => {
  return (
    <HashRouter>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/ai-lab/photo-restoration" element={<PhotoRestorationPage />} />
            <Route path="/ai-lab/tarp-generator" element={<TarpGeneratorPage />} /> {/* Add the new route */}
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/gallery" element={<GalleryPage />} />
            <Route path="/quote" element={<QuotePage />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </HashRouter>
  );
};

export default App;