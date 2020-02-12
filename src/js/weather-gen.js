'use strict';

import weatherService from './services/weather-service';
import weatherTemplate from '../templates/weather-list.hbs';
import PNotify from 'pnotify/dist/es/PNotify.js';

const refs = {
  form: document.querySelector('#search-form'),
  fiveDaysList: document.querySelector('#five-days-list'),
  forDayList: document.querySelector('#for-day-list'),
  weatherTitle: document.querySelector('#weather-title'),
  backArrow: document.querySelector('#back-arrow'),
};

let searchQuery;

refs.form.addEventListener('submit', getCityNameHandler);
refs.fiveDaysList.addEventListener('click', openOneDayListHandler);
refs.backArrow.addEventListener('click', toBackFiveListHandler);

function getCityNameHandler(event) {
  event.preventDefault();

  searchQuery = event.currentTarget.elements.query.value;

  clearFiveDaysList();
  clearOneDayList();

  weatherService
    .fethWeather(searchQuery)
    .then(response => {
      if (response.status === 404) {
        PNotify.error({
          text: 'Your city not found!',
          delay: 2000,
        });
        reject();
      }
      return response.json();
    })
    .then(dataArray => {
      refs.fiveDaysList.classList.remove('visually-hidden');
      refs.weatherTitle.textContent = `Five day weather forecast in ${searchQuery}`;
      refs.weatherTitle.classList.remove('visually-hidden');
      isertWeatherList(dataArray, refs.fiveDaysList);
    })
    .catch(error => {
      console.warn(error);
    });
}

function openOneDayListHandler(event) {
  event.preventDefault();
  if (event.currentTarget === event.target) {
    return;
  }
  const ul = event.currentTarget;
  ul.classList.add('visually-hidden');
  refs.backArrow.classList.remove('visually-hidden');

  const focusedLi = event.target.closest('li.weather-list__item');
  const day = focusedLi.querySelector('#weather-list__date').textContent;
  refs.weatherTitle.textContent = `${day} weather forecast`;

  weatherService
    .fethWeather(day, 'day')
    .then(dataArray => {
      isertWeatherList(dataArray, refs.forDayList);
    })
    .catch(error => {
      console.warn(error);
    });
}

function toBackFiveListHandler(event) {
  event.preventDefault();
  refs.backArrow.classList.add('visually-hidden');
  clearOneDayList();
  refs.weatherTitle.textContent = `Five day weather forecast in ${searchQuery}`;
  refs.fiveDaysList.classList.remove('visually-hidden');
}

function clearFiveDaysList() {
  refs.fiveDaysList.innerHTML = '';
}

function clearOneDayList() {
  refs.forDayList.innerHTML = '';
}

function isertWeatherList(arr, ref) {
  const markup = arr.map(obj => weatherTemplate(obj));
  ref.insertAdjacentHTML('beforeend', markup);
}
