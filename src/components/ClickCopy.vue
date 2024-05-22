<script setup>
  defineProps(['content']);

  let success = '';

  const copy = (content) => {
    navigator.clipboard.writeText(content);
    // alert(`"${content}" has been copied to the clipboard`);
  };
</script>

<template>
  <button class="input-group-text btn-block text-center text-wrap" v-on:click="copy(content)">
    <code class="text-center px-2">{{ content }}</code>
    <img src="../assets/icons/copy.svg" class="ms-auto" alt="Copy icon" />
  </button>
</template>
