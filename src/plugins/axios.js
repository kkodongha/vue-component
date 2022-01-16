import axios from 'axios';
import qs from 'qs';
import router from '@/routes';
import { config, getCookie } from '@/utils/helper';

/*
 * 내부망에서 axios 호출시 프로토콜 유지
 * ex) https -> https, http -> http
 */
export function protocolConversion(url) {
  if (
    process.env.NODE_ENV === 'production' &&
    window.location.protocol === 'https:'
  ) {
    url = url.replace('http:', 'https:').replace(':port', '');
  } else {
    url = url.replace(':port', `:32494`);
  }
  return url;
}

export default {
  install(Vue) {
    const errorMessageHandler = (error) => {
      // 네트워크 에러
      if ('toJSON' in error && error.toJSON().message === 'Network Error')
        Vue.prototype.$swal({
          icon: 'error',
          title: '네트워크가 연결되지 않았습니다. 다시 시도해주시기 바랍니다.',
        });
      // 403 에러
      else if (error.response.status === 403) {
        if (error.response.data && error.response.data.errorCode)
          Vue.prototype.$swal({
            icon: 'error',
            title: error.response.data.errorMessage,
          });
        router.push({ name: '404' });
      }
      // 500 에러
      else if (error.response.status === 500) {
        if (error.response.data && 'errorCode' in error.response.data) {
          const errorCode = parseInt(error.response.data.errorCode);
          console.log('error', errorCode);
          if (parseInt(errorCode) <= 999)
            Vue.prototype.$swal({
              icon: 'error',
              title: error.response.data.errorMessage,
            });
        } else
          Vue.prototype.$swal({
            icon: 'error',
            html: '예기치 못한 오류가 발생하였습니다.<br/>다시 시도해주시기 바랍니다.',
          });
      } else {
        if (error.response.data && error.response.data.errorCode) {
          const errorCode = parseInt(error.response.data.errorCode);
          if (errorCode <= 999)
            Vue.prototype.$swal({
              icon: 'error',
              title: error.response.data.errorMessage,
            });
        } else
          Vue.prototype.$swal({
            icon: 'error',
            html: '예기치 못한 오류가 발생하였습니다.<br/>다시 시도해주시기 바랍니다.',
          });
      }
    };

    const authConfigHandler = async (config) => {
      const accessToken = getCookie('adminAccessToken');
      config.headers.Authorization = `Bearer ${accessToken}`;
      return config;
    };

    const authErrorHandler = async (error) => {
      if (
        error.response &&
        error.response.status &&
        error.response.status === 401 &&
        'errorCode' in error.response.data
      ) {
        let isPushLoginPage = false;
        let errorMessage = undefined;
        if (error.response.data.errorCode === '1001') {
          try {
            await http.post('/backoffice/auth/update-token', {
              accessToken: getCookie('adminAccessToken'),
            });
          } catch (e) {
            isPushLoginPage = true;
            errorMessage = '잘못된 인증 정보로 인해 로그아웃 되었습니다.';
          }
          if (!isPushLoginPage) {
            const reqConfig = error.config;
            const response =
              reqConfig.method === 'get' || reqConfig.method === 'delete'
                ? await http[reqConfig.method](reqConfig.url, {
                    params: reqConfig.params,
                  })
                : await http[reqConfig.method](reqConfig.url, reqConfig.data);
            return response;
          }
        } else if (error.response.data.errorCode === '1002') {
          isPushLoginPage = true;
          errorMessage = '잘못된 인증 정보로 인해 로그아웃 되었습니다.';
        } else if (error.response.data.errorCode === '1003') {
          isPushLoginPage = true;
          errorMessage = '다른 컴퓨터에서 로그인하여 로그아웃 되었습니다.';
        }
        if (isPushLoginPage)
          router.push({ name: 'authLogin', query: { errorMessage } });
      }
      return null;
    };

    const http = axios.create({
      baseURL: protocolConversion(
        `${config.url.api}/v${process.env.npm_package_version.replace(
          /\./g,
          '-'
        )}`
      ),
      withCredentials: true,
      headers: {
        Accept: 'application/json; charset=utf-8',
        'Content-Type': 'application/json',
      },
      paramsSerializer(params) {
        return qs.stringify(params, {});
      },
    });

    http.interceptors.request.use(
      (config) => {
        // 인증 관련 헤더 등록
        config = authConfigHandler(config);
        return config;
      },
      (error) => {
        // Do something with request error
        return Promise.reject(error);
      }
    );

    http.interceptors.response.use(
      (response) => {
        // Any status code that lie within the range of 2xx cause this function to trigger
        // Do something with response data
        return response;
      },
      async (error) => {
        if (axios.isCancel(error)) return;

        const response = await authErrorHandler(error);
        if (response) return response;

        errorMessageHandler(error);
        return Promise.reject(error);
      }
    );

    /** 파일 다운로드시 */
    const http2 = axios.create({
      baseURL: protocolConversion(
        `${config.url.api}/v${process.env.npm_package_version.replace(
          /\./g,
          '-'
        )}`
      ),
      withCredentials: true,
      headers: {
        Accept: 'application/json; charset=utf-8',
        'Content-Type': 'application/json',
      },
      responseType: 'blob',
      paramsSerializer(params) {
        return qs.stringify(params, {});
      },
    });

    http2.interceptors.request.use(
      (config) => {
        // 인증 관련 헤더 등록
        config = authConfigHandler(config);
        return config;
      },
      (error) => {
        // Do something with request error
        return Promise.reject(error);
      }
    );

    http2.interceptors.response.use(
      (response) => {
        return response;
      },
      async (error) => {
        if (axios.isCancel(error)) return;

        const blobData = error?.response?.data;
        if (
          blobData &&
          blobData instanceof Blob &&
          blobData.type === 'application/json'
        ) {
          return Promise.reject(
            await new Promise((resolve) => {
              const reader = new FileReader();
              reader.onload = async (e) => {
                errorMessageHandler(error);
                resolve(error);
              };
              reader.onerror = () => {
                resolve(error);
              };
              reader.readAsText(blobData);
            })
          );
        } else {
          return Promise.reject(error);
        }
      }
    );

    const UPLOAD_URL = config.url.upload;

    Vue.prototype.$axios = {
      post: (api, params) => http.post(api, params),
      get: (api, params) => http.get(api, { params: params }),
      put: (api, params) => http.put(api, params),
      delete: (api, params) => http.delete(api, { params: params }),
      upload: (params, eventFunction) =>
        http.post(
          UPLOAD_URL + `${params.addUrl === '' ? '' : '/' + params.addUrl}`,
          params.formdata,
          { onUploadProgress: eventFunction }
        ),
      download: (api, params, eventFunction) =>
        http2.get(api, { params, ...eventFunction }),
    };
  },
};
