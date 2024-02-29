import { View, Text, ScrollView } from "react-native";
import React, { useEffect, useState } from "react";
import Header from "../Components/HomeScreen/Header";
import Sliders from "../Components/HomeScreen/Sliders";
import { app } from "../../firebaseConfig";
import { getFirestore, collection, getDocs, onSnapshot } from "firebase/firestore";
import Categories from "../Components/HomeScreen/Categories";
import LatestItemList from "../Components/HomeScreen/LatestItemList";

const Home = () => {
  const db = getFirestore(app);

  const [sliderList, setSliderList] = useState([]);
  const [categoryList, setCategoryList] = useState([]);
  const [latestItemList, setLatestItemList] = useState([]);

  useEffect(() => {
    const unsubscribe = getSliders();
    getCategoryList();
    return () => unsubscribe(); // Cleanup function to unsubscribe from snapshot listener
  }, []);

  const getSliders = () => {
    const unsubscribe = onSnapshot(collection(db, "Sliders"), (snapshot) => {
      const sliders = [];
      snapshot.forEach((doc) => {
        sliders.push(doc.data());
      });
      setSliderList(sliders);
    });
    return unsubscribe; // Return the unsubscribe function
  };

  const getCategoryList = async () => {
    const querySnapshot = await getDocs(collection(db, "Category"));
    const categories = querySnapshot.docs.map((doc) => doc.data());
    setCategoryList(categories);
  };

  const getLatestItemList = () => {
    const unsubscribe = onSnapshot(collection(db, "UserPost"), (snapshot) => {
      const latestItems = [];
      snapshot.forEach((doc) => {
        latestItems.push(doc.data());
      });
      setLatestItemList(latestItems);
    });
    return unsubscribe; // Return the unsubscribe function
  };

  useEffect(() => {
    const unsubscribe = getLatestItemList();
    return () => unsubscribe(); // Cleanup function to unsubscribe from snapshot listener
  }, []); // Run only once when component mounts

  return (
    <ScrollView className="py-8 px-6 bg-white flex-1">
      <Header />
      <Sliders sliderList={sliderList} />
      <Categories categoryList={categoryList} />
      <LatestItemList
        latestItemList={latestItemList}
        heading={"Contributions"}
      />
    </ScrollView>
  );
};

export default Home;
