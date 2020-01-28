'use strict';

import cityList from '../id-list.json';
import weatherService from './services/weather-service';
import weatherTemplate from '../templates/weather-list.hbs';
const moment = require('moment');

const refs = {
  form: document.querySelector('#search-form'),
  fiveDaysList: document.querySelector('#five-days-list'),
  forDayList: document.querySelector('#for-day-list'),
  weatherTitle: document.querySelector('#weather-title'),
  backButton: document.querySelector('#back-btn'),
};

const weatherAllInfoObj = {};
let searchQuery;

refs.form.addEventListener('submit', getCityNameHandler);
refs.fiveDaysList.addEventListener('click', openOneDayListHandler);
refs.backButton.addEventListener('click', toBackFiveListHandler);

function getCityNameHandler(event) {
  event.preventDefault();

  searchQuery = event.currentTarget.elements.query.value;
  const id = toSearchCityId(searchQuery);

  if (!id) {
    return;
  }

  clearFiveDaysList();
  clearOneDayList();
  refs.fiveDaysList.classList.remove('visually-hidden');

  refs.weatherTitle.textContent = `Five day weather forecast in ${searchQuery}`;
  refs.weatherTitle.classList.remove('visually-hidden');

  weatherService
    .fethWeather(id)
    .then(dataArray => {
      generateFiveDaysList(dataArray);
      generateAllDaysOBJ(dataArray);
    })
    .catch(error => {
      console.warn(error);
    });
}

function openOneDayListHandler(event) {
  event.preventDefault();
  const ul = event.currentTarget;
  ul.classList.add('visually-hidden');
  refs.backButton.classList.remove('visually-hidden');

  const focusedLi = event.target.closest('li.weather-list__item');
  const day = focusedLi.querySelector('#weather-list__date').textContent;
  const currentDayWeatherArr = weatherAllInfoObj[`${day}`];
  const fullDayName = moment(currentDayWeatherArr[0].dt_txt).format('dddd');

  refs.weatherTitle.textContent = `${fullDayName} weather forecast`;

  const dayDetailWeather = parsArrForFiveDaysLook(
    currentDayWeatherArr,
    'hours',
  );

  isertWeatherList(dayDetailWeather, refs.forDayList);
}

function toBackFiveListHandler(event) {
  clearOneDayList();
  refs.weatherTitle.textContent = `Five day weather forecast in ${searchQuery}`;
  refs.fiveDaysList.classList.remove('visually-hidden');
}

function generateFiveDaysList(dataArray) {
  console.log('Масив з 40 объектов погоды через каждые 3 часа: ');
  console.log(dataArray);

  const filtredArr = getWeatherForCurrentPm(dataArray);

  console.log(
    'Отфильтровал оставив объекты с временем таким же как в первого: ',
  );
  console.log(filtredArr);

  const fiveDaysObj = parsArrForFiveDaysLook(filtredArr);

  console.log('Создал новые объекты в виде, удобном для парсинга шаблона: ');
  console.log(fiveDaysObj);

  isertWeatherList(fiveDaysObj, refs.fiveDaysList);
}

function generateAllDaysOBJ(arr) {
  arr.reduce((acc, obj) => {
    if (acc !== moment(obj.dt_txt).format('ddd')) {
      acc = moment(obj.dt_txt).format('ddd');
      weatherAllInfoObj[`${acc}`] = [];
    }
    weatherAllInfoObj[`${acc}`].push(obj);
    return acc;
  }, 0);
}

function clearFiveDaysList() {
  refs.fiveDaysList.innerHTML = '';
}

function clearOneDayList() {
  refs.forDayList.innerHTML = '';
}

// function toMakeCurrentDay(day) {
//   iser
// }

function isertWeatherList(arr, ref) {
  const markup = arr.map(obj => weatherTemplate(obj));
  ref.insertAdjacentHTML('beforeend', markup);
}

function toSearchCityId(promptCity) {
  const searchCity = cityList.find(
    city => city.name.toLowerCase() === promptCity.toLowerCase(),
  );
  if (!searchCity) {
    return alert('Your city not found!!!');
  }
  return searchCity.id;
}

function getWeatherForCurrentPm(array) {
  const currentWeatherTime = moment(array[0].dt_txt).format('LT');
  return array.filter(
    elem => moment(elem.dt_txt).format('LT') === currentWeatherTime,
  );
}

function parsArrForFiveDaysLook(array, dataType = 'Day') {
  const parsArray = array.map(elem => {
    let time = moment(elem.dt_txt).format('ddd');

    if (dataType !== 'Day') {
      time = moment(elem.dt_txt).format('LT');
    }

    let phenomena = 'No precipitation';
    let precValue;
    if (elem.rain) {
      phenomena = 'rain: ';
      precValue = `${elem.rain['3h']} mm`;
    } else if (elem.snow) {
      phenomena = 'snow: ';
      precValue = `${elem.snow['3h']} mm`;
    }
    const tempKelvin = elem.main.temp;
    const tempCelsium = Math.round(tempKelvin - 273.15);
    return {
      time,
      alt: elem.weather[0].description,
      icon: elem.weather[0].icon,
      tempCelsium,
      humidity: elem.main.humidity,
      cloudiness: elem.clouds.all,
      wind: elem.wind.speed,
      pressure: elem.main.pressure,
      phenomena,
      precValue,
    };
  });

  return parsArray;
}
