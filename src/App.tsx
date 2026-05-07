import { useCallback, useState } from 'react';

import { Controls } from './components/Controls';
import { Display } from './components/Display';
import { SettingsProvider } from './store/settings';

type Output = { png: string; svg: string };

export function App() {
  const [output, setOutput] = useState<Output>({ png: '', svg: '' });
  const handleOutput = useCallback((o: Output) => setOutput(o), []);

  return (
    <SettingsProvider>
      <div className="relative h-full w-full md:pr-80">
        <Display onOutput={handleOutput} />
      </div>
      <Controls output={output} />
    </SettingsProvider>
  );
}
