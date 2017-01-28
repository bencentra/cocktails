const path = require('path');
const fs = require('fs');

// List of cocktails and ingredients, primary ingredient first
// {
//   "manhattan": ["whiskey", "sweet vermouth", "bitters"],
//   ...
// }
const cocktails = require('./cocktails.json');

// Manifest of drinks, recipes, and mixers
// {
//   "whiskey": {
//     "count": 9,
//     "drinks": {
//       "manhattan": [
//         "whiskey",
//         "sweet vermouth",
//         "bitters"
//       ],
//       ...
//     },
//     "mixers": {
//       "whiskey": 9,
//       "bitters": 3,
//       "sugar": 2,
//       "sweet vermouth": 2,
//       ...
//     }
//   },
//   ...
// }
let manifest = {};

function addCocktailToManifest(cocktail, primary, ingredients) {
  if (manifest[primary]) {
    manifest[primary].count += 1;
    manifest[primary].drinks[cocktail] = ingredients
  } else {
    const drinks = {};
    drinks[cocktail] = ingredients;
    manifest[primary] = {
      count: 1,
      drinks,
      mixers: {}
    }
  }
  addMixers(primary, ingredients);
  sortMixersByCount(primary);
}

function addMixers(primary, ingredients) {
  ingredients.forEach(function(ingredient) {
    if (manifest[primary].mixers[ingredient]) {
      manifest[primary].mixers[ingredient] += 1
    } else {
      manifest[primary].mixers[ingredient] = 1
    }
  });
}

function sortMixersByCount(primary) {
  const mixers = [];
  Object.keys(manifest[primary].mixers).forEach(function(mixer) {
    mixers.push({
      name: mixer,
      count: manifest[primary].mixers[mixer]
    });
  });
  mixers.sort(function(a, b) {
    return b.count - a.count;
  });
  manifest[primary].mixers = mixers.reduce(function(prev, curr) {
    prev[curr.name] = curr.count
    return prev;
  }, {});
}

function sortPrimariesByCount() {
  const primaries = [];
  Object.keys(manifest).forEach(function(primary) {
    primaries.push({
      name: primary,
      data: manifest[primary]
    });
  });
  primaries.sort(function(a, b) {
    return b.data.count - a.data.count;
  });
  manifest = primaries.reduce(function(prev, curr) {
    prev[curr.name] = curr.data;
    return prev;
  }, {});
}

function writeManifestToFile(fileName) {
  const filePath = path.join(__dirname, `./${fileName}`);
  fs.writeFileSync(filePath, JSON.stringify(manifest));
}

Object.keys(cocktails).forEach(function(cocktail) {
  const ingredients = cocktails[cocktail];
  const primary = ingredients[0];
  addCocktailToManifest(cocktail, primary, ingredients);
});
sortPrimariesByCount();
writeManifestToFile('manifest.json');
