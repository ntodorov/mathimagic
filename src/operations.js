export const DEFAULT_OPERATION = 'subtraction';

export const OPERATION_OPTIONS = [
  { id: 'addition', label: 'Addition', symbol: '+', color: 'green' },
  { id: 'subtraction', label: 'Subtraction', symbol: '−', color: 'rose' },
  { id: 'multiplication', label: 'Multiply', symbol: '×', color: 'amber' },
  { id: 'division', label: 'Division', symbol: '÷', color: 'sky' },
];

export const getOperationOption = (type) =>
  OPERATION_OPTIONS.find((option) => option.id === type) ?? OPERATION_OPTIONS[0];
