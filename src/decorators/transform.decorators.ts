import { Transform, TransformationType } from 'class-transformer';
import { parsePhoneNumberWithError } from 'libphonenumber-js';
import _ from 'lodash';

import { GeneratorProvider } from '../providers/generator.provider.ts';

/**
 * @description trim spaces from start and end, replace multiple spaces with one.
 * @example
 * @ApiProperty()
 * @IsString()
 * @Trim()
 * name: string;
 * @returns PropertyDecorator
 * @constructor
 */
export function Trim(trimNewLines: boolean): PropertyDecorator {
  return Transform((params): string[] | string => {
    const value = params.value as string[] | string;

    if (!value) {
      return value;
    }

    if (Array.isArray(value)) {
      return value.map((v) => {
        const trimmedValue = v.trim();

        if (trimNewLines) {
          return trimmedValue.replaceAll(/\s\s+/g, ' ');
        }

        return trimmedValue;
      });
    }

    const trimmedValue = value.trim();

    if (trimNewLines) {
      return trimmedValue.replaceAll(/\s\s+/g, ' ');
    }

    return trimmedValue;
  });
}

export function ToBoolean(): PropertyDecorator {
  return Transform(
    (params) => {
      switch (params.value) {
        case 'true': {
          return true;
        }

        case 'false': {
          return false;
        }

        default: {
          return params.value;
        }
      }
    },
    { toClassOnly: true },
  );
}

/**
 * @description convert string or number to integer
 * @example
 * @IsNumber()
 * @ToInt()
 * name: number;
 * @returns PropertyDecorator
 * @constructor
 */
export function ToInt(): PropertyDecorator {
  return Transform(
    (params) => {
      const value = params.value as string;

      return Number.parseInt(value, 10);
    },
    { toClassOnly: true },
  );
}

/**
 * @description transforms to array, specially for query params
 * @example
 * @IsNumber()
 * @ToArray()
 * name: number;
 * @constructor
 */
export function ToArray(): PropertyDecorator {
  return Transform(
    (params): unknown[] => {
      const value = params.value;

      if (!value) {
        return value;
      }

      return _.castArray(value);
    },
    { toClassOnly: true },
  );
}

export function ToLowerCase(): PropertyDecorator {
  return Transform(
    (params) => {
      const value = params.value;

      if (!value) {
        return;
      }

      if (!Array.isArray(value)) {
        return value.toLowerCase();
      }

      return value.map((v) => v.toLowerCase());
    },
    {
      toClassOnly: true,
    },
  );
}

export function ToUpperCase(): PropertyDecorator {
  return Transform(
    (params) => {
      const value = params.value;

      if (!value) {
        return;
      }

      if (!Array.isArray(value)) {
        return value.toUpperCase();
      }

      return value.map((v) => v.toUpperCase());
    },
    {
      toClassOnly: true,
    },
  );
}

export function S3UrlParser(): PropertyDecorator {
  return Transform((params) => {
    const key = params.value as string;

    switch (params.type) {
      case TransformationType.CLASS_TO_PLAIN: {
        return GeneratorProvider.getS3PublicUrl(key);
      }

      case TransformationType.PLAIN_TO_CLASS: {
        return GeneratorProvider.getS3Key(key);
      }

      default: {
        return key;
      }
    }
  });
}

export function PhoneNumberSerializer(): PropertyDecorator {
  return Transform(
    (params) => parsePhoneNumberWithError(params.value as string).number,
  );
}

export function LinkCleanupTransform(options?: {
  removeTrailingSlash?: boolean;
  removeQueryParams?: boolean;
}): PropertyDecorator {
  return Transform((params) => {
    let value = params.value as string;

    if (!value) {
      return value;
    }

    if (options?.removeQueryParams) {
      value = value.replace(/\?.*$/, '');
    }

    if (options?.removeTrailingSlash ?? true) {
      value = value.replace(/\/+$/, '');
    }

    return value;
  });
}
