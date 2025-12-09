/**
 * Automated Content Generation System
 * Generates blog posts, updates sitemap, and creates content pages
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

interface ContentItem {
  type: 'blog' | 'guide' | 'faq';
  title: string;
  slug: string;
  content: string;
  category: string;
  tags: string[];
  publishedAt: string;
}

const contentTemplates: ContentItem[] = [
  {
    type: 'blog',
    title: 'Top 10 Dental Equipment Maintenance Tips',
    slug: 'top-10-dental-equipment-maintenance-tips',
    category: 'Equipment',
    tags: ['maintenance', 'dental equipment', 'tips', 'best practices'],
    publishedAt: new Date().toISOString(),
    content: `
# Top 10 Dental Equipment Maintenance Tips

Proper maintenance of dental equipment is essential for practice efficiency and patient safety. Here are our top 10 maintenance tips:

## 1. Regular Cleaning
Clean all equipment after each use. Use appropriate cleaners and follow manufacturer guidelines.

## 2. Scheduled Servicing
Schedule professional servicing every 6-12 months for major equipment like autoclaves and dental chairs.

## 3. Lubrication
Regularly lubricate handpieces and moving parts according to manufacturer specifications.

## 4. Water Quality
Use distilled or demineralized water in autoclaves and dental units to prevent mineral buildup.

## 5. Calibration
Regularly calibrate equipment like X-ray units and curing lights to ensure accuracy.

## 6. Documentation
Maintain detailed service logs and documentation for compliance and warranty purposes.

## 7. Staff Training
Ensure all staff are trained on proper equipment use and maintenance procedures.

## 8. Spare Parts
Keep essential spare parts on hand to minimize downtime.

## 9. Environment
Maintain proper temperature and humidity levels in equipment areas.

## 10. Professional Support
Work with qualified service providers like Medifocal for expert maintenance and support.

For professional equipment maintenance and service, contact Medifocal at (02) 4056 1419.
    `
  },
  {
    type: 'blog',
    title: 'Understanding Dental X-Ray Safety Standards in Australia',
    slug: 'dental-xray-safety-standards-australia',
    category: 'X-Ray',
    tags: ['x-ray', 'safety', 'compliance', 'radiation safety'],
    publishedAt: new Date().toISOString(),
    content: `
# Understanding Dental X-Ray Safety Standards in Australia

Dental X-ray equipment must comply with strict Australian safety standards. This guide explains the requirements.

## Radiation Safety Standards

All dental X-ray equipment in Australia must comply with:
- **ARPANSA Standards**: Australian Radiation Protection and Nuclear Safety Agency
- **State Regulations**: Vary by state
- **TGA Requirements**: Therapeutic Goods Administration

## Equipment Requirements

### Digital X-Ray Systems
- Must meet Australian safety standards
- Regular calibration required
- Proper shielding essential
- Quality assurance programs

### Radiation Protection
- Lead aprons for patients
- Thyroid collars
- Proper positioning
- Minimum exposure protocols

## Compliance Requirements

Dental practices must:
- Register X-ray equipment
- Maintain service records
- Conduct regular testing
- Staff training and certification
- Quality assurance programs

## Best Practices

1. **ALARA Principle**: As Low As Reasonably Achievable radiation exposure
2. **Proper Positioning**: Minimize retakes
3. **Quality Equipment**: Invest in modern digital systems
4. **Regular Maintenance**: Ensure optimal performance
5. **Staff Training**: Ongoing education

## Medifocal X-Ray Solutions

Medifocal offers:
- Compliant X-ray equipment
- Installation and calibration
- Training and support
- Maintenance services
- Compliance documentation

For X-ray equipment and compliance support, contact Medifocal at (02) 4056 1419.
    `
  },
  {
    type: 'blog',
    title: 'Dental Practice Setup: Essential Equipment Checklist',
    slug: 'dental-practice-setup-equipment-checklist',
    category: 'Equipment',
    tags: ['practice setup', 'equipment checklist', 'new practice', 'dental equipment'],
    publishedAt: new Date().toISOString(),
    content: `
# Dental Practice Setup: Essential Equipment Checklist

Starting a new dental practice? This comprehensive checklist ensures you have everything you need.

## Treatment Room Essentials

### Primary Equipment
- Dental chair and unit
- High-speed handpiece
- Low-speed handpiece
- Autoclave
- X-ray equipment
- Curing light

### Instruments
- Basic instrument set
- Forceps
- Scalers
- Mirrors and probes
- Curettes

## Sterilization Area

- Class B autoclave
- Ultrasonic cleaner
- Sterilization pouches
- Storage solutions
- Documentation system

## Infection Control

- PPE supplies (gloves, masks, gowns)
- Disinfectants
- Hand sanitizer
- Sharps containers
- Waste management

## Reception Area

- Reception desk
- Computer system
- Phone system
- Patient management software
- Waiting area furniture

## Budget Planning

Equipment costs typically range from $50,000-$150,000+ depending on practice size and equipment quality.

## Medifocal Practice Setup Services

Medifocal provides:
- Complete equipment packages
- Expert planning and advice
- Professional installation
- Comprehensive training
- Ongoing support

For practice setup assistance, contact Medifocal at (02) 4056 1419.
    `
  }
];

async function generateContent() {
  try {
    console.log('🚀 Starting automated content generation...\n');

    // Generate blog posts
    console.log('📝 Generating blog posts...');
    let postId = 1;
    const existingPosts = await db.collection('blogPosts').get();
    if (!existingPosts.empty) {
      const ids = existingPosts.docs.map(doc => doc.data().id || 0);
      postId = Math.max(...ids) + 1;
    }

    for (const template of contentTemplates.filter(t => t.type === 'blog')) {
      const existing = await db.collection('blogPosts')
        .where('slug', '==', template.slug)
        .get();

      if (existing.empty) {
        await db.collection('blogPosts').add({
          id: postId++,
          title: template.title,
          slug: template.slug,
          excerpt: template.content.substring(0, 200).replace(/#/g, '').trim() + '...',
          content: template.content,
          category: template.category,
          tags: template.tags,
          publishedAt: template.publishedAt,
          author: 'Medifocal Team'
        });
        console.log(`  ✅ Created: ${template.title}`);
      } else {
        console.log(`  ⏭️  Skipped: ${template.title} (already exists)`);
      }
    }

    console.log('\n✅ Content generation complete!');
    console.log(`\n📊 Summary:`);
    console.log(`   - Blog posts processed: ${contentTemplates.filter(t => t.type === 'blog').length}`);
    console.log(`\n💡 Next steps:`);
    console.log(`   1. Review generated content in Firestore`);
    console.log(`   2. Run 'npm run generate-sitemap' to update sitemap`);
    console.log(`   3. Deploy updated website`);

  } catch (error) {
    console.error('❌ Error generating content:', error);
    process.exit(1);
  }
}

generateContent();

