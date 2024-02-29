import { View, Text } from "react-native";
import React, { useState } from "react";
import { useRoute } from "@react-navigation/native";
import { useEffect } from "react";
import { app } from "../../firebaseConfig";
import {
  query,
  collection,
  getFirestore,
  where,
  getDocs,
} from "firebase/firestore";
import LatestItemList from "../Components/HomeScreen/LatestItemList";
const ItemList = () => {
  const db = getFirestore(app);
  const { params } = useRoute();
  const [itemList, setItemList] = useState([]);

  useEffect(() => {
    // console.log(params);
    params && getItemListByCategory();
  }, []);

  const getItemListByCategory = async () => {
    setItemList([]);
    const q = query(
      collection(db, "UserPost"),
      where("category", "==", params.category)
    );
    const snapshot = await getDocs(q);
    snapshot.forEach((doc) => {
      // console.log(doc.data());
      setItemList((itemList) => [...itemList, doc.data()]);
    });
  };
  return (
    <View className='p-2'>
      {itemList?.length > 0 ? (
        <LatestItemList latestItemList={itemList} heading={""} />
      ) : (
        <Text className="p-5 text-[20px] text-gray-400 justify-center text-center mt-[24px]">
          Be the first one to donate in this category.
        </Text>
      )}
    </View>
  );
};

export default ItemList;
