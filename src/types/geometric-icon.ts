/**
 * GeometricIcon 类型定义
 */

export type IconType =
  | 'resonance'
  | 'science'
  | 'growth'
  | 'version'
  | 'community'
  | 'footprint'
  | 'intersect'
  | 'circle'
  | 'line'
  | 'people'
  | 'heart'
  | 'like'
  | 'bless'
  | 'share'
  | 'link'
  | 'copy'
  | 'message'
  | 'arrow-left'
  | 'arrow-right';

export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type IconColor = 'primary' | 'secondary' | 'text' | 'current';

export interface GeometricIconProps {
  type?: IconType;
  icon?: IconType; /* 兼容旧API */
  size?: IconSize;
  color?: IconColor;
  animated?: boolean;
  class?: string;
}
