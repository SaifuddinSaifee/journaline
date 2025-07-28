declare module 'react-select-timezone' {
  const TimezoneSelect: React.FC<{
    value: string;
    onChange: (timezone: string) => void;
    className?: string;
    timezones: Record<string, string>;
  }>;
  
  export const allTimezones: Record<string, string>;
  export default TimezoneSelect;
} 