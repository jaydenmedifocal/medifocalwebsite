
import React, { useState } from 'react';
import { View } from '../App';

interface NewsCardProps {
  imageUrl: string;
  date: string;
  title: string;
  excerpt: string;
  category: string;
}

const allNewsData: NewsCardProps[] = [
    {
        imageUrl: "https://images.unsplash.com/photo-1551601651-2a8555f1a136?q=80&w=800&auto=format&fit=crop",
        date: '13 Oct 2025',
        title: 'Capsule Waste Evaluation for Restorative Materials',
        excerpt: 'Reducing single-use plastic and material waste in dental procedures is an important step toward greener practice management.',
        category: 'Blog'
    },
    {
        imageUrl: "https://images.unsplash.com/photo-1606214174585-fe31582dc6ee?q=80&w=800&auto=format&fit=crop",
        date: '5 Sep 2025',
        title: 'Celebrating over 30 years of GC Fuji® II LC CAPSULE',
        excerpt: "The world's first resin-reinforced glass ionomer has remained the benchmark for light-cured glass ionomer cements for years.",
        category: 'Dental Solutions'
    },
    {
        imageUrl: "https://images.unsplash.com/photo-1606811971618-4486d14f3f99?q=80&w=800&auto=format&fit=crop",
        date: '13 Aug 2025',
        title: 'Failure To Replace: Who Pays The Ultimate Price?',
        excerpt: 'What criteria do you utilize when deciding to replace a scaler? The condition of the working end? Broken blades?',
        category: 'Blog'
    },
    {
        imageUrl: "https://images.unsplash.com/photo-1599045118108-bf9954418b76?q=80&w=800&auto=format&fit=crop",
        date: '13 Aug 2025',
        title: '5 Reasons Dental Practices Are Making the Switch To Nitrile',
        excerpt: "Let's face it: gloves may not be the most exciting item on your clinic supply list, but they're among the most critical.",
        category: 'Dental Solutions'
    },
    {
        imageUrl: "https://images.unsplash.com/photo-1579202673506-ca3ce28943ef?q=80&w=800&auto=format&fit=crop",
        date: '21 July 2025',
        title: 'Medifocal Announces New Partnership with Local Charity',
        excerpt: 'We are proud to partner with Dental Health for All to provide free dental care to underserved communities.',
        category: 'Medifocal Cares'
    },
    {
        imageUrl: "https://images.unsplash.com/photo-1516550577710-d856b37c25c3?q=80&w=800&auto=format&fit=crop",
        date: '15 June 2025',
        title: 'Follow Us on Instagram for Daily Tips!',
        excerpt: 'Join our growing community on social media for daily dental tips, news, and special promotions.',
        category: 'Social Media'
    }
];

interface NewsCardWithClickProps extends NewsCardProps {
    onClick?: () => void;
}

const NewsCard: React.FC<NewsCardWithClickProps> = ({ imageUrl, date, title, excerpt, onClick }) => {
    const [imgError, setImgError] = useState(false);
    const fallbackImage = "https://images.unsplash.com/photo-1551601651-2a8555f1a136?q=80&w=800&auto=format&fit=crop";
    
    return (
        <button 
            onClick={onClick}
            className="bg-white rounded-xl shadow-lg overflow-hidden group cursor-pointer text-left w-full h-full flex flex-col hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
        >
            <div className="relative h-48">
                <img 
                    src={imgError ? fallbackImage : imageUrl} 
                    alt={`${title} - Dental news article`} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ease-in-out" 
                    loading="lazy" 
                    width="400" 
                    height="192" 
                    decoding="async"
                    onError={() => setImgError(true)}
                />
                <div className="absolute top-3 right-3 bg-brand-blue/80 text-white text-xs font-bold px-2.5 py-1.5 rounded-full backdrop-blur-sm">{date}</div>
            </div>
            <div className="p-5 flex-grow flex flex-col">
                <h3 className="font-bold text-lg text-gray-800 mb-2 group-hover:text-brand-blue transition-colors">{title}</h3>
                <p className="text-gray-600 text-sm flex-grow">{excerpt}</p>
            </div>
        </button>
    );
}

interface LatestNewsProps {
    setCurrentView?: (view: View) => void;
}

const tabs = ['Blog', 'Dental Solutions', 'Social Media', 'Medifocal Cares'];

const LatestNews: React.FC<LatestNewsProps> = ({ setCurrentView }) => {
    const [activeTab, setActiveTab] = useState('Blog');

    const filteredNews = allNewsData.filter(item => item.category === activeTab);

    return (
        <section className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 sm:mb-0">Latest News & Insights</h2>
                <div className="flex flex-wrap gap-2 border-b sm:border-b-0 self-start sm:self-center">
                    {tabs.map(tab => (
                        <button 
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`font-semibold py-2 px-4 rounded-t-lg text-sm transition-colors duration-300 ${activeTab === tab ? 'text-brand-blue border-b-2 border-brand-blue' : 'text-gray-600 hover:text-brand-blue'}`}>
                            {tab}
                        </button>
                    ))}
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
                {filteredNews.slice(0, 2).map((item) => (
                    <NewsCard 
                        key={item.title} 
                        {...item} 
                        onClick={() => setCurrentView && setCurrentView({ page: 'blog' })}
                    />
                ))}
            </div>
            {filteredNews.length === 0 && (
                <div className="text-center py-10 col-span-full">
                     <p className="text-gray-500">No news in this category yet. Check back soon!</p>
                </div>
            )}
            <div className="text-center mt-8">
                 <button 
                    onClick={() => setCurrentView && setCurrentView({ page: 'blog' })}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-2 px-6 rounded-lg transition duration-300 shadow-sm border border-gray-300"
                >
                    View More
                </button>
            </div>
        </section>
    );
};

export default LatestNews;
