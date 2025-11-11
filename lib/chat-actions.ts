export type ChatCopyAction = {
  type: "copy";
  label: string;
  value: string;
};

export type ChatLinkAction = {
  type: "link";
  label: string;
  value: string;
  target?: "_blank" | "_self";
};

export type ChatPostAction = {
  type: "post";
  label: string;
  value: string;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  payload?: Record<string, unknown>;
};

export type ChatAction = ChatCopyAction | ChatLinkAction | ChatPostAction;

export interface ChatResponse {
  reply: string;
  actions: ChatAction[];
}
