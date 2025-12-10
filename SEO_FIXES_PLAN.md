# SEO Issues Fix Plan

## Analysis Summary
From `medifocal.com_issues_20251210.xlsx`:
- **99 unique issues** across 110 pages
- **39 Errors**, **34 Warnings**, **26 Notices**

## Critical Issues to Fix

### ✅ Already Fixed
1. **Sitemap.xml HTTP URLs** - All `<loc>` URLs are HTTPS (namespace `http://` is fine)
2. **Content sections** - Added to category/product pages for better text-to-HTML ratio

### 🔧 Issues to Fix

#### 1. Mixed Content (110 pages) - HIGH PRIORITY
**Root Cause:** External resources or product images loading over HTTP
**Fix:** 
- Ensure all image URLs use HTTPS
- Check Firebase Storage URLs
- Add Content Security Policy upgrade-insecure-requests

#### 2. Duplicate Meta Descriptions (108 pages) - HIGH PRIORITY  
**Root Cause:** Pages using default/generic descriptions
**Fix:**
- Generate unique descriptions per page using `getProductSEODescription()`
- Ensure category pages have unique descriptions
- Add product-specific details to descriptions

#### 3. Redirect Chains (64 pages) - MEDIUM PRIORITY
**Root Cause:** Multiple redirects in sequence
**Fix:**
- Review `firebase.json` redirects
- Simplify redirect structure
- Use direct 301 redirects

#### 4. Structured Data Errors (46 pages) - HIGH PRIORITY
**Root Cause:** JSON-LD syntax errors or missing required fields
**Fix:**
- Validate all structured data
- Ensure required fields are present
- Fix syntax errors in ProductSchema

#### 5. Duplicate Title Tags (36 pages) - HIGH PRIORITY
**Root Cause:** Pages using same title
**Fix:**
- Use `getProductSEOTitle()` for all product pages
- Ensure category pages have unique titles
- Add product/category identifiers to titles

#### 6. HTTP URLs in Sitemap (38 pages) - MEDIUM PRIORITY
**Status:** Already fixed - all URLs are HTTPS

#### 7. Broken JS/CSS (22 pages) - HIGH PRIORITY
**Root Cause:** Broken asset paths or missing files
**Fix:**
- Check build output
- Verify all assets are included
- Fix broken imports

#### 8. Pages Not Crawled (22 pages) - MEDIUM PRIORITY
**Root Cause:** robots.txt blocking or sitemap issues
**Fix:**
- Review robots.txt
- Ensure sitemap is accessible
- Check for noindex tags

#### 9. DNS Resolution (22 pages) - ALREADY ADDRESSED
**Status:** User needs to configure DNS in Squarespace

#### 10. Unminified/Uncompressed JS/CSS (44 pages) - LOW PRIORITY
**Status:** Vite already minifies - may need to check build config

## Implementation Priority

1. **Fix structured data errors** (46 pages) - Can fix immediately
2. **Fix duplicate meta descriptions** (108 pages) - Can fix immediately  
3. **Fix duplicate titles** (36 pages) - Can fix immediately
4. **Fix mixed content** (110 pages) - Need to check external resources
5. **Fix redirect chains** (64 pages) - Review firebase.json
6. **Fix broken JS/CSS** (22 pages) - Check build output

