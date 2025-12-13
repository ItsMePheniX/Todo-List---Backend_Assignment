import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase, API_URL } from '../lib/supabase'

export default function AdminPanel() {
  const { isAdmin, signOut, user } = useAuth()
  const [users, setUsers] = useState([])
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [usersLoading, setUsersLoading] = useState(false)
  const [tasksLoading, setTasksLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('users')
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [page, setPage] = useState(1)
  const pageSize = 10

  // Compute filtered and paginated users at top-level to keep hook order stable
  const pagedUsers = useMemo(() => {
    const normalized = users.filter(u => {
      const matchesSearch = u.email?.toLowerCase().includes(search.toLowerCase())
      const matchesRole = roleFilter === 'all' ? true : u.role === roleFilter
      return matchesSearch && matchesRole
    })
    const start = (page - 1) * pageSize
    return normalized.slice(start, start + pageSize)
  }, [users, search, roleFilter, page])
  const navigate = useNavigate()

  useEffect(() => {
    if (!isAdmin) {
      navigate('/dashboard')
      return
    }
    fetchData()
  }, [isAdmin, navigate])

  const fetchData = async () => {
    setLoading(true)
    await Promise.all([fetchUsers(), fetchAllTasks()])
    setLoading(false)
  }

  const refreshUsers = async () => {
    setUsersLoading(true)
    await fetchUsers()
    setUsersLoading(false)
  }

  const refreshTasks = async () => {
    setTasksLoading(true)
    await fetchAllTasks()
    setTasksLoading(false)
  }

  const fetchUsers = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.access_token) {
        throw new Error('No valid session found')
      }
      
      console.log('Fetching users from:', `${API_URL}/admin/users`)
      
      const response = await fetch(`${API_URL}/admin/users`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      })

      console.log('Response status:', response.status)
      
      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('Admin access required')
        }
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Failed to fetch users: ${response.status}`)
      }
      
      const result = await response.json()
      console.log('Full Users API Response:', JSON.stringify(result, null, 2))
      
      // Backend returns: { success: true, data: { users: [...], aud: "...", ... } }
      let usersArray = []
      
      if (result.success && result.data) {
        console.log('result.data:', result.data)
        console.log('result.data.users:', result.data.users)
        
        if (result.data.users && Array.isArray(result.data.users)) {
          usersArray = result.data.users
        } else if (Array.isArray(result.data)) {
          // Fallback: maybe data is directly an array
          usersArray = result.data
        }
      }
      
      console.log(`Found ${usersArray.length} users:`, usersArray)
      
      // Transform the user data
      const transformedUsers = usersArray.map(user => ({
        id: user.id,
        email: user.email,
        created_at: user.created_at,
        role: user.role || 'user',
        user_metadata: user.user_metadata || {}
      }))
      
      console.log('Transformed users:', transformedUsers)
      setUsers(transformedUsers)
    } catch (error) {
      console.error('Error fetching users:', error)
      if (error.message.includes('Admin access')) {
        alert('You need admin privileges to access this page')
        navigate('/dashboard')
      } else {
        alert(`Failed to fetch users: ${error.message}`)
      }
      setUsers([])
    }
  }

  const fetchAllTasks = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.access_token) {
        throw new Error('No valid session found')
      }
      
      const response = await fetch(`${API_URL}/admin/tasks`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('Admin access required')
        }
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Failed to fetch tasks: ${response.status}`)
      }
      
      const result = await response.json()
      console.log('Tasks API Response:', result)
      
      // Backend returns: { success: true, data: [...tasks] }
      let tasksArray = []
      if (result.success && result.data && Array.isArray(result.data)) {
        tasksArray = result.data
      }
      
      console.log(`Found ${tasksArray.length} tasks`)
      setTasks(tasksArray)
    } catch (error) {
      console.error('Error fetching tasks:', error)
      if (!error.message.includes('Admin access')) {
        alert(`Failed to fetch tasks: ${error.message}`)
      }
      setTasks([])
    }
  }

  const handleUpdateRole = async (userId, newRole) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.access_token) {
        throw new Error('No valid session')
      }
      
      // Check if user is removing their own admin privileges
      const currentUserId = user?.id
      const isRemovingSelfAdmin = userId === currentUserId && newRole === 'user'
      
      console.log('Role change check:', { 
        targetUserId: userId, 
        currentUserId, 
        newRole, 
        isRemovingSelfAdmin 
      })
      
      if (isRemovingSelfAdmin) {
        const confirmed = confirm('⚠️ You are about to remove your own admin privileges. You will be logged out. Continue?')
        console.log('User confirmation:', confirmed)
        if (!confirmed) {
          // Revert the dropdown
          fetchUsers()
          return
        }
      }
      
      const response = await fetch(`${API_URL}/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role: newRole })
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.error || `Failed to update role (${response.status})`)
      }
      
      const result = await response.json()
      console.log('Role update response:', result)
      
      // If user removed their own admin privileges, sign them out and redirect
      if (isRemovingSelfAdmin) {
        alert('✅ Your admin privileges have been removed. You will now be logged out.')
        await signOut()
        navigate('/login')
        return
      }
      
      // Update local state
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u))
      alert(`✅ Role updated to ${newRole} successfully`)
    } catch (error) {
      console.error('Error updating role:', error)
      alert(`❌ Failed to update role: ${error.message}`)
      // Revert the dropdown by re-fetching
      fetchUsers()
    }
  }

  const handleDeleteUser = async (userId) => {
    const userToDelete = users.find(u => u.id === userId)
    if (!confirm(`Are you sure you want to delete user "${userToDelete?.email}"? This action cannot be undone.`)) return

    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.access_token) {
        throw new Error('No valid session')
      }
      
      const response = await fetch(`${API_URL}/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.error || `Failed to delete user (${response.status})`)
      }
      
      console.log('User deleted successfully')
      setUsers(users.filter(u => u.id !== userId))
      alert('✅ User deleted successfully')
    } catch (error) {
      console.error('Error deleting user:', error)
      alert(`❌ Failed to delete user: ${error.message}`)
    }
  }

  const handleDeleteTask = async (taskId) => {
    const taskToDelete = tasks.find(t => t.id === taskId)
    if (!confirm(`Are you sure you want to delete task "${taskToDelete?.title}"? This action cannot be undone.`)) return

    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.access_token) {
        throw new Error('No valid session')
      }
      
      const response = await fetch(`${API_URL}/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.error || `Failed to delete task (${response.status})`)
      }
      
      console.log('Task deleted successfully')
      setTasks(tasks.filter(t => t.id !== taskId))
      alert('✅ Task deleted successfully')
    } catch (error) {
      console.error('Error deleting task:', error)
      alert(`❌ Failed to delete task: ${error.message}`)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <svg className="animate-spin h-16 w-16 text-purple-600 mb-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="text-lg text-gray-600 font-medium">Loading admin panel...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 animate-fade-in">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-md border-b border-gray-200 sticky top-0 z-10 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                ⚙️ Admin Panel
              </h1>
              <p className="text-sm text-gray-600 mt-1">Manage users and monitor your system</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/dashboard')}
                className="inline-flex items-center px-4 py-2 bg-white border-2 border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition-all duration-200 font-medium shadow-md"
              >
                <span className="mr-2">←</span>
                Dashboard
              </button>
              <button
                onClick={handleSignOut}
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 transform hover:scale-105 shadow-md font-medium"
              >
                <span className="mr-2">🚪</span>
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8 animate-slide-up">
          <div className="bg-white rounded-xl p-6 border-l-4 border-purple-500 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-4xl font-bold text-gray-900 mt-2">{users.length}</p>
              </div>
              <div className="text-5xl">👥</div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 border-l-4 border-blue-500 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Tasks</p>
                <p className="text-4xl font-bold text-gray-900 mt-2">{tasks.length}</p>
              </div>
              <div className="text-5xl">📋</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs & Controls */}
      <div className="bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 py-4">
            <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('users')}
              className={`py-4 px-2 border-b-2 font-semibold text-sm transition-all ${
                activeTab === 'users'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="inline-flex items-center gap-2">
                👥 Users
                <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-purple-100 bg-purple-600 rounded-full">
                  {users.length}
                </span>
              </span>
            </button>
            <button
              onClick={() => setActiveTab('tasks')}
              className={`py-4 px-2 border-b-2 font-semibold text-sm transition-all ${
                activeTab === 'tasks'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="inline-flex items-center gap-2">
                📋 All Tasks
                <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-purple-100 bg-purple-600 rounded-full">
                  {tasks.length}
                </span>
              </span>
            </button>
            </div>
            {activeTab === 'users' && (
              <div className="flex gap-3">
                <input
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                  placeholder="Search email..."
                />
                <select
                  value={roleFilter}
                  onChange={(e) => { setRoleFilter(e.target.value); setPage(1) }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                >
                  <option value="all">All roles</option>
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'users' && (
          <div className="animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
              <button
                onClick={fetchData}
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-md font-medium"
              >
                <span className="mr-2">🔄</span>
                Refresh
              </button>
            </div>
            <div className="bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-100">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-purple-50 to-pink-50 shadow-sm">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        👤 Email
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        🎭 Role
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        📅 Created At
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        ⚡ Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {pagedUsers.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="px-6 py-12 text-center">
                          <div className="text-gray-400">
                            <div className="text-5xl mb-3">👥</div>
                            <p className="text-lg font-medium">No users found</p>
                            <p className="text-sm mt-2">Try adjusting your filters or refresh the page</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      pagedUsers.map((user, index) => (
                      <tr key={user.id} className="hover:bg-purple-50 transition-colors" style={{ animationDelay: `${index * 0.05}s` }}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                              {user.email ? user.email[0].toUpperCase() : '?'}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{user.email || 'No email'}</div>
                              <div className="text-xs text-gray-500">{user.id.slice(0, 8)}...</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={user.role}
                            onChange={(e) => handleUpdateRole(user.id, e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:shadow-lg transition-all bg-white hover:border-gray-400 shadow-sm"
                          >
                            <option value="user">👤 User</option>
                            <option value="admin">👑 Admin</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {new Date(user.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all font-medium shadow-md transform hover:scale-105"
                          >
                            🗑️ Delete
                          </button>
                        </td>
                      </tr>
                    )))}
                  </tbody>
                </table>
              </div>
              {/* Pagination */}
              <div className="flex items-center justify-between p-4 bg-gray-50 border-t border-gray-200">
                <div className="text-sm text-gray-600">Page {page}</div>
                <div className="flex gap-2">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm disabled:opacity-50 bg-white hover:bg-gray-50 hover:shadow-md transition-all shadow-sm"
                  >
                    Prev
                  </button>
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white hover:bg-gray-50 hover:shadow-md transition-all shadow-sm"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">All Tasks Overview</h2>
              <button
                onClick={refreshTasks}
                disabled={tasksLoading}
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-md font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="mr-2">{tasksLoading ? '⏳' : '🔄'}</span>
                {tasksLoading ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
            
            {tasks.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-xl shadow-xl">
                <div className="text-6xl mb-4">📋</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No tasks in the system</h3>
                <p className="text-gray-500">Tasks created by users will appear here</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {tasks.map((task, index) => (
                  <div 
                    key={task.id} 
                    className="bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-3 mb-2">
                          <span className="text-2xl mt-1">
                            {task.status === 'completed' ? '✅' : task.status === 'in-progress' ? '🚀' : '⏳'}
                          </span>
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{task.title}</h3>
                            <p className="text-gray-600 leading-relaxed">{task.description}</p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-4">
                          <span className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-md">
                            👤 {task.user_id.slice(0, 8)}...
                          </span>
                          <span
                            className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${
                              task.status === 'completed'
                                ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                                : task.status === 'in-progress'
                                ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                                : 'bg-gradient-to-r from-gray-400 to-gray-500 text-white'
                            } shadow-md`}
                          >
                            {task.status.replace('-', ' ').toUpperCase()}
                          </span>
                          <span
                            className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${
                              task.priority === 'high'
                                ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white'
                                : task.priority === 'medium'
                                ? 'bg-gradient-to-r from-orange-500 to-yellow-500 text-white'
                                : 'bg-gradient-to-r from-blue-400 to-indigo-400 text-white'
                            } shadow-md`}
                          >
                            {task.priority === 'high' ? '🔥' : task.priority === 'medium' ? '⚡' : '💎'} {task.priority.toUpperCase()}
                          </span>
                          <span className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
                            🕐 {new Date(task.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all font-medium text-sm shadow-md transform hover:scale-105 self-start lg:self-auto"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
