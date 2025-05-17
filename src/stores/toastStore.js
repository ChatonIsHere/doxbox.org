import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useToastStore = defineStore('toast', () => {
    const toasts = ref([]);
    const toastDuration = ref(10000);

    const addToast = (payload) => {
        const { message, backgroundClass } = payload;

        const existingToast = toasts.value.find((toast) => toast.message === message && toast.backgroundClass === backgroundClass);

        if (existingToast) {
            existingToast.count = (existingToast.count || 1) + 1;
            clearTimeout(existingToast.timer);
            existingToast.timer = setTimeout(() => {
                removeToast(existingToast.id);
            }, toastDuration.value);
        } else {
            const id = Date.now();
            const timer = setTimeout(() => {
                removeToast(id);
            }, toastDuration.value);

            toasts.value.push({ id, ...payload, count: 1, timer });
        }
    };

    const removeToast = (id) => {
        toasts.value = toasts.value.filter((toast) => toast.id !== id);
    };

    const clearAllToasts = () => {
        toasts.value.forEach((toast) => clearTimeout(toast.timer));
        toasts.value = [];
    };

    return {
        toasts,
        toastDuration,
        addToast,
        removeToast,
        clearAllToasts,
    };
});
