# ImportResponse

## Properties

| Name       | Type                                                     |
| ---------- | -------------------------------------------------------- |
| `total`    | number                                                   |
| `imported` | number                                                   |
| `skipped`  | number                                                   |
| `failed`   | number                                                   |
| `logs`     | [Array&lt;ImportResultDetail&gt;](ImportResultDetail.md) |

## Example

```typescript
import type { ImportResponse } from "";

// TODO: Update the object below with actual values
const example = {
  total: null,
  imported: null,
  skipped: null,
  failed: null,
  logs: null,
} satisfies ImportResponse;

console.log(example);

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example);
console.log(exampleJSON);

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as ImportResponse;
console.log(exampleParsed);
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)
