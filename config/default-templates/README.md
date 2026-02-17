# Default Workspace Templates

Pre-configured templates available to all users in the `default` namespace.

## Templates

| Template | Use Case | CPU | Memory | Storage | Idle Shutdown |
|----------|----------|-----|--------|---------|---------------|
| **Starter** | Quick experiments, learning | 0.25-2 cores | 0.5-4 GB | 1-10 GB | 30 min (15-120) |
| **Data Science** | Data analysis, visualization | 0.5-4 cores | 2-16 GB | 10-100 GB | 60 min (30-480) |
| **ML Training** | Model training, GPU workloads | 1-8 cores | 4-32 GB | 20-200 GB | Off (60-720) |
| **Code Editor** | Software development | 0.5-4 cores | 1-8 GB | 10-50 GB | 60 min (30-480) |

## Installation

```bash
kubectl apply -k config/default-templates/
```

## Parameter Coverage

This table shows which workspace parameters from `config/samples/` are covered by each default template.

### Core Parameters

| Parameter | Sample Source | Starter | Data Science | ML Training | Code Editor |
|-----------|---------------|---------|--------------|-------------|-------------|
| `displayName` | All samples | ✅ | ✅ | ✅ | ✅ |
| `description` | workspacetemplate_production | ✅ | ✅ | ✅ | ✅ |
| `defaultImage` | All samples | ✅ | ✅ | ✅ | ✅ |
| `allowedImages` | workspacetemplate_production | ✅ | ✅ | ✅ | ✅ |
| `allowCustomImages` | - | ❌ | ❌ | ✅ | ✅ |
| `defaultResources` | All samples | ✅ | ✅ | ✅ | ✅ |
| `resourceBounds.cpu` | workspacetemplate_production | ✅ | ✅ | ✅ | ✅ |
| `resourceBounds.memory` | workspacetemplate_production | ✅ | ✅ | ✅ | ✅ |
| `resourceBounds.gpu` | workspacetemplate_production | ❌ | ❌ | ✅ | ❌ |
| `appType` | workspacetemplate_production | ✅ jupyter | ✅ jupyter | ✅ jupyter | ✅ code-editor |

### Storage Parameters

| Parameter | Sample Source | Starter | Data Science | ML Training | Code Editor |
|-----------|---------------|---------|--------------|-------------|-------------|
| `primaryStorage.defaultSize` | workspace_with_storage | ✅ 5Gi | ✅ 20Gi | ✅ 50Gi | ✅ 20Gi |
| `primaryStorage.minSize` | workspacetemplate_production | ✅ 1Gi | ✅ 10Gi | ✅ 20Gi | ✅ 10Gi |
| `primaryStorage.maxSize` | workspacetemplate_production | ✅ 10Gi | ✅ 100Gi | ✅ 200Gi | ✅ 50Gi |
| `primaryStorage.defaultMountPath` | workspace_with_storage | ✅ | ✅ | ✅ | ✅ |
| `allowSecondaryStorages` | workspace_with_additional_volumes | ❌ | ✅ | ✅ | ✅ |

### Container Configuration

| Parameter | Sample Source | Starter | Data Science | ML Training | Code Editor |
|-----------|---------------|---------|--------------|-------------|-------------|
| `defaultContainerConfig.command` | workspace_with_container_config, idle-shutdown templates | ❌ | ✅ | ❌ | ✅ |
| `defaultLifecycle.postStart` | workspace_with_lifecycle | ❌ | ❌ | ✅ | ✅ |
| `defaultLifecycle.preStop` | workspace_with_lifecycle | ❌ | ❌ | ❌ | ❌ |

### Idle Shutdown

| Parameter | Sample Source | Starter | Data Science | ML Training | Code Editor |
|-----------|---------------|---------|--------------|-------------|-------------|
| `defaultIdleShutdown.enabled` | idle-shutdown templates | ✅ true | ✅ true | ✅ false | ✅ true |
| `defaultIdleShutdown.idleTimeoutInMinutes` | idle-shutdown templates | ✅ 30 | ✅ 60 | ✅ 120 | ✅ 60 |
| `defaultIdleShutdown.detection` | idle-shutdown templates | ✅ | ✅ | ✅ | ✅ |
| `idleShutdownOverrides.allow` | idle-shutdown templates | ✅ true | ✅ true | ✅ true | ✅ true |
| `idleShutdownOverrides.minIdleTimeoutInMinutes` | idle-shutdown templates | ✅ 15 | ✅ 30 | ✅ 60 | ✅ 30 |
| `idleShutdownOverrides.maxIdleTimeoutInMinutes` | idle-shutdown templates | ✅ 120 | ✅ 480 | ✅ 720 | ✅ 480 |

### Scheduling & Security

| Parameter | Sample Source | Starter | Data Science | ML Training | Code Editor |
|-----------|---------------|---------|--------------|-------------|-------------|
| `defaultNodeSelector` | workspace_with_node_selector | ❌ | ❌ | ✅ | ❌ |
| `defaultTolerations` | - | ❌ | ❌ | ✅ (GPU) | ❌ |
| `defaultAffinity` | - | ❌ | ❌ | ❌ | ❌ |
| `defaultPodSecurityContext` | - | ❌ | ❌ | ❌ | ❌ |

### Access Control

| Parameter | Sample Source | Starter | Data Science | ML Training | Code Editor |
|-----------|---------------|---------|--------------|-------------|-------------|
| `defaultOwnershipType` | workspace_with_template | ✅ Public | ✅ Public | ✅ OwnerOnly | ✅ OwnerOnly |
| `defaultAccessType` | - | ✅ Public | ✅ Public | ✅ OwnerOnly | ✅ OwnerOnly |
| `defaultAccessStrategy` | - | ❌ | ❌ | ❌ | ❌ |

## Sample File Mapping

| Sample File | Relevant Template(s) | Parameters Demonstrated |
|-------------|---------------------|------------------------|
| `workspace_v1alpha1_workspace.yaml` | All | Basic workspace (image, resources) |
| `workspace_v1alpha1_workspace_stopped.yaml` | All | desiredStatus |
| `workspace_v1alpha1_workspace_with_storage.yaml` | All | storage (size, mountPath, storageClassName) |
| `workspace_v1alpha1_workspace_with_template.yaml` | All | templateRef |
| `workspace_v1alpha1_workspacetemplate_production.yaml` | All | Full template spec |
| `workspace_with_additional_volumes.yaml` | Data Science, ML Training, Code Editor | volumes (secondary PVCs) |
| `workspace_with_container_config.yaml` | Data Science, Code Editor | containerConfig (command, args) |
| `workspace_with_lifecycle.yaml` | ML Training, Code Editor | lifecycle (postStart, preStop) |
| `workspace_with_node_selector.yaml` | ML Training | nodeSelector |
| `workspace_with_serviceaccount.yaml` | - | serviceAccountName (admin-configured) |
| `idle-shutdown/templates/*.yaml` | All | Idle shutdown configuration |

## Parameters NOT in Default Templates

These parameters are intentionally omitted as they require cluster-specific or admin configuration:

| Parameter | Reason |
|-----------|--------|
| `serviceAccountName` | Requires pre-created ServiceAccount with proper RBAC |
| `defaultPodSecurityContext` | Security policies are cluster-specific |
| `defaultAffinity` | Node topology is cluster-specific |
| `defaultAccessStrategy` | Requires WorkspaceAccessStrategy CRD |
| `storageClassName` | Storage classes vary by cluster |

## Customization

To create organization-specific templates:

1. Copy a default template as a starting point
2. Modify parameters as needed
3. Deploy to a dedicated namespace
4. Reference via `templateRef` in workspaces

```yaml
apiVersion: workspace.jupyter.org/v1alpha1
kind: Workspace
metadata:
  name: my-workspace
spec:
  displayName: "My Data Analysis"
  templateRef:
    name: data-science
    namespace: default
  desiredStatus: Running
```
