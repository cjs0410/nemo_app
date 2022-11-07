import {Dimensions} from 'react-native';

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