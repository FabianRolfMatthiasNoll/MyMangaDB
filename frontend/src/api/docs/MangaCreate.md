# MangaCreate

## Properties

| Name            | Type                                         |
| --------------- | -------------------------------------------- |
| `title`         | string                                       |
| `japaneseTitle` | string                                       |
| `readingStatus` | [ReadingStatus](ReadingStatus.md)            |
| `overallStatus` | [OverallStatus](OverallStatus.md)            |
| `starRating`    | number                                       |
| `language`      | string                                       |
| `category`      | [Category](Category.md)                      |
| `summary`       | string                                       |
| `coverImage`    | string                                       |
| `authors`       | [Array&lt;AuthorCreate&gt;](AuthorCreate.md) |
| `genres`        | [Array&lt;GenreCreate&gt;](GenreCreate.md)   |
| `lists`         | [Array&lt;ListCreate&gt;](ListCreate.md)     |
| `volumes`       | [Array&lt;VolumeCreate&gt;](VolumeCreate.md) |

## Example

```typescript
import type { MangaCreate } from "";

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
  authors: null,
  genres: null,
  lists: null,
  volumes: null,
} satisfies MangaCreate;

console.log(example);

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example);
console.log(exampleJSON);

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as MangaCreate;
console.log(exampleParsed);
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)
