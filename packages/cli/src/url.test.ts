import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { validateProbeUrl } from "./url.js";

describe("validateProbeUrl", () => {
  it("allows http and https", () => {
    assert.equal(validateProbeUrl("https://example.com/health").ok, true);
    assert.equal(validateProbeUrl("http://127.0.0.1:3000/").ok, true);
  });

  it("rejects file and other schemes", () => {
    const file = validateProbeUrl("file:///etc/passwd");
    assert.equal(file.ok, false);
    if (!file.ok) assert.match(file.reason, /scheme/i);

    const gopher = validateProbeUrl("gopher://example.com/");
    assert.equal(gopher.ok, false);
  });

  it("rejects malformed URLs", () => {
    const bad = validateProbeUrl("not-a-url");
    assert.equal(bad.ok, false);
  });
});
