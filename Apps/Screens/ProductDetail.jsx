import { View, Text, Image, TouchableOpacity, FlatList } from "react-native";
import React, { useEffect, useState } from "react";
import { useRoute } from "@react-navigation/native";
import * as Linking from 'expo-linking';

const ProductDetail = () => {
  const { params } = useRoute();
  const [product, setProduct] = useState([]);

  useEffect(() => {
    params && setProduct(params.product);
  }, []);

  const sendEmailMessage = () => {
    const subject = 'Regarding ' + product.title;
    const body = "Hi " + product.userName + "\n" + "I am interested in this item.";
    Linking.openURL('mailto:' + product.userEmail + "?subject=" + subject + "&body=" + body);
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
          onPress={sendEmailMessage}
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
