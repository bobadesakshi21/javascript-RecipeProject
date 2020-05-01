import axios from 'axios';

export default class Recipe {
    constructor(id) {
        this.id = id;
    }

    async getRecipe() {
        try{
            const res = await axios(`https://forkify-api.herokuapp.com/api/get?rId=${this.id}`);
            this.title = res.data.recipe.title;
            this.author = res.data.recipe.publisher;
            this.image = res.data.recipe.image_url;
            this.url = res.data.recipe.source_url;
            this.ingredients = res.data.recipe.ingredients;

            console.log(res);
        } catch(error) {
            alert(error);
        }
    }

    calcTime() {
        //assuming that we need 15 min for every 3 ingredients

        const numIng = this.ingredients.length;
        const periods = numIng / 3;
        this.time = periods * 15;
    }

    calcServings() {
        this.servings = 4;
    }

    parseIngredients() {

        const unitsLong = ['tablespoons', 'tablespoon', 'ounces', 'ounce', 'teaspoon', 'teaspoons', 'cups', 'pounds'];

        const unitsShort = ['tbsp', 'tbsp', 'oz', 'oz', 'tsp', 'tsp', 'cup', 'pound'];

        const units = [...unitsShort, 'kg', 'g'];

        const newIngredients = this.ingredients.map(el => { //ingredient is an array obviously

            //1. Uniform units          
            let ingredient = el.toLowerCase();
            unitsLong.forEach((item, index) => {
                ingredient = ingredient.replace(item, unitsShort[index]);
            });
             

            //2.Remove Parenthesis
            ingredient = ingredient.replace(/ *\([^)]*\) */g, ' ');

            //3.Parse ingredients into count, units and ingredients
            const arrIng = ingredient.split(' ');
            const unitIndex = arrIng.findIndex(el => units.includes(el));

            let objIng;
            if(unitIndex > -1) {
                 //There is a unit
                 //ex: 4 1/2 cups
                 //ex: 4 cups
                 const arrCount = arrIng.slice(0,unitIndex);

                 let count;
                 if(arrCount === 1) {
                     count = eval(arrIng[0].replace('-', '+'));
                 } else {
                     count = eval(arrIng.slice(0, unitIndex).join('+'));  //eval(4+1/2)
                 }

                 objIng = {
                     count,
                     unit: arrIng[unitIndex],
                     ingredient: arrIng.slice(unitIndex+1).join(' ')
                 }

            }else if(parseInt(arrIng[0], 10)) {
                //There is no unit but first element is a number
                objIng = {
                    count: parseInt(arrIng[0], 10),
                    unit: '',
                    ingredient: arrIng.splice(1).join(' ')
                }
            }else if(unitIndex === -1) {
                //There is no unit and no number in first position
                objIng = {
                    count: 1,
                    unit: '',
                    ingredient //ingredient = ingredient
                }
            }

            return objIng;
        });
        this.ingredients = newIngredients;
    }

    //type => increase or decrease the servings
    updateServings(type) {
        //servings
        const newServings = type === 'dec' ? this.servings-1 : this.servings + 1;

        //ingredients
        this.ingredients.forEach(ing => {
            ing.count *= (newServings/this.servings);
        });
        this.servings = newServings;
    }
}