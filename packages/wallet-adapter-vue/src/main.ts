import type { App } from "vue";
import WalletItem from "./components/WalletItem.vue";
import WalletConnectButton from "./components/base/WalletConnectButton.vue";
import WalletIcon from "./components/base/WalletIcon.vue";
import WalletName from "./components/base/WalletName.vue";
import WalletInstallLink from "./components/base/WalletInstallLink.vue";
import CedraLogo from "./components/icons/CedraLogo.vue";
import CedraPrivacyPolicy from "./components/pp/CedraPrivacyPolicy.vue";
import Disclaimer from "./components/pp/Disclaimer.vue";
import Link from "./components/pp/Link.vue";
import PoweredBy from "./components/pp/PoweredBy.vue";

export default {
  install: (app: App) => {
    app.component("WalletItem", WalletItem);
    app.component("WalletConnectButton", WalletConnectButton);
    app.component("WalletIcon", WalletIcon);
    app.component("WalletName", WalletName);
    app.component("WalletInstallLink", WalletInstallLink);
    app.component("CedraLogo", CedraLogo);
    app.component("CedraPrivacyPolicy", CedraPrivacyPolicy);
    app.component("Disclaimer", Disclaimer);
    app.component("Link", Link);
    app.component("PoweredBy", PoweredBy);
  },
};

export {
  WalletItem,
  WalletConnectButton,
  WalletIcon,
  WalletName,
  WalletInstallLink,
  CedraLogo,
  CedraPrivacyPolicy,
  Disclaimer,
  Link,
  PoweredBy,
};
