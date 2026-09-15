import type React from 'react';
import type { SvgProps } from 'react-native-svg';

import Airplane from './airplane.svg';
import Back from './back.svg';
import Bell from './bell.svg';
import Cake from './cake.svg';
import Calendar from './calendar.svg';
import Check from './check.svg';
import Clock from './clock.svg';
import Close from './close.svg';
import Comment from './comment.svg';
import Copy from './copy.svg';
import Crown from './crown.svg';
import Diamond from './diamond.svg';
import Dinner from './dinner.svg';
import Draft from './draft.svg';
import Edit from './edit.svg';
import Filter from './filter.svg';
import Group from './group.svg';
import Guests from './guests.svg';
import Heart from './heart.svg';
import Help from './help.svg';
import Home from './home.svg';
import Language from './language.svg';
import Link from './link.svg';
import Location from './location.svg';
import Logout from './logout.svg';
import Map from './map.svg';
import More from './more.svg';
import Mosque from './mosque.svg';
import Navigation from './navigation.svg';
import Photos from './photos.svg';
import Plus from './plus.svg';
import PlusCircle from './plus-circle.svg';
import Poll from './poll.svg';
import Profile from './profile.svg';
import Qr from './qr.svg';
import Ring from './ring.svg';
import Search from './search.svg';
import Settings from './settings.svg';
import Share from './share.svg';
import Shield from './shield.svg';
import Sun from './sun.svg';
import UserCheck from './user-check.svg';
import Whatsapp from './whatsapp.svg';

export const iconRegistry = {
  airplane: Airplane,
  back: Back,
  bell: Bell,
  cake: Cake,
  calendar: Calendar,
  check: Check,
  clock: Clock,
  close: Close,
  comment: Comment,
  copy: Copy,
  crown: Crown,
  diamond: Diamond,
  dinner: Dinner,
  draft: Draft,
  edit: Edit,
  filter: Filter,
  group: Group,
  guests: Guests,
  heart: Heart,
  help: Help,
  home: Home,
  language: Language,
  link: Link,
  location: Location,
  logout: Logout,
  map: Map,
  more: More,
  mosque: Mosque,
  navigation: Navigation,
  photos: Photos,
  plus: Plus,
  'plus-circle': PlusCircle,
  poll: Poll,
  profile: Profile,
  qr: Qr,
  ring: Ring,
  search: Search,
  settings: Settings,
  share: Share,
  shield: Shield,
  sun: Sun,
  'user-check': UserCheck,
  whatsapp: Whatsapp,
} satisfies Record<string, React.FC<SvgProps>>;

export type IconName = keyof typeof iconRegistry;
