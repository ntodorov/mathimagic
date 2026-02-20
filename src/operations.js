export const DEFAULT_OPERATION = 'addition';

export const OPERATION_OPTIONS = [
  { id: 'addition', label: 'Addition', symbol: '+', color: 'green', phase: 'core' },
  { id: 'subtraction', label: 'Subtraction', symbol: '−', color: 'rose', phase: 'core' },
  { id: 'multiplication', label: 'Multiply', symbol: '×', color: 'amber', phase: 'core' },
  { id: 'division', label: 'Division', symbol: '÷', color: 'sky', phase: 'core' },
  { id: 'division-bridge', label: 'Division Bridge', symbol: 'R', color: 'teal', phase: 'bridge' },
  { id: 'fractions', label: 'Fractions', symbol: 'a/b', color: 'fuchsia', phase: 'bridge' },
  { id: 'fraction-sense', label: 'Fraction Sense', symbol: '≠', color: 'cyan', phase: 'bridge' },
  { id: 'decimals-bridge', label: 'Decimals Bridge', symbol: '0.5', color: 'lime', phase: 'bridge' },
  { id: 'mixed-mastery', label: 'Mixed Mastery', symbol: '★', color: 'slate', phase: 'mastery' },
];

export const CORE_OPERATION_IDS = ['addition', 'subtraction', 'multiplication', 'division'];
export const POST_DIVISION_MODE_IDS = [
  'division-bridge',
  'fractions',
  'fraction-sense',
  'decimals-bridge',
  'mixed-mastery',
];

export const getOperationOption = (type) =>
  OPERATION_OPTIONS.find((option) => option.id === type) ?? OPERATION_OPTIONS[0];
