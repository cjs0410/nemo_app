import { View, SafeAreaView, Text, Button, StyleSheet, Pressable, Animated, TouchableOpacity, Image, TextInput, ScrollView, } from "react-native";
import React, { useEffect, useState } from "react";
import { useTheme } from '@react-navigation/native';
import { useCardAnimation } from '@react-navigation/stack';
import { Feather, AntDesign } from '@expo/vector-icons';
import emptyImage from '../assets/images/emptyImage.jpeg';
import {colors, regWidth, regHeight} from '../config/globalStyles';
import * as ImagePicker from 'expo-image-picker';
import Api from "../lib/Api";

import { useSelector, useDispatch } from 'react-redux';
import { userSelector } from '../modules/hooks';
import { setShouldHomeRefresh, setShouldStorageRefresh, setShouldUserRefresh, } from '../modules/user';


const CreateAlbumModal = ({ route, navigation }) => {
//   const { index } = route.params;
  const dispatch = useDispatch();
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, requestPermission] = ImagePicker.useMediaLibraryPermissions();
  const [albumName, setAlbumName] = useState('');

  const pickImage = async () => {
    try {
      setLoading(true);
      if (!status.granted) {
        const permission = await requestPermission();
        if (!permission.granted) {
          return null;
        }
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        aspect: [1, 1],
        allowsEditing: true,
        quality: 0.7,
      });

      console.log(result.uri);

      if (!result.cancelled) {
        setImage(result.uri);
      }
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const writeAlbumName = (payload) => {
    setAlbumName(payload);
  };

  const makeAlbum = async() => {
    navigation.goBack();
    
    const formData = new FormData();
    const filename = image.split('/').pop();
    const match = /\.(\w+)$/.exec(filename ?? '');
    const type = match ? `image/${match[1]}` : `image`;
    formData.append('album_cover', {
        uri: image,
        type: type,
        name: filename
    });

    formData.append('album_title', albumName)
    
    try {
      await Api
      .post("api/v4/album/add/", formData,
        {
          headers: {
              'content-type': 'multipart/form-data',
          },
        }
      )
      .then((res) => {
        console.log("success");
        dispatch(setShouldUserRefresh(true));
        // navigation.navigate('ProfileScreen', { refresh: true, });
      })
    } catch (err) {
      console.error(err);
    }
  }

  return (
      <View style={{ flex: 1 }}>
        <Pressable
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: 'rgba(0, 0, 0, 0.5)' },
          ]}
          onPress={navigation.goBack}
        />
        <View style={styles.container}>
            <SafeAreaView style={styles.modalHeader}>
                <Pressable
                    hitSlop={{ bottom: 10, left: 10, right: 10, top: 10 }}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={{fontSize: 15, fontWeight: "500", }} >
                        취소
                    </Text>
                </Pressable>
                <Text style={{fontSize: 16, fontWeight: "700", }} >
                    새 앨범 생성하기
                </Text>
                <Pressable
                    hitSlop={{ bottom: 10, left: 10, right: 10, top: 10 }}
                    onPress={makeAlbum}
                >
                  <Text style={{fontSize: 15, fontWeight: "500", color: "#008000" }}>
                      생성
                  </Text>
                </Pressable>
            </SafeAreaView>
            <View style={styles.albumInputContainer}>
                <Pressable
                  onPress={pickImage}
                >
                  <Image 
                      source={image !== null ? { uri: image } : emptyImage}
                      style={styles.albumImage}
                  />
                </Pressable>
                <Pressable
                  onPress={pickImage}
                >
                  <Text style={{ fontSize: 15, fontWeight: "500", color: "#FF4040", marginTop: 18, }}>
                    앨범 사진 선택하기
                  </Text>
                </Pressable>
            </View>
            <TextInput 
              placeholder="앨범 이름을 입력하세요"
              style={{
                  ...styles.albumNameInput,
                  height: regHeight * 50,
              }}
              onChangeText={writeAlbumName}
            />

        </View>
      </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%', 
    height: regHeight * 350, 
    position: 'absolute', 
    // bottom: 0, 
    backgroundColor: 'white', 
    borderRadius: 10, 
    paddingTop: 10,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: regHeight * 10,
    marginHorizontal: 18, 
  },
  albumInputContainer: {
    alignItems: "center",
    marginTop: 18, 
  },
  albumImage: {
    width: regWidth * 130,
    height: regWidth * 130,
    resizeMode: "contain"
  },
  albumNameInput: {
    backgroundColor: "#EEEEEE",
    marginHorizontal: regWidth * 22,
    marginVertical: regHeight * 22,
    borderRadius: 10,
    height: "25%",
    paddingHorizontal: regWidth * 8,
    fontSize: regWidth * 15,
    fontWeight:"500",
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

export default CreateAlbumModal;
