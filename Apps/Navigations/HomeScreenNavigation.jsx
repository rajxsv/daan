import { createStackNavigator } from "@react-navigation/stack";
import Home from "../Screens/Home";
import ItemList from "../Screens/ItemList";
import ProductDetail from "../Screens/ProductDetail";

const Stack = createStackNavigator();

export default function HomeScreenNavigation() {
  return (
    <Stack.Navigator>
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
          headerTitle:'Detail'
        }}
      />
    </Stack.Navigator>
  );
}
