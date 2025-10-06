import React, { useState, useCallback, useMemo } from 'react';
import type { RestorationOptions } from '../types';
import { restorePhoto } from '../services/geminiService';
import BeforeAfterSlider from './BeforeAfterSlider';
import Spinner from './Spinner';
import PrintRequestModal from './PrintRequestModal';

const UploadIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-4-4V7a4 4 0 014-4h10a4 4 0 014 4v5a4 4 0 01-4 4h-2m-6 4h6m-3-4v4" />
  </svg>
);

const CheckboxOption: React.FC<{ id: keyof RestorationOptions; label: string; checked: boolean; onChange: (id: keyof RestorationOptions) => void; }> = ({ id, label, checked, onChange }) => (
    <label htmlFor={id} className="flex items-center space-x-3 p-3 bg-white rounded-lg shadow-sm cursor-pointer hover:bg-blue-50 transition">
        <input 
            id={id} 
            type="checkbox" 
            checked={checked}
            onChange={() => onChange(id)}
            className="h-5 w-5 text-jax-blue rounded border-gray-300 focus:ring-jax-blue"
        />
        <span className="text-sm font-medium text-gray-700">{label}</span>
    </label>
);


const PhotoRestorationPage: React.FC = () => {
    const [originalImage, setOriginalImage] = useState<{file: File, url: string} | null>(null);
    const [restoredImage, setRestoredImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [loadingMessage, setLoadingMessage] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
    const [options, setOptions] = useState<RestorationOptions>({
        restoreFace: true,
        colorize: true,
        upscale: false,
        cleanNoise: true,
    });

    const loadingMessages = useMemo(() => [
        "Warming up the AI engine...",
        "Analyzing pixels and patterns...",
        "Restoring your precious memories...",
        "Applying advanced color science...",
        "Polishing the final details...",
        "Almost there, the magic is happening!",
    ], []);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setOriginalImage({ file, url: URL.createObjectURL(file) });
            setRestoredImage(null);
            setError(null);
        }
    };
    
    const handleOptionChange = (option: keyof RestorationOptions) => {
        setOptions(prev => ({ ...prev, [option]: !prev[option] }));
    };

    const handleRestore = useCallback(async () => {
        if (!originalImage) return;

        setIsLoading(true);
        setError(null);
        setRestoredImage(null);
        
        const messageInterval = setInterval(() => {
            setLoadingMessage(loadingMessages[Math.floor(Math.random() * loadingMessages.length)]);
        }, 2000);
        setLoadingMessage(loadingMessages[0]);

        try {
            const reader = new FileReader();
            reader.readAsDataURL(originalImage.file);
            reader.onloadend = async () => {
                const base64String = (reader.result as string).split(',')[1];
                if (base64String) {
                    const resultBase64 = await restorePhoto(base64String, originalImage.file.type, options);
                    setRestoredImage(`data:${originalImage.file.type};base64,${resultBase64}`);
                } else {
                     throw new Error("Could not read image file.");
                }
                setIsLoading(false);
                clearInterval(messageInterval);
            };
             reader.onerror = () => {
                throw new Error("Failed to process the image file.");
            };
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unexpected error occurred.");
            setIsLoading(false);
            clearInterval(messageInterval);
        }
    }, [originalImage, options, loadingMessages]);

    const isAnyOptionSelected = Object.values(options).some(v => v);

    return (
        <>
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="font-heading text-4xl md:text-5xl font-extrabold text-jax-black">Photo Restoration AI</h1>
                    <p className="mt-3 text-lg text-gray-600 max-w-2xl mx-auto">Breathe new life into your old photos. Upload, restore, and cherish your memories.</p>
                </div>

                <div className="grid lg:grid-cols-2 gap-8 items-start">
                    {/* Left Column: Upload & Options */}
                    <div className="space-y-6 bg-white/60 backdrop-blur-lg p-6 rounded-2xl shadow-lg border border-white/30">
                        <div>
                            <h2 className="text-xl font-bold font-heading">1. Upload Your Photo</h2>
                            <div className="mt-4 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                <input type="file" id="file-upload" className="hidden" accept="image/png, image/jpeg, image/webp" onChange={handleFileChange} />
                                <label htmlFor="file-upload" className="cursor-pointer">
                                    {originalImage ? (
                                        <img src={originalImage.url} alt="Original preview" className="max-h-60 mx-auto rounded-md shadow-sm"/>
                                    ) : (
                                        <>
                                            <UploadIcon />
                                            <p className="mt-2 text-sm text-gray-600">
                                                <span className="font-semibold text-jax-blue">Click to upload</span> or drag and drop
                                            </p>
                                            <p className="text-xs text-gray-500">PNG, JPG, WEBP up to 10MB</p>
                                        </>
                                    )}
                                </label>
                            </div>
                            {originalImage && <button onClick={() => setOriginalImage(null)} className="text-xs text-jax-red hover:underline mt-2">Remove image</button>}
                        </div>

                        <div>
                            <h2 className="text-xl font-bold font-heading">2. Choose Actions</h2>
                            <div className="mt-4 grid grid-cols-2 gap-3">
                                <CheckboxOption id="restoreFace" label="Restore Faces" checked={options.restoreFace} onChange={handleOptionChange} />
                                <CheckboxOption id="colorize" label="Colorize" checked={options.colorize} onChange={handleOptionChange} />
                                <CheckboxOption id="upscale" label="Upscale (HD)" checked={options.upscale} onChange={handleOptionChange} />
                                <CheckboxOption id="cleanNoise" label="Clean Scratches" checked={options.cleanNoise} onChange={handleOptionChange} />
                            </div>
                        </div>

                        <div>
                            <button 
                                onClick={handleRestore}
                                disabled={!originalImage || isLoading || !isAnyOptionSelected}
                                className="w-full px-8 py-4 text-lg font-bold text-white bg-jax-blue rounded-xl shadow-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
                            >
                                {isLoading ? (
                                    <>
                                        <Spinner />
                                        <span className="ml-2">Restoring...</span>
                                    </>
                                ) : "Restore Photo"}
                            </button>
                            {!isAnyOptionSelected && <p className="text-xs text-red-500 text-center mt-2">Please select at least one action.</p>}
                        </div>
                    </div>

                    {/* Right Column: Result */}
                    <div className="bg-white p-6 rounded-2xl shadow-xl min-h-[400px] flex flex-col justify-center items-center">
                        <h2 className="text-xl font-bold font-heading mb-4 text-center">3. See The Result</h2>
                        {isLoading && (
                            <div className="text-center">
                            <Spinner size="lg"/>
                            <p className="mt-4 text-gray-600 font-medium">{loadingMessage}</p>
                            <p className="text-sm text-gray-500 mt-2">This may take a moment...</p>
                            </div>
                        )}
                        {error && <p className="text-jax-red text-center">{error}</p>}
                        {!isLoading && !error && restoredImage && originalImage && (
                            <div className="w-full space-y-4">
                                <BeforeAfterSlider before={originalImage.url} after={restoredImage} />
                                <div className="flex gap-4">
                                    <a href={restoredImage} download="restored-photo.png" className="flex-1 text-center px-6 py-3 font-bold text-jax-blue bg-white border-2 border-jax-blue rounded-xl shadow-md hover:bg-blue-50 transition">Download</a>
                                    <button onClick={() => setIsPrintModalOpen(true)} className="flex-1 text-center px-6 py-3 font-bold text-white bg-jax-red rounded-xl shadow-md hover:bg-red-600 transition">Request a Print</button>
                                </div>
                            </div>
                        )}
                        {!isLoading && !restoredImage && !error && (
                            <div className="text-center text-gray-500">
                                <p>Your restored photo will appear here.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
             {restoredImage && (
                <PrintRequestModal 
                    isOpen={isPrintModalOpen}
                    onClose={() => setIsPrintModalOpen(false)}
                    imageSrc={restoredImage}
                />
            )}
        </>
    );
};

export default PhotoRestorationPage;
