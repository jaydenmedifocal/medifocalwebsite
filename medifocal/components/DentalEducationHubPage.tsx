
import React from 'react';
import { View } from '../App';

interface DentalEducationHubPageProps {
    setCurrentView: (view: View) => void;
}

// Icons
const HomeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>;
const CalendarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
const VideoIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>;
const DocumentTextIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;


// Dummy data
const featuredEvent = {
    title: "Mastering Digital Implant Workflows",
    date: "October 25, 2024 | 7:00 PM AEST",
    speaker: "Dr. Evelyn Reed",
    description: "Join us for an in-depth webinar on leveraging digital technology for precise implant planning and placement. Learn about the latest in CBCT imaging, AI-assisted design, and 3D printing for surgical guides.",
    imageUrl: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=2070&auto=format&fit=crop"
};

const upcomingEvents = [
    { title: "Advanced Composite Artistry", date: "Nov 12, 2024", type: "Webinar", imageUrl: "https://images.unsplash.com/photo-1551601651-2a8555f1a136?q=80&w=800&auto=format&fit=crop" },
    { title: "Periodontal Health Symposium", date: "Nov 28, 2024", type: "Workshop", imageUrl: "https://images.unsplash.com/photo-1551601651-2a8555f1a136?q=80&w=800&auto=format&fit=crop" },
    { title: "Practice Management for Growth", date: "Dec 05, 2024", type: "Webinar", imageUrl: "https://images.unsplash.com/photo-1556740738-b6a63e2775df?q=80&w=800&auto=format&fit=crop" }
];

const onDemandContent = [
    { title: "Introduction to Laser Dentistry", type: "Video", imageUrl: "https://images.unsplash.com/photo-1631557813478-f0b83a0b1b1b?q=80&w=800&auto=format=fit=crop" },
    { title: "The Art of Shade Matching", type: "Article", imageUrl: "https://images.unsplash.com/photo-1606214174585-fe31582dc6ee?q=80&w=800&auto=format=fit=crop" },
    { title: "Ergonomics in the Dental Practice", type: "Video", imageUrl: "https://images.unsplash.com/photo-1606811971618-4486d14f3f99?q=80&w=800&auto=format&fit=crop" }
];

const topics = ["Implantology", "Restorative Dentistry", "Orthodontics", "Digital Dentistry", "Practice Management", "Infection Control"];

const DentalEducationHubPage: React.FC<DentalEducationHubPageProps> = ({ setCurrentView }) => {
    return (
        <div className="bg-white">
            {/* Header Section */}
            <header className="bg-gray-100">
                <div className="container mx-auto px-4 py-8">
                    <nav className="flex items-center text-sm text-gray-500 mb-6" aria-label="Breadcrumb">
                        <button onClick={() => setCurrentView({ page: 'home' })} className="flex items-center text-gray-400 hover:text-brand-blue">
                            <HomeIcon />
                            <span className="ml-2">Home</span>
                        </button>
                        <span className="mx-2 text-gray-400">/</span>
                        <span className="font-medium text-gray-700">Dental Education Hub</span>
                    </nav>
                    <div className="text-center py-12">
                        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 mb-4">Dental Education Hub</h1>
                        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                            Advance your skills and stay at the forefront of dentistry with our expert-led courses, webinars, and resources.
                        </p>
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-4 py-16 space-y-20">
                {/* Featured Event Section */}
                <section>
                    <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Featured Event</h2>
                    <div className="flex flex-col lg:flex-row items-center bg-white rounded-lg overflow-hidden shadow-2xl border border-gray-200">
                        <div className="w-full lg:w-1/2">
                            <img src={featuredEvent.imageUrl} alt={featuredEvent.title} className="w-full h-full object-cover max-h-96 lg:max-h-full" />
                        </div>
                        <div className="w-full lg:w-1/2 p-8 md:p-12">
                            <p className="font-semibold text-brand-blue mb-2">{featuredEvent.date}</p>
                            <h3 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">{featuredEvent.title}</h3>
                            <p className="text-gray-600 font-medium mb-4">with {featuredEvent.speaker}</p>
                            <p className="text-gray-600 mb-8 leading-relaxed">
                                {featuredEvent.description}
                            </p>
                            <button className="bg-brand-green hover:bg-green-600 text-white font-bold py-3 px-8 rounded-full text-lg transition duration-300 transform hover:scale-105 inline-block">
                                Register Now
                            </button>
                        </div>
                    </div>
                </section>

                {/* Upcoming Events Section */}
                <section>
                    <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Upcoming Events</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {upcomingEvents.map(event => (
                            <div key={event.title} className="bg-white rounded-lg shadow-lg overflow-hidden group border border-gray-200 transition-shadow hover:shadow-xl">
                                <img src={event.imageUrl} alt={event.title} className="w-full h-48 object-cover" />
                                <div className="p-6">
                                    <span className={`inline-block bg-blue-100 text-brand-blue text-xs font-semibold px-2 py-1 rounded-full mb-2`}>{event.type}</span>
                                    <p className="text-sm text-gray-500 mb-2">{event.date}</p>
                                    <h3 className="font-bold text-lg text-gray-800 mb-4 h-16 group-hover:text-brand-blue">{event.title}</h3>
                                    <button className="font-semibold text-brand-blue hover:underline">Learn More &rarr;</button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="text-center mt-12">
                        <button className="border border-gray-400 text-gray-700 font-bold py-3 px-8 rounded-md hover:bg-gray-200 transition duration-300">
                            View All Events
                        </button>
                    </div>
                </section>
                
                {/* Browse by Topic Section */}
                <section className="bg-gray-50 -mx-4 px-4 py-16">
                     <h2 className="text-3xl font-bold text-gray-800 mb-10 text-center">Browse by Topic</h2>
                     <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 max-w-6xl mx-auto">
                        {topics.map(topic => (
                            <button key={topic} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border font-semibold text-gray-700 hover:text-brand-blue hover:border-brand-blue">
                                {topic}
                            </button>
                        ))}
                     </div>
                </section>

                {/* On-Demand Learning Section */}
                <section>
                    <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">On-Demand Learning Library</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                         {onDemandContent.map(content => (
                            <div key={content.title} className="bg-white rounded-lg shadow-lg overflow-hidden group border border-gray-200 transition-shadow hover:shadow-xl">
                                <div className="relative">
                                    <img src={content.imageUrl} alt={content.title} className="w-full h-48 object-cover" />
                                    <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                                    <div className="absolute bottom-4 left-4 flex items-center text-white bg-black/50 px-2 py-1 rounded">
                                        {content.type === 'Video' ? <VideoIcon /> : <DocumentTextIcon />}
                                        <span className="font-semibold text-sm">{content.type}</span>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <h3 className="font-bold text-lg text-gray-800 mb-4 h-16 group-hover:text-brand-blue">{content.title}</h3>
                                    <button className="font-semibold text-brand-blue hover:underline">{content.type === 'Video' ? 'Watch Now' : 'Read More'} &rarr;</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Newsletter CTA */}
                <section className="bg-brand-blue text-white rounded-lg p-12 text-center">
                    <h2 className="text-3xl font-bold mb-4">Stay Informed</h2>
                    <p className="max-w-xl mx-auto mb-8 opacity-90">Subscribe to our newsletter to receive updates on new courses, events, and exclusive educational content.</p>
                     <form className="max-w-md mx-auto flex flex-col sm:flex-row gap-4">
                        <input type="email" placeholder="Enter your email" className="w-full rounded-md px-4 py-3 text-gray-800 focus:outline-none focus:border-brand-green focus:border-2 transition-colors" />
                        <button type="submit" className="bg-brand-green text-white font-bold px-8 py-3 rounded-md hover:bg-opacity-90 transition-colors flex-shrink-0">
                            Subscribe
                        </button>
                    </form>
                </section>
            </div>
        </div>
    );
};

export default DentalEducationHubPage;
