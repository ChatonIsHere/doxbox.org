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

    const campaignName = computed(() => {
        if (selectedCampaignId.value) {
            const campaign = sessionsStore.campaignFromID(selectedCampaignId.value);
            return campaign ? campaign.name : 'Loading Campaign...';
        }
        return 'No Campaign Selected';
    });

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
    const isEditing = ref(false); // General edit mode flag, might need more granular control
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

    // --- BG3 Journal UI specific states ---
    const hideCompleted = ref(false);
    const expandedArcs = ref({}); // { arcId: true/false }
    const expandedStages = ref({}); // { stageId: true/false }

    const toggleArcExpansion = (arcId) => {
        expandedArcs.value[arcId] = !expandedArcs.value[arcId];
        if (!expandedArcs.value[arcId]) {
            // If collapsing arc, collapse its stages too
            stages.value.forEach((stage) => {
                if (stage.arcId === arcId) {
                    // Assuming stages have arcId, need to adjust if not
                    expandedStages.value[stage.id] = false;
                }
            });
        }
    };

    const toggleStageExpansion = (stageId) => {
        expandedStages.value[stageId] = !expandedStages.value[stageId];
    };

    const filteredSteps = computed(() => {
        if (!selectedStageId.value) return [];
        return steps.value.filter((step) => {
            if (hideCompleted.value && step.completed) {
                return false;
            }
            return true; // Assuming steps are already filtered by selectedStageId by the store or a watcher
        });
    });
    // --- End BG3 Journal UI specific states ---

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
        // Ensure selectedArcId is also available if your addStep requires it directly
        // or can derive it from selectedStageId
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

    const internalSelectArc = (arcId) => {
        journalStore.selectedArcId = arcId;
        journalStore.selectedStageId = null;
        journalStore.selectedStepId = null;
        showAddStageForm.value = false; // Hide forms when selection changes
        showAddStepForm.value = false;
        // Ensure newly selected arc is expanded if not already
        if (!expandedArcs.value[arcId]) {
            expandedArcs.value[arcId] = true;
        }
    };

    const internalSelectStage = (stageId) => {
        journalStore.selectedStageId = stageId;
        journalStore.selectedStepId = null;
        showAddStepForm.value = false;
        // Ensure newly selected stage is expanded if not already
        if (!expandedStages.value[stageId]) {
            expandedStages.value[stageId] = true;
        }
    };

    const internalSelectStep = (stepId) => {
        journalStore.selectedStepId = stepId;
    };

    // --- Editing functions ---
    const startEditingArc = (arc) => {
        editingArcId.value = arc.id;
        editingArcName.value = arc.name;
        editingArcDescription.value = arc.description;
        isEditing.value = true; // Or specific editing flag
    };

    const saveEditingArc = async () => {
        // Removed arcId param, uses editingArcId.value
        if (!editingArcName.value.trim() || !editingArcId.value) return;
        await updateArc(editingArcId.value, { name: editingArcName.value, description: editingArcDescription.value });
        cancelEditingArc();
    };

    const cancelEditingArc = () => {
        editingArcId.value = null;
        editingArcName.value = '';
        editingArcDescription.value = '';
        isEditing.value = false;
    };

    const startEditingStage = (stage) => {
        editingStageId.value = stage.id;
        editingStageName.value = stage.name;
        isEditing.value = true;
    };

    const saveEditingStage = async () => {
        // Removed params, uses editingStageId.value and selectedArcId.value
        if (!editingStageName.value.trim() || !editingStageId.value || !selectedArcId.value) return;
        await updateStage(selectedArcId.value, editingStageId.value, { name: editingStageName.value });
        cancelEditingStage();
    };

    const cancelEditingStage = () => {
        editingStageId.value = null;
        editingStageName.value = '';
        isEditing.value = false;
    };

    const startEditingStep = (step) => {
        editingStepId.value = step.id;
        editingStepName.value = step.name;
        editingStepSummary.value = step.summary;
        editingStepNotes.value = step.notes;
        editingStepType.value = step.type;
        isEditing.value = true;
    };

    const saveEditingStep = async () => {
        // Removed params
        if (!editingStepName.value.trim() || !editingStepId.value || !selectedArcId.value || !selectedStageId.value) return;
        await updateStep(selectedArcId.value, selectedStageId.value, editingStepId.value, {
            name: editingStepName.value,
            summary: editingStepSummary.value,
            notes: editingStepNotes.value,
            type: editingStepType.value,
        });
        cancelEditingStep();
    };

    const cancelEditingStep = () => {
        editingStepId.value = null;
        editingStepName.value = '';
        editingStepSummary.value = '';
        editingStepNotes.value = '';
        editingStepType.value = '';
        isEditing.value = false;
    };
    // --- End Editing functions ---

    // Watch for playerCampaigns to be loaded and select the first one by default
    onMounted(() => {
        if (playerCampaigns.value.length > 0 && !selectedCampaignId.value) {
            selectCampaign(playerCampaigns.value[0].id);
        }
    });

    watch(playerCampaigns, (newCampaigns) => {
        if (newCampaigns.length > 0 && !selectedCampaignId.value) {
            selectCampaign(newCampaigns[0].id);
        } else if (newCampaigns.length === 0) {
            selectCampaign(null); // No campaigns, clear selection
        }
    });

    watch(selectedCampaignId, (newVal, oldVal) => {
        if (newVal) {
            // Reset expansions when campaign changes
            expandedArcs.value = {};
            expandedStages.value = {};
            // Optionally auto-expand first arc or based on some logic
        }
    });

    // Watch for selected item changes to cancel editing (if not handled by specific cancel buttons)
    watch([selectedArcId, selectedStageId, selectedStepId], () => {
        if (isEditing.value && !editingStepId.value && !editingStageId.value && !editingArcId.value) {
            // Basic check
            // More robust logic might be needed if edits are modal
            cancelEditingArc();
            cancelEditingStage();
            cancelEditingStep();
        }
    });

    // Computed properties for stages of a selected arc, and steps of a selected stage
    const stagesForSelectedArc = computed(() => {
        if (!selectedArcId.value) return [];
        return stages.value; // Assuming stages ref is already filtered by selectedArcId by the store
    });

    const stepsForSelectedStage = computed(() => {
        if (!selectedStageId.value) return [];
        let currentSteps = steps.value; // Assuming steps ref is already filtered by selectedStageId by the store

        if (hideCompleted.value) {
            currentSteps = currentSteps.filter((step) => !step.completed);
        }
        return currentSteps;
    });

    // Ensure selected items are visible by expanding their parents
    watch(selectedArcId, (newArcId) => {
        if (newArcId && !expandedArcs.value[newArcId]) {
            expandedArcs.value[newArcId] = true;
        }
    });

    watch(selectedStageId, (newStageId, oldStageId) => {
        if (newStageId) {
            const stage = stages.value.find((s) => s.id === newStageId);
            // This assumes stages have a direct or derivable arcId.
            // If selectedArcId is always correct, we can use that.
            if (selectedArcId.value && !expandedArcs.value[selectedArcId.value]) {
                expandedArcs.value[selectedArcId.value] = true;
            }
            if (!expandedStages.value[newStageId]) {
                expandedStages.value[newStageId] = true;
            }
        }
    });
    watch(selectedStepId, (newStepId) => {
        if (newStepId) {
            const step = steps.value.find((s) => s.id === newStepId);
            // This assumes steps have a direct or derivable stageId and arcId.
            // If selectedStageId and selectedArcId are always correct, we can use those.
            if (selectedStageId.value && !expandedStages.value[selectedStageId.value]) {
                expandedStages.value[selectedStageId.value] = true;
            }
            if (selectedArcId.value && !expandedArcs.value[selectedArcId.value]) {
                expandedArcs.value[selectedArcId.value] = true;
            }
        }
    });
</script>

<template>
    <div class="journal-container container-fluid pt-3">
        <div v-if="selectedCampaignId" class="journal-layout row">
            <!-- Left Pane: Quest Tree -->
            <div class="col-md-4 journal-tree-pane">
                <h4 class="mb-3 p-2 rounded bg-dark-tle">{{ campaignName }} - Quest Journal</h4>

                <div class="form-check mb-2">
                    <input class="form-check-input" type="checkbox" v-model="hideCompleted" id="hideCompletedCheck" />
                    <label class="form-check-label" for="hideCompletedCheck"> Hide Completed </label>
                </div>
                <hr class="border-secondary" />

                <!-- Arcs List -->
                <ul class="journal-list list-unstyled">
                    <li v-for="arc in arcs" :key="arc.id" class="arc-item mb-1">
                        <div @click="internalSelectArc(arc.id)" :class="['journal-tree-item', 'd-flex align-items-center p-1 rounded', { 'active-arc': selectedArcId === arc.id }]">
                            <span @click.stop="toggleArcExpansion(arc.id)" class="expand-toggle me-2">
                                {{ expandedArcs[arc.id] ? '▼' : '►' }}
                            </span>
                            <strong class="flex-grow-1">{{ arc.name }}</strong>
                            <!-- Add Arc edit/delete buttons here if needed -->
                        </div>

                        <!-- Stages List (conditional rendering) -->
                        <ul v-if="expandedArcs[arc.id] && selectedArcId === arc.id" class="journal-list list-unstyled ms-3">
                            <li v-for="stage in stagesForSelectedArc" :key="stage.id" class="stage-item mb-1">
                                <div @click="internalSelectStage(stage.id)" :class="['journal-tree-item', 'd-flex align-items-center p-1 rounded', { 'active-stage': selectedStageId === stage.id }]">
                                    <span @click.stop="toggleStageExpansion(stage.id)" class="expand-toggle me-2">
                                        {{ expandedStages[stage.id] ? '▼' : '►' }}
                                    </span>
                                    <span class="flex-grow-1">{{ stage.name }}</span>
                                    <!-- Add Stage edit/delete buttons here if needed -->
                                </div>

                                <!-- Steps List (conditional rendering) -->
                                <ul v-if="expandedStages[stage.id] && selectedStageId === stage.id" class="journal-list list-unstyled ms-4">
                                    <li v-for="step in stepsForSelectedStage" :key="step.id" class="step-item">
                                        <div @click="internalSelectStep(step.id)" :class="['journal-tree-item', 'd-flex align-items-center p-1 rounded', { 'active-step': selectedStepId === step.id, 'completed-step': step.completed }]">
                                            <input type="checkbox" :checked="step.completed" @change="handleToggleStep(step)" @click.stop class="form-check-input me-2" />
                                            <span class="flex-grow-1" :class="{ 'text-decoration-line-through': step.completed }">{{ step.name }}</span>
                                            <!-- Add Step edit/delete buttons here if needed -->
                                        </div>
                                    </li>
                                </ul>
                                <div v-if="expandedStages[stage.id] && selectedStageId === stage.id && stepsForSelectedStage.length === 0" class="ms-4 text-muted small">No steps in this stage.</div>
                            </li>
                            <li v-if="selectedArcId === arc.id && stagesForSelectedArc.length === 0 && expandedArcs[arc.id]" class="ms-3 text-muted small">No stages in this arc.</li>
                        </ul>
                    </li>
                    <li v-if="arcs.length === 0" class="text-muted small">No story arcs started for this campaign.</li>
                </ul>
                <!-- Add Arc Form Toggle -->
                <button @click="showAddArcForm = !showAddArcForm" class="btn btn-sm btn-secondary mt-3">{{ showAddArcForm ? 'Cancel' : 'Add New Arc' }}</button>
                <form v-if="showAddArcForm" @submit.prevent="handleAddArc" class="mt-2 p-2 border rounded bg-dark-tle">
                    <div class="mb-2">
                        <input type="text" v-model="newArcName" placeholder="Arc Name" class="form-control form-control-sm bg-secondary text-white" />
                    </div>
                    <div class="mb-2">
                        <textarea v-model="newArcDescription" placeholder="Arc Description" class="form-control form-control-sm bg-secondary text-white"></textarea>
                    </div>
                    <button type="submit" class="btn btn-sm btn-primary">Add Arc</button>
                </form>
            </div>

            <!-- Right Pane: Details -->
            <div class="col-md-8 journal-details-pane p-3 bg-dark-tle rounded">
                <div v-if="selectedStep">
                    <h3>{{ selectedStep.name }}</h3>
                    <p v-if="selectedStep.summary" class="text-muted">
                        <em>{{ selectedStep.summary }}</em>
                    </p>
                    <hr class="border-secondary" />
                    <div class="markdown-content" v-html="renderedNotes"></div>
                    <!-- Edit Step Form Toggle -->
                    <button
                        @click="
                            startEditingStep(selectedStep);
                            showAddStepForm = false;
                        "
                        class="btn btn-sm btn-outline-warning mt-3 me-2"
                    >
                        Edit Step
                    </button>
                </div>
                <div v-else-if="selectedStage">
                    <h3>{{ selectedStage.name }}</h3>
                    <p class="text-muted">Stage selected. Select a step to see details or add a new step.</p>
                    <!-- Add Step Form Toggle (Contextual to selected Stage) -->
                    <button
                        @click="
                            showAddStepForm = !showAddStepForm;
                            if (showAddStepForm) {
                                newStepName = '';
                                newStepSummary = '';
                                newStepNotes = '';
                                newStepType = 'planned';
                                startEditingStep({});
                            }
                        "
                        class="btn btn-sm btn-secondary mt-3 me-2"
                    >
                        {{ showAddStepForm ? 'Cancel' : 'Add New Step' }}
                    </button>
                    <button
                        @click="
                            startEditingStage(selectedStage);
                            showAddStageForm = false;
                        "
                        class="btn btn-sm btn-outline-warning mt-3"
                    >
                        Edit Stage
                    </button>
                </div>
                <div v-else-if="selectedArc">
                    <h3>{{ selectedArc.name }}</h3>
                    <p v-if="selectedArc.description">{{ selectedArc.description }}</p>
                    <p v-else class="text-muted">No description for this arc.</p>
                    <p class="text-muted mt-2">Select a stage or step to see more details, or add a new stage to this arc.</p>
                    <!-- Add Stage Form Toggle (Contextual to selected Arc) -->
                    <button
                        @click="
                            showAddStageForm = !showAddStageForm;
                            if (showAddStageForm) newStageName = '';
                        "
                        class="btn btn-sm btn-secondary mt-3 me-2"
                    >
                        {{ showAddStageForm ? 'Cancel' : 'Add New Stage' }}
                    </button>
                    <button
                        @click="
                            startEditingArc(selectedArc);
                            showAddArcForm = false;
                        "
                        class="btn btn-sm btn-outline-warning mt-3"
                    >
                        Edit Arc
                    </button>
                </div>
                <div v-else>
                    <p class="text-muted">Select an item from the journal to see its details.</p>
                </div>

                <!-- Editing Forms -->
                <form v-if="editingArcId" @submit.prevent="saveEditingArc" class="mt-3 p-3 border rounded bg-dark">
                    <h5>Edit Arc</h5>
                    <div class="mb-2"><input v-model="editingArcName" class="form-control form-control-sm bg-secondary text-white" /></div>
                    <div class="mb-2"><textarea v-model="editingArcDescription" class="form-control form-control-sm bg-secondary text-white"></textarea></div>
                    <button type="submit" class="btn btn-sm btn-primary me-2">Save Arc</button>
                    <button type="button" @click="cancelEditingArc" class="btn btn-sm btn-danger">Cancel</button>
                </form>

                <form v-if="editingStageId" @submit.prevent="saveEditingStage" class="mt-3 p-3 border rounded bg-dark">
                    <h5>Edit Stage</h5>
                    <div class="mb-2"><input v-model="editingStageName" class="form-control form-control-sm bg-secondary text-white" /></div>
                    <button type="submit" class="btn btn-sm btn-primary me-2">Save Stage</button>
                    <button type="button" @click="cancelEditingStage" class="btn btn-sm btn-danger">Cancel</button>
                </form>

                <form v-if="editingStepId" @submit.prevent="saveEditingStep" class="mt-3 p-3 border rounded bg-dark">
                    <h5>Edit Step</h5>
                    <div class="mb-2"><input v-model="editingStepName" placeholder="Step Name" class="form-control form-control-sm bg-secondary text-white" /></div>
                    <div class="mb-2"><textarea v-model="editingStepSummary" placeholder="Summary" class="form-control form-control-sm bg-secondary text-white"></textarea></div>
                    <div class="mb-2"><textarea v-model="editingStepNotes" placeholder="Detailed Notes (Markdown)" rows="5" class="form-control form-control-sm bg-secondary text-white"></textarea></div>
                    <div class="mb-2">
                        <select v-model="editingStepType" class="form-select form-select-sm bg-secondary text-white">
                            <option value="planned">Planned</option>
                            <option value="done">Done</option>
                        </select>
                    </div>
                    <button type="submit" class="btn btn-sm btn-primary me-2">Save Step</button>
                    <button type="button" @click="cancelEditingStep" class="btn btn-sm btn-danger">Cancel</button>
                </form>

                <!-- Contextual Add Forms -->
                <form v-if="showAddStageForm && selectedArcId && !editingStageId" @submit.prevent="handleAddStage" class="mt-3 p-3 border rounded bg-dark">
                    <h5>Add New Stage to "{{ selectedArc.name }}"</h5>
                    <div class="mb-2">
                        <input type="text" v-model="newStageName" placeholder="Stage Name" class="form-control form-control-sm bg-secondary text-white" />
                    </div>
                    <button type="submit" class="btn btn-sm btn-primary">Add Stage</button>
                </form>

                <form v-if="showAddStepForm && selectedStageId && !editingStepId" @submit.prevent="handleAddStep" class="mt-3 p-3 border rounded bg-dark">
                    <h5>Add New Step to "{{ selectedStage.name }}"</h5>
                    <div class="mb-2"><input v-model="newStepName" placeholder="Step Name" class="form-control form-control-sm bg-secondary text-white" /></div>
                    <div class="mb-2"><textarea v-model="newStepSummary" placeholder="Summary" class="form-control form-control-sm bg-secondary text-white"></textarea></div>
                    <div class="mb-2"><textarea v-model="newStepNotes" placeholder="Detailed Notes (Markdown)" rows="3" class="form-control form-control-sm bg-secondary text-white"></textarea></div>
                    <div class="mb-2">
                        <select v-model="newStepType" class="form-select form-select-sm bg-secondary text-white">
                            <option value="planned">Planned</option>
                            <option value="done">Done</option>
                        </select>
                    </div>
                    <button type="submit" class="btn btn-sm btn-primary">Add Step</button>
                </form>
            </div>
        </div>
        <div v-else class="text-center p-5">
            <p v-if="playerCampaigns.length > 0">Please select a campaign to view the journal.</p>
            <p v-else>No campaigns available. Create or join a campaign to start using the journal.</p>
            <!-- Optionally, add a link/button to campaign management if applicable -->
        </div>
    </div>
</template>

<style scoped>
    .journal-container {
        background-color: #1a1a1a; /* Dark background for the whole container */
        color: #e0e0e0; /* Light text color */
        min-height: calc(100vh - 56px - 24px); /* Adjust based on navbar and padding */
    }

    .journal-tree-pane {
        background-color: #252525; /* Slightly lighter dark for tree pane */
        padding: 1rem;
        border-right: 1px solid #333;
        height: calc(100vh - 56px - 24px - 3rem); /* Adjust based on parent padding and title */
        overflow-y: auto;
    }

    .journal-details-pane {
        background-color: #1e1e1e; /* Darker for details pane, similar to BG3 */
        padding: 1.5rem;
        height: calc(100vh - 56px - 24px - 3rem); /* Adjust */
        overflow-y: auto;
    }

    .bg-dark-tle {
        /* Using this for titles and form backgrounds for consistency */
        background-color: #171717 !important; /* Even darker, close to BG3 screenshot title bar */
        color: #f0f0f0 !important;
        border: 1px solid #444;
    }
    .bg-dark {
        background-color: #2a2a2a !important;
    }

    .journal-list {
        padding-left: 0;
    }

    .journal-tree-item {
        cursor: pointer;
        transition: background-color 0.2s ease-in-out;
        border: 1px solid transparent; /* for spacing and hover */
    }

    .journal-tree-item:hover {
        background-color: #3a3a3a;
        border-color: #555;
    }
    .expand-toggle {
        font-size: 0.8em;
        width: 20px; /* Ensure consistent width for alignment */
        display: inline-block;
        text-align: center;
        color: #aaa;
    }

    .arc-item > div > strong {
        font-size: 1.1em;
        color: #e0c48f; /* Gold-ish color for arcs */
    }
    .stage-item > div > span {
        color: #b0d0ff; /* Lighter blue for stages */
    }
    .step-item > div > span {
        color: #c0f0c0; /* Lighter green for steps */
    }

    .active-arc {
        background-color: #4a453a !important;
        border-left: 3px solid #e0c48f !important;
    }
    .active-arc .expand-toggle,
    .active-arc strong {
        color: #fff !important;
    }

    .active-stage {
        background-color: #3a4a5a !important;
        border-left: 3px solid #b0d0ff !important;
    }
    .active-stage .expand-toggle,
    .active-stage span {
        color: #fff !important;
    }

    .active-step {
        background-color: #3a5a4a !important;
        border-left: 3px solid #c0f0c0 !important;
    }
    .active-step .expand-toggle,
    .active-step span {
        color: #fff !important;
    }
    .completed-step span {
        text-decoration: line-through;
        color: #888 !important;
    }

    .form-control-sm.bg-secondary::placeholder {
        color: #aaa;
    }
    .form-control-sm.bg-secondary,
    .form-select-sm.bg-secondary {
        background-color: #333 !important;
        color: #e0e0e0 !important;
        border-color: #555;
    }
    .form-check-input {
        background-color: #333;
        border-color: #555;
    }
    .form-check-input:checked {
        background-color: #007bff; /* Bootstrap primary, or a custom color */
        border-color: #007bff;
    }
    .form-check-label {
        color: #ccc;
    }

    /* Markdown content styling to mimic BG3 details */
    .markdown-content h1,
    .markdown-content h2,
    .markdown-content h3,
    .markdown-content h4,
    .markdown-content h5,
    .markdown-content h6 {
        color: #e0c48f; /* Gold-ish titles */
        margin-top: 1.5rem;
        margin-bottom: 0.75rem;
        border-bottom: 1px solid #444;
        padding-bottom: 0.25rem;
    }
    .markdown-content h3 {
        /* For selectedStep.name, if not overridden by specific element */
        color: #f0f0f0;
        border-bottom: none;
        margin-top: 0;
    }

    .markdown-content p {
        color: #c0c0c0;
        line-height: 1.6;
        margin-bottom: 1rem;
    }

    .markdown-content ul,
    .markdown-content ol {
        color: #c0c0c0;
        padding-left: 2rem;
        margin-bottom: 1rem;
    }
    .markdown-content li {
        margin-bottom: 0.5rem;
    }

    .markdown-content blockquote {
        border-left: 3px solid #e0c48f;
        padding-left: 1rem;
        margin-left: 0;
        color: #aaa;
        font-style: italic;
    }

    .markdown-content code {
        background-color: #2b2b2b;
        padding: 0.2em 0.4em;
        border-radius: 3px;
        color: #da70d6; /* A distinct color for inline code */
    }

    .markdown-content pre {
        background-color: #2b2b2b;
        padding: 1rem;
        border-radius: 4px;
        overflow-x: auto;
        border: 1px solid #444;
    }

    .markdown-content pre code {
        background-color: transparent;
        padding: 0;
        color: #9efeff; /* Light cyan for code blocks */
    }

    .btn-xs {
        padding: 0.1rem 0.3rem;
        font-size: 0.75rem;
    }

    /* Ensure buttons fit the dark theme */
    .btn-secondary {
        background-color: #5a5a5a;
        border-color: #4a4a4a;
    }
    .btn-secondary:hover {
        background-color: #6a6a6a;
        border-color: #5a5a5a;
    }
    .btn-primary {
        background-color: #005cbf; /* Darker primary */
    }
    .btn-outline-warning {
        color: #ffc107;
        border-color: #ffc107;
    }
    .btn-outline-warning:hover {
        color: #1a1a1a;
        background-color: #ffc107;
        border-color: #ffc107;
    }
    .text-muted {
        color: #888 !important;
    }
    hr.border-secondary {
        border-top: 1px solid #444;
    }
</style>
