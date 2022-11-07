import { View, Text, Button, StyleSheet, Pressable, Animated, TouchableOpacity, } from "react-native";
import React, { useEffect, useState } from "react";
import { useTheme } from '@react-navigation/native';
import { useCardAnimation } from '@react-navigation/stack';
import { Feather } from '@expo/vector-icons';


const PostModal = ({ route, navigation }) => {
  const { index } = route.params
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
          <View style={styles.menu} >
            <Feather name="camera" size={20} color="black" />
            <Text style={{ fontSize: 17, fontWeight: "700", marginHorizontal: 10, }}>카메라로 북마크 스캔하기</Text>
          </View>
          <TouchableOpacity 
            style={styles.menu} 
            activeOpacity={1}
            onPress={() => {
              navigation.goBack();
              navigation.navigate(`CreateBookmark${index}`);
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
