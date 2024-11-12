import React, { useEffect, useState } from "react";
import { View, Text, Platform, StyleSheet } from "react-native";
import { Picker } from "@react-native-picker/picker";
import * as Device from "expo-device";
import * as Location from "expo-location";

const CityLocation = () => {
  const [city, setCity] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [selectedCity, setSelectedCity] = useState("Fetching city...");
  const predefinedCities = ["Maqsudan", "Bidipur", "Kartatpur"];

  useEffect(() => {
    const fetchCity = async () => {
      if (Platform.OS === "android" && !Device.isDevice) {
        setErrorMsg(
          "This will not work on an Android Emulator. Try it on a device!"
        );
        return;
      }
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      let address = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (address.length > 0) {
        setCity(address[0].city);
        setSelectedCity(address[0].city);
      }
    };

    fetchCity();
  }, []);

  return (
    <View>
      <Text style={styles.cityText}>
        {errorMsg ? errorMsg : "Select your city:"}
      </Text>
      <Picker
        selectedValue={selectedCity}
        onValueChange={(value) => setSelectedCity(value)}
        style={styles.picker}
      >
        {city && <Picker.Item label={city} value={city} />}
        {predefinedCities.map((cityOption) => (
          <Picker.Item label={cityOption} value={cityOption} key={cityOption} />
        ))}
      </Picker>
    </View>
  );
};

const styles = StyleSheet.create({
  cityText: {
    fontSize: 18,
    color: "#666", 
    textAlign: "center",
    fontWeight: "500", 
    marginBottom: 12, 
    letterSpacing: 0.5, 
  },
  picker: {
    height: 50,
    width: 250,
    alignSelf: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 10, 
    borderWidth: 1,
    borderColor: "#ccc", 
    paddingHorizontal: 10, 
    justifyContent: "center", 
  },
});

export default CityLocation;
