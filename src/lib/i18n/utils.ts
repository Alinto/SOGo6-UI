type NestedJson = {
  [key: string]: any;
};

export function transformJson(json: NestedJson): NestedJson {
  const result: NestedJson = {};

  for (const key in json) {
    if (json.hasOwnProperty(key)) {
      const value = json[key];

      if (
        typeof value === "object" &&
        value !== null &&
        !Array.isArray(value)
      ) {
        if (value.hasOwnProperty("string")) {
          result[key] = value.string;
        } else {
          result[key] = transformJson(value);
        }
      } else {
        result[key] = value;
      }
    }
  }

  return result;
}
