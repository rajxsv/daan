import React from 'react';
import { Text, View } from 'react-native';
import { useUser } from '@clerk/clerk-expo'; // Assuming clerk-expo is the correct package

const MyComponent = () => {
  const { isLoaded, isSignedIn, user } = useUser();

  if (!isLoaded) {
    // Handle loading state, maybe return a spinner
    return <Text>Loading user data...</Text>;
  }

  if (!isSignedIn || !user) {
    // Handle signed out state
    return <Text>User is not signed in.</Text>;
  }

  // User is signed in and user data is available
  console.log("User ID:", user.id);
  // You can now use user.id in your component, for example, to fetch user-specific data

  return (
    <View>
      <Text>Welcome, {user.firstName || user.username}!</Text>
      <Text>Your User ID is: {user.id}</Text>
    </View>
  );
};

export default MyComponent;

// Example of how this component might be used in your app
// Ensure you have ClerkProvider set up at the root of your application.
//
// import { ClerkProvider } from '@clerk/clerk-expo';
//
// const App = () => {
//   return (
//     <ClerkProvider publishableKey="YOUR_CLERK_PUBLISHABLE_KEY">
//       <MyComponent />
//     </ClerkProvider>
//   );
// };
//
// export default App;
