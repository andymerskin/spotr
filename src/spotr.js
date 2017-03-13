import _ from 'lodash'
import StringScore from 'string-score'

export class Spotr {
  constructor(options) {
    this.options = Object.assign({}, options)
    this._collection = options.collection || []
    this._keywords = options.keywords || {}
    this._fields = options.fields || {}
  }

  /**
   * Queries the collection, matching keyword and field filters.
   * @param  {string} searchQuery Search query
   * @return {array}             Filtered collection after being processed by keyword and field filters
   */
  query(searchQuery) {
    let { collection, query } = this._filterKeywords(searchQuery)
    const { collection: filteredCollection } = this._filterFields({ collection, query })
    return filteredCollection
  }

  /**
   * Gets the collection
   * @return {array} Array of objects to search against
   */
  get collection() {
    return this._collection
  }

  /**
   * Set the collection to search against.
   * @param {array} newCollection Array of objects to search against
   */
  set collection(newCollection) {
    this._collection = newCollection
  }

  /**
   * Filter the collection using the configured keywords. Matches keyword queries and returns the filtered collection.
   * @param  {string} searchQuery Search query
   * @return {array}             Filtered collection
   */
  _filterKeywords(searchQuery) {
    let collection = this.collection
    let query = searchQuery

    // Find keyword query matches in search query
    const matches = _(this._keywords)
      .map((rule, keyword) => {
        const { queries } = rule
        return {
          keyword,
          matches: queries.map(query => {
            const regex = new RegExp(`(${query})[\\s]|(${query})$`, 'ig')
            return {
              query,
              match: regex.test(searchQuery)
            }
          })
        }
      })
      .filter(keyword => _.some(keyword.matches, m => m.match))
      .value()

    // Filter collection
    collection = matches
      .reduce((prev, match) => {
        const { filter } = this._keywords[match.keyword]
        return filter(prev)
      }, [...this.collection])

    // Strip search query of keywords
    const matchingQueries = _(matches)
      .flatMap(keyword => keyword.matches)
      .filter(m => m.match) // is this needed still? it's used above
      .map(match => match.query)
      .forEach(match => {
        query = query.replace(match, '')
      })

    // Cleanup search query
    query = query.trim()

    return {
      collection,
      query
    }
  }

  /**
   * Filter the collection using the configured fields. Uses string scoring to match against full-text fields in the collection. Results are ordered by score (descending)
   * @param  {array} options.collection Filtered collection (from keywords)
   * @param  {string} options.query      Modified search query terms to filter with
   * @return {array}                    Filtered collection
   */
  _filterFields({collection, query}) {
    if (!query.length) return { collection }

    const scoredCollection = _(collection)
      .map(item => {
        return {
          ...item,
          _score: _(this._fields).reduce((sum, options, field) => {
            sum = (sum + StringScore(item[field], query, options.fuzzy)) * options.boost
            return sum
          }, 0)
        }
      })
      .filter(item => item._score > 0)
      .orderBy(['_score'], ['desc'])
      .value()

    return {
      collection: scoredCollection
    }
  }
}

export default Spotr