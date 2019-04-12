/* eslint-disable import/no-extraneous-dependencies */
import Vue from 'vue';

import { MglMap, MglGeolocateControl, MglNavigationControl, MglPopup } from 'vue-mapbox';
import Mapbox from 'mapbox-gl';

Vue.component('MglMap', MglMap);
Vue.component('MglGeolocateControl', MglGeolocateControl);
Vue.component('navigationControl', MglNavigationControl);
Vue.component('popup', MglPopup);

Vue.prototype.$mapbox = Mapbox;
