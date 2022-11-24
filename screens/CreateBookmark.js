import { StyleSheet, View, SafeAreaView, KeyboardAvoidingView, Keyboard, TouchableWithoutFeedback, ScrollView, Text, TextInput, Button, Dimensions, Image, TouchableOpacity, Animated, Modal, Pressable, useWindowDimensions } from "react-native";
import React, { useEffect, useState, useCallback, useRef, } from "react";
import { Entypo, Feather, AntDesign, Ionicons, MaterialIcons, } from '@expo/vector-icons'; 
import { CardPreview, BlankCardFront, BlankCardChangable, AddBlankCardBack, BlankCardBack } from "../components/Card";
import Api from "../lib/Api";
import * as ImagePicker from 'expo-image-picker';
import bookCover from '../assets/images/steve.jpeg';
import emptyImage from '../assets/images/emptyImage.jpeg';
import {actions, RichEditor, RichToolbar} from "react-native-pell-rich-editor";
import { WebView } from 'react-native-webview';
// import HTMLView from 'react-native-htmlview';
import RenderHtml from 'react-native-render-html';
import HTML from 'react-native-render-html';

import { useSelector, useDispatch } from 'react-redux';
import { userSelector } from '../modules/hooks';
import { resetUserInfo, setShouldHomeRefresh, setShouldStorageRefresh, setShouldUserRefresh, } from '../modules/user';
import {colors, regWidth, regHeight} from '../config/globalStyles';

const {width:SCREEN_WIDTH} = Dimensions.get('window');

const webViewProps = {
    originWhitelist: "*"
  };

const CreateBookmark = ({navigation, route}) => {
    const dispatch = useDispatch();
    const { width } = useWindowDimensions();
    const [whatBook, setWhatBook] = useState('');
    const [bookTitle, setBookTitle] = useState('');
    const [whatChapter, setWhatChapter] = useState('');
    const [frontContent, setFrontContent] = useState('');
    const [backContent, setBackContent] = useState('');
    const [watermark, setWatermark] = useState('');
    const { accessToken, } = useSelector(userSelector);
    const [bookList, setBookList] = useState(null);
    const [color, setColor] = useState("#D9D9D9");

    const [modalVisible, setModalVisible] = useState(false);
    const [infoVisible, setInfoVisible] = useState(false);
    const [tagVisible, setTagVisible] = useState(false);
    const [albumVisible, setAlbumVisible] = useState(false);
    const [previewVisible, setPreviewVisible] = useState(false);

    const [loading, setLoading] = useState(false);
    const [image, setImage] = useState(null);
    const [backgroundImage, setBackgroundImage] = useState(null);
    const [status, requestPermission] = ImagePicker.useMediaLibraryPermissions();
    const [cameraPermission, requestCameraPermission] = ImagePicker.useCameraPermissions();

    const [newBookTitle, setNewBookTitle] = useState('');
    const [newBookAuthor, setNewBookAuthor] = useState('');
    const [selectedBook, setSelectedBook] = useState(null);

    const [addedNum, setAddedNum] = useState(0);
    const [firstContents, setFirstContents] = useState('');
    const [addedContents, setAddedContents] = useState([]);
    const [contents, setContents] = useState([]);
    const [info, setInfo] = useState('');
    const [tags, setTags] = useState([]);
    const [tagValue, setTagValue] = useState('');
    // const richText = useRef();
    const [richText, setRichText] = useState([]);
    const [isFocused, setIsFocused] = useState(true);
    const [focusNum, setFocusNum] = useState(0);

    const [contentsByNum, setContentsByNum] = useState([]);
    const [lineNum, setLineNum] = useState(0);
    const [cutIndex, setCutIndex] = useState([0, ]);
    const [current, setCurrent] = useState(0);
    const [contentsByLine, setContentsByLine] = useState([]);
    const [contentsByCard, setContentsByCard] = useState([]);

    const { ocrImage, } = route.params;
    const [ ocrLoading, setOcrLoading ] = useState(false);
    const { ocrText, setOcrText } = useState('');

    const [albums, setAlbums] = useState(null);
    const [albumId, setAlbumId] = useState('');


    
    useEffect(() => {
        updateWatermark();
        if (ocrImage !== null) {
            fetchOCR(ocrImage);
        }
    }, []);

    useEffect(() => {
        const cardNum = Math.ceil(contentsByLine.length / 9);
        let copy = [];

        for ( let i = 0; i < cardNum; i++) {
            copy = [...copy, contentsByLine.slice(i * 9, (i + 1) * 9)]
        }
        setContentsByCard(copy);
    }, [contentsByLine]);


    useEffect(() => {
        setContents([
            firstContents,
            ...addedContents
        ])
    }, [firstContents, addedContents]);

    // useEffect(() => {
    //     console.log(richText);
    //     console.log(richText[focusNum]);
    //     console.log(focusNum);
    // }, [richText]);


    const updateWatermark = async() => {
        await Api
        .get("/api/v2/bookmark/")
        .then((res) => {
            setWatermark(res.data.user_tag);
            // console.log(res.data);
        })
    }

    const onChangeChapter = (payload) => {
        setWhatChapter(payload);
    }

    const onChangeFront = (payload) => {
        setFrontContent(payload);
    }

    const onTextLayout = (e) => {
        console.log(e.nativeEvent.lines.length);
        console.log(e.nativeEvent);
    }

    const onChangeBack = (payload) => {
        setBackContent(payload);
    }

    const selectColor = (selectedColor) => {
        setColor(selectedColor);
    }

    const addBookmark = async() => {
        navigation.goBack();
        const formData = new FormData();
        // console.log(contents);
        formData.append('book_id', selectedBook.book_id);
        formData.append('chapter_title', whatChapter);
        // formData.append('nemos', JSON.stringify(contents));
        formData.append('contents', JSON.stringify(contentsByCard));
        formData.append('hex', color);
        formData.append('text', info);
        formData.append('tags', JSON.stringify(tags));
        formData.append('album_id', albumId);
        if (backgroundImage !== null) {
            const filename = backgroundImage.split('/').pop();
            const match = /\.(\w+)$/.exec(filename ?? '');
            const type = match ? `image/${match[1]}` : `image`;
            formData.append('backgroundimg', {
                uri: backgroundImage,
                type: type,
                name: filename
            });
        }

        try {
            console.log(formData);
            await Api.post("/api/v2/bookmark/create/", formData,
                {
                    headers: {
                        'content-type': 'multipart/form-data',
                    },
                },
            )
            .then((res) => {
                console.log(res.data);
                
                dispatch(setShouldHomeRefresh(true));
                dispatch(setShouldStorageRefresh(true));
                dispatch(setShouldUserRefresh(true));
            })
        } catch (err) {
            console.error(err);
        }
    }

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
            quality: 0.7,
          });
      
        //   console.log(result.uri);
      
          if (!result.cancelled) {
            setImage(result.uri);
          }
        } catch (error) {
          console.error(error);
        }
        setLoading(false);
    };

    const pickBackgroundImage = async () => {
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
      
        //   console.log(result.uri);
      
          if (!result.cancelled) {
            setBackgroundImage(result.uri);
            setColor(null);

          }
        } catch (error) {
          console.error(error);
        }
        setLoading(false);
    };

    const fetchOCR = async (ocrImage) => {
        const formData = new FormData();
        const filename = ocrImage.split('/').pop();
        const match = /\.(\w+)$/.exec(filename ?? '');
        const type = match ? `image/${match[1]}` : `image`;
        formData.append('image', {
            uri: ocrImage,
            type: type,
            name: filename
        });

        try {
            setOcrLoading(true);
            await Api
            .put('/api/v2/bookmark/ocr/', formData, 
            {
                headers: {
                    'content-type': 'multipart/form-data',
                },
            }
            )
            .then((res) => {
                console.log(res.data);
                // setOcrText(res.data.message);
                setFrontContent(res.data.message);
            })
        } catch (err) {
            console.error(err)
        }
        setOcrLoading(false);
    };


    const CreateBook = async() => {
        const formData = new FormData();
        if (image !== null) {
            const filename = image.split('/').pop();
            const match = /\.(\w+)$/.exec(filename ?? '');
            const type = match ? `image/${match[1]}` : `image`;
            formData.append('book_cover', {
                uri: image,
                type: type,
                name: filename
            });
        }

        formData.append('book_title', newBookTitle);
        formData.append('book_author', newBookAuthor);

        try {
            await Api
            .put("/api/v3/book/add/", formData,
                {
                    headers: {
                        'content-type': 'multipart/form-data',
                    },
                }
            )
            .then((res) => {
                console.log(res.data);
                // navigation.goBack();
                setSelectedBook(res.data);
                setModalVisible(false);
            })
        } catch (err) {
            console.error(err);
        }
    }

    const addCard = () => {
        setAddedNum(addedNum + 1);
        setAddedContents([
            ...addedContents,
            '',
        ])
    }

    const writeCard = (payload, index) => {
        let copy = [...addedContents];
        copy[index] = payload;
        setAddedContents([
            ...copy
        ]);
        // console.log(addedContents);
    }

    const deleteCard = (index) => {
        setAddedNum(addedNum - 1);
        // console.log(addedContents);
        let copy = [...addedContents];
        copy.splice(index, 1);
        setAddedContents([
            ...copy,
        ]);
    }

    const changeInfo = (payload) => setInfo(payload);

    const changeTag = (payload) => {
        if (payload.indexOf(",") !== -1) {
            setTags([
                ...tags,
                payload.split(",")[0]
            ]);
            setTagValue('');
        } else {
            setTagValue(payload);
        }
    }

    const submitTag = (e) => {
        if (tagValue.length > 0) {
            setTags([
                ...tags,
                tagValue,
            ]);
            setTagValue('');
        }
    }

    const deleteTag = (index) => {
        let copy = [...tags];
        copy.splice(index, 1);
        setTags(copy);
    }

    const handleCurrentChange = (e) => {
        const nextCurrent = Math.floor(
            e.nativeEvent.contentOffset.x / (SCREEN_WIDTH - 26),
        );
        if (nextCurrent < 0) {
            return;
        }
        // console.log(nextCurrent);
        setCurrent(nextCurrent);
    };

    const fetchAlbumList = async() => {
        try {
            await Api
            .get("/api/v4/album/list/")
            .then((res) => {
                console.log(res.data);
                setAlbums(res.data);
            })
        } catch (err) {
            console.error(err);
        }
    }



    return (
        <View style={styles.container}>
            <SafeAreaView style={styles.header} >
                <View style={{ flexDirection: "row", alignItems: "center", }}>
                    <Text style={{ fontSize: 25, fontWeight: "900", marginRight: 15, }} >Create</Text>
                    <Feather name="bookmark" size={28} color="black" />
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", }}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Text style={{ fontSize: 15, fontWeight: "500", marginRight: 25, }} >취소</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={addBookmark}>
                        <Text style={{ fontSize: 15, fontWeight: "500", color: "#008000" }} >완료</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>

            <ScrollView
                showsVerticalScrollIndicator={false}
            >
                {/* <ScrollView
                    pagingEnabled
                    horizontal
                    showsHorizontalScrollIndicator={false}
                >
                    {contentsByNum.map((contents, index) => (
                        <CardPreview 
                            contents={contents}
                            hex={color}
                            backgroundImage={backgroundImage}
                            bookCover={bookCover}
                            watermark={watermark} 
                            index={index}
                            key={index}
                        />
                    ))}
                </ScrollView> */}
                <BlankCardChangable 
                    color={color} 
                    setBookTitle={setBookTitle} 
                    selectedBook={selectedBook}
                    setSelectedBook={setSelectedBook}
                    onChangeChapter={onChangeChapter} 
                    frontContent={frontContent}
                    onChangeFront={onChangeFront} 
                    watermark={watermark} 
                    setModalVisible={setModalVisible}
                    backgroundImage={backgroundImage}
                    setLineNum={setLineNum}
                    contentsByLine={contentsByLine}
                    setContentsByLine={setContentsByLine}
                    setContentsByCard={setContentsByCard}
                    ocrLoading={ocrLoading}
                />
                
                {/* <BlankCardFront 
                    color={color} 
                    setBookTitle={setBookTitle} 
                    selectedBook={selectedBook}
                    setSelectedBook={setSelectedBook}
                    onChangeChapter={onChangeChapter} 
                    onChangeFront={onChangeFront} 
                    watermark={watermark} 
                    setModalVisible={setModalVisible}
                    richText={richText}
                    setIsFocused={setIsFocused}
                    setRichText={setRichText}
                    setFocusNum={setFocusNum}
                    setFirstContents={setFirstContents}
                    backgroundImage={backgroundImage}
                /> */}
                {/* {addedContents.map((contents, index) => (
                    <BlankCardBack 
                        color={color} 
                        onChangeBack={onChangeBack} 
                        watermark={watermark} 
                        richText={richText}
                        setIsFocused={setIsFocused}
                        setRichText={setRichText}
                        setFocusNum={setFocusNum}
                        contents={contents}
                        index={index}
                        writeCard={writeCard}
                        deleteCard={deleteCard}
                        addedContents={addedContents}
                        backgroundImage={backgroundImage}
                        key={index}
                    />
                ))} */}

            {/* <Pressable
                onPress={addCard}
            >
                <AddBlankCardBack
                    color={color}
                    backgroundImage={backgroundImage}
                />
            </Pressable> */}

                
                <View style={styles.optionBar}>
                    <View style={{ flexDirection: "row", }} >
                        <TouchableOpacity 
                            activeOpacity={1} 
                            style={{...styles.optionBox, backgroundColor: "#D9D9D9"}}
                            onPress={() => {
                                selectColor("#D9D9D9");
                                setBackgroundImage(null);
                            }}
                        />
                        <TouchableOpacity 
                            activeOpacity={1} 
                            style={{...styles.optionBox, backgroundColor: "#FFCECE"}} 
                            onPress={() => {
                                selectColor("#FFCECE");
                                setBackgroundImage(null);
                            }}
                        />
                        <TouchableOpacity 
                            activeOpacity={1} 
                            style={{...styles.optionBox, backgroundColor: "#FFF0BC"}} 
                            onPress={() => {
                                selectColor("#FFF0BC");
                                setBackgroundImage(null);
                            }}
                        />
                        <TouchableOpacity 
                            activeOpacity={1} 
                            style={{...styles.optionBox, backgroundColor: "#BDFFD0"}} 
                            onPress={() => {
                                selectColor("#BDFFD0");
                                setBackgroundImage(null);
                            }}
                        />
                        <TouchableOpacity 
                            activeOpacity={1} 
                            style={{...styles.optionBox, backgroundColor: "#8BB7EA"}} 
                            onPress={() => {
                                selectColor("#8BB7EA");
                                setBackgroundImage(null);
                            }}
                        />
                        <TouchableOpacity 
                            activeOpacity={1} 
                            style={{...styles.optionBox, backgroundColor: "#D2BDFF"}} 
                            onPress={() => {
                                selectColor("#D2BDFF");
                                setBackgroundImage(null);
                            }}
                        />
                        {/* <TouchableOpacity 
                            activeOpacity={1} 
                            style={styles.optionBox} 
                            onPress={pickBackgroundImage}
                        >
                            <MaterialIcons name="add-photo-alternate" size={24} color="black" />
                        </TouchableOpacity> */}
                    </View>
                </View>
                
                {/* <WebView
                    style={styles.TagAddBox} 
                    source={{ html: firstContents }}
                /> */}
                {/* <HTML source={{ html: firstContents }} contentWidth={250} /> */}

                {/* <RenderHtml 
                    style={styles.TagAddBox} 
                    contentWidth={width}
                    source={{ html: firstContents }}
                    tagsStyles={tagsStyles}
                /> */}
                
                {/* <RenderHtml 
                    style={styles.TagAddBox} 
                    contentWidth={width}
                    source={{ html: '<div><i>asdfㅁㄴ이ㅏ럼;ㅣㄴ아러</i></div>' }}
                    tagsStyles={tagsStyles}
                /> */}


                {/* <Pressable 
                    style={styles.TagAddBox} 
                    // onPress={() => setInfoVisible(true)}    
                >
                    <Entypo name="edit" size={20} color="black" />
                    <Text 
                        style={{ fontSize: 17, fontWeight: "500", marginHorizontal: 8, }}
                        // onTextLayout={onTextLayout}
                    >
                        { frontContent }
                    </Text>
                </Pressable> */}

                <View style={{ alignItems: "center", }}>
                    <Pressable 
                        style={styles.previewBtn} 
                        onPress={() => setPreviewVisible(true)}    
                    >
                        <Text style={{ fontSize: regWidth * 14, fontWeight: "500", marginHorizontal: 8, color: "#D3D3D3", }} >미리보기</Text>
                    </Pressable>
                </View>
                <Pressable 
                    style={styles.TagAddBox} 
                    onPress={() => setInfoVisible(true)}    
                >
                    <Entypo name="edit" size={regWidth * 20} color="black" />
                    <Text style={{ fontSize: regWidth * 17, fontWeight: "500", marginHorizontal: 8, }} >설명 추가</Text>
                </Pressable>
                <Pressable 
                    style={styles.TagAddBox} 
                    onPress={() => setTagVisible(true)}    
                >
                    <Feather name="hash" size={regWidth * 20} color="black" />
                    <Text style={{ fontSize: regWidth * 17, fontWeight: "500", marginHorizontal: 8, }} >태그 추가</Text>
                </Pressable>
                <Pressable 
                    style={styles.TagAddBox} 
                    onPress={() => {
                        setAlbumVisible(true);
                        fetchAlbumList();
                    }}    
                >
                    <Feather name='folder' size={regWidth * 20} color="black" />
                    <Text style={{ fontSize: regWidth * 17, fontWeight: "500", marginHorizontal: 8, }} >앨범 선택</Text>
                </Pressable>

                <View style={{height: 200}} ></View>
            </ScrollView>

            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
            >
                <Pressable 
                    style={[
                        StyleSheet.absoluteFill,
                        { backgroundColor: 'rgba(0, 0, 0, 0.5)' },
                    ]}
                    onPress={()=>
                        {
                            setModalVisible(false);
                        }
                    }
                />
                <View style={{...styles.modal, height: regHeight * 440, }}>
                    <SafeAreaView style={styles.modalHeader}>
                        <Pressable
                            hitSlop={{ bottom: 10, left: 10, right: 10, top: 10 }}
                            onPress={() => {
                                setModalVisible(false);
                            }}
                        >
                            <Text style={{fontSize: 15, fontWeight: "500", }} >
                                취소
                            </Text>
                        </Pressable>
                        <Text style={{fontSize: 16, fontWeight: "700", }} >
                            책 등록하기
                        </Text>
                        <Pressable
                            hitSlop={{ bottom: 10, left: 10, right: 10, top: 10 }}
                            activeOpacity={1}
                            onPress={CreateBook}
                        >
                            <Text style={{fontSize: 15, fontWeight: "500", color: "#008000" }}>
                                등록
                            </Text>
                        </Pressable>
                    </SafeAreaView>
                    <View style={styles.addBook}>
                        <View style={{ alignItems: 'center', }}>
                            <Image 
                                source={image === null ? emptyImage : { uri: image }} 
                                style={styles.bookCoverImage}
                            />
                            <TouchableOpacity
                                style={{ marginTop: 15, }}
                                activeOpacity={1}
                                onPress={pickImage}
                            >
                                <Text style={{ fontSize: 15, fontWeight: "500", color: "#FF4040", }}>
                                    책 커버 가져오기
                                </Text>
                            </TouchableOpacity>
                        </View>
                        <View 
                           style={{ alignItems: 'center', }}
                        >
                            <TextInput 
                                placeholder="책 제목"
                                style={{ fontSize: 18, fontWeight: "500",marginTop: 10, }}
                                onChangeText={(payload) =>  setNewBookTitle(payload)}
                            />
                            <TextInput 
                                placeholder="작가"
                                style={{ fontSize: 18, fontWeight: "500", marginTop: 10, }}
                                onChangeText={(payload) =>  setNewBookAuthor(payload)}
                            />
                        </View>
                        {/* <TouchableOpacity
                            activeOpacity={1}
                            onPress={CreateBook}
                        >
                            <Text style={{ fontSize: 15, fontWeight: "500", color: "green", }}>
                                등록
                            </Text>
                        </TouchableOpacity> */}
                    </View>
                </View>
            </Modal>

            <Modal
                animationType="fade"
                transparent={true}
                visible={infoVisible}
            >
                <Pressable 
                    style={[
                        StyleSheet.absoluteFill,
                        { backgroundColor: 'rgba(0, 0, 0, 0.5)' },
                    ]}
                    onPress={()=>
                        {
                            setInfoVisible(false);
                        }
                    }
                />
                <View style={styles.modal}>
                    <SafeAreaView style={styles.modalHeader}>
                        <Pressable
                            hitSlop={{ bottom: 10, left: 10, right: 10, top: 10 }}
                            style={{ opacity: 0 }}
                            // onPress={() => {
                            //     setInfoVisible(false);
                            //     setInfo('');
                            // }}
                        >
                            <Text style={{fontSize: regWidth * 15, fontWeight: "500", }} >
                                취소
                            </Text>
                        </Pressable>
                        <Text style={{fontSize: regWidth * 16, fontWeight: "700", }} >
                            북마크 설명 추가
                        </Text>
                        <Pressable
                            hitSlop={{ bottom: 10, left: 10, right: 10, top: 10 }}
                            onPress={() => {
                                setInfoVisible(false);
                            }}
                        >
                            <Text style={{fontSize: regWidth * 15, fontWeight: "500", color: "#008000" }}>
                                완료
                            </Text>
                        </Pressable>
                    </SafeAreaView>
                    <TextInput 
                        placeholder="설명을 입력해주세요"
                        style={{
                            ...styles.modalInput,
                            height: "55%",
                        }}
                        onChangeText={changeInfo}
                        multiline={true}
                        value={info}
                    />
                </View>
            </Modal>

            <Modal
                animationType="fade"
                transparent={true}
                visible={tagVisible}
            >

                <Pressable 
                    style={[
                        StyleSheet.absoluteFill,
                        { backgroundColor: 'rgba(0, 0, 0, 0.5)' },
                    ]}
                    onPress={()=>
                        {
                            setTagVisible(false);
                        }
                    }
                />
            {/* <KeyboardAvoidingView 
                style={styles.modal}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
            > */}
                <View style={styles.modal}>
                    <SafeAreaView style={styles.modalHeader}>
                        <Pressable
                            hitSlop={{ bottom: 10, left: 10, right: 10, top: 10 }}
                            style={{ opacity: 0 }}
                            // onPress={() => {
                            //     setTagVisible(false);
                            // }}
                        >
                            <Text style={{fontSize: regWidth * 15, fontWeight: "500", }} >
                                취소
                            </Text>
                        </Pressable>
                        <Text style={{fontSize: regWidth * 16, fontWeight: "700", }} >
                            태그 추가하기
                        </Text>
                        <Pressable
                            hitSlop={{ bottom: 10, left: 10, right: 10, top: 10 }}
                            onPress={() => setTagVisible(false)}
                        >
                            <Text style={{fontSize: regWidth * 15, fontWeight: "500", color: "#008000" }}>
                                완료
                            </Text>
                        </Pressable>
                    </SafeAreaView>
                    <TextInput 
                        placeholder="쉼표 혹은 엔터를 입력하여 태그를 등록하세요"
                        style={{
                            ...styles.modalInput,
                            height: regHeight * 50,
                        }}
                        onChangeText={changeTag}
                        onSubmitEditing={submitTag}
                        value={tagValue}
                    />
                    <View style={{ flexDirection: "row", }}>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                    >
                        {tags.map((tag, index) => (
                            <View style={styles.tagContainer} key={index}>
                                <Text style={{ fontSize: regWidth * 15, fontWeight: "500", color: "#9250FF", marginRight: 4,}}>
                                    {`#${tag}`}
                                </Text>
                                <Pressable
                                    onPress={() => deleteTag(index)}
                                    hitSlop={{ bottom: 10, left: 10, right: 10, top: 10 }}
                                >
                                    <Feather name="x" size={20} color="#909090" />
                                </Pressable>
                            </View>
                        ))}
                    </ScrollView>
                    </View>

                </View>
            {/* </KeyboardAvoidingView> */}

            </Modal>

            <Modal
                animationType="fade"
                transparent={true}
                visible={albumVisible}
            >
                <Pressable 
                    style={[
                        StyleSheet.absoluteFill,
                        { backgroundColor: 'rgba(0, 0, 0, 0.5)' },
                    ]}
                    onPress={()=>
                        {
                            setAlbumVisible(false);
                        }
                    }
                />
                <View 
                    style={{
                        ...styles.modal,
                        height: regHeight * 480, 
                        bottom: 0,
                    }}
                >
                    <SafeAreaView style={{
                        ...styles.modalHeader, 
                        marginTop: regHeight * 28,
                        justifyContent: "center",
                    }}>
                        {/* <Pressable
                            hitSlop={{ bottom: 10, left: 10, right: 10, top: 10 }}
                            onPress={() => setAlbumVisible(false)}
                        >
                            <Text style={{fontSize: 15, fontWeight: "500", }} >
                                취소
                            </Text>
                        </Pressable> */}
                        <Text style={{fontSize: 16, fontWeight: "700", }} >
                            저장할 앨범 찾기
                        </Text>
                        {/* <Text style={{fontSize: 15, fontWeight: "500", color: "#008000" }}>
                            완료
                        </Text> */}
                    </SafeAreaView>
                    <View style={{ alignItems: "center", }}>
                        <ScrollView
                            style={styles.albumListContainer}
                        >
                            {albums !== null && albums.map((album, index) => (
                                <Pressable 
                                    style={styles.albumList}
                                    key={index}
                                    onPress={() => {
                                        setAlbumId(album.album_id);
                                        setAlbumVisible(false);
                                    }}
                                >
                                    <Image 
                                        source={{ uri: album.album_cover }}
                                        style={styles.albumImage}
                                    />
                                    <Text style={{ fontSize: 15, fontWeight: "500", marginHorizontal: 8, }}>
                                        {album.album_title}
                                    </Text>
                                </Pressable>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            <Modal
                animationType="fade"
                transparent={true}
                visible={previewVisible}
            >
                <Pressable 
                    style={[
                        StyleSheet.absoluteFill,
                        { backgroundColor: 'rgba(0, 0, 0, 0.5)' },
                    ]}
                    onPress={()=>
                        {
                            setPreviewVisible(false);
                            setCurrent(0);
                        }
                    }
                />
                <View style={{...styles.modal, height: regHeight * 480, }}>
                    <SafeAreaView style={styles.modalHeader}>
                        <Pressable
                            hitSlop={{ bottom: 10, left: 10, right: 10, top: 10 }}
                            style={{ opacity: 0 }}
                            onPress={() => {
                                setPreviewVisible(false);
                                setCurrent(0);
                            }}
                        >
                            <Text style={{fontSize: 15, fontWeight: "500", }} >
                                닫기
                            </Text>
                        </Pressable>
                        <Text style={{fontSize: 16, fontWeight: "700", }} >
                            미리보기
                        </Text>
                        <Pressable
                            hitSlop={{ bottom: 10, left: 10, right: 10, top: 10 }}
                        >
                            <Text style={{fontSize: 15, fontWeight: "500", }} >
                                닫기
                            </Text>
                        </Pressable>
                    </SafeAreaView>
                    <ScrollView
                        pagingEnabled
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        onScroll={handleCurrentChange}
                        scrollEventThrottle={16}
                    >
                        {/* {contentsByNum.map((contents, index) => (
                            <CardPreview 
                                bookTitle={selectedBook !== null ? selectedBook.book_title : "책 제목"}
                                whatChapter={selectedBook !== null ? whatChapter : "챕터" }
                                bookCover={selectedBook !== null ? selectedBook.book_cover : null }
                                contents={contents}
                                hex={color}
                                backgroundImage={backgroundImage}
                                watermark={watermark} 
                                index={index}
                                key={index}
                            />
                        ))} */}
                        {contentsByCard.map((contents, index) => (
                            <CardPreview 
                                bookTitle={selectedBook !== null ? selectedBook.book_title : "책 제목"}
                                whatChapter={selectedBook !== null ? whatChapter : "챕터" }
                                bookCover={selectedBook !== null ? selectedBook.book_cover : null }
                                contents={contents}
                                hex={color}
                                backgroundImage={backgroundImage}
                                watermark={watermark} 
                                index={index}
                                key={index}
                            />
                        ))}
                    </ScrollView>
                    <View style={{
                        flexDirection: "row", 
                        alignItems: "center", 
                        justifyContent: "center", 
                        marginTop: -12, 
                    }}>
                        {contentsByCard.map((contents, index) => {
                            if (index === current) {
                                return <Entypo name="dot-single" size={24} color="red" style={{ marginHorizontal: -4, }} key={index} />
                            }
                            return <Entypo name="dot-single" size={24} color="grey" style={{ marginHorizontal: -4, }} key={index} />
                        })}
                    </View>
                </View>
            </Modal>
            {/* {richText.length !== 0 ? 
                <KeyboardAvoidingView 
                    style={{ 
                        position: "absolute", 
                        bottom: 0, 
                        zIndex: 10, 
                        backgroundColor: "white", 
                        width: "100%", 
                        borderTopWidth: 0.3,
                        borderTopColor: "grey",
                    }}
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                >
                    <RichToolbar
                        editor={richText[focusNum]}
                        selectedIconTint="red"
                        iconTint="#312921"
                        actions={[
                            actions.insertImage,
                            actions.setBold,
                            actions.setItalic,
                            actions.insertBulletsList,
                            actions.insertOrderedList,
                            actions.insertLink,
                            actions.keyboard,
                            actions.setStrikethrough,
                            actions.setUnderline,
                            actions.removeFormat,
                            actions.insertVideo,
                            actions.checkboxList,
                            actions.undo,
                            actions.redo,
                        ]}
                        style={{ backgroundColor: "white", }}
                    />
                </KeyboardAvoidingView>
                : 
                null
            } */}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "white",
    },
    header: {
        // backgroundColor: "red",
        marginVertical: 10,
        marginHorizontal: 20,
        paddingBottom: 8,
        flexDirection: "row",
        justifyContent: "space-between"

    },
    searchInput: {
        backgroundColor: "#EEEEEE",
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 10,
        marginVertical: 13,
        marginHorizontal: 20,
        fontSize: 18,
    },
    optionBar: {
        flexDirection: "row", 
        justifyContent: "space-between", 
        alignItems: "center",
        marginHorizontal: 8,
        marginVertical: 20,
    },
    optionBox: {
        borderWidth: 1,
        borderColor: "black",
        height: regWidth * 30,
        width: regWidth * 30,
        justifyContent: "center",
        alignItems: "center",
        marginHorizontal: regWidth * 5,
    },
    TagAddBox: {
        flexDirection: "row",
        borderTopWidth: 1,
        borderTopColor: "grey",
        borderBottomColor: "grey",
        paddingVertical: 20,
        paddingHorizontal: 10,
        alignItems: "center",
    },
    modal: {
        width: '100%', 
        // height: '35%',
        height: regHeight * 220, 
        position: 'absolute', 
        // bottom: 0, 
        backgroundColor: 'white', 
        borderRadius: 10, 
        paddingTop: 10,
    },
    addBook: {
        marginTop: 18,
        // flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    bookCoverImage: {
        width: regWidth * 130,
        height: regWidth * 130,
        resizeMode: "contain",
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: regHeight * 10,
        marginHorizontal: regWidth * 18, 
    },
    modalInput: {
        backgroundColor: "#EEEEEE",
        marginHorizontal: regWidth * 22,
        marginVertical: regHeight * 22,
        borderRadius: 10,
        height: "25%",
        paddingHorizontal: regWidth * 8,
        fontSize: regWidth * 15,
        fontWeight:"500",
    },
    tagContainer: {
        backgroundColor: "#EEEEEE",
        borderRadius: 999,
        paddingVertical: regHeight * 8,
        paddingHorizontal: regWidth * 8, 
        marginHorizontal: regWidth * 8, 
        flexDirection: "row", 
        alignItems: "center", 
        justifyContent: "center", 
    },
    previewBtn: {
        borderWidth: 2,
        borderColor: "#D3D3D3",
        borderRadius: 999,
        width: regWidth * 99,
        marginBottom: 28,
        paddingHorizontal: 8,
        paddingVertical: 8,
        alignItems: "center",
        justifyContent: "center",
    },
    albumListContainer: {
        backgroundColor: "#EEEEEE",
        width: regWidth * 350,
        height: regHeight * 350,
        borderRadius: 10,
        marginTop: 18,
    },
    albumList: {
        borderBottomWidth: 0.3,
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        paddingHorizontal: 12,
    },
    albumImage: {
        width: 45,
        height: 45,
    },
})

const tagsStyles = {
    div: {
        color: 'green',
        fontWeight: "500",
        fontSize: 16,
    },
    span: {
        color: 'green',
        fontWeight: "500",
        fontSize: 16,
    },
    // i: {
    //     fontStyle: "italic",
    // }
};

export default CreateBookmark;


function useDebounce(value, delay = 500) {
    const [debounceVal, setDebounceVal] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebounceVal(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debounceVal;
}