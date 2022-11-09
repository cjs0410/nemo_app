import { View, Text, Button, StyleSheet, Pressable, Animated, TouchableOpacity, } from "react-native";
import React, { useEffect, useState } from "react";
import { useTheme } from '@react-navigation/native';
import { useCardAnimation } from '@react-navigation/stack';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import Api from "../lib/Api";


const PostModal = ({ route, navigation }) => {
  const { index } = route.params
  const [status, requestPermission] = ImagePicker.useCameraPermissions();
  const [loading, setLoading] = useState(false);

  const makeImage = async () => {
    const formData = new FormData();
    try {
      if (!status.granted) {
        const permission = await requestPermission();
        if (!permission.granted) {
          return null;
        }
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 1,
      });
  
      console.log(result.uri);
  
      if (!result.cancelled) {
        navigation.goBack();
        navigation.navigate(`CreateBookmark${index}`, {ocrImage: result.uri});
        
        // const filename = result.uri.split('/').pop();
        // const match = /\.(\w+)$/.exec(filename ?? '');
        // const type = match ? `image/${match[1]}` : `image`;
        // formData.append('image', {
        //     uri: result.uri,
        //     type: type,
        //     name: filename
        // });

        // try {
        //   await Api
        //   .put('/api/v2/bookmark/ocr/', formData, 
        //     {
        //       headers: {
        //           'content-type': 'multipart/form-data',
        //       },
        //     }
        //   )
        //   .then((res) => {
        //     console.log(res.data)
        //     navigation.goBack();
        //     navigation.navigate(`CreateBookmark${index}`);
        //   })
        // } catch (err) {
        //   console.error(err)
        // }

      }
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
};


  return (
      <View style={{ flex: 1 }}>
        <Pressable
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: 'rgba(0, 0, 0, 0.5)' },
          ]}
          onPress={navigation.goBack}
        />
        <View style={styles.containter}>
          <TouchableOpacity 
            style={styles.menu} 
            activeOpacity={1}
            // onPress={() => {
            //   navigation.goBack();
            //   navigation.navigate(`CreateBookmark${index}`);
            // }}
            onPress={makeImage}
          >
            <Feather name="camera" size={20} color="black" />
            <Text style={{ fontSize: 17, fontWeight: "700", marginHorizontal: 10, }}>카메라로 북마크 스캔하기</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.menu} 
            activeOpacity={1}
            onPress={() => {
              navigation.goBack();
              navigation.navigate(`CreateBookmark${index}`, {ocrImage: null});
            }}
          >
            <Feather name="edit" size={20} color="black" />
            <Text style={{ fontSize: 17, fontWeight: "700", marginHorizontal: 10, }}>직접 북마크 타이핑하기</Text>
          </TouchableOpacity>
          <View style={styles.menu} >
            <Feather name="image" size={20} color="black" />
            <Text style={{ fontSize: 17, fontWeight: "700", marginHorizontal: 10, }}>앨범에서 북마크 가져오기</Text>
          </View>
        </View>
      </View>
  )
}

const styles = StyleSheet.create({
  containter: {
    width: '100%', 
    height: '25%', 
    position: 'absolute', 
    bottom: 0, 
    backgroundColor: 'white', 
    borderRadius: 10, 
    paddingTop: 10,
  },
  menu: {
    // backgroundColor: "pink",
    paddingVertical: 8,
    paddingHorizontal: 20,
    marginTop: 7,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
  },
})

export default PostModal;
