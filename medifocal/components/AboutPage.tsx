import React from 'react';
import { View } from '../App';
import SEOHead from './SEOHead';
import { viewToUrl } from '../utils/routing';

interface AboutPageProps {
    setCurrentView: (view: View) => void;
}

// Icons
const HomeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>;
const UserGroupIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.124-1.28-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.124-1.28.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
const SparklesIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.293 2.293a1 1 0 010 1.414L13 12l-1.293-1.293a1 1 0 010-1.414L14 7m5 5l-2.293-2.293a1 1 0 00-1.414 0L13 12l1.293 1.293a1 1 0 001.414 0L17 11m-1-8h.01" /></svg>;
const ShieldCheckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 20.944a11.955 11.955 0 0118-8.016z" /></svg>;
const BadgeCheckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>;

const mediaReleases = [
    { date: '19 Aug 2024', title: 'My Journey as a 21-Year-Old Entrepreneur: Revolutionizing the Dental Industry', excerpt: 'At 21, I saw an opportunity to make a real difference in an industry that impacts millions of lives every day...', imageUrl: 'https://images.unsplash.com/photo-1551601651-2a8555f1a136?q=80&w=1267&auto=format&fit=crop' },
    { date: '13 Oct 2025', title: 'The New Kid in Dental: Competing With Integrity, Winning With Execution', excerpt: 'I founded Medifocal with more conviction than cash. Two years into the grind, here is what I have learned: you will fail, you will fall, you will get tested...', imageUrl: 'https://images.unsplash.com/photo-1600170354228-a4e9b634b92b?q=80&w=1470&auto=format&fit=crop' },
    { date: '22 Apr 2024', title: 'An Update on Medifocal\'s Supply Chain Sustainability Initiatives 2024', excerpt: 'We are working to reduce our environmental impact and promote responsible business practices in our operations and supply chain...', imageUrl: 'https://images.unsplash.com/photo-1621594114735-36190a6d004e?q=80&w=1470&auto=format&fit=crop' },
    { date: '18 Mar 2024', title: 'Medifocal to Showcase Comprehensive Solutions at ADX Exhibition', excerpt: 'Medifocal will showcase a selection of its comprehensive solutions portfolio and innovative products at ADX 2024...', imageUrl: 'https://images.unsplash.com/photo-1579154432194-52317112115e?q=80&w=1374&auto=format&fit=crop' }
];

const AboutPage: React.FC<AboutPageProps> = ({ setCurrentView }) => {

    const handleTabClick = (page: 'about' | 'sustainability' | 'ourTeam' | 'partners') => {
        setCurrentView({ page });
    };

    const aboutUrl = viewToUrl({ page: 'about' });
    
    return (
        <div className="bg-gray-50 min-h-screen font-sans">
            <SEOHead
                title="About Medifocal | Australia's Leading Dental Equipment Supplier"
                description="Learn about Medifocal, Australia's trusted dental equipment supplier with 60+ years of experience. Discover our mission, values, and commitment to dental practices across Australia."
                url={`https://medifocal.com${aboutUrl}`}
            />
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <nav className="flex items-center text-sm mb-8 text-gray-500" aria-label="Breadcrumb">
                    <button onClick={() => setCurrentView({ page: 'home' })} className="flex items-center hover:text-brand-blue font-medium transition-colors">
                        <HomeIcon />
                        <span className="ml-2">Home</span>
                    </button>
                    <span className="mx-2">/</span>
                    <span className="font-semibold text-gray-800">About Us</span>
                </nav>

                <div className="relative rounded-xl mb-12 bg-cover bg-center text-white py-20 sm:py-24 md:py-32 px-6 sm:px-10"
                    style={{backgroundImage: "url('https://images.unsplash.com/photo-1579684453423-f84349369b4a?q=80&w=2070&auto=format&fit=crop')"}}>
                    <div className="absolute inset-0 bg-gray-900 bg-opacity-50 rounded-xl"></div>
                    <div className="relative text-center">
                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-4 tracking-tight drop-shadow-lg">The Heart of Modern Dentistry</h1>
                        <p className="text-md sm:text-lg lg:text-xl text-gray-200 max-w-3xl mx-auto drop-shadow-md">Your trusted partner in supplying innovative and quality dental products across Australia.</p>
                    </div>
                </div>

                <div className="border-b border-gray-200 mb-12">
                    <nav className="-mb-px flex justify-center space-x-4 sm:space-x-8 overflow-x-auto" aria-label="Tabs">
                        <button onClick={() => handleTabClick('about')} className="border-brand-blue text-brand-blue whitespace-nowrap pb-4 px-2 border-b-2 font-bold text-base sm:text-lg transition-colors">
                            About Us
                        </button>
                        <button onClick={() => handleTabClick('sustainability')} className="border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300 whitespace-nowrap pb-4 px-2 border-b-2 font-medium text-base sm:text-lg transition-colors">
                            Sustainability
                        </button>
                        <button onClick={() => handleTabClick('ourTeam')} className="border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300 whitespace-nowrap pb-4 px-2 border-b-2 font-medium text-base sm:text-lg transition-colors">
                            Our Team
                        </button>
                        <button onClick={() => handleTabClick('partners')} className="border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300 whitespace-nowrap pb-4 px-2 border-b-2 font-medium text-base sm:text-lg transition-colors">
                            Partners
                        </button>
                    </nav>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 lg:p-10 mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">A Message from Our Founder</h2>
                    <div className="flex flex-col md:flex-row gap-8 items-center max-w-4xl mx-auto">
                        <img 
                            src="https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=1887&auto=format&fit=crop" 
                            alt="Jayden Barnett" 
                            className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover shadow-lg border-4 border-white"
                        />
                        <blockquote className="border-l-4 border-brand-blue pl-6">
                            <p className="text-gray-600 text-lg leading-relaxed mb-4">
                                "At 21, I founded Medifocal with a vision: to revolutionize the dental industry through innovation and unmatched customer service. Today, that vision is a reality. We are dedicated to empowering dental professionals with the tools and support they need to provide exceptional patient care."
                            </p>
                            <cite className="font-bold text-gray-800 not-italic">Jayden Barnett, Founder & CEO</cite>
                        </blockquote>
                    </div>
                </div>

                <div className="py-12">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2 text-center">Our Mission & Values</h2>
                    <p className="text-center text-gray-600 mb-10 max-w-2xl mx-auto">To be the most trusted business partner for dental professionals by providing comprehensive solutions that enhance practice efficiency and patient outcomes.</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
                        <div className="text-center p-6">
                            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-brand-blue text-white mx-auto mb-4"><UserGroupIcon /></div>
                            <h3 className="font-bold text-xl text-gray-800 mb-2">Customer First</h3>
                        </div>
                         <div className="text-center p-6">
                            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-brand-blue text-white mx-auto mb-4"><SparklesIcon /></div>
                            <h3 className="font-bold text-xl text-gray-800 mb-2">Innovation</h3>
                        </div>
                         <div className="text-center p-6">
                            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-brand-blue text-white mx-auto mb-4"><ShieldCheckIcon /></div>
                            <h3 className="font-bold text-xl text-gray-800 mb-2">Integrity</h3>
                        </div>
                         <div className="text-center p-6">
                            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-brand-blue text-white mx-auto mb-4"><BadgeCheckIcon /></div>
                            <h3 className="font-bold text-xl text-gray-800 mb-2">Excellence</h3>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg py-12 px-6 sm:px-8 lg:px-10 my-12">
                     <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">From the Newsdesk</h2>
                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {mediaReleases.map(item => (
                             <div key={item.title} className="bg-white rounded-lg overflow-hidden group border border-gray-200 hover:shadow-2xl hover:border-brand-blue transition-all duration-300 transform hover:-translate-y-2 flex flex-col">
                                <div className="relative h-48 overflow-hidden">
                                    <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"/>
                                    <div className="absolute top-3 right-3 bg-white text-brand-blue text-xs font-bold px-3 py-1 rounded-full shadow-md">{item.date}</div>
                                </div>
                                <div className="p-5 flex flex-col flex-grow">
                                    <h3 className="font-bold text-md text-gray-800 mb-2 group-hover:text-brand-blue transition-colors leading-tight flex-grow">{item.title}</h3>
                                    <p className="text-gray-600 text-sm leading-relaxed mb-4">{item.excerpt}</p>
                                    <button className="text-sm font-bold text-brand-blue self-start hover:underline">Read More &rarr;</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AboutPage;
