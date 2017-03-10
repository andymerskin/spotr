import _ from 'lodash'
import StringScore from 'string-score'

export class Spotr {
  constructor(options) {
    this.options = Object.assign({}, options)
    this.collection = options.collection || []
    this.keywords = options.keywords || {}
    this.fields = options.fields || {}
  }

  /**
   * Queries the collection, matching keyword and field filters.
   * @param  {string} searchQuery Search query
   * @return {array}             Filtered collection after being processed by keyword and field filters
   */
  query(searchQuery) {
    let { collection, query } = this.filterKeywords(searchQuery)
    const { collection: filteredCollection } = this.filterFields({ collection, query })
    return filteredCollection
  }

  /**
   * Set the collection to search against.
   * @param {array} collection Array of objects to search against
   */
  setCollection(collection) {
    this.collection = collection
  }

  /**
   * Filter the collection using the configured keywords. Matches keyword queries and returns the filtered collection.
   * @param  {string} searchQuery Search query
   * @return {array}             Filtered collection
   */
  filterKeywords(searchQuery) {
    let collection = this.collection
    let query = searchQuery

    // Find keyword query matches in search query
    const matches = _(this.keywords)
      .map((rule, keyword) => {
        const { queries } = rule
        return {
          keyword,
          matches: queries.map(query => {
            const rx = new RegExp(`(${query})[\\s]|(${query})$`, 'ig')
            return {
              query,
              match: rx.test(searchQuery)
            }
          })
        }
      })
      .filter(keyword => _.some(keyword.matches, m => m.match))
      .value()

    // Filter collection
    collection = matches
      .reduce((prev, match) => {
        const { filter } = this.keywords[match.keyword]
        return prev.filter(filter)
      }, [...this.collection])

    // Strip search query of keywords
    const matchingQueries = _(matches)
      .flatMap(keyword => keyword.matches)
      .filter(m => m.match)
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
  filterFields({collection, query}) {
    if (!query.length) return { collection }

    const scoredCollection = _(collection)
      .map(item => {
        return {
          ...item,
          _score: _(this.fields).reduce((sum, options, field) => {
            sum = (sum + StringScore(item[field], query, options.fuzziness)) * options.boost
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