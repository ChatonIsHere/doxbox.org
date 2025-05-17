import { defineStore } from 'pinia';
import { ref, onUnmounted, computed } from 'vue';
import { getDatabase, ref as dbRef, onValue, update, push, query, orderByChild } from 'firebase/database';
import { useAuthStore } from '@/stores/authStore';
import { useToastStore } from '@/stores/toastStore';

export const useSessionsStore = defineStore('sessions', () => {
    const db = getDatabase();
    const authStore = useAuthStore();
    const toastStore = useToastStore();

    const campaigns = ref(null);
    const history = ref(null);
    const upcomingSessions = ref(null);
    const discordUsernames = ref(null);

    const campaignsRef = dbRef(db, `quinn/campaigns/`);
    const unsubscribeCampaigns = onValue(campaignsRef, (snapshot) => {
        campaigns.value = snapshot.val();
    });

    const historyRef = dbRef(db, `sessions/history/`);
    const unsubscribeHistory = onValue(historyRef, (snapshot) => {
        history.value = snapshot.val();
    });

    const upcomingSessionsRef = dbRef(db, `sessions/upcoming/`);
    const unsubscribeUpcomingSessions = onValue(upcomingSessionsRef, (snapshot) => {
        upcomingSessions.value = snapshot.val();
    });

    const usernamesRef = dbRef(db, `quinn/userData/username/`);
    const unsubscribeUsernames = onValue(usernamesRef, (snapshot) => {
        discordUsernames.value = snapshot.val();
    });

    onUnmounted(() => {
        unsubscribeCampaigns();
        unsubscribeHistory();
        unsubscribeUpcomingSessions();
        unsubscribeUsernames();
    });

    const dmsCampaign = computed(() => {
        const { userExtended } = authStore;
        if (campaigns.value !== null && typeof campaigns.value !== 'undefined' && userExtended && typeof userExtended.dmCampaign !== 'undefined') {
            return campaigns.value[userExtended.dmCampaign];
        } else return false;
    });

    const playerCampaigns = computed(() => {
        const { userExtended } = authStore;
        if (typeof campaigns.value !== 'undefined' && campaigns.value !== null && userExtended && typeof userExtended.discordID !== 'undefined') {
            return Object.values(campaigns.value).filter((campaign) => {
                if (campaign.dm == userExtended.discordID) return true;

                if (typeof campaign.players !== 'undefined') {
                    return Object.keys(campaign.players).includes(userExtended.discordID);
                }
            });
        } else return [];
    });

    const allSessions = computed(() => {
        let sessions = Object.values(history.value || {});
        if (upcomingSessions.value !== null) {
            sessions = sessions.concat(Object.values(upcomingSessions.value));
        }
        return sessions;
    });

    const sortedUpcomingSessions = computed(() => {
        const { userExtended } = authStore;
        let modifiedSessionsArray = [];

        if (upcomingSessions.value && campaigns.value && userExtended && userExtended.discordID) {
            Object.entries(upcomingSessions.value).forEach((session) => {
                const campaign = campaigns.value[session[1].campaign];
                if (campaign) {
                    let players = Object.keys(campaign.players || {});
                    players.push(campaign.dm);

                    if (players.includes(userExtended.discordID)) {
                        modifiedSessionsArray.push({
                            id: session[0],
                            campaign: session[1].campaign,
                            date: session[1].date,
                            availability: session[1].availability,
                        });
                    }
                }
            });

            modifiedSessionsArray.sort((a, b) => new Date(a.date) - new Date(b.date));
        }

        return modifiedSessionsArray;
    });

    const campaignFromID = (id) => {
        return campaigns.value ? Object.values(campaigns.value).find((campaign) => campaign.id === id) : undefined;
    };

    const usernameFromDiscordID = (discordID) => {
        return typeof discordUsernames.value !== 'undefined' && discordUsernames.value !== null ? discordUsernames.value[discordID] : discordID;
    };

    const sessionDateString = (session) => {
        let sessionDate = new Date(session.date);
        let campaign = campaignFromID(session.campaign);

        let dateString = new Intl.DateTimeFormat('en-GB', {
            dateStyle: 'full',
            timeZone: 'Europe/London',
        }).format(sessionDate);

        return `${campaign ? campaign.name : 'Unknown Campaign'} on ${dateString}`;
    };

    const colorFromSession = (session) => {
        let campaign = campaignFromID(session.campaign);
        return campaign && campaign.calendar ? campaign.calendar.color : '#000000';
    };

    const getPlayerAvailability = (session) => {
        if (typeof campaigns.value === 'undefined' || campaigns.value === null || typeof session.availability === 'undefined') return false;

        let available = {
                title: 'Available',
                players: [],
            },
            maybeAvailable = {
                title: 'Maybe Available',
                players: [],
            },
            unavailable = {
                title: 'Unavailable',
                players: [],
            },
            noResponse = {
                title: 'No Response',
                players: [],
            };

        const campaign = campaigns.value[session.campaign];
        if (!campaign) return false;

        let players = Object.keys(campaign.players || {});
        players.push(campaign.dm);

        for (let player of players) {
            switch (session.availability[player]) {
                case 'available':
                    available.players.push(player);
                    break;
                case 'maybeAvailable':
                    maybeAvailable.players.push(player);
                    break;
                case 'unavailable':
                    unavailable.players.push(player);
                    break;
                default:
                    noResponse.players.push(player);
                    break;
            }
        }

        let availabilityArray = [];

        if (available.players.length > 0) availabilityArray.push(available);
        if (maybeAvailable.players.length > 0) availabilityArray.push(maybeAvailable);
        if (unavailable.players.length > 0) availabilityArray.push(unavailable);
        if (noResponse.players.length > 0) availabilityArray.push(noResponse);

        return availabilityArray;
    };

    const updateAvailability = async (sessionID, sessionavailabilityType) => {
        const { userExtended } = authStore;
        if (userExtended && userExtended.discordID) {
            try {
                await update(dbRef(db, `sessions/upcoming/${sessionID}/availability/`), {
                    [userExtended.discordID]: sessionavailabilityType,
                });
                toastStore.addToast({ message: 'Availability updated successfully!', backgroundClass: 'bg-success' });
            } catch (error) {
                console.error('Error updating availability:', error);
                toastStore.addToast({ message: 'Failed to update availability.', backgroundClass: 'bg-danger' });
            }
        } else {
            console.warn('User data not loaded. Cannot update availability.');
            toastStore.addToast({ message: 'User data not loaded. Cannot update availability.', backgroundClass: 'bg-danger' });
        }
    };

    const cancelSession = async (sessionID) => {
        if (sessionID !== '') {
            try {
                await update(dbRef(db, `sessions/upcoming/`), { [sessionID]: null });
                toastStore.addToast({ message: 'Session cancelled successfully!', backgroundClass: 'bg-success' });
            } catch (error) {
                console.error('Error cancelling session:', error);
                toastStore.addToast({ message: 'Failed to cancel session.', backgroundClass: 'bg-danger' });
            }
        } else {
            toastStore.addToast({ message: 'Invalid session ID.', backgroundClass: 'bg-danger' });
        }
    };

    const formatDate = (date) => {
        let targetDate = new Date(date);
        return `${targetDate.getFullYear()}-${targetDate.getMonth() + 1}-${targetDate.getDate()}`;
    };

    const scheduleNewSession = async (campaignId, date, userId) => {
        const existingSession = allSessions.value.find((session) => session.date === formatDate(date));

        if (existingSession) {
            console.warn(`There is already a session scheduled for ${formatDate(date)}`);
            toastStore.addToast({ message: `There is already a session scheduled for ${formatDate(date)}`, backgroundClass: 'bg-warning' });
            return false;
        }

        if (userId) {
            try {
                await push(upcomingSessionsRef, {
                    campaign: campaignId,
                    date: formatDate(date),
                    availability: {
                        [userId]: 'available',
                    },
                });
                toastStore.addToast({ message: 'Session scheduled successfully!', backgroundClass: 'bg-success' });
                return true;
            } catch (error) {
                console.error('Error scheduling new session:', error);
                toastStore.addToast({ message: 'Failed to schedule new session.', backgroundClass: 'bg-danger' });
                return false;
            }
        } else {
            console.warn('User ID not available. Cannot schedule session.');
            toastStore.addToast({ message: 'User data not loaded. Cannot schedule session.', backgroundClass: 'bg-danger' });
            return false;
        }
    };

    const updateSessionDay = async (campaignId, dayIndex) => {
        try {
            await update(dbRef(db, `quinn/campaigns/${campaignId}/`), { sessionDay: dayIndex });
            toastStore.addToast({ message: 'Session day updated successfully!', backgroundClass: 'bg-success' });
        } catch (error) {
            console.error('Error updating session day:', error);
            toastStore.addToast({ message: 'Failed to update session day.', backgroundClass: 'bg-danger' });
        }
    };

    const resetSessionDay = async (campaignId) => {
        try {
            await update(dbRef(db, `quinn/campaigns/${campaignId}/`), { sessionDay: null });
            toastStore.addToast({ message: 'Session day reset successfully!', backgroundClass: 'bg-success' });
        } catch (error) {
            console.error('Error resetting session day:', error);
            toastStore.addToast({ message: 'Failed to reset session day.', backgroundClass: 'bg-danger' });
        }
    };

    return {
        campaigns,
        history,
        upcomingSessions,
        discordUsernames,

        dmsCampaign,
        playerCampaigns,
        allSessions,
        sortedUpcomingSessions,

        campaignFromID,
        usernameFromDiscordID,
        sessionDateString,
        colorFromSession,
        getPlayerAvailability,
        updateAvailability,
        cancelSession,
        formatDate,
        scheduleNewSession,
        updateSessionDay,
        resetSessionDay,
    };
});
