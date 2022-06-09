// import {getMovies, checkErrors, renderHtml, addToWatchList, removeFromWatchList, showWatchList} from "./javascript.js";

let html = "";
let watchList = {};
let currentWatchlist = JSON.parse(localStorage.getItem("watchList"));
const movieSearchBtn = document.getElementById("movie-search-btn");
const movieSearchInput = document.getElementById("movie-search-input");
const mainEl = document.getElementById("main");
const movieListDiv = document.getElementById("movie-list");
if (!localStorage.getItem("watchList")) {
  let myStorage = JSON.parse(localStorage.getItem("watchList"));
}

movieSearchBtn.addEventListener("click", getMovies);
movieSearchInput.addEventListener("keypress", () => {
  if (event.key == "Enter") {
    getMovies();
  }
});

async function getMovies(searchType = "s", error = "") {
  html = "";
  let movieSearch = movieSearchInput.value;
  const searchResponse = await fetch(
    `https://www.omdbapi.com/?${searchType}=${movieSearch}&type=movie&apikey=1db25ac7`
  );
  const searchData = await searchResponse.json();
  if (searchData.Error) {
    checkErrors(searchData.Error);
    return;
  }
  movieListDiv.classList.remove("error-msg");
  movieListDiv.innerHTML = "";
  if (searchType == "s") {
      const movies = [...searchData.Search];
    localStorage.setItem("movieSearchList", JSON.stringify(movies));
    for (let movie of movies) {

          fetch(`https://www.omdbapi.com/?t=${movie.Title}&apikey=1db25ac7`)
            .then(res => res.json())
           .then(data => renderHtml(data, "add", error));
      }
  } else {
      fetch(`https://www.omdbapi.com/?t=${movieSearch}&apikey=1db25ac7`)
      .then((res) => res.json())
      .then((data) => renderHtml(data, "add", error));
  }
}

function checkErrors(error) {
  if (error == "Too many results.") {
    getMovies("t", error);  
    return;
  } else if (error == "Incorrect IMDb ID.") {
    movieListDiv.classList.add("error-msg");
    movieListDiv.innerHTML = `<h3>Movie not found!</h3> `
  } else {
    movieListDiv.classList.add("error-msg");
    movieListDiv.innerHTML = `<h3>${error}</h3> `   
  }
}


function renderHtml(data, action, error) {
  let addOrRemove = "";
  let addOrRemoveSign = "";
  let alreadyOnList = "";
  if (action == "add") {
    addOrRemove = "addToWatchList";
    addOrRemoveSign = "&plus;";
    alreadyOnList = "toggle-add";
  } else if (action == "remove") {
    addOrRemove = "removeFromWatchList";
    addOrRemoveSign = "&minus;";
  }
  
  try {
    if (Object.keys(currentWatchlist[data.imdbID]).length > 0 ) {
      addOrRemove = "removeFromWatchList";
      addOrRemoveSign = "&minus;";
      alreadyOnList = "toggle-remove";
    }
  }
  catch(err) {
  }
  if (data.Poster == "N/A") {
    data.Poster = `https://assets.codepen.io/5515635/generic-movie-poster.jpg`;
  }
  if (error) {
    movieListDiv.innerHTML += `<h4>${error} Showing first exact title match.</h4>`
  }
  const { Title, imdbRating, Runtime, Genre, Plot, Poster, imdbID } = data;
  movieListDiv.innerHTML += `
      <section id="${imdbID}" class="movie-data ${alreadyOnList}">
        <div>
          <div class="movie-header">
            <h2 class="movie-title">${Title}</h2>
            <p class="movie-rating"><span class="star">&starf;</span> ${imdbRating}</p>
          </div>
          <div class="movie-info">
            <p class="movie-runtime">${Runtime}</p>
            <p class="movie-genres">${Genre}</p>
            <button id="${imdbID}-btn" class="movie-watchlist-btn" onclick="${addOrRemove}('${imdbID}')">${addOrRemoveSign} Watchlist</button>
            
          </div>
          <p class="movie-plot">${Plot}</p>
        </div>
        <img class="movie-img" src="${Poster}" aria-text="${Title} poster" />
      </section>
    `;
}

function addToWatchList(movie) {
  fetch(`https://www.omdbapi.com/?i=${movie}&apikey=1db25ac7`)
    .then((res) => res.json())
    .then((data) => {
      const { Title, imdbRating, Runtime, Genre, Plot, Poster, imdbID } = data;
      let existingWatchlist = localStorage.getItem("watchList")
      existingWatchlist = existingWatchlist ? JSON.parse(existingWatchlist) : {}      
      existingWatchlist[imdbID] = {
        Title: Title,
        Genre: Genre,
        imdbRating: imdbRating,
        Runtime: Runtime,
        Genre: Genre,
        Plot: Plot,
        Poster: Poster,
        imdbID: imdbID
      };
      document.getElementById(`${imdbID}`).classList.remove("toggle-add");
      document.getElementById(`${imdbID}`).classList.add("toggle-remove");
      document
        .getElementById(`${imdbID}-btn`)
        .setAttribute("onclick", `removeFromWatchList('${imdbID}')`);
      document.getElementById(`${imdbID}-btn`).textContent = "- Watchlist";
      localStorage.setItem("watchList", JSON.stringify(existingWatchlist));
    });
}

function saveWatchList() {
  localStorage.setItem("watchList", JSON.stringify(watchList))
}

function removeFromWatchList(imdbID) {
  delete watchList[imdbID];
  document.getElementById(`${imdbID}`).classList.remove("toggle-remove");
  document.getElementById(`${imdbID}`).classList.add("toggle-add");
  document
    .getElementById(`${imdbID}-btn`)
    .setAttribute("onclick", `addToWatchList('${imdbID}')`);
  document.getElementById(`${imdbID}-btn`).textContent = "+ Watchlist";
  localStorage.setItem("watchList", JSON.stringify(watchList));
  
  // The line below is only for the watchlist.html page
  // document.getElementById(`${imdbID}`).remove()
}

function showWatchList() {
  movieListDiv.innerHTML = "";
  watchList = JSON.parse(localStorage.getItem("watchList"));
  if (!watchList || Object.keys(watchList).length === "null") {
    movieListDiv.classList.add("error-msg");
    movieListDiv.innerHTML = `
      <h3>Your watchlist is looking a little empty...</h3>
      <a href="index.html">&plus;Let's add some movies!</a>
    `
  } else {
    for (let key of Object.keys(watchList)) {
      renderHtml(watchList[key], "remove");
    }
  }
}
