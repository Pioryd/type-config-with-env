import { mergeUserConfigWithEnv } from "@pioryd/type-config-with-env";

import { userConfig } from "../../userConfig";
import { FullConfig } from "./types";

const userConfigWithEnv = mergeUserConfigWithEnv({
  userConfig,
  options: { preText: "conf_", delimiter: "_" },
});

export const config: FullConfig = {
  ...userConfigWithEnv,
  url: `localhost?email=${userConfigWithEnv.email}&pass=${userConfigWithEnv.password}`,
  days: {
    numbers: userConfigWithEnv.days.numbers.split(",").map(Number) || [],
  },
};
