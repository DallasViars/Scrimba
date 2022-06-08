// import {renderHtml, removeFromWatchList, showWatchList} from "./javascript.js";

let html = "";
let watchList = {};
const mainEl = document.getElementById("main");
const movieListDiv = document.getElementById("movie-list");
if (!localStorage.getItem("watchList")) {
  let myStorage = JSON.parse(localStorage.getItem("watchList"));
}
function renderHtml(data, action, error) {
  let addOrRemove = "";
  let addOrRemoveSign = "";
  let currentWatchlist = JSON.parse(localStorage.getItem("watchList"));
  let alreadyOnList = "";
  if (action == "add") {
    addOrRemove = "addToWatchList";
    addOrRemoveSign = "&plus;";
    alreadyOnList = "toggle-add";
  } else if (action == "remove") {
    addOrRemove = "removeFromWatchList";
    addOrRemoveSign = "&minus;";
  }
  if (currentWatchlist[data.imdbID] != undefined) {
    addOrRemove = "removeFromWatchList";
    addOrRemoveSign = "&minus;";
    alreadyOnList = "toggle-remove";
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

function removeFromWatchList(imdbID) {
  delete watchList[imdbID];
  document.getElementById(`${imdbID}`).classList.remove("toggle-remove");
  document.getElementById(`${imdbID}`).classList.add("toggle-add");
  document
    .getElementById(`${imdbID}-btn`)
    .setAttribute("onclick", `addToWatchList('${imdbID}')`);
  document.getElementById(`${imdbID}-btn`).textContent = "+ Watchlist";
  localStorage.setItem("watchList", JSON.stringify(watchList));
  
  //The line below is only for the watchlist.html page
  document.getElementById(`${imdbID}`).remove()
}

function showWatchList() {
  movieListDiv.innerHTML = "";
  watchList = JSON.parse(localStorage.getItem("watchList"));
  if (!watchList || Object.keys(watchList).length === "null") {
    // movieListDiv.classList.add("error-msg");
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
showWatchList()