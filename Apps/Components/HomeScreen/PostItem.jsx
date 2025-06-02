import React from 'react';
import { View, Text, Image, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useUser } from '@clerk/clerk-expo';
import { app } from '../../../firebaseConfig';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';

const PostItem = ({ item }) => {
  const navigation = useNavigation();
  const { user } = useUser();
  const db = getFirestore(app);

  const createOrGetChatRoom = async (posterEmail) => {
    if (!user) {
      Alert.alert('You must be signed in to message.');
      return;
    }

    const myEmail = user.primaryEmailAddress.emailAddress;
    if (!posterEmail) {
      console.error('No poster email on item:', item);
      Alert.alert('Cannot message — user email missing');
      return;
    }

    if (myEmail === posterEmail) {
      Alert.alert('You cannot message yourself!');
      return;
    }

    // Build a deterministic chat‐room ID from the two emails
    const participants = [myEmail, posterEmail].sort();
    const chatRoomId   = participants.join('_');
    const chatRef      = doc(db, 'chats', chatRoomId);

    try {
      const snap = await getDoc(chatRef);
      if (!snap.exists()) {
        // Create a new chat room document
        await setDoc(chatRef, {
          participantIds:      participants,
          createdAt:           new Date(),
          lastMessage:         '',
          lastMessageTime:     new Date(),
        });
      }
      // Navigate to your ChatScreen, passing both chatId and the other party’s email
      navigation.push('ChatScreen', {
        chatId:     chatRoomId,
        otherEmail: posterEmail,
      });
    } catch (err) {
      console.error('Chat room error:', err);
      Alert.alert('Error starting chat. Please try again.');
    }
  };

  return (
    <TouchableOpacity
      onPress={() =>
        navigation.push('product-detail', { product: item })
      }
      className="flex-1 m-2 p-2 rounded-lg border-[1px] border-slate-200"
    >
      <Image source={{ uri: item.image }} className="w-full h-[140px]" />
      <View>
        <Text className="text-[17px] font-bold mt-2">
          {item.title}
        </Text>
        <Text className="text-[20px] font-bold text-blue-500">
          {item.city}
        </Text>
        <Text className="text-blue-500 bg-blue-200 p-[2px] text-center mt-1 rounded-full px-1 text-[10px] w-[70px]">
          {item.category}
        </Text>
      </View>

      {/* Message button now uses userEmail */}
      <TouchableOpacity
        onPress={() => createOrGetChatRoom(item.userEmail)}
        className="mt-2 p-2 bg-purple-500 rounded-full"
      >
        <Text className="text-white text-center">Message Poster</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

export default PostItem;
