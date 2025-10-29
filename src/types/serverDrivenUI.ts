// Types for server-driven UI components
export type UIComponentType = 'container' | 'text' | 'image' | 'button' | 'card';

export interface BaseComponent {
  id: string;
  type: UIComponentType;
  style?: Record<string, string | number>;
}

export interface TextComponent extends BaseComponent {
  type: 'text';
  content: string;
  variant?: 'title' | 'body' | 'caption';
}

export interface ImageComponent extends BaseComponent {
  type: 'image';
  url: string;
  aspectRatio?: number;
  resizeMode?: 'cover' | 'contain' | 'stretch';
}

export interface ButtonComponent extends BaseComponent {
  type: 'button';
  label: string;
  action: {
    type: 'navigation' | 'link' | 'api';
    payload: string;
  };
}

export interface ContainerComponent extends BaseComponent {
  type: 'container';
  children: UIComponent[];
  layout?: 'row' | 'column';
  spacing?: number;
}

export interface CardComponent extends BaseComponent {
  type: 'card';
  children: UIComponent[];
  cornerRadius?: number;
  elevation?: number;
}

export type UIComponent = 
  | TextComponent 
  | ImageComponent 
  | ButtonComponent 
  | ContainerComponent
  | CardComponent;

// API Response type
export interface APIResponse {
  version: string;
  screen: {
    id: string;
    title: string;
    layout: ContainerComponent;
  };
}