// Unit tests for the validation rules inside submitSelfDeclaredKYC
// (Controllers/KYCController.js). Pure logic — mirrors the exact checks the
// controller runs, since this codebase's test suite doesn't use a DB-mocking
// harness (see test/hb.test.js for the same pattern: extract the logic, test
// it directly, rather than pull in supertest/mongodb-memory-server for one
// endpoint).

function validateSelfDeclaredKyc({ fullName, dateOfBirth, country, walletAddress }) {
  if (!fullName || !String(fullName).trim()) {
    return { valid: false, error: "fullName is required" };
  }
  if (!dateOfBirth) {
    return { valid: false, error: "dateOfBirth is required" };
  }
  if (!country || !/^[A-Za-z]{2}$/.test(String(country).trim())) {
    return { valid: false, error: "country must be an ISO-3166 alpha-2 code" };
  }
  if (!walletAddress) {
    return { valid: false, error: "walletAddress is required" };
  }
  const dob = new Date(dateOfBirth);
  if (Number.isNaN(dob.getTime())) {
    return { valid: false, error: "dateOfBirth is not a valid date" };
  }
  const ageYears = (Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
  if (ageYears < 18) {
    return { valid: false, error: "Must be 18 or older" };
  }
  return { valid: true };
}

function ownsWallet(walletAddress, user) {
  const addressLc = String(walletAddress).toLowerCase();
  return (
    user.WalletAddress === addressLc ||
    user.MetaMaskAddress === addressLc ||
    (user.LinkedWallets || []).some((w) => w.address === addressLc)
  );
}

function yearsAgo(n) {
  const d = new Date();
  d.setFullYear(d.getFullYear() - n);
  return d;
}

describe("self-declared KYC — field validation", () => {
  const valid = { fullName: "Jane Doe", dateOfBirth: yearsAgo(30), country: "US", walletAddress: "0xabc" };

  it("accepts a fully valid submission", () => {
    expect(validateSelfDeclaredKyc(valid)).toEqual({ valid: true });
  });

  it("rejects a missing or blank fullName", () => {
    expect(validateSelfDeclaredKyc({ ...valid, fullName: "" }).valid).toBe(false);
    expect(validateSelfDeclaredKyc({ ...valid, fullName: "   " }).valid).toBe(false);
    expect(validateSelfDeclaredKyc({ ...valid, fullName: undefined }).valid).toBe(false);
  });

  it("rejects a missing dateOfBirth", () => {
    expect(validateSelfDeclaredKyc({ ...valid, dateOfBirth: undefined }).valid).toBe(false);
  });

  it("rejects an unparseable dateOfBirth", () => {
    expect(validateSelfDeclaredKyc({ ...valid, dateOfBirth: "not-a-date" }).valid).toBe(false);
  });

  it("rejects a country that isn't a 2-letter code", () => {
    for (const bad of ["USA", "U", "", "12", null, undefined]) {
      expect(validateSelfDeclaredKyc({ ...valid, country: bad }).valid).toBe(false);
    }
  });

  it("accepts lowercase country codes (normalized later by the controller)", () => {
    expect(validateSelfDeclaredKyc({ ...valid, country: "us" }).valid).toBe(true);
  });

  it("rejects a missing walletAddress", () => {
    expect(validateSelfDeclaredKyc({ ...valid, walletAddress: "" }).valid).toBe(false);
  });

  describe("age gate", () => {
    it("rejects exactly 17 years old", () => {
      expect(validateSelfDeclaredKyc({ ...valid, dateOfBirth: yearsAgo(17) }).valid).toBe(false);
    });

    it("accepts a birthdate just over 18 calendar years ago", () => {
      // yearsAgo(18) can land a hair under the 365.25-day approximation used by
      // the controller depending on leap years in range — back off by a day so
      // this test asserts the real boundary (comfortably 18+) without flaking.
      const justOver18 = yearsAgo(18);
      justOver18.setDate(justOver18.getDate() - 1);
      expect(validateSelfDeclaredKyc({ ...valid, dateOfBirth: justOver18 }).valid).toBe(true);
    });

    it("rejects someone turning 18 tomorrow", () => {
      const almost18 = yearsAgo(18);
      almost18.setDate(almost18.getDate() + 2); // born 2 days later than exactly-18
      expect(validateSelfDeclaredKyc({ ...valid, dateOfBirth: almost18 }).valid).toBe(false);
    });
  });
});

describe("self-declared KYC — wallet ownership check", () => {
  it("accepts the account's primary WalletAddress", () => {
    const user = { WalletAddress: "0xaaa", MetaMaskAddress: null, LinkedWallets: [] };
    expect(ownsWallet("0xAAA", user)).toBe(true); // case-insensitive
  });

  it("accepts the account's MetaMaskAddress", () => {
    const user = { WalletAddress: null, MetaMaskAddress: "0xbbb", LinkedWallets: [] };
    expect(ownsWallet("0xbbb", user)).toBe(true);
  });

  it("accepts an address in LinkedWallets", () => {
    const user = { WalletAddress: null, MetaMaskAddress: null, LinkedWallets: [{ address: "0xccc" }] };
    expect(ownsWallet("0xccc", user)).toBe(true);
  });

  it("rejects an address the account has no proven link to", () => {
    const user = { WalletAddress: "0xaaa", MetaMaskAddress: "0xbbb", LinkedWallets: [{ address: "0xccc" }] };
    expect(ownsWallet("0xdddddddddddddddddddddddddddddddddddddddd", user)).toBe(false);
  });
});
