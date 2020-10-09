let refreshForm = document.forms.namedItem('refresh');
let addCityForm = document.forms.namedItem('add_city');

refreshForm.addEventListener('submit', (event) => {
    getLocation();
    event.preventDefault();
});

addCityForm.addEventListener('submit', (event) => {
    addNewCity();
    event.preventDefault();
});

function requestWeather(queryParams) {
    const base = 'https://api.openweathermap.org/data/2.5/weather';
    queryParams.push('units=metric');
    queryParams.push('appid=f80f663722c0d3dd6beacd446c31524a');
    const url = base + '?' + queryParams.join('&');
    const abortController = new AbortController();
    const abortSignal = abortController.signal;
    return fetch(url, { signal: abortSignal }).then((response) => {
        if (response.ok) {
            return response.json();
        } else {
            alert('Something went wrong: cannot find this place');
        }
    }).catch(() => {
        alert('Your connection was lost, sorry.');
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
    for (let i=0; i < localStorage.length; i++) {
        const newCity = appendCityLoader();
        let key = localStorage.key(i);
        requestWeather(['q=' + key]).then((jsonResult) => {
            appendCity(jsonResult, newCity);
        });
    }
}

function addNewCity() {
    const formData = new FormData(addCityForm);
    const cityName = formData.get('new_city').toString();
    addCityForm.reset();
    if (localStorage.hasOwnProperty(cityName)) {
        return;
    }
    const newCity = appendCityLoader();
    requestWeather(['q=' + cityName]).then((jsonResult) => {
        if (jsonResult && !localStorage.hasOwnProperty(jsonResult.name)) {
            localStorage.setItem(jsonResult.name, '');
            appendCity(jsonResult, newCity);
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
        document.getElementsByClassName('current-city-main')[0].innerHTML = `
            <div class="current-city-main-info">
                <h3 class="city-name">${jsonResult.name}</h3>
                <p class="current-city-temperature">${Math.floor(jsonResult.main.temp)}˚C</p>
                <img class="current-city-weather-picture" src="images/weather/${getIcon(jsonResult)}.svg">
            </div>
            <ul class="current-city-main-ul">
                ${fillCityUl(jsonResult)}
            </ul>`;
    });
}

function appendCityLoader() {
    let newCity = document.createElement('li');
    newCity.className = 'city';
    newCity.innerHTML = '<div class="lds-dual-ring"></div>';
    document.getElementsByClassName('favourites-main')[0].appendChild(newCity);
    return newCity;
}

function appendCity(jsonResult, newCity) {
    const cityName = jsonResult.name;
    newCity.id = sanitize(cityName);
    const imageName = getIcon(jsonResult);
    newCity.innerHTML = `<div class="city-header">
                             <h3 class="city-name">${cityName}</h3>
                             <p class="temperature">${Math.floor(jsonResult.main.temp)}˚C</p>
                             <img class="weather-picture" src="images/weather/${imageName}.svg" alt="${imageName} icon">
                             <button class="close" onclick="removeCity(\'${cityName}\');">&times;</button>
                         </div>
                         <ul class="city-main">
                             ${fillCityUl(jsonResult)}
                         </ul>`;
}

function fillCityUl(jsonResult) {
    return `<li class="weather-data-line">
                <p class="weather-data-title">Wind</p>
                <p class="weather-data-value">${jsonResult.wind.speed} m/s, ${windDirection(jsonResult.wind.deg)}</p>
            </li>
            <li class="weather-data-line">
                <p class="weather-data-title">Cloudiness</p>
                <p class="weather-data-value">${jsonResult.clouds.all}%</p>
            </li>
            <li class="weather-data-line">
                <p class="weather-data-title">Pressure</p>
                <p class="weather-data-value">${jsonResult.main.pressure} hpa</p>
            </li>
            <li class="weather-data-line">
                <p class="weather-data-title">Humidity</p>
                <p class="weather-data-value">${jsonResult.main.humidity}%</p>
            </li>
            <li class="weather-data-line">
                <p class="weather-data-title">Coordinates</p>
                <p class="weather-data-value">[${jsonResult.coord.lat}, ${jsonResult.coord.lon}]</p>
            </li>`;
}

getLocation();
addSavedCities();
