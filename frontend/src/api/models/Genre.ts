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

import { exists, mapValues } from '../runtime';
/**
 * 
 * @export
 * @interface Genre
 */
export interface Genre {
    /**
     * 
     * @type {number}
     * @memberof Genre
     */
    id: number;
    /**
     * 
     * @type {string}
     * @memberof Genre
     */
    name: string;
}

/**
 * Check if a given object implements the Genre interface.
 */
export function instanceOfGenre(value: object): boolean {
    let isInstance = true;
    isInstance = isInstance && "id" in value;
    isInstance = isInstance && "name" in value;

    return isInstance;
}

export function GenreFromJSON(json: any): Genre {
    return GenreFromJSONTyped(json, false);
}

export function GenreFromJSONTyped(json: any, ignoreDiscriminator: boolean): Genre {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'id': json['id'],
        'name': json['name'],
    };
}

export function GenreToJSON(value?: Genre | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'id': value.id,
        'name': value.name,
    };
}

