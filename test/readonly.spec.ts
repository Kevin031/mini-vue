import { isReadOnly, readonly, reactive, isProxy } from "../src/reactivity";

describe("readonly", () => {
  it("happy path", () => {
    const original = { foo: 1, bar: { baz: 2 } };
    const wrapped = readonly(original);
    expect(wrapped).not.toBe(original);
    expect(wrapped.foo).toBe(1);
    expect(isReadOnly(wrapped.bar)).toBe(true);
    expect(isReadOnly(original)).toBe(false);
  });

  it("warn then call set", () => {
    console.warn = jest.fn();

    const user = readonly({
      age: 10,
    });

    user.age = 10;

    expect(console.warn).toBeCalled();
  });

  it("is proxy", () => {
    const original = { foo: 1, bar: { baz: 2 } };
    const wrapped = readonly(original);
    const active = reactive(original);
    expect(isProxy(original)).toBe(false);
    expect(isProxy(wrapped)).toBe(true);
    expect(isProxy(active)).toBe(true);
  });
});
