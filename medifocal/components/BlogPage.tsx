import React, { useState, useEffect } from 'react';
import { View } from '../App';
import { loadBlogPosts, BlogPost } from '../services/blogService';
import SEOHead from './SEOHead';
import { viewToUrl } from '../utils/routing';

interface BlogPageProps {
    setCurrentView: (view: View) => void;
}

const HomeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>;

// Use a data URI for placeholder to avoid external fetch errors
const PLACEHOLDER_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZTJlOGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk0YTNiOCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkxvYWRpbmcuLi48L3RleHQ+PC9zdmc+';

const fallbackBlogPosts: BlogPost[] = Array(6).fill(null).map((_, i) => ({
    id: i,
    title: 'Loading Post Title...',
    date: 'Jan 1, 2024',
    excerpt: 'Loading excerpt... please wait a moment.',
    imageUrl: PLACEHOLDER_IMAGE,
    category: 'General'
}));

const BlogCard: React.FC<{ post: BlogPost, isLoading: boolean, setCurrentView: (view: View) => void }> = ({ post, isLoading, setCurrentView }) => (
    <article className={`bg-white rounded-lg shadow-md overflow-hidden flex flex-col group transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${isLoading ? 'animate-pulse' : 'cursor-pointer'}`}
        onClick={() => !isLoading && setCurrentView({ page: 'blogPost', postId: post.id })}
    >
        <div className="relative h-48 overflow-hidden">
            <img 
                src={post.imageUrl} 
                alt={isLoading ? 'Loading image' : post.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
            />
            {isLoading ? null : (
                 <div className="absolute top-3 left-3">
                    <span className="bg-brand-blue text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-md">{post.category}</span>
                </div>
            )}
        </div>
        <div className="p-6 flex flex-col flex-grow">
            {isLoading ? (
                <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-12 bg-gray-200 rounded w-full mt-2"></div>
                </div>
            ) : (
                <>
                    <p className="text-sm text-gray-500 mb-2">{post.date}</p>
                    <h2 className="text-lg font-bold text-gray-900 mb-3 flex-grow group-hover:text-brand-blue transition-colors leading-snug">{post.title}</h2>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-grow">{post.excerpt}</p>
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            setCurrentView({ page: 'blogPost', postId: post.id });
                        }}
                        className="text-brand-blue font-semibold hover:underline text-left mt-auto flex items-center gap-1 text-sm group"
                    >
                        Read More <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
                    </button>
                </>
            )}
        </div>
    </article>
);

const BlogPage: React.FC<BlogPageProps> = ({ setCurrentView }) => {
    const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBlogPosts = async () => {
            try {
                setLoading(true);
                const posts = await loadBlogPosts();
                setBlogPosts(posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
            } catch (error) {
                console.error('Error loading blog posts:', error);
                setBlogPosts([]); // On error, maybe show an error message instead
            } finally {
                setLoading(false);
            }
        };

        // Simulate a longer load time to see skeleton
        setTimeout(fetchBlogPosts, 1000);
    }, []);

    const postsToDisplay = loading ? fallbackBlogPosts : blogPosts;

    const blogUrl = viewToUrl({ page: 'blog' });
    
    return (
        <div className="bg-gray-50 min-h-screen">
            <SEOHead
                title="Dental Industry News & Insights | Medifocal Blog"
                description="Stay updated with the latest dental industry news, product insights, and expert advice from Medifocal. Learn about dental equipment, best practices, and industry trends."
                url={`https://medifocal.com${blogUrl}`}
                type="website"
            />
            <div className="container mx-auto px-4 py-8">
                <nav className="flex items-center text-sm mb-8 text-gray-500" aria-label="Breadcrumb">
                    <button onClick={() => setCurrentView({ page: 'home' })} className="flex items-center hover:text-brand-blue font-medium">
                        <HomeIcon />
                        <span className="ml-2">Home</span>
                    </button>
                    <span className="mx-2">/</span>
                    <span className="font-semibold text-gray-800">Blog</span>
                </nav>

                {/* Hero Section */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl lg:text-5xl font-extrabold text-gray-900 mb-3">Dental Insights</h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">Your source for the latest news, articles, and updates in the dental industry.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {postsToDisplay.map((post, index) => (
                        <BlogCard key={post.id || index} post={post} isLoading={loading} setCurrentView={setCurrentView} />
                    ))}
                </div>

                {!loading && blogPosts.length === 0 && (
                    <div className="text-center py-16 col-span-full bg-white rounded-lg shadow-md">
                        <h2 className="text-xl font-bold text-gray-800 mb-2">No Posts Yet</h2>
                        <p className="text-gray-500">There are no blog posts available at the moment. Please check back soon!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BlogPage;
