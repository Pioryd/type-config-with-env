import { mergeUserConfigWithEnv, NodeEnvModes } from ".";
import dotenv from "dotenv";
import _ from "lodash";

interface UserConfig {
  key1: {
    keyA: string;
  };
  key2: {
    keyB: string;
  };
  key3: {
    a: {
      b: {
        c: number;
      };
    };
  };
  key4: {
    d: boolean;
  };
  key5: {
    arrA: string;
  };
  key6: {
    arrB: string;
  };
  nodeEnv?: NodeEnvModes<UserConfig>;
}

interface FullConfig
  extends Omit<UserConfig, "nodeEnv" | "key4" | "key5" | "key6"> {
  key5: {
    arrA: number[];
  };
  key6: {
    arrB: string[];
  };
}

const testData: {
  userConfig: UserConfig;
  defaultEnv: NodeJS.ProcessEnv;
} = {
  userConfig: {
    key1: {
      keyA: "valueI",
    },
    key2: {
      keyB: "valueII",
    },
    key3: { a: { b: { c: 2 } } },
    key4: { d: true },
    key5: {
      arrA: "1, 2, 3, 4, 5",
    },
    key6: {
      arrB: "one, two, three",
    },
  },
  defaultEnv: _.cloneDeep(process.env),
};

function resetAndLoadEnv(path: string) {
  process.env = _.cloneDeep(testData.defaultEnv);
  dotenv.config({ path: path, override: true });
}

describe("Test config", () => {
  describe("UserConfig", () => {
    it("env override", () => {
      resetAndLoadEnv("./src/.env");

      /**
       * Test UserConfig with override
       */

      const userConfig = _.cloneDeep(testData.userConfig);

      userConfig.key1.keyA = "test";
      expect(process.env.val_key1_keyA).toStrictEqual(userConfig.key1.keyA);

      userConfig.key3.a.b.c = 7;
      expect(Number(process.env.val_key3_a_b_c)).toStrictEqual(
        userConfig.key3.a.b.c,
      );

      userConfig.key4.d = false;
      expect(process.env.val_key4_d).toStrictEqual(String(userConfig.key4.d));

      userConfig.key5.arrA = "7, 8, 9";
      expect(process.env.val_key5_arrA).toStrictEqual(
        String(userConfig.key5.arrA),
      );

      const userConfigWithEnv = mergeUserConfigWithEnv({
        userConfig,
        options: { preText: "val_" },
      });
      expect(userConfigWithEnv).toStrictEqual(userConfig);
    });

    it("Build modes", () => {
      resetAndLoadEnv("./src/.env.production");

      const userConfig: UserConfig = _.cloneDeep(testData.userConfig);

      userConfig.key1.keyA = "test2";
      expect(process.env.val_key1_keyA).toStrictEqual(userConfig.key1.keyA);

      userConfig.key5.arrA = "12, 13, 14";
      expect(process.env.val_key5_arrA).toStrictEqual(
        String(userConfig.key5.arrA),
      );

      const userConfigWithNodeEnv = {
        ...userConfig,
        nodeEnv: { production: { key3: { a: { b: { c: 2 } } } } },
      };
      const userConfigWithEnv = mergeUserConfigWithEnv({
        userConfig: userConfigWithNodeEnv,
        options: { preText: "val_" },
      });
      expect(userConfigWithEnv).toStrictEqual(
        _.merge(
          userConfigWithNodeEnv,
          userConfigWithNodeEnv.nodeEnv.production,
        ),
      );
    });
  });

  it("FullConfig", () => {
    const userConfig = _.cloneDeep(testData.userConfig);

    const extendedConfig = {
      key5: {
        arrA: userConfig.key5.arrA.split(",").map(Number),
      },
      key6: {
        arrB: userConfig.key6.arrB.split(",").map(v => v.trim()),
      },
    };
    expect(extendedConfig).toStrictEqual({
      key5: {
        arrA: [1, 2, 3, 4, 5],
      },
      key6: {
        arrB: ["one", "two", "three"],
      },
    });

    const fullConfig: FullConfig = {
      ...userConfig,
      ...extendedConfig,
    };
    expect(fullConfig).toStrictEqual({
      ...userConfig,
      ...extendedConfig,
    });
  });
});
