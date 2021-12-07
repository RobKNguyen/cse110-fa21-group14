import { get, getAll, imgToURL, save, saveToLocalStorage, deleteRecipe, sortAll, groceryList, addToGroceryList, filterRecipes } from '../backend src/backend.js';
import { makeRecList } from '../../assets/recommended.js';
import { makeRecipeOTD } from '../../assets/recipeOTD.js';
window.addEventListener('DOMContentLoaded', init);
const tags = document.getElementById('tags-inputted');
const name = document.getElementById('input-recipe-name');
const ingredients = document.getElementById('ingredients-inputted');
const steps = document.getElementById('instructions-input-list');
const recipeList = document.getElementById('recipe-list');
const recList = document.getElementById('recommended-list');
const servings = document.getElementById('serving-number');
const sorting = document.getElementById('sort-by');
const sort_close = document.getElementById('sort-filter-close');
const query = document.querySelector('#search-bar');

if (!localStorage.getItem('sorting')) {
    localStorage.setItem('sorting', 'alphabetical');
}
if (!localStorage.getItem('tags')) {
    localStorage.setItem('tags', JSON.stringify({}));
}


var currId;
var tagsToSearch = new Set();
var imgURL;
/**
 * This function will run a series of other functions and code once the window has loaded
 * 
 * @returns {void}
 */
async function init() {
    $("#input-file").change(function () {
        if (this.files && this.files[0]) {
            var FR = new FileReader();
            FR.onload = function (e) {
                console.log(e.target.result);
                var imgBase64 = e.target.result
                imgToURL(imgBase64.replace(/^data:image\/(png|jpg|jpeg);base64,/, "")).then(function (data) {
                    imgURL = data;
                    console.log(imgURL)
                    document.getElementById('file-preview').setAttribute('src', imgURL);
                }).catch(function (err) {
                    console.log(err)
                })
            };
            FR.readAsDataURL(this.files[0]);
        }
    });

    /**
     * This function will create a recipe card for each recipe in local storage and attach the appropriate
     * information for it's popup.
     * 
     * @returns {void}
     */
    function makeList() {
        if (recipeList) {
            recipeList.innerHTML = '';
            let recipes = search();
            let sortingMethod = localStorage.getItem('sorting');
            let filterTags = Object.keys(JSON.parse(localStorage.getItem('tags')));
            recipes = filterRecipes(recipes, filterTags);
            recipes = sortAll(recipes, sortingMethod);
            localStorage.setItem('tags', JSON.stringify({}));
            if (recipes && recipeList) {
                for (const [key, value] of Object.entries(recipes)) {
                    let newCard = document.createElement('recipe-card');
                    newCard.setAttribute('onclick', 'recipePopUp()');
                    let recipe = value;
                    console.log(recipe);
                    newCard.data = recipe;
                    //populates recipePopUp()
                    newCard.addEventListener('click', function () {
                        // how to access the specific json file
                        // populate the tags
                        currId = recipe.id;
                        let tagsSection = document.getElementById('recipe-tags');
                        tagsSection.innerHTML = '';
                        let tagsList = recipe.tags;
                        if (tagsList.length == 0) {
                            let noTags = document.createElement('p');
                            noTags.innerHTML = 'There are no tags.';
                            tagsSection.appendChild(noTags);
                        }
                        else {
                            for (let i = 0; i < tagsList.length; i++) {
                                let newTag = document.createElement('p');
                                newTag.classList.add('tag');
                                newTag.innerHTML = ` ${tagsList[i]} `;
                                tagsSection.appendChild(newTag);
                            }
                        }
                        // populate recipe name
                        let recipeName = document.getElementById('recipe-name');
                        recipeName.innerHTML = recipe.name;
                        // populate tracker
                        let trackerCount = document.getElementById('tracker-count');
                        trackerCount.innerHTML = recipe.makeCount;
                        let lastMade = document.getElementById('tracker-date');
                        if(recipe.made) {
                            lastMade.innerHTML = recipe.made;
                        }
                        else {
                            lastMade.innerHTML = 'never';
                        }
                        // populate image
                        let recipeImage = document.getElementById('recipe-image');
                        recipeImage.setAttribute('src', recipe.img);
                        //populate serving
                        let serving = document.getElementById('serving-value');
                        serving.innerHTML = recipe.serving;
                        // populate ingredients
                        // needs to change default value of the slider to the number of servings
                        let ingredientList = document.getElementById('ingredients');
                        ingredientList.innerHTML = '';
                        let ingList = recipe.ingredients['ingredients'];
                        for (let i = 0; i < ingList.length; i++) {
                            let newIng = document.createElement('li');
                            newIng.innerHTML = `${ingList[i]['amount']} ${ingList[i]['unit']} of ${ingList[i]['ingName']}`;
                            ingredientList.appendChild(newIng);
                        }
                        // populate instructions
                        let instructionList = document.getElementById('instructions');
                        instructionList.innerHTML = '';
                        let instList = recipe.steps;
                        for (let i = 0; i < instList.length; i++) {
                            let newInst = document.createElement('li');
                            newInst.innerHTML = instList[i];
                            instructionList.appendChild(newInst);
                        }
                    });
                    recipeList.appendChild(newCard);
                }
            }
        }


    }


    // (12/6/2021) ADDED NEW SUBSTRING SEARCH FUNCTION.
    // Needs to 
    if(query){
        query.addEventListener('keyup', function() {
            // console.log(search_bar.value);

            if (query.value.length == 0) {
                makeList();
                return;
            }

            fetch("./assets/recommended.json")
            .then(response => {
            return response.json();
            })
            .then(data => {
                const queryString = query.value;
                let rec_list = document.getElementById('recipe-list');
                //console.log(data);
                while(rec_list.firstChild) {
                    rec_list.removeChild(rec_list.firstChild);
                }
                if (!localStorage.getItem('recipeData')) {
                    localStorage.setItem('recipeData', JSON.stringify([]))
                }
                var recipe_data = JSON.parse(localStorage.getItem('recipeData'));
                console.log(recipe_data);
                const filtered_recipes = recipe_data.filter((e) => {
                    return e.name.toLowerCase().includes(queryString.toLowerCase());
                });
                console.log(filtered_recipes);
                populateRecipePage(filtered_recipes);
            });
        });
    }

    function populateRecipePage(filtered_recipes){
        // TODO: Needs to populate recipe page with "filtered recipes" via local storage.
        // recipes are already filtered, just need to access local storage, clear the
        // "recipe-list" of ALL of the recipes and only populate with the searched recipes.
        // If search box is empty, will simply show entire list of user recipes.

        
    }
    // end populate rec page.

    // let saveButton;
    // if(localStorage.getItem('editId') == null){
    //      saveButton = document.getElementById('save-recipe');
    // }
    // else{
    //     saveButton = null;
    // }
    let saveButton = document.getElementById('save-recipe');
    let newRecipe;
    if (saveButton) {
        saveButton.addEventListener('click', (event) => {
            let date = Date.now();
            newRecipe = {
                id: Math.floor(100000 + Math.random() * 900000),
                name: name.value,
                img: document.getElementById("file-preview").getAttribute("src"),
                ingredients: {
                    proportion: 1,
                    ingredients: [],
                },
                steps: [],
                serving: servings.value,
                tags: [],
                made: null,
                created: new Date(date),
                makeCount: 0
            }
            for (let i = 0; i < ingredients.children.length; i++) {
                newRecipe.ingredients['ingredients'].push({
                    ingName: ingredients.children[i].children[0].value,
                    amount: ingredients.children[i].children[1].value,
                    unit: ingredients.children[i].children[2].value,
                });
            }
            for (let i = 0; i < steps.children.length; i++) {
                newRecipe.steps.push(steps.children[i].firstChild.value);
            }
            for (let i = 0; i < tags.children.length; i++) {
                console.log(tags.children[i].firstChild);
                newRecipe.tags.push(tags.children[i].firstChild.value);
            }
            let editId = localStorage.getItem("editId");
            if(editId) {
                newRecipe.id = editId;
                newRecipe.made = get(editId).made;
                newRecipe.makeCount = get(editId).makeCount;
                deleteRecipe(editId);
                localStorage.removeItem("editId");
            }
            save(newRecipe);
            window.location.href = 'user.html';
        });
    }

    const deleteRecipeButton = document.getElementById("delete-recipe");
    if (deleteRecipeButton) {
        deleteRecipeButton.addEventListener('click', () => {
            document.getElementById("delete-recipe-name").innerHTML = get(currId).name;
            document.getElementById("delete-confirmation").classList.add("show");
        });
    }

    const deleteButton = document.getElementById('delete-yes');
    if (deleteButton) {
        deleteButton.addEventListener('click', (event) => {
            deleteRecipe(currId);
            location.reload();
        });
    }
    if (sort_close) {
        sort_close.addEventListener('click', (event) => {
            localStorage.setItem('sorting', sorting.querySelector('input[name=sort]:checked').id);
            location.reload();
        });
    }

    /**
     * This functions makes the tags array that populates the options in sort by tags
     *
     * @returns {void}
     */
    function makeTags() {
        let tagsList = document.getElementById('tags');
        if (tagsList) {
            let tags = new Set();
            let recipes = getAll();
            for (let i = 0; i < recipes.length; i++) {
                let currTags = recipes[i].tags;
                for (let j = 0; j < currTags.length; j++) {
                    tags.add(`${currTags[j]}`);
                }
            }

            console.log(tags);

            tags.forEach(function (value) {
                let newTag = document.createElement('button');
                newTag.classList.add('line-spacing');
                newTag.classList.add('tag');
                newTag.addEventListener('click', () => {
                    let added = newTag.classList.toggle('selected');
                    if (added) {
                        saveTag(value, true);
                    }
                    else {
                        saveTag(value, false);
                    }
                });
                newTag.innerHTML = value;
                tagsList.appendChild(newTag);
            });
        }

    }

    function saveTag(value, toFilter) {
        let temp = JSON.parse(localStorage.getItem('tags'));
        if (toFilter) {
            temp[value] = '1';
        }
        else {
            delete temp[value];
        }
        localStorage.setItem('tags', JSON.stringify(temp));
    }

    
    /**
     * This function updates the grocery list
     * 
     * @returns {void}
     */
    function makeGroceryList() {
        let groceryListItems = document.getElementById('grocery-list-items');
        if (groceryListItems) {
            let currIngs = groceryList();
            console.log(currIngs);
            for (let i = 0; i < currIngs.length; i++) {
                let newItem = document.createElement('div');
                newItem.classList.add('grocery-list-item');

                let newCheckBox = document.createElement('input');
                newCheckBox.setAttribute('type', 'checkbox');
                newCheckBox.setAttribute('id', 'grocery-list-items-' + currIngs[i]['name']);
                newCheckBox.checked = currIngs[i].done ? true : false
                let newLabel = document.createElement('label');
                newLabel.innerHTML = currIngs[i]['name'];
                newLabel.setAttribute('for', 'grocery-list-items-' + currIngs[i]['name'])
                newItem.appendChild(newCheckBox);
                newItem.appendChild(newLabel);
                groceryListItems.appendChild(newItem);
            }
        }
    }

    makeList();
    makeGroceryList();
    makeTags();

    $("input:checkbox").click(function () {
        change($(this).next("label").html())
    });
    function change(name) {
        let currIngs = groceryList();
        for (var ing of currIngs) {
            if (ing.name == name) {
                ing.done = !ing.done;
                break;
            }
        }
        localStorage.setItem('grocery', JSON.stringify(currIngs));
    }

    if (document.getElementById('home-recipe-card')) {
        makeRecipeOTD();
    }
    if(query)
    {
        query.addEventListener('keyup', makeList);
    }
    function search() {
        let toDisplay;
        if(getAll()) {
            toDisplay = getAll().filter(function (item) {
                return query.value == item.name.substring(0, query.value.length)
            });
        }
        console.log(toDisplay);
        return toDisplay;
    }
};

const editButton = document.getElementById('edit-recipe');

if (editButton) {
    console.log(editButton);
    editButton.addEventListener('click', (event) => {
        localStorage.setItem("editId", currId);
        window.location.href = 'create-edit.html';
    });
}


let justMadeBtn = document.getElementById("track");
let trackerCount = document.getElementById("tracker-count");
let trackerDate = document.getElementById("tracker-date");
if (justMadeBtn) {
    justMadeBtn.addEventListener("click", e => {
        let currRecipe = get(currId);

        currRecipe.makeCount = currRecipe.makeCount + 1;
        currRecipe.made = new Date(Date.now());
        trackerCount.innerHTML = currRecipe.makeCount;
        trackerDate.innerHTML = currRecipe.made;
        deleteRecipe(currId);
        save(currRecipe);

    })
}


let addGrocery = document.getElementById('add-grocery');
if (addGrocery) {
    addGrocery.addEventListener('click', (event) => {
        let currRecipe = get(currId);
        console.log(currId)
        addToGroceryList(currRecipe);
    })
}



/**
 * This function creates a tag-input element for the create/edit page.
 *
 * @returns {void}
 */
export function createTagInput() {
    // creating elements for tag input
    let inputContainer = document.createElement('div');
    let tagName = document.createElement('input');
    let removeButton = document.createElement('img');

    // defining the elements
    tagName.setAttribute('type', 'text');
    removeButton.setAttribute('src', './remove.png');
    removeButton.setAttribute('alt', 'Remove');

    // adding classes for styling and identification
    inputContainer.classList.add('tag-input', 'line-spacing');
    tagName.classList.add('input-elements');
    removeButton.classList.add('edit-icons', 'input-spacing');

    // setting placeholder inputs
    tagName.setAttribute('placeholder', 'Enter Tag');

    // add removability function on button
    removeButton.addEventListener('click', (event) => {
        tags.removeChild(inputContainer);
    });

    // add new tag input element onto the page
    inputContainer.appendChild(tagName);
    inputContainer.appendChild(removeButton);
    tags.appendChild(inputContainer);
}

/**
 * This function creates a ingredient-input element for the create/edit page.
 *
 * @returns {void}
 */
export function createIngredientInput() {
    // creating elements for ingredient input
    let inputContainer = document.createElement('div');
    let ingredientName = document.createElement('input');
    let ingredientAmount = document.createElement('input');
    let ingredientUnit = document.createElement('input');
    let removeButton = document.createElement('img');

    // defining the elements
    ingredientName.setAttribute('type', 'text');
    ingredientAmount.setAttribute('type', 'text');
    ingredientUnit.setAttribute('type', 'text');
    removeButton.setAttribute('src', './remove.png');
    removeButton.setAttribute('alt', 'Remove');

    // adding classes for styling and identification
    inputContainer.classList.add('ingredient-input', 'line-spacing');
    ingredientName.classList.add('name-input', 'input-elements', 'input-spacing');
    ingredientAmount.classList.add('amount-input', 'input-elements', 'input-spacing');
    ingredientUnit.classList.add('unit-input', 'input-elements', 'input-spacing');
    removeButton.classList.add('edit-icons', 'input-spacing');

    // setting placeholder inputs
    ingredientName.setAttribute('placeholder', 'Ingredient Name');
    ingredientAmount.setAttribute('placeholder', 'Amount');
    ingredientUnit.setAttribute('placeholder', 'Unit');

    // add removability function on button
    removeButton.addEventListener('click', (event) => {
        ingredients.removeChild(inputContainer);
    });

    // add new ingredient input element onto the page
    inputContainer.appendChild(ingredientName);
    inputContainer.appendChild(ingredientAmount);
    inputContainer.appendChild(ingredientUnit);
    inputContainer.appendChild(removeButton);
    ingredients.appendChild(inputContainer);
}

/**
 * This function creates a instruction-input element for the create/edit page.
 *
 * @returns {void}
 */
export function createInstructionInput() {
    // creating elements for instruction input
    let inputContainer = document.createElement('li');
    let stepInput = document.createElement('textarea');
    let removeButton = document.createElement('img');

    // defining the elements
    stepInput.setAttribute('rows', '2');
    stepInput.setAttribute('cols', '50');
    removeButton.setAttribute('src', './remove.png');
    removeButton.setAttribute('alt', 'Remove');

    // adding classes for styling and identification
    stepInput.classList.add('instruction-input');
    removeButton.classList.add('remove-step', 'input-spacing');

    // setting placeholder inputs
    stepInput.setAttribute('placeholder', 'Enter instruction step here.');

    // add removability function on button
    removeButton.addEventListener('click', (event) => {
        steps.removeChild(inputContainer);
    });

    // add new instruction element onto the page
    inputContainer.appendChild(stepInput);
    inputContainer.appendChild(removeButton);
    steps.appendChild(inputContainer);
}

const addTag = document.getElementById('add-tag');
if (addTag) {
    addTag.addEventListener('click', (event) => {
        createTagInput();
    });
}

const addIngredient = document.getElementById('add-ingredient');
if (addIngredient) {
    addIngredient.addEventListener('click', (event) => {
        createIngredientInput();
    });
}

const addInstruction = document.getElementById('add-instruction-step');
if (addInstruction) {
    addInstruction.addEventListener('click', (event) => {
        createInstructionInput();
    });
}



let values = ['fourth (1/4)', 'half (1/2)', 'original', 'double (2x)', 'quadruple (4x)'];
const slider = document.getElementById('slider1');
const num = document.getElementById('changenum');
if (slider){
    $(slider).on('input', e => {
        let currRecipe = get(currId);
        let currIngreds = currRecipe.ingredients['ingredients'];
        let currServing = currRecipe.serving;

        $(num).text(values[e.target.value])
        let ingredList = document.getElementById('ingredients');
        let ingreds = ingredList.children;

        let serving = document.getElementById('serving-value');
        for(let i = 0; i < ingreds.length; i++){
            let ingredStr = ingreds[i].innerHTML;
            let words = ingredStr.split(' ');
            if (e.target.value == 0){
                words[0] = currIngreds[i]['amount'] * 1/4;
                serving.innerHTML = currServing * 1/4;
            }else if(e.target.value == 1){
                words[0] = currIngreds[i]['amount'] * 1/2;
                serving.innerHTML = currServing * 1/2;
            }else if(e.target.value == 3){
                words[0] = currIngreds[i]['amount'] * 2;
                serving.innerHTML = currServing * 2;
            }else if(e.target.value == 4){
                words[0] = currIngreds[i]['amount'] * 4;
                serving.innerHTML = currServing * 4;
            }else{
                words[0] = currIngreds[i]['amount'];
                serving.innerHTML = currServing;
            }
            ingredStr = words.join(' ');
            ingreds[i].innerHTML = ingredStr;
        }
    });
}
