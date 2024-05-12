<template>
    <navbar></navbar>
    <div class="jumbotron vertical-center nav-offset">
        <main class="align-middle py-4 my-auto w-100">
            <router-view></router-view>
        </main>
    </div>
</template>

<script>
import navbar from './components/Navbar.vue';
export default {
    components: {
        navbar,
    },
};
</script>
