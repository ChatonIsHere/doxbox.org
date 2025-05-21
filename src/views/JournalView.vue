<script setup>
    import { ref, computed, onMounted, watch } from 'vue';
    import { storeToRefs } from 'pinia';
    import { useJournalStore } from '@/stores/journalStore';
    import { useSessionsStore } from '@/stores/sessionsStore'; // To get campaign names
    import { marked } from 'marked'; // For rendering markdown

    const journalStore = useJournalStore();
    const sessionsStore = useSessionsStore();

    const { selectedCampaignId, arcs, selectedArcId, stages, selectedStageId, steps, selectedStepId, selectedStep, playerCampaigns } = storeToRefs(journalStore);

    const { selectCampaign, addArc, addStage, addStep, updateStep, toggleStepCompletion } = journalStore;

    const campaignName = (campaignId) => {
        const campaign = sessionsStore.campaignFromID(campaignId);
        return campaign ? campaign.name : 'Unknown Campaign';
    };

    const renderedNotes = computed(() => {
        if (selectedStep.value && selectedStep.value.notes) {
            return marked(selectedStep.value.notes);
        }
        return '';
    });

    // --- Form models for adding new items ---
    const newArcName = ref('');
    const newArcDescription = ref('');
    const showAddArcForm = ref(false);

    const newStageName = ref('');
    const showAddStageForm = ref(false);

    const newStepName = ref('');
    const newStepSummary = ref('');
    const newStepNotes = ref('');
    const newStepType = ref('planned'); // 'planned' or 'done'
    const showAddStepForm = ref(false);
    // --- End Form models ---

    // --- Edit mode toggle ---
    const isEditing = ref(false);

    const handleAddArc = async () => {
        if (!newArcName.value.trim() || !selectedCampaignId.value) return;
        await addArc({ name: newArcName.value, description: newArcDescription.value });
        newArcName.value = '';
        newArcDescription.value = '';
        showAddArcForm.value = false;
    };

    const handleAddStage = async () => {
        if (!newStageName.value.trim() || !selectedArcId.value) return;
        await addStage(selectedArcId.value, { name: newStageName.value });
        newStageName.value = '';
        showAddStageForm.value = false;
    };

    const handleAddStep = async () => {
        if (!newStepName.value.trim() || !selectedStageId.value) return;
        await addStep(selectedArcId.value, selectedStageId.value, {
            name: newStepName.value,
            summary: newStepSummary.value,
            notes: newStepNotes.value,
            type: newStepType.value,
        });
        newStepName.value = '';
        newStepSummary.value = '';
        newStepNotes.value = '';
        newStepType.value = 'planned';
        showAddStepForm.value = false;
    };

    const handleToggleStep = async (step) => {
        if (!selectedArcId.value || !selectedStageId.value) return;
        await toggleStepCompletion(selectedArcId.value, selectedStageId.value, step.id, !step.completed);
    };

    const selectArc = (arcId) => {
        journalStore.selectedArcId = arcId;
        journalStore.selectedStageId = null;
        journalStore.selectedStepId = null;
        showAddStageForm.value = false;
        showAddStepForm.value = false;
    };

    const selectStage = (stageId) => {
        journalStore.selectedStageId = stageId;
        journalStore.selectedStepId = null;
        showAddStepForm.value = false;
    };

    const selectStep = (stepId) => {
        journalStore.selectedStepId = stepId;
    };

    // Watch for playerCampaigns to be loaded and select the first one by default
    onMounted(() => {
        if (playerCampaigns.value && playerCampaigns.value.length > 0 && !selectedCampaignId.value) {
            selectCampaign(playerCampaigns.value[0].id);
        }
    });

    watch(playerCampaigns, (newCampaigns) => {
        if (newCampaigns && newCampaigns.length > 0 && !selectedCampaignId.value) {
            selectCampaign(newCampaigns[0].id);
        }
    });

    watch(selectedCampaignId, (newVal, oldVal) => {
        if (newVal !== oldVal) {
            showAddArcForm.value = false;
            showAddStageForm.value = false;
            showAddStepForm.value = false;
            isEditing.value = false; // Reset edit mode when campaign changes
        }
    });
</script>

<template>
    <div class="journal-container container-fluid pt-3">
        <div class="row">
            <div class="col-12 mb-3 d-flex justify-content-between align-items-center">
                <select v-if="playerCampaigns && playerCampaigns.length > 0" v-model="selectedCampaignId" @change="selectCampaign($event.target.value)" class="form-select form-select-lg bg-dark text-white border-secondary me-2">
                    <option v-for="campaign in playerCampaigns" :key="campaign.id" :value="campaign.id">
                        {{ campaign.name }}
                    </option>
                </select>
                <p v-else class="text-white-50 mb-0 me-2">No campaigns available. Join a campaign to use the Journal.</p>
                <button v-if="selectedCampaignId" class="btn btn-secondary" @click="isEditing = !isEditing">
                    {{ isEditing ? 'Done Editing' : 'Edit Journal' }}
                </button>
            </div>
        </div>

        <div v-if="selectedCampaignId" class="row journal-layout">
            <!-- Left Pane: Tree View -->
            <div class="col-md-4 journal-tree-pane">
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <h4 class="text-white">Journal</h4>
                    <button v-if="isEditing" class="btn btn-sm btn-success" @click="showAddArcForm = !showAddArcForm" title="Add New Arc">+</button>
                </div>

                <form v-if="isEditing && showAddArcForm" @submit.prevent="handleAddArc" class="mb-3 p-2 bg-dark-tle rounded">
                    <div class="mb-2">
                        <input type="text" v-model="newArcName" placeholder="Arc Name" class="form-control form-control-sm bg-secondary text-white border-dark" required />
                    </div>
                    <div class="mb-2">
                        <textarea v-model="newArcDescription" placeholder="Arc Description (short)" class="form-control form-control-sm bg-secondary text-white border-dark" rows="2"></textarea>
                    </div>
                    <button type="submit" class="btn btn-sm btn-primary">Add Arc</button>
                </form>

                <ul class="list-group journal-list">
                    <li v-for="arc in arcs" :key="arc.id" class="list-group-item bg-transparent border-secondary p-0 mb-2">
                        <div @click="selectArc(arc.id)" :class="{ 'active-arc': selectedArcId === arc.id }" class="journal-item arc-item p-2 rounded">
                            <strong class="text-warning">{{ arc.name }}</strong>
                            <p v-if="arc.description" class="text-white-50 small mb-0">{{ arc.description }}</p>
                        </div>

                        <div v-if="selectedArcId === arc.id" class="ps-3 pt-1">
                            <div v-if="isEditing" class="d-flex justify-content-between align-items-center my-1">
                                <h6 class="text-info small mb-0 ms-1">Stages</h6>
                                <button v-if="isEditing" class="btn btn-xs btn-info py-0 px-1" @click.stop="showAddStageForm = !showAddStageForm" title="Add New Stage">+</button>
                            </div>

                            <form v-if="isEditing && showAddStageForm" @submit.prevent="handleAddStage" class="mb-2 p-2 bg-dark-tle rounded ms-1">
                                <div class="mb-1">
                                    <input type="text" v-model="newStageName" placeholder="Stage Name" class="form-control form-control-sm bg-secondary text-white border-dark" required />
                                </div>
                                <button type="submit" class="btn btn-xs btn-primary">Add Stage</button>
                            </form>

                            <ul class="list-group journal-list">
                                <li v-for="stage in stages" :key="stage.id" class="list-group-item bg-transparent border-0 p-0 mb-1">
                                    <div @click.stop="selectStage(stage.id)" :class="{ 'active-stage': selectedStageId === stage.id }" class="journal-item stage-item p-2 rounded ms-1">
                                        <span class="text-info">{{ stage.name }}</span>
                                    </div>

                                    <div v-if="selectedStageId === stage.id" class="ps-3 pt-1">
                                        <div v-if="isEditing" class="d-flex justify-content-between align-items-center my-1">
                                            <h6 class="text-success small mb-0 ms-2">Steps</h6>
                                            <button v-if="isEditing" class="btn btn-xs btn-success py-0 px-1" @click.stop="showAddStepForm = !showAddStepForm" title="Add New Step">+</button>
                                        </div>

                                        <form v-if="isEditing && showAddStepForm" @submit.prevent="handleAddStep" class="mb-2 p-2 bg-dark-tle rounded ms-2">
                                            <div class="mb-1">
                                                <input type="text" v-model="newStepName" placeholder="Step Name" class="form-control form-control-sm bg-secondary text-white border-dark" required />
                                            </div>
                                            <div class="mb-1">
                                                <input type="text" v-model="newStepSummary" placeholder="Step Summary (optional)" class="form-control form-control-sm bg-secondary text-white border-dark" />
                                            </div>
                                            <div class="mb-1">
                                                <textarea v-model="newStepNotes" placeholder="Full Notes (Markdown supported)" class="form-control form-control-sm bg-secondary text-white border-dark" rows="3"></textarea>
                                            </div>
                                            <div class="mb-2">
                                                <select v-model="newStepType" class="form-select form-select-sm bg-secondary text-white border-dark">
                                                    <option value="planned">Planned</option>
                                                    <option value="done">Done</option>
                                                </select>
                                            </div>
                                            <button type="submit" class="btn btn-xs btn-primary">Add Step</button>
                                        </form>

                                        <ul class="list-group journal-list">
                                            <li v-for="step in steps" :key="step.id" class="list-group-item bg-transparent border-0 p-0">
                                                <div @click.stop="selectStep(step.id)" :class="{ 'active-step': selectedStepId === step.id }" class="journal-item step-item p-2 rounded ms-2 d-flex align-items-center">
                                                    <input v-if="step.type === 'planned'" type="checkbox" :checked="step.completed" @change.stop="handleToggleStep(step)" class="form-check-input me-2 bg-dark border-secondary" />
                                                    <span :class="{ 'text-decoration-line-through text-muted': step.completed, 'text-success': step.type !== 'planned' || step.completed }">{{ step.name }}</span>
                                                </div>
                                                <p v-if="selectedStepId === step.id && step.summary" class="text-white-50 small mb-0 ms-4 ps-2">{{ step.summary }}</p>
                                            </li>
                                        </ul>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </li>
                </ul>
                <p v-if="selectedCampaignId && arcs.length === 0 && !showAddArcForm" class="text-center text-white-50 mt-3">No journal entries yet for {{ campaignName(selectedCampaignId) }}. Add an Arc to get started!</p>
            </div>

            <!-- Right Pane: Details View -->
            <div class="col-md-8 journal-details-pane">
                <div v-if="selectedStep" class="p-3 bg-dark-tle rounded h-100">
                    <h3 class="text-white border-bottom border-secondary pb-2 mb-3">{{ selectedStep.name }}</h3>
                    <div v-if="selectedStep.summary" class="mb-3">
                        <h5 class="text-white-75">Summary</h5>
                        <p class="text-white-50">{{ selectedStep.summary }}</p>
                    </div>
                    <h5 class="text-white-75">Notes</h5>
                    <div class="markdown-content text-white-50" v-html="renderedNotes"></div>
                </div>
                <div v-else class="d-flex align-items-center justify-content-center h-100 text-white-50">
                    <p>Select a step to see its details.</p>
                </div>
            </div>
        </div>
        <div v-else-if="playerCampaigns && playerCampaigns.length > 0" class="text-center text-white-50 mt-5">
            <p>Select a campaign to view its Journal.</p>
        </div>
    </div>
</template>

<style scoped>
    .journal-container {
        color: #adb5bd; /* Light grey text, similar to BG3/Divinity */
    }

    .journal-layout {
        min-height: calc(100vh - 200px); /* Adjust based on navbar/footer height */
    }

    .journal-tree-pane {
        background-color: #212529; /* Dark background for the tree */
        padding: 15px;
        border-right: 1px solid #495057;
        overflow-y: auto;
        max-height: calc(100vh - 200px);
    }

    .journal-details-pane {
        background-color: #2a2e33; /* Slightly lighter for details */
        padding: 15px;
        overflow-y: auto;
        max-height: calc(100vh - 200px);
    }

    .bg-dark-tle {
        background-color: #1a1d20e0 !important; /* Custom darker transparent-like */
    }

    .journal-list {
        padding-left: 0;
    }

    .journal-item {
        cursor: pointer;
        transition: background-color 0.2s ease-in-out;
        border: 1px solid transparent; /* for hover/active states */
    }

    .journal-item:hover {
        background-color: #343a40 !important;
    }

    .arc-item strong {
        font-size: 1.1em;
    }

    .active-arc,
    .active-stage,
    .active-step {
        background-color: #007bff40 !important; /* Bootstrap primary with alpha */
        border-left: 3px solid #007bff;
    }

    .active-arc {
        border-left-color: #ffc107; /* Warning color for active arc */
    }
    .active-arc .text-warning {
        color: #ffdd70 !important;
    }

    .active-stage {
        border-left-color: #17a2b8; /* Info color for active stage */
    }
    .active-stage .text-info {
        color: #4fcedf !important;
    }

    .active-step {
        border-left-color: #28a745; /* Success color for active step */
    }
    .active-step .text-success {
        color: #63d880 !important;
    }

    .form-control-sm.bg-secondary::placeholder {
        color: #adb5bd;
    }

    .markdown-content h1,
    .markdown-content h2,
    .markdown-content h3,
    .markdown-content h4,
    .markdown-content h5,
    .markdown-content h6 {
        color: #f8f9fa; /* Lighter headings for markdown */
        margin-top: 1em;
        margin-bottom: 0.5em;
    }

    .markdown-content p {
        margin-bottom: 0.8em;
        line-height: 1.6;
    }

    .markdown-content ul,
    .markdown-content ol {
        padding-left: 2em;
    }

    .markdown-content blockquote {
        border-left: 4px solid #495057;
        padding-left: 1em;
        color: #ced4da;
        margin-left: 0;
    }

    .markdown-content code {
        background-color: #343a40;
        padding: 0.2em 0.4em;
        border-radius: 3px;
        font-size: 0.9em;
    }

    .markdown-content pre {
        background-color: #343a40;
        padding: 1em;
        border-radius: 5px;
        overflow-x: auto;
    }

    .markdown-content pre code {
        background-color: transparent;
        padding: 0;
    }

    .btn-xs {
        padding: 0.1rem 0.3rem;
        font-size: 0.75rem;
        border-radius: 0.2rem;
    }

    .form-check-input.bg-dark {
        background-color: #343a40;
        border-color: #6c757d;
    }
    .form-check-input:checked.bg-dark {
        background-color: #28a745; /* success */
        border-color: #28a745;
    }
</style>
