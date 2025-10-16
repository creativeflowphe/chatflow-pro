import { useTheme } from '../contexts/ThemeContext';

export const useNodeTheme = () => {
  const { isDark } = useTheme();

  const getNodeClasses = (baseColor: string) => {
    if (isDark) {
      return {
        container: 'bg-gray-800 border-gray-600',
        header: `bg-${baseColor}-900/50`,
        headerText: 'text-gray-100',
        text: 'text-gray-300',
        textSecondary: 'text-gray-400',
        input: 'bg-gray-700 border-gray-600 text-gray-100 focus:ring-blue-500',
        button: 'bg-gray-700 hover:bg-gray-600',
        actionBar: 'bg-gray-700 border-gray-600',
      };
    }

    return {
      container: 'bg-white border-gray-200',
      header: `bg-${baseColor}-50`,
      headerText: 'text-gray-900',
      text: 'text-gray-600',
      textSecondary: 'text-gray-500',
      input: 'bg-white border-gray-300 text-gray-900 focus:ring-blue-500',
      button: 'bg-gray-100 hover:bg-gray-200',
      actionBar: 'bg-white border-gray-200',
    };
  };

  return { isDark, getNodeClasses };
};
