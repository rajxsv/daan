import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
  ToastAndroid,
} from "react-native";
import React, { useEffect, useState } from "react";
import { app } from "../../firebaseConfig";
import { addDoc, getFirestore, collection, getDocs } from "firebase/firestore";
import { Formik } from "formik";
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import { useUser } from "@clerk/clerk-expo";

const AddPost = () => {
  const [image, setImage] = useState(null);
  const db = getFirestore(app);
  const storage = getStorage();
  const [loading, setLoading] = useState(false);
  const { user } = useUser();

  const [categoryList, setCategoryList] = useState([]);

  useEffect(() => {
    getCategoryList();
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    const { status } = await ImagePicker.getMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      const { status: newStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (newStatus !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Sorry, we need camera roll permissions to upload images!'
        );
      }
    }
  };

  const getCategoryList = async () => {
    setCategoryList([]);
    const querySnapshot = await getDocs(collection(db, "Category"));
    querySnapshot.forEach((doc) => {
      setCategoryList((categoryList) => [...categoryList, doc.data()]);
    });
  };

  const pickImage = async () => {
    try {
      // Request permission to access media library
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert("Permission Required", "Permission to access camera roll is required!");
        return;
      }

      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'All', // Use string instead of enum for compatibility
        allowsEditing: true,
        aspect: [4, 4],
        quality: 1,
        allowsMultipleSelection: false,
      });

      console.log('Image picker result:', result); // Debug log

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Image picker error:", error);
      Alert.alert("Error", "Failed to open image picker: " + error.message);
    }
  };

  const onSubmitMethod = async (value) => {
    try {
      setLoading(true);

      if (!image) {
        Alert.alert("Please select an image first.");
        setLoading(false);
        return;
      }

      const res = await fetch(image);
      const blob = await res.blob();

      const storageRef = ref(storage, "communityPost/" + Date.now() + ".jpg");
      await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(storageRef);

      value.image = downloadURL;
      value.userName = user.fullName;
      value.userEmail = user.primaryEmailAddress.emailAddress;
      value.userImage = user.imageUrl;
      value.userId = user.id;
      value.createdAt = Date.now();

      const docRef = await addDoc(collection(db, "UserPost"), value);

      if (docRef.id) {
        Alert.alert("Successfully Donated Item.");
      }
    } catch (err) {
      console.error("Submission Error:", err);
      Alert.alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView>
      <ScrollView className="p-10">
        <Text className="text-[25px] font-bold">Donate an Item</Text>
        <Text className="text-[18px] text-gray-500 mb-10">
          What is useless for you can be useful for someone else.
        </Text>
        <Formik
          initialValues={{
            title: "",
            desc: "",
            category: "",
            city: "",
          }}
          onSubmit={(value) => onSubmitMethod(value)}
          validate={(values) => {
            const errors = {};
            if (!values.title) {
              ToastAndroid.show("Title is Mandatory", ToastAndroid.SHORT);
              errors.title = "Title is Mandatory";
            }
            return errors;
          }}
        >
          {({
            handleChange,
            handleBlur,
            handleSubmit,
            values,
            setFieldValue,
          }) => (
            <View>
              <TouchableOpacity onPress={pickImage}>
                {image ? (
                  <Image
                    source={{ uri: image }}
                    style={{ width: 100, height: 100, borderRadius: 15 }}
                  />
                ) : (
                  <Image
                    source={require("../../assets/images/placeholder.jpg")}
                    style={{ width: 100, height: 100, borderRadius: 15 }}
                  />
                )}
              </TouchableOpacity>

              <TextInput
                style={styles.input}
                placeholder="Title"
                value={values?.title}
                onChangeText={handleChange("title")}
              />
              <TextInput
                style={styles.input}
                placeholder="Description"
                value={values?.desc}
                numberOfLines={5}
                onChangeText={handleChange("desc")}
              />
              <View style={{ borderWidth: 1, borderRadius: 10, marginTop: 15 }}>
                <Picker
                  selectedValue={values?.category}
                  onValueChange={(itemValue) =>
                    setFieldValue("category", itemValue)
                  }
                >
                  {categoryList &&
                    categoryList.map((item, index) => (
                      <Picker.Item
                        key={index}
                        label={item.name}
                        value={item.name}
                      />
                    ))}
                </Picker>
              </View>
              <TextInput
                style={styles.input}
                placeholder="City"
                value={values?.city}
                onChangeText={handleChange("city")}
              />
              <TouchableOpacity
                onPress={handleSubmit}
                style={{
                  backgroundColor: loading ? "#ccc" : "#007BFF",
                }}
                disabled={loading}
                className="p-4 rounded-full mt-10"
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="text-white text-center text-[16px]">
                    Submit
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </Formik>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    paddingHorizontal: 17,
    marginTop: 15,
    marginBottom: 5,
    fontSize: 17,
    textAlignVertical: "top",
  },
});

export default AddPost;