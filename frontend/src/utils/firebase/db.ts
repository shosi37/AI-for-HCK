/**
 * @fileoverview Firestore Database API Wrappers.
 * Provides functions for managing chats, FAQs, and administrative queries
 * within the Firebase Firestore database. Features real-time subscriptions.
 */

import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
  writeBatch,
} from 'firebase/firestore';
import { db } from './config';

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  helpful?: boolean | null;
}

export interface Chat {
  id: string;
  title: string;
  timestamp: Date;
  messages: Message[];
  userId: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  createdAt: Date;
}

// ===== CHAT FUNCTIONS =====

/**
 * Saves a new chat or updates an existing chat in the user's subcollection.
 * 
 * @param {string} userId - The user's UID.
 * @param {Chat} chat - The chat object to save.
 * @returns {Promise<void>}
 */
export const saveChat = async (userId: string, chat: Chat): Promise<void> => {
  // Validate inputs - silently return if invalid
  if (!userId || !chat?.id) {
    return;
  }

  try {
    const chatRef = doc(db, 'users', userId, 'chats', chat.id);
    await setDoc(chatRef, {
      ...chat,
      timestamp: Timestamp.fromDate(chat.timestamp),
      messages: chat.messages.map(msg => ({
        ...msg,
        timestamp: Timestamp.fromDate(msg.timestamp),
      })),
    });
  } catch (error) {
    // Silently fail if Firebase is not configured or permission denied
    // This allows the app to work in offline mode
    if ((error as any)?.code !== 'permission-denied') {
      console.error('Save chat error:', error);
    }
  }
};

/**
 * Retrieves all chat histories for a specific user.
 * 
 * @param {string} userId - The user's UID.
 * @returns {Promise<Chat[]>} An array of chat objects.
 */
export const getUserChats = async (userId: string): Promise<Chat[]> => {
  try {
    const chatsRef = collection(db, 'users', userId, 'chats');
    const querySnapshot = await getDocs(chatsRef);

    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        timestamp: data.timestamp?.toDate() || new Date(),
        messages: data.messages?.map((msg: any) => ({
          ...msg,
          timestamp: msg.timestamp?.toDate() || new Date(),
        })) || [],
      } as Chat;
    });
  } catch (error: any) {
    // Only log non-permission errors (permission errors are handled in UI)
    if (error?.code !== 'permission-denied') {
      console.error('Get user chats error:', error);
    }
    return [];
  }
};

/**
 * Retrieves a specific chat document by its ID.
 * 
 * @param {string} userId - The user's UID.
 * @param {string} chatId - The ID of the chat.
 * @returns {Promise<Chat | null>} The chat object, or null if not found.
 */
export const getChat = async (userId: string, chatId: string): Promise<Chat | null> => {
  try {
    const chatRef = doc(db, 'users', userId, 'chats', chatId);
    const chatDoc = await getDoc(chatRef);

    if (!chatDoc.exists()) {
      return null;
    }

    const data = chatDoc.data();
    return {
      ...data,
      id: chatDoc.id,
      timestamp: data.timestamp?.toDate() || new Date(),
      messages: data.messages?.map((msg: any) => ({
        ...msg,
        timestamp: msg.timestamp?.toDate() || new Date(),
      })) || [],
    } as Chat;
  } catch (error) {
    console.error('Get chat error:', error);
    return null;
  }
};

// Update a chat
export const updateChat = async (userId: string, chat: Chat): Promise<void> => {
  try {
    const chatRef = doc(db, 'users', userId, 'chats', chat.id);
    await updateDoc(chatRef, {
      title: chat.title,
      messages: chat.messages.map(msg => ({
        ...msg,
        timestamp: Timestamp.fromDate(msg.timestamp),
      })),
      timestamp: Timestamp.fromDate(chat.timestamp),
    });
  } catch (error) {
    console.error('Update chat error:', error);
    throw error;
  }
};

// Delete a chat
export const deleteChat = async (userId: string, chatId: string): Promise<void> => {
  try {
    const chatRef = doc(db, 'users', userId, 'chats', chatId);
    await deleteDoc(chatRef);
  } catch (error) {
    console.error('Delete chat error:', error);
    throw error;
  }
};

/**
 * Subscribes to real-time updates for a user's chats collection.
 * Useful for updating the sidebar when new chats are created.
 * 
 * @param {string} userId - The user's UID.
 * @param {Function} callback - Function called with the updated array of chats.
 * @param {Function} [errorCallback] - Optional error handler.
 * @returns {Function} An unsubscribe function to detach the listener.
 */
export const subscribeToUserChats = (
  userId: string,
  callback: (chats: Chat[]) => void,
  errorCallback?: (error: any) => void
): (() => void) => {
  if (!userId) {
    // Silently return empty cleanup function if userId is not provided
    return () => {};
  }

  try {
    const chatsRef = collection(db, 'users', userId, 'chats');
    const chatsQuery = query(chatsRef, orderBy('timestamp', 'desc'));

    return onSnapshot(
      chatsQuery,
      (snapshot) => {
        const chats = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            ...data,
            id: doc.id,
            timestamp: data.timestamp?.toDate() || new Date(),
            messages: data.messages?.map((msg: any) => ({
              ...msg,
              timestamp: msg.timestamp?.toDate() || new Date(),
            })) || [],
          } as Chat;
        });
        callback(chats);
      },
      (error) => {
        // Only log non-permission errors
        if (error?.code !== 'permission-denied') {
          console.error('Chat subscription error:', error);
        }
        if (errorCallback) {
          errorCallback(error);
        }
      }
    );
  } catch (error) {
    console.error('Error setting up chat subscription:', error);
    if (errorCallback) {
      errorCallback(error);
    }
    return () => {}; // Return empty cleanup function
  }
};

// ===== FAQ FUNCTIONS =====

// Add FAQ
export const addFAQ = async (faq: Omit<FAQ, 'id' | 'createdAt'>): Promise<string> => {
  try {
    const faqRef = doc(collection(db, 'faqs'));
    const newFAQ: FAQ = {
      ...faq,
      id: faqRef.id,
      createdAt: new Date(),
    };

    await setDoc(faqRef, {
      ...newFAQ,
      createdAt: Timestamp.fromDate(newFAQ.createdAt),
    });

    return faqRef.id;
  } catch (error) {
    console.error('Add FAQ error:', error);
    throw error;
  }
};

// Get all FAQs
export const getAllFAQs = async (): Promise<FAQ[]> => {
  try {
    const faqsRef = collection(db, 'faqs');
    const snapshot = await getDocs(faqsRef);

    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        createdAt: data.createdAt?.toDate() || new Date(),
      } as FAQ;
    });
  } catch (error) {
    console.error('Get FAQs error:', error);
    return [];
  }
};

// Update FAQ
export const updateFAQ = async (faqId: string, updates: Partial<FAQ>): Promise<void> => {
  try {
    const faqRef = doc(db, 'faqs', faqId);
    await updateDoc(faqRef, updates);
  } catch (error) {
    console.error('Update FAQ error:', error);
    throw error;
  }
};

// Delete FAQ
export const deleteFAQ = async (faqId: string): Promise<void> => {
  try {
    const faqRef = doc(db, 'faqs', faqId);
    await deleteDoc(faqRef);
  } catch (error) {
    console.error('Delete FAQ error:', error);
    throw error;
  }
};

// Subscribe to FAQs in real-time
export const subscribeToFAQs = (
  callback: (faqs: FAQ[]) => void,
  errorCallback?: (error: any) => void
): (() => void) => {
  const faqsRef = collection(db, 'faqs');

  return onSnapshot(
    faqsRef,
    (snapshot) => {
      const faqs = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          createdAt: data.createdAt?.toDate() || new Date(),
        } as FAQ;
      });
      callback(faqs);
    },
    (error) => {
      console.error('FAQs subscription error:', error);
      if (errorCallback) {
        errorCallback(error);
      }
    }
  );
};

// Import FAQs (batch)
export const importFAQs = async (faqs: Array<{ question: string; answer: string }>): Promise<void> => {
  try {
    const batch = writeBatch(db);

    faqs.forEach(faq => {
      const faqRef = doc(collection(db, 'faqs'));
      batch.set(faqRef, {
        ...faq,
        id: faqRef.id,
        createdAt: Timestamp.now(),
      });
    });

    await batch.commit();
  } catch (error) {
    console.error('Import FAQs error:', error);
    throw error;
  }
};

// ===== ADMIN FUNCTIONS =====

/**
 * Retrieves all users from Firestore (Admin only).
 * 
 * @returns {Promise<any[]>} An array of all user documents.
 */
export const getAllUsers = async (): Promise<any[]> => {
  try {
    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);

    return snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
    }));
  } catch (error) {
    console.error('Get all users error:', error);
    return [];
  }
};

// Subscribe to all users in real-time
export const subscribeToAllUsers = (
  callback: (users: any[]) => void,
  errorCallback?: (error: any) => void
): (() => void) => {
  const usersRef = collection(db, 'users');

  return onSnapshot(
    usersRef,
    (snapshot) => {
      const users = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
      }));
      callback(users);
    },
    (error) => {
      console.error('Users subscription error:', error);
      if (errorCallback) {
        errorCallback(error);
      }
    }
  );
};

// Delete user and all their chats
export const deleteUser = async (userId: string): Promise<void> => {
  try {
    // Delete all user chats
    const chatsRef = collection(db, 'users', userId, 'chats');
    const chatsSnapshot = await getDocs(chatsRef);
    
    const batch = writeBatch(db);
    chatsSnapshot.docs.forEach(chatDoc => {
      batch.delete(chatDoc.ref);
    });

    // Delete user document
    batch.delete(doc(db, 'users', userId));

    await batch.commit();
  } catch (error) {
    console.error('Delete user error:', error);
    throw error;
  }
};

/**
 * Retrieves global analytics data for the admin dashboard.
 * Aggregates user counts, total chats, messages, and feedback metrics.
 * 
 * @returns {Promise<Object>} The aggregated analytics data.
 */
export const getAnalyticsData = async () => {
  try {
    const users = await getAllUsers();
    
    let totalChats = 0;
    let totalMessages = 0;
    let helpfulCount = 0;
    let notHelpfulCount = 0;

    for (const user of users) {
      const chats = await getUserChats(user.id);
      totalChats += chats.length;

      chats.forEach(chat => {
        totalMessages += chat.messages.length;
        chat.messages.forEach(msg => {
          if (msg.helpful === true) helpfulCount++;
          if (msg.helpful === false) notHelpfulCount++;
        });
      });
    }

    return {
      totalUsers: users.length,
      totalChats,
      totalMessages,
      feedback: {
        helpful: helpfulCount,
        notHelpful: notHelpfulCount,
      },
    };
  } catch (error) {
    console.error('Get analytics error:', error);
    return {
      totalUsers: 0,
      totalChats: 0,
      totalMessages: 0,
      feedback: { helpful: 0, notHelpful: 0 },
    };
  }
};