document.addEventListener('DOMContentLoaded', function() {
    const selectedRecipe = JSON.parse(localStorage.getItem('selectedRecipe'));
    if (selectedRecipe) {
        displayRecipeDetails(selectedRecipe);
    } else {
        // Handle case where no recipe is selected
        document.getElementById('recipe-details').innerHTML = '<p>No recipe selected.</p>';
    }
});

function displayRecipeDetails(recipe) {
    // General Information
    document.getElementById('recipe-name').textContent = recipe.label || 'No name available';
    document.getElementById('recipe-image').src = recipe.image || '../assets/img/food.png';

    // Labels
    document.getElementById('cuisineType').textContent = recipe.cuisineType ? recipe.cuisineType.join(', ') : 'Unknown';
    document.getElementById('caloriesLabel').textContent = recipe.calories ? `${Math.round(recipe.calories / recipe.yield)} Calories` : 'None';
    document.getElementById('dishType').textContent = recipe.dishType ? recipe.dishType.join(', ') : 'Unknown';
    document.getElementById('total-weight').textContent = recipe.totalWeight ? `${Math.round(recipe.totalWeight)} Grams` : 'Unknown';

    // Ingredients
    const ingredientLines = recipe.ingredientLines ? recipe.ingredientLines.map(line => `<li class="list-disc" >${line}</li>`).join('') : '<li>No ingredients available</li>';
    document.getElementById('ingredients-list').innerHTML = ingredientLines;

    // Recipe Text
    document.getElementById('recipe-text').textContent = recipe.ingredients ? `${recipe.dietLabels}` : 'No details available';

    // Total Daily Values
    const totalDaily = recipe.totalDaily ? 
    Object.keys(recipe.totalDaily)
        .filter(nutrient => Math.round(recipe.totalDaily[nutrient].quantity) > 0)
        .map(nutrient => `<li class="total-nutrients-list-item">${nutrient}: ${Math.round(recipe.totalDaily[nutrient].quantity)}${recipe.totalDaily[nutrient].unit}</li>`)
        .join('') : '<li>No daily values available</li>';
    document.getElementById('total-daily-list').innerHTML = totalDaily;


    // Total Nutrients
    const totalNutrients = recipe.totalNutrients ? 
    Object.keys(recipe.totalNutrients)
        .filter(nutrient => Math.round(recipe.totalNutrients[nutrient].quantity) > 0)
        .map(nutrient => `<li>${nutrient}: ${Math.round(recipe.totalNutrients[nutrient].quantity)}${recipe.totalNutrients[nutrient].unit}</li>`)
        .join('') : '<li>No nutrients available</li>';
    document.getElementById('total-nutrients-list').innerHTML = totalNutrients;

    // Source Label and Full Recipe Link
    document.getElementById('source-label').textContent = `Source: ${recipe.source || 'Unknown'}`;
    const fullRecipeLink = document.getElementById('full-recipe-link');
    fullRecipeLink.href = recipe.url || '#';
    fullRecipeLink.textContent = recipe.url ? 'Full Recipe' : 'No link available';
    fullRecipeLink.target = recipe.url ? '_blank' : '_self';
    
}

