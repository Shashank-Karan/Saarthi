import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { queryClient, apiRequest, getToken } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Users, Search, Settings, Shield, UserCheck, UserX, Wifi, WifiOff, RefreshCw, Clock } from "lucide-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

export default function AdminUsersPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [filterAdmin, setFilterAdmin] = useState<boolean | undefined>(undefined);
  const [filterActive, setFilterActive] = useState<boolean | undefined>(undefined);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isLiveUpdating, setIsLiveUpdating] = useState(true);

  // Redirect if not admin
  useEffect(() => {
    if (user && !user.is_admin) {
      setLocation("/");
    }
  }, [user, setLocation]);

  const { data: users, isLoading, dataUpdatedAt } = useQuery({
    queryKey: ["/api/admin/users", { search, is_admin: filterAdmin, is_active: filterActive }],
    enabled: !!user?.is_admin && isLiveUpdating,
    refetchInterval: isLiveUpdating ? 3000 : false, // Poll every 3 seconds when live updating is enabled
    refetchIntervalInBackground: true, // Continue polling even when window is not focused
    staleTime: 1000, // Consider data stale after 1 second
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (filterAdmin !== undefined) params.append('is_admin', filterAdmin.toString());
      if (filterActive !== undefined) params.append('is_active', filterActive.toString());
      const url = `/api/admin/users${params.toString() ? '?' + params.toString() : ''}`;
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${getToken()}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch users');
      return response.json();
    },
  });

  // Update last updated time when data changes
  useEffect(() => {
    if (dataUpdatedAt) {
      setLastUpdated(new Date(dataUpdatedAt));
    }
  }, [dataUpdatedAt]);

  const updateUserMutation = useMutation({
    mutationFn: async (userData: { userId: string; updates: any }) => {
      return await apiRequest("PATCH", `/api/admin/users/${userData.userId}`, userData.updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "User updated",
        description: "User information has been updated successfully.",
      });
      setSelectedUser(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update user.",
        variant: "destructive",
      });
    },
  });

  if (!user?.is_admin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50 flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="text-center text-red-600">Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground">
              You don't have permission to access user management.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-lg text-muted-foreground">Loading users...</p>
          </div>
        </div>
      </div>
    );
  }

  const handleUpdateUser = (userId: string, updates: any) => {
    updateUserMutation.mutate({ userId, updates });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
            </div>
            <div className="flex items-center gap-4">
              {/* Live Update Status */}
              <div className="flex items-center gap-2 text-sm">
                {isLiveUpdating ? (
                  <Wifi className="h-4 w-4 text-green-500" />
                ) : (
                  <WifiOff className="h-4 w-4 text-gray-400" />
                )}
                <span className={isLiveUpdating ? "text-green-600" : "text-gray-500"}>
                  {isLiveUpdating ? "Live" : "Paused"}
                </span>
              </div>
              
              {/* Last Updated */}
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Clock className="h-4 w-4" />
                <span>Updated {lastUpdated.toLocaleTimeString()}</span>
              </div>
              
              {/* Live Update Toggle */}
              <Button
                variant={isLiveUpdating ? "destructive" : "default"}
                size="sm"
                onClick={() => setIsLiveUpdating(!isLiveUpdating)}
                data-testid="button-toggle-live-updates"
              >
                {isLiveUpdating ? (
                  <>
                    <WifiOff className="h-4 w-4 mr-2" />
                    Pause Live Updates
                  </>
                ) : (
                  <>
                    <Wifi className="h-4 w-4 mr-2" />
                    Enable Live Updates
                  </>
                )}
              </Button>
            </div>
          </div>
          <p className="text-gray-600">Manage user accounts and permissions • Real-time updates {isLiveUpdating ? 'enabled' : 'disabled'}</p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 items-end">
              <div className="flex-1 min-w-64">
                <Label htmlFor="search">Search Users</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Search by username or name..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                    data-testid="input-search-users"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="filter-admin"
                  checked={filterAdmin === true}
                  onCheckedChange={(checked) => setFilterAdmin(checked ? true : undefined)}
                />
                <Label htmlFor="filter-admin">Admins only</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="filter-active"
                  checked={filterActive === true}
                  onCheckedChange={(checked) => setFilterActive(checked ? true : undefined)}
                />
                <Label htmlFor="filter-active">Active only</Label>
              </div>

              <Button
                variant="outline"
                onClick={() => {
                  setSearch("");
                  setFilterAdmin(undefined);
                  setFilterActive(undefined);
                }}
                data-testid="button-clear-filters"
              >
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  Users ({Array.isArray(users) ? users.length : 0})
                  {isLiveUpdating && (
                    <RefreshCw className="h-4 w-4 animate-spin text-green-500" />
                  )}
                </CardTitle>
                <CardDescription>All registered users in the system • Live updates {isLiveUpdating ? 'active' : 'paused'}</CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // Force manual refresh
                  queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
                  setLastUpdated(new Date());
                }}
                data-testid="button-manual-refresh"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Now
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Activity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.isArray(users) && users.map((user: any) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-muted-foreground">@{user.username}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{user.posts_count} posts • {user.comments_count} comments</div>
                        <div className="text-muted-foreground">
                          {user.chat_messages_count} chats • {user.journal_entries_count} journal entries
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2 flex-wrap">
                        {user.is_admin && <Badge variant="destructive">Admin</Badge>}
                        <Badge variant={user.is_active ? "default" : "secondary"}>
                          {user.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {new Date(user.created_at).toLocaleDateString()}
                        {user.last_login && (
                          <div className="text-muted-foreground">
                            Last: {new Date(user.last_login).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedUser(user)}
                            data-testid={`button-edit-user-${user.id}`}
                          >
                            <Settings className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Edit User: {user.name}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-6">
                            <div>
                              <Label htmlFor="name">Full Name</Label>
                              <Input
                                id="name"
                                defaultValue={user.name}
                                onChange={(e) => 
                                  setSelectedUser({ ...user, name: e.target.value })
                                }
                                data-testid="input-user-name"
                              />
                            </div>

                            <div className="flex items-center space-x-2">
                              <Switch
                                id="is-admin"
                                checked={selectedUser?.is_admin || false}
                                onCheckedChange={(checked) =>
                                  setSelectedUser({ ...selectedUser, is_admin: checked })
                                }
                                data-testid="switch-user-admin"
                              />
                              <Label htmlFor="is-admin">Administrator</Label>
                            </div>

                            <div className="flex items-center space-x-2">
                              <Switch
                                id="is-active"
                                checked={selectedUser?.is_active !== false}
                                onCheckedChange={(checked) =>
                                  setSelectedUser({ ...selectedUser, is_active: checked })
                                }
                                data-testid="switch-user-active"
                              />
                              <Label htmlFor="is-active">Active Account</Label>
                            </div>

                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                onClick={() => setSelectedUser(null)}
                                data-testid="button-cancel-edit"
                              >
                                Cancel
                              </Button>
                              <Button
                                onClick={() =>
                                  handleUpdateUser(user.id, {
                                    name: selectedUser?.name,
                                    is_admin: selectedUser?.is_admin,
                                    is_active: selectedUser?.is_active,
                                  })
                                }
                                disabled={updateUserMutation.isPending}
                                data-testid="button-save-user"
                              >
                                {updateUserMutation.isPending ? "Saving..." : "Save Changes"}
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {(!users || !Array.isArray(users) || users.length === 0) && (
              <div className="text-center py-8 text-muted-foreground">
                No users found matching the current filters.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}