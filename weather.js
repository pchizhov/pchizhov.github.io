function getLocation() {
    let currentLocation = navigator.geolocation;

    if (currentLocation) {
        currentLocation.getCurrentPosition(
            async (position) => {
                const url = `https://api.openweathermap.org/data/2.5/weather?lat=${position.coords.latitude}&lon=${position.coords.longitude}&appid=f80f663722c0d3dd6beacd446c31524a`;
                let response = await fetch(url);
                if (response.ok) {
                    let jsonResult = await response.json();
                    fillCurrentCity(jsonResult);
                }
            },
            () => {
                console.log('Error');
            }
        )
    }
}

function fillCurrentCity(jsonResult) {
    document.getElementsByClassName('current-city-main')[0].innerHTML =
        '                <div class="current-city-main-info">\n' +
        `                    <h3 class="city-name">${jsonResult.name}</h3>\n` +
        `                    <p class="current-city-temperature">${toCelsius(jsonResult.main.temp)}˚C</p>\n` +
        `                    <img class="current-city-weather-picture" src="images/weather/${getIcon(jsonResult)}.svg">\n` +
        '                </div>\n' +
        '                <ul class="current-city-main-ul">\n' +
        '                    <li class="weather-data-line">\n' +
        '                        <p class="weather-data-title">Wind</p>\n' +
        `                        <p class="weather-data-value">${jsonResult.wind.speed} m/s, ${windDirection(jsonResult.wind.deg)}</p>\n` +
        '                    </li>\n' +
        '                    <li class="weather-data-line">\n' +
        '                        <p class="weather-data-title">Cloudiness</p>\n' +
        `                        <p class="weather-data-value">${jsonResult.clouds.all}%</p>\n` +
        '                    </li>\n' +
        '                    <li class="weather-data-line">\n' +
        '                        <p class="weather-data-title">Pressure</p>\n' +
        `                        <p class="weather-data-value">${jsonResult.main.pressure} hpa</p>\n` +
        '                    </li>\n' +
        '                    <li class="weather-data-line">\n' +
        '                        <p class="weather-data-title">Humidity</p>\n' +
        `                        <p class="weather-data-value">${jsonResult.main.humidity}%</p>\n` +
        '                    </li>\n' +
        '                    <li class="weather-data-line">\n' +
        '                        <p class="weather-data-title">Coordinates</p>\n' +
        `                        <p class="weather-data-value">[${jsonResult.coord.lat}, ${jsonResult.coord.lon}]</p>\n` +
        '                    </li>' +
        '                </ul>';
}

function toCelsius(kelvin) {
    return Math.floor(kelvin - 273);
}

function getIcon(jsonResult) {
    if (jsonResult.wind.speed > 10) {
        return 'wind-direction'
    }
    if (jsonResult.clouds.all > 70) {
        return 'cloudy'
    }
}

function windDirection(deg) {
    if (deg > 11.25 && deg <= 33.75) {
        return 'North-Northeast'
    }
    if (deg > 33.75 && deg <= 56.25) {
        return 'Northeast'
    }
    if (deg > 56.25 && deg <= 78.75) {
        return 'East-Northeast'
    }
    if (deg > 78.75 && deg <= 101.25) {
        return 'East'
    }
    if (deg > 101.25 && deg <= 123.75) {
        return 'East-Southeast'
    }
    if (deg > 123.75 && deg <= 146.25) {
        return 'Southeast'
    }
    if (deg > 146.25 && deg <= 168.75) {
        return 'South-Southeast'
    }
    if (deg > 168.75 && deg <= 191.25) {
        return 'South'
    }
    if (deg > 191.25 && deg <= 213.75) {
        return 'South-Southwest'
    }
    if (deg > 213.75 && deg <= 236.25) {
        return 'Southwest'
    }
    if (deg > 236.25 && deg <= 258.75) {
        return 'West-Southwest'
    }
    if (deg > 258.75 && deg <= 281.25) {
        return 'West'
    }
    if (deg > 281.25 && deg <= 303.75) {
        return 'West-Northwest'
    }
    if (deg > 303.75 && deg <= 326.25) {
        return 'Northwest'
    }
    if (deg > 326.25 && deg <= 346.75) {
        return 'North-Northwest'
    }
    return 'North'

}

getLocation();
