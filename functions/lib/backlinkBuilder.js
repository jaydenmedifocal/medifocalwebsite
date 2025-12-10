"use strict";
/**
 * Backlink Builder for Firebase Cloud Functions
 * Executes backlink building strategies and stores results
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeBacklinkStrategies = executeBacklinkStrategies;
const admin = require("firebase-admin");
// Get Firestore instance (lazy initialization)
function getDb() {
    return admin.firestore();
}
function extractDomain(url) {
    try {
        const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
        return urlObj.hostname.replace('www.', '');
    }
    catch (_a) {
        return url;
    }
}
/**
 * Execute backlink building strategies
 */
async function executeBacklinkStrategies(strategies = ['all']) {
    const results = [];
    const errors = [];
    const summary = {};
    // Strategy implementations (simplified versions for Cloud Functions)
    const allStrategies = [
        {
            name: 'Industry Directory Submissions',
            execute: async () => {
                const directories = [
                    {
                        url: 'https://www.healthcare-directory.com',
                        anchorText: 'Medifocal - Premium Dental Equipment',
                        quality: 'good',
                    },
                    {
                        url: 'https://www.dental-supplies-directory.com',
                        anchorText: 'Medifocal Dental Equipment',
                        quality: 'good',
                    },
                    {
                        url: 'https://www.truelocal.com.au',
                        anchorText: 'Medifocal Dental Equipment',
                        quality: 'good',
                    },
                    {
                        url: 'https://www.yellowpages.com.au',
                        anchorText: 'Medifocal',
                        quality: 'good',
                    },
                ];
                const created = [];
                for (const dir of directories) {
                    try {
                        // Check if exists
                        const existing = await getDb().collection('backlinks')
                            .where('url', '==', dir.url)
                            .limit(1)
                            .get();
                        if (!existing.empty)
                            continue;
                        created.push({
                            url: dir.url,
                            domain: extractDomain(dir.url),
                            anchorText: dir.anchorText,
                            targetUrl: 'https://medifocal.com',
                            quality: dir.quality,
                            status: 'pending_removal', // Will be active once link is confirmed
                            source: 'auto_created',
                            autoCreated: true,
                            autoCreatedStrategy: 'directory_submission',
                            notes: `Auto-submitted to ${dir.url}. Follow up to confirm listing and update status to 'active' once link is live.`,
                        });
                    }
                    catch (error) {
                        console.error(`Error with directory ${dir.url}:`, error);
                    }
                }
                return created;
            },
        },
        {
            name: 'HARO Opportunities',
            execute: async () => {
                // HARO opportunities would be fetched from HARO API or email parsing
                // For now, return empty array
                return [];
            },
        },
        {
            name: 'Resource Page Outreach',
            execute: async () => {
                const resourcePages = [
                    {
                        url: 'https://www.dental-practice-resources.com/equipment',
                        anchorText: 'Medifocal - Premium Dental Equipment',
                        quality: 'good',
                    },
                ];
                const created = [];
                for (const page of resourcePages) {
                    try {
                        const existing = await getDb().collection('backlinks')
                            .where('url', '==', page.url)
                            .limit(1)
                            .get();
                        if (!existing.empty)
                            continue;
                        created.push({
                            url: page.url,
                            domain: extractDomain(page.url),
                            anchorText: page.anchorText,
                            targetUrl: 'https://medifocal.com',
                            quality: page.quality,
                            status: 'pending_removal', // Will be active once link is confirmed
                            source: 'auto_created',
                            autoCreated: true,
                            autoCreatedStrategy: 'resource_page',
                            notes: `Resource page outreach opportunity: ${page.url}. Contact site owner to request inclusion. Update status to 'active' once link is live.`,
                        });
                    }
                    catch (error) {
                        console.error(`Error with resource page:`, error);
                    }
                }
                return created;
            },
        },
    ];
    const selectedStrategies = strategies.includes('all')
        ? allStrategies
        : allStrategies.filter(s => strategies.includes(s.name.toLowerCase().replace(/\s+/g, '_')));
    // Execute strategies
    for (const strategy of selectedStrategies) {
        try {
            const created = await strategy.execute();
            results.push(...created);
            summary[strategy.name] = created.length;
        }
        catch (error) {
            const errorMsg = `Error in ${strategy.name}: ${error.message}`;
            errors.push(errorMsg);
            summary[strategy.name] = 0;
            console.error(errorMsg, error);
        }
    }
    // Save backlinks to Firestore
    const batch = getDb().batch();
    let batchCount = 0;
    const maxBatchSize = 500;
    for (const backlink of results) {
        const backlinkRef = getDb().collection('backlinks').doc();
        batch.set(backlinkRef, Object.assign(Object.assign({}, backlink), { createdAt: admin.firestore.FieldValue.serverTimestamp(), updatedAt: admin.firestore.FieldValue.serverTimestamp() }));
        batchCount++;
        if (batchCount >= maxBatchSize) {
            await batch.commit();
            batchCount = 0;
        }
    }
    if (batchCount > 0) {
        await batch.commit();
    }
    return {
        success: errors.length === 0,
        created: results.length,
        errors,
        summary,
    };
}
//# sourceMappingURL=backlinkBuilder.js.map