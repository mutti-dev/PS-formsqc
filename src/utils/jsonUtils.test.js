import { removeSubmitButtonsOutsideContainer, extractFormJson } from "./jsonUtils";

describe("removeSubmitButtonsOutsideContainer", () => {
  test("returns components array when no container exists and last component is not submit button", () => {
    const components = [
      { type: "textfield", key: "firstName", label: "First Name" },
      { type: "textfield", key: "lastName", label: "Last Name" }
    ];
    const result = removeSubmitButtonsOutsideContainer(components);
    expect(result).toBeDefined();
    expect(result).toEqual(components);
    expect(result.length).toBe(2);
  });

  test("strips trailing submit button when no container exists", () => {
    const components = [
      { type: "textfield", key: "firstName", label: "First Name" },
      { type: "button", key: "submit", action: "submit", label: "Submit" }
    ];
    const result = removeSubmitButtonsOutsideContainer(components);
    expect(result.length).toBe(1);
    expect(result[0].key).toBe("firstName");
  });

  test("filters submit buttons outside container when container exists", () => {
    const components = [
      { type: "container", key: "Container", components: [] },
      { type: "button", key: "submit", action: "submit", label: "Submit" }
    ];
    const result = removeSubmitButtonsOutsideContainer(components);
    expect(result.length).toBe(1);
    expect(result[0].type).toBe("container");
  });
});
