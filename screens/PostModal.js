import { View, Text, Button, StyleSheet, Pressable, Animated, TouchableOpacity, } from "react-native";
import React, { useEffect, useState, useRef, useMemo, useCallback, } from "react";
import { useTheme } from '@react-navigation/native';
import { useCardAnimation } from '@react-navigation/stack';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import Api from "../lib/Api";
import BottomSheet, { BottomSheetView, BottomSheetFooter, BottomSheetBackdrop, } from '@gorhom/bottom-sheet';
import {
    BottomSheetModal,
    BottomSheetModalProvider,
} from '@gorhom/bottom-sheet';
import {
  useNavigation,
  useFocusEffect,
  useScrollToTop,
} from '@react-navigation/native';


const PostModal = ({ route, navigation }) => {
  const { index } = route.params
  const [status, requestPermission] = ImagePicker.useCameraPermissions();
  const [status2, requestPermission2] = ImagePicker.useMediaLibraryPermissions();
  const [loading, setLoading] = useState(false);

  // useFocusEffect(
  //   useCallback(() => {
  //     handleSnapPress()
  //   }, [])
  // );

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
        // allowsMultipleSelection: true,
        quality: 1,
      });
  
      console.log(result.uri);
  
      if (!result.cancelled) {
        navigation.goBack();
        navigation.navigate(`CreateBookmark${index}`, {ocrImage: result.uri});
      }
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const pickImage = async () => {
    try {
      setLoading(true);
      if (!status2.granted) {
        const permission = await requestPermission2();
        if (!permission.granted) {
          return null;
        }
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
      });

      console.log(result.uri);

      if (!result.cancelled) {
        navigation.goBack();
        navigation.navigate(`CreateBookmark${index}`, {ocrImage: result.uri});
      }
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

    // // ref
    // const bottomSheetModalRef = useRef();

    // // variables
    // const snapPoints = useMemo(() => ['65%'], []);

    // // callbacks
    // const handlePresentModalPress = useCallback(() => {
    //     bottomSheetModalRef.current.present();
    // }, []);
    // const handleSheetChanges = useCallback((index) => {
    //     console.log('handleSheetChanges', index);
    // }, []);

    // const bottomSheetRef = useRef(null);

    // const handleSnapPress = useCallback((index) => {
    //     bottomSheetRef.current.snapToIndex(0);
    // }, []);

    // const renderBackdrop = useCallback((props) => (
    //   <BottomSheetBackdrop {...props} pressBehavior="close" />
    // ), []);


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
          <TouchableOpacity 
            style={styles.menu} 
            activeOpacity={1}
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
          <TouchableOpacity 
            style={styles.menu} 
            activeOpacity={1}
            onPress={pickImage}
          >
            <Feather name="image" size={20} color="black" />
            <Text style={{ fontSize: 17, fontWeight: "700", marginHorizontal: 10, }}>앨범에서 북마크 가져오기</Text>
          </TouchableOpacity>
        </View>
      </View>


//////////////////////////////!bottom sheet 테스트!////////////////////////////////////
      // <View style={{ flex: 1 }}>
      //   <Pressable
      //     style={[
      //       StyleSheet.absoluteFill,
      //       { backgroundColor: 'rgba(0, 0, 0, 0.5)' },
      //     ]}
      //     onPress={navigation.goBack}
      //   />
      //   <BottomSheet
      //     ref={bottomSheetRef}
      //     snapPoints={snapPoints}
      //     onChange={handleSheetChanges}
      //     backdropComponent={renderBackdrop}
      //   >
      //   <BottomSheetView style={styles.container}>
      //     <TouchableOpacity 
      //       style={styles.menu} 
      //       activeOpacity={1}
      //       onPress={makeImage}
      //     >
      //       <Feather name="camera" size={20} color="black" />
      //       <Text style={{ fontSize: 17, fontWeight: "700", marginHorizontal: 10, }}>카메라로 북마크 스캔하기</Text>
      //     </TouchableOpacity>
      //     <TouchableOpacity 
      //       style={styles.menu} 
      //       activeOpacity={1}
      //       onPress={() => {
      //         navigation.goBack();
      //         navigation.navigate(`CreateBookmark${index}`, {ocrImage: null});
      //       }}
      //     >
      //       <Feather name="edit" size={20} color="black" />
      //       <Text style={{ fontSize: 17, fontWeight: "700", marginHorizontal: 10, }}>직접 북마크 타이핑하기</Text>
      //     </TouchableOpacity>
      //     <View style={styles.menu} >
      //       <Feather name="image" size={20} color="black" />
      //       <Text style={{ fontSize: 17, fontWeight: "700", marginHorizontal: 10, }}>앨범에서 북마크 가져오기</Text>
      //     </View>
      //   </BottomSheetView>
      //   </BottomSheet>
      // </View>
///////////////////////////////////////////////////////////////////////////////////////////
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%', 
    height: '25%', 
    position: 'absolute', 
    bottom: 0, 
    backgroundColor: 'white', 
    borderRadius: 10, 
    paddingTop: 10,
    // backgroundColor: "pink",
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
