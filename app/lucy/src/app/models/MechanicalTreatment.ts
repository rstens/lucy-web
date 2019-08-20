import { Observation, InvasivePlantSpecies, SpeciesAgencyCodes } from './observation';

export interface MechanicalTreatment {
        latitude: number;
        longitude: number;
        length: number;
        width: number;
        applicatorFirstName: string;
        applicatorLastName: string;
        date: string;
        paperFileReference: string;
        comment: string;
        observation: number;
        species: InvasivePlantSpecies;
        speciesAgency: SpeciesAgencyCodes;
        mechanicalMethod: number;
}


export interface MechanicalTreatmentMethodsCodes {
        description: string;
        activeIndicator: boolean;
        mechanical_method_code_id: number;
        code: string;
}