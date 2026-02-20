<script lang="ts">
  import { derived } from 'svelte/store';
  import { createSpotr } from 'spotr/svelte';
  import gamesJson from './data/games.json';
  import { getNestedValue, highlightCellValue } from './utils';
  import type { Game } from './types';

  const gamesData: Game[] = gamesJson as Game[];

  const completedHandler = (col: Game[]) => col.filter((i) => i.completed);

  const title = 'Keywords - Basic';
  const columns = ["title","metadata.developer","releaseYear","platforms","completed"];
  const textExamples = ['witcher', 'spider', 'zelda', 'souls'];
  const keywordExamples = ['done', 'finished'];
  const LIMIT = 20;

  const { spotr: _spotr, query, results: spotrResults } = createSpotr({
    collection: gamesData,
    threshold: 0.3,
    fields: [
      { name: 'title', weight: 1 },
      { name: 'metadata.developer', weight: 0.9 },
    ],
    keywords: [
      { name: 'completed', triggers: ['done', 'complete', 'finished'], handler: completedHandler },
    ],
    limit: LIMIT,
  });
  
  const results = derived([query, spotrResults], ([$query, $spotrResults]) => {
    if (!$query.trim()) {
      return {
        results: gamesData.slice(0, LIMIT).map((item) => ({ item, score: null as number | null })),
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
  <div class="example-groups">
    <div class="example-group">
      <span class="example-label">Try:</span>
      {#each textExamples as ex}
        <button class="button" on:click={() => ($query = ex)}>{ex}</button>
      {/each}
    </div>
    <div class="example-group">
      <span class="example-label">Keywords:</span>
      {#each keywordExamples as ex}
        <button class="button" on:click={() => ($query = ex)}>{ex}</button>
      {/each}
    </div>
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
      {#each $results.results as r}
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