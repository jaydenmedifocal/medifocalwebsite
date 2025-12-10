import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '../firebase/config';

export interface Backlink {
  id?: string;
  url: string;
  domain: string;
  anchorText: string;
  targetUrl: string; // URL on your site being linked to
  quality: 'good' | 'neutral' | 'bad' | 'unknown';
  domainAuthority?: number;
  status: 'active' | 'broken' | 'removed' | 'pending_removal' | 'disavowed';
  source: 'manual' | 'google_search_console' | 'ahrefs' | 'auto_created';
  notes?: string;
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
  lastChecked?: Date | Timestamp;
  removalRequested?: boolean;
  removalRequestDate?: Date | Timestamp;
  removalRequestEmail?: string;
  removalRequestResponse?: string;
  autoCreated?: boolean;
  autoCreatedStrategy?: string;
}

/**
 * Get all backlinks
 */
export const getAllBacklinks = async (): Promise<Backlink[]> => {
  try {
    const backlinksRef = collection(db, 'backlinks');
    const q = query(backlinksRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      lastChecked: doc.data().lastChecked?.toDate(),
      removalRequestDate: doc.data().removalRequestDate?.toDate(),
    })) as Backlink[];
  } catch (error) {
    console.error('Error fetching backlinks:', error);
    throw error;
  }
};

/**
 * Get backlink by ID
 */
export const getBacklink = async (id: string): Promise<Backlink | null> => {
  try {
    const backlinkRef = doc(db, 'backlinks', id);
    const backlinkSnap = await getDoc(backlinkRef);
    
    if (!backlinkSnap.exists()) {
      return null;
    }
    
    return {
      id: backlinkSnap.id,
      ...backlinkSnap.data(),
      createdAt: backlinkSnap.data().createdAt?.toDate() || new Date(),
      updatedAt: backlinkSnap.data().updatedAt?.toDate() || new Date(),
      lastChecked: backlinkSnap.data().lastChecked?.toDate(),
      removalRequestDate: backlinkSnap.data().removalRequestDate?.toDate(),
    } as Backlink;
  } catch (error) {
    console.error('Error fetching backlink:', error);
    throw error;
  }
};

/**
 * Add a new backlink
 */
export const addBacklink = async (backlink: Omit<Backlink, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  try {
    const backlinksRef = collection(db, 'backlinks');
    const newBacklink = {
      ...backlink,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
    
    const docRef = await addDoc(backlinksRef, newBacklink);
    return docRef.id;
  } catch (error) {
    console.error('Error adding backlink:', error);
    throw error;
  }
};

/**
 * Update a backlink
 */
export const updateBacklink = async (id: string, updates: Partial<Backlink>): Promise<void> => {
  try {
    const backlinkRef = doc(db, 'backlinks', id);
    await updateDoc(backlinkRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating backlink:', error);
    throw error;
  }
};

/**
 * Delete a backlink
 */
export const deleteBacklink = async (id: string): Promise<void> => {
  try {
    const backlinkRef = doc(db, 'backlinks', id);
    await deleteDoc(backlinkRef);
  } catch (error) {
    console.error('Error deleting backlink:', error);
    throw error;
  }
};

/**
 * Mark backlink for removal request
 */
export const requestRemoval = async (id: string, email?: string): Promise<void> => {
  try {
    const backlinkRef = doc(db, 'backlinks', id);
    await updateDoc(backlinkRef, {
      removalRequested: true,
      removalRequestDate: Timestamp.now(),
      removalRequestEmail: email,
      status: 'pending_removal',
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error requesting removal:', error);
    throw error;
  }
};

/**
 * Mark backlink as disavowed
 */
export const disavowBacklink = async (id: string): Promise<void> => {
  try {
    const backlinkRef = doc(db, 'backlinks', id);
    await updateDoc(backlinkRef, {
      status: 'disavowed',
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error disavowing backlink:', error);
    throw error;
  }
};

/**
 * Bulk disavow backlinks
 */
export const bulkDisavow = async (ids: string[]): Promise<void> => {
  try {
    const batch = writeBatch(db);
    
    ids.forEach(id => {
      const backlinkRef = doc(db, 'backlinks', id);
      batch.update(backlinkRef, {
        status: 'disavowed',
        updatedAt: Timestamp.now(),
      });
    });
    
    await batch.commit();
  } catch (error) {
    console.error('Error bulk disavowing backlinks:', error);
    throw error;
  }
};

/**
 * Get backlinks by quality
 */
export const getBacklinksByQuality = async (quality: Backlink['quality']): Promise<Backlink[]> => {
  try {
    const backlinksRef = collection(db, 'backlinks');
    const q = query(
      backlinksRef,
      where('quality', '==', quality),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as Backlink[];
  } catch (error) {
    console.error('Error fetching backlinks by quality:', error);
    throw error;
  }
};

/**
 * Get backlinks by status
 */
export const getBacklinksByStatus = async (status: Backlink['status']): Promise<Backlink[]> => {
  try {
    const backlinksRef = collection(db, 'backlinks');
    const q = query(
      backlinksRef,
      where('status', '==', status),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as Backlink[];
  } catch (error) {
    console.error('Error fetching backlinks by status:', error);
    throw error;
  }
};

/**
 * Generate disavow file content
 */
export const generateDisavowFile = async (): Promise<string> => {
  try {
    const disavowedBacklinks = await getBacklinksByStatus('disavowed');
    const badBacklinks = await getBacklinksByQuality('bad');
    
    const allDisavowLinks = [...disavowedBacklinks, ...badBacklinks.filter(b => b.status !== 'disavowed')];
    
    let content = '# Disavow file generated automatically\n';
    content += '# Review before uploading to Google Search Console\n';
    content += `# Date: ${new Date().toISOString()}\n`;
    content += `# Total domains: ${new Set(allDisavowLinks.map(b => b.domain)).size}\n\n`;
    
    const domains = new Set<string>();
    
    allDisavowLinks.forEach(backlink => {
      const domain = backlink.domain.replace('www.', '');
      if (!domains.has(domain)) {
        domains.add(domain);
        content += `domain:${domain}\n`;
      }
    });
    
    return content;
  } catch (error) {
    console.error('Error generating disavow file:', error);
    throw error;
  }
};

/**
 * Import backlinks from Google Search Console export
 */
export const importBacklinksFromCSV = async (csvContent: string): Promise<number> => {
  try {
    const lines = csvContent.split('\n');
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    
    const urlIndex = headers.findIndex(h => h.includes('source') || h.includes('url') || h.includes('linking page'));
    const anchorIndex = headers.findIndex(h => h.includes('anchor') || h.includes('text'));
    const targetIndex = headers.findIndex(h => h.includes('target') || h.includes('linked page') || h.includes('destination'));
    
    if (urlIndex === -1) {
      throw new Error('Could not find URL column in CSV');
    }
    
    let imported = 0;
    const batch = writeBatch(db);
    let batchCount = 0;
    const maxBatchSize = 500;
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const values = line.split(',').map(v => v.trim());
      const url = values[urlIndex] || '';
      const anchorText = values[anchorIndex] || '';
      const targetUrl = values[targetIndex] || 'https://medifocal.com';
      
      if (!url) continue;
      
      // Extract domain
      let domain = '';
      try {
        const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
        domain = urlObj.hostname.replace('www.', '');
      } catch {
        domain = url;
      }
      
      // Check if already exists
      const existingQuery = query(
        collection(db, 'backlinks'),
        where('url', '==', url),
        limit(1)
      );
      const existing = await getDocs(existingQuery);
      
      if (!existing.empty) {
        continue; // Skip duplicates
      }
      
      // Determine quality (basic heuristic)
      let quality: Backlink['quality'] = 'unknown';
      const domainLower = domain.toLowerCase();
      const spamIndicators = ['spam', 'link-farm', 'directory', 'free-links'];
      if (spamIndicators.some(indicator => domainLower.includes(indicator))) {
        quality = 'bad';
      }
      
      const backlinkRef = doc(collection(db, 'backlinks'));
      batch.set(backlinkRef, {
        url,
        domain,
        anchorText,
        targetUrl,
        quality,
        status: 'active',
        source: 'google_search_console',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      
      batchCount++;
      imported++;
      
      if (batchCount >= maxBatchSize) {
        await batch.commit();
        batchCount = 0;
      }
    }
    
    if (batchCount > 0) {
      await batch.commit();
    }
    
    return imported;
  } catch (error) {
    console.error('Error importing backlinks:', error);
    throw error;
  }
};

/**
 * Get backlink statistics
 */
export const getBacklinkStats = async () => {
  try {
    const allBacklinks = await getAllBacklinks();
    
    return {
      total: allBacklinks.length,
      byQuality: {
        good: allBacklinks.filter(b => b.quality === 'good').length,
        neutral: allBacklinks.filter(b => b.quality === 'neutral').length,
        bad: allBacklinks.filter(b => b.quality === 'bad').length,
        unknown: allBacklinks.filter(b => b.quality === 'unknown').length,
      },
      byStatus: {
        active: allBacklinks.filter(b => b.status === 'active').length,
        broken: allBacklinks.filter(b => b.status === 'broken').length,
        removed: allBacklinks.filter(b => b.status === 'removed').length,
        pending_removal: allBacklinks.filter(b => b.status === 'pending_removal').length,
        disavowed: allBacklinks.filter(b => b.status === 'disavowed').length,
      },
      bySource: {
        manual: allBacklinks.filter(b => b.source === 'manual').length,
        google_search_console: allBacklinks.filter(b => b.source === 'google_search_console').length,
        auto_created: allBacklinks.filter(b => b.source === 'auto_created').length,
      },
      removalRequested: allBacklinks.filter(b => b.removalRequested).length,
    };
  } catch (error) {
    console.error('Error getting backlink stats:', error);
    throw error;
  }
};

