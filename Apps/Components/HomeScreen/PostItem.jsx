import { View, Text ,Image,TouchableOpacity} from 'react-native'
import React from 'react'
import { useNavigation } from '@react-navigation/native'


const PostItem = ({item}) => {
  const navigation = useNavigation();
  return (
    <TouchableOpacity 
    onPress={()=>navigation.push('product-detail',{
      product:item
    })}
    className='flex-1 m-2 p-2 rounded-lg border-[1px] border-slate-200'>
            <Image source={{uri:item.image}} className='w-full h-[140px] '/>
            <View>
              
              <Text className = 'text-[17px] font-bold mt-2'>
                {item.title}
              </Text>
              <Text className = 'text-[20px] font-bold text-blue-500'>
                {item.city}
              </Text>
              <Text className = 'text-blue-500 bg-blue-200 p-[2px] text-center mt-1 rounded-full px-1 text-[10px] w-[70px]'>
                {item.category}
              </Text>
            </View>
            {/* "Message Poster" button */}
            <TouchableOpacity
              onPress={() => {
                // Use item.user_id or item.userId if available, otherwise use a placeholder
                const userId = item.user_id || item.userId || 'POSTER_ID_PLACEHOLDER'; 
                navigation.push('chat-screen', { userId });
              }}
              className='mt-2 p-2 bg-purple-500 rounded-lg'
            >
              <Text className='text-white text-center'>Message Poster</Text>
            </TouchableOpacity>
          </TouchableOpacity>
  )
}

export default PostItem