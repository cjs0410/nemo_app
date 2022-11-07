import { View, Text, Button, StyleSheet, Pressable, Animated, TouchableOpacity, Image, TextInput, ScrollView, } from "react-native";
import React, { useEffect, useState } from "react";
import { useTheme } from '@react-navigation/native';
import { useCardAnimation } from '@react-navigation/stack';
import { Feather, AntDesign } from '@expo/vector-icons';
import blankAlbumImg from '../assets/images/blankAlbumImage.png';


const CreateAlbumModal = ({ route, navigation }) => {
//   const { index } = route.params
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
                <Text style={{fontSize: 15, fontWeight: "500", color: "#008000" }}>
                    생성
                </Text>
            </View>
            <View style={styles.albumInputContainter}>
                <Image 
                    source={blankAlbumImg}
                    style={styles.albumImage}
                />
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
    height: '35%', 
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
    width: 100,
    height: 100,
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
