import type { NavigatorScreenParams } from '@react-navigation/native';

import type { GameId } from '../features/games';

export type GamesStackParamList = {
  GamesHub: undefined;
  GameLobby: { gameId: GameId };
  GameJoin: { code: string };
};

export type TabParamList = {
  Home: undefined;
  Discover: undefined;
  Games: NavigatorScreenParams<GamesStackParamList> | undefined;
  Notifications: undefined;
  Profile: undefined;
};

export type CreateEventStackParamList = {
  Basics: undefined;
  WhenWhere: undefined;
  ChooseTheme: undefined;
  Preview: undefined;
};

export type AppStackParamList = {
  MainTabs: NavigatorScreenParams<TabParamList>;
  CreateEvent: { draftId?: string } | undefined;
  EventDetails: { eventId: string };
  GuestList: { eventId: string };
  ShareInvite: { eventId: string };
  EditProfile: undefined;
  LanguageSettings: undefined;
  NotificationSettings: undefined;
  Appearance: undefined;
  MyDrafts: undefined;
  SavedThemes: undefined;
  HelpSupport: undefined;
};

export type AuthStackParamList = {
  Welcome: undefined;
};

export type RootStackParamList = AppStackParamList & AuthStackParamList;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
