/**
 * Service for managing backlink building jobs
 * Integrates with Firebase Cloud Functions
 */

import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase/config';

// Initialize functions
let backlinkFunctions: any = null;

try {
  backlinkFunctions = {
    buildBacklinksManual: httpsCallable(functions, 'buildBacklinksManual'),
    getBacklinkJobStatus: httpsCallable(functions, 'getBacklinkJobStatus'),
  };
} catch (error) {
  console.warn('Firebase Functions not available:', error);
}

export interface BacklinkJob {
  id: string;
  status: 'running' | 'completed' | 'failed' | 'no_jobs';
  startedAt?: string;
  completedAt?: string;
  triggeredBy?: string;
  strategies?: string[];
  created?: number;
  errors?: string[];
  summary?: Record<string, number>;
  success?: boolean;
  error?: string;
}

/**
 * Start backlink building job (runs in background)
 */
export const startBacklinkBuilding = async (strategies: string[] = ['all']): Promise<{
  success: boolean;
  jobId: string;
  message: string;
}> => {
  if (!backlinkFunctions) {
    throw new Error('Firebase Functions not available');
  }

  try {
    const result = await backlinkFunctions.buildBacklinksManual({ strategies });
    return result.data;
  } catch (error: any) {
    console.error('Error starting backlink building:', error);
    throw error;
  }
};

/**
 * Get backlink job status
 */
export const getBacklinkJobStatus = async (jobId?: string): Promise<BacklinkJob> => {
  if (!backlinkFunctions) {
    throw new Error('Firebase Functions not available');
  }

  try {
    const result = await backlinkFunctions.getBacklinkJobStatus({ jobId });
    return result.data;
  } catch (error: any) {
    console.error('Error getting job status:', error);
    throw error;
  }
};

/**
 * Poll job status until completion
 */
export const waitForJobCompletion = async (
  jobId: string,
  onUpdate?: (job: BacklinkJob) => void,
  maxWaitTime: number = 300000 // 5 minutes
): Promise<BacklinkJob> => {
  const startTime = Date.now();
  const pollInterval = 2000; // Poll every 2 seconds

  return new Promise((resolve, reject) => {
    const poll = async () => {
      try {
        if (Date.now() - startTime > maxWaitTime) {
          reject(new Error('Job timeout - exceeded maximum wait time'));
          return;
        }

        const job = await getBacklinkJobStatus(jobId);
        
        if (onUpdate) {
          onUpdate(job);
        }

        if (job.status === 'completed' || job.status === 'failed') {
          resolve(job);
          return;
        }

        // Continue polling
        setTimeout(poll, pollInterval);
      } catch (error) {
        reject(error);
      }
    };

    poll();
  });
};

