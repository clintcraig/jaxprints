import React from 'react';
import { Link } from 'react-router-dom';

// FIX: Changed type from JSX.Element to React.ReactElement to resolve TypeScript namespace error.
const ServiceCard: React.FC<{ title: string; description: string; icon: React.ReactElement }> = ({ title, description, icon }) => (
    <div className="bg-white/50 backdrop-blur-lg p-6 rounded-2xl shadow-lg border border-white/20 hover:shadow-xl transition-shadow duration-300">
        <div className="flex items-center justify-center h-12 w-12 rounded-full bg-jax-blue text-white mb-4">
            {icon}
        </div>
        <h3 className="font-heading text-xl font-bold text-jax-black mb-2">{title}</h3>
        <p className="text-gray-600 text-sm">{description}</p>
    </div>
);

const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-jax-blue flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
);


const HomePage: React.FC = () => {
    const services = [
        { title: "Custom Jerseys", description: "High-quality full sublimation jerseys—durable, vibrant, and fully customizable for your team.", icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
        { title: "Tarpaulin Printing", description: "Affordable tarps with sharp color and quick turnaround for events, businesses, and promotions.", icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" /></svg> },
        { title: "Signage Solutions", description: "Acrylic, panaflex, and storefront signs that make your Dumaguete business stand out.", icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7.014A8.003 8.003 0 0112 3c1.398 0 2.743.57 3.714 1.543C18.5 6.5 19 9 19 11c2 1 2.657 1.657 2.657 2.657a8 8 0 01-11.314 0z" /></svg> },
        { title: "Graphic Design", description: "Creative, print-ready designs for business cards, stickers, brochures, and more.", icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg> },
    ];

    return (
        <div className="space-y-16 md:space-y-24">
            {/* Hero Section */}
            <section className="grid md:grid-cols-2 gap-8 items-center">
                <div className="text-center md:text-left">
                    <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-extrabold text-jax-black tracking-tighter">
                        Your Trusted <span className="text-jax-blue">Printing Shop</span> in Dumaguete
                    </h1>
                    <p className="mt-4 text-lg text-gray-600 max-w-xl mx-auto md:mx-0">
                        Full sublimation jerseys, tarpaulins, and signages—fast, vibrant, reliable.
                    </p>
                    <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                        <Link to="/quote" className="inline-block px-8 py-3 text-lg font-bold text-white bg-jax-blue rounded-xl shadow-lg hover:bg-blue-700 transition-transform transform hover:scale-105">
                            Request a Quote
                        </Link>
                         <a href="https://m.me/JAXPrintingShop" target="_blank" rel="noopener noreferrer" className="inline-block px-8 py-3 text-lg font-bold text-jax-black bg-white rounded-xl shadow-lg hover:bg-gray-100 transition-transform transform hover:scale-105 border border-gray-200">
                            Message Us
                        </a>
                    </div>
                </div>
                <div className="relative">
                    <img src="https://picsum.photos/seed/jaxprintshop/600/500" alt="Full sublimation jersey and wide-format printer" className="rounded-2xl shadow-2xl" />
                     <div className="absolute -bottom-4 -right-4 bg-jax-yellow text-jax-black p-4 rounded-full shadow-lg transform rotate-6">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
                    </div>
                </div>
            </section>

            {/* Services Section */}
            <section>
                <div className="text-center">
                    <h2 className="font-heading text-3xl md:text-4xl font-extrabold text-jax-black">Our Core Services</h2>
                    <p className="mt-3 text-gray-600 max-w-2xl mx-auto">From team apparel to large-format printing, we've got you covered.</p>
                </div>
                <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {services.map(service => <ServiceCard key={service.title} {...service} />)}
                </div>
            </section>

             {/* Why Choose Us Section */}
            <section className="grid md:grid-cols-2 gap-12 items-center bg-white p-8 md:p-12 rounded-2xl shadow-xl">
                <div>
                    <h2 className="font-heading text-3xl md:text-4xl font-extrabold text-jax-black">Why Choose JAXCreativ?</h2>
                     <ul className="mt-6 space-y-4">
                        <li className="flex items-start"><CheckIcon /><span className="ml-3 text-gray-700"><b>Unmatched Quality</b> – Bright colors, durable materials that last.</span></li>
                        <li className="flex items-start"><CheckIcon /><span className="ml-3 text-gray-700"><b>Sublimation Specialists</b> – Jerseys trusted by teams across Dumaguete.</span></li>
                        <li className="flex items-start"><CheckIcon /><span className="ml-3 text-gray-700"><b>Fast Turnaround</b> – We respect your deadlines and deliver on time.</span></li>
                        <li className="flex items-start"><CheckIcon /><span className="ml-3 text-gray-700"><b>Local & Reliable</b> – Proudly serving Dumaguete and expanding across Negros.</span></li>
                    </ul>
                </div>
                <div className="grid grid-cols-2 gap-4">
                     <img src="https://picsum.photos/seed/jaxteam/300/400" alt="Printing process" className="rounded-lg shadow-md" />
                     <img src="https://picsum.photos/seed/jaxproduct/300/400" alt="Finished jersey" className="rounded-lg shadow-md mt-8" />
                </div>
            </section>

            {/* Trust Section */}
            <section className="text-center bg-jax-blue text-white py-12 px-6 rounded-2xl">
                <h2 className="font-heading text-3xl font-extrabold">Join Hundreds of Happy Clients in Dumaguete</h2>
                <div className="mt-6 flex flex-col md:flex-row justify-center items-center gap-x-12 gap-y-4 text-lg">
                    <span><strong>5,200+</strong> prints delivered</span>
                    <span className="hidden md:inline">|</span>
                    <span><strong>100%</strong> quality guarantee</span>
                     <span className="hidden md:inline">|</span>
                    <span><strong>65+</strong> teams & businesses served</span>
                </div>
            </section>
        </div>
    );
};

export default HomePage;