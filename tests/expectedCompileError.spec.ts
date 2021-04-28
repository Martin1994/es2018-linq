import * as child_process from "child_process";
import * as fs from "fs";
import * as path from "path";
import * as util from "util";

describe("LINQ", () => {
    describe("TypeScript compilation", () => {
        const sourceFiles = fs.readdirSync(path.join(__dirname, "expectedCompileError"));
        for (const source of sourceFiles.filter(f => f.endsWith(".ts"))) {
            it(`should fail to compile ${source}`, async () => {
                await expect(util.promisify(child_process.exec)(
                    `tsc --noEmit ----skipLibCheck "${path.join(__dirname, "expectedCompileError", source)}"`
                )).rejects.toThrow();
            });
        }
    });
});
