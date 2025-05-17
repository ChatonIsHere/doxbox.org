<script setup>
    import { useToastStore } from '@/stores/toastStore';
    import { storeToRefs } from 'pinia';

    const toastStore = useToastStore();
    const { toasts } = storeToRefs(toastStore);

    const getTextColor = (backgroundClass) => {
        const lightBackgrounds = ['bg-warning', 'bg-light', 'bg-info'];
        return lightBackgrounds.includes(backgroundClass) ? 'text-black' : 'text-white';
    };
</script>

<template>
    <div class="toast-container position-fixed bottom-0 end-0 p-3 w-100" style="z-index: 1050">
        <div v-for="toast in toasts" :key="toast.id" class="toast show align-items-center border-0 mb-2 w-100" role="alert" aria-live="assertive" aria-atomic="true" :class="toast.backgroundClass || 'bg-primary'">
            <div class="d-flex justify-content-center">
                <div class="toast-body" :class="getTextColor(toast.backgroundClass || 'bg-primary')">
                    {{ toast.message }}
                    <span v-if="toast.count > 1" class="fw-bold"> (x{{ toast.count }})</span>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
    .toast {
        pointer-events: none;
        box-shadow: 0 6px 6px rgba(0, 0, 0, 0.1), 0 -4px 6px rgba(0, 0, 0, 0.1);
    }

    .toast-container {
        pointer-events: none;
    }
</style>
