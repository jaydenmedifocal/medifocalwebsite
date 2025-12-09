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
  writeBatch,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { db, functions } from '../firebase/config';
import { httpsCallable } from 'firebase/functions';

/**
 * Client/Business Management Service
 * Handles business clients separate from user accounts
 */

const COLLECTION_NAME = 'businessClients';

export interface BusinessClient {
  id?: string;
  businessName: string;
  contactName?: string;
  email: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
  };
  abn?: string; // Australian Business Number
  website?: string;
  industry?: string;
  notes?: string;
  stripeCustomerId?: string;
  stripeLink?: string;
  isActive: boolean;
  createdAt?: Timestamp | Date;
  updatedAt?: Timestamp | Date;
  mergedFrom?: string[]; // IDs of merged clients
  mergedInto?: string; // ID of client this was merged into
}

/**
 * Get all business clients
 */
export const getBusinessClients = async (): Promise<BusinessClient[]> => {
  try {
    const clientsRef = collection(db, COLLECTION_NAME);
    const clientsQuery = query(clientsRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(clientsQuery);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as BusinessClient));
  } catch (error) {
    console.error('Error fetching business clients:', error);
    return [];
  }
};

/**
 * Get business client by ID
 */
export const getBusinessClient = async (clientId: string): Promise<BusinessClient | null> => {
  try {
    const clientRef = doc(db, COLLECTION_NAME, clientId);
    const snapshot = await getDoc(clientRef);
    
    if (snapshot.exists()) {
      return {
        id: snapshot.id,
        ...snapshot.data()
      } as BusinessClient;
    }
    return null;
  } catch (error) {
    console.error('Error fetching business client:', error);
    return null;
  }
};

/**
 * Create business client and sync to Stripe
 */
export const createBusinessClient = async (clientData: Omit<BusinessClient, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  try {
    const clientsRef = collection(db, COLLECTION_NAME);
    
    const newClient = {
      ...clientData,
      isActive: clientData.isActive !== undefined ? clientData.isActive : true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(clientsRef, newClient);
    
    // Sync to Stripe
    await syncClientToStripe(docRef.id, clientData);
    
    return docRef.id;
  } catch (error) {
    console.error('Error creating business client:', error);
    throw error;
  }
};

/**
 * Update business client and sync to Stripe
 */
export const updateBusinessClient = async (
  clientId: string,
  clientData: Partial<BusinessClient>
): Promise<void> => {
  try {
    const clientRef = doc(db, COLLECTION_NAME, clientId);
    
    const updateData = {
      ...clientData,
      updatedAt: serverTimestamp()
    };
    delete updateData.id; // Don't update the ID
    
    await updateDoc(clientRef, updateData);
    
    // Sync to Stripe if email or name changed
    if (clientData.email || clientData.businessName || clientData.contactName) {
      const currentClient = await getBusinessClient(clientId);
      if (currentClient) {
        await syncClientToStripe(clientId, {
          ...currentClient,
          ...clientData
        } as BusinessClient);
      }
    }
  } catch (error) {
    console.error('Error updating business client:', error);
    throw error;
  }
};

/**
 * Delete business client
 */
export const deleteBusinessClient = async (clientId: string): Promise<void> => {
  try {
    const clientRef = doc(db, COLLECTION_NAME, clientId);
    await deleteDoc(clientRef);
    
    // Note: Stripe customer deletion should be handled separately if needed
  } catch (error) {
    console.error('Error deleting business client:', error);
    throw error;
  }
};

/**
 * Sync business client to Stripe
 */
export const syncClientToStripe = async (
  clientId: string,
  clientData: Partial<BusinessClient>
): Promise<void> => {
  try {
    // Check if we have a Stripe proxy function
    const stripeProxy = httpsCallable(functions, 'stripeProxy');
    
    const client = await getBusinessClient(clientId);
    if (!client) {
      throw new Error('Client not found');
    }
    
    // If client already has Stripe ID, update existing customer
    if (client.stripeCustomerId) {
      await stripeProxy({
        method: 'POST',
        path: `/customers/${client.stripeCustomerId}`,
        data: {
          name: client.businessName,
          email: client.email,
          phone: client.phone,
          metadata: {
            businessClientId: clientId,
            businessName: client.businessName,
            contactName: client.contactName || '',
            abn: client.abn || ''
          },
          address: client.address ? {
            line1: client.address.street || '',
            city: client.address.city || '',
            state: client.address.state || '',
            postal_code: client.address.zip || '',
            country: client.address.country || 'AU'
          } : undefined
        }
      });
    } else {
      // Search for existing Stripe customer by email before creating
      let stripeCustomer: any = null;
      
      if (client.email) {
        try {
          const searchResult = await stripeProxy({
            method: 'GET',
            path: '/customers',
            params: {
              email: client.email,
              limit: 1
            }
          });
          
          const customers = (searchResult.data as any)?.data || [];
          if (customers.length > 0) {
            stripeCustomer = customers[0];
            console.log('Found existing Stripe customer by email:', stripeCustomer.id);
            
            // Update existing customer with latest info
            await stripeProxy({
              method: 'POST',
              path: `/customers/${stripeCustomer.id}`,
              data: {
                name: client.businessName,
                email: client.email,
                phone: client.phone,
                metadata: {
                  businessClientId: clientId,
                  businessName: client.businessName,
                  contactName: client.contactName || '',
                  abn: client.abn || ''
                },
                address: client.address ? {
                  line1: client.address.street || '',
                  city: client.address.city || '',
                  state: client.address.state || '',
                  postal_code: client.address.zip || '',
                  country: client.address.country || 'AU'
                } : undefined
              }
            });
          }
        } catch (searchError) {
          console.error('Error searching for existing Stripe customer:', searchError);
          // Continue to create new customer if search fails
        }
      }
      
      // If no existing customer found, create a new one
      if (!stripeCustomer) {
        const result = await stripeProxy({
          method: 'POST',
          path: '/customers',
          data: {
            name: client.businessName,
            email: client.email,
            phone: client.phone,
            metadata: {
              businessClientId: clientId,
              businessName: client.businessName,
              contactName: client.contactName || '',
              abn: client.abn || ''
            },
            address: client.address ? {
              line1: client.address.street || '',
              city: client.address.city || '',
              state: client.address.state || '',
              postal_code: client.address.zip || '',
              country: client.address.country || 'AU'
            } : undefined
          }
        });
        
        stripeCustomer = (result.data as any).data || result.data;
        console.log('Created new Stripe customer:', stripeCustomer.id);
      }
      
      // Update client with Stripe customer ID
      await updateDoc(doc(db, COLLECTION_NAME, clientId), {
        stripeCustomerId: stripeCustomer.id,
        stripeLink: `https://dashboard.stripe.com${stripeCustomer.livemode ? '' : '/test'}/customers/${stripeCustomer.id}`,
        updatedAt: serverTimestamp()
      });
    }
  } catch (error) {
    console.error('Error syncing client to Stripe:', error);
    // Don't throw - allow client creation even if Stripe sync fails
  }
};

/**
 * Find potential duplicate clients
 */
export const findDuplicateClients = async (clientData: Partial<BusinessClient>): Promise<BusinessClient[]> => {
  try {
    const clientsRef = collection(db, COLLECTION_NAME);
    const duplicates: BusinessClient[] = [];
    
    // Search by email
    if (clientData.email) {
      const emailQuery = query(
        clientsRef,
        where('email', '==', clientData.email.toLowerCase().trim())
      );
      const emailSnapshot = await getDocs(emailQuery);
      emailSnapshot.docs.forEach(doc => {
        const client = { id: doc.id, ...doc.data() } as BusinessClient;
        if (!duplicates.find(d => d.id === client.id)) {
          duplicates.push(client);
        }
      });
    }
    
    // Search by business name (fuzzy match)
    if (clientData.businessName) {
      const nameQuery = query(clientsRef, orderBy('businessName'));
      const nameSnapshot = await getDocs(nameQuery);
      const searchName = clientData.businessName.toLowerCase().trim();
      
      nameSnapshot.docs.forEach(doc => {
        const client = { id: doc.id, ...doc.data() } as BusinessClient;
        const clientName = (client.businessName || '').toLowerCase().trim();
        
        // Check for similar names
        if (
          clientName === searchName ||
          clientName.includes(searchName) ||
          searchName.includes(clientName) ||
          (clientName.split(' ').some(word => word.length > 3 && searchName.includes(word))) ||
          (searchName.split(' ').some(word => word.length > 3 && clientName.includes(word)))
        ) {
          if (!duplicates.find(d => d.id === client.id)) {
            duplicates.push(client);
          }
        }
      });
    }
    
    // Search by phone
    if (clientData.phone) {
      const phoneQuery = query(
        clientsRef,
        where('phone', '==', clientData.phone.replace(/\s+/g, ''))
      );
      const phoneSnapshot = await getDocs(phoneQuery);
      phoneSnapshot.docs.forEach(doc => {
        const client = { id: doc.id, ...doc.data() } as BusinessClient;
        if (!duplicates.find(d => d.id === client.id)) {
          duplicates.push(client);
        }
      });
    }
    
    // Search by ABN
    if (clientData.abn) {
      const abnQuery = query(
        clientsRef,
        where('abn', '==', clientData.abn.replace(/\s+/g, ''))
      );
      const abnSnapshot = await getDocs(abnQuery);
      abnSnapshot.docs.forEach(doc => {
        const client = { id: doc.id, ...doc.data() } as BusinessClient;
        if (!duplicates.find(d => d.id === client.id)) {
          duplicates.push(client);
        }
      });
    }
    
    return duplicates;
  } catch (error) {
    console.error('Error finding duplicate clients:', error);
    return [];
  }
};

/**
 * Merge multiple clients into one
 */
export const mergeClients = async (
  primaryClientId: string,
  mergeClientIds: string[]
): Promise<void> => {
  try {
    const batch = writeBatch(db);
    const primaryClient = await getBusinessClient(primaryClientId);
    
    if (!primaryClient) {
      throw new Error('Primary client not found');
    }
    
    const mergedFrom: string[] = [...(primaryClient.mergedFrom || [])];
    const mergedData: Partial<BusinessClient> = {};
    
    // Collect data from clients to merge
    for (const mergeId of mergeClientIds) {
      const mergeClient = await getBusinessClient(mergeId);
      if (!mergeClient) continue;
      
      mergedFrom.push(mergeId);
      
      // Merge data (primary takes precedence, but fill in missing fields)
      if (!mergedData.contactName && mergeClient.contactName) {
        mergedData.contactName = mergeClient.contactName;
      }
      if (!mergedData.phone && mergeClient.phone) {
        mergedData.phone = mergeClient.phone;
      }
      if (!mergedData.address && mergeClient.address) {
        mergedData.address = mergeClient.address;
      }
      if (!mergedData.abn && mergeClient.abn) {
        mergedData.abn = mergeClient.abn;
      }
      if (!mergedData.website && mergeClient.website) {
        mergedData.website = mergeClient.website;
      }
      if (!mergedData.industry && mergeClient.industry) {
        mergedData.industry = mergeClient.industry;
      }
      if (!mergedData.notes && mergeClient.notes) {
        mergedData.notes = mergeClient.notes;
      } else if (mergeClient.notes) {
        mergedData.notes = `${mergedData.notes}\n\n--- Merged from ${mergeClient.businessName} ---\n${mergeClient.notes}`;
      }
      
      // Mark merged client as merged
      const mergeRef = doc(db, COLLECTION_NAME, mergeId);
      batch.update(mergeRef, {
        mergedInto: primaryClientId,
        isActive: false,
        updatedAt: serverTimestamp()
      });
    }
    
    // Update primary client with merged data
    const primaryRef = doc(db, COLLECTION_NAME, primaryClientId);
    batch.update(primaryRef, {
      ...mergedData,
      mergedFrom,
      updatedAt: serverTimestamp()
    });
    
    await batch.commit();
    
    // Sync merged client to Stripe
    const updatedClient = await getBusinessClient(primaryClientId);
    if (updatedClient) {
      await syncClientToStripe(primaryClientId, updatedClient);
    }
  } catch (error) {
    console.error('Error merging clients:', error);
    throw error;
  }
};







