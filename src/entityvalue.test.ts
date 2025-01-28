import { expect, it } from "@jest/globals";
import { parseEntityValue, StateClass } from "./entityvalue";
import { getExampleEntityValues_3_7 } from "./test/examples";

it("should parse entity values v3.7", async () => {
    expect(await getExampleEntityValues_3_7()).toMatchSnapshot();
});

it("detects counters", async () => {
    expect(
        // Heuristic based on max value
        parseEntityValue({
            name: "nrg",
            fullname: "dhw energy",
            circuit: "dhw",
            value: 0.47,
            type: "number",
            min: 0,
            max: 10000000,
            uom: "kWh",
            readable: true,
            writeable: true,
            visible: true,
        }),
    ).toHaveProperty("entity.counter", true);
    expect(
        // No state_class, neither max
        parseEntityValue({
            name: "nrg",
            fullname: "dhw energy",
            circuit: "dhw",
            value: 0.47,
            type: "number",
            uom: "kWh",
            readable: true,
            writeable: true,
            visible: true,
        }),
    ).toHaveProperty("entity.counter", false);
    expect(
        // Explicit state_class
        parseEntityValue({
            name: "nrg",
            fullname: "dhw energy",
            circuit: "dhw",
            value: 0.47,
            type: "number",
            state_class: StateClass.TotalIncreasing,
            uom: "kWh",
            readable: true,
            writeable: true,
            visible: true,
        }),
    ).toHaveProperty("entity.counter", true);
    expect(
        // Explicit state_class and max (but ignored)
        parseEntityValue({
            name: "nrg",
            fullname: "dhw energy",
            circuit: "dhw",
            value: 0.47,
            type: "number",
            state_class: StateClass.TotalIncreasing,
            min: 0,
            max: 10000000,
            uom: "kWh",
            readable: true,
            writeable: true,
            visible: true,
        }),
    ).toHaveProperty("entity.counter", true);
    expect(
        // Explicit state_class, but not TotalIncreasing
        parseEntityValue({
            name: "nrg",
            fullname: "dhw energy",
            circuit: "dhw",
            value: 0.47,
            type: "number",
            min: 0,
            max: 10000000,
            state_class: StateClass.Measurement,
            uom: "kWh",
            readable: true,
            writeable: true,
            visible: true,
        }),
    ).toHaveProperty("entity.counter", false);
});
