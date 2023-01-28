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
        ])
    ) as Record<keyof E, true>;
}

const literalsCache: WeakMap<EnumType, Record<string, true>> = new WeakMap();

export function parseEnum<E extends EnumType>(
    value: string,
    enumType: E,
    enumName: string = "enum"
): E[keyof E] {
    if (!literalsCache.has(enumType)) {
        literalsCache.set(enumType, enumMembers(enumType));
    }
    const validLiterals = literalsCache.get(enumType)!;
    if (!validLiterals[value]) {
        throw new Error(
            `invalid ${enumName} value, got '${value}' expected one of ${Object.keys(
                validLiterals
            )
                .map((v) => `'${v}'`)
                .join(", ")}`
        );
    }
    return value as E[keyof E];
}

const warnedMsgs: Set<string> = new Set();

export function warnOnce(msg: string): void {
    if (warnedMsgs.has(msg)) {
        return;
    }
    warnedMsgs.add(msg);
    console.warn(msg);
}
