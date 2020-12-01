function sanitize(cityName) {
    return cityName.split(' ').join('-');
}

function getIcon(jsonResult) {
    // todo: weather icons: time, cloudiness, rain
    if (jsonResult.windSpeed > 10) {
        return 'wind-direction';
    }
    if (jsonResult.clouds > 70) {
        return 'cloudy';
    }
    if (jsonResult.clouds > 15) {
        return 'sunny';
    }
    return 'sun';
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
