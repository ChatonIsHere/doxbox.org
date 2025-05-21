<script setup>
    import { ref, computed, onMounted, watch } from 'vue';
    import { storeToRefs } from 'pinia';
    import { useJournalStore } from '@/stores/journalStore';
    import { useSessionsStore } from '@/stores/sessionsStore'; // To get campaign names
    import { marked } from 'marked'; // For rendering markdown

    const journalStore = useJournalStore();
    const sessionsStore = useSessionsStore();

    const { selectedCampaignId, arcs, selectedArcId, stages, selectedStageId, steps, selectedStepId, selectedStep, playerCampaigns } = storeToRefs(journalStore);

    const { selectCampaign, addArc, addStage, addStep, updateStep, toggleStepCompletion, updateArc, updateStage } = journalStore;

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

    // --- Edit mode toggle and item editing states ---
    const isEditing = ref(false);
    const editingArcId = ref(null);
    const editingArcName = ref('');
    const editingArcDescription = ref('');

    const editingStageId = ref(null);
    const editingStageName = ref('');

    const editingStepId = ref(null);
    const editingStepName = ref('');
    const editingStepSummary = ref('');
    const editingStepNotes = ref('');
    const editingStepType = ref('');
    // --- End Edit mode toggle and item editing states ---

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

    // --- Editing functions ---
    const startEditingArc = (arc) => {
        editingArcId.value = arc.id;
        editingArcName.value = arc.name;
        editingArcDescription.value = arc.description;
    };

    const saveEditingArc = async (arcId) => {
        if (!editingArcName.value.trim()) return;
        await updateArc(arcId, { name: editingArcName.value, description: editingArcDescription.value });
        cancelEditingArc();
    };

    const cancelEditingArc = () => {
        editingArcId.value = null;
        editingArcName.value = '';
        editingArcDescription.value = '';
    };

    const startEditingStage = (stage) => {
        editingStageId.value = stage.id;
        editingStageName.value = stage.name;
    };

    const saveEditingStage = async (arcId, stageId) => {
        if (!editingStageName.value.trim()) return;
        await updateStage(arcId, stageId, { name: editingStageName.value });
        cancelEditingStage();
    };

    const cancelEditingStage = () => {
        editingStageId.value = null;
        editingStageName.value = '';
    };

    const startEditingStep = (step) => {
        editingStepId.value = step.id;
        editingStepName.value = step.name;
        editingStepSummary.value = step.summary;
        editingStepNotes.value = step.notes;
        editingStepType.value = step.type;
    };

    const saveEditingStep = async (arcId, stageId, stepId) => {
        if (!editingStepName.value.trim()) return;
        await updateStep(arcId, stageId, stepId, {
            name: editingStepName.value,
            summary: editingStepSummary.value,
            notes: editingStepNotes.value,
            type: editingStepType.value,
            completed: editingStepType.value === 'done' ? true : false, // Update completed based on type
        });
        cancelEditingStep();
    };

    const cancelEditingStep = () => {
        editingStepId.value = null;
        editingStepName.value = '';
        editingStepSummary.value = '';
        editingStepNotes.value = '';
        editingStepType.value = '';
    };
    // --- End Editing functions ---

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

    // Watch for selected item changes to cancel editing
    watch([selectedArcId, selectedStageId, selectedStepId], () => {
        cancelEditingArc();
        cancelEditingStage();
        cancelEditingStep();
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
                    <li v-for="arc in arcs" :key="arc.id" class="list-group-item bg-transparent border-0 p-0 mb-2 journal-tree-item arc-item">
                        <div class="d-flex align-items-center">
                            <div @click="selectArc(arc.id)" :class="{ 'active-arc': selectedArcId === arc.id }" class="journal-item p-2 rounded flex-grow-1">
                                <strong class="text-warning">{{ arc.name }}</strong>
                                <p v-if="arc.description" class="text-white-50 small mb-0">{{ arc.description }}</p>
                            </div>
                            <div v-if="isEditing" class="ms-2">
                                <button v-if="editingArcId !== arc.id" class="btn btn-xs btn-secondary" @click.stop="startEditingArc(arc)" title="Edit Arc">...</button>
                                <template v-else>
                                    <button class="btn btn-xs btn-success me-1" @click.stop="saveEditingArc(arc.id)" title="Save">✓</button>
                                    <button class="btn btn-xs btn-danger" @click.stop="cancelEditingArc()" title="Cancel">✗</button>
                                </template>
                            </div>
                        </div>

                        <form v-if="isEditing && editingArcId === arc.id" @submit.prevent="saveEditingArc(arc.id)" class="mb-2 p-2 bg-dark-tle rounded mt-2">
                            <div class="mb-2">
                                <input type="text" v-model="editingArcName" placeholder="Arc Name" class="form-control form-control-sm bg-secondary text-white border-dark" required />
                            </div>
                            <div class="mb-2">
                                <textarea v-model="editingArcDescription" placeholder="Arc Description (short)" class="form-control form-control-sm bg-secondary text-white border-dark" rows="2"></textarea>
                            </div>
                            <button type="submit" class="btn btn-sm btn-primary">Save Changes</button>
                        </form>

                        <div v-if="selectedArcId === arc.id" class="ps-3 pt-1">
                            <div v-if="isEditing" class="d-flex justify-content-between align-items-center my-1">
                                <h6 class="text-info small mb-0 ms-1">Stages</h6>
                                <button class="btn btn-xs btn-info py-0 px-1" @click.stop="showAddStageForm = !showAddStageForm" title="Add New Stage">+</button>
                            </div>

                            <!-- Moved Add Stage form outside the stages loop -->
                            <form v-if="isEditing && showAddStageForm" @submit.prevent="handleAddStage" class="mb-2 p-2 bg-dark-tle rounded ms-1">
                                <div class="mb-1">
                                    <input type="text" v-model="newStageName" placeholder="Stage Name" class="form-control form-control-sm bg-secondary text-white border-dark" required />
                                </div>
                                <button type="submit" class="btn btn-xs btn-primary">Add Stage</button>
                            </form>

                            <ul class="list-group journal-list">
                                <li v-for="stage in stages" :key="stage.id" class="list-group-item bg-transparent border-0 p-0 mb-1 journal-tree-item stage-item">
                                    <div class="d-flex align-items-center">
                                        <div @click.stop="selectStage(stage.id)" :class="{ 'active-stage': selectedStageId === stage.id }" class="journal-item p-2 rounded ms-1 flex-grow-1">
                                            <span class="text-info">{{ stage.name }}</span>
                                        </div>
                                        <div v-if="isEditing" class="ms-2">
                                            <button v-if="editingStageId !== stage.id" class="btn btn-xs btn-secondary" @click.stop="startEditingStage(stage)" title="Edit Stage">...</button>
                                            <template v-else>
                                                <button class="btn btn-xs btn-success me-1" @click.stop="saveEditingStage(arc.id, stage.id)" title="Save">✓</button>
                                                <button class="btn btn-xs btn-danger" @click.stop="cancelEditingStage()" title="Cancel">✗</button>
                                            </template>
                                        </div>
                                    </div>

                                    <form v-if="isEditing && editingStageId === stage.id" @submit.prevent="saveEditingStage(arc.id, stage.id)" class="mb-2 p-2 bg-dark-tle rounded ms-1 mt-2">
                                        <div class="mb-1">
                                            <input type="text" v-model="editingStageName" placeholder="Stage Name" class="form-control form-control-sm bg-secondary text-white border-dark" required />
                                        </div>
                                        <button type="submit" class="btn btn-xs btn-primary">Save Changes</button>
                                    </form>

                                    <div v-if="selectedStageId === stage.id" class="ps-3 pt-1">
                                        <div v-if="isEditing" class="d-flex justify-content-between align-items-center my-1">
                                            <h6 class="text-success small mb-0 ms-2">Steps</h6>
                                            <button class="btn btn-xs btn-success py-0 px-1" @click.stop="showAddStepForm = !showAddStepForm" title="Add New Step">+</button>
                                        </div>

                                        <!-- Moved Add Step form outside the steps loop -->
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
                                            <li v-for="step in steps" :key="step.id" class="list-group-item bg-transparent border-0 p-0 journal-tree-item step-item">
                                                <div class="d-flex align-items-center">
                                                    <div @click.stop="selectStep(step.id)" :class="{ 'active-step': selectedStepId === step.id }" class="journal-item p-2 rounded ms-2 d-flex align-items-center flex-grow-1">
                                                        <div class="step-checkbox-container me-2">
                                                            <span v-if="step.completed" class="big-checkmark">✓</span>
                                                            <span v-else>&nbsp;</span>
                                                            <!-- Placeholder for alignment when not complete -->
                                                        </div>
                                                        <div class="flex-grow-1">
                                                            <span :class="{ 'text-decoration-line-through text-muted': step.completed, 'text-success': step.type !== 'planned' || step.completed }">{{ step.name }}</span>
                                                            <p v-if="step.summary && editingStepId !== step.id" class="text-white-50 small mb-0 mt-1">{{ step.summary }}</p>
                                                        </div>
                                                    </div>
                                                    <div v-if="isEditing" class="ms-2">
                                                        <button v-if="editingStepId !== step.id" class="btn btn-xs btn-secondary" @click.stop="startEditingStep(step)" title="Edit Step">...</button>
                                                        <template v-else>
                                                            <button class="btn btn-xs btn-success me-1" @click.stop="saveEditingStep(arc.id, stage.id, step.id)" title="Save">✓</button>
                                                            <button class="btn btn-xs btn-danger" @click.stop="cancelEditingStep()" title="Cancel">✗</button>
                                                        </template>
                                                    </div>
                                                </div>

                                                <form v-if="isEditing && editingStepId === step.id" @submit.prevent="saveEditingStep(arc.id, stage.id, step.id)" class="mb-2 p-2 bg-dark-tle rounded ms-2 mt-2">
                                                    <div class="mb-1">
                                                        <input type="text" v-model="editingStepName" placeholder="Step Name" class="form-control form-control-sm bg-secondary text-white border-dark" required />
                                                    </div>
                                                    <div class="mb-1">
                                                        <input type="text" v-model="editingStepSummary" placeholder="Step Summary (optional)" class="form-control form-control-sm bg-secondary text-white border-dark" />
                                                    </div>
                                                    <div class="mb-1">
                                                        <textarea v-model="editingStepNotes" placeholder="Full Notes (Markdown supported)" class="form-control form-control-sm bg-secondary text-white border-dark" rows="3"></textarea>
                                                    </div>
                                                    <div class="mb-2">
                                                        <select v-model="editingStepType" class="form-select form-select-sm bg-secondary text-white border-dark">
                                                            <option value="planned">Planned</option>
                                                            <option value="done">Done</option>
                                                        </select>
                                                    </div>
                                                    <button type="submit" class="btn btn-xs btn-primary">Save Changes</button>
                                                </form>

                                                <!-- The following p tag for summary is now handled within the journal-item div above -->
                                                <!-- <p v-if="selectedStepId === step.id && step.summary && editingStepId !== step.id" class="text-white-50 small mb-0 ms-4 ps-2">{{ step.summary }}</p> -->
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

                    <!-- Buttons for toggling completion status -->
                    <div class="mb-3">
                        <button v-if="!selectedStep.completed && !(isEditing && editingStepId === selectedStep.id)" @click="toggleStepCompletion(selectedArcId, selectedStageId, selectedStep.id, true)" class="btn btn-success me-2">Mark Task as Complete</button>
                        <button v-if="selectedStep.completed && isEditing && editingStepId !== selectedStep.id" @click="toggleStepCompletion(selectedArcId, selectedStageId, selectedStep.id, false)" class="btn btn-warning me-2">Mark Task as Incomplete</button>
                    </div>
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
        /* border-right: 1px solid #495057; */ /* Border is removed as requested */
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
        list-style: none; /* Remove default list styling */
    }

    .journal-tree-item {
        position: relative; /* Needed for pseudo-elements */
    }

    /* Structural lines */
    .journal-tree-item::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 1px;
        background-color: #495057; /* Color of the lines */
    }

    .arc-item > .d-flex > .journal-item::before {
        content: '';
        position: absolute;
        left: -15px; /* Adjust to align with parent */
        top: 20px; /* Adjust to align with text */
        width: 15px;
        height: 1px;
        background-color: #495057;
    }

    .stage-item > .d-flex > .journal-item::before {
        content: '';
        position: absolute;
        left: -15px; /* Adjust to align with parent */
        top: 20px; /* Adjust to align with text */
        width: 15px;
        height: 1px;
        background-color: #495057;
    }

    .step-item > .d-flex > .journal-item::before {
        content: '';
        position: absolute;
        left: -15px; /* Adjust to align with parent */
        top: 20px; /* Adjust to align with text */
        width: 15px;
        height: 1px;
        background-color: #495057;
    }

    .journal-item {
        cursor: pointer;
        transition: background-color 0.2s ease-in-out;
        border: 1px solid transparent; /* for hover/active states */
        position: relative; /* Needed for z-index */
        z-index: 1; /* Ensure item is above lines */
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
        /* border-left: 3px solid #007bff; */ /* Removed border */
        outline: 3px solid #007bff; /* Use outline instead of border */
        outline-offset: -3px; /* Draw outline inside the element */
    }

    .active-arc {
        /* border-left-color: #ffc107; */ /* Removed border */
        outline-color: #ffc107; /* Warning color for active arc */
    }
    .active-arc .text-warning {
        color: #ffdd70 !important;
    }

    .active-stage {
        /* border-left-color: #17a2b8; */ /* Removed border */
        outline-color: #17a2b8; /* Info color for active stage */
    }
    .active-stage .text-info {
        color: #4fcedf !important;
    }

    .active-step {
        /* border-left-color: #28a745; */ /* Removed border */
        outline: 3px solid #28a745; /* Success color for active step */
        /* outline-offset: -3px; */ /* Adjusted for potentially better visual, can be removed if not preferred */
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

    .step-checkbox-container {
        width: 20px; /* Fixed width for checkbox/checkmark container */
        min-width: 20px; /* Ensure it doesn't shrink */
        height: 24px; /* Match typical input height for alignment */
        flex-shrink: 0; /* Prevent shrinking */
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.2em; /* Default size for the content (checkmark or space) */
    }

    .big-checkmark {
        font-size: 1.5em; /* Larger size for the checkmark */
        color: #28a745; /* Bootstrap success green */
        font-weight: bold;
        line-height: 1; /* Ensure it aligns well within the container */
    }

    .journal-item .flex-grow-1 {
        /* Container for step name and summary */
        flex-grow: 1;
        overflow: hidden;
    }

    .journal-item .flex-grow-1 span {
        display: block; /* Name on its own line */
    }

    .journal-item .flex-grow-1 p {
        /* Styling for the summary paragraph */
        margin-top: 0.25rem;
        margin-left: 0;
        padding-left: 0;
        line-height: 1.2; /* Adjust line height for small text */
        white-space: normal; /* Allow summary to wrap */
    }
</style>
