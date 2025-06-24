/**
 * リソースごとの権限
 *   - resource: 例 'widgets' | 'users' | 'settings'
 *   - actions : 例 'read' | 'write' | 'delete' | 'admin'
 */
export interface Permission {
  resource: string;
  actions: string[];
}
