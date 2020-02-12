const baseUrl = 'https://open-weather-server.herokuapp.com/api/weather';

export default {
  fethWeather(value, reqType = 'city') {
    let requestParams = `?city=${value}`;
    if (reqType === 'day') requestParams = `/day?day=${value}`;
    return fetch(baseUrl + requestParams);
  },
};
