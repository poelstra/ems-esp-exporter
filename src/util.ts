export type JsonValue =
    | string
    | number
    | boolean
    | null
    | JsonValue[]
    | { [key: string]: JsonValue };

export type EnumType = { [key: string]: string };

function enumMembers<E extends EnumType>(enumType: E): Record<keyof E, true> {
    return Object.fromEntries(
        Array.from(Object.entries(enumType)).map(([name, value]) => [
            value,
            true,
        ]),
    ) as Record<keyof E, true>;
}

const literalsCache: WeakMap<EnumType, Record<string, true>> = new WeakMap();

export function parseEnum<E extends EnumType>(
    value: string,
    enumType: E,
    enumName: string = "enum",
): E[keyof E] {
    if (!literalsCache.has(enumType)) {
        literalsCache.set(enumType, enumMembers(enumType));
    }
    const validLiterals = literalsCache.get(enumType)!;
    if (!validLiterals[value]) {
        throw new Error(
            `invalid ${enumName} value, got '${value}' expected one of ${Object.keys(
                validLiterals,
            )
                .map((v) => `'${v}'`)
                .join(", ")}`,
        );
    }
    return value as E[keyof E];
}

const warnedMsgs: Set<string> = new Set();

let DISABLE_WARNINGS = false;

// Disable warnings (useful in specific tests...)
export function disableWarnings(value: boolean): void {
    DISABLE_WARNINGS = value;
}

export function warnOnce(msg: string): void {
    if (warnedMsgs.has(msg) || DISABLE_WARNINGS) {
        return;
    }
    warnedMsgs.add(msg);
    console.warn(msg);
}

export function runMain(main: () => Promise<void>): void {
    // Catch shutdown signals (e.g. when running as a daemon, in Docker, ...)
    const shutdown = (signal: string): void => {
        console.log(`${signal} received, shutting down...`);
        console.log("Terminating with exit code 0.");
        process.exit(0);
    };
    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));

    main().catch((err) => {
        console.error("FATAL", err);
        process.exit(1);
    });
}
