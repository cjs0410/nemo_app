import {Dimensions, StyleSheet, } from 'react-native';

export const basicDimensions = { // 디자이너가 작업하고 있는 XD파일 스크린의 세로,가로
    height: 844,
    width: 390,
};

export const regHeight = ( // 높이 변환 작업
  Dimensions.get('screen').height *
  (1 / basicDimensions.height)
).toFixed(2);

export const regWidth = ( // 가로 변환 작업
  Dimensions.get('screen').width *
  (1 / basicDimensions.width)
).toFixed(2);

export const colors = {
  textLight: "#606060",
  textNormal: "#404040",
  textDark: "#202020",
  nemoLight: "#ab8dff",
  nemoNormal: "#8f67ff",
  nemoDark: "#5b34cc",
  bgdLight: "#D9D9D9",
  bgdNormal: "#aeaeae",
  bgdDark: "#828282",
  white: "#FFFFFF",
  redLight: "#ff6666",
  redNormal: "#ff3333",
  redDark: "#cc0100",
}