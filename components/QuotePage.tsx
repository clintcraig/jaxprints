import React, { useState } from 'react';
import Spinner from './Spinner'; // Assuming Spinner component exists

const QuotePage: React.FC = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        service: '',
        quantity: '',
        details: '',
    });
    const [file, setFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsSubmitting(false);
        setIsSubmitted(true);
    };

    if (isSubmitted) {
        return (
            <div className="text-center max-w-lg mx-auto bg-white p-12 rounded-2xl shadow-xl">
                 <div className="mx-auto h-16 w-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                 </div>
                <h1 className="font-heading text-3xl font-extrabold text-jax-black mt-6">Thank You!</h1>
                <p className="mt-2 text-gray-600">Your quote request has been received. We'll get back to you within 24 hours.</p>
                <button onClick={() => setIsSubmitted(false)} className="mt-6 inline-block px-8 py-3 font-bold text-white bg-jax-blue rounded-xl shadow-lg hover:bg-blue-700 transition">
                    Submit Another Request
                </button>
            </div>
        );
    }


    return (
        <div className="space-y-12">
            <div className="text-center">
                <h1 className="font-heading text-4xl md:text-5xl font-extrabold text-jax-black">Request a Quote</h1>
                <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">Tell us about your project. We'll provide a free, no-obligation quote for your printing needs.</p>
            </div>

            <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-xl">
                 <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Form Fields */}
                    <div className="md:col-span-2">
                        <label htmlFor="service" className="block text-sm font-bold text-gray-700 mb-1">Service of Interest *</label>
                        <select id="service" name="service" value={formData.service} onChange={handleInputChange} required className="block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-jax-blue focus:border-jax-blue">
                            <option value="">Select a service...</option>
                            <option value="sublimation-jerseys">Full Sublimation Jerseys</option>
                            <option value="tarpaulin-printing">Tarpaulin Printing</option>
                            <option value="signage">Signage (Panaflex, Acrylic)</option>
                            <option value="stickers-decals">Stickers & Decals</option>
                            <option value="graphic-design">Graphic Design</option>
                            <option value="corporate-giveaways">Corporate Giveaways</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="name" className="block text-sm font-bold text-gray-700 mb-1">Full Name *</label>
                        <input type="text" id="name" name="name" value={formData.name} onChange={handleInputChange} required className="block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-jax-blue focus:border-jax-blue" />
                    </div>
                     <div>
                        <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-1">Email Address *</label>
                        <input type="email" id="email" name="email" value={formData.email} onChange={handleInputChange} required className="block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-jax-blue focus:border-jax-blue" />
                    </div>
                    <div>
                        <label htmlFor="phone" className="block text-sm font-bold text-gray-700 mb-1">Phone Number</label>
                        <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleInputChange} className="block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-jax-blue focus:border-jax-blue" />
                    </div>
                    <div>
                        <label htmlFor="quantity" className="block text-sm font-bold text-gray-700 mb-1">Estimated Quantity</label>
                        <input type="number" id="quantity" name="quantity" value={formData.quantity} onChange={handleInputChange} min="1" className="block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-jax-blue focus:border-jax-blue" />
                    </div>
                     <div className="md:col-span-2">
                        <label htmlFor="details" className="block text-sm font-bold text-gray-700 mb-1">Project Details *</label>
                        <textarea id="details" name="details" value={formData.details} onChange={handleInputChange} rows={4} required placeholder="Please describe your project, including size, colors, and any deadlines." className="block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-jax-blue focus:border-jax-blue"></textarea>
                    </div>
                     <div className="md:col-span-2">
                        <label htmlFor="file-upload" className="block text-sm font-bold text-gray-700 mb-1">Attach a File (Optional)</label>
                        <input id="file-upload" name="file-upload" type="file" onChange={handleFileChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-jax-blue/10 file:text-jax-blue hover:file:bg-jax-blue/20" />
                        <p className="text-xs text-gray-500 mt-1">Upload mockups, logos, or design references. Max file size: 5MB.</p>
                    </div>
                    <div className="md:col-span-2 text-right">
                        <button type="submit" disabled={isSubmitting} className="inline-flex justify-center items-center px-8 py-3 text-lg font-bold text-white bg-jax-blue rounded-xl shadow-lg hover:bg-blue-700 transition disabled:bg-gray-400">
                            {isSubmitting ? <><Spinner /> <span className="ml-2">Submitting...</span></> : 'Submit Quote Request'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default QuotePage;
