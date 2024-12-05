<script setup>
    defineProps(['content']);

    let success = '';

    const copy = (content) => {
        navigator.clipboard.writeText(content);
        // alert(`"${content}" has been copied to the clipboard`);
    };
</script>

<template>
    <button class="input-group-text btn-block text-wrap" v-on:click="copy(content)">
        <code class="px-2 w-100">{{ content }}</code>
        <img src="../assets/icons/copy.svg" class="ms-auto ununun" alt="Copy icon" />
    </button>
</template>

<style scoped>
    code {
        margin-left: 16px;
    }
</style>
