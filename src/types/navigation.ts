import { Observation } from "./index";

export type RootStackParamList = {
  Home: undefined;
  Detail: { observation: Observation };
  Test: undefined;
  Settings: undefined;
};
