const baseUrl = 'https://api.openweathermap.org/data/2.5/forecast';
const apiKey = '&APPID=f2b983e5135ce658d5120b9538220520';
export default {
  fethWeather(id) {
    const requestParams = `?id=${id}`;
    return fetch(baseUrl + requestParams + apiKey)
      .then(response => response.json())
      .then(data => data.list);
  },
};
