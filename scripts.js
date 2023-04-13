const userTab = document.querySelector("[data-userWeather]");
const searchTab = document.querySelector("[data-searchWeather]");
const userContainer = document.querySelector(".weather-container");

const grantAccessContainer = document.querySelector(".grant-location-container");
const searchForm = document.querySelector("[data-searchForm]");
const loadingScreen = document.querySelector(".loading-container");
const userInfoContainer = document.querySelector(".user-info-container");
const error = document.querySelector(".error404");

//in this file, we aren't defining all the variables at the top, instead we are defining them where they are needed

//initially vairables need????
const API_KEY = "5202e184eaa8737863c454c7beea0306";
let currentTab = userTab;
currentTab.classList.add("current-tab");
getfromSessionStorage();
//this function is added so that, when a user revists or refreshes the page, the coordinates which were saved in the session storage are fetched
//  and the weather info is displayed, and hence we do not have to ask the user to grant location access again 

function switchTab(clickedTab) {
    if(clickedTab!=currentTab) {
        currentTab.classList.remove("current-tab");
        //isse currentTab ka color hataaya plus uski other properties like img wagera
        currentTab = clickedTab;
        currentTab.classList.add("current-tab");

        //now we need to know on which tab we are 
        if(!searchForm.classList.contains("active")){
            //kya search form wala container is invisible, if yes then make it visible
            userInfoContainer.classList.remove("active");
            grantAccessContainer.classList.remove("active");
            searchForm.classList.add("active");
        }
        else{
            //main pehle search wale tab pr tha, ab your weather tab visible karna h 
            searchForm.classList.remove("active");
            userInfoContainer.classList.remove("active");
            error.classList.remove("active");
            //ab main your weather tab me aagya hu, toh weather bhi display karna poadega, so let's check local storage first
            //for coordinates, if we haved saved them there.
            getfromSessionStorage();

        }
    }


}


userTab.addEventListener('click', () => {
    //pass the clicked tab as input parameter
    switchTab(userTab);
});

searchTab.addEventListener('click', () => {
    //pass the clicked tab as input parameter
    switchTab(searchTab);
    
});
function getfromSessionStorage(){
    //checks if coordinates are already present in the session storage
    const localCoordinates = sessionStorage.getItem("user-coordinates");
    if(!localCoordinates){
        //agar local coordinates nahi mile, toh request the location access from the user through browser popup
        grantAccessContainer.classList.add("active");
    }else{
        //means we have local coordinates available
        const coordinates = JSON.parse(localCoordinates);
        //**local coordinates is not a JSON Object, instead what we received is a JSON String */
        //**so we need to parse it to convert it into a JSON Object and that is why we use JSON.parse(localcoordinates) */
        fetchUserWeatherInfo(coordinates);

    }
}
async function fetchUserWeatherInfo(coordinates){
    const {lat,log} = coordinates;
    //fetch weather info using the coordinates
    //grant location wala UI hatao, and loader dikha do
    grantAccessContainer.classList.remove("active");
    //make loading screen visible
    loadingScreen.classList.add("active"); 

    // API Call to fetch weather info
    try {
        const response = await fetch (`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${log}&appid=${API_KEY}&units=metric`);
        const data = await response.json();
        console.log("Weather data -> ", data);
        loadingScreen.classList.remove("active"); 
        userInfoContainer.classList.add("active");
        renderWeatherInfo(data);
    } catch (error) {
        loadingScreen.classList.remove("active"); 
        console.log("Error Found -> ", error);
    }
}
function renderWeatherInfo(weatherInfo) {
    console.log("Weather Info -> ", weatherInfo);
    //firstly we have to fetch the elements from the DOM
    const cityName = document.querySelector("[data-cityName]");
    const countryIcon = document.querySelector("[data-countryIcon]");
    const weatherDescription = document.querySelector("[data-weatherDesc]");
    const weatherIcon = document.querySelector("[data-weatherIcon]");
    const temp = document.querySelector("[data-temp]");
    const windSpeed = document.querySelector("[data-windSpeed]");
    const humidity = document.querySelector("[data-humidity]");
    const cloudiness = document.querySelector("[data-cloudiness]");

    //now we have to fill the data in the elements(UI) which we fetched from the weatherInfo object
    cityName.innerText = weatherInfo?.name;
    countryIcon.src = `https://flagcdn.com/144x108/${weatherInfo?.sys?.country.toLowerCase()}.png`;
    //because ye ek image hai, toh src attribute use karenge
    weatherDescription.innerText = weatherInfo?.weather[0]?.description;
    weatherIcon.src = `http://openweathermap.org/img/w/${weatherInfo?.weather?.[0]?.icon}.png`;
    temp.innerText = `${weatherInfo?.main?.temp.toFixed(2)} °C`;
    windSpeed.innerText =  `${ weatherInfo?.wind?.speed} m/s`;
    humidity.innerText =  `${weatherInfo?.main?.humidity} %`;
    cloudiness.innerText = `${weatherInfo?.clouds?.all} %` ;

}

const grantAccessButton = document.querySelector("[data-grantAccess]");
grantAccessButton.addEventListener('click', () => {
    //request location access from the user and store the coordinates in the session storage 
    if(navigator.geolocation){
        //means browser supports geolocation    
        navigator.geolocation.getCurrentPosition((position) => {
            //means user has granted the location access
            //now we have to store the coordinates in the session storage
            //in this function we receive the coordinates of the user in the position object
            //so, yes this is a callback function
            const {latitude, longitude} = position.coords;
            const coordinates = {
                lat: latitude,
                log: longitude
            }
            sessionStorage.setItem("user-coordinates", JSON.stringify(coordinates));
            //**we can't store objects in the session storage, instead we have to convert it into a JSON String */
            //**and that is why we use JSON.stringify(coordinates) */
            //**and we can't store JSON String in the session storage, instead we have to parse it to convert it into a JSON Object */
            //**and that is why we use JSON.parse(localcoordinates) */
            //**local coordinates is not a JSON Object, instead what we received is a JSON String */
            //**so we need to parse it to convert it into a JSON Object and that is why we use JSON.parse(localcoordinates) */
            fetchUserWeatherInfo(coordinates);
            //this function will fetch the weather info using the coordinates we just received
        }, () => {
            //means user has denied the location access
            //so we have to show the error message
            console.log("User denied the location access");
        });
    }
    else{
        //means browser doesn't support geolocation
        console.log("Browser doesn't support geolocation");
        alert("Browser doesn't support geolocation");
    }
});

let searchInput = document.querySelector("[data-searchInput]");

searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    //prevents the default behaviour of the form
    let cityName = searchInput.value;

    if(cityName === ""){
        alert("Please enter a city name");
    }
    else{
        //fetch weather info using the city name by calling the fetchSearchWeatherInfo function
        fetchSearchWeatherInfo(cityName);
    }
});

async function fetchSearchWeatherInfo(city){
    //make loading screen visible
    loadingScreen.classList.add("active");
    userInfoContainer.classList.remove("active");
    //removed the old weather info from the UI
    grantAccessButton.classList.remove("active");
    //fetch weather info using the city name using the API
    try{
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`);
        const data = await response.json();
        console.log("Weather data -> ", data);
        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");
        error.classList.remove("active");
        renderWeatherInfo(data);
    }
    catch{
        loadingScreen.classList.remove("active");
        userInfoContainer.classList.remove("active");
        alert("Please enter a valid city name");
        error.classList.add("active");
    }

}   




































// async function fetchWeatherDetails(){
//     // let latitude = 15.333;
//     // let longitude = 74.333;

//     try{
//         let city = "goa";
    
//         const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`);

//         const data = await response.json();
//         //now while doing these both(fetch and json conversion) we might get an error
//         //so we need to handle that error by putting it in try catch block
//         console.log("Weather data -> ", data);

//         // let newPara = document.createElement("p");
//         // newPara.innerHTML = `The weather in ${city} is ${data.weather[0].description} with a temperature of ${data.main.temp} degrees celcius.`;
//         // newPara.textContent = `${data?.main?.temp.toFixed(2)} °C`;

//          // document.body.appendChild(newPara);

//         renderWeatherInfo(data);
 
//          //    *** IT is a characteristic of a good function to do only one thing, hence we won't process the data here,
//         //  we will do it in another function
//     } 
//     catch(err){
//         //handle the error here
//         console.log("Error Found -> ", err);
//     }

// }