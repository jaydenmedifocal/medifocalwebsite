import React, { useState, useEffect } from 'react';
import { View } from '../App';
import { getBlogPost, BlogPost } from '../services/blogService';
import SEOHead from './SEOHead';
import { viewToUrl } from '../utils/routing';

interface BlogPostPageProps {
    setCurrentView: (view: View) => void;
    postId: number | string;
}

const HomeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>;

const BlogPostPage: React.FC<BlogPostPageProps> = ({ setCurrentView, postId }) => {
    const [post, setPost] = useState<BlogPost | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                setLoading(true);
                setError(null);
                const postIdNum = typeof postId === 'string' ? parseInt(postId) : postId;
                const fetchedPost = await getBlogPost(postIdNum);
                if (fetchedPost) {
                    setPost(fetchedPost);
                } else {
                    setError('Post not found');
                }
            } catch (err) {
                console.error('Error loading blog post:', err);
                setError('Failed to load post');
            } finally {
                setLoading(false);
            }
        };

        fetchPost();
    }, [postId]);

    if (loading) {
        return (
            <div className="bg-gray-50 min-h-screen">
                <div className="container mx-auto px-4 py-8">
                    <div className="max-w-4xl mx-auto">
                        <div className="animate-pulse space-y-6">
                            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                            <div className="h-64 bg-gray-200 rounded"></div>
                            <div className="space-y-3">
                                <div className="h-4 bg-gray-200 rounded"></div>
                                <div className="h-4 bg-gray-200 rounded"></div>
                                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !post) {
        return (
            <div className="bg-gray-50 min-h-screen">
                <div className="container mx-auto px-4 py-8">
                    <div className="max-w-4xl mx-auto text-center py-16">
                        <h1 className="text-2xl font-bold text-gray-900 mb-4">Post Not Found</h1>
                        <p className="text-gray-600 mb-6">{error || 'The blog post you are looking for does not exist.'}</p>
                        <button
                            onClick={() => setCurrentView({ page: 'blog' })}
                            className="bg-brand-blue text-white px-6 py-2 rounded-lg hover:bg-brand-blue-dark"
                        >
                            Back to Blog
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const postUrl = viewToUrl({ page: 'blogPost', postId: post.id });

    return (
        <div className="bg-gray-50 min-h-screen">
            <SEOHead
                title={post.meta?.title || `${post.title} | Medifocal Blog`}
                description={post.meta?.description || post.excerpt}
                url={`https://medifocal.com${postUrl}`}
                type="article"
            />
            <div className="container mx-auto px-4 py-8">
                <nav className="flex items-center text-sm mb-8 text-gray-500" aria-label="Breadcrumb">
                    <button onClick={() => setCurrentView({ page: 'home' })} className="flex items-center hover:text-brand-blue font-medium">
                        <HomeIcon />
                        <span className="ml-2">Home</span>
                    </button>
                    <span className="mx-2">/</span>
                    <button onClick={() => setCurrentView({ page: 'blog' })} className="hover:text-brand-blue font-medium">
                        Blog
                    </button>
                    <span className="mx-2">/</span>
                    <span className="font-semibold text-gray-800 line-clamp-1">{post.title}</span>
                </nav>

                <article className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
                    {/* Featured Image */}
                    <div className="relative h-64 md:h-96 overflow-hidden">
                        <img
                            src={post.imageUrl}
                            alt={post.title}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute top-4 left-4">
                            <span className="bg-brand-blue text-white text-sm font-semibold px-4 py-2 rounded-full shadow-md">
                                {post.category}
                            </span>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-8 md:p-12">
                        {/* Meta */}
                        <div className="mb-6">
                            <p className="text-sm text-gray-500 mb-2">{post.date}</p>
                            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4 leading-tight">
                                {post.title}
                            </h1>
                        </div>

                        {/* Excerpt */}
                        <div className="prose prose-lg max-w-none mb-8">
                            <p className="text-xl text-gray-700 leading-relaxed font-medium">
                                {post.excerpt}
                            </p>
                        </div>

                        {/* Content */}
                        {post.content ? (
                            <div 
                                className="prose prose-lg max-w-none"
                                dangerouslySetInnerHTML={{ __html: post.content }}
                            />
                        ) : (
                            <div className="prose prose-lg max-w-none">
                                <p className="text-gray-700 leading-relaxed mb-4">
                                    {post.excerpt}
                                </p>
                                <p className="text-gray-700 leading-relaxed">
                                    This is a preview of the blog post. Full content will be available soon.
                                </p>
                            </div>
                        )}

                        {/* Back Button */}
                        <div className="mt-12 pt-8 border-t border-gray-200">
                            <button
                                onClick={() => setCurrentView({ page: 'blog' })}
                                className="text-brand-blue font-semibold hover:underline flex items-center gap-2"
                            >
                                <span>&larr;</span>
                                <span>Back to Blog</span>
                            </button>
                        </div>
                    </div>
                </article>
            </div>
        </div>
    );
};

export default BlogPostPage;



