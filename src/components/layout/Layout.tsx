import { ReactNode } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

interface LayoutProps {
  children: ReactNode;
  onNewAutomation: () => void;
}

export const Layout = ({ children, onNewAutomation }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <Header onNewAutomation={onNewAutomation} />
      <Sidebar />
      <main className="ml-64 mt-16 p-6">
        {children}
      </main>
    </div>
  );
};
