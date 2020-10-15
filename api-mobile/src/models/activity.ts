import { SEARCH_LIMIT_MAX } from '../constants/misc';
import { parseBase64DataURLString } from './../utils/file-utils';
import { getLogger } from '../utils/logger';

const defaultLog = getLogger('activity-models');

/**
 * A single media item.
 *
 * @export
 * @interface IMediaItem
 */
export interface IMediaItem {
  //media_date: string;
  //description: string;
  file_name: string;
  encoded_file: string;
}

/**
 * Media object for Data URL base64 encoded files.
 *
 * @export
 * @class MediaBase64
 */
export class MediaBase64 {
  file_name: string;
  content_type: string;
  content_string: string;
  file_buffer: Buffer;

  /**
   * Creates an instance of MediaBase64.
   *
   * @param {IMediaItem} obj
   * @memberof MediaBase64
   */
  constructor(obj: IMediaItem) {
    const base64StringParts = parseBase64DataURLString(obj.encoded_file);

    //defaultLog.debug({ label: 'uploadActivity', message: 'obj.encoded_file', body: obj.encoded_file});
    //defaultLog.debug({ label: 'uploadActivity', message: 'base64 String parts', body: base64StringParts});

        // throw {
        //   status: 503,
        //   message: 'Just for fun in upload 2'
        // };

    if (!base64StringParts) {
      throw new Error('encoded_file could not be parsed');
    }

    this.content_type = base64StringParts.content_type;
    this.content_string = base64StringParts.content_type;
    this.file_name = obj.file_name;
    this.file_buffer = Buffer.from(base64StringParts.contentString, 'base64');
  }
}

/**
 * Activity post request body.
 *
 * @export
 * @class ActivityPostRequestBody
 */
export class ActivityPostRequestBody {
  activityPostBody: object;
  activityResponseBody: object;

  activity_type: string;
  activity_subtype: string;

  activity_data: object;
  activity_type_data: object;
  activity_subtype_data: object;

  received_timestamp: string;

  geometry: object[];

  mediaKeys: string[];

  /**
   * Creates an instance of ActivityPostRequestBody.
   *
   * @param {*} [obj]
   * @memberof ActivityPostRequestBody
   */
  constructor(obj?: any) {
    // Add whole original object for auditing
    this.activityPostBody = {
      ...obj,
      // Strip out any media base64 strings which would convolute the record
      media: (obj.media && obj.media.map((item: MediaBase64) => item.file_name)) || []
    };

    this.activity_type = (obj && obj.activity_type) || null;
    this.activity_subtype = (obj && obj.activity_subtype) || null;

    this.activity_data = (obj && obj.form_data && obj.form_data.activity_data) || null;
    this.activity_type_data = (obj && obj.form_data && obj.form_data.activity_type_data) || null;
    this.activity_subtype_data = (obj && obj.form_data && obj.form_data.activity_subtype_data) || null;

    this.received_timestamp = new Date().toISOString();

    this.geometry = (obj && obj.geometry && obj.geometry.length) || [];

    this.mediaKeys = (obj && obj.mediaKeys) || null;
  }
}

/**
 * Activity search filter criteria object.
 *
 * @export
 * @class ActivitySearchCriteria
 */
export class ActivitySearchCriteria {
  page: number;
  limit: number;

  activity_type: string;
  activity_subtype: string;

  date_range_start: Date;
  date_range_end: Date;

  include_media: boolean;

  bbox: GeoJSON.BBox;

  /**
   * Creates an instance of ActivitySearchCriteria.
   *
   * @param {*} [obj]
   * @memberof ActivitySearchCriteria
   */
  constructor(obj?: any) {
    this.page = (obj && obj.page && this.setPage(obj.page)) || 0;
    this.limit = (obj && obj.limit && this.setLimit(obj.limit)) || SEARCH_LIMIT_MAX;

    this.activity_type = (obj && obj.activity_type) || null;
    this.activity_subtype = (obj && obj.activity_subtype) || null;

    this.date_range_start = (obj && obj.date_range_start) || null;
    this.date_range_end = (obj && obj.date_range_end) || null;

    this.include_media = (obj && obj.include_media) || false;

    this.bbox = (obj && obj.bbox) || null;
  }

  setPage(page: number): number {
    if (!page || page < 0) {
      return 0;
    }

    return page;
  }

  setLimit(limit: number): number {
    if (!limit || limit < 0) {
      return 25;
    }

    if (limit > SEARCH_LIMIT_MAX) {
      return SEARCH_LIMIT_MAX;
    }

    return limit;
  }
}
