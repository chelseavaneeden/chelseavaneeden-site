// Which part of a photo or video stays in view when it's cropped to fit (object-position).
export type Focus = 'center' | 'top' | 'upper' | 'lower' | 'bottom' | 'left' | 'right' | 'top-left';

export const focusClass: Record<Focus, string> = {
  center: 'object-center',
  top: 'object-top',
  upper: 'object-upper',
  lower: 'object-lower',
  bottom: 'object-bottom',
  left: 'object-left',
  right: 'object-right',
  'top-left': 'object-left-top',
};
