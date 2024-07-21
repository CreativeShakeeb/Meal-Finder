const MY_API_KEY = "2d57e6184510b3620ea72e83ad8f2727";
const MY_API_ID = "21c82fed";
const to = 12; // Number of recipes to fetch per request
let from = 0; // Starting index for pagination
let QuerySearch = '';
let selectedFilters = {};

// Predefined keywords for random recipe fetching
const predefinedKeywords = ['chicken', 'beef', 'pasta', 'salad', 'soup', 'fish', 'vegetarian', 'dessert', 'breakfast', 'snack'];

// Function to get random keywords from the predefined list
function getRandomKeywords(count) {
    const shuffled = predefinedKeywords.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count).join(',');
}

// Simulated filter options
const simulatedFilters = [
    {
        label: 'Diet',
        options: [
            { label: 'Alcohol-free' },
            { label: 'Balanced' },
            { label: 'Low-Fat' },
            { label: 'Vegan' },
            { label: 'Pork-free' },
            { label: 'No-sugar' }
        ]
    },
    {
        label: 'Allergies',
        options: [
            { label: 'Dairy-free' },
            { label: 'Soy-free' },
            { label: 'Lupine-free' },
            { label: 'Shellfish-free' },
            { label: 'Peanut-free' },
            { label: 'Fish-free' }
        ]
    }
];

// Function to get filter options (simulated)
async function fetchFilterOptions() {
    console.log('Fetching filter options...');
    return new Promise(resolve => {
        setTimeout(() => {
            const lowerCaseFilters = simulatedFilters.map(filter => ({
                label: filter.label.toLowerCase(),
                options: filter.options.map(option => ({
                    label: option.label.toLowerCase()
                }))
            }));
            resolve(lowerCaseFilters);
        }, 1000);
    });
}

// Function to display filter options
async function displayFilterOptions() {
    console.log('Displaying filter options...');
    const filters = await fetchFilterOptions();
    const filterSection = document.getElementById('filter-options');

    filters.forEach(filter => {
        const filterCategory = document.createElement('div');
        filterCategory.classList.add('filters-category', 'mb-6', 'w-40', 'm-auto');

        const categoryHeading = document.createElement('h2');
        categoryHeading.classList.add('category-heading', 'font-medium', 'text-[#509E2F]', 'text-2xl');
        categoryHeading.textContent = filter.label;
        filterCategory.appendChild(categoryHeading);

        filter.options.forEach(option => {
            const filterOption = document.createElement('p');
            filterOption.classList.add('filters', 'cursor-pointer', 'hover:bg-[#509E2F]', 'focus:font-semibold');
            filterOption.textContent = option.label;
            filterOption.addEventListener('click', () => toggleFilter(option, filter.label));
            filterCategory.appendChild(filterOption);
        });

        filterSection.appendChild(filterCategory);
    });

    console.log('Filter options displayed.');
}

// Function to toggle the filter section based on viewport width
function toggleFilterSection() {
    const filterOptions = document.getElementById('filter-options');
    const viewportWidth = window.innerWidth;

    if (viewportWidth < 724) {
        filterOptions.classList.add('hidden');
    } else if (!document.getElementById('hamburger-menu').checked) {
        filterOptions.classList.remove('hidden');
    }
}

// Add event listener for the hamburger menu click
document.getElementById('hamburger-menu').addEventListener('click', function () {
    const filterOptions = document.getElementById('filter-options');
    filterOptions.classList.toggle('hidden');
});

// Add event listener for window resize
toggleFilterSection();
window.addEventListener('resize', toggleFilterSection);

// Function to toggle filter selection
function toggleFilter(option, category) {
    console.log(`Toggling filter: ${option.label} in category: ${category}`);
    if (!selectedFilters[category]) {
        selectedFilters[category] = [];
    }

    const index = selectedFilters[category].indexOf(option.label);
    if (index === -1) {
        selectedFilters[category].push(option.label);
    } else {
        selectedFilters[category].splice(index, 1);
    }

    console.log('Selected Filters:', selectedFilters);

    // Highlight the selected filter
    applySelectedClass();
    updateURL();  // Update URL with the current filters
    DisplayRecipees();
}

// Function to apply selected class to filters
function applySelectedClass() {
    console.log('Applying selected class to filters...');
    const filterOptions = document.querySelectorAll('.filters-category p');
    filterOptions.forEach(option => {
        const category = option.closest('.filters-category').querySelector('.category-heading').textContent;
        if (selectedFilters[category] && selectedFilters[category].includes(option.textContent)) {
            option.classList.add('active');
        } else {
            option.classList.remove('active');
        }
    });
}

// Function to build filter query string
function buildFilterQuery() {
    let filterQuery = '';

    Object.keys(selectedFilters).forEach(category => {
        selectedFilters[category].forEach(option => {
            if (category === 'Diet') {
                filterQuery += `&diet=${encodeURIComponent(option.toLowerCase())}`;
            } else if (category === 'Health') {
                filterQuery += `&health=${encodeURIComponent(option.toLowerCase())}`;
            }
        });
    });

    return filterQuery;
}

// Function to show the loader and hide content
function showLoader() {
    document.getElementById('loader-div').classList.remove('hidden');
    document.getElementById('recipes-items-list').classList.add('hidden');
}

// Function to hide the loader and show content
function hideLoader() {
    document.getElementById('loader-div').classList.add('hidden');
    document.getElementById('recipes-items-list').classList.remove('hidden');
}



// Function to build the query for fetching recipes
async function fetchRecipes(query) {
    showLoader();
    const filterQuery = buildFilterQuery(); // Build filter query
    const url = `https://api.edamam.com/search?q=${encodeURIComponent(query)}&app_id=${MY_API_ID}&app_key=${MY_API_KEY}&from=${from}&to=${from + to}${filterQuery}`;
    console.log('Fetching recipes from URL:', url);
    try {
        let response = await fetch(url, {
            method: 'GET',
            headers: {
                'accept': 'application/json',
                'Accept-Language': 'en'
            }
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        let data = await response.json();
        console.log('Fetched recipes:', data);
        return data.hits;
    } catch (error) {
        console.error('Error fetching recipes:', error);
        return [];
    } finally {
        hideLoader();
    }
}

// Function to fetch recipes for all queries and combine results
async function GetRecipes() {
    const queries = QuerySearch ? QuerySearch.split(',') : [getRandomKeywords(3)];
    const allResults = [];

    for (const query of queries) {
        const results = await fetchRecipes(query.trim().replace(/"/g, ''));
        allResults.push(...results);
    }

    return allResults;
}

// Function to shuffle an array
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Function to display recipes
async function DisplayRecipees() {
    console.log('Displaying recipes...');
    showLoader();

    // Fetch recipes for all queries and combine results
    let allRecipes = await GetRecipes();

    // Shuffle the recipes array and select a subset
    allRecipes = shuffleArray(allRecipes); // Shuffle the array
    const recipesToShow = allRecipes.slice(0, to); // Select the first `to` recipes

    hideLoader();

    const recipesList = document.getElementById('recipes-items-list');
    recipesList.innerHTML = '';

    if (!recipesToShow.length) {
        recipesList.innerHTML = "<p>No recipes found.</p>";
        console.log("No recipes found.");
        return;
    }

    recipesToShow.forEach(recipeData => {
        if (!recipeData || !recipeData.recipe) {
            console.error('Recipe data is missing:', recipeData);
            return;
        }

        const recipe = recipeData.recipe;
        const recipeItem = document.createElement('div');
        recipeItem.classList.add('recipes-item', 'mx-2', 'shadow-xl', 'h-fit', 'mt-2', 'mb-4');
        recipeItem.id = `recipe-items`;

        recipeItem.innerHTML = `
            <img class="bg-cover object-contain w-full h-32" src="${recipe.image}" alt="${recipe.label}">
            <div class="recipe-details">
                <h3 class="recipe-name truncate w-11/12 mb-2 ml-1 mt-1">${recipe.label}</h3>
                <div class="nutriants flex mb-2 border-y">
                    <p class="text-xs py-2 px-1"><span class="text-[#509E2F]">${recipe.ingredients.length}</span> INGREDIENTS</p>
                    <p class="text-xs py-2 px-1"><span class="text-[#509E2F]">${Math.round(recipe.calories / recipe.yield)}</span> CALORIES</p>
                </div>
                <div class="Couisine-Type flex items-center h-fit w-fit bg-[#76ee43] rounded-md ">
                    <p class="text-white font-semibold">${recipe.cuisineType ? recipe.cuisineType.join(', ') : 'Unknown Cuisine'}</p>
                </div>
            </div>
        `;

        recipesList.appendChild(recipeItem);
        recipeItem.addEventListener('click', () => {
            localStorage.setItem('selectedRecipe', JSON.stringify(recipe));
            window.location.href = 'recipee.html';
        });
    });

    console.log('Recipes displayed.');
}

// Add event listener for the search form submission
document.getElementById('search-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    let input = document.getElementById('search-input').value.trim();
    // If the input is empty, set QuerySearch to an empty string
    if (input === '') {
        QuerySearch = '';
    } else {
        // Replace spaces between words with commas and wrap each word in quotes
        QuerySearch = input
            .split(/\s+/)                  // Split the input by any whitespace
            .map(word => `"${word}"`)      // Wrap each word in quotes
            .join(',');                   // Join words with commas
    }

    from = 0; // Reset the pagination to the first page
    updateURL();
    await DisplayRecipees();
});

// Add event listener for the next button
document.getElementById('next-btn').addEventListener('click', async () => {
    from += to; // Move to the next page
    updateURL();
    await DisplayRecipees();
});

// Add event listener for the previous button
document.getElementById('prev-btn').addEventListener('click', async () => {
    if (from > 0) {
        from -= to; // Move to the previous page
        updateURL();
        await DisplayRecipees();
    }
});

// Function to update the URL with the current state
function updateURL() {
    const url = new URL(window.location);
    url.searchParams.set('from', from);
    url.searchParams.set('query', QuerySearch);
    // Add filters to the URL
    Object.keys(selectedFilters).forEach(category => {
        if (selectedFilters[category].length > 0) {
            url.searchParams.set(category, selectedFilters[category].join(','));
        } else {
            url.searchParams.delete(category);
        }
    });
    history.pushState({}, '', url);
}

// Function to restore the state from the URL
function restoreStateFromURL() {
    const url = new URL(window.location);
    from = parseInt(url.searchParams.get('from')) || 0;
    QuerySearch = url.searchParams.get('query') || '';
    document.getElementById('search-input').value = QuerySearch;

    // Restore filters from the URL
    selectedFilters = {};
    simulatedFilters.forEach(filter => {
        const category = filter.label.toLowerCase();
        const filterValues = url.searchParams.get(category);
        if (filterValues) {
            selectedFilters[category] = filterValues.split(',');
        }
    });

    // Apply the filters to the UI
    applySelectedClass();
}

// Function to clear URL parameters on full page reload
function clearURLOnReload() {
    const url = new URL(window.location);
    url.searchParams.delete('from');
    url.searchParams.delete('query');
    // Clear filters from the URL
    simulatedFilters.forEach(filter => {
        url.searchParams.delete(filter.label.toLowerCase());
    });

    history.replaceState({}, '', url);
}

// Add event listener for the page show
window.addEventListener('pageshow', async (event) => {
    if (event.persisted || performance.getEntriesByType("navigation")[0].type === "back_forward") {
        QuerySearch = document.getElementById('search-input').value.trim();
        restoreStateFromURL();
        await DisplayRecipees();
    }
});

// Load filter options and display recipes on initial page load
document.addEventListener('DOMContentLoaded', async () => {
    if (performance.getEntriesByType("navigation")[0].type === "reload") {
        clearURLOnReload();
    } else {
        restoreStateFromURL();
    }
    await displayFilterOptions();
    await DisplayRecipees();
});