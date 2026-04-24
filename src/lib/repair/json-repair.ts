import { jsonrepair } from 'jsonrepair';

export interface RepairResult {
  success: boolean;
  repaired_json: any | null;
  normalized_json: string | null;
  errors: string[];
  changes: string[];
}

export function repairJson(inputString: string): RepairResult {
  const result: RepairResult = {
    success: false,
    repaired_json: null,
    normalized_json: null,
    errors: [],
    changes: []
  };

  try {
    // Attempt standard parse first
    const parsed = JSON.parse(inputString);
    result.success = true;
    result.repaired_json = parsed;
    result.normalized_json = JSON.stringify(parsed, null, 2);
    return result;
  } catch (e: any) {
    result.errors.push(`Original JSON parsing failed: ${e.message}`);
  }

  // Attempt repair
  try {
    const repairedText = jsonrepair(inputString);
    const repairedObj = JSON.parse(repairedText);

    result.success = true;
    result.repaired_json = repairedObj;
    result.normalized_json = JSON.stringify(repairedObj, null, 2);

    // Change detection logic
    if (inputString !== repairedText) {
      if (inputString.match(/,\s*[\]}]/)) {
        result.changes.push("Removed trailing comma(s)");
      }
      if (inputString.includes("'")) {
        result.changes.push("Replaced single quotes with double quotes");
      }
      
      const inputQuotes = (inputString.match(/"/g) || []).length;
      const repairedQuotes = (repairedText.match(/"/g) || []).length;
      if (repairedQuotes > inputQuotes) {
        result.changes.push("Added missing quotes to keys or string values");
      }
      
      if (inputString.match(/\/\/|\/\*/)) {
        result.changes.push("Removed comments");
      }
      
      if (result.changes.length === 0) {
        result.changes.push("Applied general syntax formatting or structural repairs");
      }
    }

  } catch (e: any) {
    result.errors.push(`Repair failed: ${e.message}`);
    result.success = false;
  }

  return result;
}
