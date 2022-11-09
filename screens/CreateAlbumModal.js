import { View, Text, Button, StyleSheet, Pressable, Animated, TouchableOpacity, Image, TextInput, ScrollView, } from "react-native";
import React, { useEffect, useState } from "react";
import { useTheme } from '@react-navigation/native';
import { useCardAnimation } from '@react-navigation/stack';
import { Feather, AntDesign } from '@expo/vector-icons';
import blankAlbumImg from '../assets/images/blankAlbumImage.png';
import emptyImage from '../assets/images/emptyImage.jpeg';
import {colors, regWidth, regHeight} from '../config/globalStyles';
import * as ImagePicker from 'expo-image-picker';
import Api from "../lib/Api";


const CreateAlbumModal = ({ route, navigation }) => {
//   const { index } = route.params;
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
        quality: 1,
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
        console.log("success")
        navigation.goBack();
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
        <View style={styles.containter}>
            <View style={styles.modalHeader}>
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
            </View>
            <View style={styles.albumInputContainter}>
                <Pressable
                  onPress={pickImage}
                >
                  <Image 
                      source={image !== null ? { uri: image } : emptyImage}
                      style={styles.albumImage}
                  />
                </Pressable>
                <View 
                    style={{ 
                        width: "70%", 
                        borderBottomWidth: 0.3,
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginTop: 18,
                        flexDirection: "row",
                    }}
                >
                    <AntDesign name="edit" size={20} color="black" style={{opacity: 0}} />
                    <TextInput 
                        placeholder="새 앨범 이름"
                        style={styles.albumNameInput}
                        onChangeText={writeAlbumName}
                    />
                    <AntDesign name="edit" size={20} color="black" />
                </View>
            </View>


        </View>
      </View>
  )
}

const styles = StyleSheet.create({
  containter: {
    width: '100%', 
    height: regHeight * 300, 
    position: 'absolute', 
    // bottom: 0, 
    backgroundColor: 'white', 
    borderRadius: 10, 
    paddingTop: 10,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 55,
    marginHorizontal: 18, 
  },
  albumInputContainter: {
    alignItems: "center",
    marginTop: 18, 
  },
  albumImage: {
    width: regWidth * 100,
    height: regWidth * 100,
    resizeMode: "contain"
  },
  albumNameInput: {
    fontSize: 15,
    fontWeight: "500",
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
