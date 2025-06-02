import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useUser } from '@clerk/clerk-expo';
import { app } from '../../firebaseConfig';
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore';

const ChatListScreen = () => {
  const navigation = useNavigation();
  const { user } = useUser();
  const [chatRooms, setChatRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  const db = getFirestore(app);

  useEffect(() => {
    const fetchChatRooms = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);
      const me = user.primaryEmailAddress.emailAddress;
      const q = query(
        collection(db, 'chats'),
        where('participantIds', 'array-contains', me)
      );

      try {
        const snap = await getDocs(q);
        const rooms = snap.docs.map(doc => {
          const data = doc.data();
          const other = data.participantIds.find(e => e !== me);
          return {
            id:            doc.id,
            otherEmail:    other,
            lastMessage:   data.lastMessage,
            lastMessageAt: data.lastMessageTime.toDate?.() || data.lastMessageTime
          };
        });
        setChatRooms(rooms);
      } catch (err) {
        console.error('Error fetching chat rooms:', err);
      }

      setLoading(false);
    };

    fetchChatRooms();
  }, [user]);

  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color="#6200ee" />
        <Text>Loading chats...</Text>
      </SafeAreaView>
    );
  }

  if (!chatRooms.length) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.infoText}>No chats found.</Text>
        <Text style={styles.subInfoText}>
          Start a new conversation to see it here.
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={chatRooms}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.chatItem}
            onPress={() =>
              navigation.navigate('home-nav', {
                screen: 'ChatScreen',
                params: { chatId: item.id, otherEmail: item.otherEmail },
              })
            }
          >
            <Text style={styles.userName}>
              Chat with: {item.otherEmail}
            </Text>
            <Text style={styles.arrow}>&gt;</Text>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f7f7' },
  centered:  {
    flex: 1, justifyContent: 'center',
    alignItems: 'center', padding: 20
  },
  chatItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#fff'
  },
  userName: { fontSize: 17, fontWeight: '500', color: '#333' },
  arrow:    { fontSize: 20, color: '#6200ee' },
  infoText:    { fontSize: 18, color: '#555', marginBottom: 5 },
  subInfoText: { fontSize: 14, color: '#777' },
});

export default ChatListScreen;
