import { Auth0Provider } from "@auth0/auth0-react";
import React from "react";
import { createRoot } from "react-dom/client";

import App from "./App";

import dayjs from "dayjs";
import "./i18n";

import WeekDay from "dayjs/plugin/weekday";
import LocaleData from "dayjs/plugin/localeData";
import LocalizedFormat from "dayjs/plugin/localizedFormat";

dayjs.extend(WeekDay);
dayjs.extend(LocaleData);
dayjs.extend(LocalizedFormat);

const container = document.getElementById("root") as HTMLElement;
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <Auth0Provider
      domain="dev-1tijyyk2wrrjkist.us.auth0.com"
      clientId="5qXwrrusG1uDvSfMKiQTUIjf3ccEoQaL"
      authorizationParams={{ redirect_uri: window.location.origin }}
    >
      <App />
    </Auth0Provider>
  </React.StrictMode>
);
