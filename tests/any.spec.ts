import { from } from "../src";

describe("LINQ", () => {
    describe("Any", () => {
        it("should be able to return true synchronously", () => {
            expect(from([1]).any(x => x === 1)).toBeTruthy();
        });

        it("should be able to return true asynchronously", async () => {
            expect(await from([1]).asAsync().any(x => x === 1)).toBeTruthy();
        });

        it("should be able to return true asynchronously with an asynchronous condition", async () => {
            expect(await from([1]).asAsync().any(x => Promise.resolve(x === 1))).toBeTruthy();
        });

        it("should be able to return false synchronously", () => {
            expect(from([0]).any(x => x === 1)).toBeFalsy();
        });

        it("should be able to return false asynchronously", async () => {
            expect(await from([0]).asAsync().any(x => x === 1)).toBeFalsy();
        });

        it("should be able to handle empty case", () => {
            expect(from([]).any(_ => true)).toBeFalsy();
        });

        it("should iterate every element before the first occurrence but not iterate any element after it", () => {
            const fetched: number[] = [];
            function *generator() {
                for (let i = 0; i < 10; i++) {
                    fetched.push(i);
                    yield i;
                }
            }
            expect(from(generator()).any(x => x === 5)).toBeTruthy();
            for (let i = 0; i < 10; i++) {
                if (i < 5) {
                    expect(fetched).toContain(i);
                } else if (i > 5) {
                    expect(fetched).not.toContain(i);
                }
            }
        });
    });
});
