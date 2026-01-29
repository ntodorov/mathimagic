export const DEFAULT_OPERATION = 'subtraction';

export const OPERATION_OPTIONS = [
  { id: 'addition', label: 'Addition', symbol: '+' },
  { id: 'subtraction', label: 'Subtraction', symbol: '−' },
  { id: 'multiplication', label: 'Multiply', symbol: '×' },
];

export const getOperationOption = (type) =>
  OPERATION_OPTIONS.find((option) => option.id === type) ?? OPERATION_OPTIONS[0];
