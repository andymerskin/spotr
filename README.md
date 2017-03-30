# spotr
> A powerful and minimal search library for static websites.

Great for prototyping search systems during development, or for apps and sites with smaller collections that are being requested and filtered up front.

## Installation

```sh
npm install spotr
```

## Getting Started

When creating a new instance of Spotr, it accepts a `collection`, `field` filters, and `keyword` filters.

```javascript
import Spotr from 'spotr'
import products from 'products.csv'

const search = new Spotr({
  
  // Collection of objects to search on
  collection: products,

  // Full-text fields to match search query against
  fields: {

    // item.name
    name: {
      fuzzy: 0,
      boost: 9
    },

    // item.category
    category: {
      fuzzy: 0,
      boost: 8
    }
  },
  
  // Keyword definitions
  keywords: {
    isAwesome: {

      // Specific queries to match. Queries with multiple words possible too!
      queries: ['awesome', 'amazing', 'incredible', 'terrific', 'super cool'],

      // Filter to run on the collection when any of the above queries exist in the search query
      filter: collection => collection.filter(item => item.isAwesome)
    }
  }
})
```

### Collection
The **collection** is the array of objects you want to search against. For static websites with a small set of things to search for, using `webpack` to load a JSON or CSV file makes it easy to bundle your collection with the final build.

```javascript
import products from 'products.csv'

const search = new Spotr({
  collection: products
})
```


### Fields
**Fields** tell Spotr to search against a specific string property on each item in the collection. Results are scored and sorted based on them.

```javascript
fields: {
  title: {
    boost: 9,
    fuzzy: 0.3
  },
  category: {
    boost: 8
  }
}
```

`fuzzy` is number between 0 and 1 passed to the `string-score` library, which determines how relaxed to be while scoring. 0 means exact matches, and 1 allows for misspellings.

`boost` is a multiplier applied to the final string score to prioritize the result if the field has a positive match. For instance, you may want queries matching closest to the name or title of an item to rank higher than if it matches its category.

**Example**

| property | boost value |
| --- | --- |
| title | 9 |
| category | 8 |
| label | 7 |
| author | 6 |

When multiple fields on an item have positive matches, their scores are added together. Finally, the items' total scores are sorted to return the most relevant results.


### Keywords
**Keywords** tell Spotr to look for specific queries within the search query to further filter the collection.

```javascript
keywords: {
  completed: {
    queries: ['complete', 'completed', 'is done'],
    filter: collection => collection.filter(item => item.completed)
  }
}
```

`queries` is an array of query strings to match. They can be one word, or multiple words, but must match exactly for the filter to be applied.

`filter` is a function that takes in the `collection` where mutations can safely be applied and returned.

#### Keywords are applied additively
Keyword filters are applied to the collection additively, so if multiple filters are a positive match, it will result in a narrower set of results. The filtered collection is finally passed to our `fields` before returning the final result.

#### Search query refinement
When `keyword` definitions are being used, matching queries are removed from the search query before being tested against each field. For example, if we wanted to filter shirts on clearance:

```javascript
keywords: {
  clearance: {
    queries: ['clearance', 'sale', 'for sale', 'on sale'],
    filter: collection => collection.filter(item => item.clearance)
  }
}
```

...and we searched for **red flannel shirts on sale**, our search query used in our fields would be **red flannel shirts**, because "on sale" was matched, since we know "on sale" won't show up in the names or categories of our products.

## Instance Methods

### query(searchString)

Query the collection with a search string.

- `searchString` - The string query to match against the [`keywords`](#keywords) and [`fields`](#fields) definitions.

Returns the filtered collection after being processed by keyword and field filters.

```javascript
const search = new Spotr({
  fields: {
    gameTitle: {
      boost: 9
    }
  },
  keywords: {
    allAges: {
      queries: ['all ages'],
      filter: collection => collection.filter(item => item.allAges)
    }
  }
})

search.query('party games for all ages')
// => Array of games for all ages
```

### collection

Get or set the collection Spotr is searching against.

- `collection` - An array of objects.

```javascript
const search = new Spotr({ ... })

// Get the collection
search.collection // [ item, item ...]

// Set the collection
search.collection = [
  { name: 'Watermelon', rating: 5 },
  { name: 'Prune', rating: 4 },
  { name: 'Durian', rating: 1}
]
// Nothing against durians... well, they just smell bad.
```

## Contributors

### Developing
```sh
git clone https://github.com/docmars/spotr
cd spotr
npm install
npm run dev
```

### Building
```sh
npm run build
```

## License
MIT
