import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

// Placeholder messages data
const placeholderMessages = {
  '1': [
    { id: 'msg1', text: 'Hello!', sender: 'John Doe', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() },
    { id: 'msg2', text: 'Hi there!', sender: 'Me', timestamp: new Date(Date.now() - 1000 * 60 * 55 * 2).toISOString() },
  ],
  '2': [
    { id: 'msg3', text: 'How are you?', sender: 'Jane Smith', timestamp: new Date(Date.now() - 1000 * 60 * 30 * 2).toISOString() },
    { id: 'msg4', text: 'Doing great! Thanks.', sender: 'Me', timestamp: new Date(Date.now() - 1000 * 60 * 25 * 2).toISOString() },
  ],
};

const ConversationScreen = ({ route }) => {
  const { chatId } = route.params;
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');

  useEffect(() => {
    // Load messages for the current chatId
    // In a real app, you would fetch this from Firebase
    setMessages(placeholderMessages[chatId] || []);
  }, [chatId]);

  const handleSend = () => {
    if (inputText.trim().length > 0) {
      const newMessage = {
        id: `msg${Date.now()}`, // temporary unique ID
        text: inputText.trim(),
        sender: 'Me', // Assuming the sender is always 'Me' for now
        timestamp: new Date().toISOString(),
      };
      setMessages((prevMessages) => [...prevMessages, newMessage]);
      setInputText('');
      // In a real app, you would send this message to Firebase here
    }
  };

  const renderMessageItem = ({ item }) => (
    <View style={[
      styles.messageBubble,
      item.sender === 'Me' ? styles.myMessage : styles.otherMessage,
    ]}>
      <Text style={styles.messageText}>{item.text}</Text>
      <Text style={styles.messageTimestamp}>
        {new Date(item.timestamp).toLocaleTimeString()}
      </Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0} // Adjust as needed
    >
      <FlatList
        data={messages}
        renderItem={renderMessageItem}
        keyExtractor={(item) => item.id}
        style={styles.messagesList}
        inverted // To show latest messages at the bottom
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type a message..."
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f8',
  },
  messagesList: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  messageBubble: {
    padding: 10,
    borderRadius: 15,
    marginVertical: 5,
    maxWidth: '80%',
  },
  myMessage: {
    backgroundColor: '#dcf8c6',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 0,
  },
  otherMessage: {
    backgroundColor: '#fff',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 0,
  },
  messageText: {
    fontSize: 16,
  },
  messageTimestamp: {
    fontSize: 10,
    color: '#888',
    alignSelf: 'flex-end',
    marginTop: 2,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    backgroundColor: '#fff',
  },
  textInput: {
    flex: 1,
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 15,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default ConversationScreen;
