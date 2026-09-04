# Manga

## Properties

| Name            | Type                                   |
| --------------- | -------------------------------------- |
| `title`         | string                                 |
| `japaneseTitle` | string                                 |
| `readingStatus` | [ReadingStatus](ReadingStatus.md)      |
| `overallStatus` | [OverallStatus](OverallStatus.md)      |
| `starRating`    | number                                 |
| `language`      | string                                 |
| `category`      | [Category](Category.md)                |
| `summary`       | string                                 |
| `coverImage`    | string                                 |
| `id`            | number                                 |
| `authors`       | [Array&lt;Author&gt;](Author.md)       |
| `genres`        | [Array&lt;Genre&gt;](Genre.md)         |
| `lists`         | [Array&lt;ListModel&gt;](ListModel.md) |
| `volumes`       | [Array&lt;Volume&gt;](Volume.md)       |

## Example

```typescript
import type { Manga } from "";

// TODO: Update the object below with actual values
const example = {
  title: null,
  japaneseTitle: null,
  readingStatus: null,
  overallStatus: null,
  starRating: null,
  language: null,
  category: null,
  summary: null,
  coverImage: null,
  id: null,
  authors: null,
  genres: null,
  lists: null,
  volumes: null,
} satisfies Manga;

console.log(example);

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example);
console.log(exampleJSON);

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as Manga;
console.log(exampleParsed);
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)
