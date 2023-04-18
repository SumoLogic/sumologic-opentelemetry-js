import { IKeyValue } from '../common/types';
/** Properties of a Resource. */
export interface IResource {
    /** Resource attributes */
    attributes: IKeyValue[];
    /** Resource droppedAttributesCount */
    droppedAttributesCount: number;
}
