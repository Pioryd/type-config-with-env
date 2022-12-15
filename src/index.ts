import * as dotenv from "dotenv";
import flatten from "flat";
import _ from "lodash";

// see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config();

interface Options {
  preText?: string;
  delimiter?: string;
}

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
export function createConfig<T extends {}>(
  initialData: T,
  options: Options = {},
) {
  const mergedOptions: Options = _.merge(DEFAULT_OPTIONS, options);

  const config: T = _.cloneDeep(initialData);

  const flattenConfig: Record<string, unknown> = flatten(config, {
    delimiter: mergedOptions.delimiter,
  });

  const possibleEnv: string[] = Object.keys(flattenConfig).map(
    configFlatKey => mergedOptions.preText + configFlatKey,
  );

  const foundEnv: string[] = Object.keys(process.env).filter(envKey =>
    possibleEnv.includes(envKey),
  );

  const flattenNewObjectOfEnv: any = {};
  for (const env of foundEnv) {
    const key = env.replace(mergedOptions?.preText || "", "");
    const value = process.env[env];

    if (!value) continue;

    if (typeof flattenConfig[key] === "number") {
      flattenNewObjectOfEnv[key] = Number(value);
    } else if (typeof flattenConfig[key] === "boolean") {
      flattenNewObjectOfEnv[key] =
        value.toLowerCase() === "true" ? true : false;
    } else {
      flattenNewObjectOfEnv[key] = value;
    }
  }
  const unflattenNewObjectOfEnv: T = flatten.unflatten(flattenNewObjectOfEnv, {
    delimiter: "_",
  });

  const mergedConfig = _.merge(config, unflattenNewObjectOfEnv);

  return mergedConfig;
}
