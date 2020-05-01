import Search from './models/Search';
import Recipe from './models/Recipe';
import List from './models/List';
import Likes from './models/Likes';
import { elements, renderLoader, clearLoader} from './views/base'
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import * as likesView from './views/likesView';

 
/*  Global State of the app
* - Search object
* - Current Recipe object
* - Shopping List object
* - Liked recipes
*/

const state = {};
//window.state = state;

/* SEARCH CONTROLLER */
const controlSearch = async () => {

    //1. Get query from the view
    const query = searchView.getInput();

    //const query = 'pizza';


    if(query) {
        
        //2. Create new search object and add to the state
        state.search = new Search(query);

        //3. Prepare UI for the results or spin loader
        searchView.clearInput();
        searchView.clearResult();
        renderLoader(elements.searchRes);

        try {
                //4.Search for recipes
                await state.search.getResults();

                //5. Render Results on UI ONLY after we have results therefore write await before above function 
                clearLoader();
                console.log(state.search.result);
                searchView.renderresults(state.search.result);
        }catch(error){
            console.log(error);
        }
        
    }
}

elements.searchForm.addEventListener('submit', event => {
    event.preventDefault();
    controlSearch();
});

//TESTING
// window.addEventListener('load', event => {
//     event.preventDefault();
//     controlSearch();
// });

elements.searchResPages.addEventListener('click', event => {

    const btn = event.target.closest('.btn-inline'); //returns the closest ansestor with class btn-inline
    console.log(btn);
    if(btn) {
        const goToPage = parseInt(btn.dataset.goto, 10);
        console.log(goToPage);
        searchView.clearResult();
        searchView.renderresults(state.search.result, goToPage);
    }
});


/* RECIPE CONTROLLER */

const controlRecipe = async () => {
    const id = window.location.hash.replace('#','');
    console.log(id);

    if(id) {
        //1.Prepare UI for changes
        recipeView.clearRecipe();
        renderLoader(elements.recipe);

        //highlight selected search item
        if(state.search) {
            searchView.highlightSelected(id);
        }

        //2.Create new recipe object
        state.recipe = new Recipe(id);

        try{ 
            //3.Get recipe data and parse Ingridients
            await state.recipe.getRecipe();
            state.recipe.parseIngredients();

            //TESTING
            //window.r = state.recipe;
    
            //4.Calculate servings and time 
            state.recipe.calcTime();
            state.recipe.calcServings();
    
            //5.Render data on UI
            clearLoader();
            recipeView.renderRecipe(
                state.recipe,
                state.likes.isLiked(id) 
                );
        }catch(error) {
            console.log(error);
        }    
    }
}

// window.addEventListener('hashchange', controlRecipe);
// window.addEventListener('load', controlRecipe);

['load','hashchange'].forEach(event => window.addEventListener(event, controlRecipe));


/* LIST CONTROLLER */

const controlList = () => {
    //create a new list if there is none yet
    if(!state.list) state.list = new List();

    //Add each ingredient to the list and the UI
    state.recipe.ingredients.forEach(el => {
        const item = state.list.addItem(el.count, el.unit, el.ingredient);
        listView.renderItem(item);
    });
}

/*LIKES CONTROLLER*/

//TESTING
// state.likes = new Likes();
// likesView.toggleLikeMenu(state.likes.getNumLikes());

const controlLike = () => {
    if(!state.likes) state.likes = new Likes();

    const currentID = state.recipe.id;

    // if user has NOT yet liked the current recipe
    if(!state.likes.isLiked(currentID)) { 
        //ADD LIKE TO THE STATE
        const newLike = state.likes.addLike(
            currentID,
            state.recipe.title,
            state.recipe.author,
            state.recipe.image
        )
        //TOGGLE THE BUTTON 
            likesView.toggleLikeBtn(true);
        //ADD LIKE TO UI LIST
        likesView.RenderLike(newLike);

    // user has liked the current recipe
    } else {
        //REMOVE THE LIKE FROM THE STATE
        state.likes.deleteLike(currentID);
       
        //TOGGLE THE BUTTON
        likesView.toggleLikeBtn(false);

        //REMOVE LIKE TO THE UI LIST
        likesView.deleteLike(currentID);
    }
    likesView.toggleLikeMenu(state.likes.getNumLikes());
}

//Restore Lied Recipe on page load
window.addEventListener('load', () => {
    state.likes = new Likes();

    //Restore Likes
    state.likes.readStorage();

    //Toggle heart button
    likesView.toggleLikeMenu(state.likes.getNumLikes());

    //Render the existing likes
    state.likes.likes.forEach(like => likesView.RenderLike(like));
})

//Handling servings button clicks
elements.recipe.addEventListener('click', event => {

    if(event.target.matches('.btn-decrease, .btn-decrease *')) {
        //DECREASE BUTTON IS CLICKED
        if(state.recipe.servings > 1) {
            state.recipe.updateServings('dec');
            recipeView.updateServingsIngredients(state.recipe);
        }
    } else if(event.target.matches('.btn-increase, .btn-increase *')) {
        //INCREASE BUTTON IS CLICKED
        state.recipe.updateServings('inc');
        recipeView.updateServingsIngredients(state.recipe);
    } else if(event.target.matches('.recipe__btn--add, .recipe__btn--add *')) {
        //Add ingredients to shopping list
        controlList();
    } else if (event.target.matches('.recipe__love, .recipe__love *')) {
        //Like Controller
        controlLike();
    }
    
});

//Handel delete and update of the items present in shopping list
elements.shopping.addEventListener('click', event => {
    
    const id = event.target.closest('.shopping__item').dataset.itemid;
    
    //handle the delete button
    if(event.target.matches('.shopping__delete, .shopping__delete *')) {

        //delete from the state
        state.list.deleteItem(id);

        //delete from the UI
        listView.deleteItem(id);
    } 
    //Handel the count update
    else if(event.target.matches('.shopping__count-value')) {
        console.log('incremented or decremented');
        const val = parseFloat(event.target.value);
        state.list.updateCount(id, val);
    }
})

//window.l = new List();



