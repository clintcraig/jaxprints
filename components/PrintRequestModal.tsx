import React, { useState, useEffect } from 'react';
import Spinner from './Spinner';

interface PrintRequestModalProps {
    isOpen: boolean;
    onClose: () => void;
    imageSrc: string;
}

const PrintRequestModal: React.FC<PrintRequestModalProps> = ({ isOpen, onClose, imageSrc }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            setIsSubmitted(false); // Reset form on open
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsSubmitting(false);
        setIsSubmitted(true);
    };

    if (!isOpen) {
        return null;
    }

    return (
        <div 
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 transition-opacity duration-300"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
        >
            <div 
                className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 md:p-8"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-start mb-4">
                    <h2 className="font-heading text-2xl font-bold text-jax-black">Request a High-Quality Print</h2>
                     <button
                        onClick={onClose}
                        className="h-8 w-8 text-gray-500 hover:text-gray-800 flex items-center justify-center"
                        aria-label="Close modal"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                
                {isSubmitted ? (
                    <div className="text-center py-8">
                         <div className="mx-auto h-16 w-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        </div>
                        <h3 className="font-heading text-xl font-bold text-jax-black mt-6">Print Request Sent!</h3>
                        <p className="mt-2 text-gray-600">Thank you! We've received your request and will contact you shortly to confirm details and payment.</p>
                        <button onClick={onClose} className="mt-6 inline-block px-8 py-3 font-bold text-white bg-jax-blue rounded-xl shadow-lg hover:bg-blue-700 transition">
                            Close
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <img src={imageSrc} alt="Restored photo to be printed" className="rounded-lg shadow-md mb-4 max-h-60 mx-auto" />
                        
                        <div>
                            <label htmlFor="print-name" className="block text-sm font-bold text-gray-700 mb-1">Full Name *</label>
                            <input type="text" id="print-name" name="name" required className="block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-jax-blue focus:border-jax-blue" />
                        </div>

                         <div>
                            <label htmlFor="print-email" className="block text-sm font-bold text-gray-700 mb-1">Email Address *</label>
                            <input type="email" id="print-email" name="email" required className="block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-jax-blue focus:border-jax-blue" />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                             <div>
                                <label htmlFor="print-size" className="block text-sm font-bold text-gray-700 mb-1">Print Size *</label>
                                <select id="print-size" name="size" required className="block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-jax-blue focus:border-jax-blue">
                                    <option>4R (4x6")</option>
                                    <option>5R (5x7")</option>
                                    <option>8R (8x10")</option>
                                    <option>A4</option>
                                </select>
                            </div>
                             <div>
                                <label htmlFor="paper-type" className="block text-sm font-bold text-gray-700 mb-1">Paper Type *</label>
                                <select id="paper-type" name="paper" required className="block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-jax-blue focus:border-jax-blue">
                                    <option>Glossy Photo Paper</option>
                                    <option>Matte Photo Paper</option>
                                    <option>Satin Photo Paper</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="print-notes" className="block text-sm font-bold text-gray-700 mb-1">Additional Notes</label>
                            <textarea id="print-notes" name="notes" rows={2} placeholder="Any special instructions? e.g., borderless, custom size..." className="block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-jax-blue focus:border-jax-blue"></textarea>
                        </div>
                        
                        <div className="text-right pt-2">
                             <button type="submit" disabled={isSubmitting} className="inline-flex justify-center items-center px-6 py-3 font-bold text-white bg-jax-red rounded-xl shadow-lg hover:bg-red-600 transition disabled:bg-gray-400">
                                {isSubmitting ? <><Spinner /> <span className="ml-2">Sending...</span></> : 'Confirm Print Request'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default PrintRequestModal;
