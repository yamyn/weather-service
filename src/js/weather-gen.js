'use strict';

import cityList from '../id-list.json';
import weatherService from './services/weather-service';
import weatherFiveDaysTemplate from '../templates/weather-list-five-days.hbs';
const moment = require('moment');
const refs = {
  form: document.querySelector('#search-form'),
  weatherSection: document.querySelector('#weather-list-section'),
};

refs.form.addEventListener('submit', getCityNameHandler);

function getCityNameHandler(form) {
  form.preventDefault();

  const searchQuery = form.currentTarget.elements.query.value;
  const id = toSearchCityId(searchQuery);

  weatherService.fethWeather(id).then(dataArray => {
    console.log(dataArray);

    const filtredArr = getWeatherForThreePm(dataArray);
    console.log(filtredArr);
    const fiveDaysObj = parsArrForFiveDaysLook(filtredArr);
    console.log(fiveDaysObj);
    isertWeatherList(fiveDaysObj);
  });
}

function isertWeatherList(obj) {
  const markup = weatherFiveDaysTemplate(obj);
  refs.weatherSection.insertAdjacentHTML('beforeend', markup);
}

function toSearchCityId(promptCity) {
  const cityId = cityList.find(
    city => city.name.toLowerCase() === promptCity.toLowerCase(),
  ).id;
  return cityId;
}

function getWeatherForThreePm(array) {
  const currentWeatherTime = '3:00 PM';
  return array.filter(
    elem => moment(elem.dt_txt).format('LT') === currentWeatherTime,
  );
}

function parsArrForFiveDaysLook(array) {
  const parsArray = array.map(elem => {
    return {
      day: moment(elem.dt_txt).format('ddd'),
      alt: elem.weather[0].description,
      icon: elem.weather[0].icon,
    };
  });

  return parsArray;
}
