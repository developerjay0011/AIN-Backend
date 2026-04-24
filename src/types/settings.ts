export interface Setting {
  id: string;
  key_name: string;
  value: string | any;
  label: string;
  group_name: string;
  type: 'text' | 'json' | 'number' | 'boolean' | string;
  updatedAt?: string;
}

export type SettingsMap = Record<string, any>;
