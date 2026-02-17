import { IconButton, Tooltip } from '@/components/ui';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../context';
import { strings } from '../../constants';

export function ThemeSwitcher() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <Tooltip title={isDark ? strings.theme.switchToLight : strings.theme.switchToDark}>
      <IconButton size="small" onClick={toggleTheme} aria-label={strings.theme.toggle}>
        {isDark ? <Sun size={20} /> : <Moon size={20} />}
      </IconButton>
    </Tooltip>
  );
}
