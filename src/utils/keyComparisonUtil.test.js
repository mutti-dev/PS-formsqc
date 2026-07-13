import { compareFormKeys } from "./keyComparisonUtil";

describe("compareFormKeys", () => {
  it("detects radio option label changes", () => {
    const sandboxForm = {
      components: [
        {
          key: "status",
          type: "radio",
          label: "Status",
          values: [
            { label: "Yes", value: "yes" },
            { label: "No", value: "no" },
          ],
        },
      ],
    };

    const productionForm = {
      components: [
        {
          key: "status",
          type: "radio",
          label: "Status",
          values: [
            { label: "Yup", value: "yes" },
            { label: "No", value: "no" },
          ],
        },
      ],
    };

    const result = compareFormKeys(sandboxForm, productionForm);

    expect(result.changedKeys).toHaveLength(1);
    expect(result.changedKeys[0].optionDiff).toEqual(
      expect.objectContaining({
        changedOptions: [
          expect.objectContaining({
            value: "yes",
            oldLabel: "Yup",
            newLabel: "Yes",
          }),
        ],
      })
    );
  });
});
