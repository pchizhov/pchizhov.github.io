const currentLocation = navigator.geolocation;

if (currentLocation) {
    currentLocation.getCurrentPosition(
        async (position) => {
            const url = `https://api.openweathermap.org/data/2.5/weather?lat=${position.coords.latitude}&lon=${position.coords.longitude}&appid=f80f663722c0d3dd6beacd446c31524a`;
            let response = await fetch(url);
            if (response.ok) {
                const jsonResult = await response.json();
                fillCurrentCity(jsonResult);
            }
        },
        () => {
            console.log('Error');
        }
    )
}

function fillCurrentCity(jsonResult) {
    document.getElementsByClassName('current-city-temperature')[0].innerText = toCelsius(jsonResult.main.temp) + '˚C';
}

function toCelsius(kelvin) {
    return Math.floor(kelvin - 273);
}
