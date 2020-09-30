function requestWeather(queryParams) {
    const base = 'https://api.openweathermap.org/data/2.5/weather';
    queryParams.push('appid=f80f663722c0d3dd6beacd446c31524a');
    const url = base + '?' + queryParams.join('&');
    return fetch(url).then((response) => {
        if (response.ok) {
            return response.json();
        }
    });
}

function getLocation() {
    let currentLocation = navigator.geolocation;
    let queryParams = ['q=Saint Petersburg'];
    if (currentLocation) {
        currentLocation.getCurrentPosition(
            (position) => {
                queryParams = [`lat=${position.coords.latitude}`, `lon=${position.coords.longitude}`];
            },
            (error) => {
                console.log(error.message);
            }
        )
    }
    requestWeather(queryParams).then((jsonResult) => {
        fillCurrentCity(jsonResult);
    });
}

function addSavedCities() {
    for(let i=0; i < localStorage.length; i++) {
        let key = localStorage.key(i);
        requestWeather(['q=' + key]).then((jsonResult) => {
            appendCity(jsonResult);
        });
    }
}

function addNewCity() {
    let form = document.forms.namedItem('add_city');
    const formData = new FormData(form);
    const cityName = formData.get('new_city').toString();
    localStorage.setItem(cityName, '');
    form.getElementById('new_city').innerText = '';
    requestWeather(['q=' + cityName]).then((jsonResult) => {
        appendCity(jsonResult);
    });
}

function fillCurrentCity(jsonResult) {
    document.getElementsByClassName('current-city-main')[0].innerHTML =
        '<div class="current-city-main-info">\n' +
        `    <h3 class="city-name">${jsonResult.name}</h3>\n` +
        `    <p class="current-city-temperature">${toCelsius(jsonResult.main.temp)}˚C</p>\n` +
        `    <img class="current-city-weather-picture" src="images/weather/${getIcon(jsonResult)}.svg">\n` +
        '</div>\n' +
        '<ul class="current-city-main-ul">\n' +
        fillCityUl(jsonResult) +
        '</ul>';
}

function appendCity(jsonResult) {
    let newCity = document.createElement('li');
    newCity.className = 'city';
    const imageName = getIcon(jsonResult);
    newCity.innerHTML = '<div class="city-header">\n' +
        `                    <h3 class="city-name">${jsonResult.name}</h3>\n` +
        `                    <p class="temperature">${toCelsius(jsonResult.main.temp)}˚C</p>\n` +
        `                    <img class="weather-picture" src="images/weather/${imageName}.svg" alt="${imageName} icon">\n` +
        '                    <button class="close" onclick="removeCity">&times;</button>\n' +
        '                </div>\n' +
        '                <ul class="city-main">\n' + fillCityUl(jsonResult) +
        '                </ul>';
    document.getElementsByClassName('favourites-main')[0].appendChild(newCity);
}

function fillCityUl(jsonResult) {
    return '<li class="weather-data-line">\n' +
    '           <p class="weather-data-title">Wind</p>\n' +
    `           <p class="weather-data-value">${jsonResult.wind.speed} m/s, ${windDirection(jsonResult.wind.deg)}</p>\n` +
    '       </li>\n' +
    '       <li class="weather-data-line">\n' +
    '           <p class="weather-data-title">Cloudiness</p>\n' +
    `           <p class="weather-data-value">${jsonResult.clouds.all}%</p>\n` +
    '       </li>\n' +
    '       <li class="weather-data-line">\n' +
    '           <p class="weather-data-title">Pressure</p>\n' +
    `           <p class="weather-data-value">${jsonResult.main.pressure} hpa</p>\n` +
    '       </li>\n' +
    '       <li class="weather-data-line">\n' +
    '           <p class="weather-data-title">Humidity</p>\n' +
    `           <p class="weather-data-value">${jsonResult.main.humidity}%</p>\n` +
    '       </li>\n' +
    '       <li class="weather-data-line">\n' +
    '           <p class="weather-data-title">Coordinates</p>\n' +
    `           <p class="weather-data-value">[${jsonResult.coord.lat}, ${jsonResult.coord.lon}]</p>\n` +
    '       </li>'
}

getLocation();
addSavedCities();
