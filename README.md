# @pioryd/type-config-with-env

![main branch - test and build](https://github.com/Pioryd/type-config-with-env/actions/workflows/test.yml/badge.svg?branch=main)

## Installation

```sh
npm install @pioryd/type-config-with-env
```

## Introduction

Typed nested config that can be overwritten by environment variables.

## Example usage

### Config files

userConfig.ts

```ts
export userConfig: UserConfig {
  email: "email@email.email",
  password: {
    first: "myFirstPassword",
    second: "mySecondPassword"
  }
}
```

.env (override userConfig.ts)

- [conf_] - prefix

- [password_second] - flatten userConfig key

```env
conf_password_second=changedSecondPassword
```

.gitignore

```text
.env
userConfig.ts
```

### Sources files

src/types.ts

```ts
export interface UserConfig {
  email: number;
  password: string;
}

export interface FullConfig extends UserConfig {
  url: string;
}
```

src/config.ts

```ts
import { userConfig } from "../userConfig";

export interface UserConfig {
  email: number;
  password: string;
}

export interface FullConfig extends UserConfig {
  url: string;
}

export const config = createConfig<FullConfig>(
  {
    ...userConfig,
    url: `localhost?email=${userConfig.email}&pass=${userConfig.password.second}`,
  },
  { preText: "conf_", delimiter: "_" },
);
```

### Usage in project

src/main.ts

```ts
import { config } from "./lib/config";

config.email; // email@email.email - form userConfig.ts
config.password.first; // myFirstPassword - form userConfig.ts

config.url; // localhost?email=email@email.email&pass=changedSecondPassword

// overridden
config.password.second; // changedSecondPassword - from .env
```

## !!! Important

You must load environment variables on Your own.
