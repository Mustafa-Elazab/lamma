import type { NavigatorScreenParams } from '@react-navigation/native';

export type TabParamList = {
  Home: undefined;
  Discover: undefined;
  Create: undefined;
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
  CreateEvent: NavigatorScreenParams<CreateEventStackParamList> | undefined;
  EventDetails: { eventId: string };
  GuestList: { eventId: string };
  ShareInvite: { eventId: string };
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
