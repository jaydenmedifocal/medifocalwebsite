/**
 * Blog Service for Medifocal
 * Handles loading and managing blog posts
 */

export interface BlogPost {
    id: number;
    title: string;
    date: string;
    excerpt: string;
    content?: string;
    category: string;
    imageUrl: string;
    meta?: {
        title: string;
        description: string;
    };
}

let blogPostsCache: BlogPost[] | null = null;

/**
 * Load blog posts from JSON files
 */
export async function loadBlogPosts(): Promise<BlogPost[]> {
    if (blogPostsCache) {
        return blogPostsCache;
    }

    try {
        // Try to load from index.json first
        const indexResponse = await fetch('/data/blogPosts/index.json');
        if (indexResponse.ok) {
            const posts = await indexResponse.json();
            blogPostsCache = posts;
            return posts;
        }
    } catch (error) {
        console.warn('Could not load blog posts index:', error);
    }

    // Fallback to default blog posts
    return getDefaultBlogPosts();
}

/**
 * Get a single blog post by ID
 */
export async function getBlogPost(id: number): Promise<BlogPost | null> {
    const posts = await loadBlogPosts();
    return posts.find(post => post.id === id) || null;
}

/**
 * Get blog posts by category
 */
export async function getBlogPostsByCategory(category: string): Promise<BlogPost[]> {
    const posts = await loadBlogPosts();
    return posts.filter(post => post.category === category);
}

/**
 * Search blog posts
 */
export async function searchBlogPosts(query: string): Promise<BlogPost[]> {
    const posts = await loadBlogPosts();
    const lowerQuery = query.toLowerCase();
    return posts.filter(post => 
        post.title.toLowerCase().includes(lowerQuery) ||
        post.excerpt.toLowerCase().includes(lowerQuery) ||
        post.category.toLowerCase().includes(lowerQuery)
    );
}

/**
 * Default blog posts (fallback)
 */
function getDefaultBlogPosts(): BlogPost[] {
    return [
        {
            id: 1,
            title: 'My Journey as a 21-Year-Old Entrepreneur: Revolutionizing the Dental Industry',
            date: '19 Aug 2024',
            excerpt: 'At 21, most people are still figuring out their path, but I knew exactly where I wanted to go. I saw an opportunity to make a real difference in an industry that impacts millions of lives every day—the dental industry. With that vision in mind, I founded Medifocal, a company driven by innovation, customer service, and a passion for pushing the boundaries of what\'s possible in dental care.',
            category: 'Entrepreneurship',
            imageUrl: 'https://images.unsplash.com/photo-1551601651-2a8555f1a136?q=80&w=1267&auto=format&fit=crop'
        },
        {
            id: 2,
            title: 'The New Kid in Dental: Competing With Integrity, Winning With Execution',
            date: '13 Oct 2025',
            excerpt: 'At 21 I founded Medifocal with more conviction than cash. I\'m 23 now, two years into the grind, and here\'s the most honest thing I\'ve learned: you will fail, you will fall, you will get tested...',
            category: 'Business',
            imageUrl: 'https://images.unsplash.com/photo-1600170354228-a4e9b634b92b?q=80&w=1470&auto=format&fit=crop'
        },
        {
            id: 3,
            title: 'Capsule Waste Evaluation for Restorative Materials',
            date: '13 Oct 2025',
            excerpt: 'Reducing single-use plastic and material waste in dental procedures is an important step toward greener practice management. We explore new studies on capsule efficiency.',
            category: 'Sustainability',
            imageUrl: 'https://images.unsplash.com/photo-1551601651-2a8555f1a136?q=80&w=800&auto=format&fit=crop'
        },
        {
            id: 4,
            title: 'Celebrating over 30 years of GC Fuji® II LC CAPSULE',
            date: '5 Sep 2025',
            excerpt: 'The world\'s first resin-reinforced glass ionomer has remained the benchmark for light-cured glass ionomer cements for years. A look back at its impact.',
            category: 'Product Spotlight',
            imageUrl: 'https://images.unsplash.com/photo-1606214174585-fe31582dc6ee?q=80&w=800&auto=format&fit=crop'
        },
        {
            id: 5,
            title: 'Failure To Replace: Who Pays The Ultimate Price?',
            date: '13 Aug 2025',
            excerpt: 'What criteria do you utilize when deciding to replace a scaler? The condition of the working end? Broken blades? We discuss the clinical and financial impacts of worn instruments.',
            category: 'Clinical',
            imageUrl: 'https://images.unsplash.com/photo-1606811971618-4486d14f3f99?q=80&w=800&auto=format&fit=crop'
        },
        {
            id: 6,
            title: '5 Reasons Dental Practices Are Making the Switch To Nitrile',
            date: '13 Aug 2025',
            excerpt: 'Let\'s face it: gloves may not be the most exciting item on your clinic supply list, but they\'re among the most critical. Discover why nitrile is becoming the gold standard.',
            category: 'Insights',
            imageUrl: 'https://images.unsplash.com/photo-1599045118108-bf9954418b76?q=80&w=800&auto=format&fit=crop'
        },
        {
            id: 7,
            title: 'An update on Medifocal\'s Supply Chain Sustainability Initiatives 2024',
            date: '22 Apr 2024',
            excerpt: 'At Medifocal we are working to reduce our environmental impact and promote responsible business practices in our own operations and supply chain.',
            category: 'Sustainability',
            imageUrl: 'https://images.unsplash.com/photo-1621594114735-36190a6d004e?q=80&w=1470&auto=format&fit=crop'
        },
        {
            id: 8,
            title: 'Medifocal showcases solutions at ADX exhibition',
            date: '18 Mar 2024',
            excerpt: 'Medifocal will showcase a selection of its comprehensive solutions portfolio and innovative products at ADX 2024, organised by Australian Dental Industry Association.',
            category: 'Events',
            imageUrl: 'https://images.unsplash.com/photo-1579154432194-52317112115e?q=80&w=1374&auto=format&fit=crop'
        }
    ];
}



