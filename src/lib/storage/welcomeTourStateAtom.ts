import { atomWithStorage } from 'jotai/utils';
export enum WelcomeIntroState {
    TOUR_STATE_GREETING_SEEN = 'greeting_seen',
    TOUR_STATE_INTRO_SEEN = 'intro_seen',
}

export default atomWithStorage<WelcomeIntroState | null>(
    'welcome_intro_state',
    null,
);
