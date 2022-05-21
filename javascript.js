//declare variables
const meals = document.getElementById("meals");
const recipeWindow = document.getElementById("pop-window");
const displayRecipe = document.getElementById("display-recipe");
const favoriteGroup = document.getElementById("fav-meals");
const searchWord = document.getElementById("search-word");
const searchBtn = document.getElementById("search");
const closeBtn = document.getElementById("close");

getRandomMeal();
favoriteMeals();

async function getRandomMeal() {
    const respRand = await fetch("https://www.themealdb.com/api/json/v1/1/random.php");
    const respRanData = await respRand.json();
    const randomMeal = respRanData.meals[0];
    console.log(randomMeal);
    addMeal(randomMeal, true);
};
async function getMealById(id) {
    const respById = await fetch("https://www.themealdb.com/api/json/v1/1/lookup.php?i=" + id);
    const respByIdData = await respById.json();
    const mealById = respByIdData.meals[0];
    return mealById;
};
async function getMealBySearch(name) {
    const respByName = await fetch("https://www.themealdb.com/api/json/v1/1/search.php?s=" + name);
    const respByNameData = await respByName.json();
    const mealByName = respByNameData.meals;
    return mealByName;
};

function addMeal(mealData, random = false) {
    console.log("mealData: ", mealData);
    const meal = document.createElement("div");
    meal.classList.add("meal");
    meal.innerHTML = `
        <div class="meal-header">
            ${
                random ? `
            <span class="random"> Random recipe </span> `
            : ""
            }
            <img src="${mealData.strMealThumb}" alt="${mealData.strMeal}">
        </div>
        <div class="meal-body">
            <h4>${mealData.strMeal}</h4>
            <button class="fav-btn">
                <img class="empty" src=""></img>
            </button>
        </div>
    `;
    meal.addEventListener("click", () => {
        displayRecipeInfo(mealData);
    });
    meals.appendChild(meal);
};
function addFavoritesToLocalStorage(favmeal) {
    const mealID = getFavoritesFromLocalStorage();
    localStorage.setItem("mealid", JSON.stringify([...mealID, favmeal]));
};
function removeFavoritesFromLocalStorage(favmeal) {
    const mealID = getFavoritesFromLocalStorage();
    localStorage.setItem("mealid", JSON.stringify(mealID.filter(id => id !== favmeal)));
};
function getFavoritesFromLocalStorage() {
    //we get item by key("mealid") from local storage. 
    const mealID = JSON.parse(localStorage.getItem("mealid"));
    return mealID === null ? [] : mealID;
};

async function favoriteMeals() {
    favoriteGroup.innerHTML = "";
    const mealID = getFavoritesFromLocalStorage();
    // const favMealsGroup = [];
    for(let i = 0; i < mealID.length; i++){
        const meals = mealID[i];
        const meal = await getMealById(meals);
        addMealToFavorites(meal);
        // favMealsGroup.push(meal);
    }
    // console.log("favMealsGroup: ", favMealsGroup);
    //display meals in the browser
};
function addMealToFavorites(mealData) {
    console.log("mealData on addMealFavorites: ", mealData);
    const favoriteMeal = document.createElement("li");
    favoriteMeal.innerHTML = `
        <img src="${mealData.strMealThumb}" alt="${mealData.strMeal}">
        <span>
        ${mealData.strMeal}
        </span>
        `;
    favoriteMeal.addEventListener("click", () => {
        displayRecipeInfo(mealData);
    });
    favoriteGroup.appendChild(favoriteMeal);
};

function displayRecipeInfo(mealData){
    displayRecipe.innerHTML = "";
    const recipeFullInfo = document.createElement("div");
    const ingredientsList = [];
    //get the ingredients and measures
    for(let i = 1; i <= 20; i++) {
        if(mealData["strIngredient" + i]) {
            ingredientsList.push(`
            <strong>
                ${mealData["strIngredient" + i]} :
            </strong>
            ${mealData["strMeasure" + i]}
            `)
        } else {
            break;
        }
        // console.log("myIngredients: ", ingredientsList);
    };
    recipeFullInfo.innerHTML = `
        <h3><strong>${mealData.strMeal}</strong></h3>
        <img src="${mealData.strMealThumb}" alt="${mealData.strMeal}" style="">
        <p>${mealData.strInstructions}</p>
        <h5><strong> Ingredients & Measures </strong></h5>
        <ul>
            ${ingredientsList.map((ing) => `
                <li>${ing}</li> `
            ).join("")}
        </ul>
        <br>
        <button class="add">Add to favorites</button>
        <button class="delete">Delete from favorites</button>
    `;
    displayRecipe.appendChild(recipeFullInfo);
    recipeWindow.classList.remove("hidden");
    const deleteBtn = recipeFullInfo.querySelector(".delete");
    deleteBtn.addEventListener("click", () => {
        removeFavoritesFromLocalStorage(mealData.idMeal);
        favoriteMeals();
        recipeWindow.classList.add("hidden");
    });
    const addBtn = recipeFullInfo.querySelector(".add");
    addBtn.addEventListener("click", ()=> {
        addFavoritesToLocalStorage(mealData.idMeal);
        favoriteMeals();
        recipeWindow.classList.add("hidden");
    })
};

searchBtn.addEventListener("click", async() => {
    meals.innerHTML="";
    const search = searchWord.value;
    const listByName = await getMealBySearch(search);
    console.log("recipe by name results: ", listByName);
    if(listByName) {
        listByName.forEach((recipe) => {
            addMeal(recipe);
        });
    }
});

closeBtn.addEventListener("click", () => {
    recipeWindow.classList.add("hidden");
});



var search = document.getElementById("myBtn")

let pos;
let map;
let bounds;
let infoWindow;
let currentInfoWindow;
let service;
let infoPane;
function initMap() {
  console.log ("initMap")
  bounds = new google.maps.LatLngBounds();
  infoWindow = new google.maps.InfoWindow;
  currentInfoWindow = infoWindow;
  infoPane = document.getElementById('panel');

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(position => {
      pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      map = new google.maps.Map(document.getElementById('map'), {
        center: pos,
        zoom: 12
      });
      bounds.extend(pos);

      infoWindow.setPosition(pos);
      infoWindow.setContent('Location found.');
      infoWindow.open(map);
      map.setCenter(pos);

      getNearbyPlaces(pos);
    }, () => {
      handleLocationError(true, infoWindow);
    });
  } else {
    handleLocationError(false, infoWindow);
  }
}

function handleLocationError(browserHasGeolocation, infoWindow) {
  pos = { lat: 47.6062, lng: -122.3321 };
  map = new google.maps.Map(document.getElementById('map'), {
    center: pos,
    zoom: 12
  });

  infoWindow.setPosition(pos);
  infoWindow.setContent(browserHasGeolocation)
  infoWindow.open(map);
  currentInfoWindow = infoWindow;

  getNearbyPlaces(pos);
}

function getNearbyPlaces() {
  console.log("getNearbyPlace")
  var searchbar = document.getElementById("pac-input")
  var food = searchbar.value
  console.log(food)
  console.log(pos) 
  let request = {
    location: pos,
    rankBy: google.maps.places.RankBy.DISTANCE,
    keyword: food
  };
  map = new google.maps.Map(document.getElementById('map'), {
    center: pos,
    zoom: 12
  });
  service = new google.maps.places.PlacesService(map);
  service.nearbySearch(request, nearbyCallback);
}

function nearbyCallback(results, status) {
  if (status == google.maps.places.PlacesServiceStatus.OK) {
    createMarkers(results);
  }
}

function createMarkers(places) {
  places.forEach(place => {
    let marker = new google.maps.Marker({
      position: place.geometry.location,
      map: map,
      title: place.name
    });

    google.maps.event.addListener(marker, 'click', () => {
      let request = {
        placeId: place.place_id,
        fields: ['name', 'formatted_address', 'geometry', 'rating',
          'website', 'photos']
      };

      service.getDetails(request, (placeResult, status) => {
        showDetails(placeResult, marker, status)
      });
    });

    bounds.extend(place.geometry.location);
  });

  map.fitBounds(bounds);
}

function showDetails(placeResult, marker, status) {
  if (status == google.maps.places.PlacesServiceStatus.OK) {
    let placeInfowindow = new google.maps.InfoWindow();
    let rating = "None";
    if (placeResult.rating) rating = placeResult.rating;
    placeInfowindow.setContent('<div><strong>' + placeResult.name +
      '</strong><br>' + 'Rating: ' + rating + '</div>');
    placeInfowindow.open(marker.map, marker);
    currentInfoWindow.close();
    currentInfoWindow = placeInfowindow;
    showPanel(placeResult);
  } else {
    console.log('showDetails failed: ' + status);
  }
}

function showPanel(placeResult) {
  console.log('here')
  if (infoPane.classList.contains("open")) {
    infoPane.classList.remove("open");
  }

  while (infoPane.lastChild) {
    infoPane.removeChild(infoPane.lastChild);
  }

  if (placeResult.photos) {
    let firstPhoto = placeResult.photos[0];
    let photo = document.createElement('img');
    photo.classList.add('hero');
    photo.src = firstPhoto.getUrl();
    infoPane.appendChild(photo);
  }
 
  let name = document.createElement('h1');
  name.classList.add('place');
  name.textContent = placeResult.name;
  infoPane.appendChild(name);
  if (placeResult.rating) {
    let rating = document.createElement('p');
    rating.classList.add('details');
    rating.textContent = `Rating: ${placeResult.rating} \u272e`;
    infoPane.appendChild(rating);
  }
  let address = document.createElement('p');
  address.classList.add('details');
  address.textContent = placeResult.formatted_address;
  infoPane.appendChild(address);
  if (placeResult.website) {
    let websitePara = document.createElement('p');
    let websiteLink = document.createElement('a');
    let websiteUrl = document.createTextNode(placeResult.website);
    websiteLink.appendChild(websiteUrl);
    websiteLink.title = placeResult.website;
    websiteLink.href = placeResult.website;
    websitePara.appendChild(websiteLink);
    infoPane.appendChild(websitePara);
  }

  infoPane.classList.add("open");
}




