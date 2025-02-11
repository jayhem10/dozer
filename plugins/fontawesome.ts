import { library, config } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

import {
  faPlus,
  faPowerOff,
  faKey,
  faEdit,
  faTrash,
  faCheckCircle,
  faCircle,
  faBan,
  faClipboardList,
  faChartBar,
  faUserSecret,
  faShieldAlt,
  faBolt,
  faBullhorn,
  faArrowLeft,
  faArrowsAltH,
  faSignOutAlt,
  faCogs,
  faTimes,
  faFileExport,
  faUsers,
  faExclamationCircle,
  faPaperPlane,
  faClipboard,
} from "@fortawesome/free-solid-svg-icons";

library.add(
  faPlus,
  faPowerOff,
  faKey,
  faEdit,
  faTrash,
  faCheckCircle,
  faCircle,
  faArrowLeft,
  faBan,
  faClipboardList,
  faChartBar,
  faArrowLeft,
  faArrowsAltH,
  faSignOutAlt,
  faCogs,
  faTimes,
  faFileExport,
  faUsers,
  faExclamationCircle,
  faPaperPlane,
  faClipboard,
  faClipboardList,
  faChartBar,
  faUserSecret,
  faShieldAlt,
  faBolt,
  faBullhorn
);

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component("font-awesome-icon", FontAwesomeIcon);
});
