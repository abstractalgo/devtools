import { MockedResponse } from "@apollo/client/testing";
import { GET_USER_SETTINGS } from "ui/graphql/settings";
import { UserSettings } from "ui/types";
import { cloneResponse } from "./utils";

export function createUserSettingsMock(): MockedResponse[] {
  const settings: UserSettings = {
    apiKeys: [],
    defaultWorkspaceId: null,
    disableLogRocket: false,
    enableEventLink: false,
    enableNetworkMonitor: false,
    enableGlobalSearch: false,
    enableRepaint: false,
    enableTeams: true,
    showElements: false,
    showReact: false,
  };
  const rv = {
    request: {
      query: GET_USER_SETTINGS,
    },
    result: {
      data: {
        viewer: {
          apiKeys: [],
          settings,
          defaultWorkspace: null,
        },
      },
    },
  };
  return cloneResponse(rv, 10);
}
