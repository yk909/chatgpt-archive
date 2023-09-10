export const CHATGPT_DOMAIN_URL = "https://chat.openai.com";

export const ACCESS_TOKEN_KEY = "accessToken";

export const styles = {
  P_PAGE: "12px",
  COLOR_DARK_1: "rgb(52, 53, 65)",
  COLOR_DARK_2: "rgb(32, 33, 35)",
  COLOR_WHITE_1: "rgb(217, 217, 227)",
  COLOR_CARD_BORDER: "rgba(255,255,255,0.2)",
  BG_CARD_HOVER: "rgba(115,115,115,0.1)",
  PANEL_LINE_HEIGHT: "44px",
};

export const MESSAGE_ACTIONS = {
  INIT: "INIT",
  REFRESH: "REFRESH",

  FETCH_CONVERSATIONS: "FETCH_CONVERSATIONS",
  FETCH_FOLDERS: "FETCH_FOLDERS",

  // bg to content
  APPEND_CONVERSATIONS: "APPEND_CONVERSATIONS",
  APPEND_FOLDERS: "APPEND_FOLDERS",

  // folders creation
  CREATE_NEW_FOLDER: "CREATE_NEW_FOLDER", // content to bg

  // add conversation to folder
  ADD_CONVERSATION_TO_FOLDER: "ADD_CONVERSATION_TO_FOLDER",

  RESPONSE_STATUS: "RESPONSE_STATUS",
  STATUS_SUCCESS: "STATUS_SUCCESS",


  SEARCH: "SEARCH",

  FETCHING_APP_STATE: "FETCHING_APP_STATE",
  SAVE_APP_STATE: "SAVE_APP_STATE",

  UPDATE_FETCHING_CONVERSATIONS: "UPDATE_FETCHING_CONVERSATIONS",
  FINISH_FETCHING_CONVERSATIONS: "FINISH_FETCHING_CONVERSATIONS",
  START_FETCHING_CONVERSATION_DETAIL: "START_FETCHING_CONVERSATION_DETAIL",
  UPDATE_FETCHING_CONVERSATION_DETAIL: "UPDATE_FETCHING_CONVERSATION_DETAIL",
  FINISH_FETCHING_CONVERSATION_DETAIL: "FINISH_FETCHING_CONVERSATION_DETAIL",

  FETCH_FILTERED_CONVERSATIONS: "FETCH_FILTERED_CONVERSATIONS",
  FINISH_SEARCHING_CONVERSATIONS: "FINISH_SEARCHING_CONVERSATIONS",

  TOGGLE_PANEL: "TOGGLE_PANEL",
};

