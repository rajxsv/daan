import { createStackNavigator } from "@react-navigation/stack";
import Home from "../Screens/Home";
import ItemList from "../Screens/ItemList";
import ProductDetail from "../Screens/ProductDetail";
import ChatScreen from "../Screens/ChatScreen"; // Import ChatScreen

const Stack = createStackNavigator();

export default function HomeScreenNavigation() {
  return (
    <Stack.Navigator initialRouteName="home">
      <Stack.Screen
        name="home"
        component={Home}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="item-list"
        component={ItemList}
        options={({ route }) => ({
          title: route.params.category,
          headerStyle: {
            backgroundColor: "#3b82f6",
          },
          headerTintColor: "#fff",
        })}
      />
      <Stack.Screen
        name="product-detail"
        component={ProductDetail}
        options={{
          headerStyle: {
            backgroundColor: "#3b82f6",
          },
          headerTintColor: "#fff",
          headerTitle: "Detail",
        }}
      />
      {/* Chat Screen */}
      <Stack.Screen
        name="chat-screen"
        component={ChatScreen}
        options={{
          headerStyle: {
            backgroundColor: "#3b82f6",
          },
          headerTintColor: "#fff",
          headerTitle: "Chat",
        }}
      />
    </Stack.Navigator>
  );
}
