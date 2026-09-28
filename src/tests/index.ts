import { amslerTest } from './amsler';
import { astigmatismTest } from './astigmatism';
import { colorVisionTest } from './colorVision';
import { duochromeTest } from './duochrome';
import type { TestDefinition } from './types';
import { visualAcuityTest } from './visualAcuity';

export type AnyTest = TestDefinition<any>;

export const TESTS: AnyTest[] = [visualAcuityTest, astigmatismTest, duochromeTest, amslerTest, colorVisionTest];
