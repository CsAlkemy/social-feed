import type { FriendStatus } from "../enum/friend-status";
import type { User } from "./user";

export interface Member extends User {
  friendStatus: FriendStatus;
}
