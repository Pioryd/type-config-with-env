import flatten from "flat";
import _ from "lodash";

interface Options {
  preText?: string;
  delimiter?: string;
}

interface Props<T extends { nodeEnv?: NodeEnvModes<T> }> {
  userConfig: T;
  options: Options;
}

type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]>;
};

export type NodeEnvModes<T extends object> =
  | Record<string, Omit<DeepPartial<T>, "nodeEnv">>
  | undefined;

const DEFAULT_OPTIONS: Options = {
  preText: "conf_",
  delimiter: "_",
};

/**
 *
 * @param initialData - default config data
 * @param options
 *   preText - default "conf_"
 *   delimiter - default "_"
 */
export function mergeUserConfigWithEnv<
  T extends { nodeEnv?: NodeEnvModes<T> },
>({ userConfig, options }: Props<T>): T {
  const mergedOptions: Options = _.merge(DEFAULT_OPTIONS, options);

  let clonedUserConfig: T = _.cloneDeep(userConfig);

  const { NODE_ENV } = process.env;

  if (
    NODE_ENV &&
    clonedUserConfig.nodeEnv &&
    clonedUserConfig.nodeEnv[NODE_ENV]
  ) {
    clonedUserConfig = _.merge(
      clonedUserConfig,
      clonedUserConfig.nodeEnv[NODE_ENV],
    );
  }

  const flattenUserConfig: Record<string, unknown> = flatten(clonedUserConfig, {
    delimiter: mergedOptions.delimiter,
  });

  const possibleEnv: string[] = Object.keys(flattenUserConfig).map(
    configFlatKey => mergedOptions.preText + configFlatKey,
  );

  const foundEnv: string[] = Object.keys(process.env).filter(envKey =>
    possibleEnv.includes(envKey),
  );

  const flattenUserConfigOverriddenByEnv: Record<string, unknown> =
    _.cloneDeep(flattenUserConfig);

  for (const env of foundEnv) {
    const key = env.replace(mergedOptions?.preText || "", "");
    const value = process.env[env];

    if (!value) continue;

    switch (typeof flattenUserConfig[key]) {
      case "string":
        flattenUserConfigOverriddenByEnv[key] = value;
        break;
      case "number":
        flattenUserConfigOverriddenByEnv[key] = Number(value);
        break;
      case "boolean":
        flattenUserConfigOverriddenByEnv[key] =
          value.toLowerCase() === "true" ? true : false;
        break;
      default:
        throw new Error(
          "UserConfig support only support types [string, number, boolean]." +
            "\nAny other types create in FullConfig",
        );
    }
  }

  const unflattenUserConfigOverriddenByEnv: T = flatten.unflatten(
    flattenUserConfigOverriddenByEnv,
    { delimiter: mergedOptions.delimiter },
  );

  delete unflattenUserConfigOverriddenByEnv.nodeEnv;

  return unflattenUserConfigOverriddenByEnv;
}
