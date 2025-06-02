import 'react-native-gesture-handler';
import { Text, View } from 'react-native';
import Login from './Apps/Screens/Login';
import { ClerkProvider, SignedIn, SignedOut } from '@clerk/clerk-expo';
import { NavigationContainer } from '@react-navigation/native';
import TabNavigation from './Apps/Navigations/TabNavigation';
import { SafeAreaView } from 'react-native';


export default function App() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
    <ClerkProvider publishableKey='pk_test_cmVsYXRlZC1zdGFyZmlzaC01LmNsZXJrLmFjY291bnRzLmRldiQ'>
    <View className = 'flex-1 bg-white'>
      <SignedIn>
        <NavigationContainer>
          <TabNavigation/>
        </NavigationContainer> 
      </SignedIn>
      <SignedOut>
        <Login/>
      </SignedOut>
    </View>
    </ClerkProvider>
    </SafeAreaView>

  );
}

