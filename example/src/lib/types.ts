import { NodeEnvModes } from "@pioryd/type-config-with-env";

export interface UserConfig {
  email: string;
  password: string;
  days: {
    numbers: string;
  };
  // required - more info bellow "Build modes"
  nodeEnv?: NodeEnvModes<UserConfig>;
}

export interface FullConfig extends Omit<UserConfig, "nodeEnv" | "days"> {
  url: string;

  // replacing UserConfig["days"]
  days: {
    numbers: number[];
  };
}
