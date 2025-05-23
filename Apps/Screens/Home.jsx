import { View, Text, FlatList } from "react-native";
import React, { useEffect, useState } from "react";
import Header from "../Components/HomeScreen/Header";
import Sliders from "../Components/HomeScreen/Sliders";
import { app } from "../../firebaseConfig";
import { getFirestore, collection, getDocs, onSnapshot } from "firebase/firestore";
import Categories from "../Components/HomeScreen/Categories";
import LatestItemList from "../Components/HomeScreen/LatestItemList";
import CityLocation from "../Components/HomeScreen/CityLocation";

const Home = () => {
  const db = getFirestore(app);

  const [sliderList, setSliderList] = useState([]);
  const [categoryList, setCategoryList] = useState([]);
  const [latestItemList, setLatestItemList] = useState([]);

  useEffect(() => {
    const unsubscribe = getSliders();
    getCategoryList();
    getLatestItemList();
    return () => unsubscribe();
  }, []);

  const getSliders = () => {
    const unsubscribe = onSnapshot(collection(db, "Sliders"), (snapshot) => {
      const sliders = [];
      snapshot.forEach((doc) => {
        sliders.push(doc.data());
      });
      setSliderList(sliders);
    });
    return unsubscribe;
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
    return unsubscribe;
  };

  const data = [
    { key: 'header' },
    { key: 'slider' },
    { key: 'categories' },
    { key: 'location' },
    { key: 'latestItems' }
  ];

  const renderItem = ({ item }) => {
    switch (item.key) {
      case 'header':
        return <Header />;
      case 'slider':
        return <Sliders sliderList={sliderList} />;
      case 'categories':
        return <Categories categoryList={categoryList} />;
      case 'location':
        return <CityLocation />;
      case 'latestItems':
        return <LatestItemList latestItemList={latestItemList} />;
      default:
        return null;
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

export default Home;
