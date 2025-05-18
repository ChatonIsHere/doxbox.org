import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useBreakpointStore = defineStore('breakpoint', () => {
    const breakpointSm = ref(false);
    const breakpointMd = ref(false);
    const breakpointLg = ref(false);
    const breakpointXl = ref(false);
    const breakpointXxl = ref(false);

    const updateBreakpoints = () => {
        const width = window.innerWidth;
        breakpointSm.value = width >= 576;
        breakpointMd.value = width >= 768;
        breakpointLg.value = width >= 992;
        breakpointXl.value = width >= 1200;
        breakpointXxl.value = width >= 1400;
    };

    updateBreakpoints();

    window.addEventListener('resize', updateBreakpoints);

    return {
        breakpointSm,
        breakpointMd,
        breakpointLg,
        breakpointXl,
        breakpointXxl,
    };
});
