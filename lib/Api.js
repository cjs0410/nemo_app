import axios from "axios";
import { useSelector, useDispatch } from 'react-redux';
import { userSelector } from '../modules/hooks';
import { resetUserInfo } from '../modules/user';
import AsyncStorage from '@react-native-async-storage/async-storage';
import jwt_decode from "jwt-decode";

axios.defaults.xsrfCookieName = 'csrftoken';
axios.defaults.xsrfHeaderName = 'X-CSRFTOKEN';

const Api = axios.create({
        // baseURL: "http://3.38.62.105",
        baseURL: "http://52.78.70.34"
});


Api.interceptors.request.use(
        async function (config) {
                const accessToken = await AsyncStorage.getItem('access');
                if (accessToken === null) {
                        config.headers["Authorization"] = null;
                        return config;
                }
                config.headers["Authorization"] = accessToken;
                return config;
        }
)

Api.interceptors.response.use(
        function (response) {
                return response
        },
        async function (error) {
                const refreshToken = await AsyncStorage.getItem('refresh');
                if (error.response && (error.response.status === 403)) {
                // if (error.response && (error.response.status === 403)) {
                        try {
                                const originalRequest = error.config;
                                const data = await Api.post("/api/v1/user/refresh/", {
                                        refresh: refreshToken,
                                });
                                if (data) {
                                        const accessToken = data.data.access;
                                        await AsyncStorage.setItem('access', data.data.access);
                                        originalRequest.headers["Authorization"] = accessToken;
                                        return await Api.request(originalRequest);
                                }
                        } catch (error) {
                                console.error(error)
                        }
                        return Promise.reject(error)
                }
                return Promise.reject(error)
        }
)

export default Api;