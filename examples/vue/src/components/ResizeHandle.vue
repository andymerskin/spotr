<script setup lang="ts">
const emit = defineEmits<{
  mousedown: [];
}>();

function handleMouseDown() {
  emit('mousedown');
}
</script>

<template>
  <div
    class="w-1 bg-neutral-700 hover:bg-blue-500 cursor-col-resize shrink-0 transition-colors"
    @mousedown="handleMouseDown"
  />
</template>
