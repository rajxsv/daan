import React, { useEffect, useState } from "react";
import { View, Text, Platform, StyleSheet } from "react-native";
import * as Device from "expo-device";
import * as Location from "expo-location";

const CityLocation = () => {
  const [city, setCity] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

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
      }
    };

    fetchCity();
  }, []);

  return (
    <View>
      <Text style={styles.cityText}>
        {errorMsg
          ? errorMsg
          : city
          ? `Current city: ${city}`
          : "Fetching city..."}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  cityText: {
    fontSize: 16,
    color: "gray",
    textAlign: "center",
    marginBottom: 10,
  },
});

export default CityLocation;
