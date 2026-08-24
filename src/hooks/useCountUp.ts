import { useEffect, useState } from 'react';
import { animate } from 'motion/react';

export function useCountUp(target: number, duration = 0.5): number {
  const [value, setValue] = useState(target);

  useEffect(() => {
    const controls = animate(value, target, {
      duration,
      ease: 'easeOut',
      onUpdate: (latest) => setValue(latest),
    });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);

  return value;
}
