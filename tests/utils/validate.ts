export async function validate(action: () => Promise<unknown>, output: unknown): Promise<void> {
    if (output === undefined) {
        await expect(action()).rejects.toThrow();
    } else if (output instanceof Error) {
        await expect(action()).rejects.toThrow(output);
    } else {
        await expect(action()).resolves.toEqual(output);
    }
}

export async function validateWithUndefined(action: () => Promise<unknown>, output: unknown): Promise<void> {
    if (output instanceof Error) {
        await expect(action()).rejects.toThrow(output);
    } else {
        await expect(action()).resolves.toEqual(output);
    }
}

export async function validateSync(action: () => unknown, output: unknown): Promise<void> {
    await validate((): Promise<unknown> => {
        try {
            return Promise.resolve(action());
        } catch (err) {
            return Promise.reject(err);
        }
    }, output);
}

export async function validateSyncWithUndefined(action: () => unknown, output: unknown): Promise<void> {
    await validateWithUndefined((): Promise<unknown> => {
        try {
            return Promise.resolve(action());
        } catch (err) {
            return Promise.reject(err);
        }
    }, output);
}
