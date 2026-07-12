import type { ReactionType } from "../enum/reaction-type";
import type { User } from "./user";

export interface Reactor {
  user: User;
  type: ReactionType;
}
