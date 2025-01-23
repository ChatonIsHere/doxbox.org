<script setup>
    import { useCurrentUser } from 'vuefire';
    import ClickCopy from '../components/ClickCopy.vue';

    const user = useCurrentUser();
</script>

<template>
    <div class="px-4 py-5 text-center">
        <h1 class="display-4 fw-bold text-white">Settings :3</h1>
        <div class="container">
            <table class="table table-borderless">
                <tbody>
                    <tr>
                        <td class="text-end">Mark</td>
                        <td class="text-start">@mdo</td>
                    </tr>
                    <tr>
                        <td class="text-end">Jacob</td>
                        <td class="text-start">@fat</td>
                    </tr>
                    <tr>
                        <td class="text-end">Larry the Bird</td>
                        <td class="text-start">@twitter</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<style>
    --bs-table-bg {
        background-color: transparent !important;
    }
</style>
