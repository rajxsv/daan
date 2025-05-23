import { View, Text, Image, TouchableOpacity, FlatList } from "react-native";
import React, { useEffect, useState } from "react";
import { useRoute, useNavigation } from "@react-navigation/native"; // Import useNavigation

const ProductDetail = () => {
  const { params } = useRoute();
  const [product, setProduct] = useState([]);
  const navigation = useNavigation(); // Get navigation object

  useEffect(() => {
    params && setProduct(params.product);
    // Ensure product has an id, if not, this is a placeholder for where you might fetch it or assign one
    if (params && params.product && !params.product.id) {
      // console.warn("Product does not have an ID. Using title for chatId generation.");
    }
  }, [params]);

  const navigateToConversation = () => {
    // Use product.id if available, otherwise fallback to product.title
    // A more robust solution would ensure unique IDs for both product and user
    const productId = product.id || product.title; 
    // Assuming product.userEmail is the seller's unique identifier for now
    // In a real app, you might want to use a current user ID from auth state.
    const sellerId = product.userEmail; 
    
    if (!sellerId) {
      console.error("Seller email is not available. Cannot create chatId.");
      // Optionally, show an alert to the user
      return;
    }

    // For simplicity, creating a chatId. This should ideally be managed by a backend or Firebase.
    // Example: "productId_sellerEmail_buyerId" (buyerId could be from auth state)
    // For now, let's use "productId_sellerEmail" as a placeholder
    const chatId = `${productId}_${sellerId}`; 

    navigation.navigate('ConversationScreen', { chatId: chatId });
  };

  const data = [
    { key: 'info' },
    { key: 'user' },
    { key: 'button' }
  ];

  const renderItem = ({ item }) => {
    if (item.key === 'info') {
      return (
        <View className="p-3">
          <Image source={{ uri: product?.image }} className="h-[320px] w-full mb-4" />
          <Text className="text-[24px] font-bold">{product?.title}</Text>
          <View className="items-baseline">
            <Text className="p-1 bg-blue-200 text-blue-500 rounded-full mt-2 px-2">
              {product?.category}
            </Text>
          </View>
          <Text className="mt-3 font-bold text-[20px]">Description</Text>
          <Text className="text-[17px] text-gray-500">{product?.desc}</Text>
        </View>
      );
    }

    if (item.key === 'user') {
      return (
        <View className="p-3 flex flex-row items-center gap-3 bg-blue-100 border-gray-400">
          <Image source={{ uri: product?.userImage }} className="w-12 h-12 rounded-full" />
          <View>
            <Text className="font-bold text-[18px]">{product.userName}</Text>
            <Text className="text-gray-500">{product.userEmail}</Text>
          </View>
        </View>
      );
    }

    if (item.key === 'button') {
      return (
        <TouchableOpacity
          onPress={navigateToConversation} // Updated onPress handler
          className="z-40 bg-blue-500 p-4 m-2 rounded-lg"
        >
          <Text className="text-center text-white">Send Message</Text>
        </TouchableOpacity>
      );
    }
  };

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={item => item.key}
    />
  );
};

export default ProductDetail;
