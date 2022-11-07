import { View, Text, Button, StyleSheet, TextInput, ScrollView } from "react-native";
import React, { useEffect, useState } from "react";

const Search = ({navigation}) => {
    return (
        <View style={styles.container}>
            <View>
                <View style={styles.header} >
                    <Text style={{
                        fontSize: 25,
                        fontWeight: "900",
                    }} >
                        Explore
                    </Text>
                </View>
                <TextInput 
                    style={styles.searchInput}
                    placeholder="검색"
                />
                <ScrollView
                    showsHorizontalScrollIndicator={false}
                    horizontal
                >
                    <View style={styles.category}>
                        <Text style={styles.categoryText}>부동산</Text>
                    </View>
                    <View style={styles.category}>
                        <Text style={styles.categoryText}>메타버스</Text>
                    </View>
                    <View style={styles.category}>
                        <Text style={styles.categoryText}>아이폰</Text>
                    </View>
                    <View style={styles.category}>
                        <Text style={styles.categoryText}>상당히</Text>
                    </View>
                    <View style={styles.category}>
                        <Text style={styles.categoryText}>빡세네</Text>
                    </View>
                    <View style={styles.category}>
                        <Text style={styles.categoryText}>리액트</Text>
                    </View>
                    <View style={styles.category}>
                        <Text style={styles.categoryText}>네이티브</Text>
                    </View>
                    <View style={styles.category}>
                        <Text style={styles.categoryText}>홀리쉣</Text>
                    </View>
                </ScrollView>
                <View
                    style={{ backgroundColor: "#DDDDDD", paddingVertical:0.3, marginTop: 20, }}
                >
                </View>
            </View>
            <ScrollView>
                <Text style={{marginHorizontal: 20, marginTop: 20, fontSize: 20, fontWeight: "700", }} >최근 검색어</Text>
                <Text style={{marginHorizontal: 20, marginTop: 20, fontSize: 17, fontWeight: "500", }} >검색 내용이 없습니다.</Text>
            </ScrollView>
        </View>
    );
  };

  const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "white",
    },
    header: {
        // backgroundColor: "red",
        marginTop: 60,
        marginHorizontal: 20,
        paddingBottom: 15,
        flexDirection: "row",
        justifyContent: "space-between"

    },
    searchInput: {
        backgroundColor: "#EEEEEE",
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderRadius: 15,
        marginVertical: 5,
        marginHorizontal: 20,
        fontSize: 18,
    },
    category: {
        backgroundColor: "#EEEEEE",
        paddingHorizontal: 13,
        paddingVertical: 10,
        marginHorizontal: 6,
        marginTop: 15,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center"

    },
    categoryText: {
        fontSize: 15,
        fontWeight: "400",
    }
  })

export default Search;