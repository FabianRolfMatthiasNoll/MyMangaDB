# [2.9.0](https://github.com/FabianRolfMatthiasNoll/MyMangaDB/compare/v2.8.5...v2.9.0) (2026-11-26)


### Bug Fixes

* **api:** keep 404 status for missing manga ([ca4cfb7](https://github.com/FabianRolfMatthiasNoll/MyMangaDB/commit/ca4cfb7a6869f271cc0bc04c17af524896fd7f33))
* **api:** move blocking import work off the event loop ([f7d7c5c](https://github.com/FabianRolfMatthiasNoll/MyMangaDB/commit/f7d7c5cd1428a520e9d85e1e949b6b22f448ba87))
* **cover-image:** block SSRF when downloading remote covers ([6e54666](https://github.com/FabianRolfMatthiasNoll/MyMangaDB/commit/6e54666cc2ba5098d7a8aa6d893a16cafcfe21ca))
* **dashboard:** remove the empty line around the covers ([47305d9](https://github.com/FabianRolfMatthiasNoll/MyMangaDB/commit/47305d90efac65f7b899e34f3ad9dcf080980b42))
* **filters:** translate category and status dropdown labels ([92d1e60](https://github.com/FabianRolfMatthiasNoll/MyMangaDB/commit/92d1e600d6745cd736885105a95194d66c864b0c))
* **frontend:** align the buttons in the search results ([78650ea](https://github.com/FabianRolfMatthiasNoll/MyMangaDB/commit/78650ea60a5c2a60ffa1c3c63ff117e4e81f6936))
* **frontend:** build the image on a glibc base ([4e5bf98](https://github.com/FabianRolfMatthiasNoll/MyMangaDB/commit/4e5bf98ed4c7fd059590ab39fd90c70f643af88c))
* **frontend:** explain that a title is already in the collection ([0c391da](https://github.com/FabianRolfMatthiasNoll/MyMangaDB/commit/0c391daf51e4707c37656533cbf7847478402813))
* **frontend:** give the collection a consistent look and meaning ([35170c1](https://github.com/FabianRolfMatthiasNoll/MyMangaDB/commit/35170c11d28ea40b1d9c0fc2c361fe9690560912))
* **frontend:** go back to where you came from ([82f708e](https://github.com/FabianRolfMatthiasNoll/MyMangaDB/commit/82f708e329b90f98abcb9c0367566d0ba06cd997))
* **frontend:** keep a forbidden action from ending the session ([bf8948d](https://github.com/FabianRolfMatthiasNoll/MyMangaDB/commit/bf8948d20c11c38de71a95ae279e036434c32f68))
* **frontend:** make the manga form behave like a form ([afa54a7](https://github.com/FabianRolfMatthiasNoll/MyMangaDB/commit/afa54a7951542c71851826f65a5fc2c4349a9e22))
* **frontend:** show a title the same way on every page ([71c84ab](https://github.com/FabianRolfMatthiasNoll/MyMangaDB/commit/71c84ab3640d0805cad4a0c53a09b7f24ea797b6))
* **frontend:** show one message when a request fails ([1a8f7b7](https://github.com/FabianRolfMatthiasNoll/MyMangaDB/commit/1a8f7b75c28d151938e1e696509678a20e41bd6b))
* **frontend:** show what happened instead of a blank page ([c5d01bb](https://github.com/FabianRolfMatthiasNoll/MyMangaDB/commit/c5d01bb9e6a738d913531511a8b732fd0fd38c65))
* **header:** keep the navigation labels in plain case ([4cef27f](https://github.com/FabianRolfMatthiasNoll/MyMangaDB/commit/4cef27fbc4736bbfd51dce231babf29a72f7babc))
* **header:** move the wishlist count next to the label ([e2a6c99](https://github.com/FabianRolfMatthiasNoll/MyMangaDB/commit/e2a6c99546c2e55ac669544118472156495592f0))
* **images:** revoke cover object URLs on unmount ([164730d](https://github.com/FabianRolfMatthiasNoll/MyMangaDB/commit/164730dd65e42d9cb86862838abf1fbffec4fb91))
* **lists:** count manga per list in a single query ([44621eb](https://github.com/FabianRolfMatthiasNoll/MyMangaDB/commit/44621ebed8958961132ce91880d3d7c8d814adef))
* **load:** show error state instead of endless loading ([2b3157a](https://github.com/FabianRolfMatthiasNoll/MyMangaDB/commit/2b3157aaf1e8dbf1ae36a22102e9942e03f5daa0))
* **status-chips:** match status colors to enum values ([07fa63e](https://github.com/FabianRolfMatthiasNoll/MyMangaDB/commit/07fa63ec8e8aa8a7fad4b34930e28040bcb11793))
* **wishlist:** keep the badge and the list in sync ([8f4aae3](https://github.com/FabianRolfMatthiasNoll/MyMangaDB/commit/8f4aae3425daf6ae99350d47bcdc4d72f1d20477))


### Features

* **api:** filter mangas by list_id instead of a search prefix ([930f61d](https://github.com/FabianRolfMatthiasNoll/MyMangaDB/commit/930f61d7f8f06decf0bd1693d444c3a75f60defb))
* **backend:** hash the passwords with bcrypt directly ([a9c30d8](https://github.com/FabianRolfMatthiasNoll/MyMangaDB/commit/a9c30d80614c6326702a62e582ad6880beca307b))
* **backend:** import myanimelist plan-to-read as a wishlist ([79e4f4e](https://github.com/FabianRolfMatthiasNoll/MyMangaDB/commit/79e4f4e790323d9f7c5732ad1d7de01feebef64b))
* **backend:** keep the titles you own a volume of in the collection ([bfb5c12](https://github.com/FabianRolfMatthiasNoll/MyMangaDB/commit/bfb5c12d76720cee546920c0e8c8bfe86db6c9b0))
* **backend:** manage the schema with alembic migrations ([868cfb4](https://github.com/FabianRolfMatthiasNoll/MyMangaDB/commit/868cfb4694f622d0b11b661833b736d9318a53fa))
* **backend:** track the ownership status of a manga ([7f11812](https://github.com/FabianRolfMatthiasNoll/MyMangaDB/commit/7f11812dc2ce2a1c559df07564ca375355aa469e))
* **backend:** track the total number of volumes of a series ([e64acdb](https://github.com/FabianRolfMatthiasNoll/MyMangaDB/commit/e64acdb17d15f659b09bbd448b6e74972605f493))
* **backend:** track when a manga was added and whether it is prioritised ([a8b0eb6](https://github.com/FabianRolfMatthiasNoll/MyMangaDB/commit/a8b0eb6c0bfc654c6d29cd9c7da5979d16563484))
* **frontend:** add a dedicated wishlist page ([875a9b6](https://github.com/FabianRolfMatthiasNoll/MyMangaDB/commit/875a9b6c4154f090da97df07e5cd3f8095f51cb7))
* **frontend:** add a destination choice to the automatic search ([499fbbd](https://github.com/FabianRolfMatthiasNoll/MyMangaDB/commit/499fbbd0922f8e0bd256c5ece7bc4b5e5e5f889b))
* **frontend:** add the ownership state to the form and filters ([20a2971](https://github.com/FabianRolfMatthiasNoll/MyMangaDB/commit/20a2971cd9af70f4ddd9f24df8e6c5af9d4c8b76))
* **frontend:** add the wishlist actions ([3efc73b](https://github.com/FabianRolfMatthiasNoll/MyMangaDB/commit/3efc73bf3675b1d1e9b45fc4fe2463627590a9be))
* **frontend:** keep wishlist entries out of the collection by default ([f944c87](https://github.com/FabianRolfMatthiasNoll/MyMangaDB/commit/f944c8713d8893f471fc56690882d7da6d13eff5))
* **frontend:** let the app know how many volumes a series has ([80d1841](https://github.com/FabianRolfMatthiasNoll/MyMangaDB/commit/80d1841051b3ac2fdffd3404d6e9085cf333dde0))
* **frontend:** update to React 19 ([b37fef2](https://github.com/FabianRolfMatthiasNoll/MyMangaDB/commit/b37fef296d0d58bb892a63cc492ba405ef9fc48b))
* **wishlist:** add received volumes to the collection ([d121625](https://github.com/FabianRolfMatthiasNoll/MyMangaDB/commit/d1216254b5cb25c286e2cccdd197c4a87c180d8b))
* **wishlist:** leave the pure wishes out of the collection ([ab3ef29](https://github.com/FabianRolfMatthiasNoll/MyMangaDB/commit/ab3ef29eefcc8fdf5cb29eef314753a8f391cff0))
* **wishlist:** put the missing volumes of a series on the wishlist ([1c5475b](https://github.com/FabianRolfMatthiasNoll/MyMangaDB/commit/1c5475b7747f71c8857ed8895a34fba6748c347d))
* **wishlist:** say how long the series is ([ab70b61](https://github.com/FabianRolfMatthiasNoll/MyMangaDB/commit/ab70b6156bb77375a9c4d9f6bda3a472faff8ebd))


### Performance Improvements

* **backend:** do not wait long for a cover that does not come ([761f539](https://github.com/FabianRolfMatthiasNoll/MyMangaDB/commit/761f539c48e1992ccc949026d4f5c1000a6ded2b))
* **backend:** fetch the details of a search result at the same time ([b2adad4](https://github.com/FabianRolfMatthiasNoll/MyMangaDB/commit/b2adad423f2aa1ab25012952aa500859eb9a2195))

## [2.8.5](https://github.com/FabianRolfMatthiasNoll/MyMangaDB/compare/v2.8.4...v2.8.5) (2026-11-19)


### Bug Fixes

* **security:** Dont start backend without secure token ([e6e11a4](https://github.com/FabianRolfMatthiasNoll/MyMangaDB/commit/e6e11a47b4ef8b348c94abc4ecc0db7eecb1fae4))

## [2.8.4](https://github.com/FabianRolfMatthiasNoll/MyMangaDB/compare/v2.8.3...v2.8.4) (2026-10-27)

## [2.8.3](https://github.com/FabianRolfMatthiasNoll/MyMangaDB/compare/v2.8.2...v2.8.3) (2026-09-05)


### Bug Fixes

* **filter:** fix broken unrated manga filtering ([bba25ae](https://github.com/FabianRolfMatthiasNoll/MyMangaDB/commit/bba25ae990b193d5708e1904012ae87bd7bb75be))

## [2.8.2](https://github.com/FabianRolfMatthiasNoll/MyMangaDB/compare/v2.8.1...v2.8.2) (2026-09-05)


### Bug Fixes

* **database:** broken database destination after docker rework ([6034658](https://github.com/FabianRolfMatthiasNoll/MyMangaDB/commit/60346580342be8ee262087143d55c5f752f9130b))

## [2.8.1](https://github.com/FabianRolfMatthiasNoll/MyMangaDB/compare/v2.8.0...v2.8.1) (2026-09-04)


### Bug Fixes

* **pipeline:** fix release pipeline ([4136611](https://github.com/FabianRolfMatthiasNoll/MyMangaDB/commit/41366117ff66620da9e07e4f760f01abfb0054cd))

# [2.8.0](https://github.com/FabianRolfMatthiasNoll/MyMangaDB/compare/v2.7.3...v2.8.0) (2026-09-04)


### Bug Fixes

* **api:** update api tools to correctly build interface ([2074305](https://github.com/FabianRolfMatthiasNoll/MyMangaDB/commit/20743059bf51372e6f8c7b6d39086b7a17135f93))


### Features

* **deployment:** properly build and deploy containers to easier set it up ([3f1cd2b](https://github.com/FabianRolfMatthiasNoll/MyMangaDB/commit/3f1cd2b7daabb61268176cb0c22ed906e1f40483))

## [2.7.3](https://github.com/FabianRolfMatthiasNoll/MyMangaDB/compare/v2.7.2...v2.7.3) (2026-09-04)


### Bug Fixes

* **sorting:** implement the filter in backend api for better fetching ([55d1806](https://github.com/FabianRolfMatthiasNoll/MyMangaDB/commit/55d18061d0242bb15ba0e0dbe4bc8a44c61ad961))

## [2.7.2](https://github.com/FabianRolfMatthiasNoll/MyMangaDB/compare/v2.7.1...v2.7.2) (2026-07-10)


### Bug Fixes

* **security:** harden entrypoints of both frontend and backend ([2ad34ea](https://github.com/FabianRolfMatthiasNoll/MyMangaDB/commit/2ad34ea785c01d096b38a01420d56fc5a1078db4))

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
