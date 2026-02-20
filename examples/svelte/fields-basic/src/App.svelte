<script lang="ts">
  import { derived } from 'svelte/store';
  import { createSpotr } from 'spotr/svelte';
  import peopleData from './data/people.json';
  import { getNestedValue, highlightCellValue } from './utils';
  import type { Person } from './types';

  const title = 'Fields - Basic';
  const columns = ['firstName', 'lastName', 'email'];
  const examples = ['alice', 'aloce', 'wayne', 'acme.com'];

  const config = {
    collection: peopleData as Person[],
    threshold: 0.3,
    fields: [
      { name: 'firstName', weight: 1 },
      { name: 'lastName', weight: 1 },
      { name: 'email', weight: 0.7 },
    ],
    limit: 20,
  };

  const { spotr, query, results: spotrResults } = createSpotr(config as import('spotr').SpotrOptions<Person>);
  
  const results = derived([query, spotrResults], ([$query, $spotrResults]) => {
    if (!$query.trim()) {
      return {
        results: (peopleData as Person[]).slice(0, config.limit).map((item) => ({ item, score: null as number | null })),
        matchedKeywords: [] as { name: string; terms: string[] }[],
        tokens: [] as string[],
        warnings: [] as string[],
      };
    }
    return $spotrResults;
  });
</script>

<div class="container">
  <h1 class="title">{title}</h1>
  <input
    type="search"
    bind:value={$query}
    placeholder="Search..."
    class="input"
  />
  <div class="buttons">
    {#each examples as ex}
      <button class="button" on:click={() => ($query = ex)}>{ex}</button>
    {/each}
  </div>
  <table class="table">
    <thead>
      <tr>
        <th class="th">Score</th>
        {#each columns as col}
          <th class="th">{col}</th>
        {/each}
      </tr>
    </thead>
    <tbody>
      {#each $results.results as r, i}
        <tr class="tr">
          <td class="td">{r.score != null ? r.score.toFixed(2) : '-'}</td>
          {#each columns as col}
            <td class="td">
              {@html highlightCellValue(getNestedValue(r.item, col), col, $results.matchedKeywords)}
            </td>
          {/each}
        </tr>
      {/each}
    </tbody>
  </table>
</div>
