/*
 * Copyright © 2019 Province of British Columbia
 * Licensed under the Apache License, Version 2.0 (the "License")
 * You may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * **
 * http://www.apache.org/licenses/LICENSE-2.0
 * **
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * File: schema.validation.ts
 * Project: lucy
 * File Created: Friday, 15th November 2019 9:53:04 am
 * Author: pushan (you@you.you)
 * -----
 * Last Modified: Friday, 15th November 2019 9:55:49 am
 * Modified By: pushan (you@you.you>)
 * -----
 */
import * as assert from 'assert';
import * as _ from 'underscore';
import * as moment from 'moment';
import { DataFieldDefinition, controllerForSchemaName, BaseSchema, TableRelation } from '../../libs/core-database';
import { ValidatorCheck, ValidatorExists, ValidationInfo, MakeOptionalValidator} from './core.validator';
import { DataController} from '../../database/data.model.controller';
import { Logger } from '../logger';
import { unWrap } from '../../libs/utilities';

export class SchemaValidator {
    /**
     * Shared instance
     */
    static _instance: SchemaValidator;
    static get shared(): SchemaValidator {
        return this._instance || ( this._instance = new this());
    }

    // Logger
    logger: Logger;

    constructor() {
        this.logger = new Logger(this.constructor.name);
    }

    validators(schema: BaseSchema, filterOnly?: boolean, rootKey?: string): any[] {
        // Getting validator from schema column
        let allValidators = this._fieldValidators(schema.table.columnsDefinition, filterOnly, rootKey);

        // Getting validation from embedded schema relation
        if (schema.table.relations && Object.keys(schema.table.relations).length > 0) {
            _.each(schema.table.relations, (rel: TableRelation, key: string) => {
                if (unWrap(rel.meta, {}).embedded) {
                    allValidators = allValidators.concat(this._relationshipValidators(key, rel, rootKey, unWrap(rel.meta, {}).optional || false));
                }
            });
        }
        return allValidators;
    }

    _relationshipValidators(key: string, relation: TableRelation , rootKey?: string, optional?: boolean): any[] {
        // Get controller
        const controller: DataController = controllerForSchemaName(relation.schema || '');
        if (controller) {
            // Get schema
            const schema = controller.schemaObject;
            const mainRootKey = rootKey ? `${rootKey}.${key}` : key;
            if (optional) {
                return MakeOptionalValidator(() => this.validators(schema, undefined, key));
            }
            return  this.validators(schema, undefined, mainRootKey);
        } else {
            this.logger.info(`Controller Not available for schema: ${relation.schema || 'NA'}`);
        }
        return [];
    }

    private _validatorForString(typeInfo: any, key: string, field: DataFieldDefinition, rootKey?: string): any {
        let info: ValidationInfo;
        const printKey: string = rootKey ? `${rootKey}.${key}` : key;
        if (typeInfo.isDate) {
            info = {
                validate: validate => validate.isString().custom(async (val: string, {req}) => {
                    assert(moment(val, 'YYYY-MM-DD').isValid(), `${printKey}: should be string in YYYY-MM-DD format`);
                }),
                message: 'should be string in YYYY-MM-DD format',
                optional: !field.required
            };
        } else if (typeInfo.isTimestamp) {
            info = {
                validate: validate => validate.isString().custom(async (val: string, {req}) => {
                    assert(moment(val, 'YYYY-MM-DD hh:mm:ss').isValid(), `${printKey}: should be string in YYYY-MM-DD hh:mm:ss format`);
                }),
                message: 'should be string in YYYY-MM-DD format',
                optional: !field.required
            };
        } else {
           info = {
                validate: validate => validate.isString().custom(async (value: string, {req}) => {
                    // 1. Check Size
                    assert(value, `${printKey}: Value must be defined`);
                    assert(value.length < typeInfo.size, `${printKey}: Exceed maximum size ${typeInfo.size}`);
                    // 2. Regx check
                    const verification = field.fieldVerification() || {};
                    if (verification.regx) {
                        const regx = new RegExp(verification.regx.re, verification.regx.flag || 'gm');
                        assert(value.match(regx), `${printKey}: should match regx: ${regx}`);
                    }
                }),
                message: 'should be string',
                optional: !field.required
            };
        }
        return info;
    }

    private _fieldValidators(fields: {[key: string]: DataFieldDefinition}, filterOnly?: boolean, rootKey?: string): any[] {
        let results: any[] = [];
        let validatorCheck = {};
        let validatorExists = {};
        _.each(fields, (field: DataFieldDefinition, key: string) => {
            if (key === 'id') {
                return;
            }
            const typeInfo: any = field.typeDetails;
            const validateKey: {[key: string]: ValidationInfo} = {};
            const validateExists: {[key: string]: DataController} = {};
            switch  (typeInfo.type) {
                case 'string':
                    validateKey[key] = this._validatorForString(typeInfo, key, field, rootKey);
                    break;
                case 'number':
                    validateKey[key] = {
                        validate: validate => validate.isNumeric(),
                        message: 'should be number',
                        optional: !field.required
                    };
                    break;
                case 'boolean':
                    validateKey[key] = {
                        validate: validate => validate.isBoolean(),
                        message: 'should be boolean',
                        optional: !field.required
                    };
                    break;
                case 'object':
                    // Check Filter only or not
                    if (filterOnly) {
                        break;
                    }

                    // Check json type or not
                    if (typeInfo.subType === 'json') {
                        validateKey[key] = {
                            validate: validate => validate.custom(async (value: any, {req}) => {
                                // Check json or not
                                assert(value, `${key}: should be json`);
                                assert(typeof value === typeof {}, `${key}: should be json, received ${typeof value}`);
                                // TODO: Add logic to verify json-schema
                            }),
                            message: 'should be json',
                            optional: !field.required
                        };
                        break;
                    }

                    // Get schema name
                    const schemaName = typeInfo.schema;

                    // Check column is embedded or not
                    // console.log(`${key}: 1: ${schemaName}`);
                    const controller: DataController = controllerForSchemaName(schemaName);
                    let handled = false;
                    if (controller) {
                        // Check embedded or not
                        // Get meta data
                        if (unWrap(field.meta, {}).embedded) {
                            // Embedded relation schema
                            // Get schema
                            const schema = controller.schemaObject;
                            if (!field.required) {
                                results = results.concat(
                                    MakeOptionalValidator(() => this.validators(schema, undefined, key))
                                );
                            } else {
                                results = results.concat(this.validators(schema, undefined, key));
                            }
                            handled = true;
                        }
                    }
                    // If not embedded and so handling with exists key
                    if (!handled) {
                        validateKey[key] = {
                            validate: validate => validate.isInt().custom(async (val: number, {req}) => {
                                const con = controllerForSchemaName(schemaName);
                                if (con) {
                                    const item = await con.findById(val);
                                    assert(item, `${key}: Item not exists with id: ${val}`);
                                    if (!req.body) {
                                        req.body = {};
                                    }
                                    req.body[key] = item;
                                }
                            }),
                            optional: !field.required
                        };
                    }
                    break;
            }
            validatorCheck = {...validatorCheck, ...validateKey};
            validatorExists = {...validatorExists, ...validateExists};
        });
        // console.dir(validatorExists);
        if (filterOnly) {
            return results.concat(ValidatorCheck(validatorCheck, rootKey));
        }
        const existsValidator = ValidatorExists(validatorExists);
        const checkValidator = ValidatorCheck(validatorCheck);
        results = results.concat(existsValidator);
        results = results.concat(checkValidator);
        return results;
    }

}
