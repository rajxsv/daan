import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  SafeAreaView,
  StyleSheet,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useUser } from '@clerk/clerk-expo';
import { getFirestore, collection, addDoc, onSnapshot, orderBy, query } from 'firebase/firestore';
import { app } from '../../firebaseConfig';

const ChatScreen = () => {
  const { params } = useRoute();
  const { chatId, otherEmail } = params;
  const { user } = useUser();

  const [messages, setMessages] = useState([]);
  const [text, setText]         = useState('');
  const db                      = getFirestore(app);

  useEffect(() => {
    const q = query(
      collection(db, 'chats', chatId, 'messages'),
      orderBy('sentAt', 'asc')
    );
    const unsubscribe = onSnapshot(q, snapshot => {
      setMessages(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsubscribe;
  }, [chatId]);

  const sendMessage = async () => {
    if (!text.trim()) return;
    await addDoc(collection(db, 'chats', chatId, 'messages'), {
      text,
      sender: user.primaryEmailAddress.emailAddress,
      sentAt: new Date(),
    });
    setText('');
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={messages}
        keyExtractor={m => m.id}
        renderItem={({ item }) => (
          <View
            style={[
              styles.message,
              item.sender === user.primaryEmailAddress.emailAddress
                ? styles.myMessage
                : styles.theirMessage,
            ]}
          >
            <Text>{item.text}</Text>
          </View>
        )}
      />
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Type a message…"
          value={text}
          onChangeText={setText}
        />
        <Button title="Send" onPress={sendMessage} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container:   { flex: 1, padding: 10, backgroundColor: '#fff' },
  message:     { padding: 8, marginVertical: 4, borderRadius: 6, maxWidth: '70%' },
  myMessage:   { alignSelf: 'flex-end', backgroundColor: '#DCF8C6' },
  theirMessage:{ alignSelf: 'flex-start', backgroundColor: '#EEE' },
  inputRow:    { flexDirection: 'row', alignItems: 'center' },
  input:       {
    flex: 1,
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
});

export default ChatScreen;
