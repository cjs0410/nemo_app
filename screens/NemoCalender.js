import { View, SafeAreaView, Text, Button, StyleSheet, Image, Dimensions, TouchableOpacity, ScrollView, ActivityIndicator, Animated, RefreshControl, Pressable, ImageBackground } from "react-native";
import React, { useEffect, useState, useCallback, useRef, } from "react";
import {
    useNavigation,
    useFocusEffect,
    useScrollToTop,
} from '@react-navigation/native';
import writerImage from '../assets/images/userImage.jpeg';
import { Entypo, Feather, MaterialIcons, AntDesign } from '@expo/vector-icons'; 
import { BookmarkList, AlbumList } from '../components';
import Api from "../lib/Api";
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import blankAvatar from '../assets/images/peopleicon.png';
import emptyAlbumImage from '../assets/images/emptyAlbumImage.jpeg';
import cal1P from '../assets/images/cal1P.png';
import cal2P from '../assets/images/cal2P.png';
import cal3P from '../assets/images/cal3P.png';
import cal1R from '../assets/images/cal1R.png';
import cal2R from '../assets/images/cal2R.png';
import cal3R from '../assets/images/cal3R.png';
import cal1G from '../assets/images/cal1G.png';
import cal2G from '../assets/images/cal2G.png';
import cal3G from '../assets/images/cal3G.png';


import vectorLeftImage from '../assets/icons/vectorLeftGrey.png';
import settings from '../assets/icons/settings.png';

import { useSelector, useDispatch } from 'react-redux';
import { userSelector, scrapSelector } from '../modules/hooks';
import user, { resetUserInfo, setAvatar, setShouldUserRefresh, } from '../modules/user';
import { loadScraps } from "../modules/scraps";
import {colors, regWidth, regHeight} from '../config/globalStyles';
import { FontAwesome } from '@expo/vector-icons';

import { 
    getDate, 
    getMonth, 
    getYear,
    startOfMonth, 
    getWeeksInMonth,
    startOfWeek,
    addDays,
    format,
    addMonths,
    getDaysInMonth,
    differenceInMonths,
} from 'date-fns';

const {width:SCREEN_WIDTH} = Dimensions.get('window');

const NemoCalender = ({navigation}) => {
    const date = new Date()
    const monthStart = startOfMonth(date);
    const [calState, setCalState] = useState({
        weekLength: 0,
        calenderDat: null,
        nextCount: 0,
        monthDays: null,
        curMonth: null,
        monthStart: monthStart,
        // calenderList: [],
    });
    const [calenderList, setCalenderList] = useState([]);
    const [dateWidth, setDateWidth] = useState(0);
    const [history, setHistory] = useState(null);
    const scrollViewRef = useRef();

    useEffect(() => {
        fetchCal();
    }, [])

    const fetchCal = async() => {
        try {
            await Api
            .get("/api/v1/user/calender/")
            .then((res) => {
                // console.log(res.data.history[0].days);
                console.log(res.data);
                const joinedDate = res.data.join_date.split('-');
                const joinDate = new Date(Number(joinedDate[0]), Number(joinedDate[1]) - 1);
                // console.log(getTotalCalender(joinDate, res.data.history));
                setCalenderList(getTotalCalender(joinDate, res.data.history));
            })
        } catch (err) {
            console.error(err);
        }
    }

    const getTotalCalender = (joinedDate, history) => {
        const monthDiff = differenceInMonths(date, joinedDate);
        const totalList = [];

        for (let i = 0; i < monthDiff+1; i++) {
            const tempMonthStart = addMonths(joinedDate, i);
            const tempMonth = getMonth(tempMonthStart);
            const tempYear = getYear(tempMonthStart);
            const monthHistory = (history.filter((el) => el.months === tempMonth + 1 && el.years === tempYear))[0].days;
            totalList.push(getMonthDays(tempMonthStart, tempMonth, monthHistory))
        }
        return totalList;
    }

    const getMonthDays = (date, month, countList) => {
        const monthStart = startOfMonth(date); //달 시작일 구하기 --> 1일 
        const monthList = [];
        const monthLength = getDaysInMonth(date);
        
        for (let i =0; i<monthLength; i++) {
            const tempDate = addDays(monthStart,i);
            const dayWord = getDay(format(tempDate,'EEE'));
            const dayNum = getDayNum(format(tempDate,'EEE'));
            const dayCount = (countList.filter((el) => el.days === getDate(tempDate)))[0]


            if (getMonth(tempDate) === month) {
                monthList.push({
                   dayWord,
                   dayNum,
                   date : tempDate,
                   key: getDate(tempDate),
                   day : getDate(tempDate),
                   monthNum: getMonth(tempDate) + 1,
                   month: getMonthName(month + 1),
                   year: getYear(tempDate),
                   count: dayCount ? dayCount.count : 0, 
                })
            }
        }
        // yearList.push(monthList);

        return monthList;
    }

    const getWeekDays = (date, month) => {
        const weekStart = startOfWeek(date, {weekStartOn:1});
        const weekLength = 7;
        const weekList = [];

        for(let i =0;i<weekLength;i++){
            const tempDate = addDays(weekStart,i);
            const formatted = getDay(format(tempDate,'EEE'));
            
            if (getMonth(tempDate) === month) {
                weekList.push({
                    key: getDate(tempDate),
                    formatted,
                    date : tempDate,
                    day : getDate(tempDate),
                    month: month+1,
                })
            } 
            // else if (getMonth(tempDate) < month) {
            //     weekList.push({
            //         key: getDate(tempDate),
            //         formatted,
            //         date : tempDate,
            //         day : getDate(tempDate),
            //         month:'pre'
            //     })

            // } else if (getMonth(tempDate) > month) {
            //     weekList.push({
            //         key: getDate(tempDate),
            //         formatted,
            //         date : tempDate,
            //         day : getDate(tempDate),
            //         month: 'next'
            //     })
            // }
        }
        return weekList;
    }

    const getDay = (day) => {
        var dayWord = day;

        if (dayWord === 'Sun') {
            dayWord='일';
        } else if (dayWord === 'Mon') {
            dayWord='월';
        } else if (dayWord === 'Tue') {
            dayWord='화';
        } else if (dayWord === 'Wed') {
            dayWord='수';
        } else if (dayWord === 'Thu') {
            dayWord='목';
        } else if (dayWord === 'Fri') {
            dayWord='금';
        } else if (dayWord === 'Sat') {
            dayWord='토';
        }
        return dayWord;
    }
    const getDayNum = (day) => {
        var dayNum = 0;

        if (day === 'Sun') {
        } else if (day === 'Mon') {
            dayNum=1;
        } else if (day === 'Tue') {
            dayNum=2;
        } else if (day === 'Wed') {
            dayNum=3;
        } else if (day === 'Thu') {
            dayNum=4;
        } else if (day === 'Fri') {
            dayNum=5;
        } else if (day === 'Sat') {
            dayNum=6;
        }
        return dayNum;
    }

    const getMonthName = (month) => {
        var monthWord = month;

        if (monthWord === 1) {
            monthWord = "January"
        } else if (monthWord === 2) {
            monthWord = "Feburary"
        } else if (monthWord === 3) {
            monthWord = "March"
        } else if (monthWord === 4) {
            monthWord = "April"
        } else if (monthWord === 5) {
            monthWord = "May"
        } else if (monthWord === 6) {
            monthWord = "June"
        } else if (monthWord === 7) {
            monthWord = "July"
        } else if (monthWord === 8) {
            monthWord = "August"
        } else if (monthWord === 9) {
            monthWord = "September"
        } else if (monthWord === 10) {
            monthWord = "October"
        } else if (monthWord === 11) {
            monthWord = "November"
        } else if (monthWord === 12) {
            monthWord = "December"
        }

        return monthWord;
    }

    const onLayout = (e) => {
        const layout = e.nativeEvent.layout;
        setDateWidth(parseInt((layout.width) / 7));
    }

    return (
        <View style={styles.container}>
            <SafeAreaView style={styles.header}>
                <Pressable
                    onPress={() => navigation.goBack()}
                    hitSlop={{ bottom: 20, left: 20, right: 20, top: 20 }}
                >
                    <Image 
                        source={vectorLeftImage}
                        style={{ 
                            width: regWidth*35, 
                            height: regWidth*35,
                            resizeMode: "contain",
                        }}
                    />
                </Pressable>
                <Text style={{ fontSize: regWidth * 18, fontWeight: "700", color: colors.bgdLight, }}>
                    Nemo Calender
                </Text>
                <Image 
                    source={vectorLeftImage}
                    style={{ 
                        width: regWidth*35, 
                        height: regWidth*35,
                        resizeMode: "contain",
                        opacity: 0,
                    }}
                />
            </SafeAreaView>
            <ScrollView
                ref={scrollViewRef}
                onContentSizeChange={() => {
                    scrollViewRef.current.scrollToEnd({ animated: false })
                }}
            >
                    {calenderList ? 
                        calenderList.map((month, index) => {
                            return (
                                <View
                                    key={index}
                                    style={{
                                        marginHorizontal: regWidth * 20,
                                        marginBottom: regHeight * 4,
                                    }}
                                >
                                    <View>
                                        <Text
                                            style={{
                                                color: colors.bgdLight,
                                                fontSize: regWidth * 16,
                                                fontWeight: "700",
                                            }}
                                        >
                                            {`${month[0].month} ${month[0].year}`}
                                        </Text>
                                    </View>
                                    <View 
                                        style={styles.calender}
                                        onLayout={onLayout}
                                    >
                                        <View
                                            style={{ 
                                                width: dateWidth, 
                                                marginBottom: regHeight * 16,
                                            }}
                                        >
                                            <Text
                                                style={styles.dayTxt}
                                            >
                                                Sun
                                            </Text>
                                        </View>
                                        <View
                                            style={{ 
                                                width: dateWidth, 
                                                marginBottom: regHeight * 16,
                                            }}
                                        >
                                            <Text
                                                style={styles.dayTxt}
                                            >
                                                Mon
                                            </Text>
                                        </View>
                                        <View
                                            style={{ 
                                                width: dateWidth, 
                                                marginBottom: regHeight * 16,
                                            }}
                                        >
                                            <Text
                                                style={styles.dayTxt}
                                            >
                                                Tue
                                            </Text>
                                        </View>
                                        <View
                                            style={{ 
                                                width: dateWidth, 
                                                marginBottom: regHeight * 16,
                                            }}
                                        >
                                            <Text
                                                style={styles.dayTxt}
                                            >
                                                Wed
                                            </Text>
                                        </View>
                                        <View
                                            style={{ 
                                                width: dateWidth, 
                                                marginBottom: regHeight * 16,
                                            }}
                                        >
                                            <Text
                                                style={styles.dayTxt}
                                            >
                                                Thu
                                            </Text>
                                        </View>
                                        <View
                                            style={{ 
                                                width: dateWidth, 
                                                marginBottom: regHeight * 16,
                                            }}
                                        >
                                            <Text
                                                style={styles.dayTxt}
                                            >
                                                Fri
                                            </Text>
                                        </View>
                                        <View
                                            style={{ 
                                                width: dateWidth, 
                                                marginBottom: regHeight * 16,
                                            }}
                                        >
                                            <Text
                                                style={styles.dayTxt}
                                            >
                                                Sat
                                            </Text>
                                        </View>

                                        {month.map((day, index) => {
                                            // console.log(day.monthNum % 3)
                                            const calWidth = day.count === 1 ? 30 : (day.count === 2 ? 36.75 : 42.45);
                                            const calHeight = day.count === 1 ? 30 : (day.count === 2 ? 35 : 39);

                                            return (
                                                <View
                                                    style ={{ 
                                                        width: dateWidth, 
                                                        marginBottom: regHeight * 16,
                                                        // backgroundColor: "pink",
                                                        marginLeft: index === 0 ? day.dayNum * dateWidth : 0,
                                                    }}
                                                    key={index}
                                                >
                                                    <Text
                                                        style={styles.dateTxt}
                                                    >
                                                        {day.day}
                                                    </Text>
                                                    <ImageBackground 
                                                        source={day.count === 1 ? 
                                                            (day.monthNum % 3 === 1 ? 
                                                                cal1P 
                                                                :
                                                                (day.monthNum % 3 === 2 ?
                                                                    cal1R
                                                                    :
                                                                    cal1G
                                                                )
                                                            )
                                                            : 
                                                            (day.count === 2 ? 
                                                                (day.monthNum % 3 === 1 ? 
                                                                    cal2P 
                                                                    :
                                                                    (day.monthNum % 3 === 2 ?
                                                                        cal2R
                                                                        :
                                                                        cal2G
                                                                    )
                                                                )
                                                                :
                                                                (day.monthNum % 3 === 1 ? 
                                                                    cal3P 
                                                                    :
                                                                    (day.monthNum % 3 === 2 ?
                                                                        cal3R
                                                                        :
                                                                        cal3G
                                                                    )
                                                                )
                                                            )
                                                        }
                                                        style={{
                                                            width: regWidth * calWidth,
                                                            height: regWidth * calHeight,
                                                            marginTop: regWidth * (39 - calHeight),
                                                            marginRight: regWidth * (42.45 - calWidth),
                                                            resizeMode: "contain",
                                                            opacity: day.count === 0 ? 0 : 1,
                                                            justifyContent: "flex-end"
                                                        }}
                                                    >
                                                        <Text
                                                            style={{
                                                                bottom: 5,
                                                                left: 10,
                                                                fontSize: regWidth * 14,
                                                                fontWeight: "900",
                                                                color: "#FFFFFF",
                                                            }}
                                                        >
                                                            {day.count}
                                                        </Text>
                                                    </ImageBackground>
                                                </View>
                                            )
                                        })}
                                    </View>
                                </View>
                            )
                        })
                        :
                        null
                    }
                {/* </View> */}
            </ScrollView>
        </View>
        
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.textNormal,
    },
    header: {
        // backgroundColor: "pink",
        marginTop: regHeight * 10,
        marginBottom: regHeight * 22,
        marginHorizontal: regWidth * 10,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    calender: {
        flexDirection: 'row', 
        flexWrap: 'wrap',
        marginTop: regHeight*7,
        // marginHorizontal: regWidth * 20,
        justifyContent: "flex-start",
        // backgroundColor: "green"
    },
    dayTxt: {
        color: colors.bgdLight, 
        fontSize: regWidth * 14, 
        fontWeight: "700", 
        lineHeight: regWidth * 20, 
    },
    dateTxt: {
        color: colors.bgdLight, 
        fontSize: regWidth * 11, 
        fontWeight: "700", 
        lineHeight: regWidth * 16, 
        marginBottom: regHeight * 4,
    }
})

export default NemoCalender;