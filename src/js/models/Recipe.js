import axios from 'axios';

export default class Recipe {
  constructor(id) {
    this.id = id;
  }

  async getRecipe() {
    try {
      const res = await axios(`https://forkify-api.herokuapp.com/api/get?rId=${this.id}`);
      this.title = res.data.recipe.title;
      this.author = res.data.recipe.publisher;
      this.img = res.data.recipe.image_url;
      this.url = res.data.recipe.source_url;
      this.ingredients = res.data.recipe.ingredients;
    } catch (err) {
      console.log(err);
      alert('Something went wrong :(');
    }
  }

  calcTime() {
    //Assuming that we need 15 min for each 3 ingredients
    const numIng = this.ingredients.length;
    const periods = Math.ceil(numIng / 3);
    this.time = periods * 15;
  }

  calcServings() {
    this.servings = 4;
  }

  parseIngredients() {
    const unitsLong = ['tablespoons', 'tablespoon', 'ounce', 'ounces', 'teaspoons', 'teaspoon', 'cups', 'pounds'];
    const unitsShort = ['tbsp', 'tbsp', 'oz', 'oz', 'tsp', 'tsp', 'cup', 'pound'];
    const units = [...unitsShort, 'kg', 'g'];

    const newIngredients = this.ingredients.map(el => {
      // 1 Uniform units
      let ingredient = el.toLowerCase();
      unitsLong.forEach((unit, i) => {
        ingredient = ingredient.replace(unit, unitsShort[i]);
      });

      // 2 Remove parentheses
      ingredient = ingredient.replace(/ *\([^]*\) */g, ' ');

      // 3 Parse ingredients into count, unit, and ingredient
      const arrIng = ingredient.split(' ');
      const unitIndex = arrIng.findIndex(e12 => units.includes(e12));

      let objInt;
      if (unitIndex > -1) {
        // There is a unit
        const arrCount = arrIng.slice(0, unitIndex); // Ex. 4 1/2 cups, arr count is [4, 1/2] --> "4+1/2" eval == 4.5

        let count;
        if (arrCount.length === 1) {
          count = eval(arrIng[0].replace('-','+'));
        } else {
          count = eval(arrIng.slice(0, unitIndex).join('+'));
        }

        objInt = {
          count,
          unit: arrIng[unitIndex],
          ingredient: arrIng.slice(unitIndex + 1).join(' ')
        };
      } else if (parseInt(arrIng[0], 10)) {
        // There is not unit, but the first element is a number
        objInt = {
          count: parseInt(arrIng[0], 10),
          unit: '',
          ingredient: arrIng.slice(1).join(' ')
        }
      }
      else if (unitIndex === -1) {
        // There is no unit
        objInt = {
          count: 1,
          unit: '',
          ingredient
        }
      }

      return objInt;
    });
    this.ingredients = newIngredients;
  }

  updateServings(type) {
    //servings
    const newServings = type === 'dec' ? this.servings - 1 : this.servings + 1;

    //ingredients
    this.ingredients.forEach(ing => {
      ing.count *= (newServings / this.servings);
    })

    this.servings = newServings;
  }
}
