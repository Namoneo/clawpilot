import { SetMetadata } from '@nestjs/common';

export const API_VERSION = 'apiVersion';
export const ApiVersion = (version: string) => SetMetadata(API_VERSION, version);

// Version 1 (current)
export const V1 = () => ApiVersion('v1');

// Future versions can be added:
// export const V2 = () => ApiVersion('v2');
