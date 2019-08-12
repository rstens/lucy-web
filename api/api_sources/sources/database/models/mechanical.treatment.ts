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
 * File: mechanical.treatment.ts
 * Project: lucy
 * File Created: Monday, 12th August 2019 10:27:35 am
 * Author: pushan
 * -----
 * Last Modified: Monday, 12th August 2019 10:38:06 am
 * Modified By: pushan
 * -----
 */

// ** Model: MechanicalTreatment from schema MechanicalTreatmentSchema **

import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn} from 'typeorm';
import { MechanicalTreatmentSchema, ObservationSchema } from '../database-schema';
import { ModelProperty, PropertyType, ClassDescription } from '../../libs/core-model';
import { DataModelController } from '../data.model.controller';
import { Observation } from './observation';
import { Record, User } from './user';

/** Interface **/
/**
 * @description MechanicalTreatment create interface
 */
export interface MechanicalTreatmentCreateSpec {
	latitude: number;
	longitude: number;
	width: number;
	length: number;
	observation: Observation;
}
// -- End: MechanicalTreatmentCreateSpec --


/** Interface **/
/**
 * @description MechanicalTreatment update interface
 */
export interface MechanicalTreatmentUpdateSpec {
	latitude?: number;
	longitude?: number;
	width?: number;
	length?: number;
	observation?: Observation;
}
// -- End: MechanicalTreatmentUpdateSpec --

/**
 * @description Data Model Class for MechanicalTreatmentSchema
 */
@Entity( { name: MechanicalTreatmentSchema.dbTable} )
@ClassDescription({
    description: 'Mechanical Treatment Record model class',
    schema: MechanicalTreatmentSchema,
    apiResource: true
})
export class MechanicalTreatment extends Record implements MechanicalTreatmentCreateSpec, MechanicalTreatmentUpdateSpec {

	/**
	 * Class Properties
	 */

	/**
	 * @description Getter/Setter property for column {mechanical_treatment_id}
	 */
	@PrimaryGeneratedColumn()
	@ModelProperty({type: PropertyType.number})
	mechanical_treatment_id: number;

	/**
	 * @description Getter/Setter property for column {mechanical_treatment_location_latitude}
	 */
	@Column({ name: MechanicalTreatmentSchema.columns.latitude})
	@ModelProperty({type: PropertyType.number})
	latitude: number;

	/**
	 * @description Getter/Setter property for column {mechanical_treatment_location_longitude}
	 */
	@Column({ name: MechanicalTreatmentSchema.columns.longitude})
	@ModelProperty({type: PropertyType.number})
	longitude: number;

	/**
	 * @description Getter/Setter property for column {mechanical_treatment_area_width}
	 */
	@Column({ name: MechanicalTreatmentSchema.columns.width})
	@ModelProperty({type: PropertyType.number})
	width: number;

	/**
	 * @description Getter/Setter property for column {mechanical_treatment_area_length}
	 */
	@Column({ name: MechanicalTreatmentSchema.columns.length})
	@ModelProperty({type: PropertyType.number})
	length: number;

	/**
	 * @description Getter/Setter property for column {observation_id}
	 */
	@ManyToOne( type => Observation, {eager: true})
	@JoinColumn({
		name: MechanicalTreatmentSchema.columns.observation,
		referencedColumnName: ObservationSchema.columns.id
	})
	@ModelProperty({type: PropertyType.object})
	observation: Observation;

}


// ** DataModel controller of MechanicalTreatment **

/**
 * @description Data Model Controller Class for MechanicalTreatmentSchema and MechanicalTreatment
 */
export class MechanicalTreatmentController extends DataModelController<MechanicalTreatment> {
	/**
	* @description Getter for shared instance
	*/
	public static get shared(): MechanicalTreatmentController {
		return this.sharedInstance<MechanicalTreatment>(MechanicalTreatment, MechanicalTreatmentSchema) as MechanicalTreatmentController;
	}

	/**
	 * @description Create New Mechanical treatment
	 * @param MechanicalTreatmentCreateSpec data: Data To create obj
	 * @param User creator: Creator of the record
	 */
	async createNew(data: MechanicalTreatmentCreateSpec, creator: User): Promise<MechanicalTreatment> {
		const obj = data as MechanicalTreatment;
		obj.createdBy = creator;
		obj.updatedBy = creator;
		await this.saveInDB(obj);
		return obj;
	}

	/**
	 * @description Update Mechanical treatment
	 * @param MechanicalTreatment obj: Model object to be updated
	 * @param MechanicalTreatmentUpdateSpec data: Data to update
	 * @param User user: Modifier
	 */
	async update(obj: MechanicalTreatment, data: MechanicalTreatmentUpdateSpec, user: User): Promise<MechanicalTreatment> {
		obj.updatedBy = user;
		return await this.updateObj<MechanicalTreatmentUpdateSpec>(obj, data);
	}
}

// -------------------------------------
