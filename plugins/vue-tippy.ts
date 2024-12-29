import { defineNuxtPlugin } from "#app";
import VueTippy from "vue-tippy";
import "tippy.js/dist/tippy.css";

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(VueTippy, {
    directive: "tippy",
    component: "Tippy",
    defaultProps: {
      arrow: true,
      placement: "top",
      theme: "light",
    },
  });
});
