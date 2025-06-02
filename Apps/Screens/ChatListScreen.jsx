import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useUser } from '@clerk/clerk-expo'; // Import useUser
import { app } from '../../firebaseConfig'; // Ensure firebaseConfig.js is correctly set up
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';

const ChatListScreen = () => {
  const navigation = useNavigation();
  const { user } = useUser(); // Get the user object from Clerk
  const [chatRooms, setChatRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const db = getFirestore(app);

  useEffect(() => {
    const fetchChatRooms = async () => {
      if (!user || !user.id) { // Check if user and user.id are available
        setIsLoading(false);
        setChatRooms([]); // Clear chat rooms if user is not available
        return;
      }
      setIsLoading(true);
      const currentUserId = user.id; // Use actual user ID

      try {
        const chatsRef = collection(db, 'chats');
        // Query for chat rooms where the participantIds array contains the current user's ID
        const q = query(chatsRef, where('participantIds', 'array-contains', currentUserId));
        
        const querySnapshot = await getDocs(q);
        const rooms = [];
        querySnapshot.forEach(doc => {
          const data = doc.data();
          // Determine the other user's ID
          const otherUserId = data.participantIds.find(id => id !== currentUserId);
          if (otherUserId) { // Ensure there is an other user
            rooms.push({
              id: doc.id, // Firestore document ID, which is the chatRoomId
              ...data,
              otherUserId: otherUserId,
            });
          }
        });
        setChatRooms(rooms);
      } catch (error) {
        console.error("Error fetching chat rooms: ", error);
        // Handle error (e.g., show a message to the user)
      }
      setIsLoading(false);
    };

    fetchChatRooms();
  }, [db, user]); // Rerun if db instance or user changes

  const handlePressChat = (otherUserId) => {
    // Navigate to ChatScreen, passing the other user's ID as userId
    navigation.navigate('ChatScreen', { userId: otherUserId });
  };

  if (!user) {
    // User is not loaded yet or not signed in.
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color="#6200ee" />
        <Text>Loading user data...</Text>
      </SafeAreaView>
    );
  }
  
  if (isLoading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color="#6200ee" />
        <Text>Loading chats...</Text>
      </SafeAreaView>
    );
  }

  if (chatRooms.length === 0) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.infoText}>No chats found.</Text>
        <Text style={styles.subInfoText}>Start a new conversation to see it here.</Text>
        {!user.id && <Text style={styles.subInfoText}>Make sure you are signed in.</Text>}
      </SafeAreaView>
    );
  }

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.chatItem} 
      onPress={() => handlePressChat(item.otherUserId)}
    >
      <View style={styles.chatInfo}>
        <Text style={styles.userName}>Chat with: {item.otherUserId}</Text>
        {/* Optional: Display last message preview here in the future */}
      </View>
      <Text style={styles.arrow}>&gt;</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Your Chats</Text>
      </View>
      <FlatList
        data={chatRooms}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        style={styles.list}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    paddingVertical: 18,
    paddingHorizontal: 15,
    backgroundColor: '#6200ee',
    alignItems: 'center',
    elevation: 2,
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: { height: 2, width: 0 },
  },
  headerText: {
    fontSize: 22,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  list: {
    flex: 1,
  },
  chatItem: {
    backgroundColor: '#ffffff',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chatInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 17,
    fontWeight: '500',
    color: '#333',
  },
  arrow: {
    fontSize: 20,
    color: '#6200ee',
  },
  infoText: {
    fontSize: 18,
    color: '#555',
    marginBottom: 5,
  },
  subInfoText: {
    fontSize: 14,
    color: '#777',
  }
});

export default ChatListScreen;
