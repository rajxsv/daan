import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, StyleSheet, SafeAreaView, TouchableOpacity, FlatList } from 'react-native';
import { app } from '../../firebaseConfig'; // Ensure firebaseConfig.js is correctly set up
import { 
  getFirestore, 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot, // Import onSnapshot
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';

const ChatScreen = ({ route }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  // Retrieve posterId from route params, default to 'Unknown User' if not found
  const { userId: posterId } = route.params || { userId: 'Unknown User' }; 

  // Placeholder for the current user's ID - replace with actual authenticated user ID
  const CURRENT_USER_ID_PLACEHOLDER = 'CURRENT_USER_ID_PLACEHOLDER'; 

  const db = getFirestore(app);

  // Function to generate a unique chat room ID
  const getChatRoomId = (userId1, userId2) => {
    const ids = [userId1, userId2].sort();
    return ids.join('_');
  };

  const chatRoomId = getChatRoomId(CURRENT_USER_ID_PLACEHOLDER, posterId);

  // Listen for messages from Firestore in real-time
  useEffect(() => {
    if (!chatRoomId) return;

    const messagesRef = collection(db, 'chats', chatRoomId, 'messages');
    const q = query(messagesRef, orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedMessages = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // Convert Firestore Timestamp to JS Date for easier handling
        createdAt: doc.data().createdAt instanceof Timestamp ? doc.data().createdAt.toDate() : new Date(),
      }));
      setMessages(fetchedMessages);
    }, (error) => {
      console.error("Error listening to messages: ", error);
      // Optionally, set an error state here to inform the user
    });

    // Cleanup: Unsubscribe from the listener when the component unmounts
    return () => unsubscribe();
  }, [chatRoomId, db]); // Rerun if chatRoomId or db changes

  const handleSend = async () => {
    if (message.trim() === '' || !chatRoomId) return;

    const messagesRef = collection(db, 'chats', chatRoomId, 'messages');
    try {
      await addDoc(messagesRef, {
        text: message.trim(),
        senderId: CURRENT_USER_ID_PLACEHOLDER,
        createdAt: serverTimestamp(),
      });
      setMessage('');
      // Optionally, re-fetch messages or update state optimistically
      // For simplicity, we'll rely on a pull-to-refresh or next fetch for now
      // To see the message immediately, you could add the new message to the 'messages' state
    } catch (error) {
      console.error("Error sending message: ", error);
    }
  };

  const renderMessageItem = ({ item }) => {
    const isCurrentUser = item.senderId === CURRENT_USER_ID_PLACEHOLDER;
    return (
      <View 
        style={[
          styles.messageBubble, 
          isCurrentUser ? styles.currentUserBubble : styles.otherUserBubble
        ]}
      >
        <Text style={styles.messageText}>{item.text}</Text>
        {item.createdAt && <Text style={styles.messageTime}>{new Date(item.createdAt).toLocaleTimeString()}</Text>}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Chat with User ID: {posterId}</Text>
      </View>
      <FlatList
        data={messages}
        renderItem={renderMessageItem}
        keyExtractor={item => item.id}
        style={styles.messagesContainer}
        contentContainerStyle={{ paddingBottom: 10 }}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={message}
          onChangeText={setMessage}
          placeholder="Type your message..."
          placeholderTextColor="#999"
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  header: {
    padding: 15,
    backgroundColor: '#6200ee',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 10,
    paddingTop: 10,
  },
  messageBubble: {
    padding: 10,
    borderRadius: 15,
    marginBottom: 10,
    maxWidth: '80%',
  },
  currentUserBubble: {
    backgroundColor: '#dcf8c6',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 0,
  },
  otherUserBubble: {
    backgroundColor: '#ffffff',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 0,
    borderColor: '#e0e0e0',
    borderWidth: 1,
  },
  messageText: {
    fontSize: 16,
  },
  messageTime: {
    fontSize: 10,
    color: '#777',
    alignSelf: 'flex-end',
    marginTop: 2,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#cccccc',
    backgroundColor: '#ffffff',
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: '#dddddd',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 15,
    marginRight: 10,
    backgroundColor: '#f9f9f9',
  },
  sendButton: {
    backgroundColor: '#6200ee',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ChatScreen;
