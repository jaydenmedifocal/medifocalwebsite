/**
 * Generate sitemap.xml for Medifocal website
 * This script generates a comprehensive sitemap including all pages, categories, products, and brands
 */

import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';

// Initialize Firebase Admin
const serviceAccount = require('../../medifocal-firebase-adminsdk-fbsvc-6caa04d80b.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

const baseUrl = 'https://medifocal.com';

// Static pages
const staticPages: SitemapUrl[] = [
  { loc: `${baseUrl}/`, changefreq: 'daily', priority: 1.0 },
  { loc: `${baseUrl}/about`, changefreq: 'monthly', priority: 0.8 },
  { loc: `${baseUrl}/contact`, changefreq: 'monthly', priority: 0.8 },
  { loc: `${baseUrl}/blog`, changefreq: 'weekly', priority: 0.8 },
  { loc: `${baseUrl}/clearance`, changefreq: 'daily', priority: 0.9 },
  { loc: `${baseUrl}/promotions`, changefreq: 'weekly', priority: 0.8 },
  { loc: `${baseUrl}/catalogues`, changefreq: 'monthly', priority: 0.7 },
  { loc: `${baseUrl}/dental-chairs`, changefreq: 'weekly', priority: 0.9 },
  { loc: `${baseUrl}/brands`, changefreq: 'weekly', priority: 0.8 },
];

// Generate sitemap XML
function generateSitemap(urls: SitemapUrl[]): string {
  const urlEntries = urls.map(url => {
    let entry = `  <url>\n    <loc>${url.loc}</loc>`;
    if (url.lastmod) entry += `\n    <lastmod>${url.lastmod}</lastmod>`;
    if (url.changefreq) entry += `\n    <changefreq>${url.changefreq}</changefreq>`;
    if (url.priority !== undefined) entry += `\n    <priority>${url.priority}</priority>`;
    entry += `\n  </url>`;
    return entry;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;
}

async function generateSitemapFile() {
  try {
    console.log('Generating sitemap...');
    const urls: SitemapUrl[] = [...staticPages];

    // Get categories
    console.log('Fetching categories...');
    const categoriesSnapshot = await db.collection('categories').get();
    const categories: string[] = [];
    
    categoriesSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.name) {
        categories.push(data.name);
        const categorySlug = data.name.toLowerCase().replace(/\s+/g, '-');
        urls.push({
          loc: `${baseUrl}/category/${categorySlug}`,
          changefreq: 'weekly',
          priority: 0.8
        });
      }
    });

    // Get products
    console.log('Fetching products...');
    const productsSnapshot = await db.collection('products')
      .where('isActive', '==', true)
      .limit(5000)
      .get();
    
    let productCount = 0;
    productsSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.itemNumber) {
        productCount++;
        urls.push({
          loc: `${baseUrl}/product/${encodeURIComponent(data.itemNumber)}`,
          changefreq: 'monthly',
          priority: 0.7
        });
      }
    });
    console.log(`Added ${productCount} products`);

    // Get brands
    console.log('Fetching brands...');
    const productsForBrands = await db.collection('products')
      .where('isActive', '==', true)
      .limit(1000)
      .get();
    
    const brands = new Set<string>();
    productsForBrands.forEach(doc => {
      const data = doc.data();
      if (data.manufacturer) {
        brands.add(data.manufacturer);
      }
    });

    brands.forEach(brand => {
      const brandSlug = brand.toLowerCase().replace(/\s+/g, '-');
      urls.push({
        loc: `${baseUrl}/brands/${brandSlug}`,
        changefreq: 'monthly',
        priority: 0.7
      });
    });
    console.log(`Added ${brands.size} brands`);

    // Generate sitemap
    const sitemapXml = generateSitemap(urls);
    
    // Write to public directory
    const outputPath = path.join(__dirname, '../../public/sitemap.xml');
    fs.writeFileSync(outputPath, sitemapXml, 'utf-8');
    
    console.log(`✅ Sitemap generated successfully!`);
    console.log(`   Total URLs: ${urls.length}`);
    console.log(`   Static pages: ${staticPages.length}`);
    console.log(`   Categories: ${categories.length}`);
    console.log(`   Products: ${productCount}`);
    console.log(`   Brands: ${brands.size}`);
    console.log(`   Saved to: ${outputPath}`);
    
  } catch (error) {
    console.error('Error generating sitemap:', error);
    process.exit(1);
  }
}

generateSitemapFile();
