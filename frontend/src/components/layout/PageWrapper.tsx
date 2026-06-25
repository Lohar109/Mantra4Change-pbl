import type { ReactNode } from 'react';

interface PageWrapperProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export function PageWrapper({ children, title, subtitle }: PageWrapperProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="mb-5">
          <h1 className="text-xl font-bold text-gray-900">{title}</h1>
          {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
        {children}
      </div>
    </div>
  );
}
