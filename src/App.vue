<script setup>
    import navbar from './components/Navbar.vue';
    import particleConfig from './assets/particles.json';

    import ToastContainer from '@/components/ToastContainer.vue';

    const particlesLoaded = async (container) => {
        console.log('Particles container loaded', container);
    };
</script>

<template>
    <vue-particles id="tsparticles" :particlesLoaded="particlesLoaded" :options="particleConfig" />
    <navbar></navbar>
    <div class="jumbotron vertical-center nav-offset">
        <main class="align-middle py-4 my-auto w-100">
            <router-view></router-view>
        </main>
    </div>
    <ToastContainer />
</template>
