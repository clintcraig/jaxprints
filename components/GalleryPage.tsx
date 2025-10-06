import React, { useState, useMemo } from 'react';

const allJerseys = [
  { id: 1, category: 'Basketball', src: 'https://picsum.photos/seed/jersey1/500/700' },
  { id: 2, category: 'Esports', src: 'https://picsum.photos/seed/jersey2/500/700' },
  { id: 3, category: 'Events', src: 'https://picsum.photos/seed/jersey3/500/700' },
  { id: 4, category: 'Basketball', src: 'https://picsum.photos/seed/jersey4/500/700' },
  { id: 5, category: 'Events', src: 'https://picsum.photos/seed/jersey5/500/700' },
  { id: 6, category: 'Esports', src: 'https://picsum.photos/seed/jersey6/500/700' },
  { id: 7, category: 'Basketball', src: 'https://picsum.photos/seed/jersey7/500/700' },
  { id: 8, category: 'Esports', src: 'https://picsum.photos/seed/jersey8/500/700' },
  { id: 9, category: 'Events', src: 'https://picsum.photos/seed/jersey9/500/700' },
  { id: 10, category: 'Basketball', src: 'https://picsum.photos/seed/jersey10/500/700' },
  { id: 11, category: 'Esports', src: 'https://picsum.photos/seed/jersey11/500/700' },
  { id: 12, category: 'Events', src: 'https://picsum.photos/seed/jersey12/500/700' },
];

const categories = ['All', 'Basketball', 'Esports', 'Events'];

const GalleryPage: React.FC = () => {
    const [activeCategory, setActiveCategory] = useState('All');
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    const filteredJerseys = useMemo(() => {
        if (activeCategory === 'All') {
            return allJerseys;
        }
        return allJerseys.filter(jersey => jersey.category === activeCategory);
    }, [activeCategory]);

    const handleImageClick = (src: string) => {
        setSelectedImage(src);
    };

    const handleCloseModal = () => {
        setSelectedImage(null);
    };

    return (
        <div className="space-y-12">
            <div className="text-center">
                <h1 className="font-heading text-4xl md:text-5xl font-extrabold text-jax-black">Jersey Design Gallery</h1>
                <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">Explore some of the custom jerseys we've created for teams and events in Dumaguete and beyond.</p>
            </div>

            <div className="flex justify-center flex-wrap gap-2 md:gap-4">
                {categories.map(category => (
                    <button
                        key={category}
                        onClick={() => setActiveCategory(category)}
                        className={`px-5 py-2 text-sm font-bold rounded-full transition-colors duration-300 ${
                            activeCategory === category
                                ? 'bg-jax-blue text-white shadow-md'
                                : 'bg-white text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                        {category}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {filteredJerseys.map(jersey => (
                    <div
                        key={jersey.id}
                        className="group relative cursor-pointer overflow-hidden rounded-xl shadow-lg"
                        onClick={() => handleImageClick(jersey.src)}
                        role="button"
                        aria-label={`View jersey design ${jersey.id}`}
                    >
                        <img src={jersey.src} alt={`Jersey design ${jersey.id}`} className="w-full h-full object-cover aspect-[5/7] transition-transform duration-300 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-black/20 transition-opacity duration-300 opacity-0 group-hover:opacity-100 flex items-center justify-center">
                             <div className="p-3 bg-white/80 rounded-full backdrop-blur-sm">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-jax-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {selectedImage && (
                <div
                    className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
                    onClick={handleCloseModal}
                    role="dialog"
                    aria-modal="true"
                >
                    <div className="relative max-w-3xl max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
                        <img src={selectedImage} alt="Enlarged jersey view" className="rounded-lg shadow-2xl object-contain max-h-[90vh]" />
                         <button
                            onClick={handleCloseModal}
                            className="absolute -top-4 -right-4 h-10 w-10 bg-white rounded-full text-gray-700 flex items-center justify-center shadow-lg hover:bg-gray-200 transition"
                            aria-label="Close image viewer"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GalleryPage;
