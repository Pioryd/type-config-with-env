# @pioryd/type-config-with-env

![main branch - test and build](https://github.com/Pioryd/type-config-with-env/actions/workflows/test.yml/badge.svg?branch=main)

## Installation

```sh
# npm
npm install @pioryd/type-config-with-env
# yarn
yarn add @pioryd/type-config-with-env
```

## Introduction

Typed nested config that can be overwritten by environment variables.

## !!! Important

You must load environment variables on Your own. For example: [dotenv](https://www.npmjs.com/package/dotenv) or [cross-env](https://www.npmjs.com/package/cross-env)

Note: dotenv must be runned before all other imports

## Example usage

[Source example](https://github.com/Pioryd/type-config-with-env/tree/main/example)

or bellow:

### Config files (.ts or .env)

userConfig.ts

```ts
import { UserConfig } from "./src/lib/types";

export const userConfig: UserConfig = {
  email: "email@email.email",
  password: "myPassword",
  days: {
    numbers: "1, 2, 3, 4", // will be converter to number[]
  },
  nodeEnv: {
    production: {
      password: "productionPassword",
    },
    test: {
      password: "testPassword",
    },
  },
};
```

.env (override userConfig.ts)

- [conf_] - prefix

- [days_numbers] - flatten userConfig key

```env
conf_days_numbers="7, 8, 9"
```

.gitignore

```text
.env
userConfig.ts
```

### Sources files

src/lib/types.ts

```ts
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
```

src/lib/config.ts

```ts
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
```

### Usage in project

Use anywhere in app, for example:

src/index.ts

```ts
// dotenv must be loaded as first
import dotenv from "dotenv";

//
import { config } from "./lib/config";

dotenv.config({ path: ".env", override: true });

console.log(config);

/**
 * OUTPUT:
 * {
 *   // from userConfig.ts
 *   email: 'email@email.email',
 *   // from userConfig.ts - overridden by production
 *   password: 'myPassword',
 *
 *   // from .env parsed inside FullConfig
 *   days: { numbers: [ 7, 8, 9 ] },
 *
 *   //  created in  inside FullConfig
 *   url: 'localhost?email=email@email.email&pass=productionPassword'
 * }
 */
```

## Build modes (development, production, etc.)

userConfig.ts

```ts
import { UserConfig } from "./src/lib/types";

export const userConfig: UserConfig = {
  email: "email@email.email",
  password: "myPassword",
  days: {
    numbers: "1, 2, 3, 4", // will be converter to number[]
  },

  // build modes
  nodeEnv: {
    production: {
      password: "productionPassword",
    },
    test: {
      password: "testPassword",
    },
  },
};
```
