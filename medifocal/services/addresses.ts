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
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '../firebase/config';

export interface Address {
  id?: string;
  userId: string;
  label?: string; // e.g., "Home", "Work", "Practice"
  firstName: string;
  lastName: string;
  company?: string;
  street: string;
  street2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone?: string;
  isDefault?: boolean;
  createdAt?: Timestamp | Date;
  updatedAt?: Timestamp | Date;
}

const COLLECTION_NAME = 'userAddresses';

/**
 * Get all addresses for a user
 */
export const getUserAddresses = async (userId: string): Promise<Address[]> => {
  try {
    const addressesRef = collection(db, COLLECTION_NAME);
    const q = query(
      addressesRef,
      where('userId', '==', userId),
      orderBy('isDefault', 'desc'),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Address));
  } catch (error) {
    console.error('Error fetching user addresses:', error);
    return [];
  }
};

/**
 * Get a single address by ID
 */
export const getAddress = async (addressId: string): Promise<Address | null> => {
  try {
    const addressRef = doc(db, COLLECTION_NAME, addressId);
    const snapshot = await getDoc(addressRef);
    
    if (snapshot.exists()) {
      return {
        id: snapshot.id,
        ...snapshot.data()
      } as Address;
    }
    return null;
  } catch (error) {
    console.error('Error fetching address:', error);
    return null;
  }
};

/**
 * Create a new address
 */
export const createAddress = async (addressData: Omit<Address, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  try {
    const addressesRef = collection(db, COLLECTION_NAME);
    
    // If this is set as default, unset all other defaults for this user
    if (addressData.isDefault) {
      await unsetDefaultAddresses(addressData.userId);
    }
    
    const newAddress = {
      ...addressData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(addressesRef, newAddress);
    return docRef.id;
  } catch (error) {
    console.error('Error creating address:', error);
    throw error;
  }
};

/**
 * Update an address
 */
export const updateAddress = async (
  addressId: string,
  addressData: Partial<Address>
): Promise<void> => {
  try {
    const addressRef = doc(db, COLLECTION_NAME, addressId);
    const currentAddress = await getAddress(addressId);
    
    if (!currentAddress) {
      throw new Error('Address not found');
    }
    
    // If this is set as default, unset all other defaults for this user
    if (addressData.isDefault && !currentAddress.isDefault) {
      await unsetDefaultAddresses(currentAddress.userId);
    }
    
    const updateData = {
      ...addressData,
      updatedAt: serverTimestamp()
    };
    delete updateData.id; // Don't update the ID
    
    await updateDoc(addressRef, updateData);
  } catch (error) {
    console.error('Error updating address:', error);
    throw error;
  }
};

/**
 * Delete an address
 */
export const deleteAddress = async (addressId: string): Promise<void> => {
  try {
    const addressRef = doc(db, COLLECTION_NAME, addressId);
    await deleteDoc(addressRef);
  } catch (error) {
    console.error('Error deleting address:', error);
    throw error;
  }
};

/**
 * Set an address as default (unset all others for this user)
 */
export const setDefaultAddress = async (addressId: string, userId: string): Promise<void> => {
  try {
    await unsetDefaultAddresses(userId);
    const addressRef = doc(db, COLLECTION_NAME, addressId);
    await updateDoc(addressRef, {
      isDefault: true,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error setting default address:', error);
    throw error;
  }
};

/**
 * Unset all default addresses for a user
 */
const unsetDefaultAddresses = async (userId: string): Promise<void> => {
  try {
    const addresses = await getUserAddresses(userId);
    const defaultAddresses = addresses.filter(addr => addr.isDefault && addr.id);
    
    if (defaultAddresses.length > 0) {
      const updates = defaultAddresses.map(addr =>
        updateDoc(doc(db, COLLECTION_NAME, addr.id!), {
          isDefault: false,
          updatedAt: serverTimestamp()
        })
      );
      await Promise.all(updates);
    }
  } catch (error) {
    console.error('Error unsetting default addresses:', error);
    throw error;
  }
};







