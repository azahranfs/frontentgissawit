import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './assets/css/global.css';
import * as bootstrap from 'bootstrap'
window.bootstrap = bootstrap
import 'leaflet/dist/leaflet.css';

import L from 'leaflet'
L.TileLayer.GOOGLE = L.TileLayer.extend({
  getTileUrl: function (coords) {
    return L.Util.template(this._url, {
      s: ['mt0', 'mt1', 'mt2', 'mt3'][Math.floor(Math.random() * 4)],
      x: coords.x,
      y: coords.y,
      z: coords.z
    });
  }
});


createApp(App).use(router).mount('#app');