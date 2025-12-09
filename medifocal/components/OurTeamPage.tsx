import React from 'react';
import { View } from '../App';

interface OurTeamPageProps {
    setCurrentView: (view: View) => void;
}

// Icons
const HomeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>;

const teamMembers = [
    {
        name: 'Jayden Barnett',
        role: 'Founder & CEO',
        imageUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=1887&auto=format&fit=crop',
    },
    {
        name: 'Dr. Emily Carter',
        role: 'Chief Dental Officer',
        imageUrl: 'https://images.unsplash.com/photo-1579684453423-f84349369b4a?q=80&w=2070&auto=format&fit=crop',
    },
    {
        name: 'David Chen',
        role: 'Head of Operations',
        imageUrl: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?q=80&w=1470&auto=format&fit=crop',
    },
    {
        name: 'Sophie Taylor',
        role: 'Marketing Director',
        imageUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=1587&auto=format&fit=crop',
    },
];

const OurTeamPage: React.FC<OurTeamPageProps> = ({ setCurrentView }) => {

    const handleTabClick = (page: 'about' | 'sustainability' | 'ourTeam' | 'partners') => {
        setCurrentView({ page });
    };

    return (
        <div className="bg-gray-50 min-h-screen font-sans">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <nav className="flex items-center text-sm mb-8 text-gray-500" aria-label="Breadcrumb">
                    <button onClick={() => setCurrentView({ page: 'home' })} className="flex items-center hover:text-brand-blue font-medium transition-colors">
                        <HomeIcon />
                        <span className="ml-2">Home</span>
                    </button>
                    <span className="mx-2">/</span>
                    <button onClick={() => setCurrentView({ page: 'about' })} className="hover:text-brand-blue font-medium transition-colors">
                        About Us
                    </button>
                    <span className="mx-2">/</span>
                    <span className="font-semibold text-gray-800">Our Team</span>
                </nav>

                <div className="border-b border-gray-200 mb-12">
                    <nav className="-mb-px flex justify-center space-x-4 sm:space-x-8 overflow-x-auto" aria-label="Tabs">
                        <button onClick={() => handleTabClick('about')} className="border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300 whitespace-nowrap pb-4 px-2 border-b-2 font-medium text-base sm:text-lg transition-colors">
                            About Us
                        </button>
                        <button onClick={() => handleTabClick('sustainability')} className="border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300 whitespace-nowrap pb-4 px-2 border-b-2 font-medium text-base sm:text-lg transition-colors">
                            Sustainability
                        </button>
                        <button onClick={() => handleTabClick('ourTeam')} className="border-brand-blue text-brand-blue whitespace-nowrap pb-4 px-2 border-b-2 font-bold text-base sm:text-lg transition-colors">
                            Our Team
                        </button>
                        <button onClick={() => handleTabClick('partners')} className="border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300 whitespace-nowrap pb-4 px-2 border-b-2 font-medium text-base sm:text-lg transition-colors">
                            Partners
                        </button>
                    </nav>
                </div>

                <div className="bg-white rounded-xl shadow-lg overflow-hidden p-6 sm:p-8 lg:p-10">
                    <div className="text-center">
                        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">Meet Our Leadership Team</h1>
                        <p className="text-md sm:text-lg text-gray-600 max-w-3xl mx-auto">
                            We are a team of passionate individuals dedicated to providing the best products and services to the dental industry.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-12">
                        {teamMembers.map((member) => (
                            <div key={member.name} className="group text-center">
                                <div className="relative w-40 h-40 mx-auto mb-4">
                                    <img
                                        className="rounded-full w-full h-full object-cover shadow-lg transition-all duration-300 group-hover:shadow-xl"
                                        src={member.imageUrl}
                                        alt={member.name}
                                    />
                                    <div className="absolute inset-0 rounded-full border-4 border-transparent group-hover:border-brand-blue transition-all duration-300"></div>
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 group-hover:text-brand-blue transition-colors">{member.name}</h3>
                                <p className="text-gray-500 text-sm">{member.role}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OurTeamPage;
