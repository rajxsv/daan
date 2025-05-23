import {
  getFirestore,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  onSnapshot,
  doc,
  setDoc,
  updateDoc,
  serverTimestamp,
  orderBy,
  arrayContains,
} from 'firebase/firestore';
import { db } from '../../firebaseConfig'; // Adjust path as necessary

// --- Chat Management Functions ---

/**
 * Creates a new chat between two users for a specific product if it doesn't already exist.
 * If a chat already exists, returns the existing chatId.
 *
 * @param {string} userId1 - The ID of the first user.
 * @param {string} userId2 - The ID of the second user (e.g., the product owner).
 * @param {string} productId - The ID of the product related to the chat.
 * @returns {Promise<string|null>} The chatId of the existing or newly created chat, or null on error.
 */
export const createChat = async (userId1, userId2, productId) => {
  if (!userId1 || !userId2 || !productId) {
    console.error("User IDs and Product ID must be provided.");
    return null;
  }

  const chatsRef = collection(db, 'chats');

  // Normalize user IDs to ensure query consistency regardless of order
  const userIds = [userId1, userId2].sort();

  // Query for existing chat:
  // Option 1: Check for exact match of users array and productId
  // This is more precise if the order of users in the array matters for your specific logic,
  // but Firestore array queries for exact array match are tricky.
  // const q = query(chatsRef, where('users', '==', userIds), where('productId', '==', productId));

  // Option 2: Check if 'users' array contains both user IDs and matches productId.
  // This is more flexible if order doesn't matter and is easier to query.
  // However, `array-contains-all` is not a direct Firestore operator.
  // We need to query for one user, then filter locally or perform two array-contains queries.
  // For simplicity and effectiveness, we'll query for chats involving userId1 and productId,
  // then filter for userId2 locally. A more complex query might involve 'users' array-contains userId1
  // AND 'users' array-contains userId2 AND 'productId' == productId.
  // Let's try a query that checks if both users are in the `users` array and the productId matches.
  // Firestore doesn't directly support querying for two specific elements in an array in a specific order
  // or an AND condition on multiple array-contains for the same field in a single query.
  // A common workaround is to store a compound key or query for one user and then filter.

  const q1 = query(chatsRef, 
    where('users', 'array-contains', userId1), 
    where('productId', '==', productId)
  );

  try {
    const querySnapshot = await getDocs(q1);
    let existingChatId = null;

    querySnapshot.forEach((doc) => {
      const chat = doc.data();
      // Ensure the other user is also in this chat
      if (chat.users.includes(userId2)) {
        existingChatId = doc.id;
      }
    });

    if (existingChatId) {
      console.log('Existing chat found:', existingChatId);
      return existingChatId;
    }

    // If no chat exists, create a new one
    console.log('No existing chat found, creating new chat...');
    const newChatRef = await addDoc(chatsRef, {
      users: userIds, // Store sorted user IDs
      productId: productId,
      createdAt: serverTimestamp(),
      lastMessage: null, // Or an initial message object
      lastMessageTimestamp: null,
    });
    console.log('New chat created with ID:', newChatRef.id);
    return newChatRef.id;
  } catch (error) {
    console.error('Error creating or finding chat:', error);
    return null;
  }
};

/**
 * Sends a message in a specific chat and updates the chat's last message.
 *
 * @param {string} chatId - The ID of the chat.
 * @param {string} messageText - The text content of the message.
 * @param {string} senderId - The ID of the user sending the message.
 * @returns {Promise<void>}
 */
export const sendMessage = async (chatId, messageText, senderId) => {
  if (!chatId || !messageText || !senderId) {
    console.error("Chat ID, message text, and sender ID must be provided.");
    return;
  }
  try {
    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const newMessage = {
      text: messageText,
      senderId: senderId,
      timestamp: serverTimestamp(),
    };
    await addDoc(messagesRef, newMessage);

    // Update the last message in the chat document
    const chatRef = doc(db, 'chats', chatId);
    await updateDoc(chatRef, {
      lastMessage: messageText, // Storing the text of the last message
      lastMessageTimestamp: serverTimestamp(), // Storing the timestamp of the last message
      lastMessageSenderId: senderId, // Optionally store who sent the last message
    });
    console.log('Message sent and chat updated.');
  } catch (error) {
    console.error('Error sending message:', error);
  }
};

/**
 * Fetches all chats for a given userId in real-time.
 *
 * @param {string} userId - The ID of the user.
 * @param {function(Array<object>)} callback - Function to call with the array of chat objects.
 * @returns {function} Unsubscribe function for the Firestore listener.
 */
export const getUserChats = (userId, callback) => {
  if (!userId) {
    console.error("User ID must be provided.");
    return () => {}; // Return a no-op unsubscribe function
  }
  const chatsRef = collection(db, 'chats');
  const q = query(chatsRef, where('users', 'array-contains', userId), orderBy('lastMessageTimestamp', 'desc'));

  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const chats = [];
    querySnapshot.forEach((doc) => {
      chats.push({ id: doc.id, ...doc.data() });
    });
    callback(chats);
  }, (error) => {
    console.error('Error fetching user chats:', error);
    callback([]); // Send empty array on error
  });

  return unsubscribe; // Return the unsubscribe function
};

/**
 * Fetches all messages for a given chatId in real-time, ordered by timestamp.
 *
 * @param {string} chatId - The ID of the chat.
 * @param {function(Array<object>)} callback - Function to call with the array of message objects.
 * @returns {function} Unsubscribe function for the Firestore listener.
 */
export const getChatMessages = (chatId, callback) => {
  if (!chatId) {
    console.error("Chat ID must be provided.");
    return () => {}; // Return a no-op unsubscribe function
  }
  const messagesRef = collection(db, 'chats', chatId, 'messages');
  const q = query(messagesRef, orderBy('timestamp', 'asc')); // 'asc' for chronological order

  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const messages = [];
    querySnapshot.forEach((doc) => {
      messages.push({ id: doc.id, ...doc.data() });
    });
    callback(messages);
  }, (error) => {
    console.error('Error fetching chat messages:', error);
    callback([]); // Send empty array on error
  });

  return unsubscribe; // Return the unsubscribe function
};
