import { Outlet, Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Container, Avatar, IconButton, Tooltip, Skeleton, Box, Stack } from '@/components/ui';
import { useAuth } from '../../context';
import { ThemeSwitcher } from '../ui/ThemeSwitcher';
import { strings } from '../../constants';
import styles from './Layout.module.css';

export function Layout() {
  const { user, isLoading } = useAuth();

  return (
    <Box 
      display="flex" 
      flexDirection="column" 
      minHeight="100vh" 
      sx={{ backgroundColor: 'var(--color-background)' }}
    >
      <AppBar position="fixed" elevation={0} component="header">
        <Toolbar className={styles.toolbar}>
          <Link to="/" className={styles.logoLink} aria-label={strings.a11y.homeLink}>
            <Box className={styles.logoBox} aria-hidden="true">
              <Typography component="span" className={styles.logoText}>{strings.app.logo}</Typography>
            </Box>
            <Typography variant="h6" component="span" className={styles.brandText}>
              {strings.app.name}
            </Typography>
          </Link>

          <Box sx={{ flex: 1 }} />

          <Stack direction="row" alignItems="center" gap={1}>
            <ThemeSwitcher />

            {isLoading ? (
              <Skeleton variant="circular" width={32} height={32} />
            ) : user ? (
              <Tooltip title={user.username}>
                <IconButton size="small" aria-label={strings.a11y.userMenu(user.username)}>
                  <Avatar className={styles.avatar} alt={user.username}>
                    {user.username.charAt(0).toUpperCase()}
                  </Avatar>
                </IconButton>
              </Tooltip>
            ) : null}
          </Stack>
        </Toolbar>
      </AppBar>

      <Toolbar aria-hidden="true" />

      <Box component="main" sx={{ flex: 1 }}>
        <Container maxWidth="lg" className={styles.container}>
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
}
