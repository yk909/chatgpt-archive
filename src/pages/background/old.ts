// function saveConversationDetail(conversationId, conversationDetail) {
//   // chrome.storage.local.set({ [conversationId]: conversationDetail });
//   db.conversations
//     .update(conversationId, {
//       detail: conversationDetail,
//     })
//     .then(() => {
//       console.log("saved conversation " + conversationId + " to dexie");
//     });
// }

// async function handleStartFetchingConversations(tabId, force = false) {
//   const session = await getSession();
//   if (!session) {
//     return null;
//   }
//   console.log("session", session);
//   initDB(session.user.id);

//   console.log("start fetching conversations", tabId);
//   let data;
//   if (!force) {
//     data = await db.conversations.orderBy("update_time").reverse().toArray();
//     console.log("get conversation list from storage", data);
//     if (!data || data.length === 0) {
//       data = await fetchAllConversations(session.accessToken);
//       await saveConversationList(data);
//     }
//   } else {
//     data = await fetchAllConversations(session.accessToken);
//     await saveConversationList(data);
//   }

//   chrome.tabs.sendMessage(tabId, {
//     type: MESSAGE_ACTIONS.FINISH_FETCHING_CONVERSATIONS,
//     data,
//   });
// }

// async function handleStartFetchingAllConversationDetails(tabId) {
//   const session = await getSession();
//   if (!session) {
//     return null;
//   }

//   const con_list = await db.conversations
//     .orderBy("update_time")
//     .reverse()
//     .limit(15)
//     .toArray();
//   let i = 0;
//   function handleUpdateProgress() {
//     i = i + 1;
//     console.log("update progress", i);
//     // chrome.tabs.sendMessage(tabId, {
//     //   type: MESSAGE_ACTIONS.UPDATE_FETCHING_CONVERSATION_DETAIL,
//     //   progress: i,
//     //   total: con_list.length,
//     // });
//   }
//   console.log("start fetching all conversation details");

//   const promises = con_list.map((c) => {
//     return async () => {
//       handleUpdateProgress();
//       const d = await fetch_conversation_detail(c.id, session.accessToken);
//       console.log("fetched conversation detail", d);
//       saveConversationDetail(c.id, d);
//       return d;
//     };
//   });
//   const conversationDetailList = await batchPromises(promises);

//   // const conversationDetail = await fetchAllConversationsWithDetail(
//   //   con_list,
//   //   session.accessToken,
//   //   handleUpdateProgress
//   // );
//   chrome.tabs.sendMessage(tabId, {
//     type: MESSAGE_ACTIONS.FINISH_FETCHING_CONVERSATION_DETAIL,
//     data: conversationDetailList,
//   });
// }

// chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
//   console.log("background received message ", {
//     type: request.type,
//   });
//   switch (request.type) {
//     case MESSAGE_ACTIONS.INIT: {
//       console.log("Initializing");
//       handleStartFetchingConversations(sender.tab.id);

//       // fetch and send app state
//       chrome.storage.local.get(APP_STATE_KEY, (state) => {
//         state = state || { toggleState: false };
//         console.log("app state", state[APP_STATE_KEY]);
//         chrome.tabs.sendMessage(sender.tab.id, {
//           type: MESSAGE_ACTIONS.FETCHING_APP_STATE,
//           data: state[APP_STATE_KEY],
//         });
//       });
//       break;
//     }

//     case MESSAGE_ACTIONS.SAVE_APP_STATE: {
//       console.log("saving app state", request.data);
//       chrome.storage.local.set({
//         appState: {
//           ...chrome.storage.local.get(APP_STATE_KEY),
//           ...request.data,
//         },
//       });
//       break;
//     }

//     case MESSAGE_ACTIONS.FETCH_FILTERED_CONVERSATIONS: {
//       const reqData: FetchFilteredConversationData = request.data;
//       const { title } = reqData;
//       console.log("fetch filtered conversations", request.data);
//       db.conversations
//         .orderBy("update_time")
//         .reverse()
//         .filter((c) => {
//           const regex = new RegExp(title, "i");
//           return regex.test(c.title);
//         })
//         .toArray()
//         .then((data) => {
//           data = data.map((d) => {
//             return {
//               ...d,
//               title: d.title.replace(
//                 new RegExp(title, "i"),
//                 `<mark class="chatgpt-archive-highlight">${title}</mark>`
//               ),
//             };
//           });
//           console.log("res data", data);
//           chrome.tabs.sendMessage(sender.tab.id, {
//             type: MESSAGE_ACTIONS.FINISH_SEARCHING_CONVERSATIONS,
//             data: data,
//           });
//         });
//       break;
//     }

//     case MESSAGE_ACTIONS.REFRESH: {
//       console.log("refresh");
//       handleStartFetchingConversations(sender.tab.id, true);
//       break;
//     }

//     case MESSAGE_ACTIONS.START_FETCHING_CONVERSATION_DETAIL: {
//       console.log("start fetching conversation detail");
//       handleStartFetchingAllConversationDetails(sender.tab.id);
//       break;
//     }

//     default: {
//       console.log("unknown message type", request.type);
//     }
//   }
// });
