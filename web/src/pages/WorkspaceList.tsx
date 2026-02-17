import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Grid, CircularProgress, ToggleButtonGroup, ToggleButton, InputBase, Stack, Paper } from '../components/ui';
import { Plus, Search } from 'lucide-react';
import { useWorkspaces } from '../api';
import { useAuth } from '../context';
import { WorkspaceCard } from '../components';
import { strings } from '../constants';
import styles from './WorkspaceList.module.css';

export function WorkspaceList() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: workspaces, isLoading } = useWorkspaces();
  const [filter, setFilter] = useState<'all' | 'mine'>('mine');
  const [search, setSearch] = useState('');

  const filteredWorkspaces = useMemo(() => {
    if (!workspaces) return [];

    console.log('Filter debug:', {
      filter,
      username: user?.username,
      totalWorkspaces: workspaces.length,
      workspaceOwners: workspaces.map(ws => ({
        name: ws.metadata.name,
        owner: ws.metadata.annotations?.['workspace.jupyter.org/created-by']
      }))
    });

    return workspaces.filter((ws) => {
      // Apply owner filter
      if (filter === 'mine') {
        const owner = ws.metadata.annotations?.['workspace.jupyter.org/created-by'];
        if (!owner || !user?.username) return false;
        
        // Handle different owner formats:
        // - "github:username"
        // - "username"
        // - "arn:aws:sts::account:assumed-role/Role/username"
        const isOwner = 
          owner === user.username || // Direct match
          owner === `github:${user.username}` || // GitHub format
          owner.endsWith(`/${user.username}`) || // AWS ARN format
          owner.includes(`:${user.username}`); // Other formats
        
        if (!isOwner) return false;
      }
      
      // Apply search filter
      if (search) {
        const q = search.toLowerCase();
        const matchesSearch = ws.spec.displayName.toLowerCase().includes(q) || 
                             ws.metadata.name.toLowerCase().includes(q);
        if (!matchesSearch) return false;
      }
      
      return true;
    });
  }, [workspaces, filter, user?.username, search]);

  const handleFilterChange = (_: React.MouseEvent<HTMLElement>, value: string | string[]) => {
    if (value && typeof value === 'string' && (value === 'all' || value === 'mine')) {
      setFilter(value);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleCreateClick = () => navigate('/create');

  if (isLoading) {
    return (
      <Stack alignItems="center" justifyContent="center" sx={{ minHeight: '400px' }}>
        <CircularProgress size={32} />
      </Stack>
    );
  }

  const isEmpty = filteredWorkspaces.length === 0;

  return (
    <Box>
      <Box sx={{ marginBottom: '32px' }}>
        <Typography variant="h2" sx={{ marginBottom: '8px' }}>{strings.workspace.listTitle}</Typography>
        <Typography variant="body2" color="textSecondary">
          {strings.workspace.listDescription}
        </Typography>
      </Box>

      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ marginBottom: '24px', flexWrap: 'wrap' }} gap={2}>
        <Stack direction="row" gap={2} alignItems="center">
          <Paper className={styles.searchContainer} elevation={0}>
            <Search className={styles.searchIcon} size={20} />
            <InputBase
              placeholder={strings.workspace.searchPlaceholder}
              value={search}
              onChange={handleSearchChange}
              inputProps={{ 'aria-label': strings.a11y.searchWorkspaces }}
              fullWidth
            />
          </Paper>

          <ToggleButtonGroup
            value={filter}
            exclusive
            onChange={handleFilterChange}
            size="small"
            aria-label={strings.a11y.filterWorkspaces}
          >
            <ToggleButton value="mine">{strings.workspace.filterMine}</ToggleButton>
            <ToggleButton value="all">{strings.workspace.filterAll}</ToggleButton>
          </ToggleButtonGroup>
        </Stack>

        <Button variant="contained" startIcon={<Plus size={20} />} onClick={handleCreateClick} className={styles.gradientButton}>
          {strings.workspace.newWorkspace}
        </Button>
      </Stack>

      {isEmpty ? (
        <Paper className={styles.emptyState} elevation={0}>
          <Typography variant="h6" color="textSecondary" gutterBottom>
            {search ? strings.workspace.noWorkspacesFound : strings.workspace.noWorkspacesYet}
          </Typography>
          <Typography variant="body2" color="textSecondary" className={styles.emptyStateDescription}>
            {search ? strings.workspace.noWorkspacesSearchDescription : strings.workspace.noWorkspacesDescription}
          </Typography>
          {!search && (
            <Button variant="outlined" startIcon={<Plus size={20} />} onClick={handleCreateClick}>
              {strings.workspace.createWorkspace}
            </Button>
          )}
        </Paper>
      ) : (
        <Grid container spacing={2.5}>
          {filteredWorkspaces.map((ws) => (
            <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={ws.metadata.name}>
              <WorkspaceCard workspace={ws} />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
