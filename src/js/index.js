import Search from './models/Search';
import Recipe from './models/Recipe';
import Likes from './models/Like';
import List from './models/List';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import * as likesView from './views/likesView';
import { elements, renderLoader, clearLoader } from './views/base';

/** Global state of the app
* - Search object
* - Current recipe object
* - Shopping list object
* - Liked recipes
**/
const state = {};

/**
Search controller
*/
const controlSearch = async () => {
  // 1) get query from the view
  const query = searchView.getInput();

  if (query) {
    //2 New search object and add it to state
    state.search = new Search(query);

    //3 Prepare UI for results
    searchView.clearInput();
    searchView.clearResults();
    renderLoader(elements.searchRes);

    try {
      //4 Search for Recipes
      await state.search.getResults();

      // 5 render results to UI
      clearLoader();
      searchView.renderResults(state.search.result);
    } catch (err) {
      alert('Something went wrong with the search...');
      clearLoader();
    }
  }
}

elements.searchForm.addEventListener('submit', e => {
  e.preventDefault();
  controlSearch();
});

elements.searchResPages.addEventListener('click', e => {
  const btn = e.target.closest('.btn-inline');
  if (btn) {
    const goToPage = parseInt(btn.dataset.goto, 10);
    searchView.clearResults();
    searchView.renderResults(state.search.result, goToPage);
  }
});

/**
RECIPE CONTROLLER
**/
const controlRecipe = async () => {
  const id = window.location.hash.replace('#', '');

  if (id) {
    //Prepare the UI for changes
    recipeView.clearRecipe();
    renderLoader(elements.recipe);

    //Highlight selected search
    if (state.search) {
      searchView.highlightSelected(id);
    }

    //Create new recipe object
    state.recipe = new Recipe(id);

    try {
      //Get the recipe data and parse ingredients
      await state.recipe.getRecipe();
      state.recipe.parseIngredients();

      //Calculate service and time
      state.recipe.calcTime();
      state.recipe.calcServings();

      //Render the recipe
      clearLoader();
      recipeView.renderRecipe(
        state.recipe,
        state.likes.isLiked(id)
      );
    } catch (err) {
      alert('Error processing recipe!');
      console.log(err);
    }
  }
};

['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));

/**
* LIST controller
**/

const controlList = () => {
  // Create a new list IF there is not one yet
  if (!state.list) state.list = new List();

  // Add each ingredient to the list
  state.recipe.ingredients.forEach(el => {
    const item = state.list.addItem(el.count, el.unit, el.ingredient);
    listView.renderItem(item);
  });
};

/**
* LIKES CONTROLLER
**/
const controlLike = () => {
  //Create a new likes object
  if (!state.likes) state.likes = new Likes();

  const currentID = state.recipe.id;

  //test if recipe is liked or not
  if (!state.likes.isLiked(currentID)) {
    // Add like to the state
    const newLike = state.likes.addLike(
      currentID,
      state.recipe.title,
      state.recipe.author,
      state.recipe.img
    );

    //Toggle the like button
    likesView.toggleLikedBtn(true);

    //Add like to the UI list
    likesView.renderLike(newLike);

  // user has liked current recipe
  } else {
    // remove like from the state
    state.likes.deleteLike(currentID);

    // toggle the like button
    likesView.toggleLikedBtn(false);

    //remove like from the UI list
    likesView.deleteLike(currentID);

  }
  likesView.toggleLikeMenu(state.likes.getNumLikes());
};

//Restore liked recipe on page load
window.addEventListener('load', e => {
  state.likes = new Likes();

  // Restore Likes
  state.likes.readStorage();

  //Toggle like menu button
  likesView.toggleLikeMenu(state.likes.getNumLikes());

  // Render the existing likes
  state.likes.likes.forEach(like => likesView.renderLike(like));
})

//Handle delete and update List item events
elements.shopping.addEventListener('click', e => {
  const id = e.target.closest('.shopping__item').dataset.item;

  // Handle the delete button
  if (e.target.matches('.shopping__delete, .shopping__delete *')) {
    // delete from state
    state.list.deleteItem(id);

    //delete from user interface
    listView.deleteItem(id);

  // handle the count update
  } else if (e.target.matches('.shopping__count-value, .shopping__count-value')) {
    const val = parseFloat(e.target.value);
    state.list.updateCount(id,val);
  }
})

// Handling recipe button click
elements.recipe.addEventListener('click', e => {
  if (e.target.matches('.btn-decrease, .btn-decrease *')) {
    //Decrease button clicked
    if (state.recipe.servings > 1) {
      state.recipe.updateServings('dec');
      recipeView.updateServingsIngredients(state.recipe);
    }
  } else if (e.target.matches('.btn-increase, .btn-increase *')) {
    //Increase button clicked
    state.recipe.updateServings('inc');
    recipeView.updateServingsIngredients(state.recipe);
  } else if (e.target.matches('.recipe__btn-add, .recipe__btn-add *')) {
    //Add ingredient to a shopping list
    controlList();
  } else if (e.target.matches('.recipe__love, .recipe__love *')) {
    //Like CONTROLLER
    controlLike();
  }
});
