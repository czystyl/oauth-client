const Axios = require('axios');

const apiURL = process.env.APIURL;
const tokenEndpoint = process.env.TOKEN_ENDPOINT;

const oauthCredentials = {
  client_id: process.env.CLIENT_ID,
  client_secret: process.env.CLIENT_SECRET
};

let tokenData = {
  access_token: localStorage.getItem('access_token'),
  refresh_token: localStorage.getItem('refresh_token')
};

const client = Axios.create({ baseURL: apiURL });

client.refreshToken = () =>
  Axios.post(tokenEndpoint, {
    ...oauthCredentials,
    refresh_token: tokenData.refresh_token,
    grant_type: 'refresh_token'
  }).then(response => {
    localStorage.setItem('access_token', response.data.access_token);
    localStorage.setItem('refresh_token', response.data.refresh_token);

    tokenData = response.data;
    return response;
  });

client.interceptors.request.use(config => {
  if (tokenData.access_token) {
    return {
      ...config,
      headers: { Authorization: `Bearer ${tokenData.access_token}` }
    };
  }

  if (tokenData.access_token === undefined && tokenData.refresh_token) {
    return client.refreshToken().then(() => ({
      ...config,
      isRetryRequest: true,
      headers: { Authorization: `Bearer ${tokenData.access_token}` }
    }));
  }

  return config;
});

client.interceptors.response.use(undefined, error => {
  if (
    error.response.status === 401 &&
    error.config.isRetryRequest === undefined &&
    tokenData.refresh_token
  ) {
    return client.refreshToken().then(() =>
      Axios({
        ...error.config,
        isRetryRequest: true,
        headers: { Authorization: `Bearer ${tokenData.access_token}` }
      })
    );
  }

  throw error;
});

client.login = ({ username, password }) =>
  Axios.post(tokenEndpoint, {
    ...oauthCredentials,
    grant_type: 'password',
    username,
    password
  }).then(({ data }) => {
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('refresh_token', data.refresh_token);

    tokenData = data;

    return data;
  });

client.setAccessToken = token => {
  localStorage.setItem('access_token', token);
  tokenData.access_token = token;
};

client.setRefreshToken = token => {
  localStorage.setItem('refresh_token', token);
  tokenData.refresh_token = token;
};

module.exports = client;
