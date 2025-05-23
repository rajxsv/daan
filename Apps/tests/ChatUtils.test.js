// __tests__/ChatUtils.test.js

// Mock Firebase Firestore services
// We are manually mocking the Firestore functions that ChatUtils.js uses.
// This allows us to test the logic of ChatUtils.js without making actual Firestore calls.

// Mocking the entire 'firebase/firestore' module
jest.mock('firebase/firestore', () => {
  const originalModule = jest.requireActual('firebase/firestore');
  return {
    ...originalModule, // Keep original constants like serverTimestamp if not directly mocked
    collection: jest.fn(),
    addDoc: jest.fn(),
    getDocs: jest.fn(),
    onSnapshot: jest.fn((query, callback) => {
      // Default mock for onSnapshot: immediately invoke callback with empty snapshot
      // Tests can override this behavior as needed.
      callback({ docs: [], empty: true, forEach: (cb) => {} });
      return jest.fn(); // Return an unsubscribe function
    }),
    doc: jest.fn(),
    updateDoc: jest.fn(),
    query: jest.fn(),
    where: jest.fn(),
    orderBy: jest.fn(),
    serverTimestamp: jest.fn(() => ({ type: 'timestamp', value: new Date().toISOString() })), // Mock serverTimestamp
    arrayContains: jest.fn(), // Though not directly used by ChatUtils, good to have if logic changes
  };
});

// Mock the db instance from firebaseConfig.js
jest.mock('../../firebaseConfig', () => ({
  db: {
    // This mock db object can be empty or contain properties if ChatUtils directly uses them,
    // but ChatUtils imports functions from 'firebase/firestore' and passes db to them.
  },
}));

// Import the functions to test after setting up mocks
const {
  createChat,
  sendMessage,
  getUserChats,
  getChatMessages,
} = require('../utils/ChatUtils'); // Adjust path as necessary

// Import the mocked functions to allow asserting calls, etc.
const {
  collection,
  addDoc,
  getDocs,
  onSnapshot,
  doc,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} = require('firebase/firestore');


describe('ChatUtils', () => {
  beforeEach(() => {
    // Reset mocks before each test to ensure test isolation
    jest.clearAllMocks();

    // Default mock for query processing - just returns the query object itself
    query.mockImplementation((ref, ...constraints) => ({ ref, constraints }));
    collection.mockImplementation((db, path) => ({ path }));
    doc.mockImplementation((db, path, id) => ({ path, id }));
  });

  describe('createChat', () => {
    it('should create a new chat if one does not exist', async () => {
      // Mock getDocs to return an empty snapshot (no existing chat)
      getDocs.mockResolvedValue({ empty: true, docs: [], forEach: (cb) => {} });
      // Mock addDoc to return a reference with an ID for the new chat
      const newChatId = 'newChat123';
      addDoc.mockResolvedValue({ id: newChatId });

      const userId1 = 'userA';
      const userId2 = 'userB';
      const productId = 'productX';

      const chatId = await createChat(userId1, userId2, productId);

      expect(getDocs).toHaveBeenCalledTimes(1); // Query for existing chat
      expect(addDoc).toHaveBeenCalledTimes(1); // Create new chat
      expect(addDoc).toHaveBeenCalledWith(
        { path: 'chats' }, // collection(db, 'chats')
        {
          users: [userId1, userId2].sort(), // Expect sorted user IDs
          productId: productId,
          createdAt: serverTimestamp(),
          lastMessage: null,
          lastMessageTimestamp: null,
        }
      );
      expect(chatId).toBe(newChatId);
    });

    it('should return existing chat ID if a chat already exists', async () => {
      const existingChatId = 'existingChat456';
      // Mock getDocs to return a snapshot with one existing chat
      const mockChatDoc = {
        id: existingChatId,
        data: () => ({
          users: ['userA', 'userB'].sort(),
          productId: 'productX',
        }),
      };
      getDocs.mockResolvedValue({
        empty: false,
        docs: [mockChatDoc],
        forEach: (cb) => [mockChatDoc].forEach(cb),
      });

      const userId1 = 'userA';
      const userId2 = 'userB';
      const productId = 'productX';

      const chatId = await createChat(userId1, userId2, productId);

      expect(getDocs).toHaveBeenCalledTimes(1);
      expect(addDoc).not.toHaveBeenCalled(); // Should not create new chat
      expect(chatId).toBe(existingChatId);
    });
    
    it('should return null if user IDs or product ID are missing', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      expect(await createChat(null, 'userB', 'productX')).toBeNull();
      expect(await createChat('userA', null, 'productX')).toBeNull();
      expect(await createChat('userA', 'userB', null)).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalledTimes(3);
      consoleErrorSpy.mockRestore();
    });
  });

  describe('sendMessage', () => {
    it('should add a message and update the chat document', async () => {
      const chatId = 'chat123';
      const messageText = 'Hello there!';
      const senderId = 'userA';

      // Mock addDoc and updateDoc to resolve successfully
      addDoc.mockResolvedValue({ id: 'messageId123' });
      updateDoc.mockResolvedValue(undefined);

      await sendMessage(chatId, messageText, senderId);

      // Check addDoc for new message
      expect(addDoc).toHaveBeenCalledTimes(1);
      expect(addDoc).toHaveBeenCalledWith(
        { path: `chats/${chatId}/messages`}, // collection(db, 'chats', chatId, 'messages')
        {
          text: messageText,
          senderId: senderId,
          timestamp: serverTimestamp(),
        }
      );

      // Check updateDoc for chat's last message
      expect(updateDoc).toHaveBeenCalledTimes(1);
      expect(updateDoc).toHaveBeenCalledWith(
        { path: 'chats', id: chatId }, // doc(db, 'chats', chatId)
        {
          lastMessage: messageText,
          lastMessageTimestamp: serverTimestamp(),
          lastMessageSenderId: senderId,
        }
      );
    });

    it('should not proceed if chatId, messageText, or senderId is missing', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      await sendMessage(null, "text", "sender");
      await sendMessage("chatId", null, "sender");
      await sendMessage("chatId", "text", null);
      expect(addDoc).not.toHaveBeenCalled();
      expect(updateDoc).not.toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledTimes(3);
      consoleErrorSpy.mockRestore();
    });
  });

  describe('getUserChats', () => {
    it('should call the callback with user chats and return an unsubscribe function', () => {
      const userId = 'userTest1';
      const mockChats = [
        { id: 'chat1', users: [userId, 'userB'], lastMessage: 'Hi' },
        { id: 'chat2', users: [userId, 'userC'], lastMessage: 'Hello' },
      ];
      const mockCallback = jest.fn();
      const mockUnsubscribe = jest.fn();

      // Override onSnapshot for this test
      onSnapshot.mockImplementation((q, callback) => {
        // Simulate Firestore returning data
        callback({
          docs: mockChats.map(chat => ({ id: chat.id, data: () => chat })),
          forEach: (cb) => mockChats.map(chat => ({ id: chat.id, data: () => chat })).forEach(cb)
        });
        return mockUnsubscribe; // Return our mock unsubscribe function
      });

      const unsubscribe = getUserChats(userId, mockCallback);

      expect(onSnapshot).toHaveBeenCalledTimes(1);
      // Verify query constraints if necessary: where('users', 'array-contains', userId), orderBy('lastMessageTimestamp', 'desc')
      expect(query).toHaveBeenCalledWith(
          expect.anything(), // The collection ref
          where('users', 'array-contains', userId),
          orderBy('lastMessageTimestamp', 'desc')
      );
      expect(mockCallback).toHaveBeenCalledWith(mockChats);
      expect(unsubscribe).toBe(mockUnsubscribe);
    });

    it('should return a no-op unsubscribe if userId is missing', () => {
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        const cb = jest.fn();
        const unsubscribe = getUserChats(null, cb);
        unsubscribe(); // Call to ensure it doesn't throw
        expect(onSnapshot).not.toHaveBeenCalled();
        expect(cb).not.toHaveBeenCalled();
        expect(consoleErrorSpy).toHaveBeenCalled();
        consoleErrorSpy.mockRestore();
    });
  });

  describe('getChatMessages', () => {
    it('should call the callback with chat messages and return an unsubscribe function', () => {
      const chatId = 'chatTest1';
      const mockMessages = [
        { id: 'msg1', text: 'Message 1', timestamp: new Date() },
        { id: 'msg2', text: 'Message 2', timestamp: new Date() },
      ];
      const mockCallback = jest.fn();
      const mockUnsubscribe = jest.fn();

      onSnapshot.mockImplementation((q, callback) => {
        callback({
          docs: mockMessages.map(msg => ({ id: msg.id, data: () => msg })),
          forEach: (cb) => mockMessages.map(msg => ({ id: msg.id, data: () => msg })).forEach(cb)
        });
        return mockUnsubscribe;
      });

      const unsubscribe = getChatMessages(chatId, mockCallback);

      expect(onSnapshot).toHaveBeenCalledTimes(1);
      // Verify query constraints: orderBy('timestamp', 'asc')
      expect(query).toHaveBeenCalledWith(
        expect.anything(), // The collection ref for messages
        orderBy('timestamp', 'asc')
      );
      expect(mockCallback).toHaveBeenCalledWith(mockMessages);
      expect(unsubscribe).toBe(mockUnsubscribe);
    });

     it('should return a no-op unsubscribe if chatId is missing', () => {
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        const cb = jest.fn();
        const unsubscribe = getChatMessages(null, cb);
        unsubscribe(); 
        expect(onSnapshot).not.toHaveBeenCalled();
        expect(cb).not.toHaveBeenCalled();
        expect(consoleErrorSpy).toHaveBeenCalled();
        consoleErrorSpy.mockRestore();
    });
  });
});

// Note on testing limitations:
// These tests mock the Firestore SDK. They verify that ChatUtils functions call the
// Firestore SDK functions with the correct parameters and handle the mocked responses
// as expected. They do not test the actual interaction with a live Firebase database,
// security rules, or network issues. For that, integration tests with a test Firebase
// project or emulator (like @firebase/rules-unit-testing) would be necessary.
// The serverTimestamp() is also mocked to return a fixed value for predictability.
// The onSnapshot mock is simplified to call the callback once, synchronously.
// In a real scenario, onSnapshot can trigger multiple times.
