/*******************************
* Global variable declarations *
*******************************/

let watchList = {};
let currentWatchlist = JSON.parse(localStorage.getItem("watchList"));

/* Element consts */
const movieSearchBtn = document.getElementById("movie-search-btn");
const movieSearchInput = document.getElementById("movie-search-input");
const mainEl = document.getElementById("main");
const movieListDiv = document.getElementById("movie-list");

/*
Event Listeners
*/
movieSearchBtn.addEventListener("click", getMovies);
movieSearchInput.addEventListener("keypress", () => {
  if (event.key == "Enter") {
    getMovies();
  }
});

/*******************************
*           Functions          *
*******************************/

/* Retrieves list of movies based on user input in the search bar */
async function getMovies(searchType = "s", error = "") {
  let movieSearch = movieSearchInput.value;
  const searchResponse = await fetch(`https://www.omdbapi.com/?${searchType}=${movieSearch}&type=movie&apikey=1db25ac7`);
  const searchData = await searchResponse.json();
  
  /* If the API returns an error this calls the checkErrors function for processing the error */
  if (searchData.Error) {
    checkErrors(searchData.Error);
    return;
  }
  movieListDiv.classList.remove("error-msg");
  movieListDiv.innerHTML = "";
  
  /* The API expects a search type parameter of i (imdb ID), t (title), or s (search). Currently default is search. The checkError function will change searchType to t in the case of too many mantches for the API to show and this page will display the first exact title match */
  if (searchType == "s") {
    const movies = [...searchData.Search];
    localStorage.setItem("movieSearchList", JSON.stringify(movies));
    
    /* Loops over the returned movie list and renders the HTML for each one */
    for (let movie of movies) {
          fetch(`https://www.omdbapi.com/?t=${movie.Title}&apikey=1db25ac7`)
            .then(res => res.json())
           .then(data => renderHtml(data, "add", error));
    }
  /* This is triggered when a movie search gets too many results and pulls up the listing by an exact title match  */
  } else {
      fetch(`https://www.omdbapi.com/?t=${movieSearch}&apikey=1db25ac7`)
      .then((res) => res.json())
      .then((data) => renderHtml(data, "add", error));
  }
}

/* Processes error messages from the API */
function checkErrors(error) {
  /* Reruns the search looking for the first exact movie title match */
  if (error == "Too many results.") {
    getMovies("t", error);  
    return;
    
  /* Changed this error message to "Movie not found!" since users are not likely to be searching for movies based on imdb ID */
  } else if (error == "Incorrect IMDb ID.") {
    movieListDiv.classList.add("error-msg");
    movieListDiv.innerHTML = `<h3>Movie not found!</h3> `
    
  /* Displays error message to user */
  } else {
    movieListDiv.classList.add("error-msg");
    movieListDiv.innerHTML = `<h3>${error}</h3> `   
  }
}

/* Renders HTML for the list of movies returned by the getMovies function */
function renderHtml(data, action, error) {
  
  /* These control whether the rendered listing gets the formatting for a listing that is already on the watchlist (and needs a function to remove it) or not (and needs a function to add it).  */
  let addOrRemove = "";
  let addOrRemoveSign = "";
  let alreadyOnList = "";
  
  if (action == "add") {
    addOrRemove = "addToWatchList";
    addOrRemoveSign = "&plus;";
    /* It seems counter-intuitive, but the toggle-add class designates a listing as needing the button to add the listing to the watchlist. */
    alreadyOnList = "toggle-add";
  }
  if (action == "remove") {
      addOrRemove = "removeFromWatchList"
      addOrRemoveSign = "&minus;"
      alreadyOnList = "toggle-remove";
  }
  /* This checks to see if a listing is already on the watchlist and changes its formatting to show it is on the watchlist and to give the option to remove it from the watchlist*/
  try {
    if (Object.keys(currentWatchlist[data.imdbID]).length > 0 ) {
      addOrRemove = "removeFromWatchList";
      addOrRemoveSign = "&minus;";
      alreadyOnList = "toggle-remove";
    }
  }
  /* The catch statement is to ignore any error messages the try statement may give */
  catch(err) {
    /* I don't like how this is empty, but don't know what to put here */
  }
  
  /* Inserts a generic movie poster image in case the API does not have a poster for the listing */
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

/* Adds listing info to local storage so listing info does not need to be fetched from the API again. Also updates listing formatting to show it is on the watchlist */
function addToWatchList(movie) {
  fetch(`https://www.omdbapi.com/?i=${movie}&apikey=1db25ac7`)
    .then((res) => res.json())
    .then((data) => {
      const { Title, imdbRating, Runtime, Genre, Plot, Poster, imdbID } = data;
      /* Grabs watchlist info from local storage as existingWatchlist and updates watchlist with the new entry */
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
      /* Changes the listing's formatting to reflect it is now on the watchlist */
      document.getElementById(`${imdbID}`).classList.remove("toggle-add");
      document.getElementById(`${imdbID}`).classList.add("toggle-remove");
      document.getElementById(`${imdbID}-btn`).setAttribute("onclick", `removeFromWatchList('${imdbID}')`);
      document.getElementById(`${imdbID}-btn`).textContent = "- Watchlist";
      localStorage.setItem("watchList", JSON.stringify(existingWatchlist));
    });
}

/* Removes a listing from the watchlist */
function removeFromWatchList(imdbID) {
  let existingWatchlist = localStorage.getItem("watchList")
  existingWatchlist = existingWatchlist ? JSON.parse(existingWatchlist) : {}
  delete existingWatchlist[imdbID];
  localStorage.setItem("watchList", JSON.stringify(existingWatchlist));
  /* Updates formatting of listing removed from the watchlist */
  document.getElementById(`${imdbID}`).classList.remove("toggle-remove");
  document.getElementById(`${imdbID}`).classList.add("toggle-add");
  document.getElementById(`${imdbID}-btn`).setAttribute("onclick", `addToWatchList('${imdbID}')`);
  document.getElementById(`${imdbID}-btn`).textContent = "+ Watchlist";  
  // The line below is only for the watchlist.html page
  // document.getElementById(`${imdbID}`).remove()
}

/* Displays the watchlist */
// function showWatchList() {
//   movieListDiv.innerHTML = "";
//   watchList = JSON.parse(localStorage.getItem("watchList"));
  
//   /* Checks to see if the watchlist exists and if not renders a message and links back to index.html */
//   if (!watchList || Object.keys(watchList).length === "null") {
//     movieListDiv.classList.add("error-msg");
//     movieListDiv.innerHTML = `
//         <div>
//             <h3>Your watchlist is looking a little empty...</h3>
//             <a href="index.html">&plus;Let's add some movies!</a>
//         </div>
//     `
//   } else {
//     for (let key of Object.keys(watchList)) {
//       renderHtml(watchList[key], "remove");
//     }
//   }
// }
