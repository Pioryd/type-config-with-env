import { createConfig } from ".";
import dotenv from "dotenv";
import _ from "lodash";

dotenv.config({ path: "./src/.env.test" });

const data = {
  key1: {
    keyA: "valueI",
  },
  key2: {
    keyB: "valueII",
  },
  key3: { a: { b: { c: 2 } } },
  key4: { d: true },
};

describe("Circle class", () => {
  it("Config - env override", () => {
    const dataAfterOverride = _.cloneDeep(data);

    dataAfterOverride.key1.keyA = "test";
    dataAfterOverride.key3.a.b.c = 7;
    dataAfterOverride.key4.d = false;

    expect(process.env.val_key1_keyA).toStrictEqual(
      dataAfterOverride.key1.keyA,
    );
    expect(Number(process.env.val_key3_a_b_c)).toStrictEqual(
      dataAfterOverride.key3.a.b.c,
    );
    expect(process.env.val_key4_d).toStrictEqual(
      String(dataAfterOverride.key4.d),
    );

    const config = createConfig(data, { preText: "val_" });

    expect(config).toStrictEqual(dataAfterOverride);
  });
});
