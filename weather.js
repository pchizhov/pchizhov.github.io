function requestWeather(queryParams) {
    const base = 'https://api.openweathermap.org/data/2.5/weather';
    queryParams.push('appid=f80f663722c0d3dd6beacd446c31524a');
    const url = base + '?' + queryParams.join('&');
    return fetch(url).then((response) => {
        if (response.ok) {
            return response.json();
        } else {
            alert('Something went wrong: cannot find this place')
        }
    });
}

function getLocation() {
    fillCurrentCityLoader();
    let currentLocation = navigator.geolocation;
    if (currentLocation) {
        currentLocation.getCurrentPosition(
            (position) => {
                fillCurrentCity([`lat=${position.coords.latitude}`, `lon=${position.coords.longitude}`]);
            },
            (error) => {
                fillCurrentCity(['q=Saint Petersburg']);
            }
        );
        return;
    }
    fillCurrentCity(['q=Saint Petersburg']);
}

function addSavedCities() {
    for(let i=0; i < localStorage.length; i++) {
        const newCity = appendCityLoader();
        let key = localStorage.key(i);
        requestWeather(['q=' + key]).then((jsonResult) => {
            appendCity(jsonResult, newCity, key);
        });
    }
}

function addNewCity() {
    const newCity = appendCityLoader();
    let form = document.forms.namedItem('add_city');
    const formData = new FormData(form);
    const cityName = formData.get('new_city').toString();
    form.reset();
    requestWeather(['q=' + cityName]).then((jsonResult) => {
        if (jsonResult) {
            localStorage.setItem(cityName, '');
            appendCity(jsonResult, newCity, cityName);
        } else {
            newCity.remove();
        }
    });
}

function removeCity(cityName) {
    localStorage.removeItem(cityName);
    document.getElementById(sanitize(cityName)).remove();
}

function fillCurrentCityLoader() {
    document.getElementsByClassName('current-city-main')[0].innerHTML = '<div class="lds-dual-ring"></div>';
}

function fillCurrentCity(queryParams) {
    requestWeather(queryParams).then((jsonResult) => {
        document.getElementsByClassName('current-city-main')[0].innerHTML =
            '<div class="current-city-main-info">\n' +
            `    <h3 class="city-name">${jsonResult.name}</h3>\n` +
            `    <p class="current-city-temperature">${toCelsius(jsonResult.main.temp)}˚C</p>\n` +
            `    <img class="current-city-weather-picture" src="images/weather/${getIcon(jsonResult)}.svg">\n` +
            '</div>\n' +
            '<ul class="current-city-main-ul">\n' +
            fillCityUl(jsonResult) +
            '</ul>';
    });
}

function appendCityLoader() {
    let newCity = document.createElement('li');
    newCity.className = 'city';
    newCity.innerHTML = '<div class="lds-dual-ring"></div>';
    document.getElementsByClassName('favourites-main')[0].appendChild(newCity);
    return newCity;
}

function appendCity(jsonResult, newCity, cityName) {
    newCity.id = sanitize(cityName);
    const imageName = getIcon(jsonResult);
    newCity.innerHTML = '<div class="city-header">\n' +
        `                    <h3 class="city-name">${jsonResult.name}</h3>\n` +
        `                    <p class="temperature">${toCelsius(jsonResult.main.temp)}˚C</p>\n` +
        `                    <img class="weather-picture" src="images/weather/${imageName}.svg" alt="${imageName} icon">\n` +
        `                    <button class="close" onclick="removeCity(\'${cityName}\');">&times;</button>\n` +
        '                </div>\n' +
        '                <ul class="city-main">\n' + fillCityUl(jsonResult) +
        '                </ul>';
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
