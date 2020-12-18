var refreshForm;
var addCityForm;

function init() {
    refreshForm = document.forms.namedItem('refresh');
    addCityForm = document.forms.namedItem('add_city');

    refreshForm.addEventListener('submit', (event) => {
        getLocation();
        event.preventDefault();
    });

    addCityForm.addEventListener('submit', (event) => {
        addNewCity();
        event.preventDefault();
    });

    getLocation();
    addSavedCities();
}

function requestWeather(endpoint, queryParams) {
    const base = 'http://localhost:8080/weather/';
    const url = base + endpoint + '?' + queryParams.join('&');
    return fetch(url).then((response) => {
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
                fillCurrentCity('coordinates', [`lat=${position.coords.latitude}`, `lon=${position.coords.longitude}`]);
            },
            (error) => {
                fillCurrentCity('city', ['q=Saint Petersburg']);
            }
        );
        return;
    }
    fillCurrentCity('city', ['q=Saint Petersburg']);
}

function addSavedCities() {
    return fetch('http://localhost:8080/favourites').then((res) => {
        if (res.ok) {
            return res.json()
        }
    }).then((res) => {
        for (let i = 0; i < res.cities.length; i++) {
            const newCity = appendCityLoader();
            const key = res.cities[i];
            requestWeather('city', ['q=' + key]).then((jsonResult) => {
                appendCity(jsonResult, newCity);
            });
        }
    });
}

function addNewCity() {
    const formData = new FormData(addCityForm);
    const cityName = formData.get('new_city').toString();
    const newCity = appendCityLoader();
    addCityForm.reset();
    return requestWeather('city', ['q=' + cityName]).then((jsonResult) => {
        return fetch('http://localhost:8080/favourites', {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: jsonResult.place,
            })
        }).then((response) => {
            if (response.status === 200) {
                appendCity(jsonResult, newCity);
            } else {
                newCity.remove();
                alert('We already have this city in favourites');
            }
        }).catch((err) => {
            newCity.remove();
            alert('Your connection was lost, sorry.');
        })
    }).catch((err) => {
        newCity.remove();
    });
}

function removeCity(cityName) {
    fetch('http://localhost:8080/favourites', {
        method: 'DELETE',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            name: cityName,
        })
    });
    document.getElementById(sanitize(cityName)).remove();
}

function fillCurrentCityLoader() {
    document.getElementsByClassName('current-city-main')[0].innerHTML = '<div class="lds-dual-ring"></div>';
}

function fillCurrentCity(endpoint, queryParams) {
    return requestWeather(endpoint, queryParams).then((jsonResult) => {
        document.getElementsByClassName('current-city-main')[0].innerHTML = `
            <div class="current-city-main-info">
                <h3 class="city-name">${jsonResult.place}</h3>
                <p class="current-city-temperature">${jsonResult.temp}˚C</p>
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
    const cityName = jsonResult.place;
    newCity.id = sanitize(cityName);
    const imageName = getIcon(jsonResult);
    newCity.innerHTML = `<div class="city-header">
                             <h3 class="city-name">${cityName}</h3>
                             <p class="temperature">${jsonResult.temp}˚C</p>
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
                <p class="weather-data-value">${jsonResult.windSpeed} m/s, ${windDirection(jsonResult.windDir)}</p>
            </li>
            <li class="weather-data-line">
                <p class="weather-data-title">Cloudiness</p>
                <p class="weather-data-value">${jsonResult.clouds}%</p>
            </li>
            <li class="weather-data-line">
                <p class="weather-data-title">Pressure</p>
                <p class="weather-data-value">${jsonResult.pressure} hpa</p>
            </li>
            <li class="weather-data-line">
                <p class="weather-data-title">Humidity</p>
                <p class="weather-data-value">${jsonResult.humidity}%</p>
            </li>
            <li class="weather-data-line">
                <p class="weather-data-title">Coordinates</p>
                <p class="weather-data-value">[${jsonResult.lat}, ${jsonResult.lon}]</p>
            </li>`;
}

module.exports = {
    fillCityUl: fillCityUl,
    appendCityLoader: appendCityLoader,
    requestWeather: requestWeather,
    init: init,
    appendCity: appendCity,
    removeCity: removeCity,
    getLocation: getLocation,
    fillCurrentCityLoader: fillCurrentCityLoader,
    fillCurrentCity: fillCurrentCity,
    addSavedCities: addSavedCities,
    addNewCity: addNewCity
};
