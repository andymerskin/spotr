<script lang="ts">
  import { derived } from 'svelte/store';
  import { createSpotr } from 'spotr/svelte';
  import gamesData from './data/games.json';
  import { getNestedValue, highlightCellValue } from './utils';
  import type { Game } from './types';

  const completedHandler = (col: Game[]) => col.filter((i) => i.completed);
  const platformHandler = (col: Game[], terms?: string[]) =>
  col.filter((i) =>
    (terms ?? []).some((t) => i.platforms.some((p) => p.toLowerCase().includes(t)))
  );
  const recentHandler = (col: Game[]) => col.filter((i) => i.releaseYear >= 2020);

  const title = 'Keywords - Advanced';
  const columns = ["title","platforms","releaseYear","completed"];
  const examples = ["witcher","done","ps5","nintendo"];

  const config = {
    collection: gamesData as Game[],
    threshold: 0.3,
    fields: [{ name: 'title', weight: 1 }],
    keywords: {
      mode: 'and',
      definitions: [
        { name: 'completed', triggers: ['done', 'complete', 'finished'], handler: completedHandler },
        { name: 'platform', triggers: ['ps4', 'ps5', 'xbox', 'pc', 'switch'], handler: platformHandler },
        { name: 'recent', triggers: ['recent', 'new'], handler: recentHandler },
      ],
    },
    limit: 20,
  };

  const { spotr, query, results: spotrResults } = createSpotr(config as import('spotr').SpotrOptions<Game>);
  
  const results = derived([query, spotrResults], ([$query, $spotrResults]) => {
    if (!$query.trim()) {
      return {
        results: (gamesData as Game[]).slice(0, config.limit).map((item) => ({ item, score: null as number | null })),
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

<style>
  .container {
    font-family: sans-serif;
    padding: 16px;
    background-color: #1a1a1a;
    color: #e5e5e5;
    min-height: 100vh;
    max-width: 960px;
    margin: 0 auto;
  }
  .title {
    font-size: 24px;
    margin-bottom: 16px;
  }
  .input {
    width: 100%;
    max-width: 400px;
    padding: 8px 12px;
    margin-bottom: 12px;
    background-color: #2a2a2a;
    border: 1px solid #444;
    color: #e5e5e5;
    border-radius: 4px;
  }
  .buttons {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-bottom: 16px;
  }
  .button {
    padding: 4px 12px;
    background-color: #2a2a2a;
    border: 1px solid #444;
    color: #e5e5e5;
    border-radius: 4px;
    cursor: pointer;
  }
  .table {
    border-collapse: collapse;
    width: 100%;
  }
  .th {
    text-align: left;
    padding: 8px 12px;
    border-bottom: 1px solid #444;
    background-color: #2a2a2a;
  }
  .tr {
    border-bottom: 1px solid #333;
  }
  .td {
    padding: 8px 12px;
  }
  :global(.keyword-highlight) {
    background: #fef08a;
    font-weight: bold;
  }
  .input::-webkit-search-cancel-button {
    -webkit-appearance: none;
    appearance: none;
    height: 16px;
    width: 16px;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%23e5e5e5' d='M8 6.586L11.414 3.172l1.414 1.414L9.414 8l3.414 3.414-1.414 1.414L8 9.414l-3.414 3.414-1.414-1.414L6.586 8 3.172 4.586l1.414-1.414L8 6.586z'/%3E%3C/svg%3E");
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
    cursor: pointer;
    opacity: 0.7;
  }
  .input::-webkit-search-cancel-button:hover {
    opacity: 1;
  }
</style>