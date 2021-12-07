import {save} from '../testing/backend src/backend.js';
window.addEventListener('DOMContentLoaded', init);
const search_bar = document.getElementById('recommended-search-bar');
const search_button = document.getElementById('search-button');
const API_KEY = "684bb3f58f5441e298a4431dfa0575e6";
// Function to traverse recommended JSon object and
// create recommended recipe cards.
export function makeRecList(data) {
    let recs = data;
    for (let i = 0; i < recs.length; i++) {
        let newCard = document.createElement('recipe-card');
        newCard.setAttribute('onclick', 'recommendedPopUp()');
        //console.log(newCard.querySelector('recipe-text'));
        let recipe = recs[i];
        newCard.data = recs[i];
        newCard.addEventListener('click', function() {
            let recipeName = document.getElementById('recipe-name');
            recipeName.innerHTML = recipe.name
            let recipeImage = document.getElementById('recipe-image');
            recipeImage.setAttribute('src', recipe.img);
           
            let recipe_id = recipe.id;
            let ingList = [];
            let instList = [];
            getIngredients(recipe_id)
            .then(response => {
                // Populating Ingredients
                let ingredientList = document.getElementById('ingredients');
                ingredientList.innerHTML = '';
                let itemList = response.ingredients;
                for (let i = 0; i < itemList.length; i++) {
                    let newIng = document.createElement('li');
                    newIng.innerHTML = `${itemList[i].amount.us.value} ${itemList[i].amount.us.unit} of ${itemList[i].name}`;
                    ingredientList.appendChild(newIng);
                    ingList.push({"name": itemList[i].name, "amount": itemList[i].amount.us.value, "unit": itemList[i].amount.us.unit});
                }
                
            });
            // populate instructions
            getInstructions(recipe_id)
            .then(response => {
                // populate instructions
                
                let instructionList = document.getElementById('instructions');
                instructionList.innerHTML = '';
                let itemList = response[0].steps; // backend needs to fix steps for recipe object
                
                for(let i = 0; i < itemList.length; i++) {
                    let newInst = document.createElement('li');
                    newInst.innerHTML = `Step ${itemList[i].number}: ${itemList[i].step}`;
                    instructionList.appendChild(newInst);
                    instList.push(itemList[i].step);
                }
            });

            // Create Add-To-My-Recipe Event Listener:
            let addRecipe = document.getElementById('add-recipe');
            if (addRecipe){
                addRecipe.addEventListener('click', (event) =>{
                    let date = Date.now();
                    let newRecipe = {
                        id: recipe.id,
                        name: recipe.name,
                        img: recipe.img,
                        ingredients: {
                            proportion: 1,
                            ingredients: [],
                        },
                        steps: [],
                        serving: 1,
                        tags: [],
                        made: new Date(date),
                        created: new Date(date),
                        makeCount: 0
                    }
                    for (let i = 0; i < ingList.length; i++) {
                        newRecipe.ingredients['ingredients'].push({
                            ingName: ingList[i]['name'],
                            amount: ingList[i]['amount'],
                            unit: ingList[i]['unit'],
                        });
                    }
                    for (let i = 0; i < instList.length; i++) {
                        newRecipe.steps.push(instList[i]);
                    }
                    save(newRecipe);
                });
            }

            



        });
       
        if(document.getElementById('recommended-list')){
            document.getElementById('recommended-list').appendChild(newCard);
        }
    }
}
if(search_bar){
    search_bar.addEventListener('keyup', function() {
        // console.log(search_bar.value);
        fetch("./assets/recommended.json")
        .then(response => {
        return response.json();
        })
        .then(data => {
            const queryString = search_bar.value;
            let rec_list = document.getElementById('recommended-list');
            //console.log(data);
            while(rec_list.firstChild) {
                rec_list.removeChild(rec_list.firstChild);
            }
            const filtered_recipes = data.recommended.filter((e) => {
                return e.name.toLowerCase().includes(queryString.toLowerCase());
            });
            //console.log(filtered_recipes);
            makeRecList(filtered_recipes);
        });
    })
}

// Call Spoonacular API for recipe ingredients
// Parameters: recipe name
async function getRecipeData(recipe_name) {
    const response = await fetch(`https://api.spoonacular.com/recipes/complexSearch?apiKey=${API_KEY}&query=${recipe_name}&number=5`).then((response1) => {return response1});
    return response.json();
}

// Call Spoonacular API for recipe ingredients
// Parameters: recipe ID
async function getIngredients(recipe_id) {
    const response = await fetch(`https://api.spoonacular.com/recipes/${recipe_id}/ingredientWidget.json?apiKey=${API_KEY}`);
    return response.json();
}

// Call Spoonacular API for recipe instructions
// Parameters: recipe ID
async function getInstructions(recipe_id) {
    const response = await fetch(`https://api.spoonacular.com/recipes/${recipe_id}/analyzedInstructions?apiKey=${API_KEY}`);
    return response.json();
}

if(search_button){
    search_button.addEventListener('click', function() {
        let rec_list = document.getElementById('recommended-list');
        while(rec_list.firstChild) {
            rec_list.removeChild(rec_list.firstChild);
        }
        let recipe_name = search_bar.value;
        getRecipeInfo(recipe_name)
        .then(response => {
    
            console.log(response.search);
            makeRecList(response.search);
            })
    });
}


async function getRecipeInfo(recipe_name) {
    // Search for 10 recipes.
    let recipe_call = await getRecipeData(recipe_name);
    // Actual array of recipe JSON elements.
    let recipes = recipe_call.results;

    // List of search results to be populated.
    let SEARCH_OBJ = {"search": []};

    // Iterate and parse information.
    if (recipes.length == 0) return;
    for (let i = 0; i < recipes.length; i++) {
       SEARCH_OBJ.search.push({"id": recipes[i].id, "name": recipes[i].title, "img": recipes[i].image, "ingList": [], instList: []});
    }
    return SEARCH_OBJ;
 }

// Once page loads, render recommended recipe cards.
function init() {
    console.log("loaded");
    fetch("./assets/recommended.json")
    .then(response => {
    return response.json();
    })
    .then(data => {
        makeRecList(data.recommended);
    });
}

