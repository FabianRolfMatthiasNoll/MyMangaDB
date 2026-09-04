# Statistics

## Properties

| Name                        | Type                                             |
| --------------------------- | ------------------------------------------------ |
| `totalMangas`               | number                                           |
| `totalVolumes`              | number                                           |
| `totalAuthors`              | number                                           |
| `totalGenres`               | number                                           |
| `totalLists`                | number                                           |
| `readingStatusDistribution` | [Array&lt;StatisticCount&gt;](StatisticCount.md) |
| `overallStatusDistribution` | [Array&lt;StatisticCount&gt;](StatisticCount.md) |
| `categoryDistribution`      | [Array&lt;StatisticCount&gt;](StatisticCount.md) |
| `ratingDistribution`        | [Array&lt;StatisticCount&gt;](StatisticCount.md) |
| `topGenres`                 | [Array&lt;StatisticCount&gt;](StatisticCount.md) |
| `topAuthors`                | [Array&lt;StatisticCount&gt;](StatisticCount.md) |

## Example

```typescript
import type { Statistics } from "";

// TODO: Update the object below with actual values
const example = {
  totalMangas: null,
  totalVolumes: null,
  totalAuthors: null,
  totalGenres: null,
  totalLists: null,
  readingStatusDistribution: null,
  overallStatusDistribution: null,
  categoryDistribution: null,
  ratingDistribution: null,
  topGenres: null,
  topAuthors: null,
} satisfies Statistics;

console.log(example);

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example);
console.log(exampleJSON);

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as Statistics;
console.log(exampleParsed);
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)
