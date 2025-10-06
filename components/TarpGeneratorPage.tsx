import React, { useState, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import type { TarpDesignOptions } from '../types';
import { generateTarpDesign } from '../services/geminiService';
import Spinner from './Spinner';

const TarpGeneratorPage: React.FC = () => {
    const [options, setOptions] = useState<TarpDesignOptions>({
        name: '',
        age: '',
        theme: '',
        orientation: 'Landscape',
    });
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [loadingMessage, setLoadingMessage] = useState<string>('');
    const [error, setError] = useState<string | null>(null);

    const loadingMessages = useMemo(() => [
        "Dreaming up your design...",
        "Mixing the perfect colors...",
        "Sketching the theme...",
        "Adding birthday magic...",
        "Unveiling the masterpiece...",
    ], []);
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setOptions(prev => ({ ...prev, [name]: value }));
    };

    const handleOrientationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setOptions(prev => ({...prev, orientation: e.target.value as 'Portrait' | 'Landscape'}));
    };

    const handleGenerate = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        setGeneratedImage(null);

        const messageInterval = setInterval(() => {
            setLoadingMessage(loadingMessages[Math.floor(Math.random() * loadingMessages.length)]);
        }, 2000);
        setLoadingMessage(loadingMessages[0]);

        try {
            const resultBase64 = await generateTarpDesign(options);
            setGeneratedImage(`data:image/png;base64,${resultBase64}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unexpected error occurred during design generation.");
        } finally {
            setIsLoading(false);
            clearInterval(messageInterval);
        }
    }, [options, loadingMessages]);

    const isFormValid = options.name && options.age && options.theme;

    return (
        <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
                <h1 className="font-heading text-4xl md:text-5xl font-extrabold text-jax-black">AI Tarpaulin Generator</h1>
                <p className="mt-3 text-lg text-gray-600 max-w-2xl mx-auto">Create a unique birthday tarpaulin design in seconds. Just provide the details and let our AI do the rest!</p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8 items-start">
                {/* Left Column: Form & Options */}
                <div className="space-y-6 bg-white/60 backdrop-blur-lg p-6 rounded-2xl shadow-lg border border-white/30">
                    <div>
                        <h2 className="text-xl font-bold font-heading mb-4">1. Enter Birthday Details</h2>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="name" className="block text-sm font-bold text-gray-700 mb-1">Celebrant's Name *</label>
                                <input type="text" id="name" name="name" value={options.name} onChange={handleInputChange} placeholder="e.g., John" required className="block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-jax-blue focus:border-jax-blue" />
                            </div>
                             <div>
                                <label htmlFor="age" className="block text-sm font-bold text-gray-700 mb-1">Age & Suffix *</label>
                                <input type="text" id="age" name="age" value={options.age} onChange={handleInputChange} placeholder="e.g., 7th, 1st, 18th" required className="block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-jax-blue focus:border-jax-blue" />
                            </div>
                            <div>
                                <label htmlFor="theme" className="block text-sm font-bold text-gray-700 mb-1">Theme / Keywords *</label>
                                <input type="text" id="theme" name="theme" value={options.theme} onChange={handleInputChange} placeholder="e.g., Spider-man, blue and red, city" required className="block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-jax-blue focus:border-jax-blue" />
                            </div>
                        </div>
                    </div>

                    <div>
                        <h2 className="text-xl font-bold font-heading">2. Choose Orientation</h2>
                        <div className="mt-4 grid grid-cols-2 gap-3">
                            <label className={`flex items-center justify-center space-x-3 p-3 rounded-lg shadow-sm cursor-pointer transition ${options.orientation === 'Landscape' ? 'bg-jax-blue text-white' : 'bg-white hover:bg-blue-50'}`}>
                                <input type="radio" name="orientation" value="Landscape" checked={options.orientation === 'Landscape'} onChange={handleOrientationChange} className="hidden"/>
                                <span className="text-sm font-medium">Landscape</span>
                            </label>
                             <label className={`flex items-center justify-center space-x-3 p-3 rounded-lg shadow-sm cursor-pointer transition ${options.orientation === 'Portrait' ? 'bg-jax-blue text-white' : 'bg-white hover:bg-blue-50'}`}>
                                <input type="radio" name="orientation" value="Portrait" checked={options.orientation === 'Portrait'} onChange={handleOrientationChange} className="hidden"/>
                                <span className="text-sm font-medium">Portrait</span>
                            </label>
                        </div>
                    </div>

                    <div>
                        <button 
                            onClick={handleGenerate}
                            disabled={!isFormValid || isLoading}
                            className="w-full px-8 py-4 text-lg font-bold text-white bg-jax-blue rounded-xl shadow-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                            {isLoading ? (
                                <>
                                    <Spinner />
                                    <span className="ml-2">Generating...</span>
                                </>
                            ) : "Generate Design"}
                        </button>
                        {!isFormValid && <p className="text-xs text-red-500 text-center mt-2">Please fill in all required fields.</p>}
                    </div>
                </div>

                {/* Right Column: Result */}
                <div className="bg-white p-6 rounded-2xl shadow-xl min-h-[400px] flex flex-col justify-center items-center">
                    <h2 className="text-xl font-bold font-heading mb-4 text-center">3. Your Custom Design</h2>
                    {isLoading && (
                        <div className="text-center">
                        <Spinner size="lg"/>
                        <p className="mt-4 text-gray-600 font-medium">{loadingMessage}</p>
                        <p className="text-sm text-gray-500 mt-2">This may take up to a minute...</p>
                        </div>
                    )}
                    {error && <p className="text-jax-red text-center">{error}</p>}
                    {!isLoading && !error && generatedImage && (
                        <div className="w-full space-y-4">
                            <img src={generatedImage} alt="Generated tarpaulin design" className={`w-full rounded-lg shadow-lg ${options.orientation === 'Portrait' ? 'aspect-[9/16]' : 'aspect-video'}`}/>
                            <div className="flex gap-4">
                                <a href={generatedImage} download="jax-tarp-design.png" className="flex-1 text-center px-6 py-3 font-bold text-jax-blue bg-white border-2 border-jax-blue rounded-xl shadow-md hover:bg-blue-50 transition">Download</a>
                                <Link to="/quote" className="flex-1 text-center px-6 py-3 font-bold text-white bg-jax-red rounded-xl shadow-md hover:bg-red-600 transition">Quote for Printing</Link>
                            </div>
                        </div>
                    )}
                    {!isLoading && !generatedImage && !error && (
                        <div className="text-center text-gray-500">
                            <p>Your generated design will appear here.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TarpGeneratorPage;