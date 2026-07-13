import { parseBulkJsonText } from "./bulkJsonUtils";

test("parse two simple JSON lines", () => {
  const input = '{"title":"Form A","foo":1}\n{"name":"Form B","bar":2}';
  const res = parseBulkJsonText(input);
  expect(res).toHaveLength(2);
  expect(res[0].formName).toBe("Form A");
  expect(res[1].formName).toBe("Form B");
  expect(res[0].error).toBeNull();
});
