import { View, Text ,Image, TouchableOpacity} from 'react-native'
import React from 'react'
import { useOAuth } from "@clerk/clerk-expo";
import * as WebBrowser from "expo-web-browser";
import { useWarmUpBrowser } from "../../hooks/warmUpBrowser";

WebBrowser.maybeCompleteAuthSession();

const Login = () => {
    useWarmUpBrowser();
    const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });
    const onPress = React.useCallback(async () => {
        try {
          const { createdSessionId, signIn, signUp, setActive } =
            await startOAuthFlow();
     
          if (createdSessionId) {
            setActive({ session: createdSessionId });
          } else {
            // Use signIn or signUp for next steps such as MFA
          }
        } catch (err) {
          console.error("OAuth error", err);
        }
      }, []);
  return (
    <View>
      <Image source={require('../../assets/images/daan.jpg')} className = 'w-full h-[400px] object-cover'/>
      <View className= 'p-8 bg-white mt-[-20px] rounded-t-3xl'>
        <Text className = 'text-[30px] font-bold'>daan - to donate</Text>
        <Text className = 'text=[18px] text-slate-500 mt-6'>Join for a change</Text>
        <TouchableOpacity onPress = {onPress} className='p-4 bg-blue-500 rounded-full mt-20'>
            <Text className = 'text-white text-center text-[18px]'>Get Started</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default Login