import { defineStore } from 'pinia';
import { ref, computed, onUnmounted, watch } from 'vue';
import { getFirestore, collection, doc, onSnapshot, addDoc, updateDoc, deleteDoc, writeBatch, query, where } from 'firebase/firestore';
import { useAuthStore } from './authStore';
import { useSessionsStore } from './sessionsStore'; // To get campaign info

export const useJournalStore = defineStore('journal', () => {
    const firestore = getFirestore(); // Use Firestore
    const authStore = useAuthStore();
    const sessionsStore = useSessionsStore();

    // Use refs to store the data fetched by listeners
    const arcs = ref([]);
    const stages = ref([]);
    const steps = ref([]);

    const selectedCampaignId = ref(null);
    const selectedArcId = ref(null);
    const selectedStageId = ref(null);
    const selectedStepId = ref(null);

    // Refs to store unsubscribe functions
    const unsubscribeArcs = ref(null);
    const unsubscribeStages = ref(null);
    const unsubscribeSteps = ref(null);

    const selectCampaign = (campaignId) => {
        // Unsubscribe from previous campaign's listeners
        if (unsubscribeArcs.value) unsubscribeArcs.value();
        if (unsubscribeStages.value) unsubscribeStages.value();
        if (unsubscribeSteps.value) unsubscribeSteps.value();

        selectedCampaignId.value = campaignId;
        selectedArcId.value = null;
        selectedStageId.value = null;
        selectedStepId.value = null;

        // Clear previous data
        arcs.value = [];
        stages.value = [];
        steps.value = [];

        if (campaignId) {
            subscribeToArcs(campaignId);
        }
    };

    const subscribeToArcs = (campaignId) => {
        if (!campaignId) return;
        const arcsCollectionRef = collection(firestore, `journal/${campaignId}/arcs`);
        unsubscribeArcs.value = onSnapshot(
            arcsCollectionRef,
            (snapshot) => {
                arcs.value = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
                // If the previously selected arc is no longer in the list, deselect it
                if (selectedArcId.value && !arcs.value.some((arc) => arc.id === selectedArcId.value)) {
                    selectedArcId.value = null;
                }
            },
            (error) => {
                console.error('Error fetching arcs:', error);
            }
        );
    };

    // Watch for selectedArcId changes to subscribe to stages
    watch(selectedArcId, (newArcId, oldArcId) => {
        // Unsubscribe from previous stage/step listeners
        if (unsubscribeStages.value) unsubscribeStages.value();
        if (unsubscribeSteps.value) unsubscribeSteps.value();

        stages.value = [];
        steps.value = [];
        selectedStageId.value = null;
        selectedStepId.value = null;

        if (selectedCampaignId.value && newArcId) {
            subscribeToStages(selectedCampaignId.value, newArcId);
        }
    });

    const subscribeToStages = (campaignId, arcId) => {
        if (!campaignId || !arcId) return;
        const stagesCollectionRef = collection(firestore, `journal/${campaignId}/arcs/${arcId}/stages`);
        unsubscribeStages.value = onSnapshot(
            stagesCollectionRef,
            (snapshot) => {
                stages.value = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
                // If the previously selected stage is no longer in the list, deselect it
                if (selectedStageId.value && !stages.value.some((stage) => stage.id === selectedStageId.value)) {
                    selectedStageId.value = null;
                }
            },
            (error) => {
                console.error('Error fetching stages:', error);
            }
        );
    };

    // Watch for selectedStageId changes to subscribe to steps
    watch(selectedStageId, (newStageId, oldStageId) => {
        // Unsubscribe from previous step listener
        if (unsubscribeSteps.value) unsubscribeSteps.value();

        steps.value = [];
        selectedStepId.value = null;

        if (selectedCampaignId.value && selectedArcId.value && newStageId) {
            subscribeToSteps(selectedCampaignId.value, selectedArcId.value, newStageId);
        }
    });

    const subscribeToSteps = (campaignId, arcId, stageId) => {
        if (!campaignId || !arcId || !stageId) return;
        const stepsCollectionRef = collection(firestore, `journal/${campaignId}/arcs/${arcId}/stages/${stageId}/steps`);
        unsubscribeSteps.value = onSnapshot(
            stepsCollectionRef,
            (snapshot) => {
                steps.value = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
                // If the previously selected step is no longer in the list, deselect it
                if (selectedStepId.value && !steps.value.some((step) => step.id === selectedStepId.value)) {
                    selectedStepId.value = null;
                }
            },
            (error) => {
                console.error('Error fetching steps:', error);
            }
        );
    };

    const selectedArc = computed(() => {
        return arcs.value.find((arc) => arc.id === selectedArcId.value) || null;
    });

    const selectedStage = computed(() => {
        return stages.value.find((stage) => stage.id === selectedStageId.value) || null;
    });

    const selectedStep = computed(() => {
        return steps.value.find((step) => step.id === selectedStepId.value) || null;
    });

    const addArc = async (arcData) => {
        if (!selectedCampaignId.value || !authStore.user) return;
        const { name, description } = arcData;
        const arcsCollectionRef = collection(firestore, `journal/${selectedCampaignId.value}/arcs`);
        const newArcDocRef = await addDoc(arcsCollectionRef, { name, description });
        return newArcDocRef.id;
    };

    const updateArc = async (arcId, arcData) => {
        if (!selectedCampaignId.value || !authStore.user || !arcId) return;
        const { name, description } = arcData;
        const arcDocRef = doc(firestore, `journal/${selectedCampaignId.value}/arcs`, arcId);
        await updateDoc(arcDocRef, { name, description });
    };

    const addStage = async (arcId, stageData) => {
        if (!selectedCampaignId.value || !authStore.user || !arcId) return;
        const { name } = stageData;
        const stagesCollectionRef = collection(firestore, `journal/${selectedCampaignId.value}/arcs/${arcId}/stages`);
        const newStageDocRef = await addDoc(stagesCollectionRef, { name });
        return newStageDocRef.id;
    };

    const updateStage = async (arcId, stageId, stageData) => {
        if (!selectedCampaignId.value || !authStore.user || !arcId || !stageId) return;
        const { name } = stageData;
        const stageDocRef = doc(firestore, `journal/${selectedCampaignId.value}/arcs/${arcId}/stages`, stageId);
        await updateDoc(stageDocRef, { name });
    };

    const addStep = async (arcId, stageId, stepData) => {
        if (!selectedCampaignId.value || !authStore.user || !arcId || !stageId) return;
        const { name, summary, notes, type } = stepData;
        const stepsCollectionRef = collection(firestore, `journal/${selectedCampaignId.value}/arcs/${arcId}/stages/${stageId}/steps`);
        const newStepDocRef = await addDoc(stepsCollectionRef, { name, summary, notes, type, completed: type === 'done' ? true : false });
        return newStepDocRef.id;
    };

    const updateStep = async (arcId, stageId, stepId, stepData) => {
        if (!selectedCampaignId.value || !authStore.user || !arcId || !stageId || !stepId) return;
        const updates = {};
        if (stepData.name !== undefined) updates.name = stepData.name;
        if (stepData.summary !== undefined) updates.summary = stepData.summary;
        if (stepData.notes !== undefined) updates.notes = stepData.notes;
        if (stepData.type !== undefined) updates.type = stepData.type;
        if (stepData.completed !== undefined) updates.completed = stepData.completed;

        const stepDocRef = doc(firestore, `journal/${selectedCampaignId.value}/arcs/${arcId}/stages/${stageId}/steps`, stepId);
        await updateDoc(stepDocRef, updates);
    };

    const toggleStepCompletion = async (arcId, stageId, stepId, completed) => {
        await updateStep(arcId, stageId, stepId, { completed });
    };

    // Initial subscription when the store is created, if a campaign is already selected
    // This might happen if the user navigates directly to the Journal page with a campaign ID in the URL
    // However, the primary way campaign is selected is via the dropdown, which calls selectCampaign
    // onMounted in the component handles initial selection based on playerCampaigns

    onUnmounted(() => {
        // Unsubscribe from all listeners when the store is unmounted
        if (unsubscribeArcs.value) unsubscribeArcs.value();
        if (unsubscribeStages.value) unsubscribeStages.value();
        if (unsubscribeSteps.value) unsubscribeSteps.value();
    });

    return {
        selectedCampaignId,
        selectedArcId,
        selectedStageId,
        selectedStepId,
        selectCampaign,
        arcs,
        selectedArc,
        stages,
        selectedStage,
        steps,
        selectedStep,
        addArc,
        updateArc,
        addStage,
        updateStage,
        addStep,
        updateStep,
        toggleStepCompletion,
        // For campaign selection dropdown
        playerCampaigns: computed(() => sessionsStore.playerCampaigns),
    };
});
