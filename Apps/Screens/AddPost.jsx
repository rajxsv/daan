import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Button,
  TouchableOpacity,
  Image,
  ToastAndroid,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";
import React, { useEffect, useState } from "react";
import { app } from "../../firebaseConfig";
import { addDoc, getFirestore } from "firebase/firestore";
import { collection, getDocs } from "firebase/firestore";
import { Formik } from "formik";
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import { doc, setDoc } from "firebase/firestore";
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
  }, []);
  const getCategoryList = async () => {
    setCategoryList([]);
    const querySnapshot = await getDocs(collection(db, "Category"));
    querySnapshot.forEach((doc) => {
      // console.log("docs " ,doc.data());
      setCategoryList((categoryList) => [...categoryList, doc.data()]);
    });
  };

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 4],
      quality: 1,
    });

    // console.log(result);

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const onSubmitMethod = async (value) => {
    setLoading(true);
    // value.image = image;
    // console.log(value);

    //Convert uri to Blob File
    const res = await fetch(image);
    const blob = await res.blob();

    const storageRef = ref(storage, "communityPost/" + Date.now() + ".jpg");

    uploadBytes(storageRef, blob)
      .then((snapshot) => {
        // console.log("Uploaded a blob or file!");
      })
      .then((resp) => {
        getDownloadURL(storageRef).then(async (downloadURL) => {
          // console.log(downloadURL)
          value.image = downloadURL;
          value.userName = user.fullName;
          value.userEmail = user.primaryEmailAddress.emailAddress;
          value.userImage = user.imageUrl;
          const docRef = await addDoc(collection(db, "UserPost"), value);
          if (docRef.id) {
            setLoading(false);
            // console.log('Document Added')
            Alert.alert("Successfully Donated Item.");
          }
        });
      });
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
            image: "",
            userName: "",
            userEmail: "",
            userImage: "",
            createdAt:Date.now()
          }}
          onSubmit={(value) => onSubmitMethod(value)}
          validate={(values) => {
            const errors = {};
            if (!values.title) {
              // console.log("Title Not Present");
              ToastAndroid.show("Title is Mandatory", ToastAndroid.SHORT);
              errors.name = "Title is Mandatory";
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
            errors,
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
              {/* Category List Dropdown */}
              <View style={{ borderWidth: 1, borderRadius: 10, marginTop: 15 }}>
                <Picker
                  className="border-2"
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
                className="p-4 bg-blue-500 rounded-full mt-10"
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="text-white text-center text-[16px]">
                    Submit
                  </Text>
                )}
              </TouchableOpacity>
              {/* <Button onPress={handleSubmit} title="submit" className = 'mt-7'/> */}
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
