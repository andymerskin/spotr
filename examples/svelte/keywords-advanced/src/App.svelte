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