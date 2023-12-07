const regionNamesInEnglish = new Intl.DisplayNames(["en"], {
  type: "region",
});

//====================================================================================
//THIS FUNCTION IS A LITTLE BIT MESSY WITH THE RECASING, BUT JUST RETURNS THE
//STATECODE FOR A SPECIFIED NAME
//====================================================================================
const getStateTwoDigitCode = (stateFullName) => {
  const lowercase = stateFullName.toLowerCase();
  const recased = lowercase.charAt(0).toUpperCase() + lowercase.substr(1);
  if (stateList[recased]) {
    return stateList[recased];
  } else {
    return null;
  }
};

//====================================================================================
//BIG OLD LIST OF STATE NAMES AND THEIR FULLNAME COUNTERPARTS,
//THE SEARCH FROM MY QUICK TESTING SEEMED TO NEED THE STATES IN CODES
//RATHER THAN FULL NAMES, SO HERE ARE THE CONVERSIONS
//====================================================================================
const stateList = {
  Arizona: "AZ",
  Alabama: "AL",
  Alaska: "AK",
  Arkansas: "AR",
  California: "CA",
  Colorado: "CO",
  Connecticut: "CT",
  Delaware: "DE",
  Florida: "FL",
  Georgia: "GA",
  Hawaii: "HI",
  Idaho: "ID",
  Illinois: "IL",
  Indiana: "IN",
  Iowa: "IA",
  Kansas: "KS",
  Kentucky: "KY",
  Louisiana: "LA",
  Maine: "ME",
  Maryland: "MD",
  Massachusetts: "MA",
  Michigan: "MI",
  Minnesota: "MN",
  Mississippi: "MS",
  Missouri: "MO",
  Montana: "MT",
  Nebraska: "NE",
  Nevada: "NV",
  "New Hampshire": "NH",
  "New Jersey": "NJ",
  "New Mexico": "NM",
  "New York": "NY",
  "North Carolina": "NC",
  "North Dakota": "ND",
  Ohio: "OH",
  Oklahoma: "OK",
  Oregon: "OR",
  Pennsylvania: "PA",
  "Rhode Island": "RI",
  "South Carolina": "SC",
  "South Dakota": "SD",
  Tennessee: "TN",
  Texas: "TX",
  Utah: "UT",
  Vermont: "VT",
  Virginia: "VA",
  Washington: "WA",
  "West Virginia": "WV",
  Wisconsin: "WI",
  Wyoming: "WY",
};

//====================================================================================
//GET ELEMENTS WE WILL MODIFY
//====================================================================================
const getNewLocationButton = document.getElementById("searchLocation");
const locationInput = document.getElementById("locationInput");
const backgroundImage = document.getElementById("backgroundImage");
const forecastList = document.getElementById("fiveDayForecastList");

//====================================================================================
//CREATE A CONSTANT WEATHER TOKEN KEY TO BE REFERENCED IN THE WEATHER API CALLS
//====================================================================================
const weatherAPIAccessToken = "3d28be3e5da12a69f717ae8bd45d7305";
const unsplashClientID = "GnB-uJzHwQL5hJGJTiCnqTll3Inc77tSq9Fn6Sqrt3k";

//====================================================================================
//ADD NEW EVENT LISTENER TO GET WEATHER AT LOCATION ON CLICK OF THE SUBMIT BUTTON
//====================================================================================
const submitNewRequest = () => {
  getWeatherAtLocation(locationInput.value, true);
  locationInput.value = "";
};

getNewLocationButton.addEventListener("click", () => {
  submitNewRequest();
});

locationInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    submitNewRequest();
  }
});

const degToCompass = (num) => {
  var val = Math.floor(num / 22.5 + 0.5);
  var arr = [
    "N",
    "N/NE",
    "NE",
    "E/NE",
    "E",
    "E/SE",
    "SE",
    "S/SE",
    "S",
    "S/SW",
    "SW",
    "W/SW",
    "W",
    "W/NW",
    "NW",
    "N/NW",
  ];
  return arr[val % 16];
};

const getWeatherAtLocation = async (location, writeToSessionStore = false) => {
  if (!location) return null;
  let locString = String(location);

  sessionStorage.setItem("lastSearched", location);

  let stateCode = "";
  if (
    locString.indexOf(",") != -1 &&
    locString.indexOf(",") != undefined &&
    locString.indexOf(",") != null
  ) {
    const stateName = locString.split(",")[1].trim();
    if (stateName.length != 2) {
      stateCode = getStateTwoDigitCode(stateName);
      if (stateCode) {
        locString = locString.replace(stateName, stateCode);
        locString += ", us";
      }
    }
  }

  //====================================================================================
  //GET THE LOCATION VIA LAT AND LON FOR MORE PRECISION
  //====================================================================================
  locString.replace(" ", "%20");
  let geo;
  try {
    geo = await fetch(
      `http://api.openweathermap.org/geo/1.0/direct?q=${locString}&limit=1&APPID=${weatherAPIAccessToken}`
    );
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
  const cords = await geo.json();
  const lat = cords[0].lat;
  const lon = cords[0].lon;

  //====================================================================================
  //FETCH THE WEATHER AT LAT LON LOCATION SPEFICIED
  //====================================================================================
  let res;
  try {
    res = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=imperial&APPID=${weatherAPIAccessToken}`
    );
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
  const json = await res.json();
  let fiveDayForecastList = "";
  let currentLiIndex = 1;
  const currentDate = new Date();
  const timestamp = currentDate.getHours();

  let currentTime = String(Math.floor(timestamp / 3) * 3);

  console.log(json);

  if (String(currentTime).length === 1) {
    currentTime = `0${currentTime}`;
  }

  for (let i = 0; i < json.list.length; i++) {
    if (json.list[i].dt_txt.split(" ")[1] === `${currentTime}:00:00`) {
      const date = new Date(json.list[i].dt_txt);
      console.log(json.list[i]);
      console.log(date.getDate());
      // const windDirection = degToCompass(json.list[i].weather[0]);
      /* HTML */ const li = `<li><img id="listPreviewImage${currentLiIndex}" src="https://openweathermap.org/img/wn/${
        json.list[i].weather[0].icon
      }@2x.png"/><h3>${date.toLocaleString("default", {
        weekday: "short",
      })}, ${date.toLocaleString("default", {
        month: "short",
      })} ${date.getDate()}, ${date.getFullYear()}</h3><br/><h3>${
        json.list[i].weather[0].main
      }</h3><br/><h3>${json.list[i].wind.speed}MPH, ${degToCompass(
        json.list[i].wind.deg
      )}</h3><br/><h3>${json.list[i].main.humidity}%</h3>`;

      fiveDayForecastList += li;
      currentLiIndex++;
    }
  }

  forecastList.innerHTML = fiveDayForecastList;
  const todaysForecastObj = json.list[0];

  //====================================================================================
  //CREATE A SEARCH TERM FOR THE IMAGES VIA REVERSE GEOCODING FROM LAT LON TO STATE CODE
  //IF NO STATE CODE WAS ENTERED, WILL FIND/GENERATE ONE FOR THE LAT LON LOCATION THE
  //WEATHER WAS GOTTEN AT, A BIT OVERENGINEERED BUT IT GETS THE JOB DONE
  //====================================================================================
  let searchTerm = location;
  if (location.split(",")) {
    searchTerm = location.split(",")[0];
  }
  let revGeo;
  try {
    revGeo = await fetch(
      `http://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&APPID=${weatherAPIAccessToken}`
    );
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
  const revGeoRes = await revGeo.json();
  searchTerm = searchTerm.trim();

  let addedToLocaleTitle = "";
  if (revGeoRes[0].state) {
    const revGeoStateCode = revGeoRes[0].state;
    searchTerm += ` ${revGeoStateCode}`;
    addedToLocaleTitle = revGeoRes[0].state;
  } else {
    console.log(revGeoRes[0]);
    const revGeoCountryCode = revGeoRes[0].country;
    addedToLocaleTitle = regionNamesInEnglish.of(revGeoCountryCode);
  }
  searchTerm = searchTerm.toLowerCase();

  //====================================================================================
  //UPDATE THE CONTENTS OF LOCALE TO THE NAME OF THE PLACE SEARCHED, PLUS THE STATE
  //====================================================================================
  const localeTitle = document.getElementById("currentLocaleTitle");
  localeTitle.innerHTML = `${json.city.name}, ${addedToLocaleTitle}`;

  if (writeToSessionStore) {
    console.log("writing city");
    const oldItems = sessionStorage.getItem("searchedCities").split(",");
    oldItems.forEach((item, i) => {
      if (item == json.city.name) {
        oldItems.splice(i, 1);
      }
    });
    oldItems.splice(0, 0, json.city.name);

    sessionStorage.setItem("searchedCities", oldItems);

    const searchedCities = sessionStorage.getItem("searchedCities").split(",");
    const searchedCitiesWrapper = document.getElementById("recentlySearched");
    searchedCitiesWrapper.innerHTML = "";
    searchedCities.forEach((city) => {
      const newElement = document.createElement("li");
      newElement.innerHTML = city;
      newElement.addEventListener("click", () => {
        getWeatherAtLocation(city, true);
      });

      searchedCitiesWrapper.appendChild(newElement);
    });
  }

  const dateWrapper = document.getElementById("dateWrapper");
  dateWrapper.innerHTML = `${currentDate.toLocaleString("default", {
    weekday: "short",
  })}, ${currentDate.toLocaleString("default", {
    month: "short",
  })} ${currentDate.getDate()}, ${currentDate.getFullYear()}`;

  const localeTemp = document.getElementById("currentLocaleTemperature");
  localeTemp.innerHTML = `${todaysForecastObj.main.temp.toFixed(0)}&deg;F`;

  const localeWeatherDescription = document.getElementById(
    "currentLocaleDescriptionForecast"
  );
  localeWeatherDescription.innerHTML = `${todaysForecastObj.weather[0].description}`;

  const localeWeatherImage = document.getElementById("weatherPreviewIcon");
  localeWeatherImage.setAttribute(
    "src",
    `https://openweathermap.org/img/wn/${todaysForecastObj.weather[0].icon}@4x.png`
  );

  const lowTempWrapper = document.getElementById("low");
  lowTempWrapper.innerHTML = `L : ${todaysForecastObj.main.temp_min.toFixed(
    0
  )}&deg;F - `;

  const highTempWrapper = document.getElementById("high");
  highTempWrapper.innerHTML = `H : ${todaysForecastObj.main.temp_max.toFixed(
    0
  )}&deg;F`;

  console.log(todaysForecastObj);
  const windSpeed = document.getElementById("currentWindSpeed");
  const windDirection = degToCompass(todaysForecastObj.wind.deg);
  windSpeed.innerHTML = `${todaysForecastObj.wind.speed}MPH, ${windDirection}`;

  const humidity = document.getElementById("currentHumidity");
  humidity.innerHTML = `${todaysForecastObj.main.humidity}%`;

  //====================================================================================
  //GET A NEW IMAGE FOR THE SPECIFIED LOCATION, SEARCH TERM IS SOMETHING LIKE
  //LOCATION NAME STATE (e.g. park city utah) TO GET IMAGES THAT ARE CLOSER TO THE
  //LOCALE ENTERED
  //====================================================================================
  getRandomImageForLocation(searchTerm);
};

const getRandomImageForLocation = async (search) => {
  //console.log(search);
  let searchParam = "";
  if (!search) {
    if (sessionStorage.getItem("lastSearchedTerm")) {
      searchParam = sessionStorage.getItem("lastSearchedTerm");
    } else {
      searchParam = "landscape";
    }
  } else {
    //====================================================================================
    //REMOVE THE ,us EXTENSION IF IT IS ON THERE, JUST CLUTTERS SEARCH TERMS
    //====================================================================================
    searchParam = String(search).split(",us")[0];
  }

  //====================================================================================
  //REPLACE ALL SPACES WITH REPRESENTITIVE CHARACTERS
  //====================================================================================
  searchParam.replace(" ", "%20");

  //====================================================================================
  //GENERATE A RANDOM NUMBER FOR THE PAGE OF THE IMAGE TO SELECT, SET TO AN
  //ARBITRARY MAX OF 30, BUT CAN BE MORE OR LESS, I JUST FOUND 30 GIVES ENOUGH
  //VARIETY WITHOUT PULLING COMPLETLEY UNRELATED IMAGES
  //====================================================================================
  const randImagePage = Math.floor(Math.random() * 60) + 1;

  //====================================================================================
  //GET A NEW PHOTO FOR THE SEARCH PARAMETER
  //====================================================================================
  let photoRes;
  try {
    photoRes = await fetch(
      `https://api.unsplash.com/search/photos?query=${searchParam}&per_page=1&page=${randImagePage}&collections=landscape,nature,cool`,
      {
        method: "GET",
        headers: {
          Authorization: `Client-ID ${unsplashClientID}`,
        },
      }
    );
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
  const json = await photoRes.json();

  //====================================================================================
  //UPDATE THE STYLING OF THE BACKGROUND IMAGE TO BE THE NEW SOURCE
  //====================================================================================
  backgroundImage.style.backgroundImage = `url(${json.results[0].urls.raw})`;

  //====================================================================================
  //SAVE LAST IMAGE SEARCH TERM TO AUTO PULLUP ON NEXT RELOAD
  //====================================================================================
  sessionStorage.setItem("lastSearchedTerm", String(searchParam));
};

//====================================================================================
//ON LOAD OF PAGE, GET NEW IMAGE WITH SEARCH PARAMETER "landscape"
//====================================================================================
if (sessionStorage.getItem("lastSearched")) {
  getWeatherAtLocation(sessionStorage.getItem("lastSearched"));
} else {
  getWeatherAtLocation("Salt Lake City, Utah");
}

if (sessionStorage.getItem("searchedCities")) {
  const searchedCities = sessionStorage.getItem("searchedCities").split(",");
  const searchedCitiesWrapper = document.getElementById("recentlySearched");
  searchedCities.forEach((city) => {
    const newElement = document.createElement("li");
    newElement.innerHTML = city;
    newElement.addEventListener("click", () => {
      getWeatherAtLocation(city, true);
    });

    searchedCitiesWrapper.appendChild(newElement);
  });
} else {
  sessionStorage.setItem("searchedCities", ["Salt Lake City"]);
}
