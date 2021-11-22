import {get, getAll, imgToURL, save, saveToLocalStorage, deleteRecipe} from '../backend src/backend.js';
window.addEventListener('DOMContentLoaded', init);
const tags = document.getElementById('tag-name-input');
const name = document.getElementById('input-recipe-name');
const ingName = document.getElementById('name-input');
const ingAmount = document.getElementById('amount-input');
const ingUnitInput = document.getElementById('unit-input');
const steps = document.getElementById('step-input-box');
const recipeList = document.getElementById('recipe-list');


var imgURL;
async function init(){
    $("#input-file").change(function () {
        if (this.files && this.files[0]) {
            var FR = new FileReader();
            FR.onload = function (e) {
                console.log(e.target.result);
                var imgBase64 = e.target.result
                imgToURL(imgBase64.replace(/^data:image\/(png|jpg|jpeg);base64,/, ""), imgURL);
            };
            FR.readAsDataURL(this.files[0]);
        }
    });
    
    const saveButton = document.getElementById('save-recipe');
    console.log(recipeList);
    //I put this if statment because it avoids a reading null error - TJ
   
    if (saveButton){
        saveButton.addEventListener('click', (event) => {
            let date = Date.now();
            let newRecipe = {
                id: Math.floor(100000 + Math.random() * 900000),
                name: name.value,
                img: imgURL,
                ingredients: {
                    proportion: 1,
                    ingredients: [
                        {ingName: ingName, amount: ingAmount, unit: ingUnitInput}
                    ],
                },
                steps: steps.value,
                serving: 1,
                tags: [tags.value],
                made: new Date(date),
            }
            
            save(newRecipe);
            window.location.href = 'user.html';
            //if you put these 3 blocks of code above this ^ window.location.href = 'user.html'; , it will give a recipeList null error
            let newCard = document.createElement('recipe-card'); 
            newCard.data = newRecipe;
            recipeList.appendChild(newCard);
        });
        
        
    }
    
    // populating the recipe page popup
    // first, i need to grab all the recipe cards, if they share a class name, that would help
    // will write a for loop that loops through each card to add an event listener
    /*
    recipeCards[i].addEventListener('click', function() {
        // how to access the specific json file
        // populate the tags
        let tagsSection = document.getElementById('recipe-tags');
        let tagsList = get('tags');
        if(tagsList.length == 0) {
            let noTags = document.createElement('p');
            noTags.innerHTML = 'There are no tags.';
            tagsSection.appendChild(noTags);
        }
        else {
            for(let i = 0; i < tagsList.length; i++) {
                let newTag = document.createElement('p');
                newTag.classList.add('tag');
                newTag.innerHTML = ` ${tagsList[i]} `;
                tagsSection.appendChild(newTag);
            }
        }
        // populate recipe name
        let recipeName = document.getElementById('recipe-name');
        recipeName.innerHTML = get('name');
        // populate tracker
        let trackerCount = document.getElementById('tracker-count');
        trackerCount.innerHTML = get('count'); // backend needs to include this in the recipe object
        let lastMade = document.getElementById('tracker-date');
        lastMade.innerHTML = get('made');
        // populate image
        let recipeImage = document.getElementById('recipe-image');
        recipeImage.setAttribute('src', get('image'));
        // populate ingredients
        // needs to change default value of the slider to the number of servings
        let ingredientList = document.getElementById('ingredients');
        let ingList = get('ingredients')['ingredients'];
        for(let i = 0; i < ingList.length; i++) {
            let newIng = document.createElement('li');
            newIng.innerHTML = `${ingList[i]['amount']} ${ingList[i]['unit']} of ${ingList[i]['ingName']}`;
            ingredientList.appendChild(newIng);
        }
        // populate instructions
        let instructionList = document.getElementById('instructions');
        let instList = get('steps'); // backend needs to fix steps for recipe object
        for(let i = 0; i < instList.length; i++) {
            let newInst = document.createElement('li');
            newInst.innerHTML = instList[i];
            instructionList.appendChild(newInst);
        }
    });
    */

    // const deleteButton = document.getElementById('delete-yes');
    // deleteButton.addEventListener('click', (event) => {
    //     //deleteRecipe(id);
    // });
};
