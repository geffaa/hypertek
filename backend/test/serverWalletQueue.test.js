import { withServerWallet } from "../Service/blockchain.js";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

describe("withServerWallet", () => {
  test("runs callbacks one at a time, in the order they were queued", async () => {
    const log = [];
    const job = (name, ms) => withServerWallet(async () => {
      log.push(`${name} start`);
      await sleep(ms);
      log.push(`${name} end`);
      return name;
    });

    const results = await Promise.all([job("a", 30), job("b", 5), job("c", 1)]);

    expect(results).toEqual(["a", "b", "c"]);
    expect(log).toEqual(["a start", "a end", "b start", "b end", "c start", "c end"]);
  });

  test("a failing callback rejects its caller without blocking the next one", async () => {
    const failed = withServerWallet(async () => { throw new Error("nonce too low"); });
    const next = withServerWallet(async () => "ok");

    await expect(failed).rejects.toThrow("nonce too low");
    await expect(next).resolves.toBe("ok");
  });
});
