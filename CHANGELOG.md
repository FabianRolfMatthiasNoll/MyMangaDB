## [2.7.1](https://github.com/FabianRolfMatthiasNoll/MyMangaDB/compare/v2.7.0...v2.7.1) (2026-05-05)


### Bug Fixes

* **frontend:** remove redundant and conflicting logic ([7e4a850](https://github.com/FabianRolfMatthiasNoll/MyMangaDB/commit/7e4a85095c09113ed815073e412effae20062131))
* **frontend:** showing both success and failure notifications on failure ([6c7ca61](https://github.com/FabianRolfMatthiasNoll/MyMangaDB/commit/6c7ca61354530a268340e0a0f9b9f562bd6ca8bd))
* **manga-creation:** remove old hardcoded way of uploading cover images ([b708ba7](https://github.com/FabianRolfMatthiasNoll/MyMangaDB/commit/b708ba7b389637143e44235517cb853f544bc74b))
* **translation:** title missing in notification ([d60295a](https://github.com/FabianRolfMatthiasNoll/MyMangaDB/commit/d60295af4dd1377f821081170083212a6468e5c7))

# [2.7.0](https://github.com/FabianRolfMatthiasNoll/MyMangaDB/compare/v2.6.1...v2.7.0) (2026-05-01)


### Bug Fixes

* **frontend:** logout user if problem with token (expired / invalid) ([9e1ad1d](https://github.com/FabianRolfMatthiasNoll/MyMangaDB/commit/9e1ad1d53000feaeb705ebd1f9dd1e020350235d))


### Features

* **frontend:** add translation library ([7a0f99c](https://github.com/FabianRolfMatthiasNoll/MyMangaDB/commit/7a0f99c0e02849b26291a885f74a01884fc2af3b))
* **translation:** add appropiate translation labels for all string labels in the frontend ([b58ddb6](https://github.com/FabianRolfMatthiasNoll/MyMangaDB/commit/b58ddb611117335bfc85a9e3e9209af25495270f))
* **translation:** add translation files for english and translate them to german ([7662b56](https://github.com/FabianRolfMatthiasNoll/MyMangaDB/commit/7662b56b0e792bb9351f51435b51a51d2b1a5209))
* **translation:** change error messages in backend to codes that can be translated ([779a482](https://github.com/FabianRolfMatthiasNoll/MyMangaDB/commit/779a4828c4788b710479f692b6069095d5fb8bce))

## [2.6.1](https://github.com/FabianRolfMatthiasNoll/MyMangaDB/compare/v2.6.0...v2.6.1) (2026-04-16)


### Bug Fixes

* adjust backend endpoints to properly receive pagination ([4f9de46](https://github.com/FabianRolfMatthiasNoll/MyMangaDB/commit/4f9de469aea454caa4fc8f908a43722a59c30651))
* implement infinite scrolling and correct pagination to the frontend ([25900fe](https://github.com/FabianRolfMatthiasNoll/MyMangaDB/commit/25900feb4445821b6d8ada38dd9ff8a3cc7068ab))

# [2.6.0](https://github.com/FabianRolfMatthiasNoll/MyMangaDB/compare/v2.5.0...v2.6.0) (2025-12-22)


### Features

* add clear button and update to mui v7 ([9700a96](https://github.com/FabianRolfMatthiasNoll/MyMangaDB/commit/9700a9619fcc780f2f635a2ac923460bb2d77b79))

# [2.5.0](https://github.com/FabianRolfMatthiasNoll/MyMangaDB/compare/v2.4.0...v2.5.0) (2025-12-17)


### Bug Fixes

* **backend:** ensure star rating is at least 1.0 ([8bc1dee](https://github.com/FabianRolfMatthiasNoll/MyMangaDB/commit/8bc1dee8e0aab29a76fb00c267b3e383f0d39c02))


### Features

* **api:** generate typescript client for import endpoint ([9ed8bd0](https://github.com/FabianRolfMatthiasNoll/MyMangaDB/commit/9ed8bd0b0cbe1f3ed3bf9d05e0d16e764c5fd34f))
* **api:** regenerate typescript client with new ImportResponse ([c5429a0](https://github.com/FabianRolfMatthiasNoll/MyMangaDB/commit/c5429a023ce8d839425d872c3c43c7fd592cac67))
* **backend:** add volume import and detailed logs to MAL importer ([e75f6d0](https://github.com/FabianRolfMatthiasNoll/MyMangaDB/commit/e75f6d0cfdba1718e828f0cd22ed49220f130d4d))
* **backend:** implement MAL import logic and endpoint ([80c6dd6](https://github.com/FabianRolfMatthiasNoll/MyMangaDB/commit/80c6dd64c775193b0f1d75db15e9af73c93aff54))
* **frontend:** add MAL import modal and integration ([90e4827](https://github.com/FabianRolfMatthiasNoll/MyMangaDB/commit/90e4827682a62cd36b095b5a47afc73bd289212f))
* **frontend:** display detailed import logs in MAL import modal ([3d482c5](https://github.com/FabianRolfMatthiasNoll/MyMangaDB/commit/3d482c5b895e829f474c92ac5eb13d1e765acc00))
* **frontend:** move MAL import to dedicated section with instructions ([9292317](https://github.com/FabianRolfMatthiasNoll/MyMangaDB/commit/92923170868136e0f54667d44f359fe1bfad6e31))

# [2.4.0](https://github.com/FabianRolfMatthiasNoll/MyMangaDB/compare/v2.3.0...v2.4.0) (2025-12-08)


### Features

* enhance statistics screen with total volumes and star ratings ([94bef69](https://github.com/FabianRolfMatthiasNoll/MyMangaDB/commit/94bef695431b80d940125c570ee8bef03bd7cf8d))
* implement statistics screen with backend endpoint and frontend page ([7c38f62](https://github.com/FabianRolfMatthiasNoll/MyMangaDB/commit/7c38f62199158f86028848c08b94904b46a948fd))

# [2.3.0](https://github.com/FabianRolfMatthiasNoll/MyMangaDB/compare/v2.2.0...v2.3.0) (2025-12-08)


### Bug Fixes

* infinite scroll on widescreen and lazy load images ([7afb611](https://github.com/FabianRolfMatthiasNoll/MyMangaDB/commit/7afb6111a4d31f4b79470afe862d327a09b03467))


### Features

* add edit and delete list functionality to list detail page ([5201392](https://github.com/FabianRolfMatthiasNoll/MyMangaDB/commit/5201392f6378176fad4ebc5d598c87ba0d99c50c))

# [2.2.0](https://github.com/FabianRolfMatthiasNoll/MyMangaDB/compare/v2.1.0...v2.2.0) (2025-12-04)


### Bug Fixes

* invalidate queries on manga save/delete to refresh dashboard ([cd51a7e](https://github.com/FabianRolfMatthiasNoll/MyMangaDB/commit/cd51a7e0c5a3925244a3c64d0dd7f864229009a7))


### Features

* implement list display, search, and creation ([29b0a53](https://github.com/FabianRolfMatthiasNoll/MyMangaDB/commit/29b0a53168f7c8c26518b588a5f33fcbf6aeec10))

# [2.1.0](https://github.com/FabianRolfMatthiasNoll/MyMangaDB/compare/v2.0.0...v2.1.0) (2025-12-04)


### Features

* implement semantic release ([35f6785](https://github.com/FabianRolfMatthiasNoll/MyMangaDB/commit/35f6785c04cc3a3c3ca18b830f568b0dcc676f48))


### Performance Improvements

* improve loading performance with react-query and native image caching ([e50322f](https://github.com/FabianRolfMatthiasNoll/MyMangaDB/commit/e50322f90e2d9601ab18b707f7cc81acff4b93f6))
