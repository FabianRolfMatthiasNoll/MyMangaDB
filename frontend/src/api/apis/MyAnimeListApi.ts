/* tslint:disable */
/* eslint-disable */
/**
 * FastAPI
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 * The version of the OpenAPI document: 0.1.0
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */


import * as runtime from '../runtime';
import type {
  HTTPValidationError,
  Manga,
} from '../models';
import {
    HTTPValidationErrorFromJSON,
    HTTPValidationErrorToJSON,
    MangaFromJSON,
    MangaToJSON,
} from '../models';

export interface GetMangaResultsWithMalMalSearchMangaTitleGetRequest {
    mangaTitle: string;
}

export interface GetMangaWithMalMalMangaTitleGetRequest {
    mangaTitle: string;
}

/**
 * 
 */
export class MyAnimeListApi extends runtime.BaseAPI {

    /**
     * Get Manga Results With Mal
     */
    async getMangaResultsWithMalMalSearchMangaTitleGetRaw(requestParameters: GetMangaResultsWithMalMalSearchMangaTitleGetRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<Array<Manga>>> {
        if (requestParameters.mangaTitle === null || requestParameters.mangaTitle === undefined) {
            throw new runtime.RequiredError('mangaTitle','Required parameter requestParameters.mangaTitle was null or undefined when calling getMangaResultsWithMalMalSearchMangaTitleGet.');
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        const response = await this.request({
            path: `/mal/search/{manga_title}`.replace(`{${"manga_title"}}`, encodeURIComponent(String(requestParameters.mangaTitle))),
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => jsonValue.map(MangaFromJSON));
    }

    /**
     * Get Manga Results With Mal
     */
    async getMangaResultsWithMalMalSearchMangaTitleGet(requestParameters: GetMangaResultsWithMalMalSearchMangaTitleGetRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<Array<Manga>> {
        const response = await this.getMangaResultsWithMalMalSearchMangaTitleGetRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * Get Manga With Mal
     */
    async getMangaWithMalMalMangaTitleGetRaw(requestParameters: GetMangaWithMalMalMangaTitleGetRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<Manga>> {
        if (requestParameters.mangaTitle === null || requestParameters.mangaTitle === undefined) {
            throw new runtime.RequiredError('mangaTitle','Required parameter requestParameters.mangaTitle was null or undefined when calling getMangaWithMalMalMangaTitleGet.');
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        const response = await this.request({
            path: `/mal/{manga_title}`.replace(`{${"manga_title"}}`, encodeURIComponent(String(requestParameters.mangaTitle))),
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => MangaFromJSON(jsonValue));
    }

    /**
     * Get Manga With Mal
     */
    async getMangaWithMalMalMangaTitleGet(requestParameters: GetMangaWithMalMalMangaTitleGetRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<Manga> {
        const response = await this.getMangaWithMalMalMangaTitleGetRaw(requestParameters, initOverrides);
        return await response.value();
    }

}