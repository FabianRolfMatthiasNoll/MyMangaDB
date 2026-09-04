# Volume

## Properties

| Name           | Type   |
| -------------- | ------ |
| `volumeNumber` | string |
| `coverImage`   | string |
| `id`           | number |
| `mangaId`      | number |

## Example

```typescript
import type { Volume } from "";

// TODO: Update the object below with actual values
const example = {
  volumeNumber: null,
  coverImage: null,
  id: null,
  mangaId: null,
} satisfies Volume;

console.log(example);

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example);
console.log(exampleJSON);

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as Volume;
console.log(exampleParsed);
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)
