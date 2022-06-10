10 June 2022
    1. Figure out how to import/export functions and get them to work
    -- Tried this and live pages don't like referencing functions with IDs created with variables

    2. Fix searchbar alignment

    3. Find better hi-lite color for watchlist items

    4. Fix naming (i.e. watchList vs watchlist) 

    5. Add dark mode

    6. Better use CSS variables for colors and such (goes with dark mode)

    7. Refactor code to be DRYer. Repeated sections such as:
        /*
            addOrRemove = "removeFromWatchList"
            addOrRemoveSign = "&minus;"
            alreadyOnList = "toggle-remove";
        */
        
    7A. Specifically the renderHtml function, it looks unwieldy.
    
    8. Sort the search list so identical searches appear in the same order
    
    9. Make a clear search results button
    
    10. Save search results to localstorage so they can be loaded if switching back and forth b/t the Search and Watchlist pages
