<script setup>
    import { useSessionsStore } from '@/stores/sessionsStore';
    import { storeToRefs } from 'pinia';

    const sessionsStore = useSessionsStore();
    const { sortedUpcomingSessions, dmsCampaign } = storeToRefs(sessionsStore);
</script>

<template>
    <div class="accordion accordion-flush" id="sessionsAccordion">
        <div class="accordion-item" v-for="session in sortedUpcomingSessions">
            <h2 class="accordion-header">
                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" :data-bs-target="`#accordion-${session.date}-${session.campaign}`" aria-expanded="false" :aria-controls="`accordion-${session.date}-${session.campaign}`">{{ sessionsStore.sessionDateString(session) }}</button>
                <div style="width: 100%; height: 2px" v-bind:style="{ backgroundColor: sessionsStore.colorFromSession(session) }"></div>
            </h2>
            <div :id="`accordion-${session.date}-${session.campaign}`" class="accordion-collapse collapse" data-bs-parent="#sessionsAccordion">
                <div class="accordion-body">
                    <div class="container">
                        <div class="row">
                            <div class="col-12 col-md" v-for="availabilityType in sessionsStore.getPlayerAvailability(session) || []">
                                <h5>{{ availabilityType.title }}</h5>
                                <hr class="thin" />
                                <ul class="list-unstyled">
                                    <li v-for="player in availabilityType.players">{{ sessionsStore.usernameFromDiscordID(player) }}</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div class="btn-group m-2" v-if="dmsCampaign ? dmsCampaign.id == session.campaign : false" role="group" aria-label="Basic example">
                        <button type="button" class="btn btn-danger btn-info" v-on:click="sessionsStore.cancelSession(session.id)">Cancel Session</button>
                    </div>
                    <div class="btn-group m-2" v-else role="group" aria-label="Basic example">
                        <button type="button" v-on:click="sessionsStore.updateAvailability(session.id, 'available')" class="btn btn-success">Available</button>
                        <button type="button" v-on:click="sessionsStore.updateAvailability(session.id, 'maybeAvailable')" class="btn btn-warning">Maybe Available</button>
                        <button type="button" v-on:click="sessionsStore.updateAvailability(session.id, 'unavailable')" class="btn btn-danger">Unavailable</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
    hr.thin {
        margin-top: 0.5em;
        margin-bottom: 0.5em;
    }

    .accordion-button {
        background-color: #1e1e1e;
        color: #ffffff;
    }

    .accordion-button:not(.collapsed) {
        background-color: #212529;
        color: #ffffff;
    }

    .accordion-button:hover {
        background-color: #212529;
        color: #ffffff;
    }
</style>
